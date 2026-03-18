let handler = async (m, { conn, usedPrefix, command }) => {
    // Reazione elegante di sistema
    await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } });

    // Costruzione Grafica del Menu VIP
    let menuVip = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 𝐌 𝐄 𝐍 𝐔  𝐒 𝐏 𝐄 𝐂 𝐈 𝐀 𝐋 𝐄 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

Benvenuto nel Privé del *Legam OS*.
Qui risiedono i protocolli più esclusivi 
e divertenti del sistema.

『 🎰 』 𝐂 𝐀 𝐒 𝐈 𝐍 𝐎  &  𝐁 𝐄 𝐓
➤ *${usedPrefix}virtuali*
↳ Il botteghino della Serie A. Scommetti, vivi la telecronaca live e trema per il VAR.

➤ *${usedPrefix}crazytime* (o *${usedPrefix}ct*)
↳ La ruota della follia. 5 Round, Top Slot e bonus game esplosivi per sbancare il server.

『 🎯 』 𝐈 𝐍 𝐓 𝐄 𝐑 𝐀 𝐙 𝐈 𝐎 𝐍 𝐄
➤ *${usedPrefix}bounty*
↳ La caccia è aperta. Inserisci o riscuoti le taglie sulla testa degli altri membri.

➤ *${usedPrefix}parla* [testo]
↳ Prendi il controllo vocale. Fai pronunciare al sistema operativo qualsiasi frase tu voglia.

👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    // Invio con scheda Newsletter (Fake Channel)
    await conn.sendMessage(m.chat, { 
        text: menuVip,
        contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363233544482011@newsletter',
                newsletterName: "🌟 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐕𝐈𝐏 𝐋𝐨𝐮𝐧𝐠𝐞",
                serverMessageId: 100
            }
        }
    }, { quoted: m });
};

handler.help = ['menuspeciale'];
handler.tags = ['principale'];
// Puoi richiamarlo con .menuspeciale, .vip, o .special
handler.command = /^(menuspeciale|vip|special)$/i;

export default handler;

