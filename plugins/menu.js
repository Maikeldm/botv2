// plugins/menu.js

// Importamos los módulos que este comando necesita
const fs = require('fs');
const os = require('os');
const moment = require('moment-timezone');

module.exports = {
    // Nombre principal del comando
    name: 'menu',
    
    // Otros nombres con los que se puede llamar al comando
    alias: ['start'],

    // La función principal que se ejecutará
    async execute(conn, m, args, context) {
        
        // 1. Extraemos las variables que necesitamos del 'context'
        const { isBot, isCreator, from, pushname } = context;

        // 2. Aquí va el resto de tu código, casi sin cambios
        if (!isBot && !isCreator) return;

        var deviceType = m.key.id.length > 21 ? 'Android' : m.key.id.substring(0, 2) == '3A' ? 'IPhone' : 'WhatsApp Web';
        const hora = moment.tz('America/Sao_Paulo').format('HH:mm:ss');
        const data = moment.tz('America/Sao_Paulo').format('DD/MM/YY');

        const menuzz = fs.readFileSync('./src/thumb.jpg');

        await conn.sendMessage(from, {
            image: { url: './src/foto.jpg' },
            contextInfo: {
                externalAdReply: {
                    title: `𝐏.𝑐ℎ𝑜𝑐𝑜𝑐𝑟𝑖𝑠𝑝𝑦`,
                    body: `𝐵𝑂𝑇 𝑉𝐼𝑃`,
                    mediaType: 4,
                    thumbnail: menuzz,
                    jpegThumbnail: menuzz,
                    mediaUrl: 'KKKKK',
                    sourceUrl: 'KKKK'
                }
            },
            caption: `
╭⪫═════════════════⪫
│  𝐵𝑂𝑇 𝑉𝐼𝑃
│  \`Usuario\`: ${pushname}
│  \`Hora:\` ${hora}
│  \`Fecha:\` ${data}
│  \`Estado:\` Online
│  \`Dispositivo:\` ${deviceType}
│  \`Plataforma:\` ${os.platform()}
│  \`HostName:\` ${os.hostname()}
╰═════════════════╯
  *LISTA DE COMANDOS*
  ANDORID
> statusdelay
> crash-ui
> crash-button
> crash-Chat
> chat-freeze
> atraso-new +593xxx
> crash-chat
> button
> atraso-ui
> atraso-v3
> document-crash
  IOS 
  Crash-ios
> crash-invisible
> crash-ios2 +52xxx
> crash-ios3 +52xxx
> crash-ios4 +52xxx
> home-ios 593xxxx
> catalogo-ios 593xxx

  ADD
> spam-call +593xxx,<cantidad>     
> andro-ios
> canal-adm
> canal-ios
  OTROS 
> play <nombre>  
> lin
> tt link
> nuke
> tag`,
            footer: `𝐏 𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘`,
            buttons: [
                {
                    buttonId: '..',
                    buttonText: { displayText: '.' },
                    type: 4,
                    nativeFlowInfo: {
                        name: 'single_select',
                        paramsJson: JSON.stringify({
                            title: "𝐵𝑂𝑇 𝑉𝐼𝑃",
                            sections: [
                                {
                                    title: "INFO",
                                    rows: [
                                        {
                                            title: " 《 • INFO • 》",
                                            description: "𝐵𝑂𝑇 𝑉𝐼𝑃",
                                            id: `info`
                                        }
                                    ]
                                }
                            ]
                        })
                    }
                },
            ],
            headerType: 1,
            viewOnce: true
        }, { quoted: m });
    }
};