import fs from 'fs'

// --- IMPOSTAZIONI BASE ---
global.owner = [['393780450454', 'Giuse', true]] // Inserisci il tuo numero qui col 39 davanti
global.botname = '𝐋𝐄𝐆𝐀𝐌𝐁𝐎𝐓 𝐕𝟑'
global.prefix = /^[./!#]/

// --- DATABASE E AUTOSAVE ---
global.db = { data: { users: {}, chats: {}, settings: {} } }
const dbFile = './database.json'

// Crea il database se non esiste
if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify(global.db.data, null, 2))
} else {
    global.db.data = JSON.parse(fs.readFileSync(dbFile))
}

// Autosave ogni 30 secondi
setInterval(() => {
    fs.writeFileSync(dbFile, JSON.stringify(global.db.data, null, 2))
}, 30000)
