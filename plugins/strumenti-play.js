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

        // Limite di tempo (20 minuti) per non far esplodere WhatsApp
        if (video.seconds > 1200) {
            return m.reply(`『 ⏱️ 』 \`Video troppo lungo! Il limite massimo è di 20 minuti.\``);
        }

        let isAudio = command === 'play' || command === 'playaudio';
        let tipoIcona = isAudio ? '🎧' : '🎥';
        let tipoTesto = isAudio ? 'Audio' : 'Video';
        let ext = isAudio ? 'mp3' : 'mp4';

        // 2. Grafica "In Download" VIP
        let captionInfo = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· ${tipoIcona} 𝐈𝐍 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 ${tipoIcona} ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🎵 』 𝐓𝐢𝐭𝐨𝐥𝐨: *${video.title}*
『 👤 』 𝐂𝐚𝐧𝐚𝐥𝐞: *${video.author.name}*
『 ⏱️ 』 𝐃𝐮𝐫𝐚𝐭𝐚: *${video.timestamp}*
『 👁️ 』 𝐕𝐢𝐞𝐰𝐬: *${formatViews(video.views)}*

⏳ _Bypass dei server YouTube in corso..._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        let processingMsg = await conn.sendMessage(m.chat, {
            image: { url: video.thumbnail },
            caption: captionInfo,
            contextInfo: legamContext('Elaborazione in corso...')
        }, { quoted: m });

        // 3. 🔥 IL MOTORE AD ESTRAZIONE AGGRESSIVA 🔥
        let downloadUrl = null;
        let apis = [
            `https://api.giftedtech.my.id/api/download/dl${ext}?apikey=gifted&url=${video.url}`,
            `https://api.siputzx.my.id/api/d/yt${ext}?url=${video.url}`,
            `https://dark-yasiya-api-new.vercel.app/download/yt${ext}?url=${video.url}`,
            `https://delirius-apioficial.vercel.app/download/yt${ext}?url=${video.url}`,
            `https://api.ryzendesu.vip/api/downloader/yt${ext}?url=${video.url}`,
            `https://itzpire.com/download/youtube?url=${video.url}`
        ];

        for (let api of apis) {
            try {
                let res = await fetch(api);
                if (!res.ok) continue; // Se il server è morto, passa al prossimo
                
                let textRes = await res.text();
                let json;
                try { json = JSON.parse(textRes); } catch (e) { continue; } // Se non è JSON, salta
                
                // Caccia spietata al link di download (ignoriamo la struttura, cerchiamo le chiavi comuni)
                let possibiliLink = [
                    json?.data?.dl,
                    json?.data?.url,
                    json?.data?.download?.url,
                    json?.result?.download_url,
                    json?.result?.dl_link,
                    json?.result?.url,
                    json?.result?.download?.url,
                    json?.url,
                    json?.link,
                    json?.dl_link
                ];
                
                // Trova la prima stringa valida che inizia con 'http'
                downloadUrl = possibiliLink.find(p => p && typeof p === 'string' && p.startsWith('http'));
                
                if (downloadUrl) {
                    console.log(`[LEGAM MUSIC] Link trovato tramite: ${api.split('/')[2]}`);
                    break; 
                }
            } catch (e) {
                continue; 
            }
        }

        if (!downloadUrl) {
            throw new Error("Tutte le API hanno fallito o YouTube ha bloccato l'IP.");
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
                caption: `『 ✅ 』 *Video elaborato e scaricato!*\n> ${video.title}`,
                mimetype: 'video/mp4',
                fileName: `${video.title}.mp4`,
                contextInfo: legamContext('Legam Player')
            }, { quoted: processingMsg });
        }

    } catch (e) {
        console.error("[LEGAM MUSIC ERROR] ", e.message);
        await conn.sendMessage(m.chat, { 
            text: `『 ❌ 』 \`Protezione YouTube Attiva.\`\n_I server non riescono a estrarre questo file specifico al momento. Riprova con un altro brano!_`,
            contextInfo: legamContext('Estrazione Fallita')
        }, { quoted: m });
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
}

handler.help = ['play <titolo>', 'playvideo <titolo>'];
handler.tags = ['download'];
handler.command = /^(play|playaudio|playvideo)$/i;

export default handler;


