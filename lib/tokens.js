const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TOKENS_FILE = path.join(__dirname, 'tokens.json');

// Crear archivo si no existe
const initialData = {
  availableTokens: [],
  usedTokens: {},
  maxTokens: 50
};

if (!fs.existsSync(TOKENS_FILE)) {
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(initialData, null, 2));
}

function loadTokens() {
  return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
}

function saveTokens(data) {
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(data, null, 2));
}

// Crear nuevo token
function createNewToken() {
  const tokens = loadTokens();
  
  // Verificar límite de tokens
  const totalTokens = tokens.availableTokens.length + Object.keys(tokens.usedTokens).length;
  if (totalTokens >= tokens.maxTokens) {
    throw new Error('Límite de tokens alcanzado');
  }

  const newToken = crypto.randomBytes(3).toString('hex').toUpperCase();
  tokens.availableTokens.push(newToken);
  saveTokens(tokens);
  
  return {
    token: newToken,
    available: tokens.availableTokens.length,
    used: Object.keys(tokens.usedTokens).length,
    max: tokens.maxTokens
  };
}

// Verificar y activar token
function verifyAndActivateToken(token, telegramId) {
  const tokens = loadTokens();
  
  // Verificar si el token existe y está disponible
  if (!tokens.availableTokens.includes(token)) {
    return false;
  }

  // Mover token de disponibles a usados
  tokens.availableTokens = tokens.availableTokens.filter(t => t !== token);
  tokens.usedTokens[token] = {
    telegramId,
    usedAt: new Date().toISOString()
  };
  
  saveTokens(tokens);
  return true;
}

// Obtener estadísticas de tokens
function getTokenStats() {
  const tokens = loadTokens();
  return {
    available: tokens.availableTokens.length,
    used: Object.keys(tokens.usedTokens).length,
    max: tokens.maxTokens
  };
}

// Verificar acceso
function hasValidAccess(telegramId) {
  const tokens = loadTokens();
  // Verificar si el ID está en la lista de tokens usados
  return Object.values(tokens.usedTokens).some(t => t.telegramId === telegramId);
}

// Nueva función para revocar un token por ID de Telegram
function revokeTokenByTelegramId(telegramId) {
  const tokens = loadTokens();
  const tokenKey = Object.keys(tokens.usedTokens).find(
    key => tokens.usedTokens[key].telegramId == telegramId
  );

  if (tokenKey) {
    delete tokens.usedTokens[tokenKey];
    saveTokens(tokens);
    return true; // Token revocado
  }
  
  return false; // No se encontró token para ese usuario
}

// Nueva función para obtener todos los usuarios con acceso
function getUsersWithAccess() {
  const tokens = loadTokens();
  return Object.values(tokens.usedTokens).map(t => ({ telegramId: t.telegramId }));
}

module.exports = {
  createNewToken,
  verifyAndActivateToken,
  hasValidAccess,
  getTokenStats,
  revokeTokenByTelegramId,
  getUsersWithAccess
};

