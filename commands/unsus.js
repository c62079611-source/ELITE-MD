// Counter-Command: unsus
module.exports.unsus = {
    name: 'unsus',
    alias: ['forgive', 'clear_sus'],
    desc: 'Unbans a SUS user immediately.',
    run: async ({ sock, msg, args, sender, isOwner }) => {
        if (!isOwner) return sock.sendMessage(sender, { text: '👑 Only the King can forgive.' });
        
        const target = args[0] || (msg.quoted ? msg.quoted.sender : null);
        if (!target) return sock.sendMessage(sender, { text: '❌ Tag or reply to someone to unsusp them.' });

        const targetId = target.split('@')[0] + '@s.whatsapp.net';

        // Remove from global ban list
        await sock.updateBanList(targetId, 'remove');

        // Optionally re-add them to the group if they were kicked
        // Check if bot is admin in the group where they were banned
        // For simplicity, we just send a message confirming they are free
        await sock.sendMessage(sender, { text: `✅ ${targetId.split('@')[0]} is forgiven. Their SUS status is cleared.` });
    }
