// plugins/play.js

// Importamos 'node-fetch' porque este comando lo necesita para las llamadas a la API
const fetch = require('node-fetch');

module.exports = {
    name: 'play',
    alias: [], // Puedes añadir alias como ['p', 'yt'] si quieres

    async execute(conn, m, args, context) {
        
        // 1. Extraemos las variables que necesitamos del 'context'
        const { isBot, q, reply, from } = context;

        // 2. Tu código original, sin ninguna modificación en su lógica
        if (!isBot) return;
        if (!q) return reply('`Ingresa el nombre de la canción`');
        
        try {
            // 1. OBTENER INFO Y AUDIO URL DE LA API
            const apiUrl = `https://api.nexfuture.com.br/api/downloads/youtube/play?query=${encodeURIComponent(q)}`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`La API de música falló: ${response.status}`);
            
            const songData = await response.json();
            if (!songData.status || !songData.resultado) return reply('No se encontraron resultados para esa canción.');
            
            const { imagem, titulo, desc, tempo, views, audio: audioUrl } = songData.resultado;
            const caption = `> *Título:* ${titulo}\n> *Duración:* ${tempo}\n> *Vistas:* ${views}\n\n\`_Procesando audio..._\``;
            
            await conn.sendMessage(from, { 
                image: { url: imagem }, 
                caption 
            }, { quoted: m });

            // 2. DELEGAR LA CONVERSIÓN AL MICROSERVICIO
            const conversionResponse = await fetch('http://localhost:3000/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioUrl: audioUrl, title: titulo })
            });

            if (!conversionResponse.ok) {
                console.error('El servicio de conversión devolvió un error:', await conversionResponse.text());
                throw new Error('El servicio de conversión falló.');
            }

            const opusBuffer = await conversionResponse.buffer();

            // 3. ENVIAR EL RESULTADO FINAL
            await conn.sendMessage(from, { 
                audio: opusBuffer, 
                mimetype: 'audio/ogg; codecs=opus', 
                ptt: false
            }, { quoted: m });

        } catch (err) {
            console.error(err);
            reply(`Error al procesar la canción.`);
        }
    }
};