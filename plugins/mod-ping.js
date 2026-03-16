import os from 'os';
import { performance } from 'perf_hooks';

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const uptimeMs = process.uptime() * 1000;
    const uptimeStr = clockString(uptimeMs);

    // Calcolo ping
    const startTime = performance.now();
    const endTime = performance.now();
    const speed = (endTime - startTime).toFixed(4);

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const percentUsed = ((usedMem / totalMem) * 100).toFixed(2);

    const totalMemGB = (totalMem / 1024 / 1024 / 1024).toFixed(2);
    const usedMemGB = (usedMem / 1024 / 1024 / 1024).toFixed(2);

    const botName = global.db?.data?.nomedelbot || "ᴅᴛʜ-ʙᴏᴛ";

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

    const textMsg = `✧ꉧ𝐏𝐢𝐧𝐠 ✧ 𝚩𝚯𝐓ꉧ✧
│
├─ 𝗧𝗘𝗠𝗣𝗢 𝗢𝗡🔥: ${uptimeStr}
└─ ✧ 𝐏𝐢𝐧𝐠 ✧: ${speed} ms`;

    await conn.sendMessage(m.chat, {
      text: textMsg,
      footer: "ꉧ𝑪𝑯𝛬𝑹𝑴𝛬ᜰ𝑫𝜮𝑹ꨄ 𝚩𝚯𝐓ꉧ",
      buttons: [
        { 
          buttonId: usedPrefix + "pingmod", 
          buttonText: { displayText: "📡 𝐑𝐢𝐟𝐚𝐢 𝐩𝐢𝐧𝐠" }, 
          type: 1 
        },
        { 
          buttonId: usedPrefix + "menumod", 
          buttonText: { displayText: "🛡️ 𝐌𝐞𝐧𝐮 𝐌𝐨𝐝" }, 
          type: 1 
        }
      ],
      headerType: 1
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
handler.command = /^(pingmod)$/i;
handler.premium = false

export default handler;
