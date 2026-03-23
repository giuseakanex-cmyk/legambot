import yts from 'yt-search';
import fg from 'api-dylux';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// 🔥 SCUDO VIP LEGAM OS 🔥
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

        // 1. Ricerca del Video
        const search = await yts(text);
        const vid = search.videos[0];
        if (!vid) return m.reply('『 ⚠️ 』 \`Risultato non trovato. Prova a cambiare parole chiave.\`');

        const url = vid.url;
        const isAudio = command === 'play' || command === 'playaud';
        let tipoIcona = isAudio ? '🎧' : '🎥';

        // 2. Grafica Iniziale Legam OS
        let captionInfo = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· ${tipoIcona} 𝐈𝐍 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 ${tipoIcona} ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 📌 』 𝐓𝐢𝐭𝐨𝐥𝐨: *${vid.title}*
『 ⏱️ 』 𝐃𝐮𝐫𝐚𝐭𝐚: *${vid.timestamp}*
『 👤 』 𝐀𝐮𝐭𝐨𝐫𝐞: *${vid.author.name}*

⏳ _Elaborazione tramite motore FFmpeg..._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        let processingMsg = await conn.sendMessage(m.chat, {
            image: { url: vid.thumbnail },
            caption: captionInfo,
            contextInfo: legamContext('Estrazione in corso...')
        }, { quoted: m });

        // 3. Estrazione Link (Tua logica con Fallback)
        let downloadUrl = null;
        try {
            let res = isAudio ? await fg.yta(url) : await fg.ytv(url);
            if (res && res.dl_url) downloadUrl = res.dl_url;
        } catch {
            try {
                let api = isAudio ? 'ytmp3' : 'ytmp4';
                let res = await fetch(`https://api.vreden.my.id/api/${api}?url=${url}`);
                let json = await res.json();
                downloadUrl = json.result?.download?.url || json.result?.url;
            } catch {
                let api = isAudio ? 'ytmp3' : 'ytmp4';
                let res = await fetch(`https://api.siputzx.my.id/api/d/${api}?url=${url}`);
                let json = await res.json();
                downloadUrl = json?.data?.dl;
            }
        }

        if (!downloadUrl) throw new Error("API DOWN");

        // 4. LA MAGIA: Download fisico sulla VPS
        const tmpDir = os.tmpdir();
        const inputPath = path.join(tmpDir, `input_${Date.now()}`);
        const outputPath = path.join(tmpDir, `output_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`);

        const res = await fetch(downloadUrl);
        const arrayBuffer = await res.arrayBuffer();
        fs.writeFileSync(inputPath, Buffer.from(arrayBuffer));

        // 5. Conversione FFmpeg e Invio
        if (isAudio) {
            await new Promise((resolve, reject) => {
                exec(`ffmpeg -i ${inputPath} -vn -ar 44100 -ac 2 -b:a 128k ${outputPath}`, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            await conn.sendMessage(m.chat, {
                audio: fs.readFileSync(outputPath),
                mimetype: 'audio/mpeg',
                fileName: `${vid.title}.mp3`,
                ptt: false, // Se metti true manda come vocale, false come file audio musicale
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
            // Per il video non serve conversione, rinominiamo e inviamo
            fs.renameSync(inputPath, outputPath);
            await conn.sendMessage(m.chat, {
                video: fs.readFileSync(outputPath),
                mimetype: 'video/mp4',
                caption: `『 ✅ 』 *Video scaricato con successo!*\n> ${vid.title}`,
                fileName: `${vid.title}.mp4`,
                contextInfo: legamContext('Legam Player')
            }, { quoted: processingMsg });
        }

        // 6. Pulizia server immediata
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error("[LEGAM PLAY ERROR]", e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply('『 ❌ 』 \`Errore Server:\`\n_File non disponibile, API off o FFmpeg non installato sulla macchina._');
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
};

handler.help = ['play', 'playvid'];
handler.tags = ['gruppo'];
handler.command = /^(play|playaud|playvid|playvideo)$/i;

export default handler;
