import { fileURLToPath } from 'url'
import path from 'path'

// 👑 CONFIGURAZIONE LEGAM BOT 👑

// Inserisci il tuo numero (Senza il +)
global.owner = [
  ['393780450454', 'Giuse - Creatore Supremo', true] 
]

global.botName = 'Legam Bot'
global.ownerName = 'Giuse'

// I simboli che attivano i comandi
global.prefix = /^[.!]/i 

// Nome della cartella per la sessione
global.sessionName = 'legam_session'

// Messaggi di sistema (Arroganza Level: High)
global.mess = {
    owner: '『 👑 』 `Zitto. Solo Giuse può usare questo comando.`',
    admin: '『 🛑 』 `Solo gli Admin possono darmi ordini qui dentro.`',
    botAdmin: '『 🩼 』 `Fammi Admin o non potrò fare questa magia.`',
    group: '『 ❌ 』 `Questo comando funziona solo nei gruppi.`',
    error: '『 ⚠️ 』 `C\'è stato un errore nel sistema, Giuse sta arrivando.`'
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
    __dirname,
    __filename
}

