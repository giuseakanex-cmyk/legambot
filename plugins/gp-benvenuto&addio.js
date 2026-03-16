let handler = m => m

handler.before = async function (m, { conn, groupMetadata }) {
    if (!m.isGroup || !m.messageStubType) return true;

    const chat = global.db.data.chats[m.chat];
    if (!chat) return true;

    // 27 = Entrato | 28 = Rimosso | 32 = Uscito
    const isWelcome = m.messageStubType === 27;
    const isGoodbye = m.messageStubType === 28 || m.messageStubType === 32;

    if (!isWelcome && !isGoodbye) return true;
    if (isWelcome && !chat.welcome) return true;
    if (isGoodbye && !chat.goodbye) return true;

    const who = m.messageStubParameters[0];
    if (!who) return true;

    const cleanUserId = who.split('@')[0];
    const groupName = groupMetadata?.subject || 'Gruppo';
    const memberCount = groupMetadata?.participants?.length || 0;

    let pfpUrl;
    try {
        pfpUrl = await conn.profilePictureUrl(who, 'image');
    } catch (e) {
        pfpUrl = 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg'; 
    }

    const caption = isGoodbye
        ? `
「  *BYE BYE* 」
👤 *Utente:* @${cleanUserId}
👋🏻 *𝗛𝗮 𝗹𝗮𝘀𝗰𝗶𝗮𝘁𝗼 𝗹𝗮 𝗰𝗼𝗺𝗶𝘁𝗶𝘃𝗮:* ${groupName}
👥 *Membri attuali:* ${memberCount}
`.trim()
        : `
「  *BENVENUTO* 」
𝗔𝗼 𝗮𝘁𝘁𝗲𝗻𝘁𝗼 𝗰𝗵𝗲 𝗾𝘂𝗮 𝗱𝗲𝗻𝘁𝗿𝗼 𝗳𝗮𝗻𝗻𝗼 𝗮 𝗯𝗮𝗹𝗱𝗼𝗿𝗶𝗮 𝗳𝗿𝗮𝘁è
👤 *Utente:* @${cleanUserId}
🎉 *Gruppo:* ${groupName}
👥 *Membri:* ${memberCount}
`.trim();

    await conn.sendMessage(m.chat, { 
        image: { url: pfpUrl }, 
        caption: caption, 
        mentions: [who] 
    });

    return true;
}

export default handler;
