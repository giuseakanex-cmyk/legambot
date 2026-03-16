let handler = async (m, { text }) => {

  let user = global.db.data.users[m.sender]

  if (!text) {
    return m.reply(`💶 Scrivi quanti euro vuoi aggiungere

Esempio:
.ownereuro 5000`)
  }

  let amount = parseInt(text)

  if (isNaN(amount)) {
    return m.reply("❌ Inserisci un numero valido.")
  }

  user.euro += amount

  m.reply(`
💸 EURO AGGIUNTI

➤ Quantità: ${amount} €
➤ Totale wallet: ${user.euro} €

👑 Comando eseguito dall'OWNER
`.trim())

}

handler.help = ['ownereuro <numero>']
handler.tags = ['rpg']
handler.command = /^(ownereuro)$/i

handler.owner = true

export default handler
