// plugins/spam-call.js

module.exports = {
    name: 'spam-call',
    alias: [],

    async execute(conn, m, args, context) {
        
        // 1. Extraemos las variables necesarias del 'context'
        const { isBot, isCreator, q, reply, prefix, from, sleep } = context;

        // 2. Tu código original, sin ninguna modificación
        if (!isBot && !isCreator) return;
        if (!q) return reply(`Formato incorrecto. Ejemplo:\n${prefix + this.name} 543xxx,<cantidad>`);

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

            await conn.sendMessage(from, {
                text: `> Se completo ${cantidad} llamada a ${target.split('@')[0]}.`,
                edit: sentMsg.key
            });

        } catch (error) {
            console.error(`Error al ofrecer llamada:`, error);
            reply(`Error`);
        }
    }
};