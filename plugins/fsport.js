import fetch from 'node-fetch';

// Mappatura dei Feed RSS ufficiali (in tempo reale)
const sportFeeds = {
    'calcio': { nome: '⚽ Calcio', url: 'https://www.gazzetta.it/rss/calcio.xml' },
    'basket': { nome: '🏀 Basket', url: 'https://www.gazzetta.it/rss/basket.xml' },
    'tennis': { nome: '🎾 Tennis', url: 'https://www.gazzetta.it/rss/tennis.xml' },
    'motori': { nome: '🏎️ Motori (F1/MotoGP)', url: 'https://www.gazzetta.it/rss/motori.xml' },
    'ciclismo': { nome: '🚴‍♂️ Ciclismo', url: 'https://www.gazzetta.it/rss/ciclismo.xml' },
    'vari': { nome: '🥊 Sport Vari (MMA/Boxe)', url: 'https://www.gazzetta.it/rss/sport-vari.xml' }
};

let handler = async (m, { conn, usedPrefix, command, text }) => {
    
    // 🔥 CONTESTO CANALE VIP (INFALLIBILE, ANTI-CRASH) 🔥
    const getChannelContext = (title) => ({
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363233544482011@newsletter', 
            serverMessageId: 100,
            newsletterName: `📰 ${title}`
        }
    });

    let args = text ? text.trim().toLowerCase() : '';

    // Se l'utente non ha scritto nessuno sport, mostriamo il menu elegante
    if (!args || !sportFeeds[args]) {
        let menuText = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 📰 𝐋𝐄𝐆𝐀𝐌 𝐒𝐏𝐎𝐑𝐓𝐒 📰 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 💡 』 𝐒𝐜𝐞𝐠𝐥𝐢 𝐥𝐨 𝐬𝐩𝐨𝐫𝐭 𝐩𝐞𝐫 𝐥𝐞𝐠𝐠𝐞𝐫𝐞 𝐥𝐞 𝐮𝐥𝐭𝐢𝐦𝐢𝐬𝐬𝐢𝐦𝐞 𝐧𝐨𝐭𝐢𝐳𝐢𝐞 𝐢𝐧 𝐭𝐞𝐦𝐩𝐨 𝐫𝐞𝐚𝐥𝐞!

╭── 🏆 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐈𝐄 ──⬣
│ ⚽ ➭ \`${usedPrefix}${command} calcio\`
│ 🏀 ➭ \`${usedPrefix}${command} basket\`
│ 🎾 ➭ \`${usedPrefix}${command} tennis\`
│ 🏎️ ➭ \`${usedPrefix}${command} motori\`
│ 🚴‍♂️ ➭ \`${usedPrefix}${command} ciclismo\`
│ 🥊 ➭ \`${usedPrefix}${command} vari\`
╰───────────────⬣

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        return conn.sendMessage(m.chat, { 
            text: menuText, 
            contextInfo: getChannelContext('Edicola Sportiva') 
        }, { quoted: m });
    }

    // Se ha scelto uno sport valido, scarichiamo le notizie
    const loadingMsg = await conn.sendMessage(m.chat, { text: `_⏳ Recupero le ultime notizie di ${sportFeeds[args].nome}..._` }, { quoted: m });

    try {
        // Usiamo un convertitore RSS->JSON gratuito e veloce
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(sportFeeds[args].url)}`;
        let response = await fetch(apiUrl);
        let data = await response.json();

        if (data.status !== 'ok' || !data.items || data.items.length === 0) {
            throw new Error('Nessuna notizia trovata al momento.');
        }

        // Prendiamo le prime 5 notizie
        let topNews = data.items.slice(0, 5);
        
        let newsText = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🗞️ 𝐔𝐋𝐓𝐈𝐌'𝐎𝐑𝐀 🗞️ ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🏆 』 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐚: *${sportFeeds[args].nome}*

╭── 📰 𝐓𝐎𝐏 𝟓 𝐍𝐄𝐖𝐒 ──⬣\n`;

        // Formattiamo ogni singola notizia
        topNews.forEach((item, index) => {
            let titolo = item.title.replace(/<[^>]*>?/gm, ''); // Pulisce eventuali tag HTML
            let link = item.link;
            newsText += `│ *${index + 1}.* ${titolo}\n│ 🔗 _${link}_\n│\n`;
        });

        newsText += `╰───────────────⬣\n\n👑 _Fonte: Gazzetta dello Sport_\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;

        // Inviamo il giornale con la grafica VIP, sostituendo il messaggio di caricamento
        await conn.sendMessage(m.chat, { 
            text: newsText.trim(), 
            contextInfo: getChannelContext(`${sportFeeds[args].nome.split(' ')[1]} News`) 
        }, { quoted: m });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { 
            text: `『 ❌ 』 \`Errore:\` Impossibile recuperare le notizie per questo sport in questo momento.\n_Dettaglio: ${error.message}_` 
        }, { quoted: m });
    }
};

handler.help = ['fsport <categoria>'];
handler.tags = ['notizie'];
handler.command = /^(fsport|sport|notizie|news)$/i;
handler.group = true; // Impostalo su false se vuoi usarlo anche in privato

export default handler;

