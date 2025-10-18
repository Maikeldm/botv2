// launcher.js (Nivel 5: Lanzador Dinámico - CORREGIDO)
const cluster = require('cluster');
const os = require('os');
const fs = require('fs');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const usersDB = require('./lib/users.js'); //
const chocoplusHandler = require('./chocoplus.js'); //
const dotenv = require('dotenv');
const { fileURLToPath } = require('url');
dotenv.config();

// --- Variables Globales del Maestro ---
// Usamos un Map para rastrear qué HIJO maneja qué SESIÓN (telegram_id)
const sessionWorkers = new Map(); // <--- ¡NUEVO!

/**
 * =================================================================
 * MODO DIOS (NIVEL 5) ACTIVADO
 * =================================================================
 */
if (cluster.isPrimary) {
    console.log(`[🚀 MAESTRO] Proceso Primario ${process.pid} activado.`);
    console.log(`[🔥] Modo: Aislamiento Total por Proceso (1 Sesión = 1 Proceso).`);

    // --- Iniciar Telegram Bot SÓLO en el Maestro ---
    console.log(`[🤖 MAESTRO] Iniciando Jefe de Telegram...`);
    const TOKEN = process.env.BOT_TOKEN || '8470263467:AAEwJKUW_fYF1neu-Kwgspgdwn6xMeNHTec'; //
    const bot = new TelegramBot(TOKEN, { polling: true });
    const userStates = {}; 
    
    chocoplusHandler(bot, { //
        userStates,
        activeSessions: {}, // Los Hijos manejan esto
        
        cleanSession: (telegram_id, notifyUser = false, fullClean = false) => {
            console.log(`[🧹 MAESTRO] Recibida orden de limpieza para ${telegram_id}`);
            const worker = sessionWorkers.get(telegram_id);
            if (worker) {
                console.log(`[KILL] Matando al Hijo ${worker.process.pid} (Sesión ${telegram_id}).`);
                worker.kill(); // Matamos al proceso Hijo
                // El evento 'exit' de cluster se encargará de borrarlo del Map
            } else {
                console.warn(`[MAESTRO] Se pidió limpiar ${telegram_id} pero no se encontró ningún Hijo.`);
                // Si el Hijo ya murió, le pedimos a la DB que limpie (por si acaso)
                usersDB.clearUserWhatsapp(telegram_id); //
            }
        },
        
        startSession: (telegram_id, whatsapp_number) => {
            console.log(`[▶️ MAESTRO] Recibida orden de inicio para ${telegram_id}/${whatsapp_number}`);
            if (sessionWorkers.has(telegram_id)) {
                console.warn(`[MAESTRO] ${telegram_id} ya tiene un Hijo. Matando al antiguo...`);
                sessionWorkers.get(telegram_id).kill();
            }
            // ¡Aquí está la magia!
            launchWorkerForSession({ telegram_id, whatsapp_number });
        },
        
        updateUserWhatsapp: usersDB.updateUserWhatsapp, //
        clearUserWhatsapp: usersDB.clearUserWhatsapp //
    });
    

    // --- Manejo de Workers Muertos ---
    cluster.on('exit', (worker, code, signal) => {
        console.error(`[❌ MAESTRO] Hijo ${worker.process.pid} murió (Señal: ${signal}, Código: ${code}).`);
        // Buscamos a quién le pertenecía este Hijo para limpiarlo
        let telegram_id = null;
        for (const [id, w] of sessionWorkers.entries()) {
            if (w.process.pid === worker.process.pid) {
                telegram_id = id;
                break;
            }
        }
        
        if (telegram_id) {
            console.log(`[MAESTRO] El Hijo ${worker.process.pid} pertenecía a ${telegram_id}. Limpiando del mapa...`);
            sessionWorkers.delete(telegram_id);
        }
    });

    /**
     * ¡FUNCIÓN CORREGIDA!
     * Lanza un nuevo proceso Hijo (cluster.fork) para UNA SOLA sesión.
     */
    function launchWorkerForSession(session) {
        console.log(`[LAUNCH] Creando nuevo Hijo para ${session.telegram_id}...`);
        
        const worker = cluster.fork();
        
        // Guardamos la relación
        sessionWorkers.set(session.telegram_id, worker);
        
        // =================================================================
        //                       ¡AQUÍ ESTÁ EL FIX!
        // =================================================================
        // Ya no usamos 'worker.on('listening', ...)'
        // Enviamos la orden de inmediato. El módulo 'cluster' de Node.js
        // la pondrá en cola automáticamente hasta que el Hijo esté listo.
        console.log(`[MAESTRO] Enviando tarea ${session.telegram_id} al nuevo Hijo ${worker.process.pid}`);
        worker.send({ type: 'START_SESSION', ...session });
    }


    // --- Cargar y distribuir sesiones existentes al inicio ---
    (async () => {
        console.log("[MAESTRO] Cargando sesiones existentes desde la DB...");
        try {
            const allUsers = await usersDB.getAllUsersWithWhatsapp(); //
            
            if (allUsers.length > 0) {
                console.log(`[MAESTRO] ${allUsers.length} sesiones encontradas. Lanzando ${allUsers.length} Hijos...`);
                
                for (const user of allUsers) {
                    // Lanza un Hijo por CADA usuario
                    launchWorkerForSession(user);
                    // Pausa para no saturar el sistema operativo con 60 inicios de golpe
                    await new Promise(r => setTimeout(r, 500)); // 0.5 segundos por Hijo
                }
                console.log("[MAESTRO] ¡Todas las sesiones existentes han sido asignadas a sus Hijos!");
            } else {
                console.log("[MAESTRO] No se encontraron sesiones existentes para reconectar.");
            }
            
        } catch (e) {
            console.error("[MAESTRO] Error catastrófico cargando sesiones existentes:", e);
        }
    })(); //

} else {

    // =================================================================
    // CÓDIGO DEL WORKER (HIJO)
    // =================================================================
    // ¡Esta parte es idéntica a la anterior!
    
    console.log(`[⚙️ HIJO] Bot iniciado en proceso hijo (PID: ${process.pid}). ¡Listo para recibir sesión!`);

    // Tu optimización de caché de RAM
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
        } catch (error) {
            // Ignoramos si un archivo no existe
        }
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

    // Este hijo ahora carga 'main.js', que maneja Baileys.
    require('./main.js');
}