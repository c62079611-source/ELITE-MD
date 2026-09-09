const fs = require('fs');

module.exports = {
    name: 'transfer',
    alias: ['dump', 'raid_transfer'],
    desc: 'Transfers members from a raid file to a new group, skipping existing members.',
    run: async ({ sock, msg, args, sender, isOwner }) => {
        if (!isOwner) return sock.sendMessage(sender, { text: '👑 Only the King commands the transfer.' });
        
        if (args.length < 2) {
            return sock.sendMessage(sender, { 
                text: '❌ Usage: !transfer <newGroupId> <raidFileName>\nExample: !transfer 120363xxxx@g.us raid_GroupA_2026-09-09.txt' 
            });
        }

        const newGroupId = args[0];
        const raidFileName = args[1];

        // Check if file exists
        const filePath = path.join(__dirname, '..', raidFileName); // Adjust path based on your structure
        if (!fs.existsSync(filePath)) {
            return sock.sendMessage(sender, { text: `❌ File not found: ${raidFileName}` });
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n').filter(line => line.trim() !== '' && !line.startsWith('📂') && !line.startsWith('📅') && !line.startsWith('👥') && !line.startsWith('🚀') && !line.startsWith('========================================'));

        // Get current members of the NEW group to avoid duplicates
        const newGroupMeta = await sock.groupMetadata(newGroupId);
        const existingMembersInNewGroup = newGroupMeta.participants.map(p => p.id);

        const toAdd = [];
        const alreadyInNew = [];
        const failed = [];

        for (const line of lines) {
            // Extract ID from line format: "Name | Phone | ID"
            const parts = line.split('|');
            if (parts.length >= 3) {
                const rawId = parts[2].trim(); // The full ID string like "1234567890@s.whatsapp.net"
                
                // Skip if already in the new group
                if (existingMembersInNewGroup.includes(rawId)) {
                    alreadyInNew.push(rawId.split('@')[0]);
                    continue;
                }

                // Add to list
                toAdd.push(rawId);
            }
        }

        await sock.sendMessage(sender, { 
            text: `🚀 Transfer Started!\nTotal to Process: ${toAdd.length}\nAlready in new group: ${alreadyInNew.length}` 
        });

        // Process in batches to avoid rate limits
        const batchSize = 20; // WhatsApp API limit is usually around 50-100 per minute, but 20 is safe
        for (let i = 0; i < toAdd.length; i += batchSize) {
            const batch = toAdd.slice(i, i + batchSize);
            
            try {
                await sock.groupParticipantsUpdate(newGroupId, batch, 'add');
                await sock.sendMessage(sender, { text: `✅ Batch ${Math.floor(i/batchSize) + 1} added.` });
            } catch (e) {
                console.error(`Failed to add batch:`, e);
                failed.push(batch);
            }
            
            // Small delay between batches to be safe
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        await sock.sendMessage(sender, { 
            text: `🏁 Transfer Complete!\nAdded: ${toAdd.length - failed.length}\nFailed: ${failed.length}\nAlready in group: ${alreadyInNew.length}` 
        });
    }
};
