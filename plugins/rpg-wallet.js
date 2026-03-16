// Spostiamo la funzione in alto per pulizia
function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num)
}

let handler = async (m, { conn }) => {
    let who = m.sender

    // Controllo sicurezza sul database
    if (!global.db.data.users[who]) {
        global.db.data.users[who] = {}
    }

    let user = global.db.data.users[who]

    // Evita che i soldi risultino "NaN" o undefined
    if (typeof user.euro !== 'number') user.euro = 0
    if (typeof user.bank !== 'number') user.bank = 0

    let total = user.euro + user.bank

    // Chicca: Status in base al patrimonio totale
    let status = "Pezzente 🥲"
    if (total >= 1000) status = "Operaio 👷‍♂️"
    if (total >= 10000) status = "Benestante 🥂"
    if (total >= 50000) status = "Ricco Sfondato 💸"
    if (total >= 250000) status = "Sceicco 👑"

    let message = `
╭━━✧💼 PORTAFOGLIO 💼✧━━╮
│
👤 *Utente:* @${who.split('@')[0]}
📊 *Status:* ${status}
│
💶 *Contanti:* ${formatNumber(user.euro)} €
🏦 *Banca:* ${formatNumber(user.bank)} €
│
──────────────────────
🧾 *Patrimonio Totale:* ${formatNumber(total)} €
╰━━━━━━✧✦━━━━━━━━━━━━━╯
`.trim()

    // Invia il messaggio in modo sicuro taggando l'utente e quotandolo
    await conn.sendMessage(m.chat, { text: message, mentions: [who] }, { quoted: m })
}

// Aggiunti un po' di alias comodi
handler.command = ['wallet', 'portafoglio', 'bal', 'balance', 'soldi']
handler.help = ['wallet']
handler.tags = ['euro']

export default handler
