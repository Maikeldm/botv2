// chocoplus.js: Módulo para manejar los comandos de usuario de Telegram
const fs = require('fs');
const path = require('path');
const config = require('./config.js'); // Cambiar esto
const free = require('./lib/free.js');
const { getUser, updateUserWhatsapp, clearUserWhatsapp, isActive, db, deleteUser } = require('./lib/users.js');
const os = require('os');
const { getPrefix, setPrefix } = require('./lib/prefixHandler.js');
const TelegramBot = require('node-telegram-bot-api');     
const { createNewToken, verifyAndActivateToken, hasValidAccess, getTokenStats, revokeTokenByTelegramId, getUsersWithAccess } = require('./lib/tokens.js');

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
  
  const text = 
    `<blockquote>📱 <b>XGHR-BOT V2</b>\n\n` +
    `${whatsappConnected ? UI.EMOJIS.ONLINE : UI.EMOJIS.OFFLINE} <b>Estado:</b> ${whatsappConnected ? 'Conectado' : 'Desconectado'}\n` +
    `${UI.EMOJIS.ID} <b>ID:</b> <code>${chatId}</code>\n` +
    `${UI.EMOJIS.PREFIX} <b>Prefijo:</b> <code>${prefix}</code>\n\n` +
    `<b>Sistema</b>\n` +
    `RAM: ${sysInfo.usedMem}GB / ${sysInfo.totalMem}GB\n` +
    `Uptime: ${sysInfo.uptime}\n\n` +
    `<b>Creditos a <a href="https://wa.me/526421147692">CREDITOS</a> ya que varias travas son suyas</b>\n\n` +
    `<b>❝𝐎𝐰𝐧𝐞𝐫❞ :<a href="https://wa.me/593969533280">ꓚ⌊⌋ 𝙲𝙷𝙾𝙲𝙾𝙿𝙻𝚄𝚂 ⌊⌋ꓛ</a></b></blockquote>` ; // <-- Y AQUÍ PONES LA LÍNEA NUEVA, AFUERA.

  const keyboard = [
    whatsappConnected ? 
      [{ text: 'Eliminar sesion', callback_data: 'disconnect_whatsapp' }] :
      [{ text: 'Iniciar sesion', callback_data: 'start_pairing' }],
    [{ text: '⚙️ Cambiar Prefijo', callback_data: 'change_prefix' }],
    isAdmin(chatId) ? [{ text: 'Panel Admin', callback_data: 'admin_menu' }] : []
  ];

  return {
    text,
    options: {
      parse_mode: 'HTML', // Cambiado a HTML
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

// --- LÓGICA PRINCIPAL DEL BOT ---
module.exports = function(bot, dependencies) {
  // Registrar comandos del bot
  bot.setMyCommands(UI.COMMANDS);
  
  const { userStates, activeSessions, cleanSession, startSession, updateUserWhatsapp, clearUserWhatsapp } = dependencies;

async function showMenu(chatId, currentUser) {
  try {
    // 1. Cambiamos la ruta al archivo de video .mp4
    const localAnimationPath = './src/kkk.mp4';

    if (fs.existsSync(localAnimationPath)) {
      const whatsappConnected = await checkWhatsAppConnection(chatId, currentUser);
      const menu = await buildMainMenu(chatId, currentUser, whatsappConnected);

      // 2. Cambiamos el método de bot.sendPhoto a bot.sendAnimation
      return await bot.sendAnimation(chatId, fs.createReadStream(localAnimationPath), {
          caption: menu.text,
          parse_mode: menu.options.parse_mode,
          reply_markup: menu.options.reply_markup
      });
      
    } else {
      console.error(`Error: El video no se encontró en la ruta: ${localAnimationPath}`);
      const menu = await buildMainMenu(chatId, await getUser(chatId), false);
      return await bot.sendMessage(chatId, menu.text, menu.options);
    }
  } catch (err) {
    console.error("Error al enviar animación, enviando solo texto:", err);
    const menu = await buildMainMenu(chatId, await getUser(chatId), false);
    return await bot.sendMessage(chatId, menu.text, menu.options);
  }
}

  // --- MANEJADORES DE COMANDOS ---
  // Comando /start - Usar el menú unificado
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    
    // Si es admin, permitir acceso directo
    if (isAdmin(chatId)) {
      try { await bot.deleteMessage(chatId, msg.message_id); } catch (e) {}
      await showMenu(chatId, await getUser(chatId));
      return;
    }

    // Verificar si tiene acceso por token
    if (!hasValidAccess(chatId)) {
      userStates[chatId] = { awaitingToken: true };
      await bot.sendMessage(chatId, 
        '*🔒 Acceso Restringido*\n\n' +
        'Este bot requiere un token de acceso válido.\n' +
        'Por favor, ingresa tu token:', 
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Usuario con acceso, mostrar menú
    try { await bot.deleteMessage(chatId, msg.message_id); } catch (e) {}
    await showMenu(chatId, await getUser(chatId));
  });

  // Comando /menu - Usar el mismo menú unificado
  bot.onText(/\/menu/, async (msg) => {
    const chatId = msg.chat.id;
    
    // Si es admin, permitir acceso directo
    if (isAdmin(chatId)) {
      try { await bot.deleteMessage(chatId, msg.message_id); } catch (e) {}
      await showMenu(chatId, await getUser(chatId));
      return;
    }

    // Verificar si tiene acceso por token
    if (!hasValidAccess(chatId)) {
      userStates[chatId] = { awaitingToken: true };
      await bot.sendMessage(chatId, 
        '*🔒 Acceso Restringido*\n\n' +
        'Este bot requiere un token de acceso válido.\n' +
        'Por favor, ingresa tu token:', 
        { parse_mode: 'Markdown' }
      );
      return;
    }

    try { await bot.deleteMessage(chatId, msg.message_id); } catch (e) {}
    await showMenu(chatId, await getUser(chatId));
  });
  // Comando /pairing (simplificado, ya que los botones lo manejan)
  bot.onText(/\/pairing/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await getUser(chatId);
    if (!user || !isActive(user)) {
      const errorMsg = await bot.sendMessage(chatId, 'No tienes acceso VIP activo.', defineBuyOptions(chatId));
      setTimeout(() => { try { bot.deleteMessage(chatId, errorMsg.message_id); } catch (e) {} }, 10000);
      return;
    }
    // Disparamos la misma lógica que el botón para mantener consistencia
    bot.emit('callback_query', { data: 'start_pairing', message: { chat: { id: chatId }, message_id: msg.message_id } });
    try { await bot.deleteMessage(chatId, msg.message_id); } catch (e) {}
  });

  // --- BLOQUEA EL EMPAREJAMIENTO SI YA TIENE UN NÚMERO CONECTADO ---
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;
    
    try {
      
      // Resto de la lógica de callbacks existente
      await bot.answerCallbackQuery(query.id);
      
      // Borrar mensaje anterior excepto en casos especiales
      if (data !== 'show_prices') {
        try { await bot.deleteMessage(chatId, messageId); } catch(e) {}
      }

      switch(query.data) {
        case 'start_pairing': {
          try {
            const menu = buildPairingMenu();
            // En lugar de editMessageText, enviamos un nuevo mensaje
            await bot.sendMessage(chatId, menu.text, menu.options);
          } catch (err) {
            await handleError(err, chatId, bot);
          }
          userStates[chatId] = { awaitingPairingNumber: true };
          break;
        }

        case 'change_prefix': {
          userStates[chatId] = { awaitingNewPrefix: true };
          await bot.sendMessage(chatId, 
            '*⚙️ Cambiar Prefijo*\n\n' +
            'Envía el nuevo prefijo que deseas usar\n' +
            'Ejemplo: !, #, /, bot\n\n' +
            '_Debe tener entre 1 y 5 caracteres_', {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[
                { text: '⬅️ Volver al Menú', callback_data: 'back_to_menu' }
              ]]
            }
          });
          break;
        }

        case 'cancel_pairing':
          delete userStates[chatId];
          const cancelMsg = await bot.sendMessage(chatId, 'Conexión cancelada');
          setTimeout(() => { try { bot.deleteMessage(chatId, cancelMsg.message_id); } catch (e) {} }, 5000);
          break;

        case 'show_menu':
          await sendUserMenu(chatId);
          break;

        case 'disconnect_whatsapp':
          try {
            // Asegurarse de que la desconexión sea completa y forzada
            const success = await cleanSession(chatId, false, true); // fullClean = true
            
            if (success) {
              await bot.sendMessage(chatId, 'Tu sesion ha sido eliminada correctamente', {
                reply_markup: {
                  inline_keyboard: [[{ text: 'Iniciar sesion', callback_data: 'start_pairing' }]]
                }
              });
            } else {
              await bot.sendMessage(chatId, 'Error al eliminar su sesion por favor intente nuevamente');
            }
          } catch (err) {
            console.error("Error en disconnect_whatsapp:", err);
            await bot.sendMessage(chatId, 'Erorr');
          }
          break;

        case 'admin_menu':
          try { await bot.deleteMessage(chatId, messageId); } catch (e) {}
          await sendAdminMenu(chatId);
          break;

        case 'stats_admin':
          bot.emit('text', { chat: { id: chatId }, text: '/stats', message_id: messageId });
          break;

        case 'panel_admin':
          bot.emit('text', { chat: { id: chatId }, text: '/admin', message_id: messageId });
          break;

        case 'descargar_usuarios':
          try {
            await bot.sendDocument(chatId, path.join(__dirname, 'lib', 'users.json'));
          } catch (e) {
            await bot.sendMessage(chatId, 'Error al enviar el archivo.');
          }
          break;

        case 'back_to_menu': {
          delete userStates[chatId];
          await showMenu(chatId, await getUser(chatId));
          break;
        }
      }
    } catch (err) {
      await handleError(err, chatId, bot);
    }
  });

  // Manejador de mensajes de texto (para recibir el número de teléfono o soporte)
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (userStates[chatId]?.awaitingNewPrefix && msg.text) {
      const newPrefix = msg.text.trim();
      if (newPrefix.length > 0 && newPrefix.length <= 5 && !/\s/.test(newPrefix)) {
        setPrefix(chatId, newPrefix);
        delete userStates[chatId];
        await bot.sendMessage(chatId, `✅ Prefijo actualizado a: \`${newPrefix}\``, { 
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              { text: '⬅️ Volver al Menú', callback_data: 'back_to_menu' }
            ]]
          }
        });
      } else {
        await bot.sendMessage(chatId, 'Prefijo inválido', {
          reply_markup: {
            inline_keyboard: [[
              { text: '⬅️ Volver al Menú', callback_data: 'back_to_menu' }
            ]]
          }
        });
      }
      return;
    }

    if (userStates[chatId]?.awaitingSupport && msg.text) {
    }

    // Manejador del número de teléfono (proceso de emparejamiento)
    if (!userStates[chatId]?.awaitingPairingNumber || !msg.text) return;

    try {
        const number = msg.text.replace(/[^0-9]/g, '');
        if (!/^\d{10,15}$/.test(number)) {
            delete userStates[chatId];
            const errorMsg = await bot.sendMessage(chatId, '*ERROR*: Debe tener entre 10 y 15 dígitos (ej: +593969533280).', { parse_mode: 'Markdown' });
            setTimeout(() => { try { bot.deleteMessage(chatId, errorMsg.message_id); } catch (e) {} }, 5000);
            return;
        }

        const processingMsg = await bot.sendMessage(chatId, 'Generando código, por favor espera...');
        
        try {
            // Primero actualizamos la base de datos
            await updateUserWhatsapp(chatId, number).catch(e => {
                console.error('[DB] Error actualizando usuario:', e);
                throw e;
            });
            
            console.log(`[✓] Número ${number} registrado para usuario ${chatId}`);
            
            // Luego iniciamos la sesión
            await startSession(chatId, number);
            
            let code = null, tries = 0;
            const sessionPath = path.join(__dirname, 'lib', 'pairing', String(chatId), number);
            const pairingFile = path.join(sessionPath, 'pairing.json');
            
            while (tries < 30 && !code) {
              if (fs.existsSync(pairingFile)) {
                try {
                  const data = JSON.parse(fs.readFileSync(pairingFile));
                  code = data.code;
                } catch (e) {}
              }
              if (!code) {
                await new Promise(r => setTimeout(r, 1000));
                tries++;
              }
            }

            try { await bot.deleteMessage(chatId, processingMsg.message_id); } catch(e) {}

            if (code) {
              try {
                  // Actualizar número en la base de datos
                  await updateUserWhatsapp(chatId, number);
                  console.log(`[✓] Número ${number} registrado para usuario ${chatId}`);

                  const messageText = 
                      `<blockquote>📱 <b>CÓDIGO DE VINCULACIÓN</b>\n\n` +
                      `🔑 <code>${code}</code>\n\n` +
                      `1️⃣ Abre WhatsApp\n` +
                      `2️⃣ Vincular Dispositivo > vincular con número\n` +
                      `3️⃣ Ingresa el código\n\n` +
                      `⏱️ <i>Expira en 45 segundos</i></blockquote>`;

                  const pairingCodeMsg = await bot.sendMessage(chatId, messageText, {
                      parse_mode: 'HTML'
                  });

                  // Monitoreo de conexión mejorado
                  let connected = false;
                  const sessionPath = path.join(__dirname, 'lib', 'pairing', String(chatId), number);
                  
                  const checkInterval = setInterval(async () => {
                      if (await isFullyConnected(sessionPath)) {
                          connected = true;
                          clearInterval(checkInterval);
                          
                          try {
                              await bot.deleteMessage(chatId, pairingCodeMsg.message_id);
                              await bot.sendMessage(chatId, 
                                  '✅ *CONECTADO*\n\n' +
                                  '• Dispositivo vinculado exitosamente\n' +
                                  '• Usa /menu para ver los comandos', {
                                  parse_mode: 'Markdown',
                                  reply_markup: {
                                      inline_keyboard: [[
                                          { text: '⬅️ Volver al Menú', callback_data: 'back_to_menu' }
                                  ]]
                              }
                          });
                          } catch (e) {
                              console.error('[ERROR] Al enviar mensaje de conexión:', e);
                          }
                      }
                  }, 1000);

                  // Timeout más corto
                  setTimeout(() => {
                      if (!connected) {
                          clearInterval(checkInterval);
                          try {
                              bot.sendMessage(chatId, 
                                  '❌ *Tiempo agotado*\n\n' +
                                  'No se detectó la conexión.\n' +
                                  'Intenta nuevamente.', {
                                  parse_mode: 'Markdown',
                                  reply_markup: {
                                      inline_keyboard: [[
                                          { text: '🔄 Reintentar', callback_data: 'start_pairing' }
                                  ]]
                              }
                          });
                          } catch (e) {
                              console.error('[ERROR] Al enviar mensaje de timeout:', e);
                          }
                      }
                  }, 45000);

              } catch (e) {
                  console.error('[ERROR] En proceso de pairing:', e);
                  await bot.sendMessage(chatId, '❌ Error al vincular. Intenta nuevamente.');
              }
            } else {
              await bot.sendMessage(chatId, 'No se pudo generar el codigo. Intenta nuevamente....');
            }
        } catch (e) {
          console.error('Error en el proceso de pairing:', e);
          try { await bot.deleteMessage(chatId, processingMsg.message_id); } catch(e) {}
          await bot.sendMessage(chatId, 'Ocurrió un error al generar el código. Contacta al administrador.');
        }
    } catch (err) {
        console.error('[ERROR] Error general:', err);
        await bot.sendMessage(chatId, 'Ocurrió un error inesperado. Por favor, intenta nuevamente.');
    }
  });

  // Panel de administración solo para admin
  bot.onText(/\/admin/, async (msg) => {
    if (!isAdmin(msg.chat.id)) return;
    await sendAdminMenu(msg.chat.id);
  });

  // Menú especial para admins con todos los comandos de administración
  bot.onText(/\/adminmenu/, async (msg) => {
    if (!isAdmin(msg.chat.id)) return;
    await sendAdminMenu(msg.chat.id);
  });

  // Menú admin interactivo (agrega botones para activar/desactivar free)
  async function sendAdminMenu(chatId) {
    const texto =
      `🛠️ <b>Menú Especial Admin</b>\n\n` +
      `Gestiona usuarios VIP, notificaciones y modo FREE:\n\n` +
      `• <b>Agregar VIP</b>\n` +
      `• <b>Notificar a VIPs</b>\n` +
      `• <b>Ver estadísticas</b>\n` +
      `• <b>Ver panel</b>\n` +
      `• <b>Descargar usuarios</b>\n` +
      `• <b>Activar/Desactivar FREE</b>\n`;

    bot.sendMessage(chatId, texto, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Agregar VIP', callback_data: 'admin_addvip' }],
          [{ text: '📢 Notificar VIPs', callback_data: 'admin_notificar' }],
          [{ text: '📊 Estadísticas', callback_data: 'admin_stats' }],
          [{ text: '👑 Panel', callback_data: 'admin_panel' }],
          [{ text: '⬇️ Descargar usuarios', callback_data: 'admin_descargar_usuarios' }],
          [
            { text: '🟢 Activar FREE', callback_data: 'admin_free_on' },
            { text: '🔴 Desactivar FREE', callback_data: 'admin_free_off' }
          ]
        ]
      }
    });
  }

  // Listener único para todos los botones admin (agrega lógica para free)
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    // Solo admins pueden usar el menú admin
    if (data.startsWith('admin_') && !isAdmin(chatId)) return;

    // Borra el mensaje del menú anterior para mantener limpio el chat
    if (data.startsWith('admin_')) {
      try { await bot.deleteMessage(chatId, messageId); } catch (e) {}
    }

    switch (data) {

      case 'admin_panel':
        await sendAdminPanel(chatId);
        break;

    }
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    // Mantener esta lógica de token dentro del manejador de mensajes
    if (userStates[chatId]?.awaitingToken && msg.text) {
      const token = msg.text.trim().toUpperCase();
      
      if (verifyAndActivateToken(token, chatId)) {
        delete userStates[chatId];
        await bot.sendMessage(chatId, 
          '✅ *Token Activado*\n\n' +
          'Ahora tienes acceso al bot.\n' +
          'Usa /menu para ver los comandos disponibles.',
          { parse_mode: 'Markdown' }
        );
        await showMenu(chatId, await getUser(chatId));
      } else {
        await bot.sendMessage(chatId, 'Token inválido o ya utilizado.');
      }
      return;
    }
  });

  bot.onText(/\/newtoken/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAdmin(chatId)) {
      await bot.sendMessage(chatId, 'Solo administradores pueden usar este comando.');
      return;
    }

    try {
      const result = createNewToken();
      await bot.sendMessage(chatId,
        `✨ *Nuevo Token Generado*\n\n` +
        `Token: \`${result.token}\`\n\n` +
        `📊 *Estadísticas:*\n` +
        `• Tokens disponibles: ${result.available}\n` +
        `• Tokens usados: ${result.used}\n` +
        `• Máximo permitido: ${result.max}`,
        { parse_mode: 'Markdown' }
      );
    } catch (e) {
      await bot.sendMessage(chatId, '❌ ' + (e.message || 'Error al generar el token.'));
    }
  });
  
  // Comando para eliminar un usuario
  bot.onText(/\/deluser (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (!isAdmin(chatId)) {
      await bot.sendMessage(chatId, 'Solo los administradores pueden usar este comando.');
      return;
    }

    const userIdToDelete = Number(match[1]);
    if (!userIdToDelete) {
      await bot.sendMessage(chatId, 'Uso: /deluser <ID de Telegram>');
      return;
    }

    try {
      // Limpiar sesión de WhatsApp si existe
      await cleanSession(userIdToDelete, false); // No notificar al usuario eliminado

      // Revocar token
      const tokenRevoked = revokeTokenByTelegramId(userIdToDelete);
      
      // Eliminar usuario de users.json
      const userDeleted = await deleteUser(userIdToDelete);

      let response = `Resultado para el ID ${userIdToDelete}:\n\n`;
      response += tokenRevoked ? '✅ Token revocado.\n' : '⚠️ No se encontró token para revocar.\n';
      response += userDeleted ? '✅ Usuario eliminado de la base de datos.\n' : '⚠️ Usuario no encontrado en la base de datos.\n';

      await bot.sendMessage(chatId, response);

    } catch (e) {
      console.error('Error al eliminar usuario:', e);
      await bot.sendMessage(chatId, `❌ Error al procesar la solicitud para el ID ${userIdToDelete}.`);
    }
  });

  // Comando para listar usuarios con acceso
  bot.onText(/\/users/, async (msg) => {
    const chatId = msg.chat.id;
    if (!isAdmin(chatId)) {
      await bot.sendMessage(chatId, 'Solo los administradores pueden usar este comando.');
      return;
    }

    try {
      const usersWithAccess = getUsersWithAccess();
      
      if (usersWithAccess.length === 0) {
        await bot.sendMessage(chatId, 'No hay usuarios con acceso actualmente.');
        return;
      }

      let userListText = '👥 *Usuarios con Acceso*\n\n';
      
      for (const user of usersWithAccess) {
        try {
          const chatInfo = await bot.getChat(user.telegramId);
          const name = chatInfo.first_name || '';
          const lastName = chatInfo.last_name || '';
          const username = chatInfo.username ? `(@${chatInfo.username})` : '';
          userListText += `• *ID:* \`${user.telegramId}\`\n`;
          userListText += `  *Nombre:* ${name} ${lastName} ${username}\n\n`;
        } catch (e) {
          userListText += `• *ID:* \`${user.telegramId}\`\n`;
          userListText += `  *Nombre:* (No se pudo obtener)\n\n`;
          console.error(`No se pudo obtener info para el chat ${user.telegramId}:`, e.message);
        }
      }

      await bot.sendMessage(chatId, userListText, { parse_mode: 'Markdown' });

    } catch (e) {
      console.error('Error al listar usuarios:', e);
      await bot.sendMessage(chatId, '❌ Error al obtener la lista de usuarios.');
    }
  });

  // Botón de estadísticas
  async function sendAdminStats(chatId) {
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'lib', 'users.json'), 'utf8'));
    const now = new Date();
    const vipActivos = users.filter(u => u.expires && new Date(u.expires) > now).length;
    const total = users.length;
    const sesionesWA = users.filter(u => u.whatsapp_number && u.whatsapp_number !== '').length;
    let texto = `📊 <b>Estadísticas del Bot</b>\n\n`;
    texto += `<b>Usuarios totales:</b> ${total}\n`;
    texto += `<b>VIP activos:</b> ${vipActivos}\n`;
    texto += `<b>Sesiones WhatsApp activas:</b> ${sesionesWA}\n`;
    await bot.sendMessage(chatId, texto, { parse_mode: 'HTML' });
  }

  // Botón de panel
  async function sendAdminPanel(chatId) {
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'lib', 'users.json'), 'utf8'));
    let texto = `👑 <b>Panel Admin</b>\n\n<b>Usuarios VIP:</b> ${users.length}\n`;
    texto += users.map(u => `• <b>ID:</b> <code>${u.telegram_id}</code> | <b>Expira:</b> ${u.expires ? u.expires.split('T')[0] : 'N/A'} | <b>WA:</b> ${u.whatsapp_number || 'No vinculado'}`).join('\n');
    await bot.sendMessage(chatId, texto, { parse_mode: 'HTML' });
  }
}

// --- UTILIDADES DEL SISTEMA ---
function getSystemInfo() {
  const totalMemMB = Math.round(os.totalmem() / (1024 * 1024 * 1024) * 100) / 100;
  const freememMB = Math.round(os.freemem() / (1024 * 1024 * 1024) * 100) / 100;
  const usedMemMB = Math.round((totalMemMB - freememMB) * 100) / 100;
  const uptime = Math.floor(process.uptime());
  
  return {
    totalMem: totalMemMB,
    usedMem: usedMemMB,
    uptime: `${Math.floor(uptime/3600)}h ${Math.floor((uptime%3600)/60)}m`
  };
}

// Auto-reload para desarrollo
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`Update ${__filename}`);
  delete require.cache[file];
  require(file);
});