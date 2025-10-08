const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const crypto = require('crypto');

const app = express();
app.use(express.json({ limit: '50mb' })); // Acepta payloads grandes

const PORT = 3000; // Puerto para la comunicación interna
const TEMP_DIR = path.join(__dirname, 'tempo');

// Asegurarse de que el directorio temporal exista
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

app.post('/convert', async (req, res) => {
    const { audioUrl, title } = req.body;
    if (!audioUrl || !title) {
        return res.status(400).json({ error: 'Faltan parámetros: audioUrl y title son requeridos.' });
    }

    const uniqueId = crypto.randomBytes(8).toString('hex');
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const mp3Path = path.join(TEMP_DIR, `${safeTitle}_${uniqueId}.mp3`);
    const opusPath = path.join(TEMP_DIR, `${safeTitle}_${uniqueId}.opus`);

    try {
        const audioBuffer = await fetch(audioUrl).then(r => r.buffer());
        fs.writeFileSync(mp3Path, audioBuffer);

        // La bomba de tiempo (ffmpeg) explota aquí, de forma segura, lejos de tu bot.
        execSync(`ffmpeg -i "${mp3Path}" -vn -c:a libopus -b:a 128k "${opusPath}"`);

        res.sendFile(opusPath, (err) => {
            if (err) {
                console.error('Error al enviar el archivo:', err);
            }
            // Autolimpieza de archivos temporales
            fs.unlinkSync(mp3Path);
            fs.unlinkSync(opusPath);
        });

    } catch (error) {
        console.error('Error catastrófico en el búnker de conversión:', error);
        res.status(500).json({ error: 'La conversión falló miserablemente.' });
        // Limpieza en caso de error
        if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
        if (fs.existsSync(opusPath)) fs.unlinkSync(opusPath);
    }
});

app.listen(PORT, () => {
    console.log(`[💥] BÚNKER DE CONVERSIÓN LISTO Y ARMADO EN EL PUERTO ${PORT}.`);
});