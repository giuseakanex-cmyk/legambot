import fetch from 'node-fetch';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import { join } from 'path';
import { createCanvas, loadImage } from 'canvas';
import Jimp from 'jimp';

const apis = {
    sra: 'https://some-random-api.com/canvas/',
    popcat: 'https://api.popcat.xyz/',
};

const aliasMap = {
    'brucia': 'burn',
    'fuoco': 'burn',
    'falò': 'burn',
    'cioccolatino': 'mnm',
    'prigione': 'jail',
    'carcere': 'jail',
    'gabbio': 'jail',
    'sottone': 'simpcard',
    'arrapato': 'horny',
    'polizia': 'lolice',
    'sbirri': 'lolice',
    'ricercato': 'wanted',
    'taglia': 'wanted',
    'pistola': 'gun',
    'spara': 'gun',
    'pagliaccio': 'clown',
    'circo': 'clown',
    'stile': 'drip',
    'triggerato': 'triggered',
};

const effetti = {
    triggered: { api: 'sra', path: 'overlay/triggered', isGif: true }, 
    jail: { api: 'sra', path: 'overlay/jail' },
    comunista: { api: 'sra', path: 'overlay/comrade' },
    passed: { api: 'sra', path: 'overlay/passed' },
    wasted: { api: 'sra', path: 'overlay/wasted' },
    gay: { api: 'sra', path: 'overlay/gay' },
    simpcard: { api: 'sra', path: 'misc/simpcard' },
    horny: { api: 'sra', path: 'misc/horny' },
    lolice: { api: 'sra', path: 'misc/lolice' },
    bisex: { api: 'sra', path: 'misc/bisexual' },
    lesbian: { api: 'sra', path: 'misc/lesbian' },
    lgbt: { api: 'sra', path: 'misc/lgbt' },
    tonikawa: { api: 'sra', path: 'misc/tonikawa' },
    petpet: { api: 'popcat', path: 'pet', isGif: true, avatarParam: 'image' },
    wanted: { api: 'popcat', path: 'wanted', avatarParam: 'image' },
    gun: { api: 'popcat', path: 'gun', avatarParam: 'image' },
    clown: { api: 'popcat', path: 'clown', avatarParam: 'image' },
    drip: { api: 'popcat', path: 'drip', avatarParam: 'image' },
    ad: { api: 'popcat', path: 'ad', avatarParam: 'image' },
    mnm: { api: 'popcat', path: 'mnm', avatarParam: 'image' },
    burn: { api: 'popcat', path: 'burn', avatarParam: 'image' }
};

const didascalie = {
    jail: [
        "Ti hanno beccato, coglione! 🚔",
        "Non far cadere la saponetta, {name}... o forse speri che succeda? 🧼🚿",
        "Finalmente al fresco, rifiuto della società.",
        "Ergastolo per eccesso di bruttezza.",
        "Hanno buttato la chiave, godo.",
        "Ecco dove meriti di stare, pezzo di merda."
    ],
    wasted: [
        "Sembri un cassonetto rovesciato.",
        "Hai perso pure i neuroni rimasti.",
        "Missione fallita: sei nato.",
        "GAME OVER, {name}.",
        "Bruciato come le tue possibilità di successo. 🔥"
    ],
    passed: [
        "Mission Passed! +Respect",
        "Hai vinto... il premio per la faccia peggiore.",
        "Respect++",
        "Unica cosa che hai passato nella vita."
    ],
    horny: [
        "Basta seghe, vai a toccare l'erba.",
        "Livello di arrapamento: MOLESTATORE 🚨",
        "Hai la cronologia che urla aiuto.",
        "BONK! Vai in prigione {name}."
    ],
    simpcard: [
        "Ecco il re dei sottoni: {name}. 🤡",
        "Bancomat umano certificato.",
        "Dignità non pervenuta.",
        "Livello di zerbinaggio: INFINITO."
    ],
    comunista: [
        "IL NOSTRO meme. ☭",
        "Stalin sarebbe fiero di questo schifo.",
        "Gulag prenotato per {name}.",
        "Non è la TUA foto, è la NOSTRA foto."
    ],
    gay: [
        "🏳️‍🌈 Why are you gae?",
        "Si vedeva lontano un miglio che eri dell'altra sponda.",
        "Ti piace il pesce eh {name}? Golosone.",
        "Benvenuto nel club dell'arcobaleno, buco rotto."
    ],
    lolice: [
        "Mani in alto pedofilo di merda! 🚓",
        "Hai l'hard disk da controllare...",
        "FBI OPEN UP!",
        "Don Matteo sta chiamando i carabinieri."
    ],
    triggered: [
        "REEEEEEEEEEEEEEEE 🤬",
        "Qualcuno ha la sabbia nella fessa.",
        "Calmati zi, prenditi uno Xanax.",
        "Incazzato come una biscia mestruata."
    ],
    sborra: [
        "Battezzato con la crema pasticcera. 💦",
        "Tutto cosi appiccicoso...",
        "Proteine pure in faccia per {name}.",
        "Bukake party finito male."
    ],
    napoli: [
        "Ué ué, jamme ja! 🍕",
        "Orologio sparito in 3... 2... 1...",
        "San Gennaro non ti grazia, sei troppo brutto.",
        "Scugnizzo mode: ON.",
        "Vedi Napoli e poi muori (dalla puzza)."
    ],
    wanted: [
        "Ricercato per crimini contro l'estetica.",
        "Vivo o morto (meglio morto).",
        "Taglia di 2 euro, tanto vali."
    ],
    gun: [
        "Schiva questo, coglione!",
        "Dì le tue ultime parole, {name}.",
        "Pov: Hai detto una cazzata di troppo.",
        "Dio perdona, io no."
    ],
    clown: [
        "Non sei un clown, sei l'intero circo.",
        "Struccati, che fai paura.",
        "Onk Onk! 🤡",
        "Finalmente una foto senza filtri di {name}."
    ],
    drip: [
        "Sheeeesh! Guarda che stile! 🧥",
        "Troppo drip per voi comuni mortali.",
        "Supreme o pezzotto? Sicuro pezzotto."
    ],
    mnm: [
        "Ti mangerei, ma sai di merda.",
        "L'M&M's che nessuno vuole nel pacchetto.",
        "Si scioglie in bocca o in mano? Nel cesso.",
        "Look cioccolatoso."
    ],
    ad: [
        "Vendesi {name}: prezzo trattabile (gratis).",
        "Non comprate questo prodotto, è scaduto.",
        "Pubblicità progresso contro l'abbandono dei neuroni."
    ],
    default: [
        "Ecco la tua immagine del cazzo. 🎨",
        "Pago la connessione per questo?",
        "Tieni, mostro.",
        "Fai schifo, ma ecco l'edit.",
        "Che imbarazzo, {name}."
    ]
};

const getCaption = (effect, name) => {
    let key = effect;
    if (['lesbian', 'lgbt', 'bisex', 'tonikawa'].includes(effect)) key = 'gay';
    if (['love', 'heart'].includes(effect)) key = 'simpcard';
    if (['ad'].includes(effect)) key = 'default';
    if (['burn'].includes(effect)) key = 'wasted';
    
    const list = didascalie[key] || didascalie['default'];
    const frase = list[Math.floor(Math.random() * list.length)];
    return frase.replace(/{name}/g, name);
};

const stickerButton = [{
    buttonId: '.sticker',
    buttonText: { displayText: '🖼️ Rendi Sticker' },
    type: 1
}];

function drawHeart(ctx, x, y, width, height) {
    const topCurveHeight = height * 0.3;
    ctx.beginPath();
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - width / 2, y + (height + topCurveHeight) / 2, x, y + (height + topCurveHeight) / 2, x, y + height);
    ctx.bezierCurveTo(x, y + (height + topCurveHeight) / 2, x + width / 2, y + (height + topCurveHeight) / 2, x + width / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
}

async function createILoveImage(name) {
    const width = 1080;
    const height = 1080;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    const fontFace = '"Arial Rounded MT Bold", "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const firstLineY = height * 0.35;
    const heartSize = 350;

    ctx.fillStyle = 'black';
    ctx.font = `bold 300px ${fontFace}`;
    const iWidth = ctx.measureText('I').width;
    const iX = width / 2 - iWidth / 2 - heartSize / 1.5;
    ctx.fillText('I', iX, firstLineY);

    const heartX = iX + iWidth + heartSize / 1.5;
    const heartY = firstLineY - heartSize / 2;
    drawHeart(ctx, heartX, heartY, heartSize, heartSize);
    ctx.fillStyle = '#FF0000';
    ctx.fill();
    ctx.fillStyle = 'black';
    let fontSize = 280;
    ctx.font = `bold ${fontSize}px ${fontFace}`;
    const maxTextWidth = width * 0.9;
    
    while (ctx.measureText(name.toUpperCase()).width > maxTextWidth && fontSize > 40) {
        fontSize -= 10;
        ctx.font = `bold ${fontSize}px ${fontFace}`;
    }
    
    ctx.fillText(name.toUpperCase(), width / 2, height * 0.75);
    return canvas.toBuffer('image/jpeg');
}

const applicaEffettoCustom = async (m, conn, tipoEffetto, usedPrefix, command) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid?.[0] ? m.mentionedJid[0] : m.sender
    
    try {
        let nomeUtente, bufferImmagine
        
        if (m.quoted?.mtype === 'imageMessage') {
            bufferImmagine = await m.quoted.download()
            if (!bufferImmagine || bufferImmagine.length === 0) throw new Error('Impossibile scaricare l\'immagine quotata')
            nomeUtente = await conn.getName(m.quoted.sender) || 'Utente'
        } else {
            let pp = await conn.profilePictureUrl(who, 'image').catch(() => null)
            if (!pp) throw new Error('L\'utente non ha una foto profilo! Prova a mandare una foto e rispondere a quella.') 
            nomeUtente = await conn.getName(who) || 'Utente'
            let rispostaImmagine = await fetch(pp)
            if (!rispostaImmagine.ok) throw new Error(`Errore nel recupero della foto profilo`)
            bufferImmagine = Buffer.from(await rispostaImmagine.arrayBuffer())
        }

        let bufferFinale = await processaCanvasEffetti(bufferImmagine, tipoEffetto)
        let didascalia = `*\`${getCaption(tipoEffetto, nomeUtente)}\`*`

        let message = {
            image: bufferFinale,
            caption: didascalia,
            buttons: stickerButton,
            mentions: [who],
            contextInfo: global.fake?.contextInfo || {}
        };
        await conn.sendMessage(m.chat, message, { quoted: m });

    } catch (e) {
        console.error(e);
        await m.reply(`❌ Errore: ${e.message}`);
    }
}

async function processaCanvasEffetti(bufferImmagine, tipoEffetto) {
    let img = await loadImage(bufferImmagine)
    
    let maxSize = 800
    if (img.width > maxSize || img.height > maxSize) {
        let scala = Math.min(maxSize / img.width, maxSize / img.height)
        let canvasTemp = createCanvas(img.width * scala, img.height * scala)
        let ctxTemp = canvasTemp.getContext('2d')
        ctxTemp.drawImage(img, 0, 0, img.width * scala, img.height * scala)
        img = await loadImage(canvasTemp.toBuffer())
    }
    
    let canvas = createCanvas(img.width, img.height)
    let ctx = canvas.getContext('2d')
    
    ctx.drawImage(img, 0, 0)
    
    const colorigayz = {
        gay: ['#E40303', '#FF8C00', '#FFED00', '#008563', '#409CFF', '#955ABE'],
        sborra: ['#FFFFFF', '#E6F3FF', '#F0F8FF']
    }
    
    let colori = colorigayz[tipoEffetto]
    
    if (tipoEffetto === 'sborra') {
        ctx.shadowColor = '#FFFFFF'
        ctx.shadowBlur = 15
        let numeroGocce = Math.min(25, Math.floor((img.width * img.height) / 15000) + 12)
        for (let i = 0; i < numeroGocce; i++) {
            let x = gaussianRandom(img.width / 2, img.width / 3.5)
            let y = gaussianRandom(img.height / 2, img.height / 3.5)
            let dimensione = Math.random() * 40 + 20
            disegnaGoccia(ctx, x, y, dimensione, colori)
        }
    } else if (tipoEffetto === 'gay') {
        ctx.globalAlpha = 0.45
        let gradient = ctx.createLinearGradient(0, 0, 0, img.height)
        colori.forEach((colore, index) => {
            gradient.addColorStop(index / colori.length, colore)
            gradient.addColorStop((index + 1) / colori.length, colore)
        })
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, img.width, img.height)
        ctx.globalCompositeOperation = 'overlay'
        ctx.drawImage(img, 0, 0)
    }
    
    ctx.globalAlpha = 1.0
    ctx.shadowBlur = 0
    ctx.globalCompositeOperation = 'source-over'
    return canvas.toBuffer('image/jpeg')
}

function gaussianRandom(mean, sigma) {
    let u = Math.random()
    let v = Math.random()
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    return z * sigma + mean
}

function disegnaGoccia(ctx, x, y, dimensione, colori) {
    ctx.save()
    ctx.translate(x, y)
    
    let rotazione = (Math.random() - 0.5) * Math.PI / 3
    let scalaX = 1 + (Math.random() - 0.5) * 0.4
    let scalaY = 1 + (Math.random() - 0.5) * 0.4
    ctx.rotate(rotazione)
    ctx.scale(scalaX, scalaY)
    
    let raggioHalo = dimensione * 1.8
    let gradienteHalo = ctx.createRadialGradient(0, 0, dimensione * 0.3, 0, 0, raggioHalo)
    gradienteHalo.addColorStop(0, colori[0] + '99')
    gradienteHalo.addColorStop(0.5, colori[1] + '55')
    gradienteHalo.addColorStop(1, colori[0] + '00')
    ctx.globalAlpha = 0.4
    ctx.beginPath()
    ctx.arc(0, 0, raggioHalo, 0, Math.PI * 2)
    ctx.fillStyle = gradienteHalo
    ctx.fill()
    
    ctx.globalAlpha = 0.6
    ctx.beginPath()
    ctx.moveTo(0, -dimensione * 0.9)
    ctx.bezierCurveTo(dimensione * 0.7, -dimensione * 0.5, dimensione * 0.8, dimensione * 0.6, 0, dimensione * 0.9)
    ctx.bezierCurveTo(-dimensione * 0.8, dimensione * 0.6, -dimensione * 0.7, -dimensione * 0.5, 0, -dimensione * 0.9)
    ctx.closePath()
    
    let gradienteGoccia = ctx.createLinearGradient(0, -dimensione * 0.9, dimensione * 0.4, dimensione * 0.9)
    gradienteGoccia.addColorStop(0, colori[0] + 'FF')
    gradienteGoccia.addColorStop(0.5, colori[1] + 'DD')
    gradienteGoccia.addColorStop(1, colori[2] + 'BB')
    ctx.fillStyle = gradienteGoccia
    ctx.fill()
    
    ctx.globalAlpha = 0.5
    ctx.shadowBlur = 8
    ctx.restore()
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let rawCommand = command.toLowerCase();
    const effect = aliasMap[rawCommand] || rawCommand;
    await fs.mkdir('temp', { recursive: true }).catch(console.error);
    if (effect === 'napoli' || effect === 'forzanapoli') {
        let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
        let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg')
        
        try {
            let pfp = await Jimp.read(pp)
            let napolinapolinapoli = await Jimp.read('https://i.ibb.co/JWSwyKFK/napoli-varebot.jpg') // Gentilmente creata da giuse

            pfp.resize(800, 800)
            napolinapolinapoli.resize(800, 800)
            napolinapolinapoli.opacity(0.35)

            pfp.composite(napolinapolinapoli, 0, 0)
            let buffer = await pfp.getBufferAsync(Jimp.MIME_JPEG)
            let fraseNapoli = didascalie.napoli[Math.floor(Math.random() * didascalie.napoli.length)];
            
            await conn.sendMessage(m.chat, { 
                image: buffer,
                caption: `${fraseNapoli}`,
                buttons: stickerButton,
                contextInfo: global.fake?.contextInfo || {}
            }, { quoted: m })

        } catch (e) {
            console.error(e)
            m.reply("Errore nel trasformarti in napoletano. Forse sei troppo polentone.")
        }
        return
    }

    if (['il', 'ilove'].includes(effect)) {
        let name = '';
        if (m.mentionedJid && m.mentionedJid[0]) {
            name = await conn.getName(m.mentionedJid[0]);
        } else if (text) {
            name = text.trim();
        } else {
             name = await conn.getName(m.sender);
        }

        try {
            const imageBuffer = await createILoveImage(name || 'STOCAZZO');
            await conn.sendMessage(m.chat, {
                image: imageBuffer,
                caption: `> \`vare ✧ bot\``,
                buttons: stickerButton,
                contextInfo: global.fake?.contextInfo || {}
            }, { quoted: m });
        } catch (e) {
            console.error(e);
            await m.reply(`❌ Si è verificato un errore.`);
        }
        return
    }
    if (['gay', 'sborra'].includes(effect)) {
        await applicaEffettoCustom(m, conn, effect, usedPrefix, command);
        return
    }

    const config = effetti[effect];
    if (!config) return m.reply('🤕 Effetto non trovato o non supportato.');

    let who = m.quoted ? m.quoted.sender : m.mentionedJid?.[0] ? m.mentionedJid[0] : m.sender;
    let name = await conn.getName(who) || 'Coglione';
    
    let tempg;
    let tempw;

    try {
        let url;
        
        if (config.api === 'popcat') {
            url = new URL(config.path, apis.popcat);
        } else {
            url = new URL(config.path, apis.sra);
        }

        if (config.avatarParam || !config.avatarParam) {
            const pp = await conn.profilePictureUrl(who, 'image').catch(() => null);
            if (!pp) {
                const notification = who === m.sender ? 'non hai una foto profilo 🤕' : `@${who.split('@')[0]} non ha una foto profilo 🤕`;
                return m.reply(notification, null, { mentions: [who] });
            }
            url.searchParams.set(config.avatarParam || 'avatar', pp);
        }
        const res = await fetch(url.toString());
        if (!res.ok) {
            if (res.status === 404) throw new Error(`L'effetto "${effect}" sembra essere offline o rotto.`);
            throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }

        const buffer = await res.arrayBuffer();
        if (!buffer || buffer.byteLength < 100) throw new Error('Risposta API non valida o file corrotto.');
        const buf = Buffer.from(buffer);

        if (config.isGif) {
            const timestamp = Date.now();
            tempg = join('temp', `${timestamp}.gif`);
            tempw = join('temp', `${timestamp}.webp`);

            await fs.writeFile(tempg, buf);

            await new Promise((resolve, reject) => {
                ffmpeg(tempg)
                    .outputOptions([
                        '-vcodec', 'libwebp',
                        '-vf', `scale=512:512:force_original_aspect_ratio=decrease`,
                        '-loop', '0',
                        '-preset', 'default',
                        '-an',
                        '-vsync', '0'
                    ])
                    .toFormat('webp')
                    .save(tempw)
                    .on('end', resolve)
                    .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)));
            });

            const webpBuffer = await fs.readFile(tempw);
            await conn.sendMessage(m.chat, { sticker: webpBuffer }, { quoted: m });
        } else {
            const didascalia = getCaption(effect, name);

            await conn.sendMessage(m.chat, {
                image: buf,
                caption: didascalia,
                buttons: stickerButton,
                mentions: [who],
                contextInfo: global.fake?.contextInfo || {}
            }, { quoted: m });
        }

    } catch (e) {
        console.error(`Errore effetto ${effect}:`, e);
        m.reply(`⚠️ Non sono riuscito ad applicare l'effetto.\nMotivo: ${e.message}`);
    } finally {
        if (tempg) try { await fs.unlink(tempg); } catch (e) {}
        if (tempw) try { await fs.unlink(tempw); } catch (e) {}
    }
};

handler.help = [
    'wasted', 'wanted', 'triggered', 'jail', 
    'comunista', 'gay', 'passed', 'sottone', 'arrapato', 
    'polizia', 'drip', 'mnm', 'brucia',
    'gun', 'clown', 'sborra', 'napoli'
];
handler.tags = ['giochi'];
handler.command = /^(wanted|wasted|triggered|jail|comunista|gay|passed|simpcard|horny|lolice|bisex|love|heart|lesbian|lgbt|tonikawa|petpet|sborra|il|ilove|napoli|forzanapoli|gun|clown|drip|ad|mnm|burn|prigione|carcere|gabbio|sottone|arrapato|polizia|sbirri|ricercato|taglia|pistola|spara|pagliaccio|circo|stile|cioccolatino|brucia|fuoco|falò|arrabbiato|arcobaleno|vinto|fallito)$/i;

export default handler;