// chocoplus.js: Módulo para manejar los comandos de usuario de Telegram
const fs = require('fs');
const path = require('path');
const config = require('./config.js'); // Cambiar esto
const free = require('./lib/free.js');
const { getUser, updateUserWhatsapp, clearUserWhatsapp, isActive, db, deleteUser } = require('./lib/users.js');
const os = require('os');
const { getPrefix, setPrefix } = require('./lib/prefixHandler.js');
const TelegramBot = require('node-telegram-bot-api');     
const moment = require('moment'); // nueva dependencia para fechas
require('moment-duration-format');

function isAdmin(id) {
  // Asegurarse que config.ADMIN_IDS exista y sea un array
  return Array.isArray(config.ADMIN_IDS) && config.ADMIN_IDS.includes(Number(id));
}

// --- CONSTANTES Y CONFIGURACIÓN ---
const UI = {
  EMOJIS: {
    ONLINE: '🟢',
    OFFLINE: '🔴',
    MENU: '📱',
    SETTINGS: '⚙️',
    BACK: '⬅️',
    ID: '🆔',
    PREFIX: '⌨️',
    WARNING: '⚠️',
    SUCCESS: '✅',
    ERROR: '❌'
  },
  COMMANDS: [
    { command: 'start', description: 'Iniciar el bot' },
    { command: 'menu', description: 'Mostrar menú principal' },
    { command: 'admin', description: 'Panel de administración' }
  ]
};

// --- FUNCIONES DE UTILIDAD ---
/**
 * Maneja errores de forma centralizada
 * @param {Error} error - Error a manejar
 * @param {number} chatId - ID del chat para notificar
 * @param {TelegramBot} bot - Instancia del bot
 */
const handleError = async (error, chatId, bot) => {
  console.error('Error:', error);
  await bot.sendMessage(chatId, `${UI.EMOJIS.ERROR} Ocurrió un error inesperado.`);
};

/**
 * Verifica el estado de conexión de WhatsApp
 * @param {number} chatId - ID del chat de Telegram
 * @param {Object} user - Información del usuario
 * @returns {Promise<boolean>} - true si está conectado, false si no
 */
async function checkWhatsAppConnection(chatId, user) {
  if (!user?.whatsapp_number) return false;
  
  const pairingDir = path.join(__dirname, 'lib', 'pairing', String(chatId), user.whatsapp_number);
  const credsPath = path.join(pairingDir, 'creds.json');
  return fs.existsSync(credsPath);
}

/**
 * Verifica si la conexión está completamente establecida
 * @param {string} sessionPath - Ruta de la sesión
 * @returns {Promise<boolean>} - true si la conexión está completa
 */
async function isFullyConnected(sessionPath) {
  try {
    const files = fs.readdirSync(sessionPath);
    // Verificar cualquiera de los archivos que indican conexión exitosa
    return files.some(file => 
      file.startsWith('pre-key-') || 
      file.startsWith('app-state-sync-key-') ||
      file.startsWith('sender-key-')
    );
  } catch (e) {
    console.error('Error al verificar conexión:', e);
    return false;
  }
}

// --- FUNCIONES GENERADORAS DE UI ---
/**
 * Construye el menú principal
 * @param {number} chatId - ID del chat
 * @param {Object} user - Información del usuario
 * @returns {Object} Objeto con texto y markup para el menú
 */
const buildMainMenu = async (chatId, user, whatsappConnected) => {
  const prefix = getPrefix(chatId);
  const sysInfo = getSystemInfo();
  let premiumInfo = '<blockquote>⭐ <b>Suscripción Premium</b>\n┗─ <i>Sin suscripción activa</i></blockquote>';
  const premiumUser = (Array.isArray(premiumUsers) ? premiumUsers : []).find(u => normalizeId(u.id) === normalizeId(chatId));

  if (premiumUser && premiumUser.expiresAt) {
    const expires = moment(premiumUser.expiresAt);
    const now = moment();
    if (expires.isAfter(now)) {
      const duration = moment.duration(expires.diff(now)).format("D [días], H [horas]");
      premiumInfo = `<blockquote>⭐ <b>Suscripción Premium</b>\n┗─ ⏳ <b>Expira en:</b> ${duration}</blockquote>`;
    }
  }

  // --- Lógica para la conexión de WhatsApp ---
  let whatsappInfo = '<blockquote><b>WhatsApp:</b> <i>No conectado</i></blockquote>';
  if (whatsappConnected && user?.whatsapp_number) {
    const num = user.whatsapp_number;
    // Ofuscar número para privacidad: +593...3280
    const maskedNumber = `${num.slice(0, 4)}...${num.slice(-4)}`;
    whatsappInfo = 
      `<blockquote>🟢 <b>WhatsApp:</b> <code>${maskedNumber}</code>\n` +
      `┣─ 🕒 <b>Conectado desde:</b> <i>Próximamente...</i>\n` +
      `┗─ 🌐 <b>Proximamente</b> <i>No disponible</i></blockquote>`;
  }
  
  const text = 
    `<b>XGHR-BOT 2.2.1</b>\n\n` +
    `${whatsappInfo}\n` +
    `${premiumInfo}\n` +
    `<blockquote>⚙️ <b>Configuración</b>\n` +
    `┗─ ⌨️ <b>Prefijo actual:</b> <code>${prefix}</code></blockquote>\n` +
    `<b>Sistema</b>\n` +
    `<blockquote>RAM: ${sysInfo.usedMem}GB / ${sysInfo.totalMem}GB\n` +
    `Uptime: ${sysInfo.uptime}</blockquote>\n` +
    `<b>Creditos a <a href="https://wa.me/526421147692">PAZIN WEB</a></b>\n` +
    `<b>❝𝐎𝐰𝐧𝐞𝐫❞ :<a href="https://wa.me/593969533280">ꓚ⌊⌋ 𝙲𝙷𝙾𝙲𝙾𝙿𝙻𝚄𝚂 ⌊⌋ꓛ</a></b>`;

  const keyboard = [
    whatsappConnected 
      ? [{ text: ' Desconectar Sesión', callback_data: 'disconnect_whatsapp' }] 
      : [{ text: ' Iniciar Sesion', callback_data: 'start_pairing' }],
    [
      { text: ' Cambiar Prefijo', callback_data: 'change_prefix' },
      { text: ' Contactar Soporte', url: 'https://wa.me/593969533280' } // URL del owner
    ],
    
  ];

  if (isAdmin(chatId) || isOwner(chatId)) {
    // Si es admin, se añade el botón de Panel Admin en una nueva fila
    keyboard.push([{ text: ' Panel Admin', callback_data: 'admin_menu' }]);
  }

  return {
    text,
    options: {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    }
  };
};

/**
 * Construye el menú de emparejamiento
 * @returns {Object} Objeto con texto y markup para el menú de emparejamiento
 */
const buildPairingMenu = () => {
  const text = 
    `<blockquote>📱 <b>CONEXIÓN WHATSAPP</b>\n\n` +
    `1️⃣ Ingresa tu número con código de país\n` +
    `2️⃣ Ejemplo: +593969533280\n\n` +
    `<i>El código se generará automáticamente</i></blockquote>`;

  return {
    text,
    options: {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[
          { text: '↩️ Cancelar', callback_data: 'cancel_pairing' }
        ]]
      }
    }
  };
};

// --- GESTIÓN DE ARCHIVOS premium.json y admin.json ---
function ensureFileExists(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

function watchFile(filePath, updateCallback) {
  fs.watch(filePath, (eventType) => {
    if (eventType === 'change' || eventType === 'rename') {
      try {
        const updatedData = JSON.parse(fs.readFileSync(filePath));
        updateCallback(updatedData);
        console.log(`File ${filePath} updated successfully.`);
      } catch (error) {
        console.error(`Error updating ${filePath}:`, error.message);
      }
    }
  });
}

// Archivos en la raíz del proyecto
const PREMIUM_FILE = path.join(__dirname, 'premium.json');
const ADMIN_FILE = path.join(__dirname, 'admin.json');

// Asegurar existencia
ensureFileExists(PREMIUM_FILE, []);
ensureFileExists(ADMIN_FILE, []);

// Cargar en memoria
let premiumUsers = JSON.parse(fs.readFileSync(PREMIUM_FILE, 'utf8'));
let adminUsers = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8'));

// Vigilar cambios externos
watchFile(PREMIUM_FILE, (data) => (premiumUsers = data));
watchFile(ADMIN_FILE, (data) => (adminUsers = data));

// Funciones para guardar
function savePremiumUsers() {
  fs.writeFileSync(PREMIUM_FILE, JSON.stringify(premiumUsers, null, 2));
}
function saveAdminUsers() {
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminUsers, null, 2));
}

// --- UTILIDADES DE PERMISOS ---
function normalizeId(id) {
  // Acepta number o string, devuelve Number
  return Number(String(id).replace(/\D/g, ''));
}

function isAdmin(id) {
  const nid = normalizeId(id);
  return Array.isArray(adminUsers) && adminUsers.map(normalizeId).includes(nid);
}

function isOwner(id) {
  const owner = config.OWNER_ID;
  if (Array.isArray(owner)) return owner.map(normalizeId).includes(normalizeId(id));
  return normalizeId(owner) === normalizeId(id);
}

function getPremiumStatus(userId) {
  const uid = normalizeId(userId);
  const user = (Array.isArray(premiumUsers) ? premiumUsers : []).find(u => normalizeId(u.id) === uid);
  if (user && user.expiresAt && new Date(user.expiresAt) > new Date()) {
    return `Si - ${new Date(user.expiresAt).toLocaleString()}`;
  } else {
    return "No - Sin suscripción activa";
  }
}

function isPremium(userId) {
  const uid = normalizeId(userId);
  const user = (Array.isArray(premiumUsers) ? premiumUsers : []).find(u => normalizeId(u.id) === uid);
  return !!(user && user.expiresAt && new Date(user.expiresAt) > new Date());
}

// --- REEMPLAZO DE UPTIME con funciones de tredict.js ---
const startTime = Math.floor(Date.now() / 1000);

function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

// --- FUNCIONES DEL BOT ---
/**
 * Obtiene información del sistema
 * @returns {Object} Objeto con información del sistema
 */
function getSystemInfo() {
  const totalMemGB = Math.round(os.totalmem() / (1024 * 1024 * 1024) * 100) / 100;
  const freememGB = Math.round(os.freemem() / (1024 * 1024 * 1024) * 100) / 100;
  const usedMemGB = Math.round((totalMemGB - freememGB) * 100) / 100;
  const uptime = getBotRuntime(); // <-- reemplazado
  return {
    totalMem: totalMemGB,
    usedMem: usedMemGB,
    uptime
  };
}

// --- MEDIA ALEATORIA PARA SHOWMENU ---
function getRandomMedia() {
  const media = [
    "https://files.catbox.moe/9fhk68.mp4",
    "https://files.catbox.moe/8966ez.jpg",
    "https://files.catbox.moe/7au4v4.mp4", 
    "https://files.catbox.moe/4ypf0t.jpg",
  ];
  return media[Math.floor(Math.random() * media.length)];
}

// --- LÓGICA PRINCIPAL DEL BOT ---
module.exports = function(bot, dependencies) {
  // Registrar comandos del bot
  bot.setMyCommands(UI.COMMANDS);
  
  const { userStates, activeSessions, cleanSession, startSession, updateUserWhatsapp, clearUserWhatsapp } = dependencies;

 async function showMenu(chatId, currentUser) {
    try {
      // Verificar permisos DENTRO de showMenu
      if (!isPremium(chatId) && !isAdmin(chatId) && !isOwner(chatId)) {
        const restrictedText = 
            '<blockquote><b>🔒 Acceso Restringido</b>\n\n' +
            'Este bot requiere una suscripción activa.\n\n' +
            'Para adquirir acceso, contacta al administrador y envíale tu ID de usuario.</blockquote>\n\n' +
            `<blockquote>🆔 <b>Tu ID de Usuario es:</b>\n<code>${chatId}</code></blockquote>\n`+
            `<i>(Toca el ID para copiarlo)</i>`;
        
        const mediaUrl = getRandomMedia();
        const options = {
            caption: restrictedText,
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[{ text: '💬 Contactar Soporte', url: 'https://wa.me/593969533280' }]]
            }
        };
        const lower = mediaUrl.toLowerCase();
        if (/\.(mp4|gif|mkv)$/.test(lower)) {
          await bot.sendAnimation(chatId, mediaUrl, options);
        } else {
          await bot.sendPhoto(chatId, mediaUrl, options);
        }
        return;
      }

      // Si tiene permisos, procede a mostrar el menú normal (sin temporizador)
      const mediaUrl = getRandomMedia();
      const whatsappConnected = await checkWhatsAppConnection(chatId, currentUser);
      const menu = await buildMainMenu(chatId, currentUser, whatsappConnected);

      const lower = mediaUrl.toLowerCase();
      if (/\.(mp4|gif|mkv)$/.test(lower)) {
        await bot.sendAnimation(chatId, mediaUrl, { caption: menu.text, parse_mode: menu.options.parse_mode, reply_markup: menu.options.reply_markup });
      } else {
        await bot.sendPhoto(chatId, mediaUrl, { caption: menu.text, parse_mode: menu.options.parse_mode, reply_markup: menu.options.reply_markup });
      }

    } catch (err) {
      console.error("Error en showMenu:", err);
      await bot.sendMessage(chatId, '❌ Ocurrió un error al mostrar el menú.');
    }
  }
  
  // --- MANEJADORES DE COMANDOS ---
  
  bot.onText(/\/start/, async (msg) => {
    if (msg.callback_query) return;
    const chatId = msg.chat.id;
    try { await bot.deleteMessage(chatId, msg.message_id); } catch (e) {}
    await showMenu(chatId, await getUser(chatId));
  });

  bot.onText(/\/menu/, async (msg) => {
    if (msg.callback_query) return;
    const chatId = msg.chat.id;
    try { await bot.deleteMessage(chatId, msg.message_id); } catch (e) {}
    await showMenu(chatId, await getUser(chatId));
  });
  // --- BLOQUEA EL EMPAREJAMIENTO SI YA TIENE UN NÚMERO CONECTADO ---
  async function safeEditCaptionOrMedia(chatId, messageId, messageObj, text, reply_markup = undefined, parse_mode = 'HTML') {
    // 1) intentar editar caption (para mensajes con media)
    try {
      await bot.editMessageCaption(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode,
        reply_markup
      });
      return;
    } catch (e) {
      // continuar con fallback
    }

    // 2) intentar editar como texto (para mensajes que tienen text)
    try {
      await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode,
        reply_markup
      });
      return;
    } catch (e) {
      // continuar con fallback
    }

    // 3) intentar editar media reusando el file_id del mensaje original y establecer caption
    try {
      if (!messageObj) throw new Error('No message object available for media fallback');

      let mediaFileId = null;
      let mediaType = null;

      if (messageObj.animation && messageObj.animation.file_id) {
        mediaFileId = messageObj.animation.file_id;
        mediaType = 'animation';
      } else if (messageObj.video && messageObj.video.file_id) {
        mediaFileId = messageObj.video.file_id;
        mediaType = 'video';
      } else if (messageObj.photo && Array.isArray(messageObj.photo) && messageObj.photo.length) {
        mediaFileId = messageObj.photo[messageObj.photo.length - 1].file_id;
        mediaType = 'photo';
      } else if (messageObj.document && messageObj.document.file_id) {
        mediaFileId = messageObj.document.file_id;
        mediaType = 'document';
      }

      if (!mediaFileId || !mediaType) throw new Error('No media available to edit');

      const newMedia = {
        type: mediaType,
        media: mediaFileId,
        caption: text,
        parse_mode
      };

      await bot.editMessageMedia(newMedia, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup
      });
      return;
    } catch (e) {
      // último recurso: enviar mensaje nuevo (temporal)
      try {
        const tmp = await bot.sendMessage(chatId, text, { parse_mode, reply_markup });
        // borrar temporal después si hace falta
        setTimeout(() => { try { bot.deleteMessage(chatId, tmp.message_id); } catch (err) {} }, 8000);
      } catch (err) {
        console.error('safeEditCaptionOrMedia fallback failed:', err.message);
      }
    }
  }

  // Helper: editar el mensaje actual para volver/actualizar el menú principal (media + caption + botones)
  async function showOrEditMenu(chatId, messageId) {
    try {
      const currentUser = await getUser(chatId);
      const mediaUrl = getRandomMedia();
      const whatsappConnected = await checkWhatsAppConnection(chatId, currentUser);
      const menu = await buildMainMenu(chatId, currentUser, whatsappConnected);

      const isVideo = /\.(mp4|gif|mkv)$/i.test(mediaUrl);
      const newMedia = {
        type: isVideo ? 'animation' : 'photo',
        media: mediaUrl,
        caption: menu.text,
        parse_mode: menu.options.parse_mode
      };

      await bot.editMessageMedia(newMedia, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: menu.options.reply_markup
      });
    } catch (err) {
      // fallback: intentar editar sólo la caption; si falla, enviar menú nuevo
      try {
        const currentUser = await getUser(chatId);
        const whatsappConnected = await checkWhatsAppConnection(chatId, currentUser);
        const menu = await buildMainMenu(chatId, currentUser, whatsappConnected);
        await bot.editMessageCaption(menu.text, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: menu.options.parse_mode,
          reply_markup: menu.options.reply_markup
        });
      } catch (e) {
        console.error('showOrEditMenu failed, sending new menu via showMenu:', e.message);
        await showMenu(chatId, await getUser(chatId));
      }
    }
  }
  // --- Pega esta nueva función en tu archivo ---
async function showMenuWithNotification(chatId, messageId, notificationText) {
  try {
    const currentUser = await getUser(chatId);
    const whatsappConnected = await checkWhatsAppConnection(chatId, currentUser);
    const menu = await buildMainMenu(chatId, currentUser, whatsappConnected);
    
    // 1. Añadimos la notificación temporal al texto del menú
    const textWithNotification = `${notificationText}\n\n${menu.text}`;

    // 2. Editamos el mensaje para mostrar el menú CON la notificación
    await safeEditCaptionOrMedia(chatId, messageId, null, textWithNotification, menu.options.reply_markup, 'HTML');

    // 3. Después de 4 segundos, volvemos a editar el mensaje para quitar la notificación
    setTimeout(async () => {
      // El segundo argumento es `null` para que no intente volver a buscar un `messageObj` que ya no necesita
      await safeEditCaptionOrMedia(chatId, messageId, null, menu.text, menu.options.reply_markup, 'HTML');
    }, 4000); // 4 segundos

  } catch (e) {
    console.error('Error en showMenuWithNotification:', e);
    // Fallback por si todo falla
    await showMenu(chatId, await getUser(chatId));
  }
}
  // --- MANEJADOR UNIFICADO DE CALLBACKS (edita el mensaje en lugar de borrarlo) ---
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    console.log(`[DEBUG] Mensaje recibido de ${chatId}. Estado actual:`, userStates[chatId]); // <--- AÑADE ESTA LÍNEA
    const messageId = query.message.message_id;
    const data = query.data;
    const messageObj = query.message; // pasar al helper cuando sea necesario
const allowedForEveryone = ['back_to_menu']; 

    if (!isPremium(chatId) && !isAdmin(chatId) && !isOwner(chatId) && !allowedForEveryone.includes(data)) {
        await bot.answerCallbackQuery(query.id, { text: '🔒 Acceso denegado. Requiere suscripción.', show_alert: true });
        
        // Opcional pero recomendado: Actualiza el menú para que solo muestre el mensaje de error.
        const restrictedText = 
            '<blockquote><b>🔒 Acceso Restringido</b>\n\n' +
            'Tu suscripción ha expirado o no está activa.\n\n' +
            'Para renovar o adquirir acceso, por favor, contacta al administrador.</blockquote>';
        
        try {
            await safeEditCaptionOrMedia(chatId, messageId, messageObj, restrictedText, {
                inline_keyboard: [[{ text: '💬 Contactar Soporte', url: 'https://wa.me/593969533280' }]]
            }, 'HTML');
        } catch (e) {
            // Si editar falla, envía uno nuevo como último recurso
            await bot.sendMessage(chatId, restrictedText, { 
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[{ text: '💬 Contactar Soporte', url: 'https://wa.me/593969533280' }]]
                }
            });
        }
        
        return; // ¡IMPORTANTE! Detiene la ejecución aquí.
    }
    try {
      await bot.answerCallbackQuery(query.id);

      try {
        switch (data) {
          case 'back_to_menu':
            // Usa editMessageMedia para volver al menú principal (cambia el video/foto)
            await showOrEditMenu(chatId, messageId);
            break;

          case 'start_pairing': {
            await bot.sendChatAction(chatId, 'typing');
            await bot.editMessageReplyMarkup({ inline_keyboard: [[{ text: '⏳ Procesando...', callback_data: 'noop' }]] }, { chat_id: chatId, message_id: messageId });

            const menu = buildPairingMenu();
            // ▼▼▼ ESTA ES LA LÍNEA QUE CAMBIA ▼▼▼
            userStates[chatId] = { awaitingPairingNumber: true, messageId: messageId }; 
            // ▲▲▲ AHORA GUARDAMOS EL MESSAGEID ▲▲▲
            
            await safeEditCaptionOrMedia(chatId, messageId, messageObj, menu.text, menu.options.reply_markup, menu.options.parse_mode);
            break;
          }
         case 'change_prefix': {
            // Guardamos el messageId para poder editar el mensaje original después
            userStates[chatId] = { awaitingNewPrefix: true, messageId: messageId };
            
            const text = 
              `<blockquote>✏️ <b>Eitar prefijo:</b>\n\n`+
              `Tu prefijo actual es <code>${getPrefix(chatId)}</code>\n\n` +
              `<b>Por favor envia el nuevo prefijo que deseas usar</b>\n` +
              `<i>Ej: ! / # $)</i></blockquote>`;
              
            await safeEditCaptionOrMedia(chatId, messageId, messageObj, text, {
              inline_keyboard: [[{ text: '⬅️ Cancelar y Volver', callback_data: 'back_to_menu' }]]
            }, 'HTML');
            break;
          }

          case 'disconnect_whatsapp': {
            await cleanSession(chatId, false, true); // fullClean
            const confirmText = 'Tu sesión ha sido eliminada correctamente.';
            await safeEditCaptionOrMedia(chatId, messageId, messageObj, confirmText, {
              inline_keyboard: [[{ text: 'Iniciar sesion', callback_data: 'start_pairing' }]]
            }, 'HTML');
            break;
          }

         // PEGA ESTE CÓDIGO MEJORADO
case 'admin_menu':
  // Se pasa messageObj para que la función pueda editar el mensaje original
  await sendAdminMenu(chatId, messageId, messageObj);
  break;

case 'admin_cekregis': {
  let text = "<b>📋 Lista de Usuarios Premium</b>\n\n";
  if (!premiumUsers || premiumUsers.length === 0) {
    text += "No hay usuarios premium registrados.";
  } else {
    // Usamos la información que ya tenemos en memoria
    premiumUsers.forEach((u, i) => {
      text += `${i+1}. 🆔 <code>${u.id}</code>\n` +
              `   └── ⏳ Expira: ${moment(u.expiresAt).format('YYYY-MM-DD HH:mm:ss')}\n`;
    });
  }

  const reply_markup = {
    inline_keyboard: [[{ text: '⬅️ Volver al Panel', callback_data: 'admin_menu' }]]
  };
  // Editamos el mensaje actual para mostrar la lista
  await safeEditCaptionOrMedia(chatId, messageId, messageObj, text, reply_markup, 'HTML');
  break;
}

case 'admin_show_regis_hint': {
  const text = '<b>📝 Cómo Registrar Premium</b>\n\n' +
               'Usa el comando <code>/regis &lt;id&gt; &lt;duracion&gt;</code>\n\n' +
               '<b>Ejemplos:</b>\n' +
               '<code>/regis 12345678 30d</code> (30 días)\n' +
               '<code>/regis 12345678 12h</code> (12 horas)\n' +
               '<code>/regis 12345678 60m</code> (60 minutos)';
  const reply_markup = {
    inline_keyboard: [[{ text: '⬅️ Volver al Panel', callback_data: 'admin_menu' }]]
  };
  await safeEditCaptionOrMedia(chatId, messageId, messageObj, text, reply_markup, 'HTML');
  break;
}

case 'admin_manage_admins': {
  const text = '<b>👥 Gestionar Administradores</b>\n\n' +
               'Usa los siguientes comandos en el chat:\n\n' +
               '<code>/addadmin &lt;id&gt;</code> - Añadir admin\n' +
               '<code>/deladmin &lt;id&gt;</code> - Eliminar admin';
  const reply_markup = {
    inline_keyboard: [[{ text: '⬅️ Volver al Panel', callback_data: 'admin_menu' }]]
  };
  await safeEditCaptionOrMedia(chatId, messageId, messageObj, text, reply_markup, 'HTML');
  break;
}

         // CÓDIGO NUEVO Y MEJORADO
case 'cancel_pairing':
  delete userStates[chatId]; // Importante para que no siga esperando el número
  await showOrEditMenu(chatId, messageId); // ¡La magia está aquí!
  break;

          case 'show_menu':
            // Si existe función que muestra menú de usuario en contexto, editar/mostrar
            await showOrEditMenu(chatId, messageId);
            break;

          default:
            // Otros callbacks pueden manejarse aquí o enviarse como mensajes temporales
            console.log('Unhandled callback data:', data);
            break;
        }
      } catch (swErr) {
        console.error(`Error en callback_query ('${data}'):`, swErr.message);
      }
    } catch (err) {
      await handleError(err, chatId, bot);
    }
  });
  // CÓDIGO NUEVO (PARA PEGAR)
// --- MANEJADOR DE MENSAJES DE TEXTO (NÚMEROS, PREFIJOS, ETC) ---
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  if (!msg.text) return; // Ignorar mensajes sin texto (stickers, fotos, etc.)

  // =================================================================
  // BLOQUE PARA MANEJAR EL CAMBIO DE PREFIJO
  // =================================================================
 if (userStates[chatId]?.awaitingNewPrefix) {
    const messageId = userStates[chatId].messageId; // Obtenemos el ID del mensaje a editar
    const newPrefix = msg.text.trim();
    
    // Borramos el mensaje del usuario para mantener el chat limpio
    try { await bot.deleteMessage(chatId, msg.message_id); } catch(e) {}

    if (newPrefix.length > 0 && newPrefix.length <= 5 && !/\s/.test(newPrefix)) {
      setPrefix(chatId, newPrefix);
      delete userStates[chatId]; // Limpiar el estado
      
      // 1. Mostramos la confirmación temporal editando el mensaje original
      const confirmationText = `✅ <b>Éxito:</b> Tu prefijo ha sido actualizado a '<code>${newPrefix}</code>'`;
      await safeEditCaptionOrMedia(chatId, messageId, null, confirmationText, undefined, 'HTML');
      
      // 2. Después de 2.5 segundos, volvemos al panel principal.
      // La confirmación "desaparece" porque editamos el mensaje de nuevo.
      setTimeout(async () => {
        await showOrEditMenu(chatId, messageId);
      }, 2500);

    } else {
      // Si el prefijo es inválido, avisamos y damos la opción de volver
      const errorText = '❌ <b>Prefijo inválido.</b> Debe tener de 1 a 5 caracteres sin espacios.';
      await safeEditCaptionOrMedia(chatId, messageId, null, errorText, {
          inline_keyboard: [[{ text: '⬅️ Volver', callback_data: 'back_to_menu' }]]
      }, 'HTML');
      delete userStates[chatId];
    }
    return; // Importante: terminar aquí
  }

  // =================================================================
  // BLOQUE PARA MANEJAR EL NÚMERO DE TELÉFONO (PAIRING)
  // =================================================================
  if (userStates[chatId]?.awaitingPairingNumber) {
    const messageId = userStates[chatId].messageId;
    const number = msg.text.replace(/[^0-9]/g, '');

    try { await bot.deleteMessage(chatId, msg.message_id); } catch(e) {}

    if (!/^\d{10,15}$/.test(number)) {
      const errorText = '❌ <b>Número inválido.</b>\n\nAsegúrate de incluir el código de país. Ejemplo: 593969533280';
      await safeEditCaptionOrMedia(chatId, messageId, null, errorText, {
          inline_keyboard: [[{ text: '⬅️ Volver', callback_data: 'back_to_menu' }]]
      }, 'HTML');
      delete userStates[chatId];
      return;
    }

    delete userStates[chatId];

    try {
      await safeEditCaptionOrMedia(chatId, messageId, null, '<blockquote>⏳ Generando código, por favor espera...</blockquote>');

      startSession(chatId, number);

      let code = null, tries = 0;
      const sessionPath = path.join(__dirname, 'lib', 'pairing', String(chatId), number);
      const pairingFile = path.join(sessionPath, 'pairing.json');

      while (tries < 30 && !code) {
        if (fs.existsSync(pairingFile)) {
          try { code = JSON.parse(fs.readFileSync(pairingFile)).code; } catch (e) {}
        }
        if (!code) {
          await new Promise(r => setTimeout(r, 1000));
          tries++;
        }
      }

      if (code) {
        await updateUserWhatsapp(chatId, number);
        
        const messageText = 
          `<blockquote>📱 <b>CÓDIGO DE VINCULACIÓN</b>\n\n` +
          `🔑 <code>${code}</code>\n\n` +
          `1️⃣ Abre WhatsApp > Dispositivos Vinculados\n` +
          `2️⃣ Elige <b>Vincular con el número de teléfono</b>\n` +
          `3️⃣ Ingresa el código de arriba\n\n` +
          `⏱️ <i>Tienes ~45 segundos antes de que expire.</i></blockquote>`;
        
        await safeEditCaptionOrMedia(chatId, messageId, null, messageText);

        let connected = false;
        const checkInterval = setInterval(async () => {
          if (await isFullyConnected(sessionPath)) {
            connected = true;
            clearInterval(checkInterval);
            await showMenuWithNotification(chatId, messageId, '✅ <b>¡CONECTADO!</b> Dispositivo vinculado exitosamente.');
          }
        }, 2000);

        setTimeout(() => {
          clearInterval(checkInterval);
          if (!connected) {
            safeEditCaptionOrMedia(chatId, messageId, null, '<blockquote>❌ <b>Tiempo de espera agotado.</b>\n\nEl código ha expirado. Por favor, intenta de nuevo.</blockquote>', {
              inline_keyboard: [[{ text: '⬅️ Volver', callback_data: 'back_to_menu' }]]
            });
          }
        }, 60000);

      } else {
        throw new Error('No se pudo generar el código.');
      }
    } catch (err) {
      console.error('Error durante el emparejamiento:', err);
      await safeEditCaptionOrMedia(chatId, messageId, null, '<blockquote>❌ Hubo un error al intentar conectar. Inténtalo de nuevo.</blockquote>', {
        inline_keyboard: [[{ text: '⬅️ Volver', callback_data: 'back_to_menu' }]]
      });
    }
    return;
  }
});
  // --- MANEJADORES DE COMANDOS ADMIN ---
  // Comando /regis para agregar usuarios premium
  bot.onText(/\/regis(?:\s(.+))?/, async (msg, match) => {
    // Ignorar si el mensaje viene de un callback query
    if (msg.callback_query) return;
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    if (!isAdmin(senderId) && !isOwner(senderId)) {
      return bot.sendMessage(chatId, "Solo administradores pueden usar este comando.");
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Uso: /regis <id> <duracion>. Ej: /regis 12345678 30d");
    }

    const parts = match[1].split(/\s+/);
    if (parts.length < 2) {
      return bot.sendMessage(chatId, "Debes especificar el ID y la duración. Ej: 30d, 12h, 60m");
    }

    const userId = normalizeId(parts[0]);
    const duration = parts[1];
    if (!/^\d+[dhm]$/.test(duration)) {
      return bot.sendMessage(chatId, "Formato de duración inválido. Ejemplo: 30d, 12h, 60m");
    }

    const amount = parseInt(duration.slice(0, -1));
    const unit = duration.slice(-1);

    let expiresAt = moment();
    if (unit === 'd') expiresAt = expiresAt.add(amount, 'days');
    else if (unit === 'h') expiresAt = expiresAt.add(amount, 'hours');
    else if (unit === 'm') expiresAt = expiresAt.add(amount, 'minutes');

    const exists = premiumUsers.find(u => normalizeId(u.id) === userId);
    if (!exists) {
      premiumUsers.push({ id: userId, expiresAt: expiresAt.toISOString() });
      savePremiumUsers();
      bot.sendMessage(chatId, `✅ Usuario ${userId} registrado como premium hasta ${expiresAt.format('YYYY-MM-DD HH:mm:ss')}`);
    } else {
      exists.expiresAt = expiresAt.toISOString();
      savePremiumUsers();
      bot.sendMessage(chatId, `✅ Usuario ${userId} actualizado hasta ${expiresAt.format('YYYY-MM-DD HH:mm:ss')}`);
    }
  });

  bot.onText(/\/delregis(?:\s(\d+))?/, (msg, match) => {
    // Ignorar si el mensaje viene de un callback query
    if (msg.callback_query) return;
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    if (!isAdmin(senderId) && !isOwner(senderId)) {
      return bot.sendMessage(chatId, "Solo administradores pueden usar este comando.");
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Uso: /delregis <id>");
    }

    const userId = normalizeId(match[1]);
    const idx = premiumUsers.findIndex(u => normalizeId(u.id) === userId);
    if (idx === -1) {
      return bot.sendMessage(chatId, `Usuario ${userId} no está en la lista premium.`);
    }

    premiumUsers.splice(idx, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `✅ Usuario ${userId} eliminado de premium.`);
  });

  bot.onText(/\/cekregis/, (msg) => {
    // Ignorar si el mensaje viene de un callback query
    if (msg.callback_query) return;
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    if (!isAdmin(senderId) && !isOwner(senderId)) {
      return bot.sendMessage(chatId, "Solo administradores pueden usar este comando.");
    }

    if (!premiumUsers || premiumUsers.length === 0) {
      return bot.sendMessage(chatId, "No hay usuarios premium.");
    }

    let texto = "📌 Lista de usuarios premium:\n\n";
    premiumUsers.forEach((u, i) => {
      texto += `${i+1}. ID: \`${u.id}\` - Expira: ${u.expiresAt ? moment(u.expiresAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}\n`;
    });

    bot.sendMessage(chatId, texto, { parse_mode: 'Markdown' });
  });

  // --- COMANDOS DE ADMIN (solo owner puede gestionar admin.json) ---
  bot.onText(/\/addadmin(?:\s(\d+))?/, (msg, match) => {
    // Ignorar si el mensaje viene de un callback query
    if (msg.callback_query) return;
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    if (!isOwner(senderId)) {
      return bot.sendMessage(chatId, "Solo el owner puede agregar administradores.");
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Uso: /addadmin <id>");
    }

    const userId = normalizeId(match[1]);
    if (!adminUsers.map(normalizeId).includes(userId)) {
      adminUsers.push(userId);
      saveAdminUsers();
      return bot.sendMessage(chatId, `✅ Usuario ${userId} agregado a admin.`);
    } else {
      return bot.sendMessage(chatId, `Usuario ${userId} ya es admin.`);
    }
  });

  bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
    // Ignorar si el mensaje viene de un callback query
    if (msg.callback_query) return;
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    if (!isOwner(senderId)) {
      return bot.sendMessage(chatId, "Solo el owner puede eliminar administradores.");
    }

    if (!match || !match[1]) {
      return bot.sendMessage(chatId, "Uso: /deladmin <id>");
    }

    const userId = normalizeId(match[1]);
    const idx = adminUsers.map(normalizeId).indexOf(userId);
    if (idx === -1) {
      return bot.sendMessage(chatId, `Usuario ${userId} no es admin.`);
    }

    adminUsers.splice(idx, 1);
    saveAdminUsers();
    bot.sendMessage(chatId, `✅ Usuario ${userId} eliminado de admin.`);
  });
  /*
  async function sendAdminMenu(chatId, messageId = null, messageObj = null) {
    const text = `<b>🔧 Panel de Administración</b>\n\n` +
                 `Usuarios premium: <code>${Array.isArray(premiumUsers) ? premiumUsers.length : 0}</code>\n\n` +
                 `Acciones disponibles:`;
    const reply_markup = {
      inline_keyboard: [
        // --- NUEVO BOTÓN CON WEB APP ---
        [{ text: '🖥️ Abrir Panel Web (Avanzado)', web_app: { url: 'https://telegram.org' } }], // <-- ¡REEMPLAZA ESTA URL CON LA TUYA!
        // --- TUS BOTONES ANTIGUOS ---
        [{ text: '📋 Ver Premium', callback_data: 'admin_cekregis' }],
        [{ text: '📝 Cómo regis', callback_data: 'admin_show_regis_hint' }],
        [{ text: '👥 Gestionar Admins', callback_data: 'admin_manage_admins' }],
        [{ text: '⬅️ Volver al Menú', callback_data: 'back_to_menu' }]
      ]
    }};*/
    // ... el resto de tu función sendAdminMenu continúa sin cambios ...
  // Función para el menú de administración
  async function sendAdminMenu(chatId, messageId = null, messageObj = null) {
    const text = `<b>🔧 Panel de Administración</b>\n\n` +
                 `Usuarios premium: <code>${Array.isArray(premiumUsers) ? premiumUsers.length : 0}</code>\n\n` +
                 `Acciones disponibles:`;
    const reply_markup = {
      inline_keyboard: [
        [{ text: '📋 Ver Premium', callback_data: 'admin_cekregis' }],
        [{ text: '📝 Cómo regis', callback_data: 'admin_show_regis_hint' }],
        [{ text: '👥 Gestionar Admins', callback_data: 'admin_manage_admins' }],
        [{ text: '⬅️ Volver al Menú', callback_data: 'back_to_menu' }]
      ]
    };

    try {
      if (messageId && messageObj) {
        await safeEditCaptionOrMedia(chatId, messageId, messageObj, text, reply_markup, 'HTML');
      } else if (messageId) {
        // Intentar editar texto (si no hay objeto de mensaje)
        try {
          await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            reply_markup
          });
        } catch (e) {
          // fallback a enviar nuevo mensaje
          await bot.sendMessage(chatId, text, { parse_mode: 'HTML', reply_markup });
        }
      } else {
        await bot.sendMessage(chatId, text, { parse_mode: 'HTML', reply_markup });
      }
    } catch (err) {
      console.error('sendAdminMenu error:', err);
      // En caso de fallo extremo, enviar mensaje simple
      try { await bot.sendMessage(chatId, 'Error al abrir panel admin.'); } catch (e) {}
    }
  }
}

// Auto-reload para desarrollo
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`Update ${__filename}`);
  delete require.cache[file];
  require(file);
});