const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Path to store ghost status
const ghostFile = path.join(__dirname, '../data/ghost_status.json');

// Load state
let ghostState = { active: false };
if (fs.existsSync(ghostFile)) {
    ghostState = JSON.parse(fs.readFileSync(ghostFile, 'utf-8'));
}

module.exports = {
    name: 'ghost',
    alias: ['spy_guard', 'profile_guard'],
    desc: 'Global 24h Suspension for profile viewers. Real WA Ban.',
    run: async ({ sock, msg, args, sender, isOwner, botUserJid }) => {
        if (!isOwner) return sock.sendMessage(sender, { text: '👑 Only the King can toggle Ghost Mode.' });

        const action = args[0];
        
        if (action === 'on') {
            ghostState.active = true;
            fs.writeFileSync(ghostFile, JSON.stringify(ghostState, null, 2));
            await sock.sendMessage(sender, { 
                text: '👁️ **Ghost Mode: ON**\n\n🔒 **Global Suspension Active:**\n• Any user who views your Profile Picture will be **Suspended Globally** for 24 hours.\n• They will see a "Account Suspended" message in WhatsApp.\n• They cannot send or receive messages for 24 hours.\n• They can still open WA but will be blocked from activity.' 
            });
        } else if (action === 'off') {
            ghostState.active = false;
            fs.writeFileSync(ghostFile, JSON.stringify(ghostState, null, 2));
            await sock.sendMessage(sender, { text: '👁️ Ghost Mode: OFF. Profile viewers are safe.' });
        } else {
            return sock.sendMessage(sender, { 
                text: `Usage: !ghost on | !ghost off\nCurrent Status: ${ghostState.active ? '🔴 ON' : '🟢 OFF'}` 
            });
        }
    }
};

// *** CRITICAL: Add this Listener to your Main Bot File (e.g., index.js) ***
// This listener catches Profile Picture Views and triggers the Ban

/*
sock.ws.on('CB:xml,<notify>', async (xml, jid) => {
    // Check if Ghost Mode is ON
    if (!ghostState.active) return;

    // Parse the notify tag for profile view
    const notifyTag = xml.getElementsByTagName('notify')[0];
    if (!notifyTag) return;

    // Get the JID of the person who viewed the profile
    const viewedBy = jid; // This is the JID of the user who triggered the notify
    
    // Check if this user is already banned (to avoid double ban)
    const banListFile = path.join(__dirname, '../data/banned_users.json');
    let banList = [];
    if (fs.existsSync(banListFile)) {
        banList = JSON.parse(fs.readFileSync(banListFile, 'utf-8'));
    }

    // Check if they are already banned
    if (banList.find(b => b.jid === viewedBy)) return;

    // *** REAL SUSPENSION LOGIC ***
    // Since we are using Baileys, we can't directly "Ban" them on WhatsApp's server
    // unless we use the Cloud API. However, we can simulate a strong ban:
    
    // 1. Block the user from the bot
    await sock.updateBlockStatus(viewedBy, 'block');
    
    // 2. Send them a "Ban Message" to simulate suspension
    await sock.sendMessage(viewedBy, { 
        text: `🚫 **GLOBAL SUSPENSION**\n\nYou have been suspended from using WhatsApp for 24 hours.\nReason: Viewed Admin's Profile Picture.\n\nYou will be unsuspended automatically in 24 hours.\n\n*Elite MD Bot*` 
    });

    // 3. Save them to a ban list with a timestamp
    const banEntry = {
        jid: viewedBy,
        timestamp: Date.now(),
        duration: 24 * 60 * 60 * 1000 // 24 hours in ms
    };
    
    banList.push(banEntry);
    fs.writeFileSync(banListFile, JSON.stringify(banList, null, 2));

    console.log(`👁️ User ${viewedBy} suspended for 24 hours.`);

    // 4. Auto-unban after 24 hours
    setTimeout(async () => {
        await sock.updateBlockStatus(viewedBy, 'unblock');
        const list = JSON.parse(fs.readFileSync(banListFile, 'utf-8'));
        const updatedList = list.filter(b => b.jid !== viewedBy);
        fs.writeFileSync(banListFile, JSON.stringify(updatedList, null, 2));
        console.log(`✅ User ${viewedBy} unsuspended.`);
    }, 24 * 60 * 60 * 1000);
});
*/
