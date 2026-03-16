import fetch from 'node-fetch';

let handler = async (m, { conn, text, command }) => {
  // Sicurezza anti-crash: blocca se non sei in un gruppo
  if (!m.isGroup) return conn.reply(m.chat, `『 ❌ 』 \`Questo comando funziona solo nei gruppi.\``, m);

  let action, titleStr, customTesto;

  // 1. Definiamo le frasi e l'azione in base al comando
  if (['promote', 'promuovi', 'p'].includes(command)) {
    action = 'promote';
    titleStr = '𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐢 𝐩𝐫𝐨𝐦𝐨𝐳𝐢𝐨𝐧𝐞 👑';
    customTesto = `
⊹ ࣪ ˖ ✦ ━━ 𝐏 𝐑 𝐎 𝐌 𝐎 𝐙 𝐈 𝐎 𝐍 𝐄 ━━ ✦ ˖ ࣪ ⊹

👑 \`𝐆𝐢𝐮𝐬𝐞 𝐫𝐢𝐩𝐨𝐧𝐞 𝐢𝐧 𝐭𝐞 𝐦𝐨𝐥𝐭𝐚 𝐟𝐢𝐝𝐮𝐜𝐢𝐚 𝐩𝐞𝐫 𝐚𝐯𝐞𝐫𝐭𝐢 𝐝𝐚𝐭𝐨 𝐪𝐮𝐞𝐬𝐭𝐨 𝐩𝐫𝐢𝐯𝐢𝐥𝐞𝐠𝐢𝐨, 𝐧𝐨𝐧 𝐝𝐞𝐥𝐮𝐝𝐞𝐫𝐥𝐨.\`

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

  } else if (['demote', 'retrocedi', 'r'].includes(command)) {
    action = 'demote';
    titleStr = '𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐢 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐨𝐧𝐞 🔻';
    customTesto = `
⊹ ࣪ ˖ ✦ ━━ 𝐃 𝐄 𝐂 𝐋 𝐀 𝐒 𝐒 𝐀 𝐓 𝐎 ━━ ✦ ˖ ࣪ ⊹

🔻 \`𝐍𝐨𝐧 𝐡𝐚𝐢 𝐬𝐚𝐩𝐮𝐭𝐨 𝐬𝐟𝐫𝐮𝐭𝐭𝐚𝐫𝐞 l'𝐨𝐜𝐜𝐚𝐬𝐢𝐨𝐧𝐞, 𝐚𝐝𝐞𝐬𝐬𝐨 𝐭𝐢 𝐯𝐞𝐫𝐫𝐚𝐧𝐧𝐨 𝐚𝐭𝐭𝐫𝐢𝐛𝐮𝐢𝐭𝐞 𝐝𝐞𝐥𝐥𝐞 𝐜𝐨𝐧𝐬𝐞𝐠𝐮𝐞𝐧𝐳𝐞. 𝐋𝐨 𝐬𝐭𝐚𝐟𝐟 𝐧𝐨𝐧 𝐟𝐚 𝐩𝐞𝐫 𝐭𝐞 𝐠𝐮𝐚𝐠𝐥𝐢𝐨̀.\`

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();
  } else {
    return;
  }

  // 2. Cerchiamo l'utente bersaglio (risposta, menzione o numero scritto)
  let targetUser;
  if (m.mentionedJid && m.mentionedJid[0]) {
    targetUser = m.mentionedJid[0];
  } else if (m.quoted && m.quoted.sender) {
    targetUser = m.quoted.sender;
  } else if (text) {
    let match = text.match(/\d+/g);
    if (match) targetUser = match.join('') + '@s.whatsapp.net';
  }

  if (!targetUser) {
    return conn.reply(m.chat, `『 🩼 』 \`Specifica a chi vuoi dare o togliere i poteri.\``, m);
  }

  try {
    // 3. ESECUZIONE REALE: Promuove o retrocede l'utente nel gruppo
    await conn.groupParticipantsUpdate(m.chat, [targetUser], action);

    // 4. LA MECCANICA VISIVA (Quella del tuo amico)
    // Cerca di scaricare la foto profilo dell'utente
    let profilePicture;
    try {
        profilePicture = await conn.profilePictureUrl(targetUser, 'image');
    } catch (e) {
        // Se l'utente non ha la foto o ha la privacy, mette un'immagine predefinita
        profilePicture = 'https://files.catbox.moe/pyp87f.jpg'; 
    }

    // Funzione per trasformare l'immagine in Buffer per l'invio
    const getBuffer = async (url) => {
        try {
            const res = await fetch(url);
            return Buffer.from(await res.arrayBuffer());
        } catch (e) {
            return null;
        }
    };

    let imageBuffer = await getBuffer(profilePicture);
    
    // Creiamo i nomi per la targhetta
    let promotedUsername = targetUser.split('@')[0];
    let senderUsername = m.sender.split('@')[0];

    let finalMessage = customTesto + `\n\n👤 𝐀𝐳𝐢𝐨𝐧𝐞 𝐬𝐮: @${promotedUsername}\n👑 𝐄𝐬𝐞𝐠𝐮𝐢𝐭𝐚 𝐝𝐚: @${senderUsername}`;

    // 5. INVIO DELLA SCHEDA GRAFICA (externalAdReply)
    await conn.sendMessage(m.chat, {
        text: finalMessage,
        contextInfo: {
            mentionedJid: [targetUser, m.sender],
            externalAdReply: {
                title: titleStr,
                body: 'Legam Bot - Gestione Gruppo',
                thumbnail: imageBuffer,
                mediaType: 1,
                renderLargerThumbnail: true // Mette l'immagine in grande, fa molto più scena!
            }
        }
    }, { quoted: m });

  } catch (e) {
    console.error('[ERRORE DS.JS]', e);
    conn.reply(m.chat, `『 ❌ 』 \`Errore tecnico. Controlla che io sia Amministratore.\``, m);
  }
};

handler.help = ['promuovi', 'retrocedi'];
handler.tags = ['gruppo'];
handler.command = ['promote', 'promuovi', 'p', 'demote', 'retrocedi', 'r'];
handler.group = true; // IMPORTANTISSIMO: blocca l'errore participants!
handler.owner = true; // Solo tu puoi usarlo
handler.botAdmin = true; // Il bot deve essere admin

export default handler;

