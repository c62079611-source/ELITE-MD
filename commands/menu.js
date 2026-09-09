const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'menu',
    alias: ['help', 'commands'],
    desc: 'Show all commands',
    run: async ({ sock, msg, sender, commands }) => {
        let menuText = `
📋 *Elite MD Command List*
━━━━━━━━━━━━━━━━━
`;
        // Group commands by category if available, else list all
        const cmdList = commands.map(c => `• ${c.name}`).join('\n');
        menuText += cmdList;
        menuText += `\n━━━━━━━━━━━━━━━━━`;

        await sock.sendMessage(sender, {
            text: menuText
        });
    }
};
