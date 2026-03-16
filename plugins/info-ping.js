import os from 'os'
import { performance } from 'perf_hooks'

let handler = async (m, { conn }) => {
    try {
        // Reazione universale (non crasha)
        await conn.sendMessage(m.chat, { react: { text: '📡', key: m.key } })
        
        let old = performance.now()
        let neww = performance.now()
        let speed = neww - old
        let ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(2)
        
        function clockString(ms) {
            let h = Math.floor(ms / 3600000)
            let m = Math.floor(ms / 60000) % 60
            let s = Math.floor(ms / 1000) % 60
            return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
        }
        let uptime = clockString(process.uptime() * 1000)

        let txt = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
·  𝐋 𝐄 𝐆 𝐀 𝐌  𝐁 𝐎 𝐓  ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

· 𝐏𝐢𝐧𝐠 ➻ ${speed.toFixed(4)} ms
· 𝐔𝐩𝐭𝐢𝐦𝐞 ➻ ${uptime}
· 𝐑𝐀𝐌 ➻ ${ram} MB

👑 𝐎𝐖𝐍𝐄𝐑
➤ 𝐆𝐈𝐔𝐒𝐄

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

        await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
        console.error(e)
    }
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping', 'speed', 'p'] // Array fisso per evitare errori di lettura

export default handler


