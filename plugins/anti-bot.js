let puliti = [];

function rilevaDispositivoCheck(msgID = '') {
  if (!msgID) return 'sconosciuto';
  if (/^[a-zA-Z]+-[a-fA-F0-9]+$/.test(msgID)) return 'bot';
  if (msgID.startsWith('false_') || msgID.startsWith('true_')) return 'web';
  if (msgID.startsWith('3EB0') && /^[A-Z0-9]+$/.test(msgID)) return 'webbot';
  if (msgID.includes(':')) return 'desktop';
  if (/^[A-F0-9]{32}$/i.test(msgID)) return 'android';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(msgID)) return 'ios';
  if (/^[A-Z0-9]{20,25}$/i.test(msgID) && !msgID.startsWith('3EB0')) return 'ios';
  if (msgID.startsWith('3EB0')) return 'android_old';
  return 'sconosciuto';
}

export async function before(m, { conn, isAdmin, isOwner, isSam }) {
  const chat = global.db.data.chats[m.chat];
  if (!chat?.antiBot) return;
  if (!m.isGroup || !m.sender || !m.key?.id) return;
  if (isAdmin || isOwner || isSam || m.fromMe) return;
  const msgID = m.key?.id;
  const device = rilevaDispositivoCheck(msgID);
  const sospettiDispositivi = ['bot', 'web', 'webbot'];
  if (!sospettiDispositivi.includes(device)) return;
  const metadata = await conn.groupMetadata(m.chat);
  const botNumber = conn.user.jid;
  const autorizzati = [botNumber, metadata.owner, ...puliti];
  if (autorizzati.includes(m.sender)) return;
  await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
  await conn.sendMessage(m.chat, {
    text: `『 🚫 』 \`Bot rilevato\`\n\n➤ \`Utente:\` @${m.sender.split('@')[0]}\n➤ \`Azione:\` Rimosso dal gruppo\n➤ \`Dispositivo:\` ${device.toUpperCase()}\n\n\`vare ✧ bot\``,
    mentions: [m.sender]
  });
}
