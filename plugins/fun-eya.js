let handler = async (m, { conn }) => {
    // Reazione per il comando .eya
    await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

    // Scheda VIP Legam OS
    const textMsg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
·   𝐋 𝐄 𝐆 𝐀 𝐌  𝐕 𝐈 𝐏   ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🌟 』 𝐔 𝐓 𝐄 𝐍 𝐓 𝐄  𝐒 𝐏 𝐄 𝐂 𝐈 𝐀 𝐋 𝐄
· 𝐍𝐨𝐦𝐞 ➻ Eya
· 𝐒𝐭𝐚𝐭𝐮𝐬 ➻ Amica d'oro 

"Una di quelle rare persone che porta 
sempre una bella energia nel gruppo. 
Intelligente, simpatica e super 
importante per l'Owner. Guai a chi la tocca,l'ultima volta per lei giuse ha svuotato 27 membri e capirete bene che sarebbe inutile fare una cosa del genere,eppure giuse grazie al suo bene inestimabile per eya lo fece."

👑 𝐎𝐖𝐍𝐄𝐑
➤ 𝐆𝐈𝐔𝐒𝚵

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    // Invia con la solita grafica premium
    await conn.reply(m.chat, textMsg, m, global.rcanal);
};

// =========================================================
// ASCOLTATORE PASSIVO: Scatta quando legge la parola "eya"
// =========================================================
handler.before = async function (m, { conn }) {
    if (!m.text) return;

    // Se il messaggio è un comando (inizia con . o !), ignora l'ascoltatore passivo
    if (m.text.startsWith('.') || m.text.startsWith('!')) return;

    // Cerca esattamente la parola "eya" (ignora maiuscole/minuscole)
    // Usiamo \b per assicurarci che sia la parola intera e non pezzi di altre parole
    if (/\beya\b/i.test(m.text)) {
        await conn.sendMessage(m.chat, { react: { text: '🫶', key: m.key } });
        await conn.reply(m.chat, "Ma Eya quella a cui vuoi un sacco di bene? 🥺💛", m);
    }
};

handler.help = ['eya'];
handler.tags = ['fun'];
handler.command = /^(eya)$/i;

export default handler;

