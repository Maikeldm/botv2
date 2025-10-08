const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Sistema de respaldo JSON
const DB_FILE = path.join(__dirname, '..', 'users.json');
let useJSON = false; // Flag para usar JSON como respaldo

// Crear/verificar archivo JSON de respaldo
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, '[]', 'utf8');
}

// Intentar inicializar SQLite
const dbPath = path.join(__dirname, 'users.db');
let db;

try {
    // Si la base de datos está corrupta, eliminarla
    if (fs.existsSync(dbPath)) {
        try {
            db = new sqlite3.Database(dbPath);
            db.exec('PRAGMA quick_check;', (err) => {
                if (err) {
                    console.log('[!] Base de datos corrupta, recreando...');
                    fs.unlinkSync(dbPath);
                    initDB();
                }
            });
        } catch (e) {
            console.log('[!] Error al verificar DB, usando JSON:', e);
            useJSON = true;
        }
    } else {
        initDB();
    }
} catch (e) {
    console.log('[!] Error al inicializar SQLite, usando JSON:', e);
    useJSON = true;
}

function initDB() {
    try {
        db = new sqlite3.Database(dbPath);
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                telegram_id INTEGER PRIMARY KEY,
                whatsapp_number TEXT,
                expires TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('[DB] Error creando tabla:', err);
                    useJSON = true;
                }
            });
        });
    } catch (e) {
        console.log('[!] Error al crear DB, usando JSON:', e);
        useJSON = true;
    }
}

// Funciones de manejo de datos
function getUser(telegram_id) {
    return new Promise((resolve, reject) => {
        if (useJSON) {
            const users = loadUsers();
            const user = users.find(u => u.telegram_id === telegram_id) || 
                        { telegram_id, whatsapp_number: null, expires: null };
            resolve(user);
            return;
        }

        db.get('SELECT * FROM users WHERE telegram_id = ?', [telegram_id], (err, row) => {
            if (err) {
                console.log('[!] Error en getUser, usando JSON:', err);
                useJSON = true;
                getUser(telegram_id).then(resolve).catch(reject);
                return;
            }
            resolve(row || { telegram_id, whatsapp_number: null, expires: null });
        });
    });
}

function updateUserWhatsapp(telegram_id, number) {
    return new Promise((resolve, reject) => {
        if (useJSON) {
            try {
                const users = loadUsers();
                const index = users.findIndex(u => u.telegram_id === telegram_id);
                if (index > -1) {
                    users[index].whatsapp_number = number;
                } else {
                    users.push({ telegram_id, whatsapp_number: number });
                }
                saveUsers(users);
                resolve(true);
            } catch (e) {
                reject(e);
            }
            return;
        }

        db.run(
            'INSERT OR REPLACE INTO users (telegram_id, whatsapp_number) VALUES (?, ?)',
            [telegram_id, number],
            function(err) {
                if (err) {
                    console.error('[DB] Error en updateUserWhatsapp:', err);
                    reject(err);
                } else {
                    console.log('[DB] Usuario actualizado correctamente');
                    resolve(this.changes);
                }
            }
        );
    });
}

function clearUserWhatsapp(telegram_id) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET whatsapp_number = NULL WHERE telegram_id = ?',
      [telegram_id],
      function(err) {
        if (err) reject(err);
        resolve(this.changes);
      }
    );
  });
}

function deleteUser(telegram_id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM users WHERE telegram_id = ?', [telegram_id], function(err) {
      if (err) reject(err);
      resolve(this.changes > 0);
    });
  });
}

async function isWhatsappConnected(telegram_id) {
  return new Promise((resolve) => {
    db.get('SELECT whatsapp_number FROM users WHERE telegram_id = ?', [telegram_id], (err, row) => {
      if (err || !row || !row.whatsapp_number) resolve(false);
      else {
        const pairingDir = path.join(__dirname, '..', 'lib', 'pairing', String(telegram_id), row.whatsapp_number);
        const credsPath = path.join(pairingDir, 'creds.json');
        resolve(fs.existsSync(credsPath));
      }
    });
  });
}

function isActive(user) {
  if (!user) return false;
  if (!user.expires) return false;
  return new Date(user.expires) > new Date();
}

// Funciones auxiliares
function loadUsers() {
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch {
        return [];
    }
}

function saveUsers(users) {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}
// Pega esto justo antes de la línea "module.exports"

function findUserByWhatsapp(whatsappNumber) {
    return new Promise((resolve) => {
        const cleanNumber = whatsappNumber.split('@')[0];

        if (useJSON) {
            const users = loadUsers();
            const user = users.find(u => u.whatsapp_number === cleanNumber);
            resolve(user || null);
            return;
        }

        db.get('SELECT * FROM users WHERE whatsapp_number = ?', [cleanNumber], (err, row) => {
            if (err || !row) {
                resolve(null);
            } else {
                resolve(row);
            }
        });
    });
}
// Exportaciones
// Así debe quedar tu código:
module.exports = {
    getUser,
    updateUserWhatsapp,
    clearUserWhatsapp,
    deleteUser,
    isActive,
    db: useJSON ? { all: (q, p, cb) => cb(null, loadUsers()) } : db,
    isWhatsappConnected,

    findUserByWhatsapp, // <-- ¡LA LÍNEA QUE AGREGAMOS!

    loadUsers
};