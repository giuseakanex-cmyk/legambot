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
    
    if (!text) {
        let helpMessage = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🎧 𝐋𝐄𝐆𝐀𝐌 𝐒𝐎𝐔𝐍𝐃𝐓𝐑𝐀𝐂𝐊 🎧 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 💡 』 *𝐂𝐨𝐦𝐞 𝐬𝐜𝐚𝐫𝐢𝐜𝐚𝐫𝐞:*

│ 🎵 ➭ \`${usedPrefix}play <titolo>\`
│ _Audio (MP3 Studio 128k)_

│ 🎬 ➭ \`${usedPrefix}playvid <titolo>\`
│ _Video (MP4 HQ)_

📌 *Esempio:* \`${usedPrefix}play Lazza Cenere\`
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();
        return conn.sendMessage(m.chat, { text: helpMessage, contextInfo: legamContext('Music Engine') }, { quoted: m });
    }

    try {
        await conn.sendPresenceUpdate('recording', m.chat);
        await m.react('⏳');

        // 1. RICERCA DEL BRANO
        const search = await yts(text);
        const vid = search.videos[0];
        
        if (!vid) return m.reply('『 ⚠️ 』 \`Traccia non trovata negli archivi globali.\`');
        if (vid.seconds > 1200) return m.reply('『 ⏱️ 』 \`Il file supera i 20 minuti. Impossibile elaborare.\`');

        const url = vid.url;
        const isAudio = command === 'play' || command === 'playaud';
        let tipoIcona = isAudio ? '🎧' : '🎬';

        // 2. GRAFICA DI ATTESA VIP
        let captionInfo = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· ${tipoIcona} 𝐄𝐒𝐓𝐑𝐀𝐙𝐈𝐎𝐍𝐄 𝐈𝐍 𝐂𝐎𝐑𝐒𝐎 ${tipoIcona} ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 💿 』 𝐓𝐫𝐚𝐜𝐜𝐢𝐚: *${vid.title}*
『 ⏱️ 』 𝐃𝐮𝐫𝐚𝐭𝐚: *${vid.timestamp}*
『 👤 』 𝐀𝐫𝐭𝐢𝐬𝐭𝐚: *${vid.author.name}*

⚙️ _Sincronizzazione motore ibrido..._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        let processingMsg = await conn.sendMessage(m.chat, {
            image: { url: vid.thumbnail },
            caption: captionInfo,
            contextInfo: legamContext('Elaborazione dati...')
        }, { quoted: m });

        let downloadUrl = null;

        // 3. MOTORE IBRIDO FASE 1: Estrazione Dinamica (Senza Crash)
        // Prova ad usare la libreria in modo invisibile. Se manca, non crasha.
        try {
            const fg = await import('api-dylux');
            if (fg && fg.default) {
                let res = isAudio ? await fg.default.yta(url) : await fg.default.ytv(url);
                if (res && res.dl_url) downloadUrl = res.dl_url;
            }
        } catch (e) {
            // Silenzio assoluto se la libreria non c'è. Passa al Piano B.
        }

        // 4. MOTORE IBRIDO FASE 2: L'Armata dei Server Backup
        if (!downloadUrl) {
            let ext = isAudio ? 'mp3' : 'mp4';
            let apis = [
                `https://dark-yasiya-api-new.vercel.app/download/yt${ext}?url=${url}`,
                `https://api.vreden.my.id/api/yt${ext}?url=${url}`,
                `https://api.siputzx.my.id/api/d/yt${ext}?url=${url}`,
                `https://itzpire.com/download/youtube?url=${url}`,
                `https://api.ryzendesu.vip/api/downloader/yt${ext}?url=${url}`
            ];

            for (let api of apis) {
                try {
                    let res = await fetch(api);
                    let json = await res.json();
                    
                    // Ricerca spietata del link dentro il JSON
                    let possibilita = [
                        json?.data?.dl, json?.result?.download?.url, 
                        json?.result?.url, json?.url, json?.data?.url
                    ];
                    
                    downloadUrl = possibilita.find(p => p && typeof p === 'string' && p.startsWith('http'));
                    if (downloadUrl) break; // Appena ne trova uno funzionante, ferma la ricerca!
                } catch (e) { continue; }
            }
        }

        if (!downloadUrl) throw new Error("Tutti i sistemi offline.");

        // 5. DOWNLOAD FISICO E CONVERSIONE FFMPEG
        const tmpDir = os.tmpdir();
        const inputPath = path.join(tmpDir, `legam_in_${Date.now()}`);
        const outputPath = path.join(tmpDir, `legam_out_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`);

        const res = await fetch(downloadUrl);
        const arrayBuffer = await res.arrayBuffer();
        fs.writeFileSync(inputPath, Buffer.from(arrayBuffer));

        if (isAudio) {
            // Forza la conversione in MP3 pulito a 128k
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
                ptt: false, // File musicale
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
            // Video (Rinomina e invia)
            fs.renameSync(inputPath, outputPath);
            
            await conn.sendMessage(m.chat, {
                video: fs.readFileSync(outputPath),
                mimetype: 'video/mp4',
                caption: `『 ✅ 』 *Download Video Completato!*\n> ${vid.title}`,
                fileName: `${vid.title}.mp4`,
                contextInfo: legamContext('Legam Player')
            }, { quoted: processingMsg });
        }

        // 6. PULIZIA DISCO
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        
        await m.react('✅');

    } catch (e) {
        console.error("[LEGAM MUSIC ERROR]", e);
        await m.react('❌');
        m.reply('『 ❌ 』 \`Rete Sovraccarica.\`\n_Sia i server principali che i backup sono intasati in questo momento. Riprova!_');
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
};

handler.help = ['play', 'playvid'];
handler.tags = ['downloader'];
handler.command = /^(play|playaud|playvid|playvideo)$/i;

export default handler;


