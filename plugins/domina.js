let handler = async (m, { conn, participants, isBotAdmin }) => {
    if (!m.isGroup) return;

    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    if (!isBotAdmin) return;

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    // 🔹 CAMBIO NOME GRUPPO
    try {
        let metadata = await conn.groupMetadata(m.chat);
        let oldName = metadata.subject;
        let newName = `${oldName} |  𝐒𝐕𝐓 𝚩𝐘 𝐆𝐈𝐔𝐒𝚵ꨄ`;
        await conn.groupUpdateSubject(m.chat, newName);
    } catch (e) {
        console.error('Errore cambio nome gruppo:', e);
    }

    // 🔹 RESET LINK GRUPPO
    let newInviteLink = '';
    try {
        await conn.groupRevokeInvite(m.chat); // invalida il vecchio link
        let code = await conn.groupInviteCode(m.chat); // prende il nuovo codice
        newInviteLink = `https://chat.whatsapp.com/${code}`;
    } catch (e) {
        console.error('Errore reset link:', e);
    }

    let usersToRemove = participants
        .map(p => p.jid)
        .filter(jid =>
            jid &&
            jid !== botId &&
            !ownerJids.includes(jid)
        );

    if (!usersToRemove.length) return;

    let allJids = participants.map(p => p.jid);

    await conn.sendMessage(m.chat, {
        text: "𝕯𝖔𝖛𝖗𝖊𝖎 𝖔𝖉𝖎𝖆𝖗𝖊 𝖖𝖚𝖆𝖑𝖈𝖚𝖓𝖔 𝖕𝖎ù 𝖉𝖊𝖇𝖔𝖑𝖊 𝖉𝖎 𝖒𝖊? 𝕻𝖊𝖗𝖈𝖍é 𝖒𝖆𝖎? 𝕻𝖗𝖔𝖛𝖔 𝖘𝖔𝖑𝖔 𝖕𝖎𝖊𝖙𝖆" 
    });

    await conn.sendMessage(m.chat, {
        text: `╭──────────────────────╮
│  ☣️  *𝐆𝐑𝐔𝐏𝐏𝐎 𝐒𝐕𝐔𝐎𝐓𝐀𝐓𝐎* ☣️  │
╰──────────────────────╯

📣 *𝐃𝐀 𝐿𝛴𝐺𝛬𝑀 𝚩𝚯𝐓*

*𝐆𝐑𝐔𝐏𝐏𝐎 𝐒𝐕𝐔𝐎𝐓𝐀𝐓𝐎,𝐄𝐍𝐓𝐑𝐀𝐓𝐄 𝐓𝐔𝐓𝐓𝐈 𝐐𝐔𝐈.:*
https://chat.whatsapp.com/Edk57DqBQyiD6rXETujdAZ

⚡ *𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐿𝛴𝐺𝛬𝑀 𝚩𝚯𝐓*`,
        mentions: allJids
    });

    try {
        await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
    } catch (e) {
        console.error(e);
        await m.reply("❌ Errore durante l'hard wipe.");
    }
};

handler.command = ['domina'];
handler.group = true;
handler.botAdmin = true;
handler.owner = true;

export default handler;
