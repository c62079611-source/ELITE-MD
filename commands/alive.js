const moment = require('moment-timezone');

module.exports = {
    name: 'alive',
    alias: ['status', 'runtime'],
    desc: 'Check bot status',
    run: async ({ sock, msg, sender }) => {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const status = `
🤖 *Elite MD Status*
━━━━━━━━━━━━━━━━━
✅ Status: Online
⏳ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s
👤 Owner: @${sender.split('@')[0]}
━━━━━━━━━━━━━━━━━
        `.trim();

        await sock.sendMessage(sender, {
            text: status,
            contextInfo: { mentionedJid: [sender] }
        });
    }
};
