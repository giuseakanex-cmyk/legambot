const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let handler = async (m, { conn }) => {

    // 1. Invia il primo messaggio e ne salva la "chiave" (per poterlo modificare dopo)
    let { key } = await conn.sendMessage(m.chat, {
        text: `『 🔄 』 \`Inizializzazione riavvio...\``
    }, { quoted: m })

    await delay(1000) // Aspetta 1 secondo

    // 2. Modifica il messaggio (Animazione Terminale)
    await conn.sendMessage(m.chat, {
        text: `『 ⚙️ 』 \`Salvataggio database e sessioni...\``, 
        edit: key
    })

    await delay(1000)

    // 3. Modifica il messaggio
    await conn.sendMessage(m.chat, {
        text: `『 🚀 』 \`Riavvio motore Legam OS...\``, 
        edit: key
    })

    await delay(1000)

    // 4. Messaggio finale VIP
    let finalMsg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· ♻️ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐑𝐈𝐀𝐕𝐕𝐈𝐀𝐓𝐎 ♻️ ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

Il bot è stato disconnesso e 
ricollegato con successo al server.

👑 _Tutti i sistemi sono online._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

    await conn.sendMessage(m.chat, {
        text: finalMsg, 
        edit: key
    })

    await delay(500) // Breve pausa per far leggere il messaggio prima di spegnere

    // 🔥 MOTORE DI RIAVVIO SICURO 🔥
    // Se il bot è gestito da un file index.js esterno (metodo moderno)
    if (process.send) {
        process.send('reset')
    } else {
        // Se è gestito da PM2, nodemon o bash (metodo classico)
        process.exit(0)
    }
}

handler.help = ['riavvia', 'restart'] 
handler.tags = ['owner']
handler.command = /^(riavvia|reiniciar|restart)$/i 

handler.owner = true // Solo tu puoi riavviarlo

export default handler


