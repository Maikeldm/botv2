// plugins/tiktok.js

const fetch = require('node-fetch');

module.exports = {
    name: 'tiktok',
    alias: ['tt'], // <-- He añadido 'tt' aquí para que también funcione

    // CAMBIO 1: La función ahora acepta un cuarto argumento llamado 'context'
    async execute(conn, m, args, context) {
        
        // CAMBIO 2: Extraemos las variables que necesitamos del 'context'
        const { isBot, reply } = context;

        if (!isBot) return; // Ahora 'isBot' existe y funciona

        const q = args.join(" ");

        if (!q) return reply('*Ingresa el enlace del video de tiktok*');

        try {
            // Enviamos un mensaje de espera para que el usuario sepa que está funcionando
            await reply('📥 Procesando tu video de TikTok, por favor espera...');

            const apiUrl = `https://api.dorratz.com/v2/tiktok-dl?url=${encodeURIComponent(q)}`;
            const noze = await fetch(apiUrl);
            if (!noze.ok) throw new Error(`Error API ${noze.status}`);
            
            const json = await noze.json();
            if (!json.status || !json.data) return reply('No se encontró el video o el enlace no es válido.');

            const { title, duration, repro, like, share, comment, author, music, media } = json.data;
            const caption = `
> *Título:* \`${title}\`
> *Autor:* ${author.nickname} (${author.username})
> *Música:* ${music.title}
> *Duración:* ${duration}s
> *Reproducciones:* ${repro}
> *Likes:* ${like}
> *Comentarios:* ${comment}
> *Compartidos:* ${share}
            `;

            const urlx = media.hd || media.org;
            await conn.sendMessage(m.chat, { 
                video: { url: urlx }, 
                caption: caption.trim()
            }, { quoted: m });

        } catch (err) {
            console.error(err);
            reply('❌ Ocurrió un error al procesar el video de TikTok.');
        }
    }
};