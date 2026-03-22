const handler = async (m, { conn }) => {
  if (!m.isGroup)
    return m.reply('『 ⚠️ 』 \`Questo comando può essere usato solo nei gruppi.\`');

  let who = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
  if (!who)
    return m.reply('『 ⚠️ 』 \`Devi taggare l’utente a cui revocare i poteri.\`');

  const user = global.db.data.users[who];
  if (!user)
    return m.reply('『 ❌ 』 \`Questo utente non esiste nel database del Legam OS.\`');

  // ✅ Controlla se è MOD nel gruppo
  if (!user.premium || user.premiumGroup !== m.chat)
    return m.reply('『 💡 』 \`Questo utente non ha alcun potere in questo territorio.\`');

  // 🚫 Revoca MOD solo nel gruppo
  user.premium = false;
  delete user.premiumGroup;

  // 📸 Recupera la foto profilo per l'Estetica VIP
  let ppUrl;
  try {
    ppUrl = await conn.profilePictureUrl(who, 'image');
  } catch {
    ppUrl = 'https://files.catbox.moe/57bmbv.jpg'; // Avatar di default se non ha la foto
  }

  const name = '@' + who.split('@')[0];

  // TESTO ESILIO VIP
  const caption = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· ⛓️ 𝐏𝐀𝐓𝐓𝐎 𝐈𝐍𝐅𝐑𝐀𝐍𝐓𝐎 ⛓️ ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 👤 』 𝐄𝐬𝐢𝐥𝐢𝐚𝐭𝐨: ${name}
『 ⚡ 』 𝐆𝐢𝐮𝐝𝐢𝐳𝐢𝐨: _Privato di ogni potere in chat_
『 ⚖️ 』 𝐂𝐨𝐧𝐝𝐢𝐳𝐢𝐨𝐧𝐞: _Fino a riacquisizione della fiducia._

👑 _Hai tradito il Legam OS. Torna nell'ombra._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

  // INVIO INFALLIBILE CON SCUDO E MINIATURA
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
              newsletterName: `⛓️ Esilio Definitivo`
          },
          externalAdReply: {
              title: '𝐋𝐄𝐆𝐀𝐌 𝐀𝐔𝐓𝐇𝐎𝐑𝐈𝐓𝐘',
              body: 'Patto Infranto - Revoca Poteri',
              thumbnailUrl: ppUrl,
              mediaType: 1,
              renderLargerThumbnail: false,
              sourceUrl: 'https://whatsapp.com/channel/0029VaE20oQ6hENrL2B5wB0e'
          }
      }
  }, { quoted: m });
};

handler.help = ['delmod @user'];
handler.tags = ['group'];
handler.command = ['delmod'];
handler.group = true;
handler.owner = true; // Solo l'Owner può togliere i poteri!

export default handler;

