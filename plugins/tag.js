// plugins/tag.js

module.exports = {
    // Nombre principal del comando
    name: 'tag',
    
    // No tenía alias, así que lo dejamos vacío
    alias: [],

    // La función principal que se ejecutará
    async execute(conn, m, args, context) {
        
        // 1. Extraemos las variables que necesitamos del 'context'
        // 'info' es un alias de 'm', así que ya lo tenemos.
        const { isBot, reply } = context;

        // 2. Aquí va tu código original, sin cambios en la lógica
        if (!isBot) return;
        if (!m.isGroup) return reply("Este comando solo funciona en grupos");
        
        let metadata = await conn.groupMetadata(m.chat);
        let participantes = metadata.participants.map(u => u.id);

        await conn.sendMessage(m.chat, {
            text: "",
            mentions: participantes
        }, { quoted: m.quoted ? m.quoted : m }); // Se usa 'm' que es lo mismo que 'info'
    }
};