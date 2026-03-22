let handler = async (m, { conn, usedPrefix }) => {

    // Estrae il numero del moderatore per taggarlo nel menu
    let modNumber = m.sender.split('@')[0];

    // Il testo impaginato con lo stile Legam VIP
    let txt = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🛡️ 𝐏𝐀𝐍𝐍𝐄𝐋𝐋𝐎 𝐌𝐎𝐃𝐄𝐑𝐀𝐓𝐎𝐑𝐈 🛡️ ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 👤 』 𝐀𝐮𝐭𝐨𝐫𝐢𝐭𝐚': @${modNumber}
『 ⚙️ 』 𝐀𝐜𝐜𝐞𝐬𝐬𝐨: _Garantito_

╭── 🛠️ 𝐀𝐑𝐒𝐄𝐍𝐀𝐋𝐄 𝐒𝐓𝐀𝐅𝐅 ──⬣
│ 📢 ➭ *${usedPrefix}totag*
│ _Richiama l'attenzione del gruppo_
│
│ ⚡ ➭ *${usedPrefix}pingmod*
│ _Verifica la latenza del server_
│
│ 🗑️ ➭ *${usedPrefix}delm*
│ _Elimina un messaggio istantaneamente_
│
│ ☢️ ➭ *${usedPrefix}nukegp*
│ _Simulazione distruzione chat_
│
│ ⚠️ ➭ *${usedPrefix}warnmod*
│ _Applica sanzione a un utente_
│
│ ✅ ➭ *${usedPrefix}unwarnmod*
│ _Rimuovi sanzione a un utente_
╰───────────────⬣

👑 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐒𝐞𝐜𝐮𝐫𝐢𝐭𝐲 𝐯𝟎.𝟏
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    // Invio infallibile con lo Scudo VIP Legam OS
    await conn.sendMessage(m.chat, {
        text: txt,
        mentions: [m.sender], // Permette il funzionamento del tag @numero
        contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363233544482011@newsletter',
                serverMessageId: 100,
                newsletterName: `🛡️ Staff Legam OS`
            }
        }
    }, { quoted: m });
}

handler.help = ['menumod']
handler.tags = ['menu']
handler.command = /^(\.?menumod)$/i

// 🔥 BLOCCO DI SICUREZZA 🔥
// Solo i tuoi Moderatori (e te che sei l'Owner) possono aprire questo menu!
handler.mods = true 

export default handler

