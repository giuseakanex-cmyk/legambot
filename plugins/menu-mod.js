let handler = async (m, { usedPrefix }) => {

  let txt = `
𝐿𝛴𝐺𝛬𝑀 𝚩𝚯𝐓 – 𝐌𝐄𝐍𝐔 𝐏𝐑𝐄𝐒𝐂𝐄𝐋𝐓𝐈🛡️

•━━━━━━✧✦━━━━━━•
🛠️ 𝐂𝐎𝐌𝐀𝐍𝐃𝐈 𝐌𝐎𝐃𝐄𝐑𝐀𝐓𝐎𝐑𝐈
➤ ${usedPrefix}tagmod 🧙‍♂️ Tagga tutto il gruppo 
➤ ${usedPrefix}pingmod ⚡ Verifica il ping
➤ ${usedPrefix}delm 🚫 Elimina messaggio 
➤ ${usedPrefix}nukegp ☢️ Fake nuke
➤ ${usedPrefix}warnmod ⚠️ Avvisa utente
➤ ${usedPrefix}unwarnmod ✅ Rimuovi avviso
•━━━━━━✧✦━━━━━━•
🐉 Versione: *0.1*
`

  m.reply(txt)
}

handler.help = ['menumod']
handler.tags = ['menu']
handler.command = /^(\.?menumod)$/i

export default handler
