// comando creato e pensato da easter
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const args = text.trim().split(/\s+/)
  if (!text || args[0].toLowerCase() === 'list') {
    let list = '*API Keys Disponibili:*\n\n'
    for (const [key, value] of Object.entries(global.APIKeys)) {
      const status = value === 'varebot' ? '❌' : '✅'
      list += `• ${key}: ${status}\n`
    }
    return m.reply(list)
  }

  if (args.length < 2) {
    return m.reply(`*Uso:* ${usedPrefix}${command} [nome api] [token]`)
  }

  const key = args[0]
  const value = args.slice(1).join(' ')

  if (!global.APIKeys.hasOwnProperty(key)) {
    return m.reply(`*Errore:* API key '${key}' non trovata. Usa ${usedPrefix}${command} per vedere quelle disponibili.`)
  }

  global.APIKeys[key] = value
  try {
    const configPath = path.join(process.cwd(), 'config.js')
    let configContent = fs.readFileSync(configPath, 'utf-8')
    const regex = new RegExp(`(\\s*${key}:\\s*)'[^']*'(,?\\s*)`, 'g')
    configContent = configContent.replace(regex, `$1'${value}'$2`)

    fs.writeFileSync(configPath, configContent, 'utf-8')

    m.reply(`*✅ API Key '${key}' aggiornata con successo!*`)
  } catch (error) {
    console.error(error)
    m.reply('*❌ Errore nell\'aggiornamento del file config.js*')
  }
}

handler.command = ['config', 'api']
handler.owner = true
handler.help = ['config <nome api> <key>']
handler.tags = ['creatore']

export default handler