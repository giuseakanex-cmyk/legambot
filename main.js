process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import { platform } from 'process';
import fs, { readdirSync, statSync, unlinkSync, existsSync, watch } from 'fs';
import yargs from 'yargs';
import lodash from 'lodash';
import chalk from 'chalk';
import pino from 'pino';
import { Low, JSONFile } from 'lowdb';
import NodeCache from 'node-cache';

const { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeCacheableSignalKeyStore, 
    Browsers, 
    jidNormalizedUser, 
    makeInMemoryStore 
} = await import('@whiskeysockets/baileys');

const { chain } = lodash;
global.__filename = (pathURL = import.meta.url) => fileURLToPath(pathURL);
global.__dirname = (pathURL) => path.dirname(global.__filename(pathURL));

const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());

// --- DATABASE ---
global.db = new Low(new JSONFile('database.json'));
global.loadDatabase = async function loadDatabase() {
    if (global.db.data !== null) return;
    await global.db.read().catch(console.error);
    global.db.data = { users: {}, chats: {}, settings: {}, ...(global.db.data || {}) };
    global.db.chain = chain(global.db.data);
};
loadDatabase();

const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const question = (t) => {
    process.stdout.write(t);
    return new Promise((resolve) => {
        process.stdin.once('data', (data) => resolve(data.toString().trim()));
    });
};

// --- CONNESSIONE ---
async function startBot() {
    const logger = pino({ level: 'silent' });
    global.store = makeInMemoryStore({ logger });

    const connectionOptions = {
        logger,
        browser: Browsers.macOS('Safari'),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        printQRInTerminal: false,
        markOnlineOnConnect: true
    };

    global.conn = makeWASocket(connectionOptions);
    global.store.bind(global.conn.ev);

    // --- PAIRING CODE LOGIC ---
    if (!global.conn.authState.creds.registered) {
        console.clear();
        const cyan1 = chalk.hex('#00BFFF');
        const green = chalk.hex('#2ECC71');
        console.log(cyan1('╭━━━━━━━━━━━━━• 𝐋𝐄𝐆𝐀𝐌 𝐂𝐎𝐑𝐄 •━━━━━━━━━━━━━'));
        console.log(chalk.bold.white('   ⚡ SISTEMA DI AUTENTICAZIONE ATTIVO ⚡'));
        console.log(cyan1('╰━━━━━━━━━━━━━• 𝐋𝐄𝐆𝐀𝐌 𝐄𝐍𝐃 •━━━━━━━━━━━━━━━'));

        let phoneNumber = await question(green.bold('\n⌬ Inserisci il numero (es. 39347...) ➤ '));
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

        setTimeout(async () => {
            let code = await global.conn.requestPairingCode(phoneNumber, 'LEGAMBOT');
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(chalk.bold.white(chalk.bgHex('#00CED1')('\n📞 CODICE DI ABBINAMENTO:')), chalk.bold.white(chalk.hex('#2ECC71')(code)));
        }, 3000);
    }

    // --- AGGIORNAMENTO CONNESSIONE ---
    global.conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log(chalk.hex('#2ECC71').bold(`\n✅ 𝐋𝐄𝐆𝐀𝐌 𝚩𝚯𝐓 connesso correttamente`));
        }
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                startBot();
            } else {
                console.log(chalk.red('\nSessione terminata. Elimina la cartella session e riavvia.'));
                process.exit();
            }
        }
    });

    global.conn.ev.on('creds.update', saveCreds);

    global.conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const { handler } = await import(`./handler.js?update=${Date.now()}`);
            handler.call(global.conn, chatUpdate);
        } catch (e) {
            console.error(e);
        }
    });

    // Salvataggio Database
    setInterval(async () => {
        if (global.db.data) await global.db.write();
    }, 30000);
}

startBot();

