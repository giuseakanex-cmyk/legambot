import { performance } from 'perf_hooks'

let handler = async (m, { conn, text }) => {
  let nomeDelBot = global.db.data.nomedelbot || `𝐂𝐡𝐚𝐭𝐔𝐧𝐢𝐭𝐲`

  // Identifica il destinatario: risposto o menzionato
  let destinatario;
  if (m.quoted && m.quoted.sender) {
    destinatario = m.quoted.sender;
  } else if (m.mentionedJid && m.mentionedJid.length > 0) {
    destinatario = m.mentionedJid[0];
  } else {
    return m.reply("Tagga qualcuno o rispondi a un messaggio per segarlo 😏");
  }

  let nomeDestinatario = `@${destinatario.split('@')[0]}`

  // Messaggio iniziale
  let { key } = await conn.sendMessage(m.chat, { 
    text: `Ora sego ${nomeDestinatario}...`,
    mentions: [destinatario]
  }, { quoted: m })

  const array = [
    "8===👊=D", "8=👊===D", "8==👊==D", "8===👊=D", "8===👊=D💦"
  ]

  for (let item of array) {
    await conn.sendMessage(m.chat, { 
      text: `${item}`, 
      edit: key,
      mentions: [destinatario]
    }, { quoted: m })
    await new Promise(resolve => setTimeout(resolve, 20))
  }

  // Messaggio finale
  return conn.sendMessage(m.chat, { 
    text: `Oh ${nomeDestinatario} ha sborrato! 😋💦`,
    edit: key,
    mentions: [destinatario]
  }, { quoted: m })
}

handler.help = ['sega']
handler.tags = ['giochi']
handler.command = /^(sega)$/i

export default handler