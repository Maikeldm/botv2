// plugins/catalogo-ios.js

// Importamos 'fs' porque el plugin lo necesita para leer la imagen
const fs = require('fs');

module.exports = {
    name: 'catalogo-ios',
    alias: [],

    async execute(conn, m, args, context) {
        
        // 1. Extraemos TODAS las variables y funciones necesarias del 'context'
        const { 
            isBot, 
            isCreator, 
            from, 
            prepareWAMessageMedia, 
            generateWAMessageFromContent, 
            proto, 
            cataui,
            olaJpg,
        } = context;

        // 2. Tu código original, sin ninguna modificación en su lógica
        if (!isBot && !isCreator) return;

        var messa = await prepareWAMessageMedia( image, olaJpg , { upload: conn.waUploadToServer });
        
        var catalog = generateWAMessageFromContent(from, proto.Message.fromObject({
            "productMessage": {
                "product": {
                    "productImage": messa.imageMessage,
                    "productId": "449756950375071",
                    "title": "🎠" + cataui,
                    "description": cataui,
                    "currencyCode": `BRL`,
                    "footerText": cataui,
                    "priceAmount1000": "1000000000",
                    "productImageCount": 1,
                    "firstImageId": 1,
                    "salePriceAmount1000": "1000000000",
                    "retailerId": ` `,
                    "url": "wa.me/9473839229292"
                },
                "businessOwnerJid": "526421147692@s.whatsapp.net",
            }
        }), { userJid: from });
        
        conn.relayMessage(from, catalog.message, { messageId: catalog.key.id });
    }
};