import fetch from 'node-fetch'

const handler = async (m, { conn }) => {
  if (!m.isGroup)
    return m.reply('⚠️ Questo comando può essere usato solo nei gruppi.');

  let who = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
  if (!who)
    return m.reply('⚠️ Devi taggare l’utente da promuovere a MOD.');

  let user = global.db.data.users[who] || (global.db.data.users[who] = {});

  if (user.premium && user.premiumGroup === m.chat)
    return m.reply('⚠️ Questo utente è già MOD in questo gruppo.');

  user.premium = true;
  user.premiumGroup = m.chat;

  let thumb = null;

  try {
    const ppUrl = await conn.profilePictureUrl(who, 'image');
    const res = await fetch(ppUrl);
    thumb = await res.buffer();
  } catch {
    thumb = null;
  }

  const name = '@' + who.split('@')[0];

  const caption = `
╭━✧  𝐿𝛴𝐺𝛬𝑀 𝚩𝚯𝐓  ✦╮
        🛡️ 𝗡𝗨𝗢𝗩𝗢 𝗣𝗥𝗘𝗦𝗖𝗘𝗟𝗧𝗢! 🛡️
╰━━━━━━✧✦━━━━━━╯

👤 Utente: ${name}
⚡ Attivo solo qui
♾️ Fino al tradimento..
`.trim();

  await conn.sendMessage(
    m.chat,
    {
      text: caption,
      mentions: [who],
      contextInfo: thumb
        ? {
            mentionedJid: [who],
            jpegThumbnail: thumb
          }
        : { mentionedJid: [who] }
    },
    { quoted: m }
  );
};

handler.help = ['addmod @user'];
handler.tags = ['group'];
handler.command = ['addmod'];
handler.group = true;
handler.owner = true;

export default handler;
