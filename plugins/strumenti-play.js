import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import ytSearch from 'yt-search'

const execPromise = promisify(exec)
const vic = new Map()
const CACHE_TTL = 15 * 60 * 1000
const gonnabealongyr = 20 * 60
const A = [ 'bestaudio[ext=m4a]/bestaudio', '251', '140', 'bestaudio', 'best[height<=480]' ]
const V = [ '135+140', '134+140', '136+140', '137+140',  /* Sti ultimi due hanno la maggior qualita ma pesano asf */]
const tmpDir = path.join(process.cwd(), 'temp')
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir)
}

function parseDurationToSeconds(duration) {
    if (!duration) return 0;
    if (typeof duration === 'number') return duration;
    const parts = duration.toString().split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parseInt(duration) || 0;
}

async function runYtDlp(args) { 
    const ytdlpCommands = [
        'yt-dlp',
        'yt-dlp.exe',
        'python -m yt_dlp',
        path.join(process.cwd(), 'yt-dlp.exe'),
        path.join(process.cwd(), 'node_modules', '.bin', 'yt-dlp'),
        'python -m yt_dlp',
        'python3 -m yt_dlp'
    ];
    
    let lastError;
    
    for (const cmd of ytdlpCommands) {
        try {
            const command = `${cmd} ${args.join(' ')}`;
            const { stdout, stderr } = await execPromise(command, {
                maxBuffer: 50 * 1024 * 1024,
                shell: true
            });
            
            return { stdout, stderr };
        } catch (error) {
            lastError = error;
            continue;
        }
    }
    
    console.error('[ERROR] yt-dlp not found. Tried:', ytdlpCommands.join(', '));
    throw new Error('YT_DLP_NOT_FOUND');
}

async function download(url, outputPath, format, extractAudio = false) {
    const args = [
        `"${url}"`,
        '-f', format,
        '-o', `"${outputPath}"`,
        '--no-warnings',
        '--no-playlist',
        '--prefer-free-formats',
        '--user-agent', '"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"',
        '--referer', '"https://www.youtube.com/"',
    ];
    
    if (extractAudio) {
        args.push('-x');
        args.push('--audio-format', 'mp3');
        args.push('--audio-quality', '0');
        args.push('--embed-thumbnail');
        args.push('--add-metadata');
    } else {
        args.push('--merge-output-format', 'mp4');
    }
    
    await runYtDlp(args);
}

async function getVideoInfo(url) {
    try {
        const args = [
            `"${url}"`,
            '--dump-json',
            '--no-warnings',
            '--no-playlist'
        ];
        
        const { stdout } = await runYtDlp(args);
        const info = JSON.parse(stdout);
        
        return {
            title: info.title || 'Video YouTube',
            uploader: info.uploader || info.channel || 'Sconosciuto',
            duration: info.duration,
            view_count: info.view_count,
            upload_date: info.upload_date,
            thumbnail: info.thumbnail,
            id: info.id,
            webpage_url: info.webpage_url || url
        };
    } catch (error) {
        console.error('[ERROR] Failed to get video info:', error.message);
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
        
        return {
            title: 'Video YouTube',
            uploader: 'YouTube',
            duration: 0,
            view_count: null,
            upload_date: null,
            thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null,
            id: videoId,
            webpage_url: url
        };
    }
}

let handler = async (m, { conn, command, text, usedprefix }) => {
    const prefix = usedprefix || '.';
    
    if (!text) {
        const helpMessage = `
*╭─ׄ✦☾⋆⁺₊✧ 𝓿𝓪𝓻𝓮𝓫𝓸𝓽 ✧₊⁺⋆☽✦─ׅ⭒*
*├* 『 ⁉️ 』 _Comandi disponibili:_
*├* *├* \`${prefix}play\` _<nome/url>_
*├* ↳ 『 🎵 』- *Scarica audio veloce*
*├*
*├* \`${prefix}playaudio\` _<nome/url>_
*├* ↳ 『 🎶 』- *Scarica solo l'audio*
*├*
*├* \`${prefix}playvideo\`  _<nome/url>_
*├* ↳ 『 🎥 』- *Scarica video*
*├*
*├* 『 🍥 』- \`Esempi:\`
*├* _${prefix}play Charge me Future_
*├* _${prefix}playaudio https://youtu.be/gLNpPiUpJ4w_
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*
> \`vare ✧ bot\``;
        await conn.reply(m.chat, helpMessage.trim(), m);
        return;
    }

    await conn.sendPresenceUpdate(command === 'play' ? 'composing' : 'recording', m.chat);
    const isSearchQuery = !text.startsWith('http');

    try {
        if (!isSearchQuery) {
            await downloadMedia(m, conn, command, text, prefix, null, isSearchQuery);
            return;
        }

        const searchKey = `search_${text.toLowerCase()}`;
        let searchResults = null;

        if (vic.has(searchKey) && (Date.now() - vic.get(searchKey).timestamp < CACHE_TTL)) {
            searchResults = vic.get(searchKey).data;
        } else {
            const search = await ytSearch(text);
            if (!search.videos.length) throw '❌ *Nessun risultato trovato!*';
            searchResults = search.videos.slice(0, 5);
            vic.set(searchKey, { data: searchResults, timestamp: Date.now() });
        }
        
        if (command === 'playaudio' || command === 'playvideo') {
            const firstVideo = searchResults[0];
            const videoInfo = {
                title: firstVideo.title || 'Video YouTube',
                uploader: firstVideo.author?.name || 'Sconosciuto',
                duration: firstVideo.duration?.seconds || parseDurationToSeconds(firstVideo.duration?.timestamp),
                duration_string: firstVideo.duration?.timestamp || '?',
                view_count: firstVideo.views,
                upload_date: firstVideo.uploadedAt || null,
                thumbnail: firstVideo.thumbnail || `https://img.youtube.com/vi/${firstVideo.videoId}/maxresdefault.jpg`,
                id: firstVideo.videoId,
                webpage_url: firstVideo.url
            };

            if (videoInfo.id) {
                vic.set(`info_${videoInfo.id}`, { data: videoInfo, timestamp: Date.now() });
            }
            
            if (videoInfo.duration > gonnabealongyr) {
                await conn.sendMessage(m.chat, { 
                    text: `『 ⏱️ 』 *Video troppo lungo!*\n> Il limite è di 20 minuti.\n> Durata video: ${videoInfo.duration_string}` 
                }, { quoted: m });
                return;
            }

            const title = videoInfo.title.replace(/[<>:"/\\|?*]/g, '_').substring(0, 70);
            const author = videoInfo.uploader.substring(0, 25);
            const views = videoInfo.view_count ? parseInt(videoInfo.view_count).toLocaleString() : '?';

            const captionMessage = `
*╭─ׄ✦☾⋆⁺₊✧ 𝓿𝓪𝓻𝓮𝓫𝓸𝓽 ✧₊⁺⋆☽✦─ׅ⭒*
*├* *\`${title}\`*
*├* 👤 \`Autore:\` *${author}*
*├* 👁️ \`Views:\` *${views}*
*├* ⏱️ \`Durata:\` *${videoInfo.duration_string}*
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*
> \`Download in corso...\``;
            
            await conn.sendMessage(m.chat, {
                image: { url: videoInfo.thumbnail },
                caption: captionMessage.trim(),
                footer: '> \`vare ✧ bot\`',
                contextInfo: global.fake.contextInfo
            }, { quoted: m });

            await downloadMedia(m, conn, command, firstVideo.url, prefix, videoInfo, isSearchQuery);
            return;
        }
        
        const cardsPromises = searchResults.map(async (video, index) => {
            const durationSec = video.duration?.seconds || parseDurationToSeconds(video.duration?.timestamp);
            const isTooLong = durationSec > gonnabealongyr;
            const durationStr = video.duration?.timestamp || '?';
            const durationDisplay = isTooLong ? `⚠️ ${durationStr} (Max 20m)` : durationStr;

            const views = video.views?.toLocaleString() || '?';
            const author = video.author?.name || 'Sconosciuto';
            const shortTitle = video.title.substring(0, 70) + (video.title.length > 70 ? '...' : '');

            return {
                image: { url: video.thumbnail },
                title: `${index + 1}. ${shortTitle}`,
                body: `『 👤 』 *${author}*\n『 ⏱️ 』 *${durationDisplay}* - 『 👁️ 』 *${views}*`,
                footer: `˗ˏˋ ☾ 𝚟𝚊𝚛𝚎𝚋𝚘𝚝 ☽ ˎˊ˗`,
                buttons: [
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                          display_text: "🎵 Scarica Audio",
                          id: `${prefix}playaudio ${video.url}`
                        })
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                          display_text: "📽️ Scarica video",
                          id: `${prefix}playvideo ${video.url}`
                        })
                    },
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                          display_text: "📲 Apri su YouTube",
                          url: video.url
                        })
                    }
                ]
            };
        });

        const cards = await Promise.all(cardsPromises);

        await conn.sendMessage(
            m.chat,
            {
                text: `『 🔍 』 *Risultati trovati per:*\n- ↳ *\`${text}\`*`,
                footer: 'vare ✧ bot',
                cards: cards
            },
            { quoted: m }
        );

    } catch (e) {
        console.error('[ERROR] Handler failed:', e.message);
        await conn.reply(m.chat, typeof e === 'string' ? e : '❌ *Errore durante la ricerca!*', m);
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
};

async function downloadMedia(m, conn, command, url, prefix, preloadedVideoInfo = null, isSearchQuery = false) {
    try {
        let videoInfo = preloadedVideoInfo;
        
        if (!videoInfo) {
            if (!url.match(/youtube\.com\/watch\?v=|youtu\.be\//)) {
                try {
                    const searchResult = await ytSearch(url);
                    if (searchResult?.videos?.length > 0) {
                        const video = searchResult.videos[0];
                        videoInfo = {
                            title: video.title,
                            uploader: video.author?.name,
                            duration: video.duration?.seconds || parseDurationToSeconds(video.duration?.timestamp),
                            thumbnail: video.thumbnail,
                            id: video.videoId
                        };
                    }
                } catch (err) {
                    console.warn('[WARN] ytSearch fallback failed:', err.message);
                }
            }

            if (!videoInfo) {
                videoInfo = await getVideoInfo(url);
            }
        }

        if (videoInfo?.duration) {
            const durationSec = typeof videoInfo.duration === 'number' 
                ? videoInfo.duration 
                : parseDurationToSeconds(videoInfo.duration);
                
            if (durationSec > gonnabealongyr) {
                throw new Error('duration_limit');
            }
        }

        const ext = (command === 'playvideo') ? 'mp4' : 'mp3';
        const tmpFile = path.join(tmpDir, `${command}_${Date.now()}.${ext}`);
        
        const extractAudio = (command === 'play' || command === 'playaudio');
        const formats = (command === 'playvideo') ? V : A;
        
        let downloaded = false;
        let lastError = null;
        
        for (let i = 0; i < formats.length; i++) {
            const format = formats[i];
            
            try {
                await download(url, tmpFile, format, extractAudio);
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                const files = fs.readdirSync(tmpDir).filter(f => f.startsWith(`${command}_`));
                let actualFile = tmpFile;
                
                if (extractAudio && !fs.existsSync(tmpFile)) {
                    const mp3File = tmpFile.replace(/\.[^.]+$/, '.mp3');
                    if (fs.existsSync(mp3File)) {
                        actualFile = mp3File;
                    }
                }
                
                if (fs.existsSync(actualFile)) {
                    const stats = fs.statSync(actualFile);
                    
                    if (stats.size > 10000) {
                        const buffer = await fs.promises.readFile(actualFile);
                        await fs.promises.unlink(actualFile).catch(() => {});
                        
                        const safeTitle = videoInfo ? videoInfo.title.replace(/[<>:"/\\|?*]/g, '_').substring(0, 20) : 'media';

                        if (command === 'playvideo') {
                            await conn.sendMessage(m.chat, {
                                video: buffer,
                                mimetype: 'video/mp4',
                                fileName: `${safeTitle}.mp4`,
                                caption: `> \`vare ✧ bot\``,
                                contextInfo: global.fake.contextInfo
                            }, { quoted: m });
                        } else {
                            await conn.sendMessage(m.chat, {
                                audio: buffer,
                                mimetype: 'audio/mpeg',
                                fileName: `${safeTitle}.mp3`,
                                ptt: false,
                                contextInfo: {
                                    ...global.fake.contextInfo,
                                    externalAdReply: {
                                        ...global.fake.contextInfo,
                                        title: `${videoInfo?.title} - ${author?.name}`,
                                        body: '⋆⭑˚₊ 𝓥𝓪𝓻𝓮𝓫𝓸𝓽 ₊˚⭑⋆',
                                        thumbnailUrl: videoInfo ? videoInfo.thumbnail : null,
                                        mediaType: 1,
                                        renderLargerThumbnail: false,
                                    }
                                }
                            }, { quoted: m });
                        }
                        
                        downloaded = true;
                        break;
                    } else {
                        fs.unlinkSync(actualFile);
                    }
                }
            } catch (err) {
                console.warn(`[WARN] Format ${format} failed:`, err.message);
                lastError = err;
                
                const files = fs.readdirSync(tmpDir).filter(f => f.startsWith(`${command}_`));
                files.forEach(f => {
                    try {
                        fs.unlinkSync(path.join(tmpDir, f));
                    } catch {}
                });
            }
            
            if (i < formats.length - 1 && !downloaded) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        if (!downloaded) {
            console.error('[ERROR] All formats failed');
            throw new Error('download_failed');
        }
        
    } catch (e) {
        console.error('[ERROR] Download media failed:', e.message);
        
        let errorMessage = '『 ❌ 』- \`Errore durante il download\`';
        
        if (e.message === 'YT_DLP_NOT_FOUND') {
            errorMessage = `『 ⚠️ 』 *yt-dlp non trovato!*`;
        } else if (e.message === 'duration_limit') {
            errorMessage = '『 ⏱️ 』- \`Video troppo lungo! Limite: 20 minuti.\`';
        } else if (e.message === 'download_failed') {
            errorMessage = `『 🚫 』 *Download fallito*

Questo video potrebbe:
- Non essere disponibile nella tua regione
- Essere limitato per età
- Richiedere l'accesso`;
        } else if (e.message?.includes('not found') || e.message?.includes('ENOENT')) {
            errorMessage = `『 ⚠️ 』 *yt-dlp non trovato!*`;
        } else if (e.message?.includes('Sign in')) {
            errorMessage = `${global.errore}`;
        }
        
        await conn.reply(m.chat, errorMessage, m);
    }
}

setInterval(() => {
    const now = Date.now();
    for (const [key, value] of vic.entries()) {
        if (now - value.timestamp > CACHE_TTL) vic.delete(key);
    }
}, 3 * 60 * 1000);

handler.help = ['play <nome/url>', 'playaudio <nome/url>', 'playvideo <nome/url>'];
handler.tags = ['download'];
handler.command = ['play', 'playaudio', 'playvideo'];
handler.register = true;
export default handler;