export async function before(m, { conn }) {
  // 1. Se non è un messaggio di sistema (StubType) o non è in un gruppo, fermati
  if (!m.messageStubType || !m.isGroup) return;

  // 2. Controllo se il rilevamento è attivo nel gruppo
  let chat = global.db.data.chats[m.chat] || {};
  if (!chat.rileva) return;

  // 3. SCUDO ANTI-CRASH: Recupero sicuro dei dati del gruppo
  let groupMetadata = global.groupCache?.get(m.chat) || await conn.groupMetadata(m.chat).catch(() => null) || {};

  // 4. Risoluzione dei numeri di telefono (evitando crash sui Lid)
  let sender = m.sender;
  if (sender && typeof sender === 'string' && sender.endsWith('@lid')) {
      const lidNumber = sender.split('@')[0].replace(/:\d+$/, '');
      const participant = groupMetadata.participants?.find(p => p.id && (p.id.split('@')[0] === lidNumber));
      if (participant) sender = participant.id;
  }
  
  let param0 = m.messageStubParameters?.[0];
  if (param0 && typeof param0 === 'string' && param0.endsWith('@lid')) {
      const lidNumber = param0.split('@')[0].replace(/:\d+$/, '');
      const participant = groupMetadata.participants?.find(p => p.id && (p.id.split('@')[0] === lidNumber));
      if (participant) param0 = participant.id;
  }

  let decodedSender = sender ? conn.decodeJid(sender) : null;
  let decodedParam0 = (param0 && typeof param0 === 'string') ? conn.decodeJid(param0) : null;

  let senderNumber = decodedSender ? decodedSender.split('@')[0] : 'Sconosciuto';
  let param0Number = decodedParam0 ? decodedParam0.split('@')[0] : 'Sconosciuto';

  const type = m.messageStubType;

  // Nomi per la testata del Canale Inoltrato
  const actionNames = {
    21: 'Nome Modificato',
    22: 'Foto Modificata',
    23: 'Link Reimpostato',
    25: 'Permessi Modificati',
    26: 'Stato Chat Modificato',
    29: 'Promozione Admin',
    30: 'Rimozione Admin',
    72: 'Descrizione Modificata'
  };

  if (!actionNames[type]) return; // Se l'evento non è in lista, ignoriamo silenziosamente

  let textMsg = '';
  
  // 5. TESTI VIP LEGAM OS (Senza bug e senza crash)
  switch(type) {
    case 21:
        textMsg = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 📝 𝐍𝐎𝐌𝐄 𝐌𝐎𝐃𝐈𝐅𝐈𝐂𝐀𝐓𝐎 📝 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 👤 』 𝐀𝐳𝐢𝐨𝐧𝐞 𝐝𝐢: @${senderNumber}\n『 🏷️ 』 𝐍𝐮𝐨𝐯𝐨 𝐧𝐨𝐦𝐞: *${m.messageStubParameters[0]}*\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
        break;
    case 22:
        textMsg = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 📸 𝐅𝐎𝐓𝐎 𝐌𝐎𝐃𝐈𝐅𝐈𝐂𝐀𝐓𝐀 📸 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 👤 』 𝐀𝐳𝐢𝐨𝐧𝐞 𝐝𝐢: @${senderNumber}\n『 🖼️ 』 _L'immagine del gruppo è stata aggiornata._\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
        break;
    case 23:
        textMsg = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 🔗 𝐋𝐈𝐍𝐊 𝐑𝐄𝐒𝐄𝐓𝐓𝐀𝐓𝐎 🔗 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 👤 』 𝐀𝐳𝐢𝐨𝐧𝐞 𝐝𝐢: @${senderNumber}\n『 ⚠️ 』 _Il link d'invito precedente è stato revocato._\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
        break;
    case 25:
        textMsg = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· ⚙️ 𝐈𝐌𝐏𝐎𝐒𝐓𝐀𝐙𝐈𝐎𝐍𝐈 ⚙️ ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 👤 』 𝐀𝐳𝐢𝐨𝐧𝐞 𝐝𝐢: @${senderNumber}\n『 🔒 』 𝐏𝐞𝐫𝐦𝐞𝐬𝐬𝐢: *${m.messageStubParameters[0] === 'on' ? 'Solo Admin' : 'Tutti'}* possono modificare le info.\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
        break;
    case 26:
        textMsg = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 🚪 𝐒𝐓𝐀𝐓𝐎 𝐂𝐇𝐀𝐓 🚪 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 👤 』 𝐀𝐳𝐢𝐨𝐧𝐞 𝐝𝐢: @${senderNumber}\n『 💬 』 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢: *${m.messageStubParameters[0] === 'on' ? 'Solo Admin' : 'Tutti'}* possono scrivere.\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
        break;
    case 29:
        textMsg = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 🛡️ 𝐏𝐑𝐎𝐌𝐎𝐙𝐈𝐎𝐍𝐄 🛡️ ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 👑 』 𝐔𝐭𝐞𝐧𝐭𝐞: @${param0Number}\n『 🌟 』 𝐒𝐭𝐚𝐭𝐨: _E' stato nominato Amministratore!_\n\n👑 _Azione di: @${senderNumber}_\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
        break;
    case 30:
        textMsg = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 🔻 𝐑𝐄𝐓𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐎𝐍𝐄 🔻 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 👤 』 𝐔𝐭𝐞𝐧𝐭𝐞: @${param0Number}\n『 ❌ 』 𝐒𝐭𝐚𝐭𝐨: _Non è più un Amministratore._\n\n👑 _Azione di: @${senderNumber}_\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
        break;
    case 72:
        textMsg = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 📜 𝐃𝐄𝐒𝐂𝐑𝐈𝐙𝐈𝐎𝐍𝐄 𝐌𝐎𝐃𝐈𝐅𝐈𝐂𝐀𝐓𝐀 📜 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 👤 』 𝐀𝐳𝐢𝐨𝐧𝐞 𝐝𝐢: @${senderNumber}\n『 ℹ️ 』 _La descrizione del gruppo è cambiata._\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
        break;
  }

  if (!textMsg) return;

  const mentions = [];
  if (decodedSender && decodedSender !== 's.whatsapp.net') mentions.push(decodedSender);
  if (decodedParam0 && decodedParam0 !== 's.whatsapp.net') mentions.push(decodedParam0);

  // 6. MOTORE GRAFICO CANALE INOLTRATO VIP
  const legamContext = {
      mentionedJid: mentions,
      isForwarded: true,
      forwardingScore: 999,
      forwardedNewsletterMessageInfo: {
          newsletterJid: '120363233544482011@newsletter',
          serverMessageId: 100,
          newsletterName: `⚙️ ${actionNames[type]}`
      }
  };

  // 7. INVIO INFALLIBILE
  await conn.sendMessage(m.chat, {
      text: textMsg,
      contextInfo: legamContext
  }).catch(()=>{});
}


