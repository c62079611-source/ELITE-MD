const { getBinaryStreamContent } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'vv',
    alias: ['viewonce', 'extract'],
    desc: 'Extract View Once media and send to owner',
    run: async ({ sock, msg, sender }) => {
        // Only allow owners or if the user specifies a target
        // Here we assume if you use /vv it sends to owner. 
        // If you want to extract from a quoted message:
        
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
            return sock.sendMessage(sender, { text: 'Reply to a View Once message with !vv' });
        }

        // Identify media type
        const viewOnceMsg = quotedMsg.viewOnceMessageV2?.message || quotedMsg.viewOnceMessage;
        if (!viewOnceMsg) {
            return sock.sendMessage(sender, { text: 'That is not a View Once message.' });
        }

        const mediaType = Object.keys(viewOnceMsg)[0]; // 'imageMessage', 'videoMessage', etc.
        
        // Download media
        const stream = await getBinaryStreamContent(viewOnceMsg[mediaType]);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Send to Owner's Private Chat
        // We send to the OWNER's ID (hardcoded or from ENV)
        const ownerJid = process.env.OWNERS[0] + '@s.whatsapp.net';
        
        const caption = "📤 *Extracted View Once Media*";
        
        if (mediaType === 'imageMessage') {
            await sock.sendMessage(ownerJid, { 
                image: buffer, 
                caption: caption 
            });
        } else if (mediaType === 'videoMessage') {
            await sock.sendMessage(ownerJid, { 
                video: buffer, 
                caption: caption,
                gifPlayback: viewOnceMsg[mediaType].gifPlayback
            });
        } else if (mediaType === 'audioMessage') {
            await sock.sendMessage(ownerJid, { 
                audio: buffer, 
                mimetype: 'audio/mp4' 
            });
        } else {
            // Generic file send
            const filePath = path.join(__dirname, 'temp_media');
            fs.writeFileSync(filePath, buffer);
            await sock.sendMessage(ownerJid, { 
                document: { url: `file://${filePath}` }, 
                caption: caption 
            });
        }

        // Notify the user
        await sock.sendMessage(sender, { text: '✅ Media sent to Owner\'s private chat.' });
    }
};
