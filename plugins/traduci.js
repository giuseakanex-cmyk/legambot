import fetch from 'node-fetch';

const languages = {
    'it': 'Italiano 🇮🇹', 'en': 'Inglese 🇬🇧', 'es': 'Spagnolo 🇪🇸', 'fr': 'Francese 🇫🇷',
    'de': 'Tedesco 🇩🇪', 'pt': 'Portoghese 🇵🇹', 'ru': 'Russo 🇷🇺', 'ja': 'Giapponese 🇯🇵',
    'ko': 'Coreano 🇰🇷', 'zh': 'Cinese 🇨🇳', 'ar': 'Arabo 🇸🇦', 'hi': 'Hindi 🇮🇳',
    'nl': 'Olandese 🇳🇱', 'pl': 'Polacco 🇵🇱', 'tr': 'Turco 🇹🇷', 'uk': 'Ucraino 🇺🇦'
};

const max = 5000;
const maxtts = 200;

const splitText = (text, maxLength) => {
    if (text.length <= maxLength) return [text];
    const chunks = [];
    let current = '';
    const sentences = text.split(/[.!?]+/);
    for (const sentence of sentences) {
        if ((current + sentence).length <= maxLength) {
            current += sentence + '.';
        } else {
            if (current) chunks.push(current.trim());
            current = sentence + '.';
        }
    }
    if (current) chunks.push(current.trim());
    return chunks;
};

const generateTTS = async (text, lang, conn, m) => {
    try {
        const cleanText = text.replace(/[^\w\s.,!?àèìòùáéíóúäëïöüñç]/gi, '').trim();
        if (!cleanText) throw new Error('Testo vuoto');
        const audioText = cleanText.length > maxtts ? cleanText.substring(0, maxtts) : cleanText;
        
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(audioText)}&tl=${lang}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (!response.ok) throw new Error('TTS Fallito');
        const buf = Buffer.from(await response.arrayBuffer());

        await conn.sendMessage(m.chat, {
            audio: buf,
            mimetype: 'audio/mpeg',
            ptt: true,
        }, { quoted: m });

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

const handler = async (m, { conn, args, usedPrefix, command }) => {
    // LAYOUT AIUTO ESTETICO
    const helpMsg = `
⊹ ࣪ ˖ ✦ ━━ 𝐓 𝐑 𝐀 𝐃 𝐔 𝐓 𝐓 𝐎 𝐑 𝐄 ━━ ✦ ˖ ࣪ ⊹

⋆ 𝐄𝐬𝐞𝐦𝐩𝐢𝐨 ➻ ${usedPrefix + command} en Ciao
⋆ 𝐏𝐚𝐫𝐥𝐚 ➻ ${usedPrefix}parla it Come stai?

⟡ 𝐋𝐢𝐧𝐠𝐮𝐞 𝐏𝐫𝐢𝐧𝐜𝐢𝐩𝐚𝐥𝐢:
${Object.entries(languages).slice(0, 8).map(([code, name]) => `  ⇝ *${code}*: ${name}`).join('\n')}

👑 𝐎𝐖𝐍𝐄𝐑 ⤏ 𝐆𝐈𝐔𝐒𝚵
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    if (command === 'ascolta_originale' || command === 'ascolta_traduzione') {
        const lang = args[0];
        const text = args.slice(1).join(' ');
        if (!text || !lang) return;
        await m.react('🔊');
        await generateTTS(text, lang, conn, m);
        return;
    }

    if (!args[0] && !m.quoted?.text) return m.reply(helpMsg);

    let targetLang = 'it';
    let text = args.join(' ');
    let audioOnly = /^(parla|say)$/i.test(command);

    if (languages[args[0]?.toLowerCase()]) {
        targetLang = args[0].toLowerCase();
        text = args.slice(1).join(' ');
    }

    if (!text && m.quoted?.text) text = m.quoted.text;
    if (!text) return m.reply('⟡ _Inserisci un testo da tradurre_');

    await m.react('⌛');

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const json = await res.json();
        
        const fullTranslation = json[0].map(item => item[0]).join('');
        const detectedLang = json[2];

        await m.react('✅');

        if (audioOnly) {
            await generateTTS(fullTranslation, targetLang, conn, m);
        } else {
            const txtRes = `
⊹ ࣪ ˖ ✦ ━━ 𝐋 𝐄 𝐆 𝐀 𝐌  𝐓 𝐑 ━━ ✦ ˖ ࣪ ⊹

⋆ 𝐃𝐚 ➻ ${detectedLang.toUpperCase()}
⋆ 𝐀 ➻ ${targetLang.toUpperCase()}

⟡ 𝐓𝐫𝐚𝐝𝐮𝐳𝐢𝐨𝐧𝐞:
${fullTranslation}

👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

            await conn.sendMessage(m.chat, {
                text: txtRes,
                footer: "𝑳𝑬𝑮𝑨𝑴 𝑩𝑶𝑻 𝑻𝑹𝑨𝑫𝑼𝑪𝑻𝑶𝑹",
                buttons: [
                    { buttonId: `.ascolta_traduzione ${targetLang} ${fullTranslation.substring(0, 50)}`, buttonText: { displayText: '🔊 Ascolta Traduzione' }, type: 1 },
                    { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '✧ Menu ✧' }, type: 1 }
                ],
                contextInfo: {
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363233544482011@newsletter',
                        newsletterName: "✨.✦★彡 Translate by Giuse Ξ★✦.•",
                        serverMessageId: 100
                    }
                }
            }, { quoted: m });
        }
    } catch (err) {
        m.react('❌');
        m.reply('⟡ _Errore durante la traduzione_');
    }
};

handler.help = ['tr [lingua] [testo]'];
handler.tags = ['util'];
handler.command = /^(traduttore|traduci|tr|parla|ascolta_originale|ascolta_traduzione)$/i;

export default handler;
