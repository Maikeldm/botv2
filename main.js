// --- Dependencias principales ---
const cluster = require('cluster');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const NodeCache = require('node-cache');
const simple = require('./lib/oke.js');
const smsg = require('./lib/smsg.js');
const {
    default: makeWASocket,
    Browsers,
    useMultiFileAuthState,
    DisconnectReason,
    makeInMemoryStore,
    jidDecode,
    proto,
    getContentType,
    downloadContentFromMessage,
    makeCacheableSignalKeyStore
} = require('baron-baileys-v2');
const usersDB = require('./lib/users.js');
const dotenv = require('dotenv');
const { getPrefix } = require('./lib/prefixHandler.js');
dotenv.config();

process.on('message', (message) => {
    if (message.type === 'START_SESSION') {
        console.log(`[📥] Clon ${process.pid} recibió orden para iniciar sesión: ${message.telegram_id}/${message.whatsapp_number}`);
        startSession(message.telegram_id, message.whatsapp_number);
    }
});

// --- Variables globales de estado ---
const activeSessions = {}; // Mapa de sesiones WhatsApp activas por telegram_id
const userStates = {};     // Estado de usuario para la interfaz Telegram

// --- Inicialización del bot de Telegram ---
if (!cluster.isWorker || cluster.worker.id === 1) {

    console.log(`[🤖] Worker ${process.pid} asignado como JEFE DE TELEGRAM.`);

    // --- Inicialización del bot de Telegram ---
    const TOKEN = process.env.BOT_TOKEN || '8364260541:AAFhFyFaSefD9kmRVtgDfi_69FG9A8Hk1DE'; // Recuerda cambiar esto
    const bot = new TelegramBot(TOKEN, { polling: true });

    // --- Integración modular con chocoplus.js ---
    const chocoplusHandler = require('./chocoplus.js');
    chocoplusHandler(bot, {
        userStates,
        activeSessions,
        cleanSession,
        startSession,
        updateUserWhatsapp: usersDB.updateUserWhatsapp,
        clearUserWhatsapp: usersDB.clearUserWhatsapp
    });
}

// --- Parámetros de reconexión ---
const maxRetries = 10;
const sessions = new Map();
const retryDelays = new Map();

/**
 * Inicia una sesión de WhatsApp para un usuario Telegram y número dado.
 * Configuración robusta para máxima estabilidad y persistencia.
 */
async function startSession(telegram_id, number) {
    const sessionId = `${telegram_id}-${number}`;
    const sessionPath = path.join(__dirname, 'lib', 'pairing', String(telegram_id), number);

    if (activeSessions[telegram_id]) return activeSessions[telegram_id];

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const store = makeInMemoryStore({
        logger: pino().child({ level: 'silent', stream: 'store' })
    });

    const conn = simple({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: Browsers.windows("Chrome"),
        version: [2, 3000, 1023223821],
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 15000,
        retryRequestDelayMs: 2000,
        phoneCheckOnCallback: true,
        emitOwnEvents: false,
        defaultQueryTimeoutMs: 30000,
        maxRetries: 5,
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        fireInitQueries: false,
        getMessage: async key => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg?.message || proto.Message.fromObject({});
            }
            return proto.Message.fromObject({});
        }
    });

    store.bind(conn.ev);

    // --- Generación de código de emparejamiento si la sesión es nueva ---
    if (!conn.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await conn.requestPairingCode(number);
                if (!code) throw new Error('No se pudo generar el código');
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                if (!fs.existsSync(sessionPath)) {
                    fs.mkdirSync(sessionPath, { recursive: true });
                }
                fs.writeFileSync(path.join(sessionPath, 'pairing.json'), JSON.stringify({ code }, null, 2));
                console.log(`[✓] Código generado para ${number}: ${code}`);
            } catch (e) {
                console.error('[!] Error generando código:', e);
            }
        }, 3000);
    }

    // --- Manejador de conexión "inmortal" ---
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        const sessionId = `${telegram_id}-${number}`;

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reason = lastDisconnect?.error?.message || 'Razón desconocida';

            // Códigos de error que indican un cierre definitivo y no se debe reintentar.
            const unrecoverableStatusCodes = [
                DisconnectReason.loggedOut,
                DisconnectReason.connectionReplaced,
                401, // Unauthorized
                403, // Forbidden
                440  // Connection Replaced
            ];

            if (unrecoverableStatusCodes.includes(statusCode)) {
                console.log(`[🚫] Cierre de sesión definitivo para ${number}. Razón: ${reason}. Limpiando sesión.`);
                await cleanSession(telegram_id, true, true);
                delete activeSessions[telegram_id];
                retryDelays.delete(sessionId); // Limpiar registro de reintentos
                return;
            }

            // Para todos los demás errores, iniciar protocolo de reintento inteligente.
            const maxAttempts = 10;
            const currentAttempt = (retryDelays.get(sessionId) || 0) + 1;

            console.log(`[🔌] Conexión cerrada para ${number}. Razón: ${reason}.`);

            if (currentAttempt <= maxAttempts) {
                retryDelays.set(sessionId, currentAttempt);

                // Exponential backoff con Jitter: (2^intento * 5 segundos) + un poco de aleatoriedad
                const delay = Math.pow(2, currentAttempt) * 5000 + Math.random() * 1000;
                
                console.log(`[🔄] Reintentando conexión en ${Math.round(delay / 1000)}s... (Intento ${currentAttempt}/${maxAttempts})`);

                setTimeout(() => startSession(telegram_id, number), delay);
            } else {
                console.log(`[❌] Límite de reintentos alcanzado para ${number}. La sesión no pudo ser recuperada.`);
                await cleanSession(telegram_id, true, true);
                delete activeSessions[telegram_id];
                retryDelays.delete(sessionId);
            }

        } else if (connection === 'open') {
            console.log(`[✅] Conexión establecida y estabilizada para ${number}.`);
            retryDelays.set(sessionId, 0); // Reiniciar contador de reintentos tras una conexión exitosa.
            activeSessions[telegram_id] = conn;
        }
    });

    conn.ev.on('creds.update', saveCreds);

    // --- Manejador de mensajes entrantes ---
    conn.ev.on('messages.upsert', async chatUpdate => {
        const mek = chatUpdate.messages[0];
        if (!mek.message) return;
        mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
        if (mek.key && mek.key.remoteJid === 'status@broadcast') return;
        if (!conn.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
        if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return;
    
        const m = smsg(conn, mek, store);
    
        // --- LÓGICA DE PREFIJO INTELIGENTE ---
        let prefix = '?'; // Prefijo por defecto
        const senderJid = m.sender.split('@')[0];
    
        // Buscar al usuario en la DB usando su número de WhatsApp
        const user = await usersDB.findUserByWhatsapp(senderJid);
    
        if (user) {
            // Si encontramos al usuario, obtenemos su prefijo personalizado
            prefix = getPrefix(user.telegram_id);
        }
    
        // Pasamos el prefijo correcto a baron.js
        require("./baron.js")(conn, m, chatUpdate, store, prefix);
    });

    return conn;
}

/**
 * Limpieza de sesión WhatsApp para un usuario Telegram.
 * Puede ser suave (archivos temporales) o forzada (elimina todo y desvincula).
 */
async function cleanSession(telegram_id, notifyUser = false, fullClean = false) {
    const user = await usersDB.getUser(telegram_id);
    const whatsappNumber = user?.whatsapp_number;

    if (activeSessions[telegram_id]) {
        try {
            activeSessions[telegram_id].ev.removeAllListeners();
        } catch (e) {
            console.error('[❌] Error al limpiar listeners:', e.message);
        }
        delete activeSessions[telegram_id];
    }

    if (whatsappNumber) {
        const sessionPath = path.join(__dirname, 'lib', 'pairing', String(telegram_id), whatsappNumber);

        if (fs.existsSync(sessionPath)) {
            try {
                if (fullClean) {
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                    await usersDB.clearUserWhatsapp(telegram_id);
                } else {
                    const files = fs.readdirSync(sessionPath);
                    for (const file of files) {
                        if (!['creds.json', 'pairing.json'].includes(file)) {
                            fs.unlinkSync(path.join(sessionPath, file));
                        }
                    }
                }
            } catch (error) {
                console.error('[❌] Error en limpieza:', error.message);
            }
        }
    }

    if (notifyUser && typeof bot !== 'undefined') {
        try {
            const message = fullClean
                ? '⚠️ Tu sesión de WhatsApp fue cerrada. Por favor, vuelve a conectar usando el menú.'
                : '⚡ Reconectando tu sesión... Por favor, espera.';
            await bot.sendMessage(telegram_id, message);
        } catch (e) {
            if (!e.message.includes('bot is not defined')) {
                 console.error('[❌] Error al notificar:', e.message);
            }
        }
    }

    return true;
}

/**
 * Recolector de basura inteligente para archivos de sesión.
 * Elimina pre-keys y archivos temporales antiguos, nunca toca archivos críticos.
 */
async function periodicSessionGarbageCollector() {
    console.log('[♻️] Ejecutando recolector de basura inteligente...');
    const pairingDir = path.join(__dirname, 'lib', 'pairing');
    if (!fs.existsSync(pairingDir)) return;

    const userDirs = fs.readdirSync(pairingDir);
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const PRE_KEY_POOL_SIZE = 30;

    for (const userDir of userDirs) {
        const numberDirsPath = path.join(pairingDir, userDir);
        if (!fs.lstatSync(numberDirsPath).isDirectory()) continue;

        const numberDirs = fs.readdirSync(numberDirsPath);
        for (const numberDir of numberDirs) {
            const sessionPath = path.join(numberDirsPath, numberDir);
            if (!fs.lstatSync(sessionPath).isDirectory()) continue;

            try {
                const files = fs.readdirSync(sessionPath);
                let stats = { preKeys: 0, tempFiles: 0, errors: 0 };

                // --- Gestión de pre-keys ---
                const preKeyFiles = files
                    .filter(f => f.startsWith('pre-key-'))
                    .map(f => ({
                        name: f,
                        num: parseInt(f.match(/pre-key-(\d+)/)?.[1] || '0'),
                        path: path.join(sessionPath, f)
                    }))
                    .sort((a, b) => b.num - a.num);

                if (preKeyFiles.length > PRE_KEY_POOL_SIZE) {
                    const toDelete = preKeyFiles.slice(PRE_KEY_POOL_SIZE);
                    for (const file of toDelete) {
                        try {
                            fs.unlinkSync(file.path);
                            stats.preKeys++;
                        } catch (e) {
                            stats.errors++;
                        }
                    }
                }

                // --- Limpieza de archivos temporales ---
                for (const file of files) {
                    if (file === 'creds.json' || file === 'pairing.json') continue;
                    const isTempFile = [
                        'sender-key-',
                        'app-state-sync-key-',
                        'app-state-sync-version-',
                        'session-'
                    ].some(prefix => file.startsWith(prefix));

                    if (isTempFile) {
                        const filePath = path.join(sessionPath, file);
                        try {
                            const stat = fs.statSync(filePath);
                            if (now - stat.mtimeMs > TWENTY_FOUR_HOURS) {
                                fs.unlinkSync(filePath);
                                stats.tempFiles++;
                            }
                        } catch (e) {
                            stats.errors++;
                            continue;
                        }
                    }
                }

                if (stats.preKeys > 0 || stats.tempFiles > 0) {
                    console.log(`[♻️] Sesión ${numberDir}:` +
                        (stats.preKeys ? ` ${stats.preKeys} pre-keys antiguas eliminadas.` : '') +
                        (stats.tempFiles ? ` ${stats.tempFiles} archivos temporales eliminados.` : '') +
                        (stats.errors ? ` ${stats.errors} errores encontrados.` : ''));
                }

            } catch (e) {
                console.error(`[❌] Error en sesión ${sessionPath}:`, e.message);
            }
        }
    }
}

// --- Programar recolector de basura cada 3 horas y al inicio ---
setInterval(periodicSessionGarbageCollector, 3 * 60 * 60 * 1000);
setTimeout(periodicSessionGarbageCollector, 5 * 60 * 1000);

// --- Mensaje final de inicio ---
console.log('Telegram x Baileys conectado com sucesso');

// --- Exportar funciones clave para otros módulos ---
module.exports = { startSession, cleanSession, userStates, activeSessions };