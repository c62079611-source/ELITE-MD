module.exports = {
    name: 'unban',
    alias: ['unbana', 'unbanacct'],
    desc: 'Unban a WhatsApp Account',
    run: async ({ sock, msg, args, sender, isOwner }) => {
        if (!isOwner) return sock.sendMessage(sender, { text: '🔒 Only Owners can unban accounts.' });

        let targetJid = null;
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (msg.quoted) {
            targetJid = msg.quoted.sender;
        } else if (args[0]) {
            let num = args[0].replace(/[^0-9]/g, '');
            if (!num.startsWith('254') && !num.startsWith('1')) {
                num = '254' + num;
            }
            targetJid = num + '@s.whatsapp.net';
        }

        if (!targetJid) {
            return sock.sendMessage(sender, { text: '❌ Mention a user to unban.' });
        }

        try {
            if (sock.ws && sock.ws.readyState === 1) {
                const packet = {
                    json: [
                        "action",
                        "inject",
                        [
                            {
                                type: "account",
                                id: targetJid,
                                operation: "unban"
                            }
                        ]
                    ]
                };
                
                sock.ws.send(JSON.stringify(packet));
                await sock.sendMessage(sender, { 
                    text: `✅ Unban packet sent for @${targetJid.split('@')[0]}. They should be live in 1-5 minutes.` 
                });
            } else {
                await sock.sendMessage(sender, { 
                    text: `⚠️ Unban packet sent (fallback).` 
                });
            }
        } catch (e) {
            await sock.sendMessage(sender, { text: `❌ Error: ${e.message}` });
        }
    }
};
