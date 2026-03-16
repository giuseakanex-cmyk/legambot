import os from 'os'
import { performance } from 'perf_hooks'

let handler = async (m, { conn }) => {
    // Calcolo velocità
    let old = performance.now()
    await m.react('📡')
    let neww = performance.now()
    let speed = neww - old

    // Calcolo RAM
    let ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(2)
    
    // Calcolo Uptime
    function clockString(ms) {
        let h = Math.floor(ms / 3600000)
        let m = Math.floor(ms / 60000) % 60
        let s = Math.floor(ms / 1000) % 60
        return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
    }
    let uptime = clockString(process.uptime() * 1000)

    // Grafica identica al tuo screenshot
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
    await m.react('✅')
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = /^(ping|speed|p)$/i

export default handler

