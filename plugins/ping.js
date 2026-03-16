import os from 'os'
import { performance } from 'perf_hooks'

// Funzione per trasformare i secondi di uptime in Giorni, Ore, Minuti e Secondi
function formatUptime(ms) {
    let d = Math.floor(ms / 86400000)
    let h = Math.floor(ms / 3600000) % 24
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return `${d}g ${h}h ${m}m ${s}s`
}

let handler = async (m, { conn }) => {
    // 1. Inizio misurazione velocità
    let start = performance.now()

    // 2. Mettiamo la reazione
    await conn.sendMessage(m.chat, { react: { text: "👑", key: m.key } })

    // 3. Raccolta Dati del Server
    let uptime = formatUptime(process.uptime() * 1000)
    let ramUsata = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    let ramTotale = (os.totalmem() / 1024 / 1024).toFixed(2)
    let sistema = os.type() + ' ' + os.arch()

    // 4. Fine misurazione velocità
    let end = performance.now()
    let speed = (end - start).toFixed(4)

    // 5. Grafica Tecnica di Lusso
    let pingText = `
⊹ ࣪ ˖ ✦ ━━ 𝐋𝐄𝐆𝐀𝐌 𝐎𝐒 ━━ ✦ ˖ ࣪ ⊹

👑 \`𝐎𝐰𝐧𝐞𝐫:\` Giuse
⚡ \`𝐕𝐞𝐥𝐨𝐜𝐢𝐭𝐚':\` ${speed} ms
⏳ \`𝐔𝐩𝐭𝐢𝐦𝐞:\` ${uptime}
💾 \`𝐑𝐀𝐌 𝐔𝐬𝐚𝐭𝐚:\` ${ramUsata} MB / ${ramTotale} MB
🖥️ \`𝐒𝐢𝐬𝐭𝐞𝐦𝐚:\` ${sistema}

_Statistiche server aggiornate in tempo reale._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

    // 6. Invio risposta
    await m.reply(pingText)
}

// Accetta SOLO .ping (niente scorciatoie)
handler.command = ['ping']

export default handler


