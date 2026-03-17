import os from 'os';
import process from 'process';
import { performance } from 'perf_hooks';

const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

const fancyClock = (ms) => {
    const d = Math.floor(ms / (1000 * 60 * 60 * 24));
    const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const m = Math.floor((ms / (1000 * 60)) % 60);
    const s = Math.floor((ms / 1000) % 60);
    return [
        d > 0 ? `${d}g` : '',
        h > 0 ? `${h}h` : '',
        m > 0 ? `${m}m` : '',
        `${s}s`
    ].filter(Boolean).join(' ');
}

const handler = async (m, { conn }) => {
    try {
        // Reazione di caricamento
        await conn.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } });
        
        const old = performance.now();
        const cpus = os.cpus();
        const cpuModel = cpus[0].model.trim();
        const cpuCores = cpus.length;
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const nodeMem = process.memoryUsage().rss;
        const uptime = fancyClock(process.uptime() * 1000);
        const osUptime = fancyClock(os.uptime() * 1000);
        const platform = os.platform();
        const arch = os.arch();
        const hostname = os.hostname();
        
        const neww = performance.now();
        const speed = (neww - old).toFixed(4);

        // Estetica Legam OS
        const text = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
·  𝐋 𝐄 𝐆 𝐀 𝐌  𝐂 𝐎 𝐑 𝐄  ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 📡 』 𝐒 𝐓 𝐀 𝐓 𝐎  𝐑 𝐄 𝐓 𝐄
· 𝐏𝐢𝐧𝐠 ➻ ${speed} ms
· 𝐔𝐩𝐭𝐢𝐦𝐞 𝐁𝐨𝐭 ➻ ${uptime}
· 𝐔𝐩𝐭𝐢𝐦𝐞 𝐇𝐨𝐬𝐭 ➻ ${osUptime}

『 💾 』 𝐌 𝐄 𝐌 𝐎 𝐑 𝐈 𝐀
· 𝐑𝐀𝐌 𝐓𝐨𝐭𝐚𝐥𝐞 ➻ ${formatBytes(totalMem)}
· 𝐑𝐀𝐌 𝐔𝐬𝐚𝐭𝐚 ➻ ${formatBytes(usedMem)}
· 𝐑𝐀𝐌 𝐁𝐨𝐭 ➻ ${formatBytes(nodeMem)}

『 💻 』 𝐒 𝐈 𝐒 𝐓 𝐄 𝐌 𝐀
· 𝐂𝐏𝐔 ➻ ${cpuModel}
· 𝐂𝐨𝐫𝐞𝐬 ➻ ${cpuCores} Threads
· 𝐎𝐒 ➻ ${platform} (${arch})
· 𝐇𝐨𝐬𝐭 ➻ ${hostname}

👑 𝐎𝐖𝐍𝐄𝐑
➤ 𝐆𝐈𝐔𝐒𝚵

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        // Invio con Fake Channel (Anti-Ban e Grafica Premium)
        await conn.sendMessage(m.chat, {
            text: text,
            contextInfo: {
                mentionedJid: [m.sender],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363233544482011@newsletter',
                    newsletterName: "✨.✦★彡 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐒𝐲𝐬𝐭𝐞𝐦 Ξ★✦.•",
                    serverMessageId: 100
                }
            }
        }, { quoted: m });

        // Reazione finale di successo
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        m.reply("❌ `Errore nella lettura del sistema Core.`");
    }
}

handler.help = ['speed', 'info', 'system']
handler.tags = ['info']
handler.command = /^(speed|info|system)$/i

export default handler

