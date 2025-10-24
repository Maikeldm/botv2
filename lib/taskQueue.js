// lib/taskQueue.js (Req 4)
const { Worker } = require('worker_threads');
const path = require('path');

class TaskQueue {
    constructor(conn, logger) {
        this.conn = conn; // Referencia para enviar mensajes
        this.logger = logger;
        this.m = null; // Contexto del mensaje (se actualiza)
        
        this.MAX_WORKERS = 5; // Req 4: Máximo 2 hilos pesados por sesión
        this.workers = [];
        this.taskQueue = [];
        this.activeWorkers = 0;

        this.logger.info(`Iniciando pool de ${this.MAX_WORKERS} hilos...`);
        for (let i = 0; i < this.MAX_WORKERS; i++) {
            this.workers.push(this.createWorker(i));
        }
    }

    // Actualiza el contexto 'm' para que los 'quoted' sean correctos
    updateContext(m) {
        this.m = m;
    }

    createWorker(id) {
        const worker = new Worker(path.resolve(__dirname, 'heavyTaskWorker.js'));

        worker.on('message', (message) => {
            // El hilo nos pide enviar un mensaje
            if (message.type === 'send_message') {
                const { jid, content, options } = message.payload;
                this.conn.sendMessage(jid, content, options)
                    .catch(e => this.logger.error(e, 'Error enviando mensaje desde el hilo'));
            }
            // El hilo nos pide enviar un relay (para mensajes complejos)
            else if (message.type === 'relay_message') {
                const { jid, messageProto, options } = message.payload;
                this.conn.relayMessage(jid, messageProto, options)
                    .catch(e => this.logger.error(e, 'Error haciendo relay desde el hilo'));
            }
            // El hilo terminó su tarea
            else if (message.type === 'task_complete' || message.type === 'task_error') {
                if (message.type === 'task_error') {
                    this.logger.error(message.error, 'Error en Hilo de Trabajo Pesado');
                    // Informar al usuario
                    if (this.m) {
                        this.conn.sendMessage(this.m.chat, { text: `❌ Error en comando pesado: ${message.error}` }, { quoted: this.m });
                    }
                } else {
                    this.logger.info({ cmd: message.command }, 'Tarea pesada completada.');
                }
                
                this.activeWorkers--;
                this.processQueue(); // Buscar siguiente tarea
            }
        });

        worker.on('error', (err) => {
            this.logger.error(err, `Error crítico en Hilo ${id}.`);
            this.activeWorkers--;
            // Reemplazar hilo roto
            this.workers = this.workers.filter(w => w !== worker);
            this.workers.push(this.createWorker(`re-${id}`));
            this.processQueue();
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                this.logger.warn(`Hilo ${id} salió con código ${code}.`);
            }
            // Reemplazar hilo
            this.workers = this.workers.filter(w => w !== worker);
            if (this.workers.length < this.MAX_WORKERS) {
                 this.workers.push(this.createWorker(`re-exit-${id}`));
            }
            if (this.activeWorkers > 0) this.activeWorkers--;
            this.processQueue();
        });

        return worker;
    }

    enqueue(taskContext) {
        this.taskQueue.push(taskContext);
        this.processQueue();
    }

    processQueue() {
        if (this.taskQueue.length === 0 || this.activeWorkers >= this.MAX_WORKERS) {
            return; // No hay tareas o no hay hilos libres
        }

        const task = this.taskQueue.shift();
        const worker = this.workers[this.activeWorkers]; // Asignación simple

        if (worker) {
            this.activeWorkers++;
            this.logger.info({ cmd: task.command, queueSize: this.taskQueue.length }, 'Enviando tarea a hilo...');
            // Pasamos el contexto del mensaje (para quoted)
            task.m = this.m; 
            worker.postMessage(task);
        } else {
            // Debería ser imposible, pero por si acaso
            this.taskQueue.unshift(task);
        }
    }

    destroy() {
        this.logger.info('Destruyendo pool de hilos...');
        for (const worker of this.workers) {
            worker.terminate();
        }
        this.workers = [];
        this.taskQueue = [];
    }
}

module.exports = TaskQueue;