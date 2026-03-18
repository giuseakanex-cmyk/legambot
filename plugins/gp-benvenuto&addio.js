let handler = m => m

handler.before = async function (m, { conn }) {
    // 1. Filtro: Se non è un gruppo o non è un messaggio di sistema, ignora
    if (!m.isGroup || !m.messageStubType) return true;

    const chat = global.db.data.chats[m.chat];
    if (!chat) return true;

    // 2. Definizione eventi: 
    // 27 = Entrato/Aggiunto
    // 28 = Rimosso da Admin
    // 32 = Uscito da solo
    const isWelcome = m.messageStubType === 27;
    const isGoodbye = m.messageStubType === 28 || m.messageStubType === 32;

    if (!isWelcome && !isGoodbye) return true;

    // 3. Controllo Database (Attivabili con .on welcome / .on goodbye)
    if (isWelcome && !chat.welcome) return true;
    if (isGoodbye && !chat.goodbye) return true;

    // 4. Recupero dell'utente coinvolto (StubParameters contiene lo JID dell'utente)
    const who = m.messageStubParameters[0];
    if (!who) return true;

    const cleanUserId = who.split('@')[0];
    
    // 5. Recupero Dati Gruppo
    let groupMetadata = global.groupCache.get(m.chat) || await conn.groupMetadata(m.chat).catch(_ => null)
    const groupName = groupMetadata?.subject || 'Questo Gruppo';
    const memberCount = groupMetadata?.participants?.length || 'N/A';

    // 6. Foto Profilo con Fallback Anti-Crash
    let pfpUrl;
    try {
        pfpUrl = await conn.profilePictureUrl(who, 'image');
    } catch (e) {
        pfpUrl = 'https://files.catbox.moe/57bmbv.jpg'; 
    }

    // 7. Preparazione Testo
    const caption = isGoodbye
        ? `「  *BYE BYE* 」
👤 *Utente:* @${cleanUserId}
👋🏻 *𝗛𝗮 𝗹𝗮𝘀𝗰𝗶𝗮𝘁𝗼 𝗹𝗮 𝗰𝗼𝗺𝗶𝘁𝗶𝘃𝗮:* ${groupName}
👥 *Membri attuali:* ${memberCount}`.trim()
        : `「  *BENVENUTO* 」
𝗔𝗼 𝗮𝘁𝘁𝗲𝗻𝘁𝗼 𝗰𝗵𝗲 𝗾𝘂𝗮 𝗱𝗲𝗻𝘁𝗿𝗼 𝗳𝗮𝗻𝗻𝗼 𝗮 𝗯𝗮𝗹𝗱𝗼𝗿𝗶𝗮 𝗳𝗿𝗮𝘁è
👤 *Utente:* @${cleanUserId}
🎉 *Gruppo:* ${groupName}
👥 *Membri:* ${memberCount}`.trim();

    // 8. Invio finale
    try {
        console.log(`[LEGAM OS] Rilevato ${isWelcome ? 'Welcome' : 'Goodbye'} per @${cleanUserId}`);
        await conn.sendMessage(m.chat, { 
            image: { url: pfpUrl }, 
            caption: caption, 
            mentions: [who] 
        });
    } catch (e) {
        console.error("[ERRORE WELCOME]", e);
    }

    return true;
}

export default handler;

