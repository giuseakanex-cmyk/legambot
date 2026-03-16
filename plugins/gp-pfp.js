let handler = async (m, { conn, text }) => {
  try {
    async function resolveLidToPhoneJid(conn, m, jid) {
      if (typeof jid !== 'string' || !jid.endsWith('@lid')) return jid

      const fromShared = conn?.lidPhoneMap?.get?.(jid)
      if (typeof fromShared === 'string' && fromShared.includes('@')) return fromShared

      if (m?.chat?.endsWith('@g.us') && conn?.groupMetadata) {
        try {
          const md = await conn.groupMetadata(m.chat)
          const p = md?.participants?.find(x => x?.id === jid)
          if (p?.jid) return p.jid
        } catch {}
      }

      return jid
    }

    let who;

    if (m.mentionedJid && m.mentionedJid.length > 0) {
      who = m.mentionedJid[0];
    } else if (m.quoted) {
      who = m.quoted.sender;
    } else {
      let cleanedNumber = text ? text.replace(/\D/g, '') : '';
      if (cleanedNumber && cleanedNumber.length >= 7 && cleanedNumber.length <= 15) {
        who = cleanedNumber + '@s.whatsapp.net';
      } else {
        who = m.fromMe ? conn.user.jid : m.sender;
      }
    }
    who = await resolveLidToPhoneJid(conn, m, who);
    let name = await conn.getName(who);

    let pp;
    try {
      pp = await conn.profilePictureUrl(who, 'image');
    } catch {
      pp = null;
    }

    if (!pp) {
      await conn.reply(m.chat, `『 🚫 』 *${name} non ha una foto profilo.*`, m, fake);
      return;
    }

    await conn.sendFile(m.chat, pp, 'profile.jpg', `『 🖼️ 』 *Foto profilo di* ${name}`, m);

  } catch (err) {
    console.error('Errore nel comando .pfp:', err);
    await conn.reply(m.chat, `${global.errore}`, m);
  }
};

handler.help = ['pfp [@tag|reply|numero]'];
handler.tags = ['gruppo'];
handler.command = ['pfp', 'fotoprofilo', 'pic', 'fp', 'pp'];
handler.admin = true;

export default handler;