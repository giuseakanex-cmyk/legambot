let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!m.isGroup) return m.reply('『 ⚠️ 』 \`Questo comando funziona solo nei gruppi.\`');

    // Reazione di caricamento
    await conn.sendMessage(m.chat, { react: { text: '🛡️', key: m.key } });

    const users = global.db.data.users || {};

    // Cerca gli utenti che sono segnati come "Premium/Mod" nel database di questo gruppo
    const mods = Object.entries(users)
        .filter(([jid, user]) => user && user.premium === true && user.premiumGroup === m.chat)
        .map(([jid]) => jid);

    if (mods.length === 0) {
        return m.reply('『 🛑 』 \`Nessun membro dello Staff / Prescelto rilevato in questo gruppo.\`');
    }

    // Se l'admin inserisce un messaggio, lo formatta in modo elegante
    let customMsg = text ? `\n『 📣 』 𝐂 𝐎 𝐌 𝐔 𝐍 𝐈 𝐂 𝐀 𝐙 𝐈 𝐎 𝐍 𝐄\n➤ ${text}\n` : '';

    let caption = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 𝐋 𝐄 𝐆 𝐀 𝐌  𝐒 𝐓 𝐀 𝐅 𝐅 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
${customMsg}
『 🛡️ 』 𝐈  𝐏 𝐑 𝐄 𝐒 𝐂 𝐄 𝐋 𝐓 𝐈
· 𝐌𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫𝐢 𝐀𝐭𝐭𝐢𝐯𝐢 ➻ ${mods.length}

`.trim() + '\n\n';

    // Aggiunge la lista dei Mod in colonna
    mods.forEach((jid, i) => {
        caption += `➤ ${i + 1}. @${jid.split('@')[0]}\n`;
    });

    caption += `\n👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;

    // Invia con l'estetica Premium del Legam OS
    await conn.sendMessage(m.chat, {
        text: caption.trim(),
        mentions: mods,
        contextInfo: {
            mentionedJid: mods,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363233544482011@newsletter',
                newsletterName: "🛡️ 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐒𝐭𝐚𝐟𝐟",
                serverMessageId: 100
            }
        }
    }, { quoted: m });
};

handler.help = ['modlist (messaggio)'];
handler.tags = ['gruppo'];
// Ho aggiunto anche il comando .staff per comodità!
handler.command = /^(modlist|staff)$/i;
handler.group = true;
handler.admin = true;

export default handler;

