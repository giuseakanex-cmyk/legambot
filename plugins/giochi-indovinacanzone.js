import axios from 'axios'
import fs from 'fs'
import path from 'path'

const aymetanonlihosceltiio = [
    "Lazza", "Sfera Ebbasta", "Ghali", "Baby Gang", "Shiva", "Drake", "Tony Boy", 
    "Kid Yugi", "21 savage", "Marracash", "Capo Plaza", "Guè Pequeno", "King Von", 
    "Central Cee", "Lil Durk", "Tha Supreme", "Gemitaiz", "Fabri Fibra", "Simba La Rue", 
    "Il tre", "RondoDaSosa", "Drefgold", "Noyz Narcos", "Salmo", "Ariete", "Tedua", 
    "Anna", "Rose Villain", "Artie 5ive", "Glocky", "Lil Baby", "Kodack Black", "LUCKI", 
    "YoungBoy Never Broke Again", "Il Ghost", "Melons", "Massimo Pericolo", 
    "Nabi", "Geolier", "Paky", "Villabanks", "Blanco", "Mahmood", "Irama"
]

function normalize(str) {
    if (!str) return '';
    return str
        .split('-')[0] 
        .split(/[\(\[{]/)[0] 
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') 
        .replace(/[^a-z0-9\s]/g, '') 
        .trim();
}

function similarity(str1, str2) {
    const s1 = normalize(str1);
    const s2 = normalize(str2);
    if (!s1 || !s2) return 0;
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const intersection = words1.filter(w => words2.includes(w));
    return (2.0 * intersection.length) / (words1.length + words2.length);
}

async function getRandomTrack(artist = null) {
    let found = null;
    let tentativi = 0;
    const searchTerms = artist ? [artist] : aymetanonlihosceltiio;
    
    while (!found && tentativi < 3) {
        const query = artist || searchTerms[Math.floor(Math.random() * searchTerms.length)];
        
        try {
            const response = await axios.get('https://itunes.apple.com/search', {
                params: {
                    term: query,
                    country: 'IT',
                    media: 'music',
                    entity: 'song',
                    attribute: 'artistTerm',
                    limit: 100
                }
            });
            const valid = response.data.results.filter(b => {
                const title = b.trackName.toLowerCase();
                const artistName = b.artistName.toLowerCase();
                
                return b.previewUrl && 
                b.trackName && 
                b.artistName && 
                b.artworkUrl100 &&
                b.trackTimeMillis > 45000 &&
                !title.includes('karaoke') &&
                !title.includes('tribute') &&
                !title.includes('cover') &&
                !title.includes('instrumental') &&
                !title.includes('strumentale') &&
                !title.includes('remix') &&
                !title.includes('live') &&
                !title.includes('concert') &&
                !title.includes('demo') &&
                !artistName.includes('karaoke') &&
                !artistName.includes('cover band');
            });
            let filteredValid = valid;
            if (artist) {
                const searchNorm = normalize(artist);
                filteredValid = valid.filter(b => normalize(b.artistName).includes(searchNorm));
            }
            const topHitsCount = Math.min(filteredValid.length, 25); 
            
            if (topHitsCount > 0) {
                const topHits = filteredValid.slice(0, topHitsCount);
                found = topHits[Math.floor(Math.random() * topHits.length)];
            }

        } catch (e) {
            console.error('Errore iTunes:', e.message);
        }
        tentativi++;
    }

    if (!found) {
        if (artist) throw new Error(`Non ho trovato canzoni famose per "${artist}".`);
        throw new Error('Errore durante la ricerca della canzone.');
    }

    return {
        title: found.trackName,
        artist: found.artistName,
        preview: found.previewUrl,
        artwork: found.artworkUrl100.replace('100x100bb', '600x600bb')
    };
}

const activeGames = new Map();
let handler = async (m, { conn, text }) => {
    const chat = m.chat;

    if (activeGames.has(chat)) {
        return m.reply('『 ⚠️ 』- \`C\'è già una partita in corso!\` Finisci quella prima.');
    }

    let audioPath = null;
    
    try {
        const track = await getRandomTrack(text);
        
        const audioResponse = await axios.get(track.preview, { responseType: 'arraybuffer' });
        const tmpDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        
        audioPath = path.join(tmpDir, `guess_${Date.now()}.mp3`);
        fs.writeFileSync(audioPath, Buffer.from(audioResponse.data));

        const txtMessage = `
⋆｡˚『 ╭ \`INDOVINA CANZONE\` ╯ 』˚｡⋆\n╭
┃ 『 ⏱️ 』 \`Tempo:\` *30s*
┃ 『 👤 』 \`Artista:\` *${track.artist}*
┃
┃ ➤  \`Scrivi il titolo!\`
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`;

        let gameMessage = await conn.sendMessage(m.chat, {
            text: txtMessage,
            contextInfo: { ...global.fake.contextInfo,
                externalAdReply: {
                    title: 'Indovina la canzone',
                    body: `Artista: ${track.artist}`,
                    thumbnailUrl: track.artwork,
                    sourceUrl: '',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        await conn.sendMessage(m.chat, { 
            audio: fs.readFileSync(audioPath), 
            mimetype: 'audio/mp4', 
            ptt: true,
            contextInfo: global.fake.contextInfo
        }, { quoted: gameMessage });

        let game = {
            track,
            timeLeft: 30,
            id: m.chat,
            message: gameMessage,
            interval: null
        };

        activeGames.set(chat, game);

        game.interval = setInterval(async () => {
            if (!activeGames.has(chat)) {
                return clearInterval(game.interval);
            }

            game.timeLeft -= 5;

            if (game.timeLeft <= 0) {
                clearInterval(game.interval);
                activeGames.delete(chat);
                
                await conn.sendMessage(m.chat, {
                    text: `
ㅤ⋆｡˚『 ╭ \`TEMPO SCADUTO\` ╯ 』˚｡⋆\n╭
│ ➤ \`Nessuno ha indovinato!\`
┃ 『 🎵 』 \`Titolo:\` *${track.title}*
┃ 『 👤 』 \`Artista:\` *${track.artist}*
╰⭒─ׄ─ׅ─ׄ─⭒`,
                    buttons: [
                        { buttonId: '.ic', buttonText: { displayText: '『 🎵 』 Rigioca' }, type: 1 }
                    ],
                    headerType: 1,
                    viewOnce: true,
                    contextInfo: global.fake.contextInfo
                }, { quoted: gameMessage }).catch(() => {});
            }
        }, 5000);

    } catch (e) {
        console.error('Errore IC:', e);
        m.reply(e.message || 'Errore, riprova.');
        activeGames.delete(chat);
    } finally {
        if (audioPath && fs.existsSync(audioPath)) {
            try { fs.unlinkSync(audioPath); } catch (err) {}
        }
    }
}

handler.before = async (m, { conn }) => {
    const chat = m.chat;
    if (!activeGames.has(chat)) return;
    const game = activeGames.get(chat);
    if (!m.text || m.text.length < 2 || m.text.startsWith('.')) return;
    const userAnswer = normalize(m.text);
    const correctAnswer = normalize(game.track.title);
    const score = similarity(m.text, game.track.title);
    const isCorrect = 
        userAnswer === correctAnswer || 
        (correctAnswer.length > 3 && userAnswer.includes(correctAnswer)) ||
        (userAnswer.length > 3 && correctAnswer.includes(userAnswer)) ||
        score >= 0.75;

    if (isCorrect) {
        clearInterval(game.interval);
        activeGames.delete(chat);
        let reward = Math.floor(Math.random() * 200) + 100;
        let exp = Math.floor(Math.random() * 300) + 200;
        if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};
        global.db.data.users[m.sender].euro = (global.db.data.users[m.sender].euro || 0) + reward;
        global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + exp;

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        
        await conn.sendMessage(m.chat, {
            text: `
ㅤㅤ⋆｡˚『 ╭ \`VITTORIA\` ╯ 』˚｡⋆\n╭
│ ➤ \`Grande @${m.sender.split('@')[0]}!\`
┃ 『 🎵 』 \`Titolo:\` *${game.track.title}*
┃ 『 👤 』 \`Artista:\` *${game.track.artist}*
┃ 『 🎁 』 \`+${reward}€ | +${exp}xp\`
╰⭒─ׄ─ׅ─ׄ─⭒`,
            mentions: [m.sender],
            contextInfo: global.fake.contextInfo,
            buttons: [
                { buttonId: '.ic', buttonText: { displayText: '『 🎵 』 Rigioca' }, type: 1 }
            ],
            headerType: 1,
            viewOnce: true
        }, { quoted: m });

    } else if (score >= 0.45) {
        await conn.sendMessage(m.chat, { react: { text: '👀', key: m.key } });
    }
}

handler.help = ['indovinacanzone [artista]'];
handler.tags = ['giochi'];
handler.command = /^(indovinacanzone|ic)$/i;
handler.group = true;
handler.register = true;

export default handler;