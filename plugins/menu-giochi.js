let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    // Reazione di caricamento
    await conn.sendMessage(m.chat, { react: { text: '🎮', key: m.key } });
    
    // Filtra tutti i plugin che hanno 'giochi' tra i tags
    const giochiList = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled && plugin.tags && plugin.tags.includes('giochi'))
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        prefix: 'customPrefix' in plugin
      }));

    // Costruzione dell'estetica Legam OS (Solo testo)
    let textMenu = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 𝐋 𝐄 𝐆 𝐀 𝐌  𝐀 𝐑 𝐂 𝐀 𝐃 𝐄 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🎮 』 𝐋 𝐈 𝐒 𝐓 𝐀  𝐆 𝐈 𝐎 𝐂 𝐇 𝐈\n\n`;

    // Aggiunge i comandi alla lista dinamicamente
    giochiList.forEach(menu => {
      menu.help.forEach(cmd => {
        if (cmd) {
            textMenu += `· ${menu.prefix ? cmd : _p + cmd}\n`;
        }
      });
    });

    textMenu += `\n👑 𝐎𝐖𝐍𝐄𝐑\n➤ 𝐆𝐈𝐔𝐒𝚵\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;

    // Invia il messaggio SOLO TESTO con il Fake Channel
    await conn.sendMessage(m.chat, {
      text: textMenu.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363233544482011@newsletter",
          newsletterName: "✨.✦★彡 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐀𝐫𝐜𝐚𝐝𝐞 Ξ★✦.•",
          serverMessageId: 100
        }
      }
    }, { quoted: m });

  } catch (e) {
    console.error('Errore nel menu giochi:', e);
    m.reply('❌ `Errore nella generazione del menu Arcade.`');
  }
};

handler.help = ['menugiochi'];
handler.tags = ['menu'];
handler.command = /^(menugiochi|menugame|giochi|games)$/i;

export default handler;


