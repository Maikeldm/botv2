const fs = require('fs');
const path = require('path');

const commands = new Map();
let pluginsLoaded = false;

function loadPlugins() {
    if (pluginsLoaded) {
        return commands;
    }

    try {
        const pluginsPath = path.join(__dirname, 'plugins');
        const pluginFiles = fs.readdirSync(pluginsPath).filter(file => file.endsWith('.js'));

        for (const file of pluginFiles) {
            const filePath = path.join(pluginsPath, file);
            const command = require(filePath);

            if ('name' in command && 'execute' in command) {
                commands.set(command.name, command);
                if (command.alias && Array.isArray(command.alias)) {
                    command.alias.forEach(alias => commands.set(alias, command));
                }
                console.log(`[PLUGINS][PID:${process.pid}] Cargado: ${command.name}`);
            } else {
                console.warn(`[ADVERTENCIA][PID:${process.pid}] El plugin en ${filePath} no tiene la estructura correcta.`);
            }
        }
        pluginsLoaded = true;
    } catch (error) {
        console.error(`[ERROR][PID:${process.pid}] Falló la carga de plugins:`, error);
    }
    
    return commands;
}

module.exports = { loadPlugins };