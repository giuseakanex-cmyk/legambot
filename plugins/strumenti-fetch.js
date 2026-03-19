import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuti di cache

let handler = async (m, { conn, usedPrefix, command, args, text }) => {
  const fullText = text.trim().toLowerCase();
  
  // 🔥 CONTESTO CANALE VIP (INFALLIBILE, ANTI-CRASH) 🔥
  const getChannelContext = (title) => ({
      mentionedJid: [m.sender],
      isForwarded: true,
      forwardingScore: 999,
      forwardedNewsletterMessageInfo: {
          newsletterJid: '120363233544482011@newsletter', 
          serverMessageId: 100,
          newsletterName: `🌐 ${title}`
      }
  });

  // ==========================================
  // 1. COMANDO HTML
  // ==========================================
  if (command === 'html' || fullText.startsWith(`${usedPrefix}html `)) {
    const url = args[0] || fullText.slice(usedPrefix.length + 5).trim();
    if (!url) return m.reply(`『 ⚠️ 』 \`Inserisci un URL!\`\n_Es: ${usedPrefix}html https://google.com_`);

    const loadingMsg = await conn.sendMessage(m.chat, { text: `_⏳ Scansione HTML in corso..._` }, { quoted: m });

    try {
      let urlFix = url.startsWith('http') ? url : 'https://' + url;
      const response = await fetch(urlFix, { headers: { 'User-Agent': 'LegamOS/1.0' }, timeout: 20000 });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      let htmlContent = await response.text();
      const maxLength = 4000;
      let truncated = htmlContent.length > maxLength;
      if (truncated) htmlContent = htmlContent.substring(0, maxLength) + '...';

      const domain = new URL(urlFix).hostname;
      
      let infoText = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 👨🏻‍💻 𝐂𝐎𝐃𝐈𝐂𝐄 𝐇𝐓𝐌𝐋 👨🏻‍💻 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🌐 』 𝐃𝐨𝐦𝐢𝐧𝐢𝐨: *${domain}*
『 🔗 』 𝐔𝐑𝐋: *${urlFix}*
${truncated ? '『 ⚠️ 』 _Contenuto troncato per limiti di spazio_\n' : ''}
\`\`\`html
${htmlContent}
\`\`\`
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

      await conn.sendMessage(m.chat, { text: infoText, contextInfo: getChannelContext('Scanner HTML') }, { quoted: m });
    } catch (error) {
      m.reply(`『 ❌ 』 \`Errore:\` Impossibile leggere il sito. (${error.message})`);
    }
    return;
  }

  // ==========================================
  // 2. COMANDO SEO
  // ==========================================
  if (command === 'seo' || fullText.startsWith(`${usedPrefix}seo `)) {
    const url = args[0] || fullText.slice(usedPrefix.length + 4).trim();
    if (!url) return m.reply(`『 ⚠️ 』 \`Inserisci un URL!\`\n_Es: ${usedPrefix}seo https://google.com_`);

    const loadingMsg = await conn.sendMessage(m.chat, { text: `_🔍 Analisi SEO in corso..._` }, { quoted: m });

    try {
      let urlFix = url.startsWith('http') ? url : 'https://' + url;
      const response = await fetch(urlFix, { headers: { 'User-Agent': 'LegamOS/1.0' }, timeout: 20000 });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const title = document.querySelector('title')?.textContent || 'Non trovato';
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || 'Non trovata';
      const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || 'Non trovati';
      const domain = new URL(urlFix).hostname;

      let seoText = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 📊 𝐀𝐍𝐀𝐋𝐈𝐒𝐈 𝐒𝐄𝐎 📊 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🌐 』 𝐃𝐨𝐦𝐢𝐧𝐢𝐨: *${domain}*
『 📝 』 𝐓𝐢𝐭𝐨𝐥𝐨: *${title}*
『 📜 』 𝐃𝐞𝐬𝐜𝐫𝐢𝐳𝐢𝐨𝐧𝐞: *${description}*
『 🔑 』 𝐊𝐞𝐲𝐰𝐨𝐫𝐝𝐬: *${keywords}*

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

      await conn.sendMessage(m.chat, { text: seoText, contextInfo: getChannelContext('Analisi SEO') }, { quoted: m });
    } catch (error) {
      m.reply(`『 ❌ 』 \`Errore SEO:\` ${error.message}`);
    }
    return;
  }

  // ==========================================
  // 3. COMANDO PDF
  // ==========================================
  if (command === 'pdf' || fullText.startsWith(`${usedPrefix}pdf `)) {
    const url = args[0] || fullText.slice(usedPrefix.length + 4).trim();
    if (!url) return m.reply(`『 ⚠️ 』 \`Inserisci un URL!\`\n_Es: ${usedPrefix}pdf https://google.com_`);

    const loadingMsg = await conn.sendMessage(m.chat, { text: `_📥 Generazione PDF in corso..._` }, { quoted: m });

    try {
      let urlFix = url.startsWith('http') ? url : 'https://' + url;
      const pdfApi = `https://api.pdfshift.io/v3/convert/pdf`;
      const response = await fetch(pdfApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: urlFix, sandbox: true }),
        timeout: 20000
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const pdfBuffer = await response.arrayBuffer();
      if (pdfBuffer.length < 1000) throw new Error('PDF generato non valido');

      const domain = new URL(urlFix).hostname;
      let captionText = `✦ 📄 *PDF Generato:* ${domain}\n✦ ⚖️ *Peso:* ${Math.round(pdfBuffer.byteLength / 1024)}KB`;

      await conn.sendMessage(m.chat, {
        document: Buffer.from(pdfBuffer),
        fileName: `${domain}.pdf`,
        mimetype: 'application/pdf',
        caption: captionText,
        contextInfo: getChannelContext('Web to PDF')
      }, { quoted: m });

    } catch (error) {
      m.reply(`『 ❌ 』 \`Errore PDF:\` Il sito potrebbe aver bloccato la conversione.`);
    }
    return;
  }

  // ==========================================
  // 4. COMANDO SCREENSHOT (Default)
  // ==========================================
  let url = args[0];
  if (!url) return m.reply(`『 ⚠️ 』 \`Inserisci un URL!\`\n_Es: ${usedPrefix}ss https://google.com_`);
  if (!url.startsWith('http')) url = 'https://' + url;

  try { new URL(url); } catch (e) { return m.reply(`『 ❌ 』 \`URL non valido.\``); }

  m.reply('_📸 Scatto la foto al sito..._');

  try {
    let screenshotBuffer;
    let success = false;
    let apis = [
        `https://image.thum.io/get/width/1200/crop/768/${encodeURIComponent(url)}`,
        `https://mini.s-shot.ru/1024x768/JPEG/1024/Z100/?${encodeURIComponent(url)}`,
        `https://webshot.deam.io/${encodeURIComponent(url)}/?width=1200&height=800`,
        `https://capture.heartrails.com/1200x800?${encodeURIComponent(url)}`
    ];

    // Prova le API a cascata finché una non funziona
    for (let api of apis) {
        try {
            let res = await fetch(api, { timeout: 15000 });
            if (res.ok) {
                screenshotBuffer = await res.arrayBuffer();
                if (screenshotBuffer.byteLength > 1000) {
                    success = true;
                    break;
                }
            }
        } catch (e) { continue; }
    }

    if (!success) throw new Error("Tutte le API hanno fallito.");

    const domain = new URL(url).hostname;
    let captionText = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 📸 𝐖𝐄𝐁 𝐒𝐂𝐑𝐄𝐄𝐍𝐒𝐇𝐎𝐓 📸 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🌐 』 𝐃𝐨𝐦𝐢𝐧𝐢𝐨: *${domain}*
『 🔗 』 𝐔𝐑𝐋: *${url}*

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    await conn.sendMessage(m.chat, {
      image: Buffer.from(screenshotBuffer),
      caption: captionText,
      contextInfo: getChannelContext('Web Screenshot')
    }, { quoted: m });

  } catch (error) {
    m.reply(`『 ❌ 』 \`Errore Screenshot:\` Sito bloccato o irraggiungibile.`);
  }
};

handler.help = ['ss <url>', 'html <url>', 'seo <url>', 'pdf <url>'];
handler.tags = ['tools'];
handler.command = /^(fetch|screenshot|ss|web|html|refresh|seo|pdf)$/i;

export default handler

