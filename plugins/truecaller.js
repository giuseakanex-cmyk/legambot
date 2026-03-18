import truecallerjs from 'truecallerjs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Controllo se ha inserito il numero
    if (!text) return m.reply(`『 ☎️ 』 \`Inserisci un numero di telefono da tracciare.\`\n> Esempio: ${usedPrefix + command} 393331234567`);

    await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.key } });
    
    // Messaggio di attesa Hacker
    let waitMsg = await conn.sendMessage(m.chat, { text: '\`[ 📡 ] Interrogazione database Truecaller in corso...\`' }, { quoted: m });

    try {
        // ==========================================
        // ⚠️ INCOLLA QUI IL TUO INSTALLATION ID
        // ==========================================
        const installationId = "INSERISCI_QUI_IL_TUO_ID";

        const searchData = {
            number: text.replace(/[^0-9]/g, ''), // Pulisce il numero da spazi o +
            countryCode: "IT",
            installationId: installationId
        };

        // Effettua la ricerca
        const response = await truecallerjs.search(searchData);
        const data = response.json();

        // Se non trova nulla
        if (!data.data || data.data.length === 0) {
            return await conn.sendMessage(m.chat, { edit: waitMsg.key, text: '『 ❌ 』 \`Target fantasma. Nessuna corrispondenza trovata nel database Truecaller.\`' });
        }

        // Estrazione dati puliti
        const res = data.data[0];
        const nome = res.name || 'Sconosciuto';
        const score = res.score || '?';
        const spam = res.spamInfo ? '⚠️ SÌ (Segnalato come Spam)' : 'No';
        const carrier = res.phones[0]?.carrier || 'Sconosciuto / Rete Fissa';
        const type = res.phones[0]?.numberType || 'Mobile';
        const email = res.internetAddresses?.[0]?.id || 'Nessuna traccia';
        const citta = res.addresses?.[0]?.city || 'Sconosciuta';

        // Estetica Legam OS
        let msg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐒 𝐈 𝐍 𝐓 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 📞 』 𝐓 𝐑 𝐔 𝐄 𝐂 𝐀 𝐋 𝐋 𝐄 𝐑
· 𝐍𝐮𝐦𝐞𝐫𝐨 ➻ +${searchData.number}
· 𝐈𝐧𝐭𝐞𝐬𝐭𝐚𝐭𝐚𝐫𝐢𝐨 ➻ *${nome}*

『 📊 』 𝐃 𝐄 𝐓 𝐓 𝐀 𝐆 𝐋 𝐈
· 𝐂𝐚𝐫𝐫𝐢𝐞𝐫 ➻ ${carrier}
· 𝐓𝐢𝐩𝐨 ➻ ${type}
· 𝐂𝐢𝐭𝐭𝐚̀ ➻ ${citta}
· 𝐄𝐦𝐚𝐢𝐥 ➻ ${email}
· 𝐒𝐩𝐚𝐦 ➻ ${spam}

👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        await conn.sendMessage(m.chat, {
            edit: waitMsg.key,
            text: msg,
            contextInfo: {
                mentionedJid: [m.sender],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363233544482011@newsletter',
                    newsletterName: "📞 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐓𝐫𝐮𝐞𝐜𝐚𝐥𝐥𝐞𝐫",
                    serverMessageId: 100
                }
            }
        });

    } catch (e) {
        console.error("Errore Truecaller:", e);
        await conn.sendMessage(m.chat, { edit: waitMsg.key, text: '『 ❌ 』 \`Connessione ai server fallita. Hai inserito l\'Installation ID corretto?\`' });
    }
};

handler.help = ['truecaller <numero>'];
handler.tags = ['strumenti'];
// Puoi usare .truecaller, .cerca o .chiè
handler.command = /^(truecaller|cerca|chiè|chie)$/i;

// ⚠️ SOLO PER OWNER. Se lo fai usare a tutto il gruppo, Truecaller ti bannerà l'ID in 10 minuti.
handler.owner = true; 

export default handler;

