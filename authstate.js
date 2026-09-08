const { BufferData } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

const SESSION_DIR = './session';

async function getAuthState() {
    const fileKey = path.join(SESSION_DIR, 'auth_info');
    
    const loadSession = async () => {
        const buffer = fs.readFileSync(fileKey);
        return JSON.parse(BufferData.from(buffer).toString('utf-8'));
    };

    const writeData = async (data) => {
        fs.writeFileSync(fileKey, JSON.stringify(data, null, 2));
    };

    const readData = async () => {
        if (!fs.existsSync(fileKey)) {
            return { creds: {}, keys: {} };
        }
        return await loadSession();
    };

    return {
        state: {
            creds: await readData().then(async (data) => data?.creds || {}),
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    for (const id of ids) {
                        const value = await readData().then(async (data) => data?.keys?.[type]?.[id]);
                        if (type === 'app-state-sync-key' && value) {
                            data[id] = BufferData.from(value).toJSON();
                        } else if (value) {
                            data[id] = value;
                        }
                    }
                    return data;
                },
                set: async (data) => {
                    const keys = {};
                    for (const category in data) {
                        for (const id in data[category]) {
                            let value = data[category][id];
                            if (typeof value === 'object' && 'buffer' in value) {
                                value = value.buffer;
                            }
                            keys[category] = keys[category] || {};
                            keys[category][id] = value;
                        }
                    }
                    const fullData = {
                        creds: {},
                        keys: keys
                    };
                    await writeData(fullData);
                }
            }
        },
        saveCreds: () => {
            return fs.writeFileSync(
                path.join(SESSION_DIR, 'creds.json'),
                JSON.stringify(sock.authState.creds, null, 2)
            );
        }
    };
}

// Simplified Auth State for modern Baileys
async function getAuthState() {
    const bufferPath = path.join(__dirname, '..', 'session', 'auth_info');
    
    const load = () => {
        if (fs.existsSync(bufferPath)) {
            return JSON.parse(fs.readFileSync(bufferPath));
        }
        return { creds: {}, keys: {} };
    };

    const save = (data) => {
        fs.writeFileSync(bufferPath, JSON.stringify(data, null, 2));
    };

    const state = {
        creds: load().creds || {},
        keys: {
            get: async (type, ids) => {
                const data = load();
                const result = {};
                for (const id of ids) {
                    if (data.keys?.[type]?.[id]) {
                        result[id] = data.keys[type][id];
                    }
                }
                return result;
            },
            set: async (data) => {
                const current = load();
                if (!current.keys) current.keys = {};
                for (const type in data) {
                    if (!current.keys[type]) current.keys[type] = {};
                    for (const id in data[type]) {
                        current.keys[type][id] = data[type][id];
                    }
                }
                save(current);
            }
        }
    };

    return {
        state,
        saveCreds: () => {
            save(load());
        }
    };
}

module.exports = { getAuthState };
