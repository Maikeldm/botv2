// --- Dependencias principales ---
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
// =======================================================
//        ¡CORRECCIÓN! USAMOS TU prefixHandler
// =======================================================
const { getPrefix } = require('./lib/prefixHandler.js'); // <--- ¡USAMOS ESTE!
dotenv.config();

// =======================================================
//        ¡BORRADO! No más prefijos de config.js
// =======================================================
// const globalPrefixes = require('./config.js').prefa || ['!', '.', '?']; // <-- ¡ELIMINADO!


// --- Manejador de Órdenes del Proceso Maestro ---
process.on('message', (message) => {
    if (message.type === 'START_SESSION') {
        console.log(`[📥 HIJO ${process.pid}] Recibió orden para iniciar: ${message.telegram_id}/${message.whatsapp_number}`);
        startSession(message.telegram_id, message.whatsapp_number);
    }
    if (message.type === 'CLEAN_SESSION') {
        console.log(`[🧹 HIJO ${process.pid}] Recibió orden de limpieza para: ${message.telegram_id}`);
        cleanSession(message.telegram_id, message.notifyUser, message.fullClean);
    }
});

// --- Variables Globales (SOLO DE ESTE HIJO) ---
const activeSessions = {};
const sessions = new Map(); // Ahora guardará { conn, intervalId }
const retryCounters = new Map();
const maxRetries = 10;

console.log(`[HIJO ${process.pid}] main.js cargado, esperando órdenes...`);


// --- NUEVA FUNCIÓN DE RECONEXIÓN ---
function reconnectSession(telegram_id, number) {
    const sessionId = `${telegram_id}-${number}`;
    const currentAttempt = (retryCounters.get(sessionId) || 0) + 1;

    if (currentAttempt > maxRetries) {
        console.log(`[❌ HIJO ${process.pid}] Límite de reintentos para ${number}. Limpiando.`);
        cleanSession(telegram_id, true, true); 
        return;
    }

    retryCounters.set(sessionId, currentAttempt);
    const delay = Math.pow(2, currentAttempt) * 3000 + Math.random() * 1000;
    console.log(`[🔄 HIJO ${process.pid}] Reconexión para ${number} en ${Math.round(delay / 1000)}s... (Intento ${currentAttempt}/${maxRetries})`);
    
    setTimeout(() => {
        console.log(`[▶️ HIJO ${process.pid}] Ejecutando reconexión para ${number}...`);
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
        console.log(`[⚠️ HIJO ${process.pid}] Intento de iniciar sesión duplicada: ${number}. Detenido.`);
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
    
    store.bind(conn.ev);

    // =======================================================
    //           FIX 1: PING ANTI-DESCONEXIÓN (Nivel 2)
    // =======================================================
    const keepAliveInterval = setInterval(() => {
        if (sessions.has(sessionId)) {
            try {
                conn.fetchBlocklist();
            } catch (e) {
                console.error(`[HIJO ${process.pid}] Error en Ping de vida para ${number}:`, e.message);
            }
        } else {
            clearInterval(keepAliveInterval); 
        }
    }, 45 * 1000); // 45 Segundos

    sessions.set(sessionId, { conn, intervalId: keepAliveInterval });


    // Lógica de Pairing (se queda igual)
    if (!conn.authState.creds.registered) {
        setTimeout(async () => {
            if (!sessions.has(sessionId)) return; 
            try {
                let code = await conn.requestPairingCode(number);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });
                fs.writeFileSync(path.join(sessionPath, 'pairing.json'), JSON.stringify({ code }));
                console.log(`[✓ HIJO ${process.pid}] Código generado para ${number}: ${code}`);
            } catch (e) {
                console.error(`[!] HIJO ${process.pid}] Error código para ${number}:`, e.message);
                if (sessions.has(sessionId)) { 
                   await cleanSession(telegram_id, false, true);
                }
            }
        }, 3000);
    }

    // --- Manejador de Conexión Definitivo ---
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'open') {
            console.log(`[✅ HIJO ${process.pid}] Conexión estabilizada para ${number}.`);
            retryCounters.set(sessionId, 0);
            activeSessions[telegram_id] = conn;
            return;
        }

        if (connection === 'close') {
            const sessionData = sessions.get(sessionId);
            if (sessionData) {
                clearInterval(sessionData.intervalId); 
            }
            
            sessions.delete(sessionId);
            if (activeSessions[telegram_id]) delete activeSessions[telegram_id];
            
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reason = DisconnectReason[statusCode] || 'Razón desconocida';

            const unrecoverableStatusCodes = [
                DisconnectReason.loggedOut,
                DisconnectReason.connectionReplaced,
                DisconnectReason.badSession
            ];

            if (unrecoverableStatusCodes.includes(statusCode)) {
                console.log(`[🚫 HIJO ${process.pid}] Cierre definitivo para ${number}. Razón: ${reason}. Limpiando...`);
                await cleanSession(telegram_id, true, true);
            } else {
                console.log(`[🔌 HIJO ${process.pid}] Conexión cerrada para ${number}. Razón: ${reason}.`);
                reconnectSession(telegram_id, number);
            }
        }
    });

    conn.ev.on('creds.update', saveCreds);


    // =======================================================
    //     ¡¡¡FILTRO INTELIGENTE CORREGIDO!!! (Usa prefixes.json)
    // =======================================================
    conn.ev.on('messages.upsert', async chatUpdate => {
        const mek = chatUpdate.messages[0];
        if (!mek.message || mek.key.remoteJid === 'status@broadcast') return;
        
        const senderId = mek.key.remoteJid.endsWith('@g.us') ? mek.key.participant : mek.key.remoteJid;

        if (!senderId) {
            return; // Ignora mensajes de sistema sin remitente
        }
        
        // Obtenemos el texto del mensaje
        const body = mek.message?.conversation || 
                     mek.message?.extendedTextMessage?.text || 
                     mek.message?.imageMessage?.caption || 
                     mek.message?.videoMessage?.caption || 
                     "";

        // --- ¡FILTRO SIMPLE Y CORRECTO! ---
        let prefix = null;
        let isCmd = false;

        // 1. Buscar al usuario asociado a este número de WhatsApp
        //    (Necesitamos el telegram_id para obtener su prefijo)
        const user = await usersDB.findUserByWhatsapp(senderId.split('@')[0]);
        
        // 2. Obtener el prefijo CORRECTO para este usuario (o el default si no existe)
        //    ¡Usamos la función de prefixHandler.js!
        const effectivePrefix = user ? getPrefix(user.telegram_id) : getPrefix(null); // Pasamos null si no hay user para obtener el default

        // 3. Comprobar SI Y SOLO SI el mensaje empieza con ESE prefijo
        //    (getPrefix podría devolver '', así que comprobamos longitud)
        if (effectivePrefix && body.startsWith(effectivePrefix)) {
             isCmd = true;
             prefix = effectivePrefix;
        } else if (effectivePrefix === '' && body.length > 0) {
             // Caso especial: si el prefijo es '', cualquier cosa es comando (menos mensajes vacíos)
             // ¡OJO! Esto podría ser peligroso si no se maneja bien en baron.js
             // Considera si realmente quieres soportar prefijo vacío.
             // Por seguridad, lo comentamos. Si lo quieres, descomenta las 2 líneas de abajo.
             // isCmd = true;
             // prefix = '';
        }

        // 4. ¡EL GRAN FILTRO!
        // Si no es un comando con el prefijo correcto, lo ignoramos.
        if (!isCmd) {
            return;
        }
        // --- FIN DEL FILTRO CORREGIDO ---
        
        // Solo si ES un comando, hacemos el trabajo pesado:
        const m = smsg(conn, mek, store);
        
        // ¡Pasamos el prefijo CORRECTO (el del usuario o el default)!
        require("./baron.js")(conn, m, chatUpdate, store, prefix);
    });

    return conn;
}


async function cleanSession(telegram_id, notifyUser = false, fullClean = false) {
    const user = await usersDB.getUser(telegram_id);
    const whatsappNumber = user?.whatsapp_number;
    const sessionId = `${telegram_id}-${whatsappNumber}`;

    if (activeSessions[telegram_id]) delete activeSessions[telegram_id];

    const sessionData = sessions.get(sessionId);
    if (sessionData) {
        try {
            clearInterval(sessionData.intervalId); // Paramos el ping
            sessionData.conn.end(new Error('Sesión limpiada por el Maestro'));
        } catch (e) { /* No importa si falla */ }
        sessions.delete(sessionId);
    }
    
    if (retryCounters.has(sessionId)) retryCounters.delete(sessionId);

    if (whatsappNumber && fullClean) {
        const sessionPath = path.join(__dirname, 'lib', 'pairing', String(telegram_id), whatsappNumber);
        if (fs.existsSync(sessionPath)) {
            try {
                fs.rmSync(sessionPath, { recursive: true, force: true });
                await usersDB.clearUserWhatsapp(telegram_id);
                console.log(`[🧹 HIJO ${process.pid}] Limpieza completa para ${whatsappNumber}.`);
            } catch (error) {
                console.error(`[❌ HIJO ${process.pid}] Error en limpieza completa:`, error.message);
            }
        }
    }
    
    return true;
}


/**
 * Recolector de basura inteligente para archivos de sesión.
 */
async function periodicSessionGarbageCollector() {
    console.log(`[♻️ HIJO ${process.pid}] Ejecutando recolector de basura...`);
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
                        try { fs.unlinkSync(file.path); stats.preKeys++; } 
                        catch (e) { stats.errors++; }
                    }
                }

                // --- Limpieza de archivos temporales ---
                for (const file of files) {
                    if (file === 'creds.json' || file === 'pairing.json') continue;
                    const isTempFile = [
                        'sender-key-', 'app-state-sync-key-', 'app-state-sync-version-', 'session-'
                    ].some(prefix => file.startsWith(prefix));

                    if (isTempFile) {
                        const filePath = path.join(sessionPath, file);
                        try {
                            const stat = fs.statSync(filePath);
                            if (now - stat.mtimeMs > TWENTY_FOUR_HOURS) {
                                fs.unlinkSync(filePath);
                                stats.tempFiles++;
                            }
                        } catch (e) { stats.errors++; continue; }
                    }
                }
                
                if (stats.preKeys > 0 || stats.tempFiles > 0) {
                     console.log(`[♻️ HIJO ${process.pid}] Sesión ${numberDir}: ${stats.preKeys} pre-keys y ${stats.tempFiles} temps eliminados.`);
                }

            } catch (e) {
                console.error(`[❌ HIJO ${process.pid}] Error en sesión ${sessionPath}:`, e.message);
            }
        }
    }
}

// --- Programar recolector de basura (cada hijo tendrá el suyo) ---
setInterval(periodicSessionGarbageCollector, 3 * 60 * 60 * 1000);
setTimeout(periodicSessionGarbageCollector, 5 * 60 * 1000); // Uno al inicio

// --- Mensaje final de inicio ---
console.log(`[👍 HIJO ${process.pid}] Telegram x Baileys conectado com sucesso (Modo Hijo)`);

// --- Exportar funciones clave ---
module.exports = { startSession, cleanSession, activeSessions };