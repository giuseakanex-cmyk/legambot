const handler = async (m, { conn }) => {
  const jid = m.chat

  await conn.sendMessage(
    jid,
    {
      text: `〖 🌸 〗 \`Benvenuto in VareBot!\``,
      title: '',
      footer: ``,
      cards: [
        {
          image: { url: 'media/menu/varebot.jpeg' },
          title: `\`by sam aka vare\``,
          body: `〖 💫 〗 *Esplora tutte le funzionalità*\n〖 🚀 〗 *Bot sempre aggiornato*\n〖 🌑 〗 *Miglior bot di zozzap*`,
          footer: '˗ˏˋ ☾ 𝚟𝚊𝚛𝚎𝚋𝚘𝚝 ☽ ˎˊ˗',
          buttons: [
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: 'Repo - VareBot',
                url: 'https://github.com/realvare/varebot'
              })
            }
          ]
        }
      ]
    },
  { quoted: m }
  )
}

handler.command = ['repositorio', 'repo', 'source', 'sourcecode', 'script']
handler.tags = ['main']
handler.help = ['repo']
export default handler