let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})( [0-9]{1,3}|inf)?/i;

let handler = async (m, { conn, text, isOwner, usedPrefix, command }) => {
    // 1. Controllo se manca il testo
    if (!text) {
        let msgError = `
⊹ ࣪ ˖ ✦ ━━ 𝐀 𝐂 𝐂 𝐄 𝐒 𝐒 𝐎 ━━ ✦ ˖ ࣪ ⊹

⚠️ \`𝐅𝐨𝐫𝐧𝐢𝐬𝐜𝐢 𝐮𝐧 𝐥𝐢𝐧𝐤 𝐝𝐢 𝐢𝐧𝐯𝐢𝐭𝐨 𝐯𝐚𝐥𝐢𝐝𝐨.\`
⟡ _Esempio:_ ${usedPrefix + command} <link> <giorni | inf>

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();
        return m.reply(msgError);
    }

    // 2. Estrazione del link e dei giorni
    let [_, code, expiredStr] = text.match(linkRegex) || [];
    if (!code) {
        let msgInvalid = `
⊹ ࣪ ˖ ✦ ━━ 𝐄 𝐑 𝐑 𝐎 𝐑 𝐄 ━━ ✦ ˖ ࣪ ⊹

❌ \`𝐋𝐢𝐧𝐤 𝐜𝐨𝐫𝐫𝐨𝐭𝐭𝐨 𝐨 𝐧𝐨𝐧 𝐫𝐢𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨.\`
⟡ _Il sistema non può decriptare questo invito._

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();
        return m.reply(msgInvalid);
    }

    let expired = expiredStr ? expiredStr.trim() : '';

    try {
        // Reazione di caricamento
        await m.react('⏳');
        
        // 3. Esecuzione infiltrazione
        let res = await conn.groupAcceptInvite(code);
        const isNumber = (x) => (x = parseInt(x), typeof x === 'number' && !isNaN(x));

        // 4. Risultato: Tempo Infinito (o di default se non specificato)
        if (expired === 'inf' || !expired) {
            let msgSuccessInf = `
⊹ ࣪ ˖ ✦ ━━ 𝐈 𝐍 𝐅 𝐈 𝐋 𝐓 𝐑 𝐀 𝐙 𝐈 𝐎 𝐍 𝐄 ━━ ✦ ˖ ࣪ ⊹

✅ \`𝐀𝐜𝐜𝐞𝐬𝐬𝐨 𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐨.\`
⟡ _Permanenza: Infinita_
⟡ _Il Legam Core è ora operativo in questo settore._

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();
            await m.reply(msgSuccessInf);
            
        // 5. Risultato: A Tempo (Scadenza)
        } else {
            expired = Math.floor(Math.min(999, Math.max(1, isOwner ? (isNumber(expired) ? parseInt(expired) : 0) : 3)));
            
            let msgSuccessTimed = `
⊹ ࣪ ˖ ✦ ━━ 𝐈 𝐍 𝐅 𝐈 𝐋 𝐓 𝐑 𝐀 𝐙 𝐈 𝐎 𝐍 𝐄 ━━ ✦ ˖ ࣪ ⊹

✅ \`𝐀𝐜𝐜𝐞𝐬𝐬𝐨 𝐚𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐨.\`
⟡ _Permanenza: ${expired} Giorni_
⟡ _Il Legam Core uscirà automaticamente allo scadere del tempo._

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();
            await m.reply(msgSuccessTimed);
            
            // Imposta la scadenza nel database per il gruppo appena unito
            let chats = global.db.data.chats[res];
            if (!chats) chats = global.db.data.chats[res] = {};
            if (expired) chats.expired = +new Date() + expired * 1000 * 60 * 60 * 24;
        }
        
        // Conferma Visiva
        await m.react('✅');

    } catch (e) {
        // Se il link è revocato o il bot è stato rimosso in passato, lo intercettiamo qui
        let msgFail = `
⊹ ࣪ ˖ ✦ ━━ 𝐄 𝐑 𝐑 𝐎 𝐑 𝐄 ━━ ✦ ˖ ࣪ ⊹

❌ \`𝐈𝐦𝐩𝐨𝐬𝐬𝐢𝐛𝐢𝐥𝐞 𝐞𝐧𝐭𝐫𝐚𝐫𝐞.\`
⟡ _Link revocato o firewall del gruppo (Ban) attivo contro il bot._

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();
        await m.reply(msgFail);
        await m.react('❌');
    }
};

handler.help = ['join *<link> <giorni | inf>*'];
handler.tags = ['creatore'];
handler.command = ['join', 'entra'];
handler.owner = true; // Solo tu puoi aggiungere il bot ai gruppi

export default handler;
