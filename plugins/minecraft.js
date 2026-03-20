let handler = async (m, { conn }) => {

    // 🔥 CONTESTO CANALE VIP (INFALLIBILE, ANTI-CRASH) 🔥
    let channelContext = {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363233544482011@newsletter', 
            serverMessageId: 100,
            newsletterName: `🎮 Minecraft Web`
        }
    };

    // Testo con estetica Legam OS
    let captionText = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· ⛏️ 𝐌𝐈𝐍𝐄𝐂𝐑𝐀𝐅𝐓 𝐖𝐄𝐁 ⛏️ ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🌐 』 𝐆𝐢𝐨𝐜𝐨: *Eaglercraft*
『 🔗 』 𝐋𝐢𝐧𝐤: https://eaglercraft.com/

╭── 🌟 𝐃𝐄𝐓𝐓𝐀𝐆𝐋𝐈 ──⬣
│ 🆓 Gratuito al 100%
│ 🔒 Sicuro e senza download
│ 💻 Gioca direttamente dal browser
╰───────────────⬣

👑 _Buon divertimento dal Legam OS!_
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    try {
        // Invia in un colpo solo Immagine + Testo VIP
        await conn.sendMessage(m.chat, {
            image: { url: 'https://i.imgur.com/JlxJmZQ.png' },
            caption: captionText,
            contextInfo: channelContext
        }, { quoted: m });

    } catch (error) {
        console.error('Errore caricamento immagine Minecraft:', error);
        // Fallback: se l'immagine fallisce, manda solo il testo elegante
        await conn.sendMessage(m.chat, { 
            text: captionText,
            contextInfo: channelContext 
        }, { quoted: m });
    }
}

handler.help = ['minecraft', 'mc'];
handler.tags = ['games'];
handler.command = /^(minecraft|mc|eaglercraft)$/i;
handler.group = true; // Se vuoi usarlo anche in privato, metti false

export default handler;

