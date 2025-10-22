// launcher.js (¡¡COMPLETO Y FINAL v9 - CERO PINO!!)
const cluster = require('cluster');
const os = require('os');
const fs = require('fs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const usersDB = require('./lib/users.js'); // Asegúrate que las funciones existen y son async
const chocoplusHandler = require('./chocoplus.js');
const dotenv = require('dotenv');
const pino = require('pino'); // <-- ELIMINADO
// const pidusage = require('pidusage'); // <-- ELIMINADO (para métricas)

dotenv.config();

// --- Ya no hay configuración de Logging Pino ---

const sessionWorkers = new Map(); // Mapa: telegram_id (string) -> worker

if (cluster.isPrimary) {
    console.log(`[🚀 MAESTRO] PID ${process.pid} activado en ${os.cpus().length} CPUs.`); // Log Consola
    console.log(`[🔥] Modo: Aislamiento Total (1 Sesión = 1 Proceso Hijo).`); // Log Consola

    // --- Manejadores Globales de Errores (Maestro - Usan Console) ---
    process.on('uncaughtException', (err, origin) => console.error(`[!!! MAESTRO UNCAUGHT ${process.pid} !!!]`, err, 'Origin:', origin));
    process.on('unhandledRejection', (reason, promise) => console.error(`[!!! MAESTRO UNHANDLED ${process.pid} !!!]`, { reason, promise }));
    process.setMaxListeners(0); // Sin límite

    // --- Bot de Telegram ---
    console.log(`[🤖 MAESTRO] Iniciando Bot Telegram...`); // Log Consola
    const TOKEN = process.env.BOT_TOKEN || '8470263467:AAEwJKUW_fYF1neu-Kwgspgdwn6xMeNHTec'; // <- PON TU TOKEN REAL AQUÍ O EN .env
    if (!TOKEN || TOKEN === 'TU_BOT_TOKEN_AQUI') {
        console.error("¡¡¡ERROR FATAL: BOT_TOKEN no definido!!!"); // Log Consola
        process.exit(1);
    }
    const bot = new TelegramBot(TOKEN, { polling: true });
    const userStates = {}; // Estado temporal

    // --- Pasa dependencias a chocoplusHandler ---
    chocoplusHandler(bot, {
        userStates,

        // --- Limpieza de Sesión (Usa Console) ---
        cleanSession: async (telegram_id, notifyUser = false, fullClean = false) => {
            const stringId = String(telegram_id);
            console.log(`[🧹 MAESTRO] Orden limpieza para ${stringId} (Full: ${fullClean})`); // Log Consola
            const worker = sessionWorkers.get(stringId);
            if (worker) {
                console.log(`Enviando orden CLEAN_SESSION a Hijo ${worker.process.pid}...`); // Log Consola
                worker.send({ type: 'CLEAN_SESSION', telegram_id: stringId, notifyUser, fullClean });

                const cleanupTimeout = setTimeout(() => {
                    if (sessionWorkers.has(stringId)) {
                        console.warn(`[KILL MAESTRO] Hijo ${worker.process.pid} (Sesión ${stringId}) no terminó limpieza. Matando...`); // Log Consola WARN
                        worker.kill('SIGKILL');
                        sessionWorkers.delete(stringId);
                    }
                }, 8000); // 8s

                worker.once('exit', (code, signal) => {
                    console.log(`[MAESTRO] Hijo ${worker.process.pid} (Sesión ${stringId}) terminó (Code: ${code}, Signal: ${signal}).`); // Log Consola
                    clearTimeout(cleanupTimeout);
                    if (sessionWorkers.has(stringId)) sessionWorkers.delete(stringId);
                });
            } else { // Si no se encontró worker
                console.warn(`[MAESTRO] Limpiar ${stringId}: No se encontró Hijo activo.`); // Log Consola WARN
                if (fullClean) {
                    console.log(`[MAESTRO] Intentando limpieza fallback para ${stringId} (DB y Archivos)...`); // Log Consola
                    try {
                        await usersDB.clearUserWhatsapp(stringId);
                        console.log(`[MAESTRO] Fallback DB clean OK para ${stringId}.`); // Log Consola

                        // Borrar carpeta (con callback para loguear errores)
                        const sessionDir = path.join(__dirname, 'lib', 'pairing', stringId);
                        if (fs.existsSync(sessionDir)) {
                            console.log(`[MAESTRO] Intentando borrar carpeta fallback: ${sessionDir}`); // Log Consola
                             fs.rm(sessionDir, { recursive: true, force: true }, (err) => { // Usar fs.rm con callback
                                 if (err) console.error(`[MAESTRO ERROR] Fallo al borrar carpeta fallback ${sessionDir}:`, err); // Log Consola ERROR
                                 else console.log(`[MAESTRO] Carpeta fallback ${sessionDir} borrada.`); // Log Consola
                             });
                        }

                    } catch (err) {
                        console.error(`[MAESTRO ERROR] Fallo en limpieza fallback para ${stringId}:`, err); // Log Consola ERROR
                    }
                }
            }
        },

        // --- Inicio de Sesión (Usa Console) ---
        startSession: (telegram_id, whatsapp_number) => {
            const stringId = String(telegram_id);
            console.log(`[▶️ MAESTRO] Orden inicio para ${stringId}/${whatsapp_number}`); // Log Consola
            if (sessionWorkers.has(stringId)) {
                const oldWorker = sessionWorkers.get(stringId);
                console.warn(`[MAESTRO] ${stringId} ya tiene Hijo (${oldWorker.process.pid}). Matando al antiguo...`); // Log Consola WARN
                oldWorker.kill('SIGTERM');
                 setTimeout(() => launchWorkerForSession({ telegram_id: stringId, whatsapp_number }), 1500); // 1.5s delay
            } else {
                 launchWorkerForSession({ telegram_id: stringId, whatsapp_number });
            }
        },

        // Funciones DB (se mantienen)
        updateUserWhatsapp: usersDB.updateUserWhatsapp,
        clearUserWhatsapp: usersDB.clearUserWhatsapp
    });

    // --- Manejo Centralizado de Workers Muertos (Usa Console) ---
    cluster.on('exit', (worker, code, signal) => {
        let telegram_id_exited = null;
        for (const [id, w] of sessionWorkers.entries()) {
            if (w.process.pid === worker.process.pid) { telegram_id_exited = id; break; }
        }

        if (telegram_id_exited && sessionWorkers.has(telegram_id_exited)) {
            console.warn(`[MAESTRO WARN] Hijo ${worker.process.pid} (Sesión ${telegram_id_exited}) salió inesperadamente (Code: ${code}, Signal: ${signal}). Limpiando.`); // Log Consola WARN
            sessionWorkers.delete(telegram_id_exited);
            if (code !== 0 && code !== null) { // Notificar si no fue salida limpia
                 bot.sendMessage(telegram_id_exited, `⚠️ Tu sesión WhatsApp (${telegram_id_exited}) se detuvo. Intenta /start de nuevo.`).catch(e => console.warn(`[MAESTRO WARN] Fallo al notificar ${telegram_id_exited}:`, e.message)); // Log Consola WARN
            }
        } else if (!telegram_id_exited) {
            console.error(`[❌ MAESTRO ERROR] Hijo ${worker.process.pid} murió (Señal: ${signal}, Código: ${code}). No mapeado.`); // Log Consola ERROR
        }
    });

    // --- Función para Lanzar Worker (Usa Console) ---
    function launchWorkerForSession(session) {
        const stringId = String(session.telegram_id);
        console.log(`[LAUNCH MAESTRO] Creando Hijo para ${stringId}...`); // Log Consola
        const worker = cluster.fork();
        sessionWorkers.set(stringId, worker);
        console.log(`[MAESTRO] Enviando START_SESSION a Hijo ${worker.process.pid} para ${stringId}`); // Log Consola
        worker.send({ type: 'START_SESSION', telegram_id: stringId, whatsapp_number: session.whatsapp_number });
    }

    // --- Cargar Sesiones Existentes (Usa Console) ---
    (async () => {
        console.log("[MAESTRO] Cargando sesiones existentes desde DB..."); // Log Consola
        try {
            const allUsers = await usersDB.getAllUsersWithWhatsapp();
            if (allUsers?.length > 0) {
                console.log(`[MAESTRO] ${allUsers.length} sesiones encontradas. Lanzando Hijos...`); // Log Consola
                for (let i = 0; i < allUsers.length; i++) {
                    const sessionData = { telegram_id: String(allUsers[i].telegram_id), whatsapp_number: allUsers[i].whatsapp_number };
                    if (sessionData.telegram_id && sessionData.whatsapp_number) {
                        launchWorkerForSession(sessionData);
                        await new Promise(r => setTimeout(r, 750)); // Delay
                    } else {
                         console.warn("[MAESTRO WARN] Registro de usuario inválido omitido:", allUsers[i]); // Log Consola WARN
                    }
                }
                console.log("[MAESTRO] Todos los Hijos para sesiones existentes lanzados."); // Log Consola
            } else {
                console.log("[MAESTRO] No hay sesiones activas guardadas en la DB."); // Log Consola
            }
        } catch (e) {
            console.error("[!!! MAESTRO FATAL !!!] Error FATAL cargando sesiones existentes:", e); // Log Consola ERROR FATAL
            // process.exit(1); // Considerar salir si falla la carga inicial
        }
    })();

    // --- Panel de Métricas (ELIMINADO - Usaba Pino Logger) ---
    // Si necesitas métricas, usa `pm2 monit` o implementa una solución diferente.

} else { // Código del Worker (Hijo)
    // --- Manejadores globales ANTES de cargar main.js (Usan Console) ---
    process.on('uncaughtException', (err, origin) => {
        console.error(`[!!! FATAL HIJO ${process.pid} PRE-MAIN UNCAUGHT !!!]`, err, 'Origin:', origin);
        process.exit(1); // Salir si hay error antes de cargar main
    });
    process.on('unhandledRejection', (reason, promise) => {
        console.error(`[!!! FATAL HIJO ${process.pid} PRE-MAIN UNHANDLED !!!]`, reason, 'Promise:', promise);
         process.exit(1); // Salir también
    });
    process.setMaxListeners(0);

    console.log(`[⚙️ HIJO] PID ${process.pid} iniciado. Cargando main.js...`); // Log Consola

    // Carga diferida de main.js
    try {
        require('./main.js'); // Carga el supervisor de sesión
    } catch (mainLoadError) {
        console.error(`[!!! FATAL HIJO ${process.pid} !!!] Error al cargar main.js:`, mainLoadError); // Log Consola ERROR FATAL
        process.exit(1); // Salir si main.js no carga
    }
}