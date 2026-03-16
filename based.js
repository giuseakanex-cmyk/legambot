import './config.js'
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers, jidNormalizedUser } from '@whiskeysockets/baileys'
import pino from 'pino'
import { Boom } from '@hapi/boom'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import readline from 'readline'
import { Low, JSONFile } from 'lowdb'
import lodash from 'lodash'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (t) => new Promise((resolve) => rl.question(t, resolve))

// --- DATABASE SETUP ---
global.db = new Low(new JSONFile('database.json'))
global.loadDatabase = async function loadDatabase() {
    if (global.db.data !== null) return
    await global.db.read().catch(console.error)
    global.db.data = {
        users: {},
        chats: {},
        stats: {},
        msgs: {},
        sticker: {},
        settings: {},
        ...(global.db.data || {}),
    }
    global.db.chain = lodash.chain(global.db.data)
}
loadDatabase()

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(global.authFile)
    const { version } = await fetchLatestBaileysVersion()

    const conn = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        browser: Browsers.macOS('Safari')
    })

    // --- PAIRING CODE MENU ---
    if (!conn.authState.creds.registered) {
        console.clear()
        console.log(chalk.hex('#00BFFF').bold(`\n╭━━━━━━━━━━━━━• 𝐋𝐄𝐆𝐀𝐌 𝐂𝐎𝐑𝐄 •━━━━━━━━━━━━━`))
        console.log(chalk.bold.white(`   ⚡ SISTEMA DI AUTENTICAZIONE ATTIVO ⚡`))
        console.log(chalk.hex('#00BFFF')(`╰━━━━━━━━━━━━━• 𝐋𝐄𝐆𝐀𝐌 𝐄𝐍𝐃 •━━━━━━━━━━━━━━━`))
        
        let phoneNumber = await question(chalk.cyanBright('\n⌬ Inserisci il numero (es. 393471234567) ➤ '))
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
        
        setTimeout(async () => {
            let code = await conn.requestPairingCode(phoneNumber)
            code = code?.match(/.{1,4}/g)?.join("-") || code
            console.log(chalk.bold.white(chalk.bgHex('#00CED1')('\n📞 CODICE DI ABBINAMENTO:')), chalk.bold.white(chalk.hex('#2ECC71')(code)), '\n')
        }, 3000)
    }

    conn.ev.on('creds.update', saveCreds)

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'open') {
            console.log(chalk.greenBright.bold(`\n✅ [LEGAM BOT] Connesso con successo al server.`))
        }
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            if (reason === DisconnectReason.loggedOut) {
                console.log(chalk.redBright(`Sessione chiusa. Elimina ${global.authFile} e ricollega.`))
                process.exit()
            } else {
                startBot()
            }
        }
    })

    // --- HANDLER INTEGRATION ---
    conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const { handler } = await import(`./handler.js?update=${Date.now()}`)
            handler.call(conn, chatUpdate)
        } catch (e) {
            console.error(e)
        }
    })

    // Salva DB ogni 30 secondi
    setInterval(async () => {
        if (global.db.data) await global.db.write()
    }, 30000)

    return conn
}

startBot()

