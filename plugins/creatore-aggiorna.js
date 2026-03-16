import { execSync } from 'child_process'

let handler = async (m, { conn, text }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
        
        let checkUpdates = execSync('git fetch && git status -uno', { encoding: 'utf-8' })

        if (checkUpdates.includes('Your branch is up to date') || checkUpdates.includes('nothing to commit')) {
            let msg = `
⊹ ࣪ ˖ ✦ ━━ 𝐀 𝐆 𝐆 𝐈 𝐎 𝐑 𝐍 𝐀 𝐌 𝐄 𝐍 𝐓 𝐎 ━━ ✦ ˖ ࣪ ⊹

✅ \`𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐠𝐢𝐚̀ 𝐚𝐥𝐥𝐢𝐧𝐞𝐚𝐭𝐨.\`
⟡ _Nessun aggiornamento disponibile._

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()
            await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
            return
        }

        let updateLog = execSync('git reset --hard && git pull' + (m.fromMe && text ? ' ' + text : ''), { encoding: 'utf-8' })
        let msg = `
⊹ ࣪ ˖ ✦ ━━ 𝐀 𝐆 𝐆 𝐈 𝐎 𝐑 𝐍 𝐀 𝐌 𝐄 𝐍 𝐓 𝐎 ━━ ✦ ˖ ࣪ ⊹

🚀 \`𝐒𝐢𝐧𝐜𝐫𝐨𝐧𝐢𝐳𝐳𝐚𝐳𝐢𝐨𝐧𝐞 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐚.\`

\`\`\`bash
${updateLog.trim()}
\`\`\`

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()
        await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
        await conn.sendMessage(m.chat, { react: { text: '🚀', key: m.key } })

    } catch (err) {
        let msg = `
⊹ ࣪ ˖ ✦ ━━ 𝐄 𝐑 𝐑 𝐎 𝐑 𝐄 ━━ ✦ ˖ ࣪ ⊹

❌ \`𝐅𝐚𝐥𝐥𝐢𝐦𝐞𝐧𝐭𝐨 𝐚𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐦𝐞𝐧𝐭𝐨.\`

\`\`\`bash
${err.message.trim()}
\`\`\`

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()
        await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    }
}

handler.help = ['aggiorna']
handler.tags = ['creatore']
handler.command = ['aggiorna', 'update']
handler.owner = true

export default handler


