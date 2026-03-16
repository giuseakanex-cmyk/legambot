import fs from 'fs'

const defaultMenu = {
  before: ``.trimStart(),
  header: 'ㅤㅤ⋆｡˚『 ╭ \`MENU GIOCHI\` ╯ 』˚｡⋆\n╭',
  body: '│ ➤『🎮』 %cmd',
  footer: '*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*\n',
  after: ``,
}
const handler = async (m, { conn, usedPrefix: _p }) => {
  const tags = { 'giochi': 'Giochi' }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    const help = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled && plugin.tags && plugin.tags.includes('giochi'))
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        prefix: 'customPrefix' in plugin
      }))

    const text = [
      defaultMenu.before,
      defaultMenu.header.replace(/%category/g, tags['giochi']),
      help.map(menu => 
        menu.help.map(cmd => 
          defaultMenu.body.replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
        ).join('\n')
      ).join('\n'),
      defaultMenu.footer,
      defaultMenu.after
    ].join('\n') 

 conn.sendMessage(m.chat, {
    image: fs.readFileSync('./media/menu/varebotcoc.jpg'),
    caption: text.trim(),
    ...fake,
    contextInfo: {
        ...fake.contextInfo,
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
            ...fake.contextInfo.forwardedNewsletterMessageInfo,
            newsletterName: "ᰔᩚ . ˚ Menu Giochi ☆˒˒"
        }
    }
}, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, global.fake.error, m)
    throw e
  }
}
handler.help = ['menugiochi']
handler.tags = ['menu']
handler.command = ['menugiochi', 'menugame']

export default handler