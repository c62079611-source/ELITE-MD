module.exports = {
    name: 'ping',
    alias: ['speed'],
    desc: 'Check latency',
    run: async ({ sock, msg }) => {
        const start = Date.now();
        const reply = await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pinging...' });
        const end = Date.now();
        const latency = end - start;

        await sock.sendMessage(msg.key.remoteJid, {
            text: `🚀 *Pong!* Latency: ${latency}ms`
        });
    }
};
