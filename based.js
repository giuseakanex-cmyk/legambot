process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, rmSync, watch } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import { format } from 'util';
import pino from 'pino';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import NodeCache from 'node-cache';

const DisconnectReason = {
    connectionClosed: 428,
    connectionLost: 408,
    connectionReplaced: 440,
    timedOut: 408,
    loggedOut: 401,
    badSession: 500,
    restartRequired: 515,
    multideviceMismatch: 411,
    forbidden: 403,
    unavailableService: 503
};
const { useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, jidNormalizedUser, makeInMemoryStore } = await import('@realvare/baileys');
const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
protoType();
serialize();
global.isLogoPrinted = false;
global.qrGenerated = false;
global.connectionMessagesPrinted = {};
let methodCodeQR = process.argv.includes("qr");
let methodCode = process.argv.includes("code");
let phoneNumber = global.botNumberCode;

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};

global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true));
};

global.__require = function require(dir = import.meta.url) {
    return createRequire(dir);
};

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '');
global.timestamp = { start: new Date };
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[' + (opts['prefix'] || '*/!#$%+£¢€¥^°=¶∆×÷π√✓©®&.\\-.@').replace(/[|\\{}()[\]^$+*.\-\^]/g, '\\$&') + ']');
global.db = new Low(new JSONFile('database.json'));
global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (!global.db.READ) {
                    clearInterval(interval);
                    resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
                }
            }, 1 * 1000);
            setTimeout(() => {
                clearInterval(interval);
                global.db.READ = null;
                reject(new Error('loadDatabase timeout'));
            }, 15000);
        }).catch((e) => {
            console.error('[ERRORE] loadDatabase:', e.message);
            return global.loadDatabase();
        });
    }
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = null;
    global.db.data = {
        users: {},
        chats: {},
        settings: {},
        ...(global.db.data || {}),
    };
    global.db.chain = chain(global.db.data);
};
loadDatabase();

global.creds = 'creds.json';
global.authFile = 'varesession';

const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const msgRetryCounterCache = new NodeCache();
const question = (t) => {
    process.stdout.write(t);
    return new Promise((resolve) => {
        process.stdin.once('data', (data) => {
            resolve(data.toString().trim());
        });
    });
};

let opzione;
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${authFile}/creds.json`)) {
    do {
        const violet1 = chalk.hex('#9B59B6');
        const violet2 = chalk.hex('#8E44AD');
        const violet3 = chalk.hex('#7D3C98');
        const violet4 = chalk.hex('#5B2C6F');
        const softText = chalk.hex('#D7BDE2');

        const a = violet1('╭━━━━━━━━━━━━━• ✧˚🩸 varebot 🕊️˚✧ •━━━━━━━━━━━━━');
        const b = violet1('╰━━━━━━━━━━━━━• ☾⋆₊✧ 𝓿𝓪𝓻𝓮𝓫𝓸𝓽 ✧₊⋆☽ •━━━━━━━━━━━━━');
        const linea = violet2('   ✦━━━━━━✦✦━━━━━━༺༻━━━━━━༺༻━━━━━━✦✦━━━━━━✦');
        const sm = violet3('SELEZIONE METODO DI ACCESSO ✦');
        const qr = violet4(' ┌─⭓') + ' ' + chalk.bold.hex('#D2B4DE')('1. Scansione con QR Code');
        const codice = violet4(' └─⭓') + ' ' + chalk.bold.hex('#D2B4DE')('2. Codice di 8 cifre');
        const istruzioni = [
            violet4(' ┌─⭓') + softText.italic(' Digita solo il numero corrispondente.'),
            violet4(' └─⭓') + softText.italic(' Premi Invio per confermare.'),
            softText.italic(''),
            violet1.italic('                   by sam'),
        ];
        const prompt = chalk.hex('#BB8FCE').bold('\n⌯ Inserisci la tua scelta ---> ');

        opzione = await question(`\n
${a}

          ${sm}
${linea}

${qr}
${codice}

${linea}
${istruzioni.join('\n')}

${b}
${prompt}`);

        if (!/^[1-2]$/.test(opzione)) {
            console.log(`\n${chalk.hex('#E74C3C').bold('✖ INPUT NON VALIDO')}

${chalk.hex('#F5EEF8')('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
${chalk.hex('#EC7063').bold('⚠️ Sono ammessi solo i numeri')} ${chalk.bold.green('1')} ${chalk.hex('#EC7063').bold('o')} ${chalk.bold.green('2')}
${chalk.hex('#FADBD8')('┌─⭓ Nessuna lettera o simbolo')}
${chalk.hex('#FADBD8')('└─⭓ Copia il numero dell\'opzione desiderata e incollalo')}
${chalk.hex('#BB8FCE').italic('\n✧ Suggerimento: Se hai dubbi, scrivi al creatore +39 351 435 7738')}
`);
        }
    } while ((opzione !== '1' && opzione !== '2') || fs.existsSync(`./${authFile}/creds.json`));
}

const groupMetadataCache = new NodeCache({ stdTTL: 300, useClones: false });
global.groupCache = groupMetadataCache;
const logger = pino({
    level: 'silent',
});
global.jidCache = new NodeCache({ stdTTL: 600, useClones: false });
global.store = makeInMemoryStore({ logger });

if (!global.__storePruneInterval) {
    global.__storePruneInterval = setInterval(() => {
        try {
            const store = global.store;
            if (!store || !store.messages) return;

            const MESSAGE_LIMIT = 40;
            for (const jid of Object.keys(store.messages)) {
                const list = store.messages[jid];
                const arr = list?.array;
                if (!arr || arr.length <= MESSAGE_LIMIT) continue;

                const keep = new Set(arr.slice(-MESSAGE_LIMIT).map(m => m?.key?.id).filter(Boolean));
                if (typeof list.filter === 'function') {
                    list.filter(m => keep.has(m?.key?.id));
                }
            }

            if (store.presences && typeof store.presences === 'object') {
                for (const k of Object.keys(store.presences)) delete store.presences[k];
            }

            if (global.gc) global.gc();
        } catch (e) {
            console.error('Errore pulizia store:', e);
        }
    }, 5 * 60 * 1000);
}

const makeDecodeJid = (jidCache) => {
    return (jid) => {
        if (!jid) return jid;
        const cached = jidCache.get(jid);
        if (cached) return cached;

        let decoded = jid;
        if (/:\d+@/gi.test(jid)) {
            decoded = jidNormalizedUser(jid);
        }
        if (typeof decoded === 'object' && decoded.user && decoded.server) {
            decoded = `${decoded.user}@${decoded.server}`;
        }
        jidCache.set(jid, decoded);
        return decoded;
    };
};
const connectionOptions = {
    logger: logger,
    browser: Browsers.macOS('Safari'),
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    decodeJid: makeDecodeJid(global.jidCache),
    printQRInTerminal: opzione === '1' || methodCodeQR ? true : false,
    cachedGroupMetadata: async (jid) => {
        const cached = global.groupCache.get(jid);
        if (cached) return cached;
        try {
            const metadata = await global.conn.groupMetadata(global.conn.decodeJid(jid));
            global.groupCache.set(jid, metadata, { ttl: 300 });
            return metadata;
        } catch (err) {
            console.error('Errore nel recupero dei metadati del gruppo:', err);
            return {};
        }
    },
    getMessage: async (key) => {
        try {
            const jid = global.conn.decodeJid(key.remoteJid);
            const msg = await global.store.loadMessage(jid, key.id);
            return msg?.message || undefined;
        } catch (error) {
            console.error('Errore in getMessage:', error);
            return undefined;
        }
    },
    msgRetryCounterCache,
    retryRequestDelayMs: 500,
    maxMsgRetryCount: 5,
    shouldIgnoreJid: jid => false,
};
global.conn = makeWASocket(connectionOptions);
global.store.bind(global.conn.ev);
if (!fs.existsSync(`./${authFile}/creds.json`)) {
    if (opzione === '2' || methodCode) {
        opzione = '2';
        if (!conn.authState.creds.registered) {
            let addNumber;
            if (phoneNumber) {
                addNumber = phoneNumber.replace(/[^0-9]/g, '');
            } else {
                phoneNumber = await question(chalk.bgBlack(chalk.bold.bgMagentaBright(`Inserisci il numero di WhatsApp.\n${chalk.bold.yellowBright("Esempio: +393471234567")}\n${chalk.bold.magenta('━━► ')}`)));
                addNumber = phoneNumber.replace(/\D/g, '');
                if (!phoneNumber.startsWith('+')) phoneNumber = `+${phoneNumber}`;
            }
            setTimeout(async () => {
                let codeBot = await conn.requestPairingCode(addNumber, 'VAR3BOT2');
                codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
                console.log(chalk.bold.white(chalk.bgMagenta('『 🔗 』– CODICE DI ABBINAMENTO:')), chalk.bold.white(chalk.white(codeBot)));
            }, 3000);
        }
    }
}
conn.isInit = false;
if (!opts['test']) {
    if (global.db) setInterval(async () => {
        if (global.db.data) await global.db.write();
        if (opts['autocleartmp']) {
            const tmp = ['temp'];
            tmp.forEach(dirName => {
                if (!existsSync(dirName)) return;
                try {
                    readdirSync(dirName).forEach(file => {
                        const filePath = join(dirName, file);
                        try {
                            const stats = statSync(filePath);
                            if (stats.isFile() && (Date.now() - stats.mtimeMs) > 2 * 60 * 1000) {
                                unlinkSync(filePath);
                            }
                        } catch {}
                    });
                } catch {}
            });
        }
    }, 30 * 1000);
}
if (opts['server']) (await import('./server.js')).default(global.conn, PORT);
async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update;
    global.stopped = connection;
    if (isNewLogin) conn.isInit = true;
    const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
    if (code && code !== DisconnectReason.loggedOut) {
        await global.reloadHandler(true).catch(console.error);
        global.timestamp.connect = new Date;
    }
    if (global.db.data == null) await loadDatabase();
    if (qr && (opzione === '1' || methodCodeQR) && !global.qrGenerated) {
        console.log(chalk.bold.yellow(`\n 🪐 SCANSIONA IL CODICE QR - SCADE TRA 45 SECONDI 🪐`));
        global.qrGenerated = true;
    }
    if (connection === 'open') {
        global.qrGenerated = false;
        global.connectionMessagesPrinted = {};
        if (!global.isLogoPrinted) {
            const finchevedotuttoviolaviola = [
                '#3b0d95', '#3b0d90', '#3b0d85', '#3b0d80', '#3b0d75',
                '#3b0d70', '#3b0d65', '#3b0d60', '#3b0d55', '#3b0d50', '#3b0d45'
            ];
            const varebot = [
               
    ` ██╗     ███████╗ ██████╗  █████╗ ███╗   ███╗██████╗  ██████╗ ████████╗ `,
    ` ██║     ██╔════╝██╔════╝ ██╔══██╗████╗ ████║██╔══██╗██╔═══██╗╚══██╔══╝ `,
    ` ██║     █████╗  ██║  ███╗███████║██╔████╔██║██████╔╝██║   ██║   ██║    `,
    ` ██║     ██╔══╝  ██║   ██║██╔══██║██║╚██╔╝██║██╔══██╗██║   ██║   ██║    `,
    ` ███████╗███████╗╚██████╔╝██║  ██║██║ ╚═╝ ██║██████╔╝╚██████╔╝   ██║    `,
    ` ╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═════╝  ╚═════╝    ╚═╝    `

        ];

            varebot.forEach((line, i) => {
                const color = finchevedotuttoviolaviola[i] || finchevedotuttoviolaviola[finchevedotuttoviolaviola.length - 1];
                console.log(chalk.hex(color)(line));
            });
            global.isLogoPrinted = true;
        }
    }
    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        if (reason === DisconnectReason.badSession) {
            if (!global.connectionMessagesPrinted.badSession) {
                console.log(chalk.bold.redBright(`\n⚠️❗ SESSIONE NON VALIDA, ELIMINA LA CARTELLA ${global.authFile} E SCANSIONA IL CODICE QR ⚠️`));
                global.connectionMessagesPrinted.badSession = true;
            }
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === DisconnectReason.connectionLost) {
            if (!global.connectionMessagesPrinted.connectionLost) {
                console.log(chalk.hex('#6349d8').bold(`\n╭⭑⭒━━━✦❘༻ ⚠️ CONNESSIONE PERSA COL SERVER ༺❘✦━━━⭒⭑\n┃ 🔄 RICONNESSIONE IN CORSO... \n╰⭑⭒━━━✦❘༻☾⋆₊✧ 𝓿𝓪𝓻𝓮𝓫𝓸𝓽 ✧₊⋆☽༺❘✦━━━⭒⭑`));
                global.connectionMessagesPrinted.connectionLost = true;
            }
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === DisconnectReason.connectionReplaced) {
            if (!global.connectionMessagesPrinted.connectionReplaced) {
                console.log(chalk.hex('#6349d8').bold(`╭⭑⭒━━━✦❘༻ ⚠️ CONNESSIONE SOSTITUITA ༺❘✦━━━⭒⭑\n┃ È stata aperta un'altra sessione, \n┃ chiudi prima quella attuale.\n╰⭑⭒━━━✦❘༻☾⋆⁺₊✧ 𝓿𝓪𝓻𝓮𝓫𝓸𝓽 ✧₊⁺⋆☽༺❘✦━━━⭒⭑`));
                global.connectionMessagesPrinted.connectionReplaced = true;
            }
        } else if (reason === DisconnectReason.loggedOut) {
            console.log(chalk.bold.redBright(`\n⚠️ DISCONNESSO, CARTELLA ${global.authFile} ELIMINATA. RIAVVIA IL BOT E SCANSIONA IL CODICE QR ⚠️`));
            try {
                if (fs.existsSync(global.authFile)) {
                    fs.rmSync(global.authFile, { recursive: true, force: true });
                }
            } catch (e) {
                console.error('Errore nell\'eliminazione della cartella sessione:', e);
            }
            process.exit(1);
        } else if (reason === DisconnectReason.restartRequired) {
            if (!global.connectionMessagesPrinted.restartRequired) {
                console.log(chalk.hex('#6349d8').bold(`\n⭑⭒━━━✦❘༻ ✨ CONNESSIONE AL SERVER ༺❘✦━━━⭒⭑`));
                global.connectionMessagesPrinted.restartRequired = true;
            }
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === DisconnectReason.timedOut) {
            if (!global.connectionMessagesPrinted.timedOut) {
                console.log(chalk.hex('#6349d8').bold(`\n╭⭑⭒━━━✦❘༻ ⌛ TIMEOUT CONNESSIONE ༺❘✦━━━⭒⭑\n┃ 🔄 RICONNESSIONE IN CORSO...\n╰⭑⭒━━━✦❘༻☾⋆⁺₊✧ 𝓿𝓪𝓻𝓮𝓫𝓸𝓽 ✧₊⁺⋆☽༺❘✦━━━⭒⭑`));
                global.connectionMessagesPrinted.timedOut = true;
            }
            await global.reloadHandler(true).catch(console.error);
        } else if (reason !== DisconnectReason.connectionClosed) {
            if (!global.connectionMessagesPrinted.unknown) {
                console.log(chalk.bold.redBright(`\n⚠️❗ MOTIVO DISCONNESSIONE SCONOSCIUTO: ${reason || 'Non trovato'} >> ${connection || 'Non trovato'}`));
                global.connectionMessagesPrinted.unknown = true;
            }
            await global.reloadHandler(true).catch(console.error);
        }
    }
}
process.on('uncaughtException', console.error);
(async () => {
    try {
        conn.ev.on('connection.update', connectionUpdate);
        conn.ev.on('creds.update', saveCreds);
        console.log(chalk.hex('#6349d8').bold(`⭑⭒━━━✦❘༻☾⋆⁺₊✧ varebot connesso correttamente ✧₊⁺⋆☽༺❘✦━━━⭒⭑`));
    } catch (error) {
        console.error(chalk.bold.bgRedBright(`🥀 Errore nell'avvio del bot: `, error));
    }
})();
let isInit = true;
let handler = await import('./handler.js');
global.reloadHandler = async function (restatConn) {
    try {
        const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
        if (Object.keys(Handler || {}).length) handler = Handler;
    } catch (e) {
        console.error(e);
    }
    if (restatConn) {
        try {
            global.conn.ws.close();
        } catch { }
        global.cacheListenersSet = false;
        conn.ev.removeAllListeners();
        global.conn = makeWASocket(connectionOptions);
        global.store.bind(global.conn.ev);
        isInit = true;
    }
    if (!isInit) {
        conn.ev.off('messages.upsert', conn.handler);
        conn.ev.off('connection.update', conn.connectionUpdate);
        conn.ev.off('creds.update', conn.credsUpdate);
        if (conn.callUpdate) conn.ev.off('call', conn.callUpdate);
    }
    conn.handler = handler.handler.bind(global.conn);
    conn.connectionUpdate = connectionUpdate.bind(global.conn);
    conn.credsUpdate = saveCreds;
    conn.callUpdate = async (calls) => {
        try {
            global.processedCalls = global.processedCalls || new Map();
            for (const call of calls || []) {
                const status = call?.status;
                const callId = call?.id;
                const callFrom = call?.from;
                if (!status || !callId || !callFrom) continue;

                if (status === 'terminate') {
                    global.processedCalls.delete(callId);
                    continue;
                }
                if (status !== 'offer') continue;
                if (global.processedCalls.has(callId)) continue;
                global.processedCalls.set(callId, true);

                const anticallPlugin = global.plugins?.['anti-call.js'];
                if (anticallPlugin && typeof anticallPlugin.onCall === 'function') {
                    anticallPlugin.onCall.call(conn, call, { conn, callId, callFrom }).catch(() => {});
                }
            }
        } catch (e) {
            console.error('[ERRORE] Errore generale gestione chiamata:', e);
        }
    };
    conn.ev.on('messages.upsert', conn.handler);
    conn.ev.on('connection.update', conn.connectionUpdate);
    conn.ev.on('creds.update', conn.credsUpdate);
    conn.ev.on('call', conn.callUpdate);
    isInit = false;
    return true;
};

if (!global.__processedCallsCleanupInterval) {
    global.__processedCallsCleanupInterval = setInterval(() => {
        if (global.processedCalls && global.processedCalls.size > 10) {
            global.processedCalls.clear();
        }
    }, 180000);
}
const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};
async function filesInit() {
    for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
        try {
            const file = global.__filename(join(pluginFolder, filename));
            const module = await import(file);
            global.plugins[filename] = module.default || module;
        } catch (e) {
            conn.logger.error(e);
            delete global.plugins[filename];
        }
    }
}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error);
global.reload = async (_ev, filename) => {
    if (pluginFilter(filename)) {
        const dir = global.__filename(join(pluginFolder, filename), true);
        if (filename in global.plugins) {
            if (existsSync(dir)) conn.logger.info(chalk.hex('#4920ffff')(`✅ AGGIORNATO - '${filename}' CON SUCCESSO`));
            else {
                conn.logger.warn(`🗑️ FILE ELIMINATO: '${filename}'`);
                return delete global.plugins[filename];
            }
        } else conn.logger.info(chalk.hex('#a894ffff')(`🆕 NUOVO PLUGIN RILEVATO: '${filename}'`));
        
        try {
            const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`));
            global.plugins[filename] = module.default || module;
        } catch (e) {
            conn.logger.error(`⚠️ ERRORE NEL PLUGIN: '${filename}\n${format(e)}'`);
        } finally {
            global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
        }
    }
};
Object.freeze(global.reload);
const pluginWatcher = watch(pluginFolder, global.reload);
pluginWatcher.setMaxListeners(20);
await global.reloadHandler();
async function _quickTest() {
    const test = await Promise.all([
        spawn('ffmpeg'),
        spawn('ffprobe'),
        spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
        spawn('convert'),
        spawn('magick'),
        spawn('gm'),
        spawn(platform === 'win32' ? 'where' : 'find', platform === 'win32' ? ['find'] : ['--version']),
    ].map((p) => {
        return Promise.race([
            new Promise((resolve) => {
                p.on('close', (code) => {
                    resolve(code !== 127);
                });
            }),
            new Promise((resolve) => {
                p.on('error', (_) => resolve(false));
            })
        ]);
    }));
    const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
    global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find };
    Object.freeze(global.support);
}
function clearDirectory(dirPath) {
    if (!existsSync(dirPath)) {
        try {
            mkdirSync(dirPath, { recursive: true });
        } catch (e) {
            console.error(chalk.red(`Errore nella creazione della directory ${dirPath}:`, e));
        }
        return 0;
    }
    const filenames = readdirSync(dirPath);
    let deleted = 0;
    filenames.forEach(file => {
        const filePath = join(dirPath, file);
        try {
            const stats = statSync(filePath);
            if (stats.isFile()) {
                unlinkSync(filePath);
                deleted++;
            } else if (stats.isDirectory()) {
                rmSync(filePath, { recursive: true, force: true });
                deleted++;
            }
        } catch (e) {
            console.error(chalk.red(`Errore nella pulizia del file ${filePath}:`, e));
        }
    });
    return deleted;
}
setInterval(async () => {
    if (global.stopped === 'close' || !conn || !conn.user) return;
    const deleted = clearDirectory(join(__dirname, 'temp'));
    if (deleted > 0) {
        console.log(chalk.bold.greenBright(`\n╭⭑⭒━━━✦❘༻ 🟢 PULIZIA MULTIMEDIA 🟢 ༺❘✦━━━⭒⭑\n┃          ${deleted} FILE NELLA CARTELLA TEMP\n┃          ELIMINATI CON SUCCESSO\n╰⭑⭒━━━✦❘༻☾⋆⁺₊🗑️ 𝓿𝓪𝓻𝓮�𝓸𝓽 ♻️₊⁺⋆☽༺❘✦━━━⭒⭑`));
    }
}, 1000 * 60 * 60);
_quickTest().then(() => conn.logger.info(chalk.bold.magentaBright(``)));
let filePath = fileURLToPath(import.meta.url);
const mainWatcher = watch(filePath, async () => {
  console.log(chalk.bgHex('#3b0d95')(chalk.white.bold("File: 'based.js' Aggiornato")))
});
mainWatcher.setMaxListeners(20);
