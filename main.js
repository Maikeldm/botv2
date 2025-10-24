// main.js (¡¡COMPLETO Y FINAL v8!! TESTE.JS BASE + PREFIJO '?' + HILOS + PING SIMPLE + RECONEXIÓN DIOS + fromMe FIX + TU RECOLECTOR + CERO PINO)

// --- Dependencias (SIN PINO) ---
const fs = require('fs');
const path = require('path');
const pino = require('pino'); // <-- ELIMINADO
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
const TaskQueue = require('./lib/taskQueue.js'); //
const heavyCommandsSet = require('./lib/heavyCommands.js'); // <-- La Partitura
const baronHandler = require("./baron.js"); // <-- El Mensajero
const { bug } = require('./travas/bug.js'); // <-- Assets para hilos
const { bugUrl } = require('./travas/bugUrl.js'); // <-- Assets para hilos

dotenv.config();

// --- Loggers -> USAMOS CONSOLE ---
// Ya no necesitamos baseLogger, silentLogger, garbageLogger de pino

// --- Manejadores Globales (Usando console.error) ---
// Limpiar listeners pre-main para evitar duplicados
process.removeAllListeners('uncaughtException');
process.removeAllListeners('unhandledRejection');
process.on('uncaughtException', (err, origin) => {
    console.error(`[!!! FATAL UNCAUGHT HIJO ${process.pid} !!!]`, err, 'Origin:', origin);
    // Considerar salir: process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error(`[!!! FATAL UNHANDLED HIJO ${process.pid} !!!]`, reason, 'Promise:', promise);
});
process.setMaxListeners(0); // Ilimitados

// --- Manejador de Órdenes (Tu Lógica con console.log) ---
process.on('message', (message) => {
    if (message.type === 'START_SESSION') {
        console.log(`[📥 HIJO ${process.pid}] Recibió orden para iniciar: ${message.telegram_id}/${message.whatsapp_number}`);
        startSession(message.telegram_id, message.whatsapp_number);
    }
    if (message.type === 'CLEAN_SESSION') {
        console.log(`[🧹 HIJO ${process.pid}] Recibió orden de limpieza para: ${message.telegram_id}`);
        // Pasar logger simulado a cleanSession
        cleanSession(message.telegram_id, message.notifyUser, message.fullClean, {
            error: (...args) => console.error(`[CLEAN_ERR ${message.telegram_id}]`, ...args),
            info: (...args) => console.log(`[CLEAN ${message.telegram_id}]`, ...args),
            warn: (...args) => console.warn(`[CLEAN_WARN ${message.telegram_id}]`, ...args),
            fatal: (...args) => console.error(`[CLEAN_FATAL ${message.telegram_id}]`, ...args), // Añadido fatal
            debug: (...args) => {}, // Ignorar debug
            child: function() { return this; } // Devolver a sí mismo
        });
        setTimeout(() => { console.log(`[HIJO ${process.pid}] Limpieza OK. Saliendo.`); process.exit(0); }, 3000); // 3s
    }
});

// --- Variables Globales ---
const activeSessions = {}; // Compatibilidad
const sessions = new Map(); // Guardará { conn, intervalId, taskQueue, logger: fakeConsoleLogger } //! logger es el fake
const retryCounters = new Map();
const maxRetries = 10;

console.log(`[HIJO ${process.pid}] main.js cargado, esperando órdenes...`); // Tu log inicial

// --- Reconexión (¡¡CORREGIDA v7!! Usa console) ---
function reconnectSession(telegram_id, number) {
    // Asegurar ID como string
    const stringId = String(telegram_id);
    const sessionId = `${stringId}-${number}`;
    // Usar console directamente o logger simulado si es necesario
    const logger = sessions.get(sessionId)?.logger || { // Logger simulado BÁSICO
        error: (...args) => console.error(`[RECONNECT_ERR ${sessionId}]`, ...args),
        info: (...args) => console.log(`[RECONNECT ${sessionId}]`, ...args),
        warn: (...args) => console.warn(`[RECONNECT_WARN ${sessionId}]`, ...args),
        fatal: (...args) => console.error(`[RECONNECT_FATAL ${sessionId}]`, ...args),
        debug: (...args) => {},
        child: function() { return this; }
    };

    const currentAttempt = (retryCounters.get(sessionId) || 0) + 1;
    logger.info(`Iniciando intento de reconexión ${currentAttempt}/${maxRetries} para ${number}`);

    if (currentAttempt > maxRetries) {
        logger.error(`[❌] Límite reintentos (${maxRetries}) alcanzado para ${number}. Limpiando sesión AHORA.`);
        cleanSession(stringId, true, true, logger); // Full clean y notificar (usar stringId y logger simulado)
        return; // Detener
    }

    retryCounters.set(sessionId, currentAttempt);
    const delay = Math.pow(2, currentAttempt) * 3000 + Math.random() * 1000; // Backoff
    logger.info(`[🔄] Reconectando ${number} en ~${Math.round(delay / 1000)}s (Intento ${currentAttempt}/${maxRetries})`);
    setTimeout(() => {
        // Volver a verificar si la sesión AÚN existe antes de reconectar
        if (sessions.has(sessionId)) {
            logger.info(`[▶️] Ejecutando reconexión para ${number}...`);
            startSession(stringId, number); // Reintentar (usar stringId)
        } else {
            logger.warn(`[!] Reconexión para ${number} cancelada (sesión limpiada mientras esperaba).`);
        }
    }, delay);
}

const heavyAssets = {
    ios4: fs.readFileSync('./travas/ios4.js'),
    ios7: fs.readFileSync('./travas/ios7.js'),
    ios6: fs.readFileSync('./travas/ios6.js'),
    travadoc: fs.readFileSync('./travas/travadoc.js'),
    telapreta: `${bug}`,
    bugUrl: bugUrl,
    thumbJpg: fs.readFileSync('./media/thumb.jpg'),
    olaJpg: fs.readFileSync('./media/ola.jpg'),
    fotoJpg: fs.readFileSync('./src/foto.jpg'),
    crashZip: fs.readFileSync('./travas/crash.zip'),
    ZeppImg: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/AzXg4GAWjAQAACDAAABeUhb3AAAAAElFTkSuQmCC",
        "base64"
    )
};
// --- Iniciar Sesión (Carga Diferida + Logger Falso + Ping Simple + Fix Limpieza Previa) ---
async function startSession(telegram_id, number) {
    // Asegurar IDs como strings
    const stringId = String(telegram_id);
    const sessionId = `${stringId}-${number}`;
    const sessionPath = path.join(__dirname, 'lib', 'pairing', stringId, number);

    // --- Logger Falso (Creado aquí, solo para internos) --- //! CERO PINO
    // Crear un objeto simple que simula pino para pasar a TaskQueue/baron.js
    const fakeConsoleLogger = {
        _sessionId: sessionId, // Guardar sessionId para contexto
        info: (...args) => console.log(`[INFO ${sessionId}]`, ...args),
        warn: (...args) => console.warn(`[WARN ${sessionId}]`, ...args),
        error: (...args) => console.error(`[ERROR ${sessionId}]`, ...args),
        fatal: (...args) => console.error(`[FATAL ${sessionId}]`, ...args),
        debug: (...args) => {}, // IGNORAR DEBUG por defecto
        // debug: (...args) => console.log(`[DEBUG ${sessionId}]`, ...args), // Descomentar si necesitas debug
        child: function(bindings = {}) { // Simular .child()
            const childLogger = {...this}; // Copiar métodos
            childLogger._bindings = {...(this._bindings || {}), ...bindings}; // Fusionar bindings
            // Sobrescribir métodos para incluir bindings
            for (const level of ['info', 'warn', 'error', 'fatal', 'debug']) {
                childLogger[level] = (...args) => {
                    const prefix = `[${level.toUpperCase()} ${this._sessionId}${bindings.module ? `/${bindings.module}`:''}]`;
                    // Comprobar si el primer argumento es un objeto (como en pino)
                    if (typeof args[0] === 'object' && args[0] !== null && !(args[0] instanceof Error)) {
                         console[level === 'fatal' ? 'error' : (level === 'debug' ? 'log' : level)](prefix, JSON.stringify({...childLogger._bindings, ...args[0]}), ...args.slice(1));
                    } else {
                        console[level === 'fatal' ? 'error' : (level === 'debug' ? 'log' : level)](prefix, JSON.stringify(childLogger._bindings), ...args);
                    }
                };
            }
            return childLogger;
        }
    };
    sessionLogger = fakeConsoleLogger; // Asignar global (el logger falso)

    console.log(`[HIJO ${process.pid}] Iniciando startSession para ${number}...`); // Tu Log
    fakeConsoleLogger.info('Iniciando startSession...'); // Log Falso

    // Verificar si ya existe Y está conectada
    const existingSession = sessions.get(sessionId);
    if (existingSession && existingSession.conn?.ws?.readyState === 1) { // 1 = OPEN
       console.log(`[⚠️ HIJO ${process.pid}] Sesión ${number} ya existe y conectada. Detenido.`);
       fakeConsoleLogger.warn(`Intento de iniciar sesión ${number} ya conectada.`);
       return;
    }
    // Limpiar superficialmente si existe pero no conectada
    if (existingSession) {
        console.log(`[⚠️ HIJO ${process.pid}] Sesión ${number} existía (estado: ${existingSession.conn?.ws?.readyState}). Limpiando antes...`);
        fakeConsoleLogger.warn(`Sesión ${number} existía (estado: ${existingSession.conn?.ws?.readyState}). Limpiando antes...`);
        await cleanSession(stringId, false, false, fakeConsoleLogger); // Limpieza superficial
    }

    // --- Auth y Store (Tu Config) ---
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    // Usar logger silencioso para store, como en tu teste.js
    const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

    // --- Conexión (Tu Config) ---
    const conn = simple({
        logger: pino({ level: 'silent' }), auth: state, // Tu logger silencioso
        browser: Browsers.windows("Chrome"), version: [2, 3000, 1025190524], // Tu config
        connectTimeoutMs: 60000,
        getMessage: async key => (store.loadMessage(key.remoteJid, key.id) || {}).message || proto.Message.fromObject({})
    });
    store.bind(conn.ev);

    // --- Ping Simple (Tu Lógica Original) ---
    const keepAliveInterval = setInterval(() => {
        const currentSessionData = sessions.get(sessionId);
        if (currentSessionData?.conn) {
            try { currentSessionData.conn.fetchBlocklist(); } catch (e) { console.error(`[HIJO ${process.pid}] Error Ping ${number}:`, e.message); }
        } else { clearInterval(keepAliveInterval); }
    }, 25 * 1000); // 45s

    // --- Cola de Tareas (Carga Diferida + Logger Falso) ---
    let TaskQueue;
    let taskQueue;
    try {
        TaskQueue = require('./lib/taskQueue.js'); // //! REQUIRE DIFERIDO
        taskQueue = new TaskQueue(conn, fakeConsoleLogger.child({ module: 'TaskQueue' })); // Usa logger FALSO
        console.log(`[HIJO ${process.pid}] Cola de tareas iniciada para ${number}.`); // Tu log
        fakeConsoleLogger.info(`Cola de tareas iniciada (${taskQueue.MAX_WORKERS} hilos).`); // Log Falso
    } catch (e) {
        console.error(`[!!! FATAL HIJO ${process.pid} !!!] Error al cargar/iniciar TaskQueue:`, e);
        fakeConsoleLogger.fatal(e, "Error FATAL al cargar/iniciar TaskQueue"); // Log Falso
        if (keepAliveInterval) clearInterval(keepAliveInterval);
        try { conn.end(new Error("Fallo al iniciar TaskQueue")); } catch (e2) {}
        return; // Detener startSession
    }

    // --- Guardar Estado ---
    sessions.set(sessionId, { conn, intervalId: keepAliveInterval, taskQueue, logger: fakeConsoleLogger }); //! Guardamos TODO (logger falso)
    activeSessions[telegram_id] = conn; // Compatibilidad (¿usar stringId?)

    // --- Pairing (Tu Lógica con console.log) ---
    if (!conn.authState.creds.registered) {
       console.log(`[HIJO ${process.pid}] Sesión ${number} no registrada. Solicitando código...`);
       fakeConsoleLogger.info('Sesión no registrada. Solicitando código...'); // Log Falso
        setTimeout(async () => {
            if (!sessions.has(sessionId)) { fakeConsoleLogger.warn("Pairing cancelado: Sesión ya no existe."); return; }
            try {
                let code = await conn.requestPairingCode(number);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });
                fs.writeFileSync(path.join(sessionPath, 'pairing.json'), JSON.stringify({ code }));
                console.log(`[✓ HIJO ${process.pid}] Código generado para ${number}: ${code}`); // Tu Log
                fakeConsoleLogger.info(`[✓] Código generado para ${number}: ${code}`); // Log Falso
            } catch (e) {
                console.error(`[!] HIJO ${process.pid}] Error crítico generando código para ${number}:`, e.message); // Tu Log
                fakeConsoleLogger.error(e, `[!] Error crítico generando código para ${number}. Limpiando...`); // Log Falso
                await cleanSession(stringId, false, true, fakeConsoleLogger); // Usar stringId y logger falso
            }
        }, 3000); // Tu delay
    }

    // --- Manejador de Conexión (Tu Lógica + Destruir TaskQueue + RECONEXIÓN FIX v7) ---
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        // Obtener logger actualizado (falso) o usar el creado en startSession
        const currentLogger = sessions.get(sessionId)?.logger || fakeConsoleLogger;

        if (connection === 'open') {
            console.log(`[✅ HIJO ${process.pid}] Conexión estabilizada para ${number}.`); // Tu log
            currentLogger.info(`[✅] Conexión estabilizada para ${number}.`);
            retryCounters.set(sessionId, 0); // Resetear reintentos
            activeSessions[telegram_id] = conn; // Tu lógica (¿usar stringId?)
        } else if (connection === 'close') {
            const sessionData = sessions.get(sessionId); // Obtener datos ANTES de decidir si borrar
            // Detener Ping y Hilos (SOLO SI LA SESIÓN EXISTE EN EL MAPA)
            if (sessionData) {
                if (sessionData.intervalId) { clearInterval(sessionData.intervalId); console.log(`[HIJO ${process.pid}] Ping detenido por cierre.`); }
                if (sessionData.taskQueue) { sessionData.taskQueue.destroy(); console.log(`[HIJO ${process.pid}] TaskQueue detenida por cierre.`); }
                // //! NO BORRAMOS sessions.delete(sessionId) AQUÍ AÚN
            }
            if (activeSessions[telegram_id]) delete activeSessions[telegram_id]; // Limpiar compatibilidad (¿usar stringId?)

            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reason = DisconnectReason[statusCode] || `Desconocido (${statusCode})`;
            console.warn(`[HIJO ${process.pid}] Conexión CERRADA para ${number}. Razón: ${reason}. Error: ${lastDisconnect?.error?.message}`); // Tu Log
            currentLogger.warn({ statusCode, reason, error: lastDisconnect?.error?.message }, 'Conexión CERRADA.'); // Log Falso

            const unrecoverableCodes = [DisconnectReason.loggedOut, DisconnectReason.connectionReplaced, DisconnectReason.badSession];

            // SI ES IRRECUPERABLE -> Limpia la sesión (que la borrará del mapa 'sessions')
            if (unrecoverableCodes.includes(statusCode)) {
                console.error(`[🚫 HIJO ${process.pid}] Cierre IRRECUPERABLE (${reason}). Limpiando TODO.`); // Tu Log
                currentLogger.error(`[🚫] Cierre IRRECUPERABLE (${reason}). Limpiando TODO.`); // Log Falso
                await cleanSession(stringId, true, true, currentLogger); // Full clean AQUI (usar stringId y logger falso)
            }
            // SI ES RECUPERABLE -> Intenta reconectar (la sesión sigue en el mapa 'sessions' por ahora)
            else {
                 console.log(`[🔌 HIJO ${process.pid}] Conexión perdida (${reason}). Intentando reconexión...`); // Tu Log
                 currentLogger.info(`[🔌] Conexión perdida (${reason}). Intentando reconexión...`); // Log Falso
                 // //! CORRECCIÓN RECONEXIÓN v7: LLAMAR A reconnectSession SIN CHEQUEOS PENDEJOS
                 reconnectSession(stringId, number); // Llamar a reconectar SIEMPRE (usar stringId)
            }
        }
    });

    // --- Guardado Credenciales ---
    conn.ev.on('creds.update', saveCreds);

    // --- Manejador de Mensajes (Prefijo Global '?' + Hilos + FIX fromMe) ---
    conn.ev.on('messages.upsert', async (chatUpdate) => {
        const mek = chatUpdate.messages[0];
        // Usar logger falso SIEMPRE que esté disponible
        const currentLogger = sessions.get(sessionId)?.logger || fakeConsoleLogger;

        // FILTRO INICIAL (CORREGIDO v7)
        if (!mek.message || mek.key.remoteJid === 'status@broadcast' || !mek.messageTimestamp) return;

        const senderId = mek.key.remoteJid.endsWith('@g.us') ? mek.key.participant : mek.key.remoteJid;
        if (!senderId) {
            console.warn(`[HIJO ${process.pid}] No se pudo determinar senderId`, mek.key); // Tu log
            currentLogger.warn({ key: mek.key }, 'No se pudo determinar senderId'); // Log Falso
            return;
        }

        const body = mek.message?.conversation || mek.message?.extendedTextMessage?.text ||
                     mek.message?.imageMessage?.caption || mek.message?.videoMessage?.caption || "";

        if (!body) return; // Ignorar sin texto

        const senderKey = senderId.split('@')[0];
        // Log DEBUG opcional con logger falso (descomentar en logger falso si se necesita)
        // currentLogger.debug(`MSG IN <-- [${senderKey}] Body: "${body.substring(0, 50)}..."`);

        // =======================================================
        //           FILTRO GLOBAL SIMPLIFICADO (?)
        // =======================================================
        const GLOBAL_PREFIX = '?';
        let prefix = null;
        let isCmd = false;

        if (body.startsWith(GLOBAL_PREFIX)) {
            isCmd = true;
            prefix = GLOBAL_PREFIX;
            console.log(`[HIJO ${process.pid}] Comando detectado: ${body}`); // TU LOG
            currentLogger.info(`✅ COMANDO DETECTADO! Prefijo: '${prefix}', Sender: ${senderKey}`); // Log Falso
        }
        // else { // Log DEBUG opcional
             // currentLogger.debug(`NO MATCH: Prefijo ('${GLOBAL_PREFIX}') vs Body`);
        // }

        if (!isCmd) return;
        // =======================================================

        // ¡ES COMANDO!
        const m = smsg(conn, mek, store);
        const sessionData = sessions.get(sessionId);
        if (!sessionData) {
            console.warn(`[HIJO ${process.pid}] Comando OK (${body}), pero sesión ${sessionId} murió.`); // Tu Log
            currentLogger.warn(`Comando OK (${body}), pero sesión ${sessionId} murió.`); // Log Falso
            return;
        }
if (heavyCommandsSet.has(command)) {
            currentLogger.info({ cmd: command, user: senderId }, 'Encolando comando pesado (detectado por main.js)...');
            
            const m = smsg(conn, mek, store); // Crear 'm'
            const m_lite = { key: m.key, chat: m.chat, sender: m.sender, isGroup: m.isGroup, message: m.message, pushName: m.pushName, text: m.text };
            
            const taskContext = {
                command: command,
                target: m.chat, // (redundante con m_lite, pero 'heavyTasks' lo usa)
                q: m.text.split(' ').slice(1).join(' '),
                args: m.text.split(' ').slice(1),
                text: m.text,
                sender: m.sender,
                assets: heavyAssets, // <-- Pasa los assets pre-cargados
                m: m_lite // <-- Pasa el 'm' al hilo
            };

            sessionData.taskQueue.updateContext(m_lite); //
            sessionData.taskQueue.enqueue(taskContext); //
            
            conn.sendMessage(m.chat, { react: { text: "⚙️", key: m.key } });
            
            return; // ¡¡Importante!! Terminamos aquí.
        }
        // m_lite para worker
        const m_lite = { key: m.key, chat: m.chat, sender: m.sender, isGroup: m.isGroup, message: m.message, pushName: m.pushName, text: m.text };
        if (sessionData.taskQueue) { sessionData.taskQueue.updateContext(m_lite); }
        else {
            console.error(`[!! FATAL HIJO ${process.pid} !!] sessionData.taskQueue no existe para ${sessionId}`); // Tu Log
            currentLogger.fatal(`sessionData.taskQueue no existe para ${sessionId}`); // Log Falso
            return;
        }

        // Llamar a baron.js
        // currentLogger.debug('-> Llamando a baron.js...'); // Log Falso DEBUG opcional
        try {
            // Ya no pasamos taskQueue a baron.js
            await baronHandler(
                conn, m, chatUpdate, store, prefix,
                currentLogger.child({ module: 'baron' }) 
            );
        } catch (baronError) {
             currentLogger.error(baronError, "!! ERROR DENTRO DE baron.js !!");
        }
    }); // Fin messages.upsert

    // Mensaje final (Tu Mensaje)
    console.log(`[👍 HIJO ${process.pid}] Telegram x Baileys conectado com sucesso (Modo Hijo)`);

    return conn; // Devuelve la conexión
} // Fin startSession


// --- Función de Limpieza (¡¡CORREGIDA v7 y REFORZADA!!) ---
async function cleanSession(telegram_id, notifyUser = false, fullClean = false, logger = null) {
    // Usa logger pasado, búscalo activamente, o simula con console
    // Asegurar que telegram_id es string
    const stringId = String(telegram_id);
    const currentLogger = logger || findLoggerByTelegramIdFromMap(stringId) || { /* logger simulado */ };

    let whatsappNumber = null;
    let sessionId = `${stringId}-unknown`; // Default
    try {
        const user = await usersDB.getUser(stringId); // Usar stringId
        whatsappNumber = user?.whatsapp_number;
        if(whatsappNumber) sessionId = `${stringId}-${whatsappNumber}`;
    } catch (e) { currentLogger.error(e, `Error obteniendo user ${stringId} en cleanSession`); }

    currentLogger.info(`[🧹] Iniciando cleanSession para ${stringId} (${sessionId}) (Notify: ${notifyUser}, Full: ${fullClean})`);

    // 1. Detener procesos activos SOLO SI LA SESIÓN EXISTE en el mapa
    const sessionData = sessions.get(sessionId);
    if (sessionData) {
        currentLogger.info(`Deteniendo procesos para sesión activa ${sessionId}...`);
        try {
            if (sessionData.intervalId) { clearInterval(sessionData.intervalId); currentLogger.info('Ping detenido.'); }
            if (sessionData.taskQueue) { sessionData.taskQueue.destroy(); currentLogger.info('TaskQueue detenida.'); }
            if (sessionData.conn && (sessionData.conn.ws?.readyState === 1 || sessionData.conn.ws?.readyState === 0)) {
                 sessionData.conn.end(new Error('Sesión limpiada manualmente.'));
                 currentLogger.info('Cierre de conexión Baileys iniciado.');
            } else { currentLogger.info('Conexión Baileys ya cerrada/inexistente.'); }
        } catch (e) { currentLogger.warn(e, 'Error menor durante cierre.'); }
        // //! BORRAR DEL MAPA DESPUÉS de intentar parar
        sessions.delete(sessionId);
        currentLogger.info(`Sesión ${sessionId} eliminada del mapa 'sessions'.`);
    } else {
         currentLogger.warn(`cleanSession: Sesión ${sessionId} no encontrada en mapa 'sessions'.`);
    }
     // Limpiar compatibilidad (usar stringId)
     if (activeSessions[stringId]) delete activeSessions[stringId];

    // 2. Limpiar reintentos
    if (retryCounters.has(sessionId)) {
        retryCounters.delete(sessionId);
        currentLogger.info(`Contador de reintentos limpiado para ${sessionId}.`);
    }

    // 3. Limpieza Profunda (Tu lógica original con logs)
    if (whatsappNumber && fullClean) {
        const sessionPath = path.join(__dirname, 'lib', 'pairing', stringId, whatsappNumber); // Usar stringId
        console.log(`[HIJO ${process.pid}] Intentando borrado completo de: ${sessionPath}`); // Tu Log
        currentLogger.info(`Intentando borrado completo de: ${sessionPath}`); // Log Falso
        if (fs.existsSync(sessionPath)) {
            try {
                fs.rmSync(sessionPath, { recursive: true, force: true }); // Borrar carpeta
                currentLogger.info(`Carpeta ${sessionPath} borrada.`);
                try { // DB
                    await usersDB.clearUserWhatsapp(stringId); // Limpiar DB (usar stringId)
                    console.log(`[🧹 HIJO ${process.pid}] Limpieza completa OK para ${whatsappNumber}.`); // Tu Log
                    currentLogger.info(`[✔️] Limpieza COMPLETA (Archivos y DB) OK para ${whatsappNumber}.`); // Log Falso
                } catch (dbError) {
                    console.error(`[❌ HIJO ${process.pid}] Error limpiando DB ${whatsappNumber}:`, dbError.message); // Tu Log
                    currentLogger.error(dbError, `[❌] Error limpiando DB ${whatsappNumber}`); // Log Falso
                }
            } catch (folderError) {
                console.error(`[❌ HIJO ${process.pid}] Error borrando carpeta ${sessionPath}:`, folderError.message); // Tu Log
                currentLogger.error(folderError, `[❌] Error borrando carpeta ${sessionPath}`); // Log Falso
                 try { await usersDB.clearUserWhatsapp(stringId); } catch(e){}
            }
        } else {
             console.warn(`[HIJO ${process.pid}] Carpeta ${sessionPath} no existía.`); // Tu Log
             currentLogger.warn(`Carpeta ${sessionPath} no existía.`); // Log Falso
             try { await usersDB.clearUserWhatsapp(stringId); } catch(e){}
        }
    } else if (whatsappNumber) { // Superficial
         console.log(`[HIJO ${process.pid}] Limpieza superficial para ${whatsappNumber}.`); // Tu Log
         currentLogger.info(`Limpieza superficial para ${whatsappNumber}.`); // Log Falso
    } else if (fullClean) { // Full sin número
         console.warn(`[HIJO ${process.pid}] Limpieza completa para ${stringId} sin número.`); // Tu Log
         currentLogger.warn(`Limpieza completa para ${stringId} sin número.`); // Log Falso
         try { await usersDB.clearUserWhatsapp(stringId); } catch(e){}
    }

    return true;
}


// --- Recolector de Basura (Tu lógica detallada con console) --- //! CERO PINO
async function periodicSessionGarbageCollector() {
    console.log(`[♻️ HIJO ${process.pid}] Ejecutando recolector de basura...`); // Tu log
    const pairingDir = path.join(__dirname, 'lib', 'pairing');
    if (!fs.existsSync(pairingDir)) return;

    let totalDeletedPreKeys = 0; let totalDeletedTemps = 0; let totalErrors = 0;
    try {
        const userDirs = fs.readdirSync(pairingDir);
        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        const PRE_KEY_POOL_SIZE = 30;

        for (const userDir of userDirs) {
            const numberDirsPath = path.join(pairingDir, userDir);
            try { if (!fs.lstatSync(numberDirsPath).isDirectory()) continue; } catch (e) { continue; } // Ignorar errores lstat

            const numberDirs = fs.readdirSync(numberDirsPath);
            for (const numberDir of numberDirs) {
                const sessionPath = path.join(numberDirsPath, numberDir);
                 try { if (!fs.lstatSync(sessionPath).isDirectory()) continue; } catch (e) { continue; } // Ignorar errores lstat

                try { // Procesar sesión
                    const files = fs.readdirSync(sessionPath);
                    let stats = { preKeys: 0, tempFiles: 0, errors: 0 };

                    // --- Gestión pre-keys ---
                    const preKeyFiles = files.filter(f => f.startsWith('pre-key-')).map(f => {const match = f.match(/pre-key-(\d+)/);return {name: f,num: match ? parseInt(match[1]) : 0,path: path.join(sessionPath, f)};}).filter(f => !isNaN(f.num)).sort((a, b) => b.num - a.num);
                    if (preKeyFiles.length > PRE_KEY_POOL_SIZE) {
                        const toDelete = preKeyFiles.slice(PRE_KEY_POOL_SIZE);
                        for (const file of toDelete) { try { fs.unlinkSync(file.path); stats.preKeys++; } catch (e) { stats.errors++; console.error(`[GC Error ${process.pid}] Borrando pre-key ${file.name}:`, e.message);}} // Log error
                    }

                    // --- Limpieza temps ---
                    for (const file of files) {
                        if (['creds.json', 'pairing.json', 'signed-identity-key.json', 'signed-pre-key.json'].includes(file) || file.startsWith('pre-key-')) continue;
                        const isTempFile = ['sender-key-', 'app-state-sync-key-', 'app-state-sync-version-', 'session-', 'sender-key-memory-', 'signal-recipient-'].some(prefix => file.startsWith(prefix));
                        if (isTempFile) {
                            const filePath = path.join(sessionPath, file);
                            try { const stat = fs.statSync(filePath); if (now - stat.mtimeMs > TWENTY_FOUR_HOURS) { fs.unlinkSync(filePath); stats.tempFiles++; }} catch (e) { stats.errors++; console.error(`[GC Error ${process.pid}] Stat/unlink temp ${file}:`, e.message); continue; } // Log error
                        }
                    }
                    if (stats.preKeys > 0 || stats.tempFiles > 0) { console.log(`[♻️ HIJO ${process.pid}] Sesión ${userDir}/${numberDir}: ${stats.preKeys} pre-keys, ${stats.tempFiles} temps eliminados.`); totalDeletedPreKeys += stats.preKeys; totalDeletedTemps += stats.tempFiles;} // Tu log
                    if(stats.errors > 0) { totalErrors += stats.errors; }
                } catch (e) { totalErrors++; console.error(`[❌ HIJO ${process.pid}] Error procesando sesión ${sessionPath}:`, e.message); } // Tu log
            }
        }
    } catch (e) { totalErrors++; console.error(`[❌ HIJO ${process.pid}] Error grave en recolector:`, e.message); // Tu log
    } finally { console.log(`[♻️ HIJO ${process.pid}] Recolector finalizado. Borrado: ${totalDeletedPreKeys} pre-keys, ${totalDeletedTemps} temps. Errores: ${totalErrors}.`); } // Tu log
}

// --- Programar recolector ---
setInterval(periodicSessionGarbageCollector, 3 * 60 * 60 * 1000); // 3h
setTimeout(periodicSessionGarbageCollector, 5 * 60 * 1000);    // 5 min

// --- Exportar ---
module.exports = { startSession, cleanSession, activeSessions }; // Tu export