const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

// Load .env
require('dotenv').config();

const SESSION_DIR = './session';
if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR);
}

const authFolder = path.join(SESSION_DIR, 'creds');
if (!fs.existsSync(authFolder)) {
    fs.mkdirSync(authFolder, { recursive: true });
}

const { getAuthState } = require('./authState'); // We will create this file next

async function connectToWhatsApp() {
    const { state, saveCreds } = await getAuthState();
    
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: Browsers.ubuntu('Chrome')
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = new DisconnectReason(lastDisconnect.error)?.output?.stackTag;
            console.log(`Connection closed due to: ${reason}. Reconnecting...`);
            setTimeout(connectToWhatsApp, 3000); // Reconnect after 3 seconds
        } else if (connection === 'open') {
            console.log('✅ Elite MD Connected Successfully!');
        }
    });

    return sock;
}

module.exports = { connectToWhatsApp };
