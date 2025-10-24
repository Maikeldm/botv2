// lib/heavyCommands.js (NUEVO ARCHIVO)

// Este Set es la única fuente de verdad.
// Si un comando está aquí, main.js lo enviará a un hilo.
module.exports = new Set([
    // Comandos de heavyTasks.js original
    'crashhome-ios',
    'atraso-ui',
    'atraso-v3',
    'document-crash',
    'chat-freeze',
    
    // Comandos pesados de baron.js
    'andro-ios',
    'crash-button',
    'crash-ui',
    'canal-ios',

    // Comandos de tus 5 plugins (EJEMPLO)
    // 'plugin1-bomba',
    // 'plugin2-video-render',
    // ...añade todos tus comandos pesados aquí
]);