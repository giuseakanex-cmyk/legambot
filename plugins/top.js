// Inizializza l'archivio globale
global.archivioMessaggi = global.archivioMessaggi || {};

let handler = async (m, { conn, command, usedPrefix }) => {
  let chatId = m.chat;
  let dati = global.archivioMessaggi[chatId];

  // Se non ci sono dati o i messaggi sono zero
  if (!dati || dati.totali === 0 || Object.keys(dati.utenti).length === 0) {
    return m.reply("✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 𝐋 𝐄 𝐆 𝐀 𝐌  𝐑 𝐀 𝐍 𝐊 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n⟡ _Il silenzio regna. Nessun messaggio registrato oggi._\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦");
  }

  // Determina quanti utenti mostrare
  let limite = 3;
  if (command === "top5") limite = 5;
  if (command === "top10") limite = 10;

  let classifica = Object.entries(dati.utenti)
    .sort((a, b) => b[1].conteggio - a[1].conteggio)
    .slice(0, limite);

  const medaglie = ['🥇', '🥈', '🥉', '🏅', '🏅', '🏅', '🏅', '🏅', '🏅', '🏅'];

  let testo = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 𝐋 𝐄 𝐆 𝐀 𝐌  𝐑 𝐀 𝐍 𝐊 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n`;
  testo += `『 📊 』 𝐒 𝐓 𝐀 𝐓 𝐈 𝐒 𝐓 𝐈 𝐂 𝐇 𝐄\n`;
  testo += `· 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐓𝐨𝐭𝐚𝐥𝐢 ➻ *${dati.totali}*\n`;
  testo += `· 𝐀𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐦𝐞𝐧𝐭𝐨 ➻ 𝐓𝐞𝐦𝐩𝐨 𝐑𝐞𝐚𝐥𝐞\n\n`;
  testo += `『 🏆 』 𝐓 𝐎 𝐏  ${limite}  𝐃 𝐈  𝐎 𝐆 𝐆 𝐈\n\n`;

  let menzioni = [];

  classifica.forEach((u, i) => {
    let id = u[0];
    let datiUtente = u[1];
    menzioni.push(id);
    testo += `${medaglie[i]} @${id.split("@")[0]}\n`;
    testo += `   ⟡ _${datiUtente.conteggio} messaggi_\n\n`;
  });

  // Istruzioni estetiche Legam OS
  testo += `> _Usa ${usedPrefix}top5 o ${usedPrefix}top10 per espandere_\n\n`;
  testo += `👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵\n`;
  testo += `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;

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
// Questo blocco si attacca direttamente alla connessione del bot
// aggirando handler.js, quindi è IMPOSSIBILE che non conti i messaggi.
if (!global.contatoreMessaggiAttivo) {
    global.archivioMessaggi = global.archivioMessaggi || {};

    global.conn.ev.on('messages.upsert', async ({ messages }) => {
        try {
            let msg = messages[0];
            // Ignora messaggi vuoti o inviati dal bot stesso
            if (!msg || !msg.message || msg.key.fromMe) return;
            
            // Conta SOLO i messaggi che arrivano dai gruppi
            if (!msg.key.remoteJid || !msg.key.remoteJid.endsWith('@g.us')) return;

            let chat = msg.key.remoteJid;
            let user = msg.key.participant || msg.key.remoteJid;
            let nome = msg.pushName || 'Utente';

            // Inizializza il gruppo se non esiste nel database
            if (!global.archivioMessaggi[chat]) {
                global.archivioMessaggi[chat] = { totali: 0, utenti: {} };
            }

            // Aggiungi +1 ai totali del gruppo
            global.archivioMessaggi[chat].totali += 1;

            // Inizializza l'utente se non esiste
            if (!global.archivioMessaggi[chat].utenti[user]) {
                global.archivioMessaggi[chat].utenti[user] = { nome: nome, conteggio: 0 };
            }
            
            // Aggiungi +1 ai messaggi dell'utente
            global.archivioMessaggi[chat].utenti[user].conteggio += 1;
        } catch (e) {
            console.error("Errore nel sensore contatore:", e);
        }
    });

    // =========================================================
    // AUTOMAZIONE MEZZANOTTE
    // =========================================================
    setInterval(async () => {
        let now = new Date();
        // Quando scatta la mezzanotte esatta (00:00)
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            let gruppi = Object.keys(global.archivioMessaggi);

            for (let gid of gruppi) {
                if (!global.conn) continue;
                let dati = global.archivioMessaggi[gid];
                if (!dati || dati.totali === 0) continue;

                let classifica = Object.entries(dati.utenti)
                    .sort((a, b) => b[1].conteggio - a[1].conteggio)
                    .slice(0, 3);

                let testo = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 𝐋 𝐄 𝐆 𝐀 𝐌  𝐏 𝐎 𝐃 𝐈 𝐔 𝐌 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n`;
                testo += `『 🏁 』 𝐅 𝐈 𝐍 𝐄  𝐆 𝐈 𝐎 𝐑 𝐍 𝐀 𝐓 𝐀\n`;
                testo += `· 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐓𝐨𝐭𝐚𝐥𝐢 ➻ *${dati.totali}*\n\n`;

                const medaglie = ['🥇', '🥈', '🥉'];
                let menzioni = [];

                classifica.forEach((u, i) => {
                    menzioni.push(u[0]);
                    testo += `${medaglie[i]} @${u[0].split("@")[0]} ➻ ${u[1].conteggio} msg\n`;
                });

                testo += `\n> _Il database è stato azzerato per il nuovo giorno._\n\n👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;

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

                // Azzera i conteggi del gruppo
                global.archivioMessaggi[gid] = { totali: 0, utenti: {} };
            }
        }
    }, 60000); // Controlla l'orario ogni minuto

    global.contatoreMessaggiAttivo = true;
}

export default handler;

