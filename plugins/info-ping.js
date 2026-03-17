import os from 'os';
import { performance } from 'perf_hooks';

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const startTime = performance.now();
    await conn.sendMessage(m.chat, { react: { text: '📡', key: m.key } });
    const endTime = performance.now();
    const latenza = (endTime - startTime).toFixed(4);

    const uptimeMs = process.uptime() * 1000;
    const uptimeStr = clockString(uptimeMs);
    const ramBot = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);

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

    // Creazione Struttura Nativa JSON Pura (Niente crash di importazione)
    let interactiveMessage = {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: {
            body: { text: textMsg },
            footer: { text: "𝐿𝛴𝐺𝛬𝑀 𝚩𝚯𝐓" },
            header: { title: "", subtitle: "", hasMediaAttachment: false },
            contextInfo: {
              mentionedJid: [m.sender],
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363233544482011@newsletter',
                newsletterName: "✨.✦★彡 Ping by Giuse Ξ★✦.•",
                serverMessageId: 100
              }
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({ display_text: "📡 𝐑𝐢𝐟𝐚𝐢 𝐏𝐢𝐧𝐠", id: usedPrefix + "ping" })
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({ display_text: "✧ 𝐌𝐞𝐧𝐮 ✧", id: usedPrefix + "menu" })
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({ display_text: "🗑️ 𝐒𝐯𝐮𝐨𝐭𝐚 𝐜𝐚𝐜𝐡𝐞", id: usedPrefix + "ds" })
                }
              ]
            }
          }
        }
      }
    };

    // Relay Diretto per forzare WhatsApp ad accettare i bottoni
    await conn.relayMessage(m.chat, interactiveMessage.viewOnceMessage.message, { messageId: m.key.id });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (err) {
    console.error("Errore nell'handler ping:", err);
    m.reply("❌ `Errore di calcolo del Ping.`");
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
handler.command = /^(ping|p)$/i;

export default handler;


