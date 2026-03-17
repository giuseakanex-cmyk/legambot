let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    // Reazione di caricamento
    await conn.sendMessage(m.chat, { react: { text: '👥', key: m.key } });
    
    // Filtra tutti i plugin che hanno 'gruppo' tra i tags
    const gruppoList = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled && plugin.tags && plugin.tags.includes('gruppo'))
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        prefix: 'customPrefix' in plugin
      }));

    // Costruzione dell'estetica Legam OS
    let textMenu = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 𝐋 𝐄 𝐆 𝐀 𝐌  𝐆 𝐑 𝐎 𝐔 𝐏 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🛡️ 』 𝐌 𝐄 𝐍 𝐔  𝐆 𝐑 𝐔 𝐏 𝐏 𝐎\n\n`;

    // Aggiunge i comandi alla lista dinamicamente
    gruppoList.forEach(menu => {
      menu.help.forEach(cmd => {
        if (cmd) {
            textMenu += `· ${menu.prefix ? cmd : _p + cmd}\n`;
        }
      });
    });

    textMenu += `\n👑 𝐎𝐖𝐍𝐄𝐑\n➤ 𝐆𝐈𝐔𝐒𝚵\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;

    // Invia il video/gif con la grafica premium Legam OS
    await conn.sendMessage(m.chat, {
      video: { url: './media/menu/menu3.mp4' },
      caption: textMenu.trim(),
      gifPlayback: true, // Lo fa riprodurre in loop silenzioso come una GIF
      gifAttribution: 2,
      mimetype: 'video/mp4',
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363233544482011@newsletter",
          newsletterName: "✨.✦★彡 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐀𝐝𝐦𝐢𝐧 Ξ★✦.•",
          serverMessageId: 100
        }
      }
    }, { quoted: m });

  } catch (e) {
    console.error('Errore nel menu gruppo:', e);
    m.reply('❌ `Errore nella generazione del menu gruppo. Assicurati che il file video esista.`');
  }
};

handler.help = ['menugruppo'];
handler.tags = ['menu'];
// Risponde a più comandi per comodità
handler.command = /^(menugruppo|menugp|menuadmin|gruppo|group)$/i;

export default handler;

