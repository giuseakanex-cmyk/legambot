let handler = async (m, { conn, isROwner }) => {
    // Reazione di sistema
    await conn.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } });

    let msg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
·  𝐋 𝐄 𝐆 𝐀 𝐌  𝐂 𝐎 𝐑 𝐄  ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🔄 』 𝐑 𝐈 𝐀 𝐕 𝐕 𝐈 𝐎
➤ Inizializzazione protocollo...
➤ Chiusura connessioni socket...
➤ Svuotamento cache di memoria...

\`Il sistema si sta riavviando e tornerà online a breve.\`

👑 𝐎𝐖𝐍𝐄𝐑
➤ 𝐆𝐈𝐔𝐒𝚵

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    // Invia il messaggio con l'estetica Legam OS (Newsletter + Logo)
    await conn.reply(m.chat, msg, m, global.rcanal);

    // Aspetta 2 secondi per assicurarsi che il messaggio venga inviato prima di spegnersi
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Forza la chiusura del processo Node.js. 
    // (Se avvii il bot con uno script loop o pm2, si riaccenderà da solo istantaneamente)
    process.exit(1);
}

handler.help = ['riavvia', 'restart'];
handler.tags = ['owner'];
handler.command = /^(riavvia|restart)$/i;

// IL SEGRETO È QUI: Solo tu (Owner) puoi spegnere o riavviare il bot.
handler.owner = true;

export default handler;

