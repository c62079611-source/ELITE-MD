const fs = require('fs');
const path = require('path');

// Ensure data directory exists
if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
const stickerFile = path.join(__dirname, '../data/sticker_cmds.json');

// Load existing data
let stickerDB = [];
if (fs.existsSync(stickerFile)) {
    try {
        stickerDB = JSON.parse(fs.readFileSync(stickerFile, 'utf-8'));
    } catch (e) {
        stickerDB = [];
    }
}

module.exports = {
    name: 'setstickercmd',
    alias: ['sstickcmd', 'stickcmd'],
    desc: 'Convert a sticker into a command. Usage: !setstickercmd [command_name] [off]',
    run: async ({ sock, msg, args, sender, isOwner }) => {
        if (!isOwner) return sock.sendMessage(sender, { text: '👑 Only the King can bind stickers.' });

        // Check if user is replying to a message
        const quotedMsg = msg.quoted;
        if (!quotedMsg || !quotedMsg.msg || !quotedMsg.msg.imageMessage && !quotedMsg.msg.stickerMessage) {
            return sock.sendMessage(sender, { text: '❌ Reply to a sticker or image with: `!setstickercmd <command_name>`' });
        }

        let stickerHash = '';
        let type = 'sticker'; // or 'image'

        if (quotedMsg.msg.stickerMessage) {
            stickerHash = quotedMsg.msg.stickerMessage.fileSha256.toString('hex');
        } else if (quotedMsg.msg.imageMessage) {
            stickerHash = quotedMsg.msg.imageMessage.fileSha256.toString('hex');
            type = 'image';
        } else {
            return sock.sendMessage(sender, { text: '❌ Only Stickers or Images can be mapped to commands.' });
        }

        const commandName = args[0].toLowerCase();
        
        // Check if we are turning it OFF
        if (args[1] === 'off') {
            const index = stickerDB.findIndex(s => s.hash === stickerHash);
            if (index !== -1) {
                stickerDB.splice(index, 1);
                fs.writeFileSync(stickerFile, JSON.stringify(stickerDB, null, 2));
                return sock.sendMessage(sender, { text: `✅ Sticker for '${commandName}' has been removed.` });
            } else {
                return sock.sendMessage(sender, { text: '❌ That sticker is not currently mapped to a command.' });
            }
        }

        // Check for duplicates
        const exists = stickerDB.find(s => s.hash === stickerHash);
        if (exists) {
            return sock.sendMessage(sender, { text: `⚠️ This sticker is already mapped to: \`${exists.command}\`.` });
        }

        // Save new mapping
        stickerDB.push({
            hash: stickerHash,
            command: commandName,
            type: type,
            timestamp: Date.now()
        });

        fs.writeFileSync(stickerFile, JSON.stringify(stickerDB, null, 2));
        
        await sock.sendMessage(sender, { 
            text: `✅ Sticker mapped to command: \`${commandName}\`.\nSend this sticker anytime to execute \`${commandName}\`.` 
        });
    }
};
