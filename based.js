import './config.js'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, delay } from '@realvare/based'
import pino from 'pino'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { handler } from './handler.js'
import readline from 'readline'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// La tua ASCII Art
const legambotArt = [
    ` ██╗     ███████╗ ██████╗  █████╗ ███╗   ███╗██████╗  ██████╗ ████████╗ `,
    ` ██║     ██╔════╝██╔════╝ ██╔══██╗████╗ ████║██╔══██╗██╔═══██╗╚══██╔══╝ `,
    ` ██║     █████╗  ██║  ███╗███████║██╔████╔██║██████╔╝██║   ██║   ██║    `,
    ` ██║     ██╔══╝  ██║   ██║██╔══██║██║╚██╔╝██║██╔══██╗██║   ██║   ██║    `,
    ` ███████╗███████╗╚██████╔╝██║  ██║██║ ╚═╝ ██║██████╔╝╚██████╔╝   ██║    `,
    ` ╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═════╝  ╚═════╝    ╚═╝    `
];

global.authFile = 'legamsession'; 

// Funzione per fare domande nel terminale
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

async function startBot() {
    console.log(legambotArt.join('\n'));

    const { state, saveCreds } = await useMultiFileAuthState(global.authFile)
    const { version } = await fetchLatestBaileysVersion()

    // Chiediamo se vuole usare il codice invece del QR
    let usePairingCode = false;
    let phoneNumber = '';
    
    // Controlla se ci sono già le credenziali (se è già connesso non chiede nulla)
    if (!fs.existsSync(`./${global.authFile}/creds.json`)) {
        console.log('\n=======================================')
        const answer = await question('Vuoi usare il CODICE (Pairing Code) invece del QR? (si/no): ')
        if (answer.toLowerCase().startsWith('s')) {
            usePairingCode = true;
            console.log('\n⚠️ IMPORTANTE: Inserisci il numero con il prefisso internazionale, SENZA il + o gli zeri!')
            console.log('Esempio Italia: 393510000000')
            phoneNumber = await question('Inserisci il tuo numero di WhatsApp: ')
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '') // Pulisce da spazi o +
        }
        console.log('=======================================\n')
    }

    const conn = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: !usePairingCode, // Stampa il QR SOLO se non usa il codice
        logger: pino({ level: 'silent' }),
        browser: [global.botname, 'Safari', '3.0']
    })

    // --- GENERAZIONE CODICE 8 CIFRE ---
    if (usePairingCode && !conn.authState.creds.registered) {
        // Aspettiamo un secondo per dare il tempo al socket di avviarsi
        await delay(1500)
        let code = await conn.requestPairingCode(phoneNumber)
        // Aggiungiamo un trattino per renderlo leggibile (es: ABCD-1234)
        code = code?.match(/.{1,4}/g)?.join('-') || code
        console.log(`\n\n🎯 IL TUO CODICE DI COLLEGAMENTO È: \x1b[32m${code}\x1b[0m\n\n`)
        console.log('📱 Vai su WhatsApp -> Dispositivi Collegati -> Collega con il numero di telefono\n\n')
    }

    // --- PLUGIN LOADER ---
    global.plugins = {}
    const pluginsFolder = path.join(__dirname, 'plugins')
    if (!fs.existsSync(pluginsFolder)) fs.mkdirSync(pluginsFolder)
    
    const files = fs.readdirSync(pluginsFolder).filter(f => f.endsWith('.js'))
    for (const file of files) {
        try {
            const filePath = pathToFileURL(path.join(pluginsFolder, file)).href
            const module = await import(filePath)
            global.plugins[file] = module.default || module
            console.log(`📌 Plugin: ${file}`)
        } catch (e) {
            console.error(`❌ Errore plugin ${file}:`, e)
        }
    }

    // --- EVENTI CONNESSIONE E MESSAGGI ---
    conn.ev.on('creds.update', saveCreds)

    conn.ev.on('connection.update', (up) => {
        const { connection } = up
        if (connection === 'open') {
            console.log(`\n🚀 ${global.botname} È ONLINE E CONNESSO!\n`)
        }
        if (connection === 'close') {
             console.log('\n❌ Connessione chiusa. Riavvio necessario.')
        }
    })

    conn.ev.on('messages.upsert', async chatUpdate => {
        await handler(chatUpdate, conn)
    })
}

startBot()
