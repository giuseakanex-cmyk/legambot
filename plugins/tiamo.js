let handler = async (m, { conn }) => {
    // ID dei protagonisti
    const giuseNum = '4915511872095'
    const lindaNum = '212780909981'
    
    // Estraiamo il numero di chi scrive
    const senderNum = m.sender.split('@')[0]

    // Se a scrivere "ti amo" è Giuse
    if (senderNum === giuseNum) {
        await conn.sendMessage(m.chat, { react: { text: '🤨', key: m.key } })
        
        let msgGiuse = `
⊹ ࣪ ˖ ✦ ━━ 𝐀𝐋𝐋𝐄𝐑𝐓𝐀 𝐆𝐈𝐔𝐒𝐄 ━━ ✦ ˖ ࣪ ⊹

🤨 *Frena i cavalli, Giuse!* Non ti ricordi che queste parole le puoi rivolgere **solo a Linda**? 

⚠️ \`Protocollo Fedeltà Attivo:\` 
Il database ha registrato la tua dichiarazione. Non costringermi a inviare un report dettagliato alla "capo" eh... torna subito a fare il bravo! 🤫💖

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()
        
        return await conn.reply(m.chat, msgGiuse, m, global.rcanal)
    }

    // Se a scrivere "ti amo" è Linda
    if (senderNum === lindaNum) {
        await conn.sendMessage(m.chat, { react: { text: '👀', key: m.key } })
        
        let msgLinda = `
⊹ ࣪ ˖ ✦ ━━ 𝐀𝐋𝐋𝐄𝐑𝐓𝐀 𝐋𝐈𝐍𝐃𝐀 ━━ ✦ ˖ ࣪ ⊹

👀 *Attenzione Linda!* Guarda che Giuse è molto geloso del suo bot... ricordati che quel "ti amo" deve avere un solo destinatario: **Giuse**! 

💍 \`Legam Core Security:\` 
Ho appena attivato la scansione dei sentimenti. Non vorrai mica che faccia scattare l'allarme generale nel sistema di Giuse? Ti tengo d'occhio! ✨🔐

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()
        
        return await conn.reply(m.chat, msgLinda, m, global.rcanal)
    }

    // Se lo dice qualcun altro, il bot non fa nulla (così non rompe le scatole nel gruppo)
    return;
}

// Scatta ogni volta che nel testo compare "ti amo" (senza bisogno di prefisso)
handler.customPrefix = /ti amo/i 
handler.command = new RegExp

export default handler

