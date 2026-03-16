const MENU_IMAGE_URL = 'https://i.ibb.co/5gt7Zdvf/IMG-1823.png';

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {

    let name = await conn.getName(m.sender) || 'Utente'
    let uptime = clockString(process.uptime() * 1000)

    let text = `
╭⭒─ׄ─⊱ *𝐌𝐄𝐍𝐔 - 𝐿𝛴𝐺𝛬𝑀 𝚩𝚯𝐓* ⊰
✦ 👤 \`Utente:\` *${name}*
✧ 🪐 \`Attivo da:\` *${uptime}*
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒

      ⋆｡˚『 𝐌𝐄𝐍𝐔 𝐃𝐈𝐒𝐏𝐎𝐍𝐈𝐁𝐈𝐋𝐈 』˚｡⋆
╭

*│ ➤* 🤖 ${_p}menuia
*│ ➤* ⭐ ${_p}menupremium
*│ ➤* 🛠️ ${_p}menustrumenti
*│ ➤* 💰 ${_p}menueuro
*│ ➤* 🎮 ${_p}menugiochi
*│ ➤* 👥 ${_p}menugruppo
*│ ➤* 🔍 ${_p}menuricerche
*│ ➤* 📥 ${_p}menudownload
*│ ➤* 👨‍💻 ${_p}menucreatore
*│ ➤* 🛡️ ${_p}menumod


*│ ➤* ☢️ .contronuke

╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

✨ Scrivi il comando per aprire il menu desiderato.
`.trim()

    await conn.sendMessage(m.chat, {
      image: { url: MENU_IMAGE_URL },
      caption: text
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      text: "❌ Errore menu:\n" + String(e)
    }, { quoted: m })
  }
}

handler.help = ['menu']
handler.command = ['menu', 'menuall', 'menucompleto', 'funzioni','comandi', 'help']

export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
