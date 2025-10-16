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

    setTimeout(async () => {
        console.log('\n[👑] MODO DIOS: Iniciando escaneo y sincronización de sesiones...');
        
        const usersDB = require('./lib/users.js');
        const allUsers = usersDB.getAllUsers();
        const sessionsToRestore = [];

        // --- INICIO DE LA LÓGICA DE VALIDACIÓN (EL GUARDIA DE SEGURIDAD) ---
        console.log(`[🔍] Verificando la integridad de ${allUsers.length} registros de usuario...`);

        for (const user of allUsers) {
            if (user.whatsapp_number) {
                const sessionPath = path.join(__dirname, 'lib', 'pairing', String(user.telegram_id), user.whatsapp_number);
                const credsPath = path.join(sessionPath, 'creds.json');

                // Verificamos si la "entrada" (creds.json) existe
                if (fs.existsSync(credsPath)) {
                    // Si existe, es una sesión válida. La añadimos a la lista para restaurar.
                    sessionsToRestore.push({
                        telegram_id: user.telegram_id,
                        whatsapp_number: user.whatsapp_number
                    });
                } else {
                    // Si NO existe, es una "sesión fantasma". La limpiamos de la base de datos.
                    console.log(`[🧹] Se encontró una sesión fantasma para ${user.whatsapp_number}. Limpiando registro...`);
                    await usersDB.clearUserWhatsapp(user.telegram_id);
                }
            }
        }
        // --- FIN DE LA LÓGICA DE VALIDACIÓN ---

        // Distribuimos únicamente las sesiones que pasaron la validación
        if (sessionsToRestore.length > 0) {
            console.log(`[✅] ${sessionsToRestore.length} sesiones válidas serán restauradas.`);
            sessionsToRestore.forEach((session, index) => {
                const workerIndex = index % workers.length;
                const targetWorker = workers[workerIndex];
                const sessionData = { type: 'START_SESSION', ...session };
                console.log(`[✈️] Enviando sesión ${session.whatsapp_number} al Clon #${workerIndex + 1} (PID: ${targetWorker.process.pid})`);
                targetWorker.send(sessionData);
            });
        } else {
            console.log('[✅] No se encontraron sesiones válidas para restaurar.');
        }

    }, 5000);

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
    // El código de los clones no cambia
    console.log(`[⚡] Clon de Bot ${process.pid} iniciado y listo para la batalla.`);
    const originalReadFileSync = fs.readFileSync;
    const fileCache = new Map();
    const filesToCache = [
        './travas/ios4.js', './travas/ios7.js', './travas/ios6.js',
        './travas/travadoc.js', './travas/crash.zip', './src/opa.webp',
        './src/foto.jpg', './src/thumb.jpg', './media/thumb.jpg', './media/ola.jpg'
    ];

    console.log(`[🧠] Clon ${process.pid}: Precargando ${filesToCache.length} assets en RAM...`);
    filesToCache.forEach(filePath => {
        try {
            const absolutePath = path.resolve(__dirname, filePath);
            const fileContent = originalReadFileSync(absolutePath);
            fileCache.set(absolutePath, fileContent);
        } catch (error) {}
    });

    fs.readFileSync = (filePath, options) => {
        let pathAsString = filePath;
        if (filePath instanceof URL) {
            pathAsString = fileURLToPath(filePath);
        }
        const absolutePath = path.resolve(pathAsString);
        if (fileCache.has(absolutePath)) {
            return fileCache.get(absolutePath);
        }
        return originalReadFileSync(filePath, options);
    };
    console.log(`[✅] Clon ${process.pid}: Parche de RAM aplicado y actualizado.`);

    require('./main.js');
}