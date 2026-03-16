import './config.js'
import { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    jidNormalizedUser 
} from '@whiskeysockets/baileys'
import pino from 'pino'
import { Boom } from '@hapi/boom'
import fs from 'fs'
import chalk from 'chalk'
import readline from 'readline'
import { Low, JSONFile } from 'lowdb'
import lodash from 'lodash'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (t) => new Promise((resolve) => rl.question(t, resolve))

// --- INIZIALIZZAZIONE DATABASE ---
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

async function startLegamBot() {
    // 1. CANCELLA LA VECCHIA SESSIONE SE DA ERRORE
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
        // 👑 PERSONALIZZAZIONE "LEGAM OS"
        // Questo apparirà sul tuo telefono come nome del dispositivo!
        browser: ['LEGAM OS', 'Safari', '3.0'],
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            return { conversation: 'Legam Bot fixed' }
        }
    })

    // --- LOGICA PAIRING CODE ---
    if (!conn.authState.creds.registered) {
        console.clear()
        console.log(chalk.hex('#00CED1').bold(`
    ⊹ ࣪ ˖ ✦ ━━ 𝐋𝐄𝐆𝐀𝐌 𝐎𝐒 ━━ ✦ ˖ ࣪ ⊹
    👑 PROPRIETARIO: ${global.ownerName || 'Giuse'}
    🛡️ STATO: Inizializzazione Pairing...
    `))
        
        let phoneNumber = await question(chalk.whiteBright('📱 Inserisci il numero (es. 393471234567) ➤ '))
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
        
        if (!phoneNumber) {
            console.log(chalk.red('❌ Numero non valido. Riavvia il bot.'));
            process.exit();
        }

        console.log(chalk.yellow('\n⏳ Generazione codice di sicurezza...'));
        
        // Aspetta un momento per stabilizzare la connessione prima di chiedere il codice
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        try {
            // Richiesta codice personalizzato
            let code = await conn.requestPairingCode(phoneNumber)
            code = code?.match(/.{1,4}/g)?.join("-") || code
            
            console.log('\n' + chalk.bold.white(chalk.bgHex('#00CED1')(' 🔑 IL TUO CODICE LEGAM: ')) + ' ' + chalk.bold.hex('#2ECC71')(code) + '\n')
            console.log(chalk.white('1. Apri WhatsApp sul tuo telefono.'));
            console.log(chalk.white('2. Vai in Dispositivi collegati > Collega con numero di telefono.'));
            console.log(chalk.white('3. Inserisci il codice sopra.\n'));
        } catch (err) {
            console.error(chalk.red('❌ WhatsApp ha rifiutato la richiesta. Attendi 5 minuti e riprova.'));
        }
    }

    conn.ev.on('creds.update', saveCreds)

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'open') {
            console.clear()
            console.log(chalk.hex('#00CED1').bold(`
    ██╗     ███████╗ ██████╗  █████╗ ███╗   ███╗
    ██║     ██╔════╝██╔════╝ ██╔══██╗████╗ ████║
    ██║     █████╗  ██║  ███╗███████║██╔████╔██║
    ██║     ██╔══╝  ██║   ██║██╔══██║██║╚██╔╝██║
    ███████╗███████╗╚██████╔╝██║  ██║██║ ╚═╝ ██║
    ╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝
            `))
            console.log(chalk.greenBright.bold(`\n✅ [LEGAM OS] ONLINE E CONNESSO!`))
            console.log(chalk.cyan(`👤 Benvenuto, ${global.ownerName}. Sono ai tuoi ordini.\n`))
        }
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            if (reason === DisconnectReason.loggedOut) {
                console.log(chalk.redBright(`\n❌ Sessione chiusa. Elimina la cartella ${global.authFile} e riavvia.`))
                process.exit()
            } else {
                startLegamBot() 
            }
        }
    })

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const { handler } = await import(`./handler.js?update=${Date.now()}`)
            handler.call(conn, chatUpdate)
        } catch (e) {}
    })

    setInterval(async () => {
        if (global.db.data) await global.db.write()
    }, 30000)

    return conn
}

startLegamBot()

