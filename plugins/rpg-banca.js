let handler = async (m, { conn }) => {
  // Determina l'utente da mostrare
  let who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;

  // Inizializza l'utente nel database se non esiste
  if (!global.db.data.users[who]) global.db.data.users[who] = {};
  let user = global.db.data.users[who];

  // Inizializza valori sicuri
  if (typeof user.bank !== 'number') user.bank = 0;

  // Messaggio
  let message = who === m.sender
    ? `💰 Hai *${user.bank} 💶 Euro* in banca.`
    : `💰 L'utente @${who.split('@')[0]} ha *${user.bank} 💶 Euro* in banca.`;

  // Invia solo testo
  await m.reply(message, null, { mentions: [who] });
};

handler.help = ['bank', 'banca'];
handler.tags = ['rpg', 'economy'];
handler.command = ['banca'];

export default handler;
