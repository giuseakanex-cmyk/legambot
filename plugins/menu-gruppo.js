const defaultMenu = {
  before: ``.trimStart(),
  header: 'ㅤㅤ⋆｡˚『 ╭ \`MENU GRUPPO\` ╯ 』˚｡⋆\n╭',
  body: '│ ➤『👥』 %cmd',
  footer: '*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*\n',
  after: ``,                   
}
const handler = async (m, { conn, usedPrefix: _p }) => {
  const tags = { 'gruppo': 'Menu Gruppo' }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    const help = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled && plugin.tags && plugin.tags.includes('gruppo'))
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        prefix: 'customPrefix' in plugin
      }))

    const text = [
      defaultMenu.before,
      defaultMenu.header.replace(/%category/g, tags['gruppo']),
      help.map(menu => 
        menu.help.map(cmd => 
          defaultMenu.body.replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
        ).join('\n')
      ).join('\n'),
      defaultMenu.footer,
      defaultMenu.after
    ].join('\n')
    await conn.sendMessage(m.chat, {
      video: { url: './media/menu/menu3.mp4' },
      caption: text.trim(),
      gifPlayback: true,
      gifAttribution: 2,
      mimetype: 'video/mp4',
      ...fake,
      contextInfo: {
        ...fake.contextInfo,
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
            ...fake.contextInfo.forwardedNewsletterMessageInfo,
            newsletterName: "ᰔᩚ . ˚ Menu Gruppo ☆˒˒"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    throw `${global.errore}`
  }
}
handler.help = ['menugruppo']
handler.tags = ['menu']
handler.command = ['menugruppo', 'menugp', 'menuadmin']

export default handler