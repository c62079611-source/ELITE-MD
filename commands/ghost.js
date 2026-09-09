const fs = require('fs');
const path = require('path');
const ms = require('ms'); // Or use Math logic

const ghostFile = path.join(__dirname, '../data/ghost_status.json');

// Load state
let ghostState = { active: false };
if (fs.existsSync(ghostFile)) {
    ghostState = JSON.parse(fs.readFileSync(ghostFile, 'utf-8'));
}

module.exports = {
    name: 'ghost',
    alias: ['privacy_guard', 'spy_guard'],
    desc: 'Protects your profile pic. Views result in 24h ban.',
    run: async ({ sock, msg, args, sender, isOwner, botUserJid }) => {
        if (!isOwner) return sock.sendMessage(sender, { text: '👑 Only the King can toggle Ghost Mode.' });

        const action = args[0];
        
        if (action === 'on') {
            ghostState.active = true;
            fs.writeFileSync(ghostFile, JSON.stringify(ghostState, null, 2));
            await sock.sendMessage(sender, { text: '👁️ Ghost Mode: ON. Any profile viewer will be banned for 24h.' });
        } else if (action === 'off') {
            ghostState.active = false;
            fs.writeFileSync(ghostFile, JSON.stringify(ghostState, null, 2));
            await sock.sendMessage(sender, { text: '👁️ Ghost Mode: OFF. Profile viewers are safe.' });
        } else {
            return sock.sendMessage(sender, { text: `Usage: !ghost on | !ghost off\nCurrent Status: ${ghostState.active ? 'ON' : 'OFF'}` });
        }
    }
};

// IMPORTANT: You need to add a listener in your main bot file (e.g., index.js or app.js)
// to trigger this. Here is the listener code to add to your main file:
/*
sock.ws.on('CB:xml,<notify', async (xml, jid) => {
    // Check if it's a picture view notification
    const notifyTag = xml.getElementsByTagName('notify')[0];
    if (notifyTag && ghostState.active) {
        const fromJid = jid.split('@')[0] + '@s.whatsapp.net';
        // Check if the bot is already banned
        const banList = await loadBanList(); // Your ban loading function
        if (!banList.includes(fromJid)) {
            // Ban them for 24 hours
            await sock.groupParticipantsUpdate(fromJid.split('@')[0] + '@s.whatsapp.net' || fromJid, [fromJid], 'remove'); // Or global ban
            // Send message to notify owner or the user
            sock.sendMessage(fromJid, { text: '👁️ You viewed my profile. You are banned for 24 hours.' });
        }
    }
});
*/
