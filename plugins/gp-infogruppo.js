const handler = async (m, { conn, participants, groupMetadata }) => {
  const pp = await conn.profilePictureUrl(m.chat, 'image').catch((_) => null) || 'https://i.ibb.co/N25rgPrX/Gaara.jpg';
  const more = String.fromCharCode(8206);
  const readMore = more.repeat(4001);
  const chatData = global.db.data.chats[m.chat] || {};
  const { 
    antiLink2, 
    welcome, 
    rileva, 
    antiLink, 
    reaction, 
    antiparolacce 
  } = chatData;
  const groupAdmins = participants.filter((p) => p.admin);
  const listAdmin = groupAdmins.map((v, i) => `│ 👮‍♂️ *${i + 1}.* @${v.id.split('@')[0]}`).join('\n');
  const owner = groupMetadata.owner || groupAdmins.find((p) => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net';

  // 5. Funzione status ottimizzata
  const getStatus = (bool) => bool ? '✅ ON' : '❌ OFF';

  // 6. Configurazione Settings
  const settingsList = [
    { label: 'Welcome', val: welcome },
    { label: 'Rilevamento', val: rileva },
    { label: 'Antilink', val: antiLink },
    { label: 'Antilink Social', val: antiLink2 },
    { label: 'Reazioni', val: reaction },
    { label: 'Antiparolacce', val: antiparolacce }
  ];

  const settingsText = settingsList
    .map(s => `│ ${getStatus(s.val)} ⇢ ${s.label}`)
    .join('\n');
  const text = `
ㅤㅤ⋆｡˚『 ╭ \`GRUPPO\` ╯ 』˚｡⋆\n╭\n
│
│ 『 📛 』 *Nome:* │ ${groupMetadata.subject}
│ 『 👥 』 *Membri:* ${participants.length}
│ 『 👑 』 *Creatore:* @${owner.split('@')[0]}
│ 『 📝 』 *Descrizione:*
│ ${groupMetadata.desc?.toString() || 'Nessuna descrizione'}
│
│ 『 ⚙️ 』 *Configurazione:*
${settingsText}
│
│ 『 👮‍♂️ 』 *Amministratori:*
${listAdmin}
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*
${readMore}
`.trim();
  await conn.reply(m.chat, text, m, {
    mentions: [...groupAdmins.map((v) => v.id), owner],
    contextInfo: {
      ...global.fake?.contextInfo,
      externalAdReply: {
        title: groupMetadata.subject,
        body: `Creato il: ${new Date(groupMetadata.creation * 1000).toLocaleDateString('it-IT')}`,
        thumbnailUrl: pp,
        sourceUrl: null,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  });
};

handler.help = ['infogruppo'];
handler.tags = ['gruppo'];
handler.command = /^(infogruppo|infogp)$/i
handler.group = true;
handler.admin = true

export default handler;