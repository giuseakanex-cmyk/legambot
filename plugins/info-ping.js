import os from 'os';
import { performance } from 'perf_hooks';

let handler = async (m, { conn, usedPrefix }) => {
  try {
    // 1. Inizio misurazione Ping reale (tramite reazione ai server WA)
    const startTime = performance.now();
    await conn.sendMessage(m.chat, { react: { text: '📡', key: m.key } });
    const endTime = performance.now();
    const latenza = (endTime - startTime).toFixed(4);

    // 2. Calcolo Uptime
    const uptimeMs = process.uptime() * 1000;
    const uptimeStr = clockString(uptimeMs);

    // 3. Calcolo RAM (Uso esatto del Bot)
    const ramBot = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);

    // 4. Estetica Legam OS
    const textMsg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
·   𝐋 𝐄 𝐆 𝐀 𝐌  𝐁 𝐎 𝐓   ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

· 𝐏𝐢𝐧𝐠 ➻ ${latenza} ms
· 𝐔𝐩𝐭𝐢𝐦𝐞 ➻ ${uptimeStr}
· 𝐑𝐀𝐌 ➻ ${ramBot} MB

👑 𝐎𝐖𝐍𝐄𝐑
➤ 𝐆𝐈𝐔𝐒𝚵

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    // 5. Invio Messaggio Sicuro con Canale Fake (Nessun bottone crashante)
    await conn.sendMessage(m.chat, {
      text: textMsg,
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

    // Conferma finale con spunta verde
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (err) {
    console.error("Errore nell'handler ping:", err);
    m.reply("❌ `Errore di calcolo del Ping.`");
  }
};

// Funzione conversione ms in Giorni:Ore:Minuti:Secondi
function clockString(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor(ms / 3600000) % 24;
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [d, h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

handler.help = ['ping'];
handler.tags = ['info'];

// 6. COMANDO: Legge sia "ping" che "p"
handler.command = /^(ping|p)$/i;

export default handler;


