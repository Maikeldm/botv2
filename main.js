// main.js (CORREGIDO - Anti-Saturación y Prefijos Individuales)

// --- Dependencias ---
const fs = require('fs');
const path = require('path');
const pino = require('pino');
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
const { getPrefix } = require('./lib/prefixHandler.js'); // <-- USA ESTA FUNCIÓN
const TaskQueue = require('./lib/taskQueue.js');
const TtlCache = require('./lib/ttlCache.js');

dotenv.config();

// --- Loggers ---
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const baseLogger = pino({ level: 'info' }, pino.destination(path.join(logDir, 'children.log')));

// --- Manejadores Globales ---
let sessionLogger = baseLogger;
process.on('uncaughtException', (err, origin) => {
    sessionLogger.fatal(err, `[HIJO ${process.pid}] UNCAUGHT EXCEPTION. Origin: ${origin}`);
});
process.on('unhandledRejection', (reason, promise) => {
    sessionLogger.error({ reason, promise }, `[HIJO ${process.pid}] UNHANDLED REJECTION.`);
});
process.setMaxListeners(0);

// --- Manejador de Órdenes del Maestro ---
process.on('message', (message) => {
    if (message.type === 'START_SESSION') {
        baseLogger.info(`[📥 HIJO ${process.pid}] Orden: Iniciar ${message.telegram_id}/${message.whatsapp_number}`);
        startSession(message.telegram_id, message.whatsapp_number);
    }
    if (message.type === 'CLEAN_SESSION') {
        baseLogger.info(`[🧹 HIJO ${process.pid}] Orden: Limpiar ${message.telegram_id}`);
        cleanSession(message.telegram_id, message.notifyUser, message.fullClean);
        setTimeout(() => { baseLogger.info(`[HIJO ${process.pid}] Limpieza OK. Saliendo.`); process.exit(0); }, 1000);
    }
    if (message.type === 'INVALIDATE_PREFIX_CACHE') {
        const telegram_id = message.telegram_id;
        const waNumber = telegramIdToWaNumberMap.get(telegram_id);
        if (waNumber) {
            const invalidated = prefixCache.invalidate(waNumber);
            sessionLogger.info(`[CACHE ♻️] Invalidación OK para ${waNumber} (TID: ${telegram_id}). Borrado: ${invalidated}`);
        } else {
            sessionLogger.warn(`[CACHE ♻️] Invalidación FALLIDA para TID: ${telegram_id} (WA no encontrado)`);
        }
    }
});

// --- Variables Globales del Hijo ---
const sessions = new Map();
const retryCounters = new Map();
const maxRetries = 10;
const prefixCache = new TtlCache(3600); // Cache de 1 hora
const telegramIdToWaNumberMap = new Map(); // Mapa inverso para invalidación

baseLogger.info(`[HIJO ${process.pid}] main.js cargado, esperando órdenes.`);

// --- Función de Reconexión ---
function reconnectSession(telegram_id, number) {
    const sessionId = `${telegram_id}-${number}`;
    const logger = sessions.get(sessionId)?.logger || baseLogger;
    const currentAttempt = (retryCounters.get(sessionId) || 0) + 1;

    if (currentAttempt > maxRetries) {
        logger.error(`[❌] Límite reintentos (${maxRetries}) para ${number}. Limpiando.`);
        cleanSession(telegram_id, true, true); // Notificar y limpiar completo
        return;
    }

    retryCounters.set(sessionId, currentAttempt);
    // Backoff Exponencial: 2^1*3=6s, 2^2*3=12s, 2^3*3=24s...
    const delay = Math.pow(2, currentAttempt) * 3000 + Math.random() * 1000;
    logger.info(`[🔄] Reconexión para ${number} en ${Math.round(delay / 1000)}s... (Intento ${currentAttempt}/${maxRetries})`);

    setTimeout(() => {
        logger.info(`[▶️] Ejecutando reconexión para ${number}...`);
        startSession(telegram_id, number); // Reintentar iniciar
    }, delay);
}

// --- Función Principal: Iniciar Sesión ---
async function startSession(telegram_id, number) {
    const sessionId = `${telegram_id}-${number}`;
    const sessionPath = path.join(__dirname, 'lib', 'pairing', String(telegram_id), number);

    // --- Logger por Sesión ---
    const sessionLogPath = path.join(logDir, String(telegram_id));
    if (!fs.existsSync(sessionLogPath)) fs.mkdirSync(sessionLogPath, { recursive: true });
    const sessionLogStream = pino.destination(path.join(sessionLogPath, `${number}.log`));
    sessionLogger = pino({ level: 'info' }, sessionLogStream).child({ session: sessionId, pid: process.pid });

    sessionLogger.info('Iniciando startSession...');
    if (sessions.has(sessionId)) {
        sessionLogger.warn(`Sesión duplicada ${number}. Detenido.`);
        return;
    }

    // --- Autenticación y Store ---
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const store = makeInMemoryStore({ logger: sessionLogger.child({ module: 'store' }) });

    // --- Conexión Baileys ---
    const conn = simple({ // 'simple' es tu wrapper 'lib/oke.js'
        logger: sessionLogger.child({ module: 'baileys' }),
        printQRInTerminal: false, // El maestro se encarga
        auth: state,
        browser: Browsers.windows("Chrome"), // Tu config
        version: [2, 3000, 1025190524], // Tu versión específica
        connectTimeoutMs: 60000, // Timeout más largo
        getMessage: async key => (store.loadMessage(key.remoteJid, key.id) || {}).message || proto.Message.fromObject({})
    });
    store.bind(conn.ev); // Sincronizar store con eventos

    sessionLogger.info('Cache de prefijos (TTL 1h) ACTIVO.');

    // --- Ping Inteligente ---
    const pingState = { failures: 0, maxFailures: 5, intervalId: null };
    const smartPing = async () => {
        const sessionData = sessions.get(sessionId);
        if (!sessionData) { clearInterval(pingState.intervalId); return; }
        // Esperar a que conn.user esté definido después de la conexión inicial
        if (!sessionData.conn?.user?.id) { sessionLogger.warn('Ping saltado (conn.user no listo).'); return; }

        try {
            await sessionData.conn.isOnWhatsApp(sessionData.conn.user.id);
            // sessionLogger.info('Ping (isOnWhatsApp) OK'); // Log opcional (puede ser ruidoso)
            pingState.failures = 0;
        } catch (e1) {
            sessionLogger.warn(e1, 'Ping (isOnWhatsApp) falló. Intentando fetchBlocklist...');
            try {
                await sessionData.conn.fetchBlocklist();
                // sessionLogger.info('Ping (fetchBlocklist) OK'); // Log opcional
                pingState.failures = 0;
            } catch (e2) {
                sessionLogger.error(e2, 'Ping (fetchBlocklist) también falló.');
                pingState.failures++;
                if (pingState.failures >= pingState.maxFailures) {
                    sessionLogger.error(`Ping falló ${pingState.failures} veces seguidas. Forzando reconexión.`);
                    clearInterval(pingState.intervalId);
                    reconnectSession(telegram_id, number); // Iniciar proceso de reconexión
                }
            }
        }
    };
    pingState.intervalId = setInterval(smartPing, 30 * 1000); // Cada 30 segundos

    // --- Cola de Tareas (Worker Threads) ---
    const taskQueue = new TaskQueue(conn, sessionLogger.child({ module: 'TaskQueue' }));
    sessionLogger.info(`Cola de tareas iniciada (${taskQueue.MAX_WORKERS} hilos).`);

    // --- Guardar Estado de Sesión ---
    sessions.set(sessionId, { conn, intervalId: pingState.intervalId, taskQueue, logger: sessionLogger });

    // --- Lógica de Pairing (Si es nueva sesión) ---
    if (!conn.authState.creds.registered) {
        sessionLogger.info('Sesión no registrada. Solicitando código...');
        setTimeout(async () => { // Dar tiempo a Baileys para inicializar
            if (!sessions.has(sessionId)) return; // Si la sesión murió mientras tanto
            try {
                let code = await conn.requestPairingCode(number);
                code = code?.match(/.{1,4}/g)?.join("-") || code; // Formatear código
                if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });
                fs.writeFileSync(path.join(sessionPath, 'pairing.json'), JSON.stringify({ code })); // Guardar para Telegram
                sessionLogger.info(`[✓] Código generado para ${number}: ${code}`);
                // Aquí NO actualizamos DB, esperamos a que el usuario confirme en Telegram
            } catch (e) {
                sessionLogger.error(e, `[!] Error crítico generando código para ${number}. Limpiando...`);
                await cleanSession(telegram_id, false, true); // Limpiar sesión fallida
            }
        }, 5000); // Aumentar espera a 5s
    }

    // --- Manejador Central de Conexión ---
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        const logger = sessions.get(sessionId)?.logger || sessionLogger; // Usar logger específico si existe

        if (connection === 'open') {
            logger.info(`[✅] Conexión ESTABLECIDA para ${number}.`);
            retryCounters.set(sessionId, 0); // Resetear reintentos en éxito
            // Aquí podrías notificar a Telegram si quieres
        } else if (connection === 'close') {
            const sessionData = sessions.get(sessionId);
            if (sessionData) {
                clearInterval(sessionData.intervalId); // Detener ping
                sessionData.taskQueue.destroy(); // Detener hilos
                logger.info('Ping y TaskQueue detenidos por cierre.');
            }
            sessions.delete(sessionId); // Eliminar de sesiones activas

            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reason = DisconnectReason[statusCode] || `Desconocido (${statusCode})`;
            logger.warn({ statusCode, reason, error: lastDisconnect?.error }, 'Conexión CERRADA.');

            const unrecoverableCodes = [
                DisconnectReason.loggedOut,           // Cerró sesión desde el móvil
                DisconnectReason.connectionReplaced,  // Abrió WA Web en otro lado
                DisconnectReason.badSession           // Archivos de sesión corruptos
            ];

            if (unrecoverableCodes.includes(statusCode)) {
                logger.error(`[🚫] Cierre IRRECUPERABLE para ${number}. Razón: ${reason}. Limpiando TODO.`);
                await cleanSession(telegram_id, true, true); // Notificar y limpieza completa
            } else if (statusCode === DisconnectReason.timedOut) {
                logger.warn(`[⏳] Timeout detectado. Reintentando conexión...`);
                reconnectSession(telegram_id, number);
            } else if (statusCode === DisconnectReason.rateOverlimit) {
                 logger.warn(`[⏳] Rate limit por WhatsApp. Esperando 5 minutos...`);
                 setTimeout(() => reconnectSession(telegram_id, number), 5 * 60 * 1000);
            } else {
                // Otras razones (problemas de red, reinicio del servidor WA, etc.)
                logger.info(`[🔌] Conexión perdida (${reason}). Iniciando reconexión...`);
                reconnectSession(telegram_id, number);
            }
        }
    });

    // --- Guardado de Credenciales ---
    conn.ev.on('creds.update', saveCreds);

    // --- Manejador de Mensajes ---
    conn.ev.on('messages.upsert', async (chatUpdate) => {
        const mek = chatUpdate.messages[0];
        // Ignorar notificaciones de estado, mensajes sin contenido, etc.
        if (!mek.message || mek.key.remoteJid === 'status@broadcast' || mek.key.fromMe) return;

        // Determinar remitente (grupo vs privado)
        const senderId = mek.key.remoteJid.endsWith('@g.us') ? mek.key.participant : mek.key.remoteJid;
        if (!senderId) return; // No se pudo identificar al remitente

        // Extraer texto del mensaje
        const body = mek.message?.conversation ||
                     mek.message?.extendedTextMessage?.text ||
                     mek.message?.imageMessage?.caption ||
                     mek.message?.videoMessage?.caption || "";

        if (!body) return; // Ignorar mensajes sin texto (stickers, audios sin caption, etc.)

        // =======================================================
        //           FILTRO ANTI-SATURACIÓN (CORREGIDO)
        // =======================================================
        const senderKey = senderId.split('@')[0]; // Usar número sin @s.whatsapp.net como clave
        let effectivePrefix = prefixCache.get(senderKey); // 1. Intentar obtener desde cache

        if (effectivePrefix === null) { // Cache miss o expirado
            // sessionLogger.debug(`Cache MISS para ${senderKey}. Consultando DB...`); // Log opcional
            try {
                // 2. Consultar DB (operación más lenta)
                const user = await usersDB.findUserByWhatsapp(senderKey);
                // Usar la función getPrefix de prefixHandler.js
                effectivePrefix = user ? getPrefix(user.telegram_id) : null; // Devuelve prefijo o null si no hay

                // 3. Poblar mapa inverso para invalidación de caché
                if (user && user.telegram_id) {
                    telegramIdToWaNumberMap.set(user.telegram_id, senderKey);
                }

                // 4. Guardar en caché (incluso si es null) para evitar consultas repetidas
                prefixCache.set(senderKey, effectivePrefix);

            } catch (dbError) {
                sessionLogger.error(dbError, `Error DB consultando prefijo para ${senderKey}`);
                effectivePrefix = null; // Asumir null en caso de error
            }
        }
        // else { sessionLogger.debug(`Cache HIT para ${senderKey}: '${effectivePrefix}'`); } // Log opcional

        let prefix = null;
        let isCmd = false;

        // 5. Lógica de Detección de Comando (Anti-Saturación)
        if (effectivePrefix === '') { // Prefijo vacío ('')
             // ACEPTAR SOLO EN CHAT PRIVADO
             if (!mek.key.remoteJid.endsWith('@g.us')) {
                 isCmd = true;
                 prefix = ''; // Indicar que es comando sin prefijo
             }
             // Si es grupo, se ignora (isCmd sigue false)

        } else if (effectivePrefix && body.startsWith(effectivePrefix)) { // Prefijo normal (ej: '!')
            isCmd = true;
            prefix = effectivePrefix;
        }
        // Si effectivePrefix es null o no coincide, isCmd sigue false

        // 6. Salida Rápida si no es comando
        if (!isCmd) {
            return; // <<-- ¡¡OPTIMIZACIÓN CLAVE!! Ignora mensajes normales
        }
        // =======================================================
        //           FIN DEL FILTRO ANTI-SATURACIÓN
        // =======================================================

        // Si llegó hasta aquí, ¡ES UN COMANDO VÁLIDO!
        const m = smsg(conn, mek, store); // Procesar mensaje con tu helper smsg

        const sessionData = sessions.get(sessionId);
        if (!sessionData) {
            sessionLogger.warn('Comando recibido pero sesión no encontrada en `sessions`. Ignorando.');
            return;
        }

        // Crear versión 'lite' de 'm' para pasar al worker (evita DataCloneError)
        const m_lite = {
            key: m.key, chat: m.chat, sender: m.sender, isGroup: m.isGroup,
            message: m.message, // Proto es serializable
            pushName: m.pushName, text: m.text
        };
        sessionData.taskQueue.updateContext(m_lite); // Actualizar contexto de la cola

        // Llamar a baron.js (enrutador de comandos)
        require("./baron.js")(
            conn,
            m, // baron.js recibe el 'm' completo (con funciones)
            chatUpdate,
            store,
            prefix, // Pasar el prefijo detectado
            sessionData.taskQueue, // Pasar la cola de tareas
            sessionLogger.child({ module: 'baron' }) // Pasar logger específico
        );
    }); // Fin messages.upsert

    return conn; // Devuelve la conexión creada
} // Fin startSession

// --- Función de Limpieza de Sesión ---
async function cleanSession(telegram_id, notifyUser = false, fullClean = false) {
    const user = await usersDB.getUser(telegram_id); // Obtener user para sacar WA number
    const whatsappNumber = user?.whatsapp_number;
    const sessionId = `${telegram_id}-${whatsappNumber}`;
    const logger = sessions.get(sessionId)?.logger || baseLogger; // Logger específico o base

    logger.info(`[🧹] Iniciando cleanSession (Notificar: ${notifyUser}, Full: ${fullClean})`);

    // 1. Detener procesos activos de la sesión
    const sessionData = sessions.get(sessionId);
    if (sessionData) {
        try {
            clearInterval(sessionData.intervalId); // Detener ping
            sessionData.taskQueue.destroy(); // Detener hilos de trabajo
            // Intentar cerrar conexión Baileys limpiamente
            sessionData.conn.end(new Error('Sesión limpiada manualmente.'));
            logger.info('Ping, TaskQueue y Conexión detenidos.');
        } catch (e) {
            logger.warn(e, 'Error menor durante el cierre forzado de conexión.');
        }
        sessions.delete(sessionId); // Quitar de sesiones activas
    }

    // 2. Limpiar caché y mapa inverso
    if (telegramIdToWaNumberMap.has(telegram_id)) {
        const waNum = telegramIdToWaNumberMap.get(telegram_id);
        prefixCache.invalidate(waNum); // Borrar prefijo del cache
        telegramIdToWaNumberMap.delete(telegram_id); // Borrar mapeo inverso
        logger.info(`[CACHE ♻️] Cache y mapa inverso limpios para ${waNum} (TID: ${telegram_id})`);
    }

    // 3. Limpiar contador de reintentos
    if (retryCounters.has(sessionId)) retryCounters.delete(sessionId);

    // 4. Limpieza Profunda (Borrar archivos y DB) si fullClean es true
    if (whatsappNumber && fullClean) {
        const sessionPath = path.join(__dirname, 'lib', 'pairing', String(telegram_id), whatsappNumber);
        logger.info(`Intentando borrado completo de: ${sessionPath}`);
        if (fs.existsSync(sessionPath)) {
            try {
                fs.rmSync(sessionPath, { recursive: true, force: true }); // Borrar carpeta de sesión
                await usersDB.clearUserWhatsapp(telegram_id); // Borrar número de la DB
                logger.info(`[✔️] Limpieza COMPLETA de ${whatsappNumber} finalizada (Archivos y DB).`);
                // Aquí podrías notificar a Telegram si 'notifyUser' es true
            } catch (error) {
                logger.error(error, `[❌] Error durante la limpieza COMPLETA de ${whatsappNumber}`);
            }
        } else {
             logger.warn(`La carpeta ${sessionPath} no existía para borrado completo.`);
             // Igualmente intentar limpiar DB por si acaso
             try { await usersDB.clearUserWhatsapp(telegram_id); } catch(e){}
        }
    } else if (whatsappNumber && !fullClean) {
         logger.info(`Limpieza superficial para ${whatsappNumber}. Archivos y DB conservados.`);
    }

    return true; // Indicar que la limpieza (o intento) se completó
}

// --- Recolector de Basura (Opcional, tu lógica) ---
const garbageLogger = baseLogger.child({ module: 'GarbageCollector' });
async function periodicSessionGarbageCollector() {
    garbageLogger.info(`[♻️] Ejecutando recolector de basura... (Tu lógica aquí)`);
    // Aquí iría tu lógica para limpiar sesiones zombie o inactivas si la tienes
}
// Descomentar si tienes lógica de garbage collector:
// setInterval(periodicSessionGarbageCollector, 3 * 60 * 60 * 1000); // Cada 3 horas
// setTimeout(periodicSessionGarbageCollector, 5 * 60 * 1000); // Ejecutar una vez al inicio

baseLogger.info(`[👍 HIJO ${process.pid}] Supervisor de sesión listo (Modo Hijo).`);