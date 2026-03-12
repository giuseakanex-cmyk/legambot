import './config.js'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from '@realvare/based'
import pino from 'pino'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { handler } from './handler.js'
import readline from 'readline'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 🎨 ASCII Art di LegamBot
const legambotArt = [
    ` ██╗     ███████╗ ██████╗  █████╗ ███╗   ███╗██████╗  ██████╗ ████████╗ `,
    ` ██║     ██╔════╝██╔════╝ ██╔══██╗████╗ ████║██╔══██╗██╔═══██╗╚══██╔══╝ `,
    ` ██║     █████╗  ██║  ███╗███████║██╔████╔██║██████╔╝██║   ██║   ██║    `,
    ` ██║     ██╔══╝  ██║   ██║██╔══██║██║╚██╔╝██║██╔══██╗██║   ██║   ██║    `,
    ` ███████╗███████╗╚██████╔╝██║  ██║██║ ╚═╝ ██║██████╔╝╚██████╔╝   ██║    `,
    ` ╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═════╝  ╚═════╝    ╚═╝    `
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
    
    // --- 1. INTERFACCIA TERMINALE ---
    if (!fs.existsSync(`./${global.authFile}/creds.json`)) {
        console.log('\n=======================================')
        const answer = await question('Vuoi usare il CODICE a 8 cifre invece del QR? (si/no): ')
        if (answer.toLowerCase().startsWith('s')) {
            usePairingCode = true;
            console.log('\n⚠️ IMPORTANTE: Inserisci SOLO i numeri (es. 2250508616860), senza il +')
            phoneNumber = await question('Inserisci il tuo numero di WhatsApp: ')
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '') // Forza la pulizia da + o spazi
        }
        console.log('=======================================\n')
    }
    rl.close(); 

    // --- 2. CONNESSIONE (TRAVESTIMENTO ANTI-BAN ATTIVO) ---
    const conn = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: !usePairingCode,
        logger: pino({ level: 'silent' }),
        // IL SEGRETO È QUI: Ci fingiamo un normale PC con Chrome su Linux
        browser: ['Ubuntu', 'Chrome', '20.0.04'] 
    })

    // --- 3. GENERAZIONE CODICE (CON RITARDO DI SICUREZZA) ---
    if (usePairingCode && !conn.authState.creds.registered) {
        console.log("⏳ Connessione ai server di WhatsApp in corso... attendi 3 secondi.")
        
        setTimeout(async () => {
            try {
                let realCode = await conn.requestPairingCode(phoneNumber)
                let formattedCode = realCode?.match(/.{1,4}/g)?.join('-').toUpperCase() || realCode.toUpperCase()
                
                console.log(`\n\n🎯 IL TUO CODICE DI COLLEGAMENTO È: \x1b[32m${formattedCode}\x1b[0m\n\n`)
                console.log('📱 Vai su WhatsApp -> Dispositivi Collegati -> Collega con il numero di telefono\n\n')
            } catch (e) {
                console.error("\n❌ Errore critico nel generare il codice. Assicurati che il numero sia corretto.\n", e)
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
            console.log(`📌 Plugin caricato: ${file}`)
        } catch (e) {
            console.error(`❌ Errore nel plugin ${file}:`, e)
        }
    }

    // --- 5. GESTIONE EVENTI WHATSAPP ---
    conn.ev.on('creds.update', saveCreds)

    conn.ev.on('connection.update', (up) => {
        const { connection } = up
        if (connection === 'open') {
            console.log(`\n🚀 ${global.botname} È ONLINE E CONNESSO CON SUCCESSO!\n`)
        }
        if (connection === 'close') {
             console.log('\n❌ Connessione interrotta o disconnessa. Riavvia il bot.')
             process.exit(0)
        }
    })

    conn.ev.on('messages.upsert', async chatUpdate => {
        await handler(chatUpdate, conn)
    })
}

startBot()
