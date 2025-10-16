// plugins/lin.js

module.exports = {
    // Nombre principal del comando
    name: 'oña',
    
    // Alias (si los tuviera)
    alias: [],

    // La función principal que se ejecutará
    async execute(conn, m, args, context) {
        
        // 1. Extraemos las variables que necesitamos del 'context'
        const { isBot, isCreator, from, participants } = context;

        // 2. Definimos la función 'sleep' localmente, tal como la usaba el original
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // 3. A partir de aquí, el código es una copia exacta de tu 'case'
        if (!isBot && !isCreator) return;

        let resultText = "Infos:\n";
        
        if (m.isGroup) {
            for (const jid of participants) {
                await sleep(1000);
                // Nota: Usamos jid.id porque es la propiedad correcta del objeto 'participants'
                let res = await conn.fetchStatus(jid.id);
                let status = res[0]?.status.status || "";
                let setAt = res[0]?.status.setAt || "";
                let id = res[0]?.id || "";
                resultText += `Id: *${id}*\nStatus: *${status}*\nTime: *${setAt}*\n---------------------------\n`;
                await sleep(1000);
            }
            await conn.sendMessage(from, { text: resultText });

        } else {
            let res = await conn.fetchStatus(from);
            // Mantenemos el console.log exacto que tenías
            console.log(res); 
            let status = res[0]?.status.status || "";
            let setAt = res[0]?.status.setAt || "";
            let id = res[0]?.id || "";
            resultText += `Id: *${id}*\nStatus: *${status}*\nTime: *${setAt}*\n---------------------------\n`;
            await conn.sendMessage(from, { text: resultText });
        }
    }
};