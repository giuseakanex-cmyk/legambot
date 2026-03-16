import fs from 'fs'
import path from 'path'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let handler = async (m, { conn }) => {
    try {
        let sessionPath = './session/' 
        let tempPath = './temp/'
        let deletedFiles = 0

        await conn.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } })

        const generateMessage = (bar, percent, status) => {
            return `
⊹ ࣪ ˖ ✦ ━━ 𝐒 𝐈 𝐒 𝐓 𝐄 𝐌 𝐀 ━━ ✦ ˖ ࣪ ⊹

⚙️ \`𝐏𝐮𝐥𝐢𝐳𝐢𝐚 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...\`
${bar} *${percent}%*
⟡ _${status}_

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()
        }

        let { key } = await conn.sendMessage(m.chat, { 
            text: generateMessage('[■□□□□□□□□□]', '10', 'Scansione file...') 
        }, { quoted: m })

        await delay(1000)
        await conn.sendMessage(m.chat, { text: generateMessage('[■■■□□□□□□□]', '30', 'Isolamento processi...'), edit: key })

        // Svuota sessione (tranne creds.json)
        if (fs.existsSync(sessionPath)) {
            let files = fs.readdirSync(sessionPath)
            for (let file of files) {
                if (file !== 'creds.json') {
                    try { fs.unlinkSync(path.join(sessionPath, file)); deletedFiles++ } catch (e) {}
                }
            }
        }
        
        // Svuota media temporanei
        if (fs.existsSync(tempPath)) {
            let tempFiles = fs.readdirSync(tempPath)
            for (let file of tempFiles) {
                try { fs.unlinkSync(path.join(tempPath, file)); deletedFiles++ } catch (e) {}
            }
        }

        await delay(1000)
        await conn.sendMessage(m.chat, { text: generateMessage('[■■■■■■■■□□]', '80', 'Compressione...'), edit: key })

        await delay(1000)
        let finalMsg = `
⊹ ࣪ ˖ ✦ ━━ 𝐒 𝐈 𝐒 𝐓 𝐄 𝐌 𝐀 ━━ ✦ ˖ ࣪ ⊹

✅ \`𝐏𝐮𝐥𝐢𝐳𝐢𝐚 𝐂𝐚𝐜𝐡𝐞 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐚.\`
⟡ _File eliminati:_ ${deletedFiles}
⟡ _Il Legam Core è stabilizzato._

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

        await conn.sendMessage(m.chat, { text: finalMsg, edit: key })
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        
    } catch (err) {
        console.error(err)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    }
}

handler.help = ['ds', 'clearcache']
handler.tags = ['creatore']
handler.command = ['ds', 'clearcache']
handler.owner = true

export default handler


