import { performance } from 'perf_hooks';

let handler = async (m, { conn, usedPrefix }) => {
  try {
    // Calcolo Ping tramite ping-pong col server WhatsApp
    const startTime = performance.now();
    const endTime = performance.now();
    const latenza = (endTime - startTime).toFixed(2);

    // Recupera il nome dell'utente in modo elegante
    const nomeUtente = m.pushName || 'Utente';

    // Costruzione Bottoni Interattivi (Stile Quick Reply)
    const buttons = [
      { buttonId: usedPrefix + "pong", buttonText: { displayText: "🔄 𝐏𝐨𝐧𝐠" }, type: 1 },
      { buttonId: usedPrefix + "ping", buttonText: { displayText: "🏓 𝐏𝐢𝐧𝐠" }, type: 1 },
      { buttonId: usedPrefix + "ds", buttonText: { displayText: "🗑️ 𝐝𝐬" }, type: 1 }
    ];

    // Invio del messaggio minimale identico allo screen
    await conn.sendMessage(m.chat, {
      text: `*${latenza} ms*`,
      footer: `𝗣𝗶𝗻𝗴 ${nomeUtente}`,
      buttons: buttons,
      headerType: 1
    }, { quoted: m });

  } catch (err) {
    console.error("Errore nell'handler pong:", err);
    m.reply("❌ `Errore di calcolo del Pong.`");
  }
};

handler.help = ['pong'];
handler.tags = ['info'];
handler.command = /^(pong)$/i;

export default handler;

