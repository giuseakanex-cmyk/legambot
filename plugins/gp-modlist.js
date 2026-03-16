const handler = async (m, { conn, text }) => {
  if (!m.isGroup)
    return m.reply('⚠️ Questo comando funziona solo nei gruppi.');

  const users = global.db.data.users || {};

  const mods = Object.entries(users)
    .filter(([jid, user]) =>
      user &&
      user.premium === true &&
      user.premiumGroup === m.chat
    )
    .map(([jid]) => jid);

  if (mods.length === 0)
    return m.reply('⚠️ 𝐿𝛴𝐺𝛬𝑀 𝚩𝚯𝐓,non ci sono mod attivi in questo momento.');

  const customMsg = text
    ? `╔═════[ 𝕄𝔼𝕊𝕊𝔸𝔾𝔾𝕀𝕆 ]══╗
${text}
╚═══════════════╝

`
    : '';

  const caption = `
╔═[  𝐿𝛴𝐺𝛬𝑀 𝚩𝚯𝐓  ]═╗
            👑 𝗜 𝗣𝗥𝗘𝗦𝗖𝗘𝗟𝗧𝗜 👑
╚═══════════════╝

${customMsg}🔥MODs:
➤ ${mods.length}

🔥 𝗦𝗧𝗔𝗙𝗙 🔥
${mods.map((jid, i) => `➤ ${i + 1}. @${jid.split('@')[0]}`).join('\n')}
`.trim();

  await conn.sendMessage(
    m.chat,
    {
      text: caption,
      mentions: mods
    },
    { quoted: m }
  );
};

handler.help = ['modlist (messaggio)'];
handler.tags = ['group'];
handler.command = ['modlist'];
handler.group = true;
handler.admin = true;

export default handler;
