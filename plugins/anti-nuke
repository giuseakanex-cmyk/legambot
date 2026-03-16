let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!m.isGroup) return m.reply("『 ❌ 』 \`Questo comando funziona solo nei gruppi.\`");

  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});
  const action = text ? text.toLowerCase().trim() : '';

  // Attiva o disattiva il sistema
  if (action === 'on') {
    chat.antinuke = true;
    m.reply(`
⊹ ࣪ ˖ ✦ ━━ 𝐀 𝐍 𝐓 𝐈 𝐍 𝐔 𝐊 𝐄 ━━ ✦ ˖ ࣪ ⊹

🛡️ \`𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐝𝐢 𝐝𝐢𝐟𝐞𝐬𝐚 𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨.\`
_I poteri degli admin sono ora sotto stretta sorveglianza._

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim());

  } else if (action === 'off') {
    chat.antinuke = false;
    m.reply(`
⊹ ࣪ ˖ ✦ ━━ 𝐀 𝐍 𝐓 𝐈 𝐍 𝐔 𝐊 𝐄 ━━ ✦ ˖ ࣪ ⊹

❌ \`𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐝𝐢 𝐝𝐢𝐟𝐞𝐬𝐚 𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨.\`
_Il gruppo è ora vulnerabile._

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim());

  } else {
    m.reply(`『 ⚙️ 』 \`Uso corretto:\`\n➤ ${usedPrefix + command} on\n➤ ${usedPrefix + command} off`);
  }
};

handler.help = ['contronuke on/off'];
handler.tags = ['gruppo'];
handler.command = ['contronuke', 'antinuke'];
handler.owner = true; // Solo tu puoi attivarlo
handler.group = true;

// --------------------------------------
// LISTENER AUTOMATICO ANTINUKE (Invisibile e sempre in ascolto)
handler.before = async function (m, { conn, isBotAdmin }) {
  if (!m.isGroup) return;
  if (!isBotAdmin) return; // Se il bot non è admin non può difendere il gruppo

  const chat = global.db.data.chats[m.chat];
  if (!chat?.antinuke) return; // Se non è attivo in questo gruppo, ignora

  const sender = m.key?.participant || m.participant || m.sender;

  // Eventi da bloccare: 
  // 21 = Cambio Nome, 22 = Cambio Foto, 29 = Promozione, 30 = Retrocessione
  const stub = m.messageStubType;
  if (![21, 22, 29, 30].includes(stub)) return;

  const botJid = conn.user.jid;
  const owners = global.owner.map(o => o[0] + '@s.whatsapp.net');

  let metadata;
  try { metadata = await conn.groupMetadata(m.chat); } catch { metadata = null; }
  if (!metadata) return;
  
  const founder = metadata.owner;

  // Lista degli intoccabili (Il bot, Tu, e il creatore del gruppo)
  const allowed = [botJid, ...owners, founder].filter(Boolean);

  // Se chi ha fatto l'azione è un intoccabile, va tutto bene
  if (allowed.includes(sender)) return;

  // SE SIAMO QUI, UN ADMIN HA FATTO QUALCOSA SENZA PERMESSO
  const participants = metadata.participants;
  const admins = participants.filter(p => p.admin).map(p => p.jid);

  // Trova tutti gli admin (tranne gli intoccabili) per retrocederli
  const usersToDemote = admins.filter(jid => !allowed.includes(jid));
  if (usersToDemote.length > 0) {
    await conn.groupParticipantsUpdate(m.chat, usersToDemote, 'demote');
  }

  // Chiude il gruppo istantaneamente per evitare altri danni
  await conn.groupSettingUpdate(m.chat, 'announcement');

  const actionName = stub === 21 ? 'Cambiato il nome del gruppo' :
                     stub === 22 ? 'Cambiato la foto del gruppo' :
                     stub === 29 ? 'Promosso qualcuno ad Admin' :
                     'Retrocesso un Admin';

  // LA SCHEDA DI CONDANNA ESTETICA
  const alertText = `
⊹ ࣪ ˖ ✦ ━━ 𝐀 𝐍 𝐓 𝐈 𝐍 𝐔 𝐊 𝐄 ━━ ✦ ˖ ࣪ ⊹

⚠️ \`𝐑𝐈𝐋𝐄𝐕𝐀𝐓𝐀 𝐀𝐙𝐈𝐎𝐍𝐄 𝐍𝐎𝐍 𝐀𝐔𝐓𝐎𝐑𝐈𝐙𝐙𝐀𝐓𝐀\`

👤 𝐂𝐨𝐥𝐩𝐞𝐯𝐨𝐥𝐞: @${sender.split('@')[0]} _(Cu tu detti u permessu?)_
🛑 𝐀𝐳𝐢𝐨𝐧𝐞: ${actionName}

🔻 \`𝐀𝐝𝐦𝐢𝐧 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐬𝐬𝐢 𝐩𝐞𝐫 𝐬𝐢𝐜𝐮𝐫𝐞𝐳𝐳𝐚:\`
${usersToDemote.map(jid => `💀 @${jid.split('@')[0]}`).join('\n') || 'Nessuno'}

🔒 \`𝐈𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 è 𝐬𝐭𝐚𝐭𝐨 𝐜𝐡𝐢𝐮𝐬𝐨 𝐩𝐞𝐫 𝐞𝐯𝐢𝐭𝐚𝐫𝐞 𝐝𝐚𝐧𝐧𝐢.\`

👑 𝐎𝐰𝐧𝐞𝐫 𝐚𝐯𝐯𝐢𝐬𝐚𝐭𝐢:
${owners.map(x => `🛡 @${x.split('@')[0]}`).join('\n')}

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

  // Manda il messaggio taggando tutti i coinvolti
  await conn.sendMessage(m.chat, { 
      text: alertText, 
      mentions: [sender, ...owners, ...usersToDemote] 
  });
};

export default handler;
