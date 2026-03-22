import fetch from 'node-fetch'

const handler = async (m, { conn }) => {
  if (!m.isGroup)
    return m.reply('『 ⚠️ 』 \`Questo comando può essere usato solo nei gruppi.\`');

  let who = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
  if (!who)
    return m.reply('『 ⚠️ 』 \`Devi taggare l’utente da elevare a Prescelto.\`');

  let user = global.db.data.users[who] || (global.db.data.users[who] = {});

  if (user.premium && user.premiumGroup === m.chat)
    return m.reply('『 💡 』 \`Questo utente ha già stipulato il Patto in questo territorio.\`');

  // Lo promuove a Moderatore del gruppo
  user.premium = true;
  user.premiumGroup = m.chat;

  // Recupera la foto profilo per l'estetica VIP
  let ppUrl;
  try {
    ppUrl = await conn.profilePictureUrl(who, 'image');
  } catch {
    ppUrl = 'https://files.catbox.moe/57bmbv.jpg'; // Fallback se non ha la foto o è nascosta
  }

  const name = '@' + who.split('@')[0];

  // IL PATTO DI SANGUE (Opzione 2)
  const caption = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🩸 𝐏𝐀𝐓𝐓𝐎 𝐃𝐈 𝐒𝐀𝐍𝐆𝐔𝐄 🩸 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🛡️ 』 𝐍𝐨𝐦𝐢𝐧𝐚: ${name}
『 📍 』 𝐃𝐨𝐦𝐢𝐧𝐢𝐨: _Limitato a questo territorio_
『 ⚖️ 』 𝐂𝐨𝐧𝐝𝐢𝐳𝐢𝐨𝐧𝐞: _Fino all'inevitabile tradimento._

👑 _Ti è stato concesso il potere. Non deluderci._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

  // Invio infallibile con Scudo VIP e Miniatura Profilo
  await conn.sendMessage(m.chat, {
      text: caption,
      mentions: [who],
      contextInfo: {
          mentionedJid: [who],
          isForwarded: true,
          forwardingScore: 999,
          forwardedNewsletterMessageInfo: {
              newsletterJid: '120363233544482011@newsletter',
              serverMessageId: 100,
              newsletterName: `🩸 Nuovo Prescelto`
          },
          externalAdReply: {
              title: '𝐋𝐄𝐆𝐀𝐌 𝐀𝐔𝐓𝐇𝐎𝐑𝐈𝐓𝐘',
              body: 'Patto di Sangue Sigillato',
              thumbnailUrl: ppUrl,
              mediaType: 1,
              renderLargerThumbnail: false,
              sourceUrl: 'https://whatsapp.com/channel/0029VaE20oQ6hENrL2B5wB0e'
          }
      }
  }, { quoted: m });
};

handler.help = ['addmod @user'];
handler.tags = ['group'];
handler.command = ['addmod'];
handler.group = true;
handler.owner = true; // Solo tu puoi fare il Patto di Sangue

export default handler;

