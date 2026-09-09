const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'raid',
    alias: ['steal', 'capture'],
    desc: 'Captures all group members into a file and prepares for transfer.',
    run: async ({ sock, msg, sender, isOwner }) => {
        if (!isOwner) return sock.sendMessage(sender, { text: '👑 Only the King can order a Raid.' });

        const groupId = msg.key.remoteJid;
        const groupMetadata = await sock.groupMetadata(groupId);
        
        // Get all members
        const members = groupMetadata.participants;
        
        // Create a filename based on group name and timestamp
        const groupName = groupMetadata.subject.replace(/[^a-zA-Z0-9]/g, '_');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `./data/raid_${groupName}_${timestamp}.txt`;

        // Ensure directory exists
        if (!fs.existsSync('./data')) {
            fs.mkdirSync('./data', { recursive: true });
        }

        // Write to file
        let fileContent = `📂 RAID DATA: ${groupMetadata.subject}\n`;
        fileContent += `📅 Captured: ${new Date().toLocaleString()}\n`;
        fileContent += `👥 Total Members: ${members.length}\n`;
        fileContent += `========================================\n`;

        members.forEach(member => {
            // Format: Name | Phone | ID
            const name = member.name || member.id.split('@')[0];
            fileContent += `${name} | ${member.id.split('@')[0]}@s.whatsapp.net | ${member.id}\n`;
        });

        try {
            await fs.promises.writeFile(fileName, fileContent);
            
            // Send the file to the owner (or the group if you prefer)
            await sock.sendMessage(sender, { 
                document: { url: fileName }, 
                mimetype: 'text/plain', 
                fileName: `raid_${groupName}_${timestamp}.txt` 
            }, { quoted: msg });

            await sock.sendMessage(sender, { text: `✅ Raid Captured! File sent. Use !transfer <groupId> <fileName> to execute.` });
        } catch (e) {
            await sock.sendMessage(sender, { text: '❌ Failed to save raid data.' });
        }
    }
};
