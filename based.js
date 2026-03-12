import './config.js'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from '@realvare/based'
import qrcode from 'qrcode-terminal'
import pino from 'pino'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { handler } from './handler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Il tuo Logo personalizzato per il terminale
const legambotArt = [
    ` ██╗     ███████╗ ██████╗  █████╗ ███╗   ███╗██████╗  ██████╗ ████████╗ `,
    ` ██║     ██╔════╝██╔════╝ ██╔══██╗████╗ ████║██╔══██╗██╔═══██╗╚══██╔══╝ `,
    ` ██║     █████╗  ██║  ███╗███████║██╔████╔██║██████╔╝██║   ██║   ██║    `,
    ` ██║     ██╔══╝  ██║   ██║██╔══██║██║╚██╔╝██║██╔══██╗██║   ██║   ██║    `,
    ` ███████╗███████╗╚██████╔╝██║  ██║██║ ╚═╝ ██║██████╔╝╚██████╔╝   ██║    `,
    ` ╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═════╝  ╚═════╝    ╚═╝    `
];

// La tua cartella sessione privata (addio varesession!)
global.authFile = 'legamsession'; 

async function startBot() {
    // 1. Stampa il logo nel terminale
    console.log(legambotArt.join('\n'));

    const { state, saveCreds } = await useMultiFileAuthState(global.authFile)
    const { version } = await fetchLatestBaileysVersion()

    const conn = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }), // Tiene pulito il terminale
        browser: [global.botname, 'Safari', '3.0']
    })

    // --- 2. CARICAMENTO DINAMICO DEI PLUGIN ---
    global.plugins = {}
    const pluginsFolder = path.join(__dirname, 'plugins')
    
    // Se non hai ancora creato la cartella plugins, la crea lui da solo
    if (!fs.existsSync(pluginsFolder)) {
        fs.mkdirSync(pluginsFolder)
        console.log('📁 Cartella plugins creata automaticamente!')
    }
    
    const files = fs.readdirSync(pluginsFolder).filter(f => f.endsWith('.js'))
    for (const file of files) {
        try {
            const filePath = pathToFileURL(path.join(pluginsFolder, file)).href
            const module = await import(filePath)
            global.plugins[file] = module.default || module
            console.log(`📌 Plugin caricato: ${file}`)
        } catch (e) {
            console.error(`❌ Errore nel caricare il plugin ${file}:`, e)
        }
    }

    // --- 3. GESTIONE CONNESSIONE A WHATSAPP ---
    conn.ev.on('creds.update', saveCreds)

    conn.ev.on('connection.update', (up) => {
        const { connection, qr } = up
        if (qr) qrcode.generate(qr, { small: true })
        if (connection === 'open') {
            console.log(`\n🚀 ${global.botname} È ONLINE E PRONTO ALL'USO!\n`)
        }
    })

    // --- 4. ASCOLTO DEI MESSAGGI (Collega l'handler) ---
    conn.ev.on('messages.upsert', async chatUpdate => {
        await handler(chatUpdate, conn)
    })
}

// Avvia tutto
startBot()
