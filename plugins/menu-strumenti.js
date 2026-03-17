let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    // Reazione di caricamento
    await conn.sendMessage(m.chat, { react: { text: '🛠️', key: m.key } });
    
    // Filtra tutti i plugin che hanno 'strumenti' tra i tags
    const strumentiList = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled && plugin.tags && plugin.tags.includes('strumenti'))
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        prefix: 'customPrefix' in plugin
      }));

    // Costruzione dell'estetica Legam OS
    let textMenu = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 𝐋 𝐄 𝐆 𝐀 𝐌  𝐓 𝐎 𝐎 𝐋 𝐒 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🛠️ 』 𝐌 𝐄 𝐍 𝐔  𝐒 𝐓 𝐑 𝐔 𝐌 𝐄 𝐍 𝐓 𝐈\n\n`;

    // Aggiunge i comandi alla lista dinamicamente
    strumentiList.forEach(menu => {
      menu.help.forEach(cmd => {
        if (cmd) {
            textMenu += `· ${menu.prefix ? cmd : _p + cmd}\n`;
        }
      });
    });

    textMenu += `\n👑 𝐎𝐖𝐍𝐄𝐑\n➤ 𝐆𝐈𝐔𝐒𝚵\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;

    // Invia il video/gif con la grafica premium Legam OS
    await conn.sendMessage(m.chat, {
      video: { url: './media/menu/menu5.mp4' },
      caption: textMenu.trim(),
      gifPlayback: true, // Lo fa riprodurre in loop come una GIF
      gifAttribution: 2,
      mimetype: 'video/mp4',
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363233544482011@newsletter",
          newsletterName: "✨.✦★彡 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐓𝐨𝐨𝐥𝐬 Ξ★✦.•",
          serverMessageId: 100
        }
      }
    }, { quoted: m });

  } catch (e) {
    console.error('Errore nel menu strumenti:', e);
    m.reply('❌ `Errore nella generazione del menu strumenti. Assicurati che il file video esista.`');
  }
};

handler.help = ['menustrumenti'];
handler.tags = ['menu'];
// Risponde a più comandi per comodità (es. .tools)
handler.command = /^(menustrumenti|menutools|strumenti|tools)$/i;

export default handler;

