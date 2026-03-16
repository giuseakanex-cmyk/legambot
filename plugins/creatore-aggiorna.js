import { execSync } from 'child_process'

let handler = async (m, { conn, text }) => {
    try {
        // Reazione di caricamento
        await m.react('⏳') 
        
        let checkUpdates = execSync('git fetch && git status -uno', { encoding: 'utf-8' })

        // CASO 1: Già aggiornato
        if (checkUpdates.includes('Your branch is up to date') || checkUpdates.includes('nothing to commit')) {
            let msg = `
⊹ ࣪ ˖ ✦ ━━ 𝐀 𝐆 𝐆 𝐈 𝐎 𝐑 𝐍 𝐀 𝐌 𝐄 𝐍 𝐓 𝐎 ━━ ✦ ˖ ࣪ ⊹

✅ \`𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐠𝐢𝐚̀ 𝐚𝐥𝐥𝐢𝐧𝐞𝐚𝐭𝐨.\`
⟡ _Nessun aggiornamento disponibile nel repository._
⟡ _Il Legam Core sta girando all'ultima versione._

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()
            await conn.reply(m.chat, msg, m)
            await m.react('✅')
            return
        }

        // CASO 2: Aggiornamento disponibile
        if (checkUpdates.includes('Your branch is behind')) {
            let updateLog = execSync('git reset --hard && git pull' + (m.fromMe && text ? ' ' + text : ''), { encoding: 'utf-8' })
            let msg = `
⊹ ࣪ ˖ ✦ ━━ 𝐀 𝐆 𝐆 𝐈 𝐎 𝐑 𝐍 𝐀 𝐌 𝐄 𝐍 𝐓 𝐎 ━━ ✦ ˖ ࣪ ⊹

🚀 \`𝐒𝐢𝐧𝐜𝐫𝐨𝐧𝐢𝐳𝐳𝐚𝐳𝐢𝐨𝐧𝐞 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐚 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨.\`
⟡ _I nuovi moduli sono stati installati e caricati._

\`\`\`bash
${updateLog.trim()}
\`\`\`

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()
            await conn.reply(m.chat, msg, m)
            await m.react('🚀')
            
        // CASO 3: Stato anomalo (Forzatura)
        } else {
            let updateLog = execSync('git reset --hard && git pull' + (m.fromMe && text ? ' ' + text : ''), { encoding: 'utf-8' })
            let msg = `
⊹ ࣪ ˖ ✦ ━━ 𝐀 𝐆 𝐆 𝐈 𝐎 𝐑 𝐍 𝐀 𝐌 𝐄 𝐍 𝐓 𝐎 ━━ ✦ ˖ ࣪ ⊹

⚠️ \`𝐀𝐧𝐨𝐦𝐚𝐥𝐢𝐚 𝐫𝐢𝐥𝐞𝐯𝐚𝐭𝐚. 𝐅𝐨𝐫𝐳𝐚𝐭𝐮𝐫𝐚 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...\`
⟡ _Aggiornamento forzato dei file di sistema completato._

\`\`\`bash
${updateLog.trim()}
\`\`\`

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()
            await conn.reply(m.chat, msg, m)
            await m.react('⚙️')
        }

    } catch (err) {
        // GESTIONE ERRORI
        let msg = `
⊹ ࣪ ˖ ✦ ━━ 𝐄 𝐑 𝐑 𝐎 𝐑 𝐄 ━━ ✦ ˖ ࣪ ⊹

❌ \`𝐅𝐚𝐥𝐥𝐢𝐦𝐞𝐧𝐭𝐨 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥'𝐚𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐦𝐞𝐧𝐭𝐨.\`
⟡ _Controlla i log del server._

\`\`\`bash
${err.message.trim()}
\`\`\`

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()
        await conn.reply(m.chat, msg, m)
        await m.react('❌')
    }
}

handler.help = ['aggiorna']
handler.tags = ['creatore']
handler.command = /^(aggiorna|update|aggiornabot)$/i
handler.owner = true // SOLO TU PUOI USARLO

export default handler
