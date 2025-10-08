const fs = require('fs');
const path = require('path');

const PREFIXES_FILE = path.join(__dirname, 'prefixes.json');

// Crear automáticamente si no existe
if (!fs.existsSync(PREFIXES_FILE)) {
  fs.writeFileSync(PREFIXES_FILE, '{}', 'utf8');
}

function loadPrefixes() {
  try {
    return JSON.parse(fs.readFileSync(PREFIXES_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function savePrefixes(prefixes) {
  fs.writeFileSync(PREFIXES_FILE, JSON.stringify(prefixes, null, 2));
}

function getPrefix(telegramId) {
  const prefixes = loadPrefixes();
  return prefixes[String(telegramId)] || '?'; // El '?' es el prefijo por defecto
}

function setPrefix(telegramId, newPrefix) {
  const prefixes = loadPrefixes();
  prefixes[String(telegramId)] = newPrefix;
  savePrefixes(prefixes);
}

module.exports = { getPrefix, setPrefix };
