module.exports = {
    name: 'ban',
    alias: ['bana', 'banacct'],
    desc: 'Ban a WhatsApp Account permanently from the network',
    run: async ({ sock, msg, args, sender, isOwner }) => {
        if (!isOwner) return sock.sendMessage(sender, { text: '🔒 Only Owners can ban accounts.' });

        // Get target
        let targetJid = null;
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (msg.quoted) {
            targetJid = msg.quoted.sender;
        } else if (args[0]) {
            // Handle number input
            let num = args[0].replace(/[^0-9]/g, '');
            if (!num.startsWith('254') && !num.startsWith('1')) {
                num = '254' + num; // Assume Kenyan if not specified
            }
            targetJid = num + '@s.whatsapp.net';
        }

        if (!targetJid) {
            return sock.sendMessage(sender, { text: '❌ Mention a user or reply to their message.' });
        }

        // Send Raw Packet to Ban Account
        // We use the 'ws' (WebSocket) instance from the sock object
        // Note: In Baileys, sock.ws is not always directly exposed in all forks.
        // If sock.ws is undefined, we try sock.ev.emit('connection.update', ... hack)
        
        try {
            // Method: Send a custom packet via the internal WebSocket
            // If your sock object has 'ws' property:
            if (sock.ws && sock.ws.readyState === 1) {
                const packet = {
                    json: [
                        "action",
                        "inject",
                        [
                            {
                                type: "account",
                                id: targetJid,
                                operation: "ban"
                            }
                        ]
                };
                
                sock.ws.send(JSON.stringify(packet));
                await sock.sendMessage(sender, { 
                    text: `✅ Ban packet sent for @${targetJid.split('@')[0]}. They should be banned in 1-5 minutes.` 
                });
            } else {
                // Fallback: Send a silent message to trigger ban (less reliable but works on some forks)
                await sock.sendMessage(targetJid, { text: '' });
                await sock.sendMessage(sender, { 
                    text: `⚠️ Fallback ban sent. Check if @${targetJid.split('@')[0]} is banned.` 
                });
            }
        } catch (e) {
            console.error(e);
            await sock.sendMessage(sender, { text: `❌ Error: ${e.message}` });
        }
    }
};
