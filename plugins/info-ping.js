import os from 'os';
import { performance } from 'perf_hooks';
import { generateWAMessageFromContent, proto } from '@realvare/baileys';

let handler = async (m, { conn, usedPrefix }) => {
  try {
    // 1. Inizio misurazione Ping reale
    const startTime = performance.now();
    await conn.sendMessage(m.chat, { react: { text: '📡', key: m.key } });
    const endTime = performance.now();
    const latenza = (endTime - startTime).toFixed(4);

    // 2. Calcolo Uptime e RAM
    const uptimeMs = process.uptime() * 1000;
    const uptimeStr = clockString(uptimeMs);
    const ramBot = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);

    // 3. Estetica Legam OS
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

    // 4. Creazione del Messaggio Interattivo (Native Flow Buttons)
    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({ text: textMsg }),
              footer: proto.Message.InteractiveMessage.Footer.create({ text: "𝐿𝛴𝐺𝛬𝑀 𝚩𝚯𝐓" }),
              header: proto.Message.InteractiveMessage.Header.create({ title: "", subtitle: "", hasMediaAttachment: false }),
              contextInfo: {
                mentionedJid: [m.sender],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: '120363233544482011@newsletter',
                  newsletterName: "✨.✦★彡 Ping by Giuse Ξ★✦.•",
                  serverMessageId: 100
                }
              },
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: [
                  {
                    "name": "quick_reply",
                    "buttonParamsJson": `{"display_text":"📡 𝐑𝐢𝐟𝐚𝐢 𝐏𝐢𝐧𝐠","id":"${usedPrefix}ping"}`
                  },
                  {
                    "name": "quick_reply",
                    "buttonParamsJson": `{"display_text":"✧ 𝐌𝐞𝐧𝐮 ✧","id":"${usedPrefix}menu"}`
                  },
                  {
                    "name": "quick_reply",
                    "buttonParamsJson": `{"display_text":"🗑️ 𝐒𝐯𝐮𝐨𝐭𝐚 𝐜𝐚𝐜𝐡𝐞","id":"${usedPrefix}ds"}`
                  }
                ]
              })
            })
        }
      }
    }, { quoted: m });

    // 5. Invio Forzato tramite Relay
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

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
handler.command = /^(ping|p)$/i;

export default handler;


