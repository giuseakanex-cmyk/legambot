let handler = m => m

handler.before = async function (m, { conn }) {
    // Se non è un gruppo o non è un messaggio di sistema (StubType), ignora
    if (!m.isGroup || !m.messageStubType) return true;

    const chat = global.db.data.chats[m.chat];
    if (!chat) return true;

    // 27 = Utente Aggiunto/Entrato | 28 = Rimosso | 32 = Uscito da solo
    const isWelcome = m.messageStubType === 27;
    const isGoodbye = m.messageStubType === 28 || m.messageStubType === 32;

    if (!isWelcome && !isGoodbye) return true;
    
    // ⚠️ CONTROLLO ATTIVAZIONE: Se i welcome/goodbye sono spenti nel db, fermati.
    // (Ricordati di scrivere .on welcome e .on goodbye nel gruppo per attivarli!)
    if (isWelcome && !chat.welcome) return true;
    if (isGoodbye && !chat.goodbye) return true;

    const who = m.messageStubParameters[0];
    if (!who) return true;

    const cleanUserId = who.split('@')[0];
    
    // 🔥 FIX METADATA: Recuperiamo i dati del gruppo in modo sicuro e forzato
    let groupMetadata = global.groupCache.get(m.chat) || await conn.groupMetadata(m.chat).catch(_ => null)
    const groupName = groupMetadata?.subject || 'Questo Gruppo';
    const memberCount = groupMetadata?.participants?.length || 'Sconosciuto';

    let pfpUrl;
    try {
        // Cerca la foto profilo in alta definizione dell'utente
        pfpUrl = await conn.profilePictureUrl(who, 'image');
    } catch (e) {
        // 🔥 FIX IMGBB: Se l'utente non ha la foto, usa questa immagine stabile su Catbox
        // (Un elegante avatar grigio di default, a prova di crash)
        pfpUrl = 'https://files.catbox.moe/57bmbv.jpg'; 
    }

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

    try {
        // Invia il messaggio con tag
        await conn.sendMessage(m.chat, { 
            image: { url: pfpUrl }, 
            caption: caption, 
            mentions: [who] 
        });
    } catch (e) {
        console.error("[LEGAM OS] Errore invio Welcome/Goodbye:", e);
    }

    return true;
}

export default handler;

