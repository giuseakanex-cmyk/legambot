const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let handler = async (m, { conn }) => {

    let { key } = await conn.sendMessage(m.chat, {
        text: `『 🔄 』 \`Inizializzazione riavvio...\``
    }, { quoted: m })

    await delay(1000)

    // Modifica il messaggio (Animazione Terminale)
    await conn.sendMessage(m.chat, {
        text: `『 💾 』 \`Salvataggio database e sessioni...\``, 
        edit: key
    })

    // 🔥 LA MAGIA LEGAM OS: SALVATAGGIO FORZATO PRIMA DI SPEGNERE 🔥
    if (global.db.data) {
        await global.db.write().catch(console.error)
    }

    await delay(1000)

    await conn.sendMessage(m.chat, {
        text: `『 🚀 』 \`Riavvio motore Legam OS...\``, 
        edit: key
    })

    await delay(1000)

    let finalMsg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· ♻️ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐑𝐈𝐀𝐕𝐕𝐈𝐀𝐓𝐎 ♻️ ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

Il bot è stato disconnesso e 
ricollegato con successo al server.
La memoria è stata preservata.

👑 _Tutti i sistemi sono online._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

    await conn.sendMessage(m.chat, {
        text: finalMsg, 
        edit: key
    })

    await delay(500)

    // Spegnimento Sicuro
    if (process.send) {
        process.send('reset')
    } else {
        process.exit(0)
    }
}

handler.help = ['riavvia', 'restart'] 
handler.tags = ['owner']
handler.command = /^(riavvia|reiniciar|restart)$/i 

handler.owner = true 

export default handler


