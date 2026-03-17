let handler = async (m, { conn, isOwner }) => {
    // Se chi scrive "ti amo" NON è l'owner (Giuse), il bot ignora il messaggio in silenzio
    if (!isOwner) return;

    try {
        // Il bot reagisce al tuo messaggio con una faccia sospettosa
        await conn.sendMessage(m.chat, { react: { text: '🤨', key: m.key } });

        // Messaggio personalizzato e simpatico
        let msgFedelta = `
⊹ ࣪ ˖ ✦ ━━ 𝐀𝐋𝐋𝐄𝐑𝐓𝐀 𝐒𝐄𝐍𝐓𝐈𝐌𝐄𝐍𝐓𝐀𝐋𝐄 ━━ ✦ ˖ ࣪ ⊹

🤨 *Ehm... scusa Giuse?* Ma non ti ricordi che questa frase la puoi dire **SOLO** a Linda? 

🔒 \`Il Legam Core ha rilevato un'anomalia.\` 
Guarda che ho accesso a tutta la cronologia... se fai il furbo impacchetto i log e le mando gli screen in privato eh! 🤫💖

Torna subito nei ranghi, soldato. 🫡
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        // Invia il messaggio con il solito stile grafico (facoltativo, rcanal per l'immagine)
        await conn.reply(m.chat, msgFedelta, m, global.rcanal);

    } catch (e) {
        console.error("Errore nel plugin tiamo:", e);
    }
}

// customPrefix serve per far scattare il comando ANCHE SE NON USI IL PREFISSO (., !, ecc.)
// In questo modo basterà che tu scriva "ti amo" all'interno di una frase qualsiasi
handler.customPrefix = /ti amo/i 
handler.command = new RegExp

export default handler

