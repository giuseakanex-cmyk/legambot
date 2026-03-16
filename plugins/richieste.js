const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

var handler = async (m, { conn, isBotAdmin, isAdmin }) => {
  if (!isAdmin) return 
  if (!isBotAdmin) return m.reply('⚠️ Il bot deve essere admin.')

  try {
    await conn.query({
      tag: 'iq',
      attrs: {
        to: m.chat,
        type: 'set',
        xmlns: 'w:g2',
      },
      content: [{
        tag: 'membership_approval_mode',
        attrs: {},
        content: [{
          tag: 'group_join',
          attrs: { state: 'off' } 
        }]
      }]
    })
    
    await conn.sendMessage(m.chat, { text: '✅ Ho accettato tutte le richieste.' }, { quoted: m })

    await delay(2000)

    await conn.query({
      tag: 'iq',
      attrs: {
        to: m.chat,
        type: 'set',
        xmlns: 'w:g2',
      },
      content: [{
        tag: 'membership_approval_mode',
        attrs: {},
        content: [{
          tag: 'group_join',
          attrs: { state: 'on' } 
        }]
      }]
    })
    

  } catch (e) {
    console.error("ERRORE_QUERY_DIRETTA:", e)
    m.reply('❌ Errore')
  }
}

handler.help = ['accetta']
handler.tags = ['group']
handler.command = ['accetta', 'acetta'] 

handler.group = true
handler.admin = true 
handler.botAdmin = true

export default handler
