import { performance } from 'perf_hooks';

let handler = async (m, { conn, usedPrefix }) => {
  try {
    // Calcolo Ping tramite ping-pong col server WhatsApp
    const startTime = performance.now();
    await conn.sendMessage(m.chat, { react: { text: '🏓', key: m.key } }); 
    const endTime = performance.now();
    const latenza = (endTime - startTime).toFixed(2);

    // Recupera il nome dell'utente in modo elegante
    const nomeUtente = m.pushName || 'Utente';

    // Costruzione Bottoni Interattivi (Stile Quick Reply)
    const buttons = [
      { buttonId: usedPrefix + "pong", buttonText: { displayText: "🔄 Pong" }, type: 1 },
      { buttonId: usedPrefix + "ping", buttonText: { displayText: "⚡ Ping" }, type: 1 },
      { buttonId: usedPrefix + "ds", buttonText: { displayText: "🗑️ Svuota sessioni" }, type: 1 }
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

