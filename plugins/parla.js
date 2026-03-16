import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    let msg = `╭ ━━━ ❨ 🎤 𝐕𝐎𝐈𝐂𝐄 ❩ ━━━ ╮\n`;
    msg += `│ ✦ 𝐄𝐑𝐑𝐎𝐑𝐄: Cosa devo dire?\n`;
    msg += `│ ╰➤ Scrivi il testo dopo il comando.\n`;
    msg += `│ ✦ 𝐄𝐬𝐞𝐦𝐩𝐢𝐨: ${usedPrefix + command} Ciao a tutti, sono Giusebot!\n`;
    msg += `╰ ━━━━━━━━━━━━━ ╯`;
    return m.reply(msg);
  }

  if (text.length > 250) return m.reply('⚠️ *Testo troppo lungo!* Scrivi un messaggio più corto (max 250 caratteri).');

  try {
    // Il bot mette la reaction col microfono
    await conn.sendMessage(m.chat, { react: { text: "🎤", key: m.key } });

    // API di Google Translate
    let ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=it&client=tw-ob`;

    let res = await fetch(ttsUrl);
    if (!res.ok) throw new Error("Google ha bloccato la richiesta");
    
    let audioBuffer = Buffer.from(await res.arrayBuffer());

    // 🏆 IL FIX: Lo mandiamo come MP3 normale, così l'iPhone non fa i capricci!
    await conn.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg', // Torna al formato universale
        fileName: `voce_giusebot.mp3`,
        ptt: false // Falso! Così appare come il player audio che a te funziona perfettamente
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ _Ops, ho un po\' di mal di gola. Non riesco a parlare ora!_');
  }
};

handler.help = ['parla [testo]'];
handler.tags = ['fun'];
handler.command = /^(parla|dici|tts)$/i;

export default handler;
