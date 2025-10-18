const path = require('path');
const fs = require('fs');

// Definimos la ruta al archivo JSON que será nuestra única base de datos.
const DB_FILE = path.join(__dirname, 'users.json');
const TEMP_DB_FILE = path.join(__dirname, 'users.json.tmp');

// --- Función de Inicialización ---
// Asegura que el archivo JSON exista al iniciar. Si no, lo crea con un array vacío.
function initializeDB() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, '[]', 'utf8');
    }
}

// --- Funciones Auxiliares para leer y escribir en el archivo JSON ---
function loadUsers() {
    try {
        // Leemos el archivo y lo convertimos de texto a un objeto JavaScript.
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (error) {
        console.error('[JSON_DB] Error al leer la base de datos:', error);
        // Si hay un error (ej. archivo corrupto), devolvemos un array vacío para no crashear.
        return [];
    }
}

/**
 * ¡NUEVA VERSIÓN "ANTI-CORRUPCIÓN"!
 * Guarda los usuarios de forma atómica para evitar corrupción de datos.
 */
function saveUsers(users) {
    try {
        // 1. Convertimos el objeto a texto (esto puede fallar si 'users' es circular)
        const data = JSON.stringify(users, null, 2);
        
        // 2. Escribimos los datos en un archivo temporal (.tmp)
        // Si el bot crashea aquí, el 'users.json' original sigue intacto.
        fs.writeFileSync(TEMP_DB_FILE, data, 'utf8');
        
        // 3. Si la escritura fue exitosa, renombramos el .tmp a .json
        // Esta operación es "atómica" (instantánea) y segura.
        fs.renameSync(TEMP_DB_FILE, DB_FILE);

    } catch (error) {
        console.error('[JSON_DB] Error al guardar (atomic save):', error);
        // Si algo falló, borramos el archivo temporal para no dejar basura.
        if (fs.existsSync(TEMP_DB_FILE)) {
            try {
                fs.unlinkSync(TEMP_DB_FILE);
            } catch (e) {
                console.error('[JSON_DB] Error limpiando archivo temporal:', e);
            }
        }
    }
}
// --- Funciones Principales (API del Módulo) ---

/**
 * Obtiene un usuario por su ID de Telegram.
 * Si el usuario no existe, lo crea en memoria para evitar errores.
 * @param {number} telegram_id - El ID de Telegram del usuario.
 * @returns {Promise<Object>} El objeto del usuario.
 */
function getUser(telegram_id) {
    return new Promise((resolve) => {
        const users = loadUsers();
        const user = users.find(u => u.telegram_id === telegram_id);
        // Si no se encuentra el usuario, devolvemos un objeto por defecto.
        resolve(user || { telegram_id, whatsapp_number: null, expires: null });
    });
}

/**
 * Actualiza o crea un usuario con su número de WhatsApp.
 * @param {number} telegram_id - El ID de Telegram.
 * @param {string} number - El número de WhatsApp a vincular.
 * @returns {Promise<boolean>} `true` si la operación fue exitosa.
 */
function updateUserWhatsapp(telegram_id, number) {
    return new Promise((resolve) => {
        const users = loadUsers();
        const index = users.findIndex(u => u.telegram_id === telegram_id);

        if (index > -1) {
            // Si el usuario ya existe, actualizamos su número.
            users[index].whatsapp_number = number;
        } else {
            // Si no existe, lo creamos y lo añadimos a la lista.
            users.push({ 
                telegram_id, 
                whatsapp_number: number,
                expires: null, // Puedes establecer una fecha de expiración por defecto si quieres
                created_at: new Date().toISOString()
            });
        }
        saveUsers(users);
        console.log(`[JSON_DB] Usuario ${telegram_id} actualizado con el número ${number}.`);
        resolve(true);
    });
}

/**
 * Limpia (desvincula) el número de WhatsApp de un usuario.
 * @param {number} telegram_id - El ID de Telegram.
 * @returns {Promise<boolean>} `true` si se encontró y modificó al usuario.
 */
function clearUserWhatsapp(telegram_id) {
    return new Promise((resolve) => {
        const users = loadUsers();
        const index = users.findIndex(u => u.telegram_id === telegram_id);

        if (index > -1) {
            users[index].whatsapp_number = null;
            saveUsers(users);
            resolve(true);
        } else {
            resolve(false); // No se encontró al usuario
        }
    });
}

/**
 * Elimina un usuario por completo de la base de datos.
 * @param {number} telegram_id - El ID de Telegram.
 * @returns {Promise<boolean>} `true` si el usuario fue encontrado y eliminado.
 */
function deleteUser(telegram_id) {
    return new Promise((resolve) => {
        let users = loadUsers();
        const initialLength = users.length;
        // Filtramos la lista para excluir al usuario a eliminar.
        users = users.filter(u => u.telegram_id !== telegram_id);

        if (users.length < initialLength) {
            saveUsers(users);
            resolve(true); // Se eliminó un usuario
        } else {
            resolve(false); // No se encontró al usuario
        }
    });
}

/**
 * Busca a un usuario por su número de WhatsApp.
 * @param {string} whatsappNumber - El número de WhatsApp (con o sin @s.whatsapp.net).
 * @returns {Promise<Object|null>} El objeto del usuario o `null` si no se encuentra.
 */
function findUserByWhatsapp(whatsappNumber) {
    return new Promise((resolve) => {
        const users = loadUsers();
        const cleanNumber = whatsappNumber.split('@')[0];
        const user = users.find(u => u.whatsapp_number === cleanNumber);
        resolve(user || null);
    });
}

/**
 * Comprueba si la sesión de WhatsApp de un usuario está activa (si existe el creds.json).
 * @param {number} telegram_id - El ID de Telegram.
 * @returns {Promise<boolean>} `true` si la sesión está activa.
 */
async function isWhatsappConnected(telegram_id) {
    const user = await getUser(telegram_id);
    if (!user || !user.whatsapp_number) {
        return false;
    }
    const credsPath = path.join(__dirname, '..', 'lib', 'pairing', String(telegram_id), user.whatsapp_number, 'creds.json');
    return fs.existsSync(credsPath);
}

/**
 * Verifica si la suscripción de un usuario está activa.
 * @param {Object} user - El objeto del usuario.
 * @returns {boolean} `true` si la suscripción está activa.
 */
function isActive(user) {
    if (!user || !user.expires) {
        return false;
    }
    return new Date(user.expires) > new Date();
}

// Inicializamos la base de datos al cargar el módulo.
function getAllUsersWithWhatsapp() {
    return new Promise((resolve) => {
        // loadUsers() lee tu archivo users.json
        const users = loadUsers(); 
        
        // Filtramos solo los que tienen un whatsapp_number
        const usersWithWA = users.filter(u => u.whatsapp_number);
        
        // Devolvemos solo los datos que el launcher necesita
        const result = usersWithWA.map(u => ({
          telegram_id: u.telegram_id,
          whatsapp_number: u.whatsapp_number
        }));

        resolve(result); // Devolvemos la lista
    });
}

// Inicializamos la base de datos al cargar el módulo.
initializeDB();

// Exportamos todas las funciones para que el resto del bot pueda usarlas.
module.exports = {
    getUser,
    updateUserWhatsapp,
    clearUserWhatsapp,
    deleteUser,
    findUserByWhatsapp,
    isWhatsappConnected,
    isActive,
    // Exportamos la función para que el launcher pueda obtener la lista de usuarios.
    getAllUsers: loadUsers,
    getAllUsersWithWhatsapp 
};