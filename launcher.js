const cluster = require('cluster');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');

/**
 * =================================================================
 * MODO ESTABLE ACTIVADO
 * =================================================================
 * * La siguiente línea es la clave de todo. Al poner 'false && ...', la
 * condición NUNCA se cumplirá. Esto desactiva de forma segura el
 * código que crea múltiples clones (workers) y nos asegura que el bot
 * siempre se ejecutará en el bloque 'else', como un único proceso
 * con un solo cerebro y memoria persistente.
 * * ¡Adiós a la inestabilidad!
 * */
if (false && cluster.isPrimary) {

    // NINGÚN CÓDIGO DENTRO DE ESTE BLOQUE SE EJECUTARÁ JAMÁS.
    // Lo dejamos aquí por si en un futuro lejano quisieras revertir el cambio,
    // simplemente cambiando 'false' por 'true'.

    const numWorkers = os.cpus().length;
    console.log(`[🚀 MODO DIOS] Proceso Primario ${process.pid} activado.`);
    console.log(`[🔥] Desplegando ${numWorkers} clones del bot para máxima potencia.`);

    const workers = [];
    for (let i = 0; i < numWorkers; i++) {
        const worker = cluster.fork();
        workers.push(worker);
    }
    // ...toda la lógica de sincronización de sesiones queda desactivada.

} else {

    // ✅ ESTE ES EL ÚNICO CÓDIGO QUE SE EJECUTARÁ AL INICIAR.
    console.log(`[⚙️ MODO ESTABLE] Bot iniciado en proceso único (PID: ${process.pid}). ¡Máxima fiabilidad!`);

    // Tu optimización de caché de RAM se mantiene, es una excelente práctica.
    const originalReadFileSync = fs.readFileSync;
    const fileCache = new Map();
    const filesToCache = [
        './travas/ios4.js', './travas/ios7.js', './travas/ios6.js',
        './travas/travadoc.js', './travas/crash.zip', './src/opa.webp',
        './src/foto.jpg', './src/thumb.jpg', './media/thumb.jpg', './media/ola.jpg'
    ];

    console.log(`[🧠] Precargando ${filesToCache.length} assets en la memoria RAM...`);
    filesToCache.forEach(filePath => {
        try {
            const absolutePath = path.resolve(__dirname, filePath);
            const fileContent = originalReadFileSync(absolutePath);
            fileCache.set(absolutePath, fileContent);
        } catch (error) {
            // Ignoramos si un archivo no existe para no detener el arranque.
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
    console.log(`[👍] Optimización de RAM aplicada correctamente.`);

    require('./main.js');
}