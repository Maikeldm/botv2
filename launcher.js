// launcher.js (Nivel 5: Lanzador Dinámico - Limpieza Amable)
const cluster = require('cluster');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url'); // <--- ¡Asegúrate que esta línea esté!
const TelegramBot = require('node-telegram-bot-api');
const usersDB = require('./lib/users.js');
const chocoplusHandler = require('./chocoplus.js');
const dotenv = require('dotenv');
dotenv.config();

const sessionWorkers = new Map();

if (cluster.isPrimary) {
    console.log(`[🚀 MAESTRO] Proceso Primario ${process.pid} activado.`);
    console.log(`[🔥] Modo: Aislamiento Total por Proceso (1 Sesión = 1 Proceso).`);

    console.log(`[🤖 MAESTRO] Iniciando Jefe de Telegram...`);
    const TOKEN = process.env.BOT_TOKEN || '8470263467:AAEwJKUW_fYF1neu-Kwgspgdwn6xMeNHTec';
    const bot = new TelegramBot(TOKEN, { polling: true });
    const userStates = {};

    chocoplusHandler(bot, {
        userStates,
        activeSessions: {},

        // =================================================================
        //            ¡FUNCIÓN DE LIMPIEZA CORREGIDA!
        // =================================================================
        cleanSession: async (telegram_id, notifyUser = false, fullClean = false) => { // Marcada como async para el fallback
            console.log(`[🧹 MAESTRO] Recibida orden de limpieza para ${telegram_id} (Full: ${fullClean})`);
            const worker = sessionWorkers.get(telegram_id);

            if (worker) {
                console.log(`[MAESTRO] Enviando orden de limpieza (Full: ${fullClean}) al Hijo ${worker.process.pid}...`);

                // 1. Enviamos la orden al Hijo para que se limpie él mismo
                worker.send({ type: 'CLEAN_SESSION', telegram_id, notifyUser, fullClean });

                // 2. Le damos 3 segundos al Hijo para terminar y salir limpiamente
                const cleanupTimeout = setTimeout(() => {
                    // Si después de 3 seg el Hijo sigue vivo...
                    if (sessionWorkers.has(telegram_id)) {
                        console.warn(`[KILL] El Hijo ${worker.process.pid} no terminó. Matando a la fuerza...`);
                        worker.kill(); // Lo matamos
                    }
                }, 3000); // 3 segundos de gracia

                // 3. Escuchamos si el Hijo termina antes del timeout
                worker.once('exit', (code, signal) => {
                    console.log(`[MAESTRO] Hijo ${worker.process.pid} (Sesión ${telegram_id}) ha terminado (Code: ${code}, Signal: ${signal}).`);
                    clearTimeout(cleanupTimeout); // Cancelamos el "kill" forzado
                    sessionWorkers.delete(telegram_id); // Lo quitamos del mapa
                });

            } else {
                // --- Fallback si el Hijo ya no existía ---
                console.warn(`[MAESTRO] Se pidió limpiar ${telegram_id} pero no se encontró ningún Hijo activo.`);
                if (fullClean) {
                    // Intentamos limpiar la DB
                    try {
                        await usersDB.clearUserWhatsapp(telegram_id); //
                        console.log(`[MAESTRO] Fallback: Limpiado ${telegram_id} de la DB.`);
                    } catch (err) {
                        console.error(`[MAESTRO] Fallback DB clean failed for ${telegram_id}:`, err);
                    }

                    // Intentamos limpiar la carpeta desde el Maestro (último recurso)
                    try {
                        const user = await usersDB.getUser(telegram_id); //
                        if (user && user.whatsapp_number) {
                            const sessionPath = path.join(__dirname, 'lib', 'pairing', String(telegram_id), user.whatsapp_number);
                            if (fs.existsSync(sessionPath)) {
                                console.log(`[MAESTRO] Fallback: Intentando eliminar carpeta ${sessionPath}`);
                                fs.rmSync(sessionPath, { recursive: true, force: true });
                                console.log(`[MAESTRO] Fallback: Carpeta de sesión para ${telegram_id} eliminada.`);
                            } else {
                                console.log(`[MAESTRO] Fallback: Carpeta ${sessionPath} no encontrada.`);
                            }
                        } else {
                            console.log(`[MAESTRO] Fallback: No se encontró número de WhatsApp para ${telegram_id} para eliminar carpeta.`);
                        }
                    } catch (e) {
                        console.error(`[MAESTRO] Fallback folder removal failed for ${telegram_id}:`, e);
                    }
                }
            }
        }, // Fin cleanSession
        // =================================================================

        startSession: (telegram_id, whatsapp_number) => {
            console.log(`[▶️ MAESTRO] Recibida orden de inicio para ${telegram_id}/${whatsapp_number}`);
            if (sessionWorkers.has(telegram_id)) {
                console.warn(`[MAESTRO] ${telegram_id} ya tiene un Hijo. Matando al antiguo...`);
                sessionWorkers.get(telegram_id).kill(); // Matamos al viejo antes de crear uno nuevo
                // El 'exit' handler lo borrará del map
            }
            launchWorkerForSession({ telegram_id, whatsapp_number });
        },

        updateUserWhatsapp: usersDB.updateUserWhatsapp,
        clearUserWhatsapp: usersDB.clearUserWhatsapp // Esta es la que usa el fallback
    });

    // --- Manejo de Workers Muertos (Simplificado) ---
    cluster.on('exit', (worker, code, signal) => {
        // Buscamos a quién pertenecía para quitarlo del mapa si aún existe
        let telegram_id = null;
        for (const [id, w] of sessionWorkers.entries()) {
            if (w.process.pid === worker.process.pid) {
                telegram_id = id;
                break;
            }
        }
        if (telegram_id) {
            console.log(`[MAESTRO] Hijo ${worker.process.pid} (Sesión ${telegram_id}) salió. Limpiando del mapa.`);
            sessionWorkers.delete(telegram_id);
        } else {
             console.error(`[❌ MAESTRO] Hijo ${worker.process.pid} murió inesperadamente (Señal: ${signal}, Código: ${code}). No estaba en el mapa.`);
        }
    });

    /**
     * Lanza un nuevo proceso Hijo para UNA SOLA sesión. (CORREGIDO)
     */
    function launchWorkerForSession(session) {
        console.log(`[LAUNCH] Creando nuevo Hijo para ${session.telegram_id}...`);
        const worker = cluster.fork();
        sessionWorkers.set(session.telegram_id, worker); // Guardamos la relación ANTES de enviar

        // Enviamos la orden inmediatamente. Cluster la encola si es necesario.
        console.log(`[MAESTRO] Enviando tarea ${session.telegram_id} al nuevo Hijo ${worker.process.pid}`);
        worker.send({ type: 'START_SESSION', ...session });
    }


    // --- Cargar sesiones existentes al inicio (Sin cambios) ---
    (async () => {
        console.log("[MAESTRO] Cargando sesiones existentes desde la DB...");
        try {
            const allUsers = await usersDB.getAllUsersWithWhatsapp();
            if (allUsers.length > 0) {
                console.log(`[MAESTRO] ${allUsers.length} sesiones encontradas. Lanzando ${allUsers.length} Hijos...`);
                for (const user of allUsers) {
                    launchWorkerForSession(user);
                    await new Promise(r => setTimeout(r, 500));
                }
                console.log("[MAESTRO] ¡Todas las sesiones existentes han sido asignadas a sus Hijos!");
            } else {
                console.log("[MAESTRO] No se encontraron sesiones existentes para reconectar.");
            }
        } catch (e) {
            console.error("[MAESTRO] Error catastrófico cargando sesiones existentes:", e);
        }
    })();

} else {
    // =================================================================
    // CÓDIGO DEL WORKER (HIJO) - Sin cambios
    // =================================================================
    console.log(`[⚙️ HIJO] Bot iniciado en proceso hijo (PID: ${process.pid}). ¡Listo para recibir sesión!`);
    const originalReadFileSync = fs.readFileSync;
    const fileCache = new Map();
    const filesToCache = [
        './travas/ios4.js', './travas/ios7.js', './travas/ios6.js',
        './travas/travadoc.js', './travas/crash.zip', './src/opa.webp',
        './src/foto.jpg', './src/thumb.jpg', './media/thumb.jpg', './media/ola.jpg'
    ];

    console.log(`[🧠 HIJO ${process.pid}] Precargando ${filesToCache.length} assets en RAM...`);
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
    console.log(`[👍 HIJO ${process.pid}] Optimización de RAM aplicada.`);
    require('./main.js');
}