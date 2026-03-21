import fetch from "node-fetch";
import yts from 'yt-search';
import axios from "axios";

const formatAudio = ['mp3', 'm4a', 'webm', 'acc', 'flac', 'opus', 'ogg', 'wav'];
const formatVideo = ['360', '480', '720', '1080'];
const MAX_DURATION = 600;

global.APIs = {
  xyro: { url: "https://xyro.site", key: null },
  yupra: { url: "https://api.yupra.my.id", key: null },
  vreden: { url: "https://api.vreden.web.id", key: null },
  delirius: { url: "https://api.delirius.store", key: null },
  zenzxz: { url: "https://api.zenzxz.my.id", key: null },
  siputzx: { url: "https://api.siputzx.my.id", key: null }
};

async function fetchFromApis(apis) {
  for (const { api, endpoint, extractor } of apis) {
    try {
      const res = await fetch(endpoint, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const json = await res.json();
      const url = extractor(json);
      if (url) {
        return { api, url };
      }
    } catch (e) {}
  }
  throw new Error(`
꒰🩸꒱ ◦•≫ 𝐄𝐑𝐑𝐎𝐑𝐄
 ★・・・・・・・★
  𝐍𝐞𝐬𝐬𝐮𝐧 𝐥𝐢𝐧𝐤 𝐯𝐚𝐥𝐢𝐝𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨!
 ★・・・・・・・★
`);
}

async function getAud(url) {
  const apis = [
    { api: 'Xyro', endpoint: `${global.APIs.xyro.url}/download/youtubemp3?url=${encodeURIComponent(url)}`, extractor: res => res.result?.dl },
    { api: 'Yupra', endpoint: `${global.APIs.yupra.url}/api/downloader/ytmp3?url=${encodeURIComponent(url)}`, extractor: res => res.resultado?.enlace },
    { api: 'Vreden', endpoint: `${global.APIs.vreden.url}/api/ytmp3?url=${encodeURIComponent(url)}`, extractor: res => res.result?.download?.url },
    { api: 'Delirius', endpoint: `${global.APIs.delirius.url}/download/ymp3?url=${encodeURIComponent(url)}`, extractor: res => res.data?.download?.url },
    { api: 'ZenzzXD', endpoint: `${global.APIs.zenzxz.url}/downloader/ytmp3?url=${encodeURIComponent(url)}`, extractor: res => res.download_url },
    { api: 'ZenzzXD v2', endpoint: `${global.APIs.zenzxz.url}/downloader/ytmp3v2?url=${encodeURIComponent(url)}`, extractor: res => res.download_url }
  ];
  return await fetchFromApis(apis);
}

async function getVid(url) {
  const apis = [
    { api: 'Xyro', endpoint: `${global.APIs.xyro.url}/download/youtubemp4?url=${encodeURIComponent(url)}&quality=360`, extractor: res => res.result?.dl },
    { api: 'Yupra', endpoint: `${global.APIs.yupra.url}/api/downloader/ytmp4?url=${encodeURIComponent(url)}`, extractor: res => res.resultado?.formatos?.[0]?.url },
    { api: 'Vreden', endpoint: `${global.APIs.vreden.url}/api/ytmp4?url=${encodeURIComponent(url)}`, extractor: res => res.result?.download?.url },
    { api: 'Delirius', endpoint: `${global.APIs.delirius.url}/download/ytmp4?url=${encodeURIComponent(url)}`, extractor: res => res.data?.download?.url },
    { api: 'ZenzzXD', endpoint: `${global.APIs.zenzxz.url}/downloader/ytmp4?url=${encodeURIComponent(url)}`, extractor: res => res.download_url },
    { api: 'ZenzzXD v2', endpoint: `${global.APIs.zenzxz.url}/downloader/ytmp4v2?url=${encodeURIComponent(url)}`, extractor: res => res.download_url }
  ];
  return await fetchFromApis(apis);
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text.trim()) {
      await conn.sendMessage(m.chat, {
        text: `
╭﹕₊˚ ★ ⁺˳ꕤ₊⁺・꒱
  ━━✫ ❗ 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐢𝐥 𝐭𝐢𝐭𝐨𝐥𝐨 𝐨 𝐢𝐥 𝐥𝐢𝐧𝐤
╰﹕₊˚ ★ ⁺˳ꕤ₊⁺・꒱
`,
        contextInfo: {
          forwardingScore: 99,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420674060561@newsletter',
            serverMessageId: '',
            newsletterName: `${nomebot}`
          }
        }
      }, { quoted: m });
      return;
    }

    if (command === 'playaudio' || command === 'playvideo') {
      const search = await yts(text);
      if (!search.all.length) {
        await conn.sendMessage(m.chat, {
          text: `
╭﹕₊˚ ★ ⁺˳ꕤ₊⁺・꒱
  ━━✫ ❗ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚𝐭𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨
╰﹕₊˚ ★ ⁺˳ꕤ₊⁺・꒱
`,
          contextInfo: {
            forwardingScore: 99,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363420674060561@newsletter',
              serverMessageId: '',
              newsletterName: `${nomebot}`
            }
          }
        }, { quoted: m });
        return;
      }
      const videoInfo = search.all[0];
      const { url, title, thumbnail } = videoInfo;
      const thumb = (await conn.getFile(thumbnail))?.data;

      if (command === 'playaudio') {
        await conn.sendMessage(m.chat, { 
          text: `
┊ ┊ ┊ ┊‿ ˚➶ ｡˚
┊ ┊ ┊ ┊. ➶ ˚
┊ ┊ ┊ ˚✧ 🎵 𝐀𝐮𝐝𝐢𝐨 𝐢𝐧 𝐚𝐫𝐫𝐢𝐯𝐨
┊ ˚➶ ｡˚ ☁︎ 𝐀𝐭𝐭𝐞𝐧𝐝𝐢 𝐪𝐮𝐚𝐥𝐜𝐡𝐞 𝐢𝐬𝐭𝐚𝐧𝐭𝐞...
` 
        }, { quoted: m });
        const { url: downloadUrl } = await getAud(url);
        await conn.sendMessage(m.chat, {
          audio: { url: downloadUrl },
          mimetype: "audio/mpeg",
          contextInfo: {
            forwardingScore: 99,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363420674060561@newsletter',
              serverMessageId: '',
              newsletterName: `${nomebot}`
            }
          }
        }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, { 
          text: `
┊ ┊ ┊ ┊‿ ˚➶ ｡˚
┊ ┊ ┊ ┊. ➶ ˚
┊ ┊ ┊ ˚✧ 🎬 𝐕𝐢𝐝𝐞𝐨 𝐢𝐧 𝐚𝐫𝐫𝐢𝐯𝐨
┊ ˚➶ ｡˚ ☁︎ 𝐀𝐭𝐭𝐞𝐧𝐝𝐢 𝐪𝐮𝐚𝐥𝐜𝐡𝐞 𝐢𝐬𝐭𝐚𝐧𝐭𝐞...
` 
        }, { quoted: m });
        const { url: downloadUrl } = await getVid(url);
        if (downloadUrl) {
          return await conn.sendMessage(m.chat, {
  video: { url: downloadUrl },
  fileName: `${title}.mp4`,
  mimetype: 'video/mp4',
  caption: '✅ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐨!',
  thumbnail: thumb,
  buttons: [
    { 
      buttonId: ".tomp3", 
      buttonText: { displayText: "🎵 𝐀𝐮𝐝𝐢𝐨" }, 
      type: 1 
    }
  ],
  headerType: 4,
  contextInfo: {
    forwardingScore: 99,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363420674060561@newsletter',
      serverMessageId: '',
      newsletterName: `${nomebot}`
    }
  }
}, { quoted: m });
        }
      }
      return;
    }

    if (command === 'play') {
      const search = await yts(text);
      if (!search.all.length) {
        await conn.sendMessage(m.chat, {
          text: `
╭﹕₊˚ ★ ⁺˳ꕤ₊⁺・꒱
  ━━✫ ❗ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚𝐭𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨
╰﹕₊˚ ★ ⁺˳ꕤ₊⁺・꒱
`,
          contextInfo: {
            forwardingScore: 99,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363420674060561@newsletter',
              serverMessageId: '',
              newsletterName: `${nomebot}`
            }
          }
        }, { quoted: m });
        return;
      }

      const videoInfo = search.all[0];
      const durationInSeconds = videoInfo.seconds;
      if (durationInSeconds > MAX_DURATION) {
        return await conn.sendMessage(m.chat, {
          text: `
╭★────★────★────★────★────★
|ㅤㅤㅤㅤㅤㅤㅤ꒰¡𝐕𝐈𝐃𝐄𝐎 𝐓𝐑𝐎𝐏𝐏𝐎 𝐋𝐔𝐍𝐆𝐎!꒱
|˚₊꒷ ⏳ ꒱ ฅ﹕𝐌𝐚𝐬𝐬𝐢𝐦𝐨: 𝟓 𝐌𝐢𝐧𝐮𝐭𝐢 ₊˚๑
|˚₊꒷ ⌛ ꒱ ฅ﹕Durata: ${videoInfo.timestamp} ₊˚๑
╰★────★────★────★────★────★
`,
          contextInfo: {
            forwardingScore: 99,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363420674060561@newsletter',
              serverMessageId: '',
              newsletterName: `${nomebot}`
            }
          }
        }, { quoted: m });
      }

      const { title, thumbnail, timestamp, views, ago, url, author } = videoInfo;
      const formattedViews = new Intl.NumberFormat().format(views);
      const infoMessage = `
⋆ ︵︵ ★ 🎥 𝐈𝐍𝐅𝐎 𝐕𝐈𝐃𝐄𝐎 🎥 ★ ︵︵ ⋆

꒷꒦ ✦ ୧・︶ : ︶ ꒷꒦ ‧₊ ୧
୧ ✍️ *𝐓𝐢𝐭𝐨𝐥𝐨:* ${title}
୧ ⏳ *𝐃𝐮𝐫𝐚𝐭𝐚:* ${timestamp}
୧ 👀 *𝐕𝐢𝐬𝐮𝐚𝐥𝐢𝐳𝐳𝐚𝐳𝐢𝐨𝐧𝐢:* ${formattedViews}
୧ 🔰 *𝐂𝐚𝐧𝐚𝐥𝐞:* ${author?.name || "Sconosciuto"}
୧ 🔳 *𝐏𝐮𝐛𝐛𝐥𝐨𝐜𝐚𝐭𝐨:* ${ago}
୧ 🔗 *𝐋𝐢𝐧𝐤:* ${url}
꒷꒦ ✦ ୧・︶ : ︶ ꒷꒦ ‧₊ ୧

╰♡꒷ ๑ ⋆˚₊⋆───ʚ˚ɞ───⋆˚₊⋆ ๑ ⪩
  > 𝐒𝐜𝐞𝐠𝐥𝐢 𝐮𝐧 𝐟𝐨𝐫𝐦𝐚𝐭𝐨
╰♡꒷ ๑ ⋆˚₊⋆───ʚ˚ɞ───⋆˚₊⋆ ๑ ⪩
`;

      const thumb = (await conn.getFile(thumbnail))?.data;

      await conn.sendMessage(m.chat, {
        text: infoMessage,
        footer: 'Scegli un formato:',
        buttons: [
          { buttonId: `${usedPrefix}playaudio ${title}`, buttonText: { displayText: "🎵 𝐀𝐮𝐝𝐢𝐨" }, type: 1 },
          { buttonId: `${usedPrefix}playvideo ${title}`, buttonText: { displayText: "🎬 𝐕𝐢𝐝𝐞𝐨" }, type: 1 },
          { buttonId: `${usedPrefix}salva ${title}`, buttonText: { displayText: "💾 𝐒𝐚𝐥𝐯𝐚 𝐢𝐧 𝐩𝐥𝐚𝐲𝐥𝐢𝐬𝐭" }, type: 1 }
        ],
        viewOnce: true,
        headerType: 4,
        contextInfo: {
          forwardingScore: 99,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420674060561@newsletter',
            serverMessageId: '',
            newsletterName: `${nomebot}`
          },
          externalAdReply: {
            mediaType: 1,
            previewType: 0,
            mediaUrl: url,
            sourceUrl: url,
            thumbnail: thumb,
          }
        }
      }, { quoted: m });
      return;
    }

  } catch (error) {
    await conn.sendMessage(m.chat, {
      text: error.message.startsWith('꒰🩸꒱') ? error.message : `
꒰🩸꒱ ◦•≫ 𝐄𝐑𝐑𝐎𝐑𝐄
 ★・・・・・・・★
  ${error.message}
 ★・・・・・・・★
`,
      contextInfo: {
        forwardingScore: 99,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363420674060561@newsletter',
          serverMessageId: '',
          newsletterName: `${nomebot}`
        }
      }
    }, { quoted: m });
  }
};

handler.command = handler.help = ['play', 'playaudio', 'playvideo', 'ytmp4', 'play2'];
handler.tags = ['downloader'];

export default handler;