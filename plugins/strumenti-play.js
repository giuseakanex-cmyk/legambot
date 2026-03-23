import yts from 'yt-search';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const legamContext = (title) => ({
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363233544482011@newsletter',
        serverMessageId: 100,
        newsletterName: `🎵 ${title}`
    }
});

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        let helpMessage = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🎵 𝐋𝐄𝐆𝐀𝐌 𝐌𝐔𝐒𝐈𝐂 🎵 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 💡 』 𝐂𝐨𝐦𝐚𝐧𝐝𝐢 𝐃𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐢:

│ 🎧 ➭ \`${usedPrefix}play <titolo>\`
│ _Scarica il brano in formato Audio (MP3)_

│ 🎥 ➭ \`${usedPrefix}playvid <titolo>\`
│ _Scarica la clip in formato Video (MP4)_

📌 *Esempio:* \`${usedPrefix}play Lazza Cenere\`
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();
        return conn.sendMessage(m.chat, { text: helpMessage, contextInfo: legamContext('Music Player') }, { quoted: m });
    }

    try {
        await conn.sendPresenceUpdate('recording', m.chat);
        await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

        const search = await yts(text);
        const vid = search.videos[0];
        if (!vid) return m.reply('『 ⚠️ 』 \`Risultato non trovato.\`');

        if (vid.seconds > 1200) {
            return m.reply('『 ⏱️ 』 \`Video troppo lungo! Massimo 20 minuti.\`');
        }

        const url = vid.url;
        const isAudio = command === 'play' || command === 'playaud';
        let tipoIcona = isAudio ? '🎧' : '🎥';

        let captionInfo = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· ${tipoIcona} 𝐈𝐍 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 ${tipoIcona} ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 📌 』 𝐓𝐢𝐭𝐨𝐥𝐨: *${vid.title}*
『 ⏱️ 』 𝐃𝐮𝐫𝐚𝐭𝐚: *${vid.timestamp}*
『 👤 』 𝐀𝐮𝐭𝐨𝐫𝐞: *${vid.author.name}*

⏳ _Estrazione audio dal server globale..._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        let processingMsg = await conn.sendMessage(m.chat, {
            image: { url: vid.thumbnail },
            caption: captionInfo,
            contextInfo: legamContext('Elaborazione in corso...')
        }, { quoted: m });

        let downloadUrl = null;
        let apis = isAudio ? [
            `https://api.vreden.my.id/api/ytmp3?url=${url}`,
            `https://api.siputzx.my.id/api/d/ytmp3?url=${url}`,
            `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${url}`
        ] : [
            `https://api.vreden.my.id/api/ytmp4?url=${url}`,
            `https://api.siputzx.my.id/api/d/ytmp4?url=${url}`,
            `https://api.ryzendesu.vip/api/downloader/ytmp4?url=${url}`
        ];

        for (let api of apis) {
            try {
                let res = await fetch(api);
                let json = await res.json();
                downloadUrl = json?.data?.dl || json?.result?.download?.url || json?.result?.url || json?.url;
                if (downloadUrl && downloadUrl.startsWith('http')) break;
            } catch (e) { continue; }
        }

        if (!downloadUrl) throw new Error("API DOWN");

        const tmpDir = os.tmpdir();
        const inputPath = path.join(tmpDir, `input_${Date.now()}`);
        const outputPath = path.join(tmpDir, `output_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`);

        const res = await fetch(downloadUrl);
        const arrayBuffer = await res.arrayBuffer();
        fs.writeFileSync(inputPath, Buffer.from(arrayBuffer));

        if (isAudio) {
            await new Promise((resolve, reject) => {
                exec(`ffmpeg -i "${inputPath}" -vn -ar 44100 -ac 2 -b:a 128k "${outputPath}"`, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            await conn.sendMessage(m.chat, {
                audio: fs.readFileSync(outputPath),
                mimetype: 'audio/mpeg',
                fileName: `${vid.title}.mp3`,
                ptt: false, 
                contextInfo: {
                    ...legamContext('Legam Player'),
                    externalAdReply: {
                        title: vid.title,
                        body: 'Audio elaborato con FFmpeg',
                        thumbnailUrl: vid.thumbnail,
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        sourceUrl: url
                    }
                }
            }, { quoted: processingMsg });

        } else {
            fs.renameSync(inputPath, outputPath);
            await conn.sendMessage(m.chat, {
                video: fs.readFileSync(outputPath),
                mimetype: 'video/mp4',
                caption: `『 ✅ 』 *Video scaricato!*\n> ${vid.title}`,
                fileName: `${vid.title}.mp4`,
                contextInfo: legamContext('Legam Player')
            }, { quoted: processingMsg });
        }

        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error("[LEGAM PLAY ERROR]", e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply('『 ❌ 』 \`Errore Estrazione:\` _Server di conversione temporaneamente saturi._');
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
};

handler.help = ['play', 'playvid'];
handler.tags = ['downloader'];
handler.command = /^(play|playaud|playvid|playvideo)$/i;

export default handler;


