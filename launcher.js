// launcher.js (Nivel 6: Monitor y Métrica)
const cluster = require('cluster');
const os = require('os');
const fs = require('fs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const usersDB = require('./lib/users.js');
const chocoplusHandler = require('./chocoplus.js');
const dotenv = require('dotenv');
const pino = require('pino');
const pidusage = require('pidusage');

dotenv.config();

// --- Configuración de Logging (Req 7) ---
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
const masterLogger = pino({
    level: 'info',
}, pino.destination(path.join(logDir, 'master.log')));

const sessionWorkers = new Map(); // Sigue igual

if (cluster.isPrimary) {
    masterLogger.info(`[🚀 MAESTRO] Proceso Primario ${process.pid} activado.`);
    masterLogger.info(`[🔥] Modo: Aislamiento Total (1 Sesión = 1 Proceso).`);

    // --- Manejadores Globales de Errores (Req 6) ---
    process.on('uncaughtException', (err, origin) => {
        masterLogger.fatal(err, `UNCAUGHT EXCEPTION EN MAESTRO. Origin: ${origin}`);
    });
    process.on('unhandledRejection', (reason, promise) => {
        masterLogger.error({ reason, promise }, 'UNHANDLED REJECTION EN MAESTRO');
    });
    process.setMaxListeners(0); // Req 6

    masterLogger.info(`[🤖 MAESTRO] Iniciando Jefe de Telegram...`);
    const TOKEN = process.env.BOT_TOKEN || '8470263467:AAEwJKUW_fYF1neu-Kwgspgdwn6xMeNHTec';
    const bot = new TelegramBot(TOKEN, { polling: true });
    const userStates = {};

    chocoplusHandler(bot, {
        userStates,
        activeSessions: {},

        // --- Lógica de Limpieza (Sin cambios, ya era robusta) ---
        cleanSession: async (telegram_id, notifyUser = false, fullClean = false) => {
            masterLogger.info(`[🧹 MAESTRO] Orden de limpieza para ${telegram_id} (Full: ${fullClean})`);
            const worker = sessionWorkers.get(telegram_id);

            if (worker) {
                masterLogger.info(`Enviando orden de limpieza (Full: ${fullClean}) al Hijo ${worker.process.pid}...`);
                worker.send({ type: 'CLEAN_SESSION', telegram_id, notifyUser, fullClean });

                const cleanupTimeout = setTimeout(() => {
                    if (sessionWorkers.has(telegram_id)) {
                        masterLogger.warn(`[KILL] El Hijo ${worker.process.pid} no terminó. Matando a la fuerza...`);
                        worker.kill();
                    }
                }, 3000);

                worker.once('exit', (code, signal) => {
                    masterLogger.info(`Hijo ${worker.process.pid} (Sesión ${telegram_id}) ha terminado (Code: ${code}, Signal: ${signal}).`);
                    clearTimeout(cleanupTimeout);
                    sessionWorkers.delete(telegram_id);
                });

            } else {
                // ... (Tu lógica de fallback es buena, la mantenemos) ...
                masterLogger.warn(`[MAESTRO] Se pidió limpiar ${telegram_id} pero no se encontró Hijo.`);
                if (fullClean) {
                    try {
                        await usersDB.clearUserWhatsapp(telegram_id);
                        masterLogger.info(`[MAESTRO] Fallback: Limpiado ${telegram_id} de la DB.`);
                        // ... (Tu lógica de borrado de carpeta es buena) ...
                    } catch (err) {
                        masterLogger.error(err, `[MAESTRO] Fallback DB clean failed for ${telegram_id}`);
                    }
                }
            }
        }, // Fin cleanSession

        // --- Lógica de Inicio (Sin cambios) ---
        startSession: (telegram_id, whatsapp_number) => {
            masterLogger.info(`[▶️ MAESTRO] Orden de inicio para ${telegram_id}/${whatsapp_number}`);
            if (sessionWorkers.has(telegram_id)) {
                masterLogger.warn(`[MAESTRO] ${telegram_id} ya tiene un Hijo. Matando al antiguo...`);
                sessionWorkers.get(telegram_id).kill();
            }
            launchWorkerForSession({ telegram_id, whatsapp_number });
        },

        // =======================================================
        //           ¡¡NUEVA FUNCIÓN DE INVALIDACIÓN!!
        // =======================================================
        /**
         * Notifica al hijo que debe borrar el prefijo de un usuario de su caché.
         * Llámala desde chocoplus.js cuando un usuario cambie su prefijo.
         * @param {string} telegram_id 
         */
        invalidatePrefixCache: (telegram_id) => {
            const worker = sessionWorkers.get(telegram_id);
            if (worker) {
                masterLogger.info(`[CACHE ♻️] Enviando invalidación de prefix cache al Hijo ${worker.process.pid} (TID: ${telegram_id})`);
                worker.send({ type: 'INVALIDATE_PREFIX_CACHE', telegram_id: telegram_id });
            } else {
                masterLogger.warn(`[CACHE ♻️] Se pidió invalidar prefix para ${telegram_id}, pero no se encontró Hijo.`);
            }
        },
        // =======================================================

        updateUserWhatsapp: usersDB.updateUserWhatsapp,
        clearUserWhatsapp: usersDB.clearUserWhatsapp
    });

    // --- Manejo de Workers Muertos (Simplificado y con logging) ---
    cluster.on('exit', (worker, code, signal) => {
        let telegram_id = null;
        for (const [id, w] of sessionWorkers.entries()) {
            if (w.process.pid === worker.process.pid) {
                telegram_id = id;
                break;
            }
        }
        if (telegram_id) {
            masterLogger.warn(`Hijo ${worker.process.pid} (Sesión ${telegram_id}) salió (Code: ${code}, Signal: ${signal}). Limpiando del mapa.`);
            sessionWorkers.delete(telegram_id);
            // NOTA: Aquí podrías decidir si relanzarlo automáticamente
            // Por ahora, la reconexión se maneja desde el hijo. Si el hijo muere,
            // el usuario de Telegram tendría que darle /start de nuevo.
            // Para un reinicio automático, se necesitaría un re-lanzamiento aquí.
        } else {
            masterLogger.error(`[❌ MAESTRO] Hijo ${worker.process.pid} murió inesperadamente (Señal: ${signal}, Código: ${code}). No estaba en el mapa.`);
        }
    });

    function launchWorkerForSession(session) {
        masterLogger.info(`[LAUNCH] Creando nuevo Hijo para ${session.telegram_id}...`);
        const worker = cluster.fork();
        sessionWorkers.set(session.telegram_id, worker);

        masterLogger.info(`Enviando tarea ${session.telegram_id} al nuevo Hijo ${worker.process.pid}`);
        worker.send({ type: 'START_SESSION', ...session });
    }

    // --- Cargar sesiones existentes (Con logging) ---
    (async () => {
        masterLogger.info("[MAESTRO] Cargando sesiones existentes desde la DB...");
        try {
            const allUsers = await usersDB.getAllUsersWithWhatsapp();
            if (allUsers.length > 0) {
                masterLogger.info(`[MAESTRO] ${allUsers.length} sesiones encontradas. Lanzando ${allUsers.length} Hijos...`);
                for (const user of allUsers) {
                    launchWorkerForSession(user);
                    await new Promise(r => setTimeout(r, 500));
                }
                masterLogger.info("[MAESTRO] ¡Todas las sesiones existentes han sido asignadas a sus Hijos!");
            } else {
                masterLogger.info("[MAESTRO] No se encontraron sesiones existentes para reconectar.");
            }
        } catch (e) {
            masterLogger.fatal(e, "[MAESTRO] Error catastrófico cargando sesiones existentes");
        }
    })();

    // --- NUEVO: Panel de Métricas (Req 5) ---
    setInterval(async () => {
        masterLogger.info('--- [📊 METRICS DASHBOARD] ---');
        masterLogger.info(`[📈] Sesiones Activas: ${sessionWorkers.size}`);

        if (sessionWorkers.size === 0) {
            masterLogger.info('... No hay workers activos.');
            return;
        }

        const statsPromises = [];
        for (const [id, worker] of sessionWorkers.entries()) {
            statsPromises.push(
                pidusage(worker.process.pid)
                    .then(stats => ({ id, pid: worker.process.pid, stats }))
                    .catch(e => ({ id, pid: worker.process.pid, stats: null, error: e.message }))
            );
        }

        const results = await Promise.all(statsPromises);

        for (const res of results) {
            if (res.stats) {
                masterLogger.info({
                    session: res.id,
                    pid: res.pid,
                    cpu: `${res.stats.cpu.toFixed(2)}%`,
                    mem: `${(res.stats.memory / 1024 / 1024).toFixed(2)} MB`
                }, 'Stats del Worker');
            } else {
                masterLogger.warn({ session: res.id, pid: res.pid, error: res.error }, 'No se pudieron obtener stats del worker');
            }
        }
        masterLogger.info('---------------------------------');

    }, 60 * 1000); // Cada 60 segundos

} else {
    // =================================================================
    // CÓDIGO DEL WORKER (HIJO)
    // =================================================================
    console.log(`[⚙️ HIJO] Bot iniciado en proceso hijo (PID: ${process.pid}). ¡Listo para recibir sesión!`);

    // --- Manejadores Globales de Errores (Req 6) ---
    // Logearán al logger de la sesión una vez que se inicialice
    process.on('uncaughtException', (err, origin) => {
        console.error(`[HIJO ${process.pid}] UNCAUGHT EXCEPTION:`, err, 'Origin:', origin);
        // Esto debería ser logeado por el logger de pino de la sesión
    });
    process.on('unhandledRejection', (reason, promise) => {
        console.error(`[HIJO ${process.pid}] UNHANDLED REJECTION:`, reason, 'Promise:', promise);
    });
    process.setMaxListeners(0); // Req 6

    // --- Optimización de RAM (Tu código es bueno, lo mantenemos) ---
    const originalReadFileSync = fs.readFileSync;
    const fileCache = new Map();
    // ... (Tu lógica de caché de archivos se mantiene) ...
    console.log(`[👍 HIJO ${process.pid}] Optimización de RAM aplicada.`);
    
    // --- Inicia el supervisor de sesión ---
    require('./main.js');
}