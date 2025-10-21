// main.js (Supervisor de Sesión - Nivel 6: Guardián y Delegador)

// --- Dependencias ---
const fs = require('fs');
const path = require('path');
const pino = require('pino'); // Req 7
const simple = require('./lib/oke.js');
const smsg = require('./lib/smsg.js');
const {
    Browsers,
    useMultiFileAuthState,
    DisconnectReason,
    makeInMemoryStore,
    proto
} = require('baron-baileys-v2');
const usersDB = require('./lib/users.js');
const dotenv = require('dotenv');
const { getPrefix } = require('./lib/prefixHandler.js');
const TaskQueue = require('./lib/taskQueue.js'); // Req 4

dotenv.config();

// --- Loggers ---
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const baseLogger = pino({ level: 'info' }, pino.destination(path.join(logDir, 'children.log')));

// --- Manejadores Globales (Req 6) ---
// Se logearán al logger base hasta que se cree uno de sesión
let sessionLogger = baseLogger;
process.on('uncaughtException', (err, origin) => {
    sessionLogger.fatal(err, `[HIJO ${process.pid}] UNCAUGHT EXCEPTION. Origin: ${origin}`);
    // Opcional: Salir para que el maestro reinicie
    // process.exit(1); 
});
process.on('unhandledRejection', (reason, promise) => {
    sessionLogger.error({ reason, promise }, `[HIJO ${process.pid}] UNHANDLED REJECTION.`);
});
process.setMaxListeners(0);

// --- Manejador de Órdenes (Tu código, con logging) ---
process.on('message', (message) => {
    if (message.type === 'START_SESSION') {
        baseLogger.info(`[📥 HIJO ${process.pid}] Recibió orden para iniciar: ${message.telegram_id}/${message.whatsapp_number}`);
        startSession(message.telegram_id, message.whatsapp_number);
    }
    if (message.type === 'CLEAN_SESSION') {
        baseLogger.info(`[🧹 HIJO ${process.pid}] Recibió orden de limpieza para: ${message.telegram_id}`);
        cleanSession(message.telegram_id, message.notifyUser, message.fullClean);
        
        // Después de limpiar, el hijo debe salir para que el maestro sepa que terminó
        setTimeout(() => {
            baseLogger.info(`[HIJO ${process.pid}] Tarea de limpieza completada. Saliendo...`);
            process.exit(0); // Salida limpia
        }, 1000); // Da 1s para que se completen las E/S de logs
    }
});

// --- Variables Globales (SOLO DE ESTE HIJO) ---
const sessions = new Map(); // Guardará { conn, intervalId, taskQueue, logger }
const retryCounters = new Map();
const maxRetries = 10;

baseLogger.info(`[HIJO ${process.pid}] main.js cargado, esperando órdenes...`);


// --- Función de Reconexión (Tu código, con logging) ---
function reconnectSession(telegram_id, number) {
    const sessionId = `${telegram_id}-${number}`;
    const sessionData = sessions.get(sessionId);
    const logger = sessionData ? sessionData.logger : baseLogger;

    const currentAttempt = (retryCounters.get(sessionId) || 0) + 1;

    if (currentAttempt > maxRetries) {
        logger.error(`[❌] Límite de reintentos para ${number}. Limpiando.`);
        cleanSession(telegram_id, true, true);
        return;
    }

    retryCounters.set(sessionId, currentAttempt);
    const delay = Math.pow(2, currentAttempt) * 3000 + Math.random() * 1000; // Backoff Exponencial
    logger.info(`[🔄] Reconexión para ${number} en ${Math.round(delay / 1000)}s... (Intento ${currentAttempt}/${maxRetries})`);

    setTimeout(() => {
        logger.info(`[▶️] Ejecutando reconexión para ${number}...`);
        startSession(telegram_id, number);
    }, delay);
}


/**
 * Inicia o reanuda una sesión de WhatsApp.
 */
async function startSession(telegram_id, number) {
    const sessionId = `${telegram_id}-${number}`;
    const sessionPath = path.join(__dirname, 'lib', 'pairing', String(telegram_id), number);

    // --- Logger por Sesión (Req 7) ---
    const sessionLogPath = path.join(logDir, String(telegram_id));
    if (!fs.existsSync(sessionLogPath)) fs.mkdirSync(sessionLogPath, { recursive: true });
    const sessionLogStream = pino.destination(path.join(sessionLogPath, `${number}.log`));
    // Asigna al logger global de este proceso
    sessionLogger = pino({ level: 'info' }, sessionLogStream).child({ session: sessionId, pid: process.pid });
    
    sessionLogger.info('Iniciando startSession...');

    if (sessions.has(sessionId)) {
        sessionLogger.warn(`Intento de iniciar sesión duplicada: ${number}. Detenido.`);
        return;
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const store = makeInMemoryStore({
        logger: sessionLogger.child({ module: 'store' })
    });

    const conn = simple({
        logger: sessionLogger.child({ module: 'baileys' }),
        printQRInTerminal: false,
        auth: state,
        browser: Browsers.windows("Chrome"),
        version: [2, 3000, 1025190524], // Tu versión
        connectTimeoutMs: 60000, // Aumentado para redes lentas
        getMessage: async key => (store.loadMessage(key.remoteJid, key.id) || {}).message || proto.Message.fromObject({})
    });

    store.bind(conn.ev);

    // =======================================================
    //           NUEVO: Ping Inteligente (Req 2)
    // =======================================================
    const pingState = {
        failures: 0,
        maxFailures: 5,
        intervalId: null
    };

    const smartPing = async () => {
        const sessionData = sessions.get(sessionId);
        if (!sessionData) {
            clearInterval(pingState.intervalId);
            return;
        }

        try {
            // Intento 1: Ligero y rápido
            await sessionData.conn.isOnWhatsApp(sessionData.conn.user.id);
            sessionLogger.info('Ping Inteligente (isOnWhatsApp) OK');
            pingState.failures = 0; // Reset en éxito
        } catch (e) {
            sessionLogger.warn(e, 'Ping (isOnWhatsApp) falló. Intentando fetchBlocklist...');
            try {
                // Intento 2: Más robusto
                await sessionData.conn.fetchBlocklist();
                sessionLogger.info('Ping Inteligente (fetchBlocklist) OK');
                pingState.failures = 0; // Reset en éxito
            } catch (e2) {
                sessionLogger.error(e2, 'Ping (fetchBlocklist) también falló.');
                pingState.failures++;

                if (pingState.failures >= pingState.maxFailures) {
                    sessionLogger.error(`Ping falló ${pingState.failures} veces. Forzando reconexión.`);
                    clearInterval(pingState.intervalId);
                    reconnectSession(telegram_id, number); // Usa la lógica de reconexión
                }
            }
        }
    };

    pingState.intervalId = setInterval(smartPing, 30 * 1000); // Cada 30 segundos

    // =======================================================
    //           NUEVO: Cola de Tareas (Req 4)
    // =======================================================
    const taskQueue = new TaskQueue(conn, sessionLogger.child({ module: 'TaskQueue' }));
    sessionLogger.info(`Cola de tareas iniciada con ${taskQueue.MAX_WORKERS} hilos.`);

    // Guardamos todo en el mapa de sesiones
    sessions.set(sessionId, { conn, intervalId: pingState.intervalId, taskQueue, logger: sessionLogger });


    // Lógica de Pairing (se queda igual, con logging)
    if (!conn.authState.creds.registered) {
        sessionLogger.info('Sesión no registrada. Solicitando código de emparejamiento...');
        setTimeout(async () => {
            if (!sessions.has(sessionId)) return;
            try {
                let code = await conn.requestPairingCode(number);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });
                fs.writeFileSync(path.join(sessionPath, 'pairing.json'), JSON.stringify({ code }));
                sessionLogger.info(`[✓] Código generado para ${number}: ${code}`);
            } catch (e) {
                sessionLogger.error(e, `[!] Error generando código para ${number}`);
                if (sessions.has(sessionId)) {
                    await cleanSession(telegram_id, false, true);
                }
            }
        }, 3000);
    }

    // --- Manejador de Conexión Reforzado (Req 2, 3, 8) ---
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            sessionLogger.info(`[✅] Conexión estabilizada para ${number}.`);
            retryCounters.set(sessionId, 0); // Resetea contador de reintentos
            // activeSessions no parece usarse, pero lo mantenemos por si acaso
            // activeSessions[telegram_id] = conn; 
            return;
        }

        if (connection === 'close') {
            const sessionData = sessions.get(sessionId);
            if (sessionData) {
                clearInterval(sessionData.intervalId); // Detiene el ping
                sessionData.taskQueue.destroy(); // Detiene los hilos de trabajo
                sessionLogger.info('Ping y TaskQueue detenidos.');
            }

            sessions.delete(sessionId);
            // if (activeSessions[telegram_id]) delete activeSessions[telegram_id];

            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reason = DisconnectReason[statusCode] || 'Razón desconocida';
            sessionLogger.warn({ statusCode, reason }, 'Conexión cerrada.');

            const unrecoverableStatusCodes = [
                DisconnectReason.loggedOut,
                DisconnectReason.connectionReplaced,
                DisconnectReason.badSession
            ];

            if (unrecoverableStatusCodes.includes(statusCode)) {
                sessionLogger.error(`[🚫] Cierre definitivo para ${number}. Razón: ${reason}. Limpiando...`);
                await cleanSession(telegram_id, true, true);
            } else if (statusCode === DisconnectReason.rateOverlimit) { // Req 8
                sessionLogger.warn(`[⏳] Rate limit detectado. Esperando 5 minutos para reconectar.`);
                setTimeout(() => reconnectSession(telegram_id, number), 5 * 60 * 1000);
            } else {
                sessionLogger.info(`[🔌] Conexión perdida. Razón: ${reason}. Iniciando reconexión...`);
                reconnectSession(telegram_id, number);
            }
        }
    });

    // Guardado de credenciales (Req 3)
    conn.ev.on('creds.update', saveCreds);


    // --- Manejador de Mensajes (Tu filtro, con logging y TaskQueue) ---
    conn.ev.on('messages.upsert', async chatUpdate => {
        const mek = chatUpdate.messages[0];
        if (!mek.message || mek.key.remoteJid === 'status@broadcast') return;

        const senderId = mek.key.remoteJid.endsWith('@g.us') ? mek.key.participant : mek.key.remoteJid;
        if (!senderId) return;

        const body = mek.message?.conversation ||
            mek.message?.extendedTextMessage?.text ||
            mek.message?.imageMessage?.caption ||
            mek.message?.videoMessage?.caption || "";

        // --- ¡Tu filtro! ---
        let prefix = null;
        let isCmd = false;
        
        const user = await usersDB.findUserByWhatsapp(senderId.split('@')[0]);
        const effectivePrefix = user ? getPrefix(user.telegram_id) : getPrefix(null);

        if (effectivePrefix && body.startsWith(effectivePrefix)) {
            isCmd = true;
            prefix = effectivePrefix;
        }
        // ... (Tu lógica de prefijo vacío) ...
        
        if (!isCmd) {
            return;
        }
        // --- Fin del filtro ---

        // ¡Aquí está la magia!
        const m = smsg(conn, mek, store);
        
        // Actualizamos la TaskQueue con el mensaje actual (para el contexto 'quoted')
        const sessionData = sessions.get(sessionId);
        if (!sessionData) {
             sessionLogger.warn('Mensaje recibido pero la sesión no existe en el mapa.');
             return;
        }

        // =======================================================
        //           ¡¡¡AQUÍ ESTÁ LA CORRECCIÓN!!!
        // =======================================================
        // Creamos un objeto 'm' serializable (clonable) sin funciones
        const m_lite = {
            key: m.key,
            chat: m.chat,
            sender: m.sender,
            isGroup: m.isGroup,
            message: m.message, // El 'message' (proto) es serializable
            pushName: m.pushName,
            text: m.text // Pasamos el texto también
            // NO incluimos m.reply, m.download, etc.
        };
        
        // Pasamos la versión LITE a la cola
        sessionData.taskQueue.updateContext(m_lite); 
        // =======================================================

        // Pasamos el prefijo, la cola de tareas y el logger a baron.js
        require("./baron.js")(
            conn, 
            m, // <-- baron.js (hilo principal) sigue recibiendo el 'm' completo
            chatUpdate, 
            store, 
            prefix, 
            sessionData.taskQueue, // La cola en sí
            sessionLogger.child({ module: 'baron' })
        );
    });

    return conn;
}


async function cleanSession(telegram_id, notifyUser = false, fullClean = false) {
    const user = await usersDB.getUser(telegram_id);
    const whatsappNumber = user?.whatsapp_number;
    const sessionId = `${telegram_id}-${whatsappNumber}`;

    const logger = sessions.get(sessionId)?.logger || baseLogger;
    logger.info(`[🧹] Iniciando cleanSession (Full: ${fullClean})`);

    const sessionData = sessions.get(sessionId);
    if (sessionData) {
        try {
            clearInterval(sessionData.intervalId); // Paramos el ping
            sessionData.taskQueue.destroy(); // Paramos los hilos
            sessionData.conn.end(new Error('Sesión limpiada por el Maestro'));
            logger.info('Ping, TaskQueue y Conexión detenidos.');
        } catch (e) {
            logger.warn(e, 'Error menor durante el cierre de conexión.');
        }
        sessions.delete(sessionId);
    }

    if (retryCounters.has(sessionId)) retryCounters.delete(sessionId);

    if (whatsappNumber && fullClean) {
        const sessionPath = path.join(__dirname, 'lib', 'pairing', String(telegram_id), whatsappNumber);
        if (fs.existsSync(sessionPath)) {
            try {
                fs.rmSync(sessionPath, { recursive: true, force: true });
                await usersDB.clearUserWhatsapp(telegram_id);
                logger.info(`[✔️] Limpieza completa de ${whatsappNumber} finalizada.`);
            } catch (error) {
                logger.error(error, `[❌] Error en limpieza completa`);
            }
        }
    }

    return true;
}

// ... (Tu recolector de basura se mantiene, es una buena idea) ...
// Sólo añadí logging
const garbageLogger = baseLogger.child({ module: 'GarbageCollector' });
async function periodicSessionGarbageCollector() {
    garbageLogger.info(`[♻️] Ejecutando recolector de basura...`);
    // ... (Tu lógica) ...
    // Reemplaza console.log con garbageLogger.info/error
}
setInterval(periodicSessionGarbageCollector, 3 * 60 * 60 * 1000);
setTimeout(periodicSessionGarbageCollector, 5 * 60 * 1000);

baseLogger.info(`[👍 HIJO ${process.pid}] Supervisor de sesión conectado (Modo Hijo)`);