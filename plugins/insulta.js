/**
 * 👑 LEGAM OS - PLUGIN INSULTA (FLAME MODE) 👑
 * Descrizione: Genera insulti pesanti e arroganti per umiliare l'avversario.
 */

let handler = async (m, { conn, text, participants }) => {
    // 1. Trova il bersaglio (menzione o risposta)
    let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
    
    if (!target) {
        return m.reply('『 🛑 』 `Devi menzionare un poveraccio o rispondere a un suo messaggio per umiliarlo.`')
    }

    // 2. Protezione per l'Owner e per il Bot
    let isTargetOwner = global.owner.some(o => target.includes(o[0]))
    if (isTargetOwner || target === conn.user.jid) {
        return m.reply('『 👑 』 `Stai davvero provando a insultare il tuo Dio o il suo strumento? Torna a cuccia, mortale.`')
    }

    // 3. Arsenale di insulti (Vero Flame)
    const insulti = [
        "Sei così inutile che persino l'errore 404 ha più senso della tua esistenza.",
        "Il tuo quoziente intellettivo è come il tuo saldo in banca: sotto lo zero termico.",
        "Hai la dignità di un visualizzato non ricambiato da tre anni.",
        "Tua madre ha fatto un errore di sistema quando ti ha partorito, peccato che non esista una patch per correggerti.",
        "Sei il motivo per cui gli alieni passano oltre la Terra senza fermarsi.",
        "Puzzi di povertà e di script copiati male da YouTube.",
        "Hai la faccia di uno che chiede ancora i trucchi per Clash Royale nel 2026.",
        "Sei come un server gratuito: lento, instabile e destinato a fallire entro sera.",
        "Tuo padre è andato a prendere il latte e quando ha visto la tua faccia ha preferito fondare una nuova famiglia in Messico.",
        "Sei l'equivalente umano di un lag di 5000ms durante una partita classificata.",
        "La tua opinione conta quanto la 'U' in 'Uomo', visto che sei palesemente uno scarto biologico.",
        "Persino ChatGPT si rifiuterebbe di generarti un cervello, sarebbe uno spreco di calcolo.",
        "Sei talmente sfigato che se facessero il campionato mondiale di falliti, arriveresti secondo solo perché sei un fallito anche in quello.",
        "Sembri un bot indiano programmato con i piedi e hostato su un microonde."
    ]

    // 4. Selezione casuale e formattazione lusso
    const insultoCasuale = insulti[Math.floor(Math.random() * insulti.length)]
    const targetNumero = target.split('@')[0]

    let flameText = `
⊹ ࣪ ˖ ✦ ━━ 𝐋𝐄𝐆𝐀𝐌 𝐅𝐋𝐀𝐌𝐄 ━━ ✦ ˖ ࣪ ⊹

🔥 \`𝐁𝐞𝐫𝐬𝐚𝐠𝐥𝐢𝐨:\` @${targetNumero}
💀 \`𝐒𝐭𝐚𝐭𝐨:\` Umiliato pesantemente

"${insultoCasuale}"

\`[!] 𝐀𝐕𝐕𝐈𝐒𝐎:\`
_Si consiglia di abbandonare il gruppo per evitare ulteriori danni psicologici._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

    // 5. Invio con menzione
    await conn.sendMessage(m.chat, { text: flameText, mentions: [target] }, { quoted: m })
}

// Comandi per attivarlo
handler.command = ['insulta', 'flame', 'asfalta']
handler.group = true // Solo nei gruppi, per fare più scena

export default handler

