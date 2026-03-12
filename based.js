import './config.js'
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from '@realvare/based'
import qrcode from 'qrcode-terminal'
import pino from 'pino'

const varebot = [
    ` ██╗     ███████╗ ██████╗  █████╗ ███╗   ███╗██████╗  ██████╗ ████████╗ `,
    ` ██║     ██╔════╝██╔════╝ ██╔══██╗████╗ ████║██╔══██╗██╔═══██╗╚══██╔══╝ `,
    ` ██║     █████╗  ██║  ███╗███████║██╔████╔██║██████╔╝██║   ██║   ██║    `,
    ` ██║     ██╔══╝  ██║   ██║██╔══██║██║╚██╔╝██║██╔══██╗██║   ██║   ██║    `,
    ` ███████╗███████╗╚██████╔╝██║  ██║██║ ╚═╝ ██║██████╔╝╚██████╔╝   ██║    `,
    ` ╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═════╝  ╚═════╝    ╚═╝    `
];

global.authFile = 'legamsession';

async function startBot() {
    console.log(varebot.join('\n'));
    const { state, saveCreds } = await useMultiFileAuthState(global.authFile)
    const { version } = await fetchLatestBaileysVersion()

    const conn = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: [global.botname, 'Safari', '3.0']
    })

    conn.ev.on('creds.update', saveCreds)

    conn.ev.on('connection.update', (up) => {
        const { connection, qr } = up
        if (qr) qrcode.generate(qr, { small: true })
        if (connection === 'open') console.log(`\n🚀 ${global.botname} È ONLINE E PRONTO!\n`)
    })
}

startBot()
