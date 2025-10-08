const cluster = require('cluster');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');

const numWorkers = os.cpus().length;

if (cluster.isPrimary) {
    console.log(`[🚀 MODO DIOS] Proceso Primario ${process.pid} activado.`);
    console.log(`[🔥] Desplegando ${numWorkers} clones del bot para máxima potencia.`);

    const workers = [];
    for (let i = 0; i < numWorkers; i++) {
        const worker = cluster.fork();
        workers.push(worker);
    }

    // --- LÓGICA DE RESTAURACIÓN CENTRALIZADA ---
    setTimeout(() => {
        console.log('\n[👑] MODO DIOS: Iniciando escaneo y distribución de sesiones...');
        try {
            // NOTA: La lógica de restauración ahora depende de 'users.json' en lugar de la base de datos.
            // Asegúrate de que tu sistema de guardado de usuarios (users.js) genere este archivo.
            // Si 'users.js' solo usa SQLite, necesitarás un mecanismo para exportar a JSON.
            const dbPath = path.join(__dirname, 'lib', 'database.db');
            const usersDB = require('./lib/users.js'); // Usamos el manejador de DB

            usersDB.db.all('SELECT * FROM users WHERE whatsapp_number IS NOT NULL AND whatsapp_number != ""', [], (err, activeSessions) => {
                if (err) {
                    console.error('[❌] MODO DIOS: Error al leer usuarios de la base de datos:', err);
                    return;
                }

                if (activeSessions && activeSessions.length > 0) {
                    console.log(`[🔍] Se encontraron ${activeSessions.length} sesiones activas para restaurar.`);
                    activeSessions.forEach((session, index) => {
                        const workerIndex = index % workers.length;
                        const targetWorker = workers[workerIndex];
                        
                        const sessionData = {
                            type: 'START_SESSION',
                            telegram_id: Number(session.telegram_id),
                            whatsapp_number: session.whatsapp_number
                        };

                        console.log(`[✈️] Enviando sesión ${sessionData.whatsapp_number} al Clon #${workerIndex + 1} (PID: ${targetWorker.process.pid})`);
                        targetWorker.send(sessionData);
                    });
                } else {
                    console.log('[✅] No se encontraron sesiones para restaurar.');
                }
            });
        } catch (err) {
            console.error('[❌] MODO DIOS: Error crítico durante la restauración de sesiones:', err);
        }
    }, 5000); // Retraso para asegurar que los workers estén listos

    cluster.on('exit', (worker, code, signal) => {
        console.error(`[☠️] CLON ${worker.process.pid} HA MUERTO. ¡RESUCITANDO INSTANTÁNEAMENTE!`);
        const newWorker = cluster.fork();
        const deadWorkerIndex = workers.findIndex(w => w.process.pid === worker.process.pid);
        if (deadWorkerIndex !== -1) {
            workers[deadWorkerIndex] = newWorker;
        } else {
            workers.push(newWorker);
        }
    });

} else {
    // --- CÓDIGO EJECUTADO POR CADA CLON DEL BOT ---

    console.log(`[⚡] Clon de Bot ${process.pid} iniciado y listo para la batalla.`);

    // --- PARCHE DE EMERGENCIA: ANULACIÓN DE I/O BLOQUEANTE ---
    const originalReadFileSync = fs.readFileSync;
    const fileCache = new Map();

    const filesToCache = [
        './travas/ios4.js',
        './travas/ios7.js',
        './travas/ios6.js',
        './travas/travadoc.js',
        './travas/crash.zip',
        './src/opa.webp',
        './src/foto.jpg',
        './src/thumb.jpg',
        './media/thumb.jpg',
        './media/ola.jpg'
        // ...añade CUALQUIER otro archivo que leas con fs.readFileSync
    ];

    console.log(`[🧠] Clon ${process.pid}: Precargando ${filesToCache.length} assets en RAM para velocidad luz...`);
    for (const filePath of filesToCache) {
        try {
            const absolutePath = path.resolve(__dirname, filePath);
            const fileContent = originalReadFileSync(absolutePath);
            fileCache.set(absolutePath, fileContent);
        } catch (error) {
            // No hacemos nada si el archivo no existe, para evitar crashes
        }
    }

    // Sobrescribimos fs.readFileSync con nuestra versión "cacheada"
    fs.readFileSync = (filePath, options) => {
        // --- INICIO DE LA CORRECCIÓN ---
        // Convertimos el argumento a string, ya sea un texto o un objeto URL
        let pathAsString = filePath;
        if (filePath instanceof URL) {
            pathAsString = fileURLToPath(filePath);
        }
        // --- FIN DE LA CORRECCIÓN ---

        const absolutePath = path.resolve(pathAsString); // Usamos la variable corregida
        if (fileCache.has(absolutePath)) {
            return fileCache.get(absolutePath);
        } else {
            return originalReadFileSync(filePath, options);
        }
    };
    console.log(`[✅] Clon ${process.pid}: Parche de RAM aplicado y actualizado.`);

    // --- ARRANQUE DEL BOT PRINCIPAL ---
    require('./main.js');
}