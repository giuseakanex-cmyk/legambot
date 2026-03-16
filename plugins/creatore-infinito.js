const handler = async (m, { conn, args }) => {
  const target = args[0] ? args[0].replace(/[@]/g, '') + '@s.whatsapp.net' : m.sender;
  const user = global.db.data.users[target];

  if (!user) return m.reply(`🚫 L'utente non è presente nel database.`);

  user.infinito = true;
  user.money = 999999999999;
  user.euro = 999999999999;
  user.level = 999999999999;
  user.exp = 999999999999;

  const frasiAltri = [
    'è stato promosso agli occhi del creatore',
    'è stato benedetto',
    'ora cammina tra gli immortali'
  ];

  const frasiSelf = [
    'si è auto-divinizzato',
    'ha smesso di giocare',
  ];

  const frase = target === m.sender
    ? frasiSelf[Math.floor(Math.random() * frasiSelf.length)]
    : frasiAltri[Math.floor(Math.random() * frasiAltri.length)];

  await global.db.write();

  conn.sendMessage(
    m.chat,
    {
      text: `♾️ - *@${target.split('@')[0]} ${frase}*`,
      mentions: [target],
    },
    { quoted: m }
  );
};

handler.help = ['infinito'];
handler.tags = ['creatore'];
handler.command = /^(illimitato|infinito|infinity)$/i;
handler.owner = true;

export default handler;