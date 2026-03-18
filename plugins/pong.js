import { performance } from 'perf_hooks';

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const startTime = performance.now();
    const endTime = performance.now();
    const latenza = (endTime - startTime).toFixed(2);

    const nomeUtente = m.pushName || 'Utente';

    const buttons = [
      { buttonId: usedPrefix + "pong", buttonText: { displayText: "🔄 𝐏𝐨𝐧𝐠" }, type: 1 },
      { buttonId: usedPrefix + "ping", buttonText: { displayText: "🏓 𝐏𝐢𝐧𝐠" }, type: 1 },
      { buttonId: usedPrefix + "ds", buttonText: { displayText: "🗑️ 𝐝𝐬" }, type: 1 }
    ];

    await conn.sendMessage(m.chat, {
      text: `*${latenza} ms*`,
      footer: `𝗣𝗶𝗻𝗴 ${nomeUtente}`,
      buttons: buttons,
      headerType: 1
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    m.reply("❌ `Errore.`");
  }
};

handler.help = ['pong'];
handler.tags = ['info'];
handler.command = /^(pong)$/i;

export default handler;


