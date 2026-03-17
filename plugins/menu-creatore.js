let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    // Reazione di caricamento (La corona del Re)
    await conn.sendMessage(m.chat, { react: { text: '👑', key: m.key } });
    
    // Filtra tutti i plugin che hanno 'creatore' tra i tags
    const ownerList = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled && plugin.tags && plugin.tags.includes('creatore'))
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        prefix: 'customPrefix' in plugin
      }));

    // Costruzione dell'estetica Legam OS
    let textMenu = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐖 𝐍 𝐄 𝐑 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 👑 』 𝐌 𝐄 𝐍 𝐔  𝐂 𝐑 𝐄 𝐀 𝐓 𝐎 𝐑 𝐄\n\n`;

    // Aggiunge i comandi alla lista dinamicamente
    ownerList.forEach(menu => {
      menu.help.forEach(cmd => {
        if (cmd) {
            textMenu += `· ${menu.prefix ? cmd : _p + cmd}\n`;
        }
      });
    });

    textMenu += `\n👑 𝐎𝐖𝐍𝐄𝐑\n➤ 𝐆𝐈𝐔𝐒𝚵\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;

    // Invia il video/gif con la grafica premium Legam OS
    await conn.sendMessage(m.chat, {
      video: { url: './media/menu/menu6.mp4' },
      caption: textMenu.trim(),
      gifPlayback: true, // Lo fa riprodurre in loop silenzioso come una GIF
      gifAttribution: 2,
      mimetype: 'video/mp4',
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363233544482011@newsletter",
          newsletterName: "✨.✦★彡 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐀𝐮𝐭𝐡𝐨𝐫𝐢𝐭𝐲 Ξ★✦.•",
          serverMessageId: 100
        }
      }
    }, { quoted: m });

  } catch (e) {
    console.error('Errore nel menu creatore:', e);
    m.reply('❌ `Errore nella generazione del menu Owner. Assicurati che il file video esista.`');
  }
};

handler.help = ['menucreatore'];
handler.tags = ['menu'];
// Risponde a questi due comandi
handler.command = /^(menuowner|menucreatore)$/i;

export default handler;

