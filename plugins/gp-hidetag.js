const handler = async (m, { conn, text, participants, command }) => {
  try {
    const users = participants.map((u) => conn.decodeJid(u.id));
    
    // Cattura il testo e aggiunge la freccia Legam OS all'inizio
    let testoGrezzo = text || (m.quoted && m.quoted.text ? m.quoted.text : '');
    let legamText = testoGrezzo ? `➻ ${testoGrezzo}` : '';

    if (m.quoted) {
      const quoted = m.quoted;
      if (quoted.mtype === 'imageMessage') {
        const media = await quoted.download();
        await conn.sendMessage(m.chat, {
          image: media,
          caption: legamText,
          mentions: users
        }, { quoted: m });
      }
      else if (quoted.mtype === 'videoMessage') {
        const media = await quoted.download();
        await conn.sendMessage(m.chat, {
          video: media,
          caption: legamText,
          mentions: users
        }, { quoted: m });
      }
      else if (quoted.mtype === 'audioMessage') {
        const media = await quoted.download();
        await conn.sendMessage(m.chat, {
          audio: media,
          mimetype: 'audio/mp4',
          mentions: users
        }, { quoted: m });
      }
      else if (quoted.mtype === 'documentMessage') {
        const media = await quoted.download();
        await conn.sendMessage(m.chat, {
          document: media,
          mimetype: quoted.mimetype,
          fileName: quoted.fileName,
          caption: legamText,
          mentions: users
        }, { quoted: m });
      }
      else if (quoted.mtype === 'stickerMessage') {
        const media = await quoted.download();
        await conn.sendMessage(m.chat, {
          sticker: media,
          mentions: users
        }, { quoted: m });
      }
      else {
        // Se è un normale messaggio citato
        await conn.sendMessage(m.chat, {
          text: legamText,
          mentions: users
        }, { quoted: m });
      }
    }
    else if (text) {
      // Se è un testo normale scritto dopo il comando
      await conn.sendMessage(m.chat, {
        text: `➻ ${text}`,
        mentions: users
      }, { quoted: m });
    }
    else {
      return m.reply('❌ *Inserisci un testo o rispondi a un messaggio/media*');
    }
    
  } catch (e) {
    console.error('Errore tag/hidetag:', e);
    m.reply(`${global.errore || '❌ Si è verificato un errore'}`);
  }
};

handler.help = ['hidetag', 'tag'];
handler.tags = ['gruppo'];
handler.command = /^(hidetag|tag)$/i;
handler.admin = true; // Solo admin del gruppo
handler.group = true;

export default handler;


