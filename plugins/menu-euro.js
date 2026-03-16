const defaultMenu = {
  before: ``.trimStart(),
  header: 'ㅤㅤ⋆｡˚『 ╭ `MENU %category` ╯ 』˚｡⋆\n╭',
  body: '│ ➤ 『 🪙 』 *%cmd*',
  footer: '*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*\n',
  after: ``
}

const handler = async (m, { conn, usedPrefix: _p }) => {
  // Qui definiamo gli "slot" (le categorie) che il bot deve cercare
  const categorie = {
    'euro': 'EURO',
    'rpg': 'RPG / AVVENTURA',
    'taglia': 'TAGLIE',
    'virtual': 'VIRTUALI'
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    let menuCompleto = ""

    // Ciclo che riempie ogni slot se trova plugin con quel tag
    for (let tag in categorie) {
        let comandi = Object.values(global.plugins)
            .filter(plugin => !plugin.disabled && plugin.tags && plugin.tags.includes(tag))
            .map(plugin => ({
                help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
                prefix: 'customPrefix' in plugin
            }))

        if (comandi.length > 0) {
            menuCompleto += defaultMenu.header.replace(/%category/g, categorie[tag]) + '\n'
            menuCompleto += comandi.map(menu => 
                menu.help.map(cmd => 
                    defaultMenu.body.replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
                ).join('\n')
            ).join('\n')
            menuCompleto += '\n' + defaultMenu.footer + '\n'
        }
    }

   await conn.sendMessage(m.chat, {
      video: { url: './media/menu/menu4.mp4' },
      caption: menuCompleto.trim(),
      gifPlayback: true,
      gifAttribution: 2,
      mimetype: 'video/mp4',
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363233544482011@newsletter',
            newsletterName: "✨.✦★彡 Menu by Giuse Ξ★✦.•",
            serverMessageId: 143
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, "❌ Errore nel caricamento del menu", m)
    throw e
  }
}

handler.help = ['menueuro']
handler.tags = ['menu']
handler.command = ['menueuro']

export default handler
