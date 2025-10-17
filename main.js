// --- Dependencias principales ---
const cluster = require('cluster');
const TelegramBot = require('node-telegram-bot-api');
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
const { getPrefix } = require('./lib/prefixHandler.js');
dotenv.config();

// --- Manejador de Órdenes del Proceso Maestro ---
process.on('message', (message) => {
    if (message.type === 'START_SESSION') {
        console.log(`[📥] Clon ${process.pid} recibió orden para iniciar sesión: ${message.telegram_id}/${message.whatsapp_number}`);
        startSession(message.telegram_id, message.whatsapp_number);
    }
});

// --- Variables Globales ---
const activeSessions = {};
const userStates = {};
const sessions = new Map();
const retryCounters = new Map();
const maxRetries = 10;

// --- Inicialización de Telegram (Solo en el Worker Maestro) ---
let bot;
if (!cluster.isWorker || cluster.worker.id === 1) {
    console.log(`[🤖] Worker ${process.pid} asignado como JEFE DE TELEGRAM.`);
    const TOKEN = process.env.BOT_TOKEN || '8470263467:AAEwJKUW_fYF1neu-Kwgspgdwn6xMeNHTec';
    bot = new TelegramBot(TOKEN, { polling: true });

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

// --- NUEVA FUNCIÓN DE RECONEXIÓN ---
function reconnectSession(telegram_id, number) {
    const sessionId = `${telegram_id}-${number}`;
    const currentAttempt = (retryCounters.get(sessionId) || 0) + 1;

    if (currentAttempt > maxRetries) {
        console.log(`[❌] Límite de reintentos alcanzado para ${number}. Limpiando sesión.`);
        cleanSession(telegram_id, true, true);
        return;
    }

    retryCounters.set(sessionId, currentAttempt);
    const delay = Math.pow(2, currentAttempt) * 3000 + Math.random() * 1000;
    console.log(`[🔄] Programando reconexión para ${number} en ${Math.round(delay / 1000)}s... (Intento ${currentAttempt}/${maxRetries})`);
    
    setTimeout(() => {
        console.log(`[▶️] Ejecutando reconexión para ${number}...`);
        startSession(telegram_id, number);
    }, delay);
}


/**
 * Inicia o reanuda una sesión de WhatsApp.
 */
async function startSession(telegram_id, number) {
    const sessionId = `${telegram_id}-${number}`;
    const sessionPath = path.join(__dirname, 'lib', 'pairing', String(telegram_id), number);

    if (sessions.has(sessionId)) {
        console.log(`[⚠️] Intento de iniciar una sesión que ya está en el mapa. Proceso detenido para evitar duplicados.`);
        return;
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const store = makeInMemoryStore({
        logger: pino().child({ level: 'silent', stream: 'store' })
    });

    const conn = simple({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: Browsers.windows("Chrome"),
        version: [2, 3000, 1025190524],
        connectTimeoutMs: 30000,
        getMessage: async key => (store.loadMessage(key.remoteJid, key.id) || {}).message || proto.Message.fromObject({})
    });
    
    sessions.set(sessionId, conn);
    store.bind(conn.ev);

    if (!conn.authState.creds.registered) {
        setTimeout(async () => {
            if (!sessions.has(sessionId)) return; // Si la sesión fue eliminada, no continuar
            try {
                let code = await conn.requestPairingCode(number);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });
                fs.writeFileSync(path.join(sessionPath, 'pairing.json'), JSON.stringify({ code }));
                console.log(`[✓] Código generado para ${number}: ${code}`);
            } catch (e) {
                console.error(`[!] Error generando código para ${number}:`, e.message);
                if (sessions.has(sessionId)) { // Solo limpiar si la sesión aún existe
                   await cleanSession(telegram_id, false, true);
                }
            }
        }, 3000);
    }

    // --- Manejador de Conexión Definitivo ---
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        // Si la conexión se abre, todo está bien. Reiniciamos contadores.
        if (connection === 'open') {
            console.log(`[✅] Conexión establecida y estabilizada para ${number}.`);
            retryCounters.set(sessionId, 0);
            activeSessions[telegram_id] = conn;
            return;
        }

        // Si la conexión se cierra, analizamos la causa.
        if (connection === 'close') {
            // Eliminamos la sesión del mapa AHORA para permitir que una reconexión la cree de nuevo.
            sessions.delete(sessionId);
            
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reason = DisconnectReason[statusCode] || 'Razón desconocida';

            const unrecoverableStatusCodes = [
                DisconnectReason.loggedOut,
                DisconnectReason.connectionReplaced,
                DisconnectReason.badSession
            ];

            if (unrecoverableStatusCodes.includes(statusCode)) {
                console.log(`[🚫] Cierre definitivo para ${number}. Razón: ${reason}. Limpiando...`);
                await cleanSession(telegram_id, true, true);
            } else {
                console.log(`[🔌] Conexión cerrada para ${number}. Razón: ${reason}.`);
                // En lugar de llamar a startSession directamente, llamamos a nuestra función controlada.
                reconnectSession(telegram_id, number);
            }
        }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async chatUpdate => {
        const mek = chatUpdate.messages[0];
        if (!mek.message || mek.key.remoteJid === 'status@broadcast') return;
        
        const m = smsg(conn, mek, store);
        const user = await usersDB.findUserByWhatsapp(m.sender.split('@')[0]);
        const prefix = user ? getPrefix(user.telegram_id) : '?';
        
        require("./baron.js")(conn, m, chatUpdate, store, prefix);
    });

    return conn;
}


async function cleanSession(telegram_id, notifyUser = false, fullClean = false) {
    const user = await usersDB.getUser(telegram_id);
    const whatsappNumber = user?.whatsapp_number;
    const sessionId = `${telegram_id}-${whatsappNumber}`;

    // Limpiamos todos los registros de esta sesión
    if (activeSessions[telegram_id]) delete activeSessions[telegram_id];
    if (sessions.has(sessionId)) sessions.delete(sessionId);
    if (retryCounters.has(sessionId)) retryCounters.delete(sessionId);

    if (whatsappNumber && fullClean) {
        const sessionPath = path.join(__dirname, 'lib', 'pairing', String(telegram_id), whatsappNumber);
        if (fs.existsSync(sessionPath)) {
            try {
                fs.rmSync(sessionPath, { recursive: true, force: true });
                await usersDB.clearUserWhatsapp(telegram_id);
                console.log(`[🧹] Limpieza completa de sesión para ${whatsappNumber}.`);
            } catch (error) {
                console.error('[❌] Error en limpieza completa:', error.message);
            }
        }
    }

    if (notifyUser && bot) {
        try {
            await bot.sendMessage(telegram_id, '⚠️ Tu sesión de WhatsApp fue cerrada y necesita ser reconectada.');
        } catch (e) {
            console.error('[❌] Error al notificar:', e.message);
        }
    }
    return true;
}

// ... (El recolector de basura puede quedar igual) ...

console.log('Telegram x Baileys conectado com sucesso');

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