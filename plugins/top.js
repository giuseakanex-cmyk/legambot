let handler = async (m, { conn, command, usedPrefix }) => {
  let chat = global.db.data.chats[m.chat];
  
  // Se non ci sono dati o i messaggi sono zero
  if (!chat || !chat.ranking || chat.ranking.totali === 0) {
    return m.reply("╭── •✧ 𝐋𝐄𝐆𝐀𝐌 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 ✧• ──╮\n\n⟡ _Nessun dato rilevato oggi._\n\n╰── •✧ 𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐒 ✧• ──╯");
  }

  // Determina quanti utenti mostrare
  let limite = 3;
  if (command === "top5") limite = 5;
  if (command === "top10") limite = 10;

  // Ordina dal più grande al più piccolo
  let classifica = Object.entries(chat.ranking.utenti)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limite);

  const medaglie = ['🥇 1°', '🥈 2°', '🥉 3°', '🏅 4°', '🏅 5°', '🏅 6°', '🏅 7°', '🏅 8°', '🏅 9°', '🏅 10°'];

  let testo = `╭── •✧ 𝐋𝐄𝐆𝐀𝐌 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 ✧• ──╮\n\n`;
  testo += `📊 𝐒𝐓𝐀𝐓𝐈𝐒𝐓𝐈𝐂𝐇𝐄 𝐀𝐓𝐓𝐔𝐀𝐋𝐈\n`;
  testo += `│ 💬 Totale Rete: *${chat.ranking.totali}*\n`;
  testo += `│ ⏱️ Reset: Mezzanotte\n\n`;
  testo += `🏆 𝐓𝐎𝐏 𝐀𝐓𝐓𝐈𝐕𝐈𝐓𝐀̀\n\n`;

  let menzioni = [];

  classifica.forEach((u, i) => {
    let id = u[0];
    let conteggio = u[1];
    menzioni.push(id);
    testo += `${medaglie[i]} ➻ @${id.split("@")[0]}\n`;
    testo += `│ ✧ ${conteggio} Msg\n\n`;
  });

  testo += `╰── •✧ 𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐒 ✧• ──╯\n`;
  testo += `👑 𝐎𝐰𝐧𝐞𝐫: 𝐆𝐢𝐮𝐬𝐞\n`;
  testo += `💡 Tip: Usa ${usedPrefix}top5 o ${usedPrefix}top10`;

  await conn.sendMessage(m.chat, {
    text: testo,
    mentions: menzioni,
    contextInfo: {
      mentionedJid: menzioni,
      isForwarded: true,
      forwardingScore: 999,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363233544482011@newsletter',
        newsletterName: "✨ 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐑𝐚𝐧𝐤 ✨",
        serverMessageId: 100
      }
    }
  }, { quoted: m });
};

// =========================================================
// MOTORE DI CONTEGGIO ASSOLUTO INFALLIBILE (Background)
// =========================================================
handler.before = async function (m, { conn }) {
    // Conta solo nei gruppi e ignora i messaggi del bot stesso
    if (!m.isGroup || m.fromMe) return true;

    let chat = global.db.data.chats[m.chat];
    if (!chat) return true;

    // Prende la data di oggi (Fuso orario Roma per sicurezza)
    let oggi = new Date().toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' });

    // 1. Inizializza il database se il gruppo è nuovo
    if (!chat.ranking) {
        chat.ranking = { data: oggi, totali: 0, utenti: {} };
    }

    // 2. AUTOMAZIONE DI MEZZANOTTE (Infallibile)
    // Se la data salvata è diversa da quella di oggi, significa che è un nuovo giorno!
    if (chat.ranking.data !== oggi) {
        
        // Se ieri hanno scritto qualcosa, manda la classifica di chiusura!
        if (chat.ranking.totali > 0) {
            let classifica = Object.entries(chat.ranking.utenti)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);

            let testo = `╭── •✧ 𝐋𝐄𝐆𝐀𝐌 𝐏𝐎𝐃𝐈𝐔𝐌 ✧• ──╮\n\n`;
            testo += `🏁 𝐅𝐈𝐍𝐄 𝐆𝐈𝐎𝐑𝐍𝐀𝐓𝐀\n`;
            testo += `│ 💬 Totale Rete: *${chat.ranking.totali}*\n\n`;

            const medaglie = ['🥇 1°', '🥈 2°', '🥉 3°'];
            let menzioni = [];

            classifica.forEach((u, i) => {
                menzioni.push(u[0]);
                testo += `${medaglie[i]} ➻ @${u[0].split("@")[0]}\n`;
                testo += `│ ✧ ${u[1]} Msg\n\n`;
            });

            testo += `╰── •✧ 𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐒 ✧• ──╯\n`;
            testo += `> _Il database è stato azzerato per il nuovo giorno._`;

            await conn.sendMessage(m.chat, {
                text: testo,
                mentions: menzioni,
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363233544482011@newsletter',
                        newsletterName: "✨ 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐏𝐨𝐝𝐢𝐨 ✨",
                        serverMessageId: 100
                    }
                }
            }).catch(() => {});
        }

        // Applica il vero reset per il nuovo giorno
        chat.ranking = { data: oggi, totali: 0, utenti: {} };
    }

    // 3. CONTEGGIO MESSAGGIO
    chat.ranking.totali += 1;
    if (!chat.ranking.utenti[m.sender]) {
        chat.ranking.utenti[m.sender] = 0;
    }
    chat.ranking.utenti[m.sender] += 1;

    return true; // Importante per far continuare gli altri comandi
};

handler.help = ['top', 'top5', 'top10'];
handler.tags = ['strumenti'];
handler.command = /^(top|top5|top10)$/i;
handler.group = true;

export default handler;


