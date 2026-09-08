require('dotenv').config();
const { connectToWhatsApp } = require('./connection');
const fs = require('fs');
const path = require('path');

// Load Owners from ENV
const OWNERS = process.env.OWNERS.split(',').map(n => n + '@s.whatsapp.net');

const sock = connectToWhatsApp();

// Load Commands
const commands = [];
const commandsDir = './commands';
if (fs.existsSync(commandsDir)) {
    fs.readdirSync(commandsDir).forEach(file => {
        if (file.endsWith('.js')) {
            const module = require(`./commands/${file}`);
            commands.push(module);
        }
    });
}

// Helper to check if user is owner
const isOwner = (jid) => OWNERS.includes(jid);

// Main Message Handler
sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromRemote) return;

    const msg = m.message.conversation || m.message.extendedTextMessage?.text;
    if (!msg) return;

    const sender = m.key.participant || m.key.remoteJid;
    const isGroup = m.key.remoteJid.includes('@g.us');
    const isOwnerUser = isOwner(sender);

    // Remove group suffix if it exists for processing
    const cleanMsg = msg.trim();
    const prefix = process.env.PREFIX || '!';
    
    if (!cleanMsg.startsWith(prefix)) return;

    const [command, ...args] = cleanMsg.slice(prefix.length).trim().split(' ');
    const cmd = command.toLowerCase();

    // Find command handler
    const cmdHandler = commands.find(c => c.name === cmd || (c.alias && c.alias.includes(cmd)));

    if (cmdHandler) {
        try {
            // Prepare context
            const context = {
                sock,
                msg: m,
                args: args,
                sender: sender,
                isOwner: isOwnerUser,
                isGroup: isGroup,
                body: cleanMsg
            };

            await cmdHandler.run(context);
        } catch (e) {
            console.error(`Error in command ${cmd}:`, e);
            sock.sendMessage(sender, { text: `❌ Error: ${e.message}` });
        }
    }
});

console.log('Elite MD Loaded. Waiting for connection...');
