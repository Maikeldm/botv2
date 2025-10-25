// plugins/lin.js (OPTIMIZADO)

module.exports = {
    // Nombre principal del comando
    name: 'lin',
    
    // Alias (si los tuviera)
    alias: [],

    // La función principal que se ejecutará
    async execute(conn, m, args, context) {
        
        // 1. Extraemos las variables que necesitamos del 'context'
        const { isBot, isCreator, from, participants, reply, isGroup } = context;

        // 2. Seguridad
        if (!isBot && !isCreator) return;

        // 3. Lógica para "no-grupo" (se mantiene igual, es rápida)
        if (!isGroup) { //
            let res = await conn.fetchStatus(from); //
            console.log(res); 
            let status = res[0]?.status.status || "N/A"; //
            let setAt = res[0]?.status.setAt || "N/A"; //
            let id = res[0]?.id || "N/A"; //
            let resultText = "Info:\n";
            resultText += `Id: *${id}*\nStatus: *${status}*\nTime: *${setAt}*\n---------------------------\n`; //
            await conn.sendMessage(from, { text: resultText }); //
            return;
        }

        // 4. LÓGICA DE GRUPO (¡OPTIMIZADA!)
        
        // Mensaje de espera (IMPORTANTE, porque tomará unos segundos)
        await reply(`🔍 Obteniendo info de ${participants.length} miembros... (Esto puede tardar un momento)`);

        // Creamos un array de "promesas".
        // Pedimos todos los status al mismo tiempo.
        const statusPromises = participants.map(jidInfo => 
            conn.fetchStatus(jidInfo.id).catch(e => {
                console.error(`Error fetching status for ${jidInfo.id}:`, e.message);
                return null; // Si falla, devolvemos null
            })
        );

        // Ejecutamos TODAS las peticiones en paralelo y esperamos a que terminen
        const results = await Promise.all(statusPromises);

        // Construimos el texto (¡ya no usamos 'sleep'!)
        let resultText = "";
        let count = 0;
        
        for (const resArray of results) {
            // Ignoramos los que fallaron o no tienen info
            if (!resArray || !resArray[0] || !resArray[0].status) continue; 

            const res = resArray[0];
            let status = res.status.status || "N/A";
            let setAt = res.status.setAt || "N/A";
            let id = res.id || "N/A";
            
            resultText += `Id: *${id.split('@')[0]}*\nStatus: *${status}*\nTime: *${setAt}*\n---------------------------\n`;
            count++;
        }
        
        const finalText = `✅ Info obtenida de ${count}/${participants.length} miembros:\n\n` + resultText;

        // Enviamos el mensaje final (solo uno)
        await conn.sendMessage(from, { text: finalText });
    }
};