import os from 'os';
import { performance } from 'perf_hooks';

let handler = async (m, { conn, usedPrefix }) => {
  try {
    // 1. Misurazione Ping (con reazione di attesa)
    const startTime = performance.now();
    await conn.sendMessage(m.chat, { react: { text: '📡', key: m.key } });
    const endTime = performance.now();
    const latenza = (endTime - startTime).toFixed(4);

    // 2. Dati di Sistema
    const uptimeMs = process.uptime() * 1000;
    const uptimeStr = clockString(uptimeMs);
    const ramBot = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);

    // 3. Estetica Premium Legam OS
    const textMsg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
·   𝐋 𝐄 𝐆 𝐀 𝐌  𝐁 𝐎 𝐓   ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

· 𝐏𝐢𝐧𝐠 ➻ ${latenza} ms
· 𝐔𝐩𝐭𝐢𝐦𝐞 ➻ ${uptimeStr}
· 𝐑𝐀𝐌 ➻ ${ramBot} MB

👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    // 4. Invio con Bottoni e Fake Channel
    await conn.sendMessage(m.chat, {
      text: textMsg,
      footer: "✧ 𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐒 ✧",
      buttons: [
        { buttonId: usedPrefix + "ping", buttonText: { displayText: "🏓 𝐏𝐢𝐧𝐠" }, type: 1 },
        { buttonId: usedPrefix + "menu", buttonText: { displayText: "✧𝐌𝐞𝐧𝐮✧" }, type: 1 },
        { buttonId: usedPrefix + "ds", buttonText: { displayText: "🗑️ 𝐒𝐯𝐮𝐨𝐭𝐚 𝐒𝐞𝐬𝐬𝐢𝐨𝐧𝐢" }, type: 1 }
      ],
      headerType: 1,
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363233544482011@newsletter',
          newsletterName: "✨.✦★彡 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐏𝐢𝐧𝐠 Ξ★✦.•",
          serverMessageId: 100
        }
      }
    }, { quoted: m });

    // 5. Spunta verde di successo
    await conn.sendMessage(m.chat, { react: { text: '🏓', key: m.key } });

  } catch (err) {
    console.error("Errore nell'handler ping:", err);
    m.reply("❌ `Errore di calcolo del Ping.`");
  }
};

// Convertitore Millisecondi -> Formato Orologio
function clockString(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor(ms / 3600000) % 24;
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [d, h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

handler.help = ['ping'];
handler.tags = ['info'];
handler.command = /^(ping|p)$/i;

export default handler;


