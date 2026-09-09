const ms = require('ms'); // Ensure you have 'ms' package installed, or use Math.random/Date logic below

module.exports = {
    name: 'sus',
    alias: ['tempban', 'mute_sus'],
    desc: 'Bans a user for 24 hours. Use !unsus to free them early.',
    run: async ({ sock, msg, args, sender, isOwner, groupMetadata }) => {
        if (!isOwner) return sock.sendMessage(sender, { text: '👑 Only the King can judge.' });
        
        // Get target
        const target = args[0] || (msg.quoted ? msg.quoted.sender : null);
        if (!target) return sock.sendMessage(sender, { text: '❌ Tag or reply to someone to make them SUS.' });

        // Format target ID (remove @s.whatsapp.net if present)
        const targetId = target.split('@')[0] + '@s.whatsapp.net';

        // 1. Ban the user (restrict from using bot commands)
        // Assuming your bot has a global ban list in a JSON file or DB
        await sock.updateBanList(targetId, 'add', { expires: Date.now() + (24 * 60 * 60 * 1000) }); // 24 hours in ms

        // 2. Kick them from the group if they are still in it
        try {
            await sock.groupParticipantsUpdate(msg.key.remoteJid, [targetId], 'remove');
        } catch (e) {
            // If they are already out, just keep them banned globally
        }

        await sock.sendMessage(msg.key.remoteJid || sender, { 
            text: `🚫 SUSPECT DETECTED!\n\n${targetId.split('@')[0]} has been banned for 24 hours.\n\nReason: Suspicious activity.\n*Use !unsus to forgive them early.*` 
        });
    }
};


};
