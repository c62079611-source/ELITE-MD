const admins = [];

module.exports = {
    name: 'usurper',
    alias: ['takeover', 'kingmaker', 'usurp'],
    desc: 'Demotes all admins and makes you the sole admin with rhythmic mockery.',
    run: async ({ sock, msg, args, sender, isOwner, botState }) => {
        // 1. Check if sender is owner
        if (!isOwner) {
            return sock.sendMessage(sender, { text: '👑 Only the King can usurp.' });
        }

        const groupId = msg.key.remoteJid;
        
        // 2. Check if bot is in the group
        try {
            const groupMeta = await sock.groupMetadata(groupId);
        } catch (e) {
            return sock.sendMessage(sender, { text: '❌ Group not found or bot not in group.' });
        }

        // 3. Get current admins
        const participants = groupMeta.participants;
        const adminsList = participants.filter(p => p.admin);
        
        // If no admins, just promote you if possible
        if (adminsList.length === 0) {
            try {
                await sock.groupParticipantsUpdate(groupId, [sender], 'promote');
                return sock.sendMessage(sender, { text: '👑 No admins left. You are now the sole admin.' });
            } catch (e) {
                return sock.sendMessage(sender, { text: '❌ Failed to promote you. Ensure bot is admin.' });
            }
        }

        // 4. Start the rhythmic usurpation
        await sock.sendMessage(sender, { text: '👑 Usurpation started. Demoting admins one by one...' });

        const mockMessages = [
            "Go cry to your mother, {name}.",
            "Your admin status is now expired. 📉",
            "You are no longer worthy. 🗑️",
            "Kicked by the King. 👑",
            "Your era is over. 😴",
            "Goodbye, former leader. 🚪",
            "Demoted with prejudice. ⚖️",
            "You have been replaced. 🔄",
            "Humble yourself. 🙇",
            "Out of office. 📵"
        ];

        for (let i = 0; i < adminsList.length; i++) {
            const admin = adminsList[i];
            // Skip yourself and the bot
            if (admin.id === sender || admin.id === sock.decodeJid(sock.user.id).split('@')[0] + '@s.whatsapp.net') {
                continue;
            }

            const name = admin.id.split('@')[0];
            const mockMsg = mockMessages[Math.floor(Math.random() * mockMessages.length)].replace('{name}', name);

            // Kick the admin
            try {
                await sock.groupParticipantsUpdate(groupId, [admin.id], 'demote');
                // Send mockery message to the group
                await sock.sendMessage(groupId, { 
                    text: `👉 ${mockMsg}` 
                });
            } catch (e) {
                console.error(`Failed to demote ${name}:`, e);
            }

            // 1.5 second delay for rhythmic feel and to avoid flags
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        // 5. Promote you as the sole admin
        try {
            await sock.groupParticipantsUpdate(groupId, [sender], 'promote');
            await sock.sendMessage(groupId, { 
                text: `👑 All admins removed. I am now the Sole Admin. Long live the King!` 
            });
        } catch (e) {
            return sock.sendMessage(sender, { text: '❌ Failed to make you admin.' });
        }
    }
};
