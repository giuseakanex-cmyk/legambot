let handler = async (m, { conn }) => {

    // ==========================================
    // 🛠️ MODIFICA QUI SOTTO LE INFO DELLA PATCH 🛠️
    // ==========================================
    
    let versione = "v8.5.0" // Cambia questo numero ad ogni patch
    let dataRelease = "Oggi"
    
    // Le novità che hai aggiunto (usa │ 🟢 per mantenere lo stile)
    let novita = `
│ 🟢 Nuovo Menu Sicurezza super compatto
│ 🟢 Bestemmiometro VIP integrato
│ 🟢 Grafica di Benvenuto/Addio con miniatura quadrata
│ 🟢 Comando .ds reso infallibile
    `.trim()

    // I bug che hai risolto (usa │ 🛠️ per mantenere lo stile)
    let fix = `
│ 🛠️ Risolto il crash dei vecchi bottoni
│ 🛠️ Eliminato il "Fantasma di WhatsApp" sui fake quotes
│ 🛠️ Sistemati i permessi di amministrazione
    `.trim()

    // Un messaggio finale per gli utenti
    let note = "Digita .menu per vedere la nuova veste grafica del bot!"

    // ==========================================
    // NON TOCCARE NIENTE QUI SOTTO (Motore Grafico)
    // ==========================================

    let patchTesto = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🚀 𝐍𝐔𝐎𝐕𝐎 𝐀𝐆𝐆𝐈𝐎𝐑𝐍𝐀𝐌𝐄𝐍𝐓𝐎 🚀 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🏷️ 』 𝐕𝐞𝐫𝐬𝐢𝐨𝐧𝐞: *${versione}*
『 📅 』 𝐃𝐚𝐭𝐚: *${dataRelease}*

╭── ✨ 𝐍𝐎𝐕𝐈𝐓𝐀' ──⬣
${novita}
╰───────────────⬣

╭── 🔧 𝐁𝐔𝐆 𝐅𝐈𝐗 ──⬣
${fix}
╰───────────────⬣

📌 _Note:_ ${note}

👑 _Update rilasciato ufficialmente dal Legam OS_
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

    // 🔥 CONTESTO CANALE VIP (INFALLIBILE E ANTI-CRASH) 🔥
    let channelContext = {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363233544482011@newsletter', 
            serverMessageId: 100,
            newsletterName: `🛠️ System Update ${versione}` // Titolo personalizzato nel canale
        }
    };

    // Invio del messaggio
    await conn.sendMessage(m.chat, { text: patchTesto, contextInfo: channelContext }, { quoted: m })
}

handler.help = ['patch', 'aggiornamento']
handler.tags = ['owner']
handler.command = /^(patch|aggiornamento|update|novita)$/i

handler.owner = true // SOLO TU (Owner) puoi lanciare questo comando!

export default handler

