import yts from 'yt-search';
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
    
    // 1. MENU DI ISTRUZIONI VIP (Se non scrive il titolo)
    if (!text) {
        let helpMessage = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🎧 𝐋𝐄𝐆𝐀𝐌 𝐒𝐎𝐔𝐍𝐃𝐓𝐑𝐀𝐂𝐊 🎧 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 💡 』 *𝐂𝐨𝐦𝐞 𝐬𝐜𝐚𝐫𝐢𝐜𝐚𝐫𝐞:*
Non servono menu. Chiedi e ti sarà dato.

│ 🎵 ➭ \`${usedPrefix}play <nome canzone>\`
│ _Ricevi l'Audio (MP3 ad alta fedeltà)_

│ 🎬 ➭ \`${usedPrefix}playvid <nome video>\`
│ _Ricevi il Video (MP4 in alta qualità)_

📌 *Esempio pratico:* \`${usedPrefix}play Lazza Cenere\`
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();
        return conn.sendMessage(m.chat, { text: helpMessage, contextInfo: legamContext('Music Engine') }, { quoted: m });
    }

    try {
        await conn.sendPresenceUpdate('recording', m.chat);
        await m.react('⏳');

        // 2. RICERCA DEL VIDEO
        const search = await yts(text);
        const vid = search.videos[0];
        
        if (!vid) return m.reply('『 ⚠️ 』 \`Traccia non trovata negli archivi globali.\`');
        if (vid.seconds > 1200) return m.reply('『 ⏱️ 』 \`Il file supera i 20 minuti. Impossibile elaborare.\`');

        const url = vid.url;
        const isAudio = command === 'play' || command === 'playaud';
        let tipoIcona = isAudio ? '🎧' : '🎬';

        // 3. GRAFICA DI ELABORAZIONE LEGAM OS
        let captionInfo = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· ${tipoIcona} 𝐄𝐒𝐓𝐑𝐀𝐙𝐈𝐎𝐍𝐄 𝐈𝐍 𝐂𝐎𝐑𝐒𝐎 ${tipoIcona} ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 💿 』 𝐓𝐫𝐚𝐜𝐜𝐢𝐚: *${vid.title}*
『 ⏱️ 』 𝐃𝐮𝐫𝐚𝐭𝐚: *${vid.timestamp}*
『 👤 』 𝐀𝐫𝐭𝐢𝐬𝐭𝐚: *${vid.author.name}*

⚙️ _Sincronizzazione col motore FFmpeg..._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        let processingMsg = await conn.sendMessage(m.chat, {
            image: { url: vid.thumbnail },
            caption: captionInfo,
            contextInfo: legamContext('Elaborazione dati...')
        }, { quoted: m });

        // 4. RICERCA LINK (Metodo Infallibile a Cascata)
        let downloadUrl = null;
        let apis = isAudio ? [
            `https://api.siputzx.my.id/api/d/ytmp3?url=${url}`,
            `https://api.vreden.my.id/api/ytmp3?url=${url}`,
            `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${url}`
        ] : [
            `https://api.siputzx.my.id/api/d/ytmp4?url=${url}`,
            `https://api.vreden.my.id/api/ytmp4?url=${url}`,
            `https://api.ryzendesu.vip/api/downloader/ytmp4?url=${url}`
        ];

        for (let api of apis) {
            try {
                let res = await fetch(api);
                let json = await res.json();
                let possibilita = [json?.data?.dl, json?.result?.download?.url, json?.result?.url, json?.url];
                downloadUrl = possibilita.find(p => p && p.startsWith('http'));
                if (downloadUrl) break; // Link trovato!
            } catch (e) { continue; }
        }

        if (!downloadUrl) throw new Error("API completely down");

        // 5. IL TRUCCO DEI PROFESSIONISTI: SCARICA E CONVERTI FISICAMENTE
        const tmpDir = os.tmpdir();
        const inputPath = path.join(tmpDir, `legam_in_${Date.now()}`);
        const outputPath = path.join(tmpDir, `legam_out_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`);

        // Scarica il file nel server
        const res = await fetch(downloadUrl);
        const arrayBuffer = await res.arrayBuffer();
        fs.writeFileSync(inputPath, Buffer.from(arrayBuffer));

        // 6. INVIO DEL FILE
        if (isAudio) {
            // Converte il file in un MP3 standard (Evita i bug di WhatsApp Web e iPhone)
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
                ptt: false, // Inviato come traccia musicale
                contextInfo: {
                    ...legamContext('Legam Player'),
                    externalAdReply: {
                        title: vid.title,
                        body: 'Audio HQ - Legam OS',
                        thumbnailUrl: vid.thumbnail,
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        sourceUrl: url
                    }
                }
            }, { quoted: processingMsg });

        } else {
            // I video non necessitano di conversione audio
            fs.renameSync(inputPath, outputPath);
            
            await conn.sendMessage(m.chat, {
                video: fs.readFileSync(outputPath),
                mimetype: 'video/mp4',
                caption: `『 ✅ 』 *Download Video Completato!*\n> ${vid.title}`,
                fileName: `${vid.title}.mp4`,
                contextInfo: legamContext('Legam Player')
            }, { quoted: processingMsg });
        }

        // 7. PULIZIA SERVER (Cruciale per non bloccare la VPS)
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        
        await m.react('✅');

    } catch (e) {
        console.error("[LEGAM MUSIC ERROR]", e);
        await m.react('❌');
        m.reply('『 ❌ 』 \`Sistema sovraccarico.\`\n_Non sono riuscito ad estrarre la traccia. Riprova tra poco!_');
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
};

handler.help = ['play', 'playvid'];
handler.tags = ['downloader'];
// Intercetta i comandi diretti
handler.command = /^(play|playaud|playvid|playvideo)$/i;

export default handler;


