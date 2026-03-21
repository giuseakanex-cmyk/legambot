import ytSearch from 'yt-search'
import fetch from 'node-fetch'

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

function formatViews(views) {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M'
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K'
    return views.toString()
}

let handler = async (m, { conn, command, text, usedPrefix }) => {
    
    if (!text) {
        let helpMessage = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🎵 𝐋𝐄𝐆𝐀𝐌 𝐌𝐔𝐒𝐈𝐂 🎵 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 💡 』 𝐂𝐨𝐦𝐚𝐧𝐝𝐢 𝐃𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐢:

│ 🎧 ➭ \`${usedPrefix}play <titolo>\`
│ _Scarica il brano in formato Audio (MP3)_

│ 🎥 ➭ \`${usedPrefix}playvideo <titolo>\`
│ _Scarica la clip in formato Video (MP4)_

📌 *Esempio:* \`${usedPrefix}play Lazza Cenere\`
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();
        return conn.sendMessage(m.chat, { text: helpMessage, contextInfo: legamContext('Music Player') }, { quoted: m });
    }

    await conn.sendPresenceUpdate('recording', m.chat);

    try {
        // 1. Ricerca del Video
        let searchResults = await ytSearch(text);
        if (!searchResults || !searchResults.videos.length) {
            return m.reply(`『 ❌ 』 \`Nessun risultato trovato per: ${text}\``);
        }

        let video = searchResults.videos[0]; 

        // Limite di tempo (20 minuti)
        if (video.seconds > 1200) {
            return m.reply(`『 ⏱️ 』 \`Video troppo lungo! Il limite massimo è di 20 minuti.\``);
        }

        // 2. Grafica "In Download" VIP
        let isAudio = command === 'play' || command === 'playaudio';
        let tipoIcona = isAudio ? '🎧' : '🎥';
        let tipoTesto = isAudio ? 'Audio' : 'Video';

        let captionInfo = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· ${tipoIcona} 𝐈𝐍 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 ${tipoIcona} ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🎵 』 𝐓𝐢𝐭𝐨𝐥𝐨: *${video.title}*
『 👤 』 𝐂𝐚𝐧𝐚𝐥𝐞: *${video.author.name}*
『 ⏱️ 』 𝐃𝐮𝐫𝐚𝐭𝐚: *${video.timestamp}*
『 👁️ 』 𝐕𝐢𝐞𝐰𝐬: *${formatViews(video.views)}*

⏳ _Ricerca nei server globali in corso..._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        let processingMsg = await conn.sendMessage(m.chat, {
            image: { url: video.thumbnail },
            caption: captionInfo,
            contextInfo: legamContext('Download in corso...')
        }, { quoted: m });

        // 3. 🔥 SISTEMA MULTI-API (CASCATA) 🔥
        // Se la prima API fallisce, prova le successive in automatico
        let downloadUrl = null;
        let apis = isAudio ? [
            `https://api.siputzx.my.id/api/d/ytmp3?url=${video.url}`,
            `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${video.url}`,
            `https://api.vreden.my.id/api/ytmp3?url=${video.url}`,
            `https://api.agatz.xyz/api/ytmp3?url=${video.url}`
        ] : [
            `https://api.siputzx.my.id/api/d/ytmp4?url=${video.url}`,
            `https://api.ryzendesu.vip/api/downloader/ytmp4?url=${video.url}`,
            `https://api.vreden.my.id/api/ytmp4?url=${video.url}`,
            `https://api.agatz.xyz/api/ytmp4?url=${video.url}`
        ];

        for (let api of apis) {
            try {
                let res = await fetch(api);
                let json = await res.json();
                
                // Controlla tutte le possibili risposte delle varie API
                downloadUrl = json?.data?.dl || json?.url || json?.data?.url || json?.result?.download?.url || json?.data?.downloadUrl;
                
                if (downloadUrl) break; // Se trova il link, esce dal loop e scarica!
            } catch (e) {
                continue; // Se l'API è down, salta alla prossima
            }
        }

        if (!downloadUrl) {
            throw new Error("API_DOWN");
        }

        // 4. Invio del File Reale
        if (isAudio) {
            await conn.sendMessage(m.chat, {
                audio: { url: downloadUrl },
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`,
                contextInfo: {
                    ...legamContext('Legam Player'),
                    externalAdReply: {
                        title: video.title,
                        body: video.author.name,
                        thumbnailUrl: video.thumbnail,
                        sourceUrl: video.url,
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: processingMsg });
        } else {
            await conn.sendMessage(m.chat, {
                video: { url: downloadUrl },
                caption: `『 ✅ 』 *Video scaricato con successo!*\n> ${video.title}`,
                mimetype: 'video/mp4',
                fileName: `${video.title}.mp4`,
                contextInfo: legamContext('Legam Player')
            }, { quoted: processingMsg });
        }

    } catch (e) {
        console.error("[LEGAM MUSIC ERROR] ", e);
        await conn.sendMessage(m.chat, { 
            text: `『 ❌ 』 \`Errore Server.\`\n_Tutti i server di conversione sono attualmente saturi. Riprova tra 5 minuti!_`,
            contextInfo: legamContext('Errore Server')
        }, { quoted: m });
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
}

handler.help = ['play <titolo>', 'playvideo <titolo>'];
handler.tags = ['download'];
handler.command = /^(play|playaudio|playvideo)$/i;

export default handler;

