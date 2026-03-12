import './config.js'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from '@realvare/based' // Usiamo solo il loro motore sotto il cofano, ma la carrozzeria è tua
import pino from 'pino'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { handler } from './handler.js'
import readline from 'readline'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// La tua estetica stellare
const legambotArt = [
    ` ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ `,
    ` ⋆     𝐋 𝐄 𝐆 𝐀 𝐌   𝐁 𝐎 𝐓     ⋆ `,
    ` ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ `
];

global.authFile = 'legamsession'; 

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

async function startBot() {
    console.log(legambotArt.join('\n'));

    const { state, saveCreds } = await useMultiFileAuthState(global.authFile)
    const { version } = await fetchLatestBaileysVersion()

    let usePairingCode = false;
    let phoneNumber = '';
    
    // --- 1. RICHIESTA NUMERO ---
    if (!fs.existsSync(`./${global.authFile}/creds.json`)) {
        console.log('\n=======================================')
        const answer = await question('Vuoi usare il CODICE a 8 cifre per collegarti? (si/no): ')
        if (answer.toLowerCase().startsWith('s')) {
            usePairingCode = true;
            console.log('\n⚠️ IMPORTANTE: Inserisci il numero senza il + (es. 2250508616860)')
            phoneNumber = await question('Inserisci il tuo numero di WhatsApp: ')
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '') 
        }
        console.log('=======================================\n')
    }

    // --- 2. CONNESSIONE (MARCHIO LEGAM BOT) ---
    const conn = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: !usePairingCode,
        logger: pino({ level: 'silent' }),
        // ECCO LA TUA IDENTITÀ ASSOLUTA
        browser: ['Legam Bot', 'Chrome', '3.0'],
        syncFullHistory: false, // Salva la RAM del tuo telefono
        generateHighQualityLinkPreview: false
    })

    // --- 3. GENERAZIONE PAIRING CODE ---
    if (usePairingCode && !conn.authState.creds.registered) {
        console.log("⏳ Legam Bot sta richiedendo l'accesso ai server Meta...")
        
        setTimeout(async () => {
            try {
                let code = await conn.requestPairingCode(phoneNumber)
                let formattedCode = code?.match(/.{1,4}/g)?.join('-').toUpperCase() || code.toUpperCase()
                
                console.log(`\n🎯 IL TUO CODICE LEGAM BOT È: \x1b[32m${formattedCode}\x1b[0m\n`)
                console.log('📱 Vai su WhatsApp -> Dispositivi Collegati -> Collega con il numero di telefono\n')
            } catch (e) {
                console.error("\n❌ Errore nella generazione. Assicurati che il numero sia corretto e non sia in cooldown.\n", e)
            }
        }, 3000) 
    }

    // --- 4. CARICAMENTO PLUGIN ---
    global.plugins = {}
    const pluginsFolder = path.join(__dirname, 'plugins')
    if (!fs.existsSync(pluginsFolder)) fs.mkdirSync(pluginsFolder)
    
    const files = fs.readdirSync(pluginsFolder).filter(f => f.endsWith('.js'))
    for (const file of files) {
        try {
            const filePath = pathToFileURL(path.join(pluginsFolder, file)).href
            const module = await import(filePath)
            global.plugins[file] = module.default || module
        } catch (e) {
            console.error(`❌ Errore nel plugin ${file}:`, e)
        }
    }
    console.log(`📌 Caricati ${files.length} plugins con successo.`)

    // --- 5. GESTIONE EVENTI (Anti-Crash per Termux) ---
    conn.ev.on('creds.update', saveCreds)

    conn.ev.on('connection.update', (up) => {
        const { connection, lastDisconnect } = up
        if (connection === 'open') {
            console.log(`\n🚀 LEGAM BOT È ONLINE E PRONTO A DOMINARE!\n`)
        }
        if (connection === 'close') {
             console.log(`\n❌ Connessione caduta. Legam Bot si sta riavviando per non perdere la sessione...`)
             startBot() // Auto-riavvio vitale su telefono
        }
    })

    conn.ev.on('messages.upsert', async chatUpdate => {
        await handler(chatUpdate, conn)
    })
}

startBot()
