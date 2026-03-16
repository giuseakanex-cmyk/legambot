import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import chalk from 'chalk'

// 👑 CONFIGURAZIONE OWNER
global.owner = [
  ['393780450454', 'Giuse', true], // Inserisci il tuo numero qui
]

global.mods = []
global.prems = []

// 🤖 INFO BOT
global.nomebot = '𝐋𝐄𝐆𝐀𝐌 𝐁𝐎𝐓'
global.nomepack = 'Legam Bot Pack'
global.autore = 'Giuse'
global.prefix = /^[.!]/i

// 📂 SESSIONE
global.authFile = 'varesession'

// 💬 MESSAGGI DI SISTEMA (dfail)
global.dfail = (type, m, conn) => {
    let msg = {
        rowner: '『 👑 』 `Solo il Creatore Supremo può usare questo comando.`',
        owner: '『 👑 』 `Accesso riservato agli sviluppatori autorizzati.`',
        premium: '『 💎 』 `Comando esclusivo per utenti Premium.`',
        group: '『 👥 』 `Questo comando funziona solo all\'interno dei gruppi.`',
        private: '『 📩 』 `Usa questo comando nella chat privata del bot.`',
        admin: '『 🛑 』 `Solo gli Amministratori possono darmi ordini.`',
        botAdmin: '『 🤖 』 `Per favore, fammi Admin o non potrò agire.`',
        disabled: '『 ⚠️ 』 `Questo comando è stato disattivato dallo Staff.`'
    }[type]
    if (msg) return m.reply(msg)
}

let file = fileURLToPath(import.meta.url)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.cyanBright("Aggiornamento config.js..."))
    import(`${file}?update=${Date.now()}`)
})

