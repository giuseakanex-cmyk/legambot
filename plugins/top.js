// Inizializza l'archivio globale
global.archivioMessaggi = global.archivioMessaggi || {};

let handler = async (m, { conn, command, usedPrefix }) => {
  let chatId = m.chat;
  let dati = global.archivioMessaggi[chatId];

  // Se non ci sono dati o i messaggi sono zero
  if (!dati || dati.totali === 0 || Object.keys(dati.utenti).length === 0) {
    return m.reply("╭── •✧ 𝐋𝐄𝐆𝐀𝐌 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 ✧• ──╮\n\n⟡ _Nessun dato rilevato oggi._\n\n╰── •✧ 𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐒 ✧• ──╯");
  }

  // Determina quanti utenti mostrare
  let limite = 3;
  if (command === "top5") limite = 5;
  if (command === "top10") limite = 10;

  let classifica = Object.entries(dati.utenti)
    .sort((a, b) => b[1].conteggio - a[1].conteggio)
    .slice(0, limite);

  const medaglie = ['🥇 1°', '🥈 2°', '🥉 3°', '🏅 4°', '🏅 5°', '🏅 6°', '🏅 7°', '🏅 8°', '🏅 9°', '🏅 10°'];

  let testo = `╭── •✧ 𝐋𝐄𝐆𝐀𝐌 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 ✧• ──╮\n\n`;
  testo += `📊 𝐒𝐓𝐀𝐓𝐈𝐒𝐓𝐈𝐂𝐇𝐄 𝐀𝐓𝐓𝐔𝐀𝐋𝐈\n`;
  testo += `│ 💬 Totale Rete: *${dati.totali}*\n`;
  testo += `│ ⏱️ Reset: Mezzanotte\n\n`;
  testo += `🏆 𝐓𝐎𝐏 𝐀𝐓𝐓𝐈𝐕𝐈𝐓𝐀̀\n\n`;

  let menzioni = [];

  classifica.forEach((u, i) => {
    let id = u[0];
    let datiUtente = u[1];
    menzioni.push(id);
    
    // Grammatica corretta per Msg
    let labelMsg = datiUtente.conteggio === 1 ? 'Msg' : 'Msg';

    testo += `${medaglie[i]} ➻ @${id.split("@")[0]}\n`;
    testo += `│ ✧ ${datiUtente.conteggio} ${labelMsg}\n\n`;
  });

  testo += `╰── •✧ 𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐒 ✧• ──╯\n`;
  testo += `👑 𝐎𝐰𝐧𝐞𝐫: 𝐆𝐢𝐮𝐬𝐞\n`;
  testo += `💡 Tip: Usa ${usedPrefix}top5 o ${usedPrefix}top10`;

  await conn.sendMessage(chatId, {
    text: testo,
    mentions: menzioni,
    contextInfo: {
      mentionedJid: menzioni,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363233544482011@newsletter',
        newsletterName: "✨.✦★彡 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐑𝐚𝐧𝐤 Ξ★✦.•",
        serverMessageId: 100
      }
    }
  }, { quoted: m });
};

handler.help = ['top', 'top5', 'top10'];
handler.tags = ['strumenti'];
handler.command = /^(top|top5|top10)$/i;
handler.group = true;

// =========================================================
// MOTORE DI CONTEGGIO ASSOLUTO (Infallibile)
// =========================================================
if (!global.contatoreMessaggiAttivo) {
    global.archivioMessaggi = global.archivioMessaggi || {};

    global.conn.ev.on('messages.upsert', async ({ messages }) => {
        try {
            let msg = messages[0];
            if (!msg || !msg.message || msg.key.fromMe) return;
            if (!msg.key.remoteJid || !msg.key.remoteJid.endsWith('@g.us')) return;

            let chat = msg.key.remoteJid;
            let user = msg.key.participant || msg.key.remoteJid;
            let nome = msg.pushName || 'Utente';

            if (!global.archivioMessaggi[chat]) {
                global.archivioMessaggi[chat] = { totali: 0, utenti: {} };
            }

            global.archivioMessaggi[chat].totali += 1;

            if (!global.archivioMessaggi[chat].utenti[user]) {
                global.archivioMessaggi[chat].utenti[user] = { nome: nome, conteggio: 0 };
            }
            
            global.archivioMessaggi[chat].utenti[user].conteggio += 1;
        } catch (e) {
            console.error("Errore nel sensore contatore:", e);
        }
    });

    // AUTOMAZIONE MEZZANOTTE CON NUOVA GRAFICA
    setInterval(async () => {
        let now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            let gruppi = Object.keys(global.archivioMessaggi);

            for (let gid of gruppi) {
                if (!global.conn) continue;
                let dati = global.archivioMessaggi[gid];
                if (!dati || dati.totali === 0) continue;

                let classifica = Object.entries(dati.utenti)
                    .sort((a, b) => b[1].conteggio - a[1].conteggio)
                    .slice(0, 3);

                let testo = `╭── •✧ 𝐋𝐄𝐆𝐀𝐌 𝐏𝐎𝐃𝐈𝐔𝐌 ✧• ──╮\n\n`;
                testo += `🏁 𝐅𝐈𝐍𝐄 𝐆𝐈𝐎𝐑𝐍𝐀𝐓𝐀\n`;
                testo += `│ 💬 Totale Rete: *${dati.totali}*\n\n`;

                const medaglie = ['🥇 1°', '🥈 2°', '🥉 3°'];
                let menzioni = [];

                classifica.forEach((u, i) => {
                    menzioni.push(u[0]);
                    testo += `${medaglie[i]} ➻ @${u[0].split("@")[0]}\n`;
                    testo += `│ ✧ ${u[1].conteggio} Msg\n\n`;
                });

                testo += `╰── •✧ 𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐒 ✧• ──╯\n`;
                testo += `> _Il database è stato azzerato per il nuovo giorno._`;

                await global.conn.sendMessage(gid, {
                    text: testo,
                    mentions: menzioni,
                    contextInfo: {
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363233544482011@newsletter',
                            newsletterName: "✨.✦★彡 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐏𝐨𝐝𝐢𝐨 Ξ★✦.•",
                            serverMessageId: 100
                        }
                    }
                });

                global.archivioMessaggi[gid] = { totali: 0, utenti: {} };
            }
        }
    }, 60000);

    global.contatoreMessaggiAttivo = true;
}

export default handler;


