let handler = async (m, { args }) => {
  // Assicurati che l'utente esista nel database
  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
  let user = global.db.data.users[m.sender]

  // Inizializza valori sicuri
  if (typeof user.euro !== 'number') user.euro = 0
  if (typeof user.bank !== 'number') user.bank = 0

  if (!args[0]) return m.reply('🚩 Inserisci la quantità da prelevare.')

  let count
  if (args[0].toLowerCase() === 'all') {
    count = user.bank
    if (count <= 0) return m.reply('🚩 Non hai abbastanza soldi in banca da prelevare.')
  } else {
    if (isNaN(args[0])) return m.reply('🚩 La quantità deve essere un numero valido.')
    count = parseInt(args[0])
    if (count < 1) return m.reply('🚩 La quantità minima è 1 💶 Euro.')
    if (count > user.bank) return m.reply(`🚩 Hai solo ${user.bank} 💶 Euro in banca.`)
  }

  // Trasferimento
  user.bank -= count
  user.euro += count

  await m.reply(`🏦 Hai prelevato ${count} 💶 Euro dalla banca.\n💰 Portafoglio: ${user.euro} 💶\n🏛️ Banca: ${user.bank} 💶`)
}

handler.help = ['prelievo <numero|all>']
handler.tags = ['economy', 'rpg']
handler.command = ['prelievo', 'preleva', 'with', 'w']

export default handler
