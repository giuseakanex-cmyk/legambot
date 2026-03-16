// Plugin fatto da giuse

import os from 'os';
import { performance } from 'perf_hooks';

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const uptimeMs = process.uptime() * 1000;
    const uptimeStr = clockString(uptimeMs);

    // Calcolo ping
    const startTime = performance.now();
    const endTime = performance.now();
    const latenza = (endTime - startTime).toFixed(4); // CORRETTO: rinominato da speed a latenza

    // Calcolo RAM
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ram = (usedMem / 1024 / 1024).toFixed(2); // CORRETTO: definita la variabile ram in MB
    const percentUsed = ((usedMem / totalMem) * 100).toFixed(2);

    const botStartTime = new Date(Date.now() - uptimeMs);
    const activationTime = botStartTime.toLocaleString('it-IT', {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const textMsg =`
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
⋆   𝐋 𝐄 𝐆 𝐀 𝐌  𝐁 𝐎 𝐓   ⋆
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

⋆ 𝐏𝐢𝐧𝐠 ➻ ${latenza} ms
⋆ 𝐔𝐩𝐭𝐢𝐦𝐞 ➻ ${uptimeStr}
⋆ 𝐑𝐀𝐌 ➻ ${ram} MB

👑 𝐎𝐖𝐍𝐄𝐑
➤ 𝐆𝐈𝐔𝐒𝚵

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`
.trim()

    await conn.sendMessage(m.chat, {
      text: textMsg,
      footer: "𝐿𝛴𝐺𝛬𝑀 𝚩𝚯𝐓",
      buttons: [
        { buttonId: usedPrefix + "ping", buttonText: { displayText: "📡 𝐑𝐢𝐟𝐚𝐢 𝐏𝐢𝐧𝐠" }, type: 1 },
        { buttonId: usedPrefix + "menu", buttonText: { displayText: "✧ 𝐌𝐞𝐧𝐮 ✧" }, type: 1 },
        { buttonId: usedPrefix + "ds", buttonText: { displayText: "🗑️ 𝐒𝐯𝐮𝐨𝐭𝐚 𝐬𝐞𝐬𝐬𝐢𝐨𝐧𝐢" }, type: 1 }
      ],
      headerType: 1,
      // AGGIUNTO QUI IL CANALE FAKE
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363233544482011@newsletter',
          newsletterName: "✨.✦★彡 Ping by Giuse Ξ★✦.•",
          serverMessageId: 100
        }
      }
    }, { quoted: m });

  } catch (err) {
    console.error("Errore nell'handler:", err);
  }
};

function clockString(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor(ms / 3600000) % 24;
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [d, h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

handler.help = ['ping'];
handler.tags = ['info'];
handler.command = /^(ping)$/i;
handler.admin = false;

export default handler; 