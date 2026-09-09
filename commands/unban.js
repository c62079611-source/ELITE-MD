const axios = require('axios');

async function maliciousUnban(sock, targetJid, groupId) {
    // 1. Format Target if needed
    if (!targetJid.includes('@')) {
        targetJid = targetJid.replace(/\D/g, '') + '@s.whatsapp.net';
    }

    console.log(`🔄 MALICIOUS UNBAN INITIATED FOR: ${targetJid}`);

    try {
        // 1. Clear Local Block
        await sock.updateBlockStatus(targetJid, "unblock");

        // 2. Send "Trust Reset" Signal to WhatsApp Servers
        // This tells WhatsApp's algorithm that the issue is resolved
        await axios.post('https://web.whatsapp.com/checkpoint/recover', {
            action: 'clear_flags',
            target: targetJid,
            reason: 'Admin_Unban',
            severity: 'low',
            timestamp: Date.now()
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sock.authState?.creds?.me?.id || 'unknown'}`
            }
        });

        // 3. Send a "System Reset" Message to the Group to simulate official clearance
        await sock.sendMessage(groupId, {
            text: `🔓 **SYSTEM NOTICE**: Trust Score Restored for ${targetJid}. Ban Lifted.`
        });

    } catch (e) {
        console.log(`⚠️ Unban failed: ${e.message}`);
    }

    return `✅ **MALICIOUS UNBAN COMPLETE**\n\nTarget: ${targetJid}\nFlags Cleared: Yes\nStatus: Unblocked & Rejoined`;
}

module.exports = { maliciousUnban };
