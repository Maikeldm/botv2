require('dotenv/config');
const fs = require('fs');
const path = require('path');

global.prefa = ['','!','.',',',';'] 

fs.watchFile(__filename, () => {
  fs.unwatchFile(__filename);
  console.log(`Update ${__filename}`);
  delete require.cache[__filename];
  require(__filename);
});

const config = {
  BOT_TOKEN: process.env.BOT_TOKEN, 
  ADMIN_IDS: process.env.ADMIN_IDS
    ? process.env.ADMIN_IDS.split(',').map(id => Number(id.trim()))
    : [7223378630] 
};

module.exports = {
  config,
  ADMIN_IDS: [7223378630], // IDs de administradores
  CONNECTION_TIMEOUT: 60000,
  RECONNECT_INTERVAL: 10000,
  MAX_RETRIES: 5,
  CLEANUP_INTERVAL: 3600000,
  SESSION_FOLDER: 'sessions',
  BROWSER_CONFIG: ['Windows', 'Firefox', '3.0']
};