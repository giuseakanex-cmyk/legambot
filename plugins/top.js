// Database globale
globalThis.archivioMessaggi = globalThis.archivioMessaggi || {};

let handler = async (m, { conn, command, usedPrefix }) => {
  let chatId = m.chat;
  let dati = globalThis.archivioMessaggi[chatId];

  if (!dati || dati.totali === 0) {
    return m.reply("⊹ ࣪ ˖ ✦ ━━ 𝐂 𝐋 𝐀 𝐒 𝐒 𝐈 𝐅 𝐈 𝐂 𝐀 ━━ ✦ ˖ ࣪ ⊹\n\n⟡ _Il silenzio regna. Nessun messaggio registrato oggi._\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦");
  }

  // Determina quanti utenti mostrare
  let limite = 3;
  if (command === "top5") limite = 5;
  if (command === "top10") limite = 10;

  let classifica = Object.entries(dati.utenti)
    .sort((a, b) => b[1].conteggio - a[1].conteggio)
    .slice(0, limite);

  const medaglie = ['🥇', '🥈', '🥉', '🏅', '🏅', '🏅', '🏅', '🏅', '🏅', '🏅'];

  let testo = `⊹ ࣪ ˖ ✦ ━━ 𝐂 𝐋 𝐀 𝐒 𝐒 𝐈 𝐅 𝐈 𝐂 𝐀 ━━ ✦ ˖ ࣪ ⊹\n\n`;
  testo += `⋆ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐓𝐨𝐭𝐚𝐥𝐢 ➻ *${dati.totali}*\n`;
  testo += `⋆ 𝐀𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐦𝐞𝐧𝐭𝐨 ➻ 𝐓𝐞𝐦𝐩𝐨 𝐑𝐞𝐚𝐥𝐞\n\n`;
  testo += `🏆 *𝐓𝐎𝐏 ${limite} 𝐃𝐈 𝐎𝐆𝐆𝐈*\n\n`;

  let menzioni = [];

  classifica.forEach((u, i) => {
    let id = u[0];
    let datiUtente = u[1];
    menzioni.push(id);
    testo += `${medaglie[i]} @${id.split("@")[0]}\n`;
    testo += `   ⟡ _${datiUtente.conteggio} messaggi_\n\n`;
  });

  testo += `👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵\n`;
  testo += `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;

  await conn.sendMessage(chatId, {
    text: testo,
    mentions: menzioni,
    footer: "✧ 𝑳𝑬𝑮𝑨𝑴 𝑩𝑶𝑻 ✧",
    buttons: [
      { buttonId: usedPrefix + 'top5', buttonText: { displayText: '📊 TOP 5' }, type: 1 },
      { buttonId: usedPrefix + 'top10', buttonText: { displayText: '🏆 TOP 10' }, type: 1 }
    ],
    headerType: 1,
    contextInfo: {
      mentionedJid: menzioni,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363233544482011@newsletter',
        newsletterName: "✨ 𝑳𝑬𝑮𝑨𝑴 𝑩𝑶𝑻 𝑹𝑨𝑵𝑲 ✧",
        serverMessageId: 100
      }
    }
  }, { quoted: m });
};

// --- REGISTRAZIONE MESSAGGI ---
handler.before = async function (m) {
  if (!m.chat || !m.text || m.isBaileys || !m.isGroup) return; 

  let chat = m.chat;
  let user = m.sender;

  if (!globalThis.archivioMessaggi[chat]) {
    globalThis.archivioMessaggi[chat] = { totali: 0, utenti: {} };
  }

  globalThis.archivioMessaggi[chat].totali += 1;

  let nome = m.pushName || 'Utente';
  if (!globalThis.archivioMessaggi[chat].utenti[user]) {
    globalThis.archivioMessaggi[chat].utenti[user] = { nome: nome, conteggio: 0 };
  }
  globalThis.archivioMessaggi[chat].utenti[user].conteggio += 1;
};

// --- AUTOMAZIONE MEZZANOTTE ---
setInterval(async () => {
  let now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {

    let gruppi = Object.keys(globalThis.archivioMessaggi);

    for (let gid of gruppi) {
      if (!globalThis.conn) continue;

      let dati = globalThis.archivioMessaggi[gid];
      if (!dati || dati.totali === 0) continue;

      let classifica = Object.entries(dati.utenti)
        .sort((a, b) => b[1].conteggio - a[1].conteggio)
        .slice(0, 3);

      let testo = `⊹ ࣪ ˖ ✦ ━━ 𝐏𝐎𝐃𝐈𝐎 𝐅𝐈𝐍𝐀𝐋𝐄 ━━ ✦ ˖ ࣪ ⊹\n\n`;
      testo += `⋆ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐓𝐨𝐭𝐚𝐥𝐢 ➻ *${dati.totali}*\n\n`;

      const medaglie = ['🥇', '🥈', '🥉'];
      let menzioni = [];

      classifica.forEach((u, i) => {
        menzioni.push(u[0]);
        testo += `${medaglie[i]} @${u[0].split("@")[0]} ➻ ${u[1].conteggio} msg\n`;
      });

      testo += `\n⟡ _Il conteggio è stato azzerato per il nuovo giorno._\n\n`;
      testo += `👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵\n`;
      testo += `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;

      await globalThis.conn.sendMessage(gid, {
        text: testo,
        mentions: menzioni,
        contextInfo: {
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363233544482011@newsletter',
            newsletterName: "✨ 𝑳𝑬𝑮𝑨𝑴 𝑩𝑶𝑻 𝑷𝑶𝑫𝑰𝑶 ✧",
            serverMessageId: 100
          }
        }
      });

      globalThis.archivioMessaggi[gid] = { totali: 0, utenti: {} };
    }
  }
}, 60000);

handler.help = ['top', 'top5', 'top10'];
handler.tags = ['strumenti'];
handler.command = /^(top|top5|top10)$/i;
handler.group = true;

export default handler;
