import './config.js'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from '@realvare/based'
import pino from 'pino'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { handler } from './handler.js'
import readline from 'readline'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Il Logo di LegamBot
const legambotArt = [
    ` ██╗     ███████╗ ██████╗  █████╗ ███╗   ███╗██████╗  ██████╗ ████████╗ `,
    ` ██║     ██╔════╝██╔════╝ ██╔══██╗████╗ ████║██╔══██╗██╔═══██╗╚══██╔══╝ `,
    ` ██║     █████╗  ██║  ███╗███████║██╔████╔██║██████╔╝██║   ██║   ██║    `,
    ` ██║     ██╔══╝  ██║   ██║██╔══██║██║╚██╔╝██║██╔══██╗██║   ██║   ██║    `,
    ` ███████╗███████╗╚██████╔╝██║  ██║██║ ╚═╝ ██║██████╔╝╚██████╔╝   ██║    `,
    ` ╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═════╝  ╚═════╝    ╚═╝    `
];

global.authFile = 'legamsession'; 

// Sistema per fare le domande nel terminale
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

async function startBot() {
    console.log(legambotArt.join('\n'));

    const { state, saveCreds } = await useMultiFileAuthState(global.authFile)
    const { version } = await fetchLatestBaileysVersion()

    let usePairingCode = false;
    let phoneNumber = '';
    
    // 1. Chiede il codice se non sei ancora loggato
    if (!fs.existsSync(`./${global.authFile}/creds.json`)) {
        console.log('\n=======================================')
        const answer = await question('Vuoi usare il CODICE a 8 cifre invece del QR? (si/no): ')
        if (answer.toLowerCase().startsWith('s')) {
            usePairingCode = true;
            console.log('\n⚠️ IMPORTANTE: Inserisci il numero con il prefisso internazionale, SENZA il + o gli zeri!')
            console.log('Esempio Italia: 393510000000')
            phoneNumber = await question('Inserisci il tuo numero di WhatsApp: ')
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '') // Pulisce errori di digitazione
        }
        console.log('=======================================\n')
    }
    rl.close(); // Chiude il prompt del terminale per non bloccarlo

    // 2. Avvia la connessione a WhatsApp
    const conn = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: !usePairingCode, // Mostra il QR solo se hai risposto 'no'
        logger: pino({ level: 'silent' }),
        browser: [global.botname, 'Safari', '3.0']
    })

    // --- 3. GENERAZIONE CODICE 8 CIFRE (CON RITARDO TATTICO) ---
    if (usePairingCode && !conn.authState.creds.registered) {
        console.log("⏳ Connessione ai server di WhatsApp in corso... attendi 3 secondi.")
        
        setTimeout(async () => {
            try {
                // Richiede il vero codice ai server di WhatsApp
                let realCode = await conn.requestPairingCode(phoneNumber)
                
                // Lo forza in MAIUSCOLO e mette il trattino in mezzo (es: ABCD-1234)
                let formattedCode = realCode?.match(/.{1,4}/g)?.join('-').toUpperCase() || realCode.toUpperCase()
                
                console.log(`\n\n🎯 IL TUO CODICE DI COLLEGAMENTO È: \x1b[32m${formattedCode}\x1b[0m\n\n`)
                console.log('📱 Vai su WhatsApp -> Dispositivi Collegati -> Collega con il numero di telefono\n\n')
            } catch (e) {
                console.error("\n❌ Errore nel generare il codice. Hai inserito il numero corretto (es: 39351...)?\n", e)
            }
        }, 3000) // Il famoso ritardo che risolve l'errore del codice
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
            console.error(`❌ Errore plugin ${file}:`, e)
        }
    }

    // --- 5. GESTIONE EVENTI (Salvataggio e Messaggi) ---
    conn.ev.on('creds.update', saveCreds)

    conn.ev.on('connection.update', (up) => {
        const { connection } = up
        if (connection === 'open') {
            console.log(`\n🚀 ${global.botname} È ONLINE E CONNESSO!\n`)
        }
        if (connection === 'close') {
             console.log('\n❌ Connessione chiusa. Riavvia il bot.')
             process.exit(0)
        }
    })

    conn.ev.on('messages.upsert', async chatUpdate => {
        await handler(chatUpdate, conn)
    })
}

// Lancia il bot
startBot()
