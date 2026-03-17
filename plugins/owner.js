let handler = async (m, { conn, usedPrefix }) => {
    // Reazione di rispetto per l'owner
    await conn.sendMessage(m.chat, { react: { text: '👑', key: m.key } });

    const ownerInstagram = "https://www.instagram.com/giuse0_9?igsh=dmhmczV2MHd5ZjJ0&utm_source=qr";
    
    const textMsg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
·  𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐖 𝐍 𝐄 𝐑  ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 👑 』 𝐈 𝐃 𝐄 𝐍 𝐓 𝐈 𝐓 𝐀̀
· 𝐍𝐨𝐦𝐞 ➻ 𝐆𝐈𝐔𝐒𝐄
· 𝐑𝐮𝐨𝐥𝐨 ➻ 𝐅𝐨𝐮𝐧𝐝𝐞𝐫 & 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫
· 𝐒𝐢𝐬𝐭𝐞𝐦𝐚 ➻ 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐂𝐨𝐫𝐞

『 🌐 』 𝐒 𝐎 𝐂 𝐈 𝐀 𝐋
· 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 ➻ @giuse0_9
· 𝐏𝐫𝐨𝐟𝐢𝐥𝐨 ➻ ${ownerInstagram}

『 ⚙️ 』 𝐒 𝐓 𝐀 𝐓 𝐔 𝐒
· 𝐃𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐢𝐭𝐚̀ ➻ 𝐎𝐧𝐥𝐢𝐧𝐞
· 𝐏𝐫𝐢𝐨𝐫𝐢𝐭𝐚̀ ➻ 𝐌𝐚𝐬𝐬𝐢𝐦𝐚

"𝑳'𝒂𝒓𝒄𝒉𝒊𝒕𝒆𝒕𝒕𝒐 𝒅𝒊𝒆𝒕𝒓𝒐 𝒍'𝒂𝒖𝒕𝒐𝒎𝒂𝒕𝒊𝒛𝒛𝒂𝒛𝒊𝒐𝒏𝒆. 
𝑶𝒈𝒏𝒊 𝒍𝒂𝒚𝒆𝒓 𝒅𝒆𝒍 𝒔𝒊𝒔𝒕𝒆𝒎𝒂 𝒆̀ 𝒔𝒕𝒂𝒕𝒐 𝒑𝒍𝒂𝒔𝒎𝒂𝒕𝒐 
𝒑𝒆𝒓 𝒍𝒐 𝒎𝒆𝒓𝒐 𝒔𝒄𝒐𝒑𝒐 𝒅𝒆𝒍𝒍𝒂 𝒑𝒆𝒓𝒇𝒆𝒛𝒊𝒐𝒏𝒆."

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    await conn.sendMessage(m.chat, {
        text: textMsg,
        contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363233544482011@newsletter',
                newsletterName: "✨.✦★彡 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐂𝐨𝐧𝐭𝐚𝐜𝐭𝐬 Ξ★✦.•",
                serverMessageId: 100
            },
            externalAdReply: {
                showAdAttribution: true,
                title: "𝐋 𝐄 𝐆 𝐀 𝐌   𝐎 𝐒   𝐀 𝐔 𝐓 𝐇 𝐎 𝐑",
                body: "Contatta lo sviluppatore Giuse",
                mediaType: 1,
                renderLargerThumbnail: true,
                thumbnailUrl: global.logoLegam, // Usa il logo impostato nel config
                sourceUrl: ownerInstagram
            }
        }
    }, { quoted: m });
}

handler.help = ['owner', 'creatore']
handler.tags = ['info']
handler.command = /^(owner|creatore|dev|sviluppatore)$/i

export default handler

