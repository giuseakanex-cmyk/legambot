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
`✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🩸 𝐏𝐀𝐓𝐓𝐎 𝐃𝐈 𝐒𝐀𝐍𝐆𝐔𝐄 🩸 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
『 🛡️ 』 𝐍𝐨𝐦𝐢𝐧𝐚: ${name}
『 📍 』 𝐃𝐨𝐦𝐢𝐧𝐢𝐨: Limitato a questo territorio
『 ⚖️ 』 𝐂𝐨𝐧𝐝𝐢𝐳𝐢𝐨𝐧𝐞: Fino all'inevitabile tradimento.
👑 Ti è stato concesso il potere. Non deluderci.
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.
'.trim();


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
