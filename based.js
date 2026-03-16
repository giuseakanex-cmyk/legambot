import './config.js' // Importa subito le configurazioni globali
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } from '@whiskeysockets/baileys'
import pino from 'pino'
import readline from 'readline'
import { Boom } from '@hapi/boom'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

async function startLegamBot() {
    console.clear()
    console.log(`\n    ⊹ ࣪ ˖ ✦ ━━ 𝐋𝐄𝐆𝐀𝐌 𝐂𝐎𝐑𝐄 𝐎𝐒 ━━ ✦ ˖ ࣪ ⊹\n    👑 Inizializzazione in corso per ${global.ownerName}...\n`)

    const { state, saveCreds } = await useMultiFileAuthState(global.sessionName)
    const { version } = await fetchLatestBaileysVersion()

    const conn = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        browser: Browsers.ubuntu('Chrome')
    })

    // SISTEMA PAIRING CODE
    if (!conn.authState.creds.registered) {
        let numero = await question('    📱 Inserisci il numero del Bot (es. 39347...): ')
        numero = numero.replace(/[^0-9]/g, '')
        await new Promise(resolve => setTimeout(resolve, 1500))
        let codice = await conn.requestPairingCode(numero)
        codice = codice?.match(/.{1,4}/g)?.join("-") || codice
        console.log(`\n    🔑 IL TUO CODICE: \x1b[32m${codice}\x1b[0m\n`)
    }

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            if (reason === DisconnectReason.loggedOut) {
                console.log('    [❌] Disconnesso. Elimina la sessione e riavvia.')
                process.exit(1)
            } else {
                startLegamBot()
            }
        } else if (connection === 'open') {
            console.log(`    [✅] LEGAM BOT ONLINE. Pronti a dominare.\n`)
        }
    })

    conn.ev.on('creds.update', saveCreds)

    // Passiamo il controllo all'handler
    conn.ev.on('messages.upsert', async (m) => {
        const { handler } = await import('./handler.js?update=' + Date.now())
        if (handler) await handler(conn, m)
    })
}

startLegamBot()

