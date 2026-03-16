let handler = async (m, { conn }) => {
    let user = m.sender
    if (!global.db.data.users[user]) global.db.data.users[user] = {}
    let u = global.db.data.users[user]
    if (!u.euro) u.euro = 0

    let amount = Math.floor(Math.random() * 400) + 100
    let success = Math.random() < 0.5

    if (success) {
        u.euro += amount
        conn.reply(m.chat,
            `🕶️ Colpo riuscito!\nHai guadagnato ${amount} €\nTotale: ${u.euro} €`, m)
    } else {
        let loss = Math.floor(amount / 2)
        u.euro -= loss
        if (u.euro < 0) u.euro = 0
        conn.reply(m.chat,
            `🚔 Ti hanno beccato!\nHai perso ${loss} €\nTotale: ${u.euro} €`, m)
    }
}

handler.command = /^crimine$/i
export default handler
