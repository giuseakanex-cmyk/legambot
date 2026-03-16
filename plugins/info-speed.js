import os from 'os'
import process from 'process'
import { performance } from 'perf_hooks'

const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
}

const fancyClock = (ms) => {
    const d = Math.floor(ms / (1000 * 60 * 60 * 24))
    const h = Math.floor((ms / (1000 * 60 * 60)) % 24)
    const m = Math.floor((ms / (1000 * 60)) % 60)
    const s = Math.floor((ms / 1000) % 60)
    return [
        d > 0 ? `${d}g` : '',
        h > 0 ? `${h}h` : '',
        m > 0 ? `${m}m` : '',
        `${s}s`
    ].filter(Boolean).join(' ')
}

const handler = async (m, { conn }) => {
    const old = performance.now()
    const cpus = os.cpus()
    const cpuModel = cpus[0].model.trim()
    const cpuSpeed = cpus[0].speed
    const cpuCores = cpus.length
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const nodeMem = process.memoryUsage().rss
    const uptime = fancyClock(process.uptime() * 1000)
    const osUptime = fancyClock(os.uptime() * 1000)
    const platform = os.platform()
    const arch = os.arch()
    const hostname = os.hostname()
    const loadAvg = os.loadavg().map(v => v.toFixed(2)).join(' | ')
    const neww = performance.now()
    const speed = (neww - old).toFixed(2)

    const text = `
╭─「 『 🎐 』 \`STATO SISTEMA\` 」
│
├ 『 📡 』 *PING INFO*
│ >_ \`Velocita Bot:\` *${speed} ms*
│
├ 『 💾 』 *MEMORIA (RAM)*
│ >_ \`Totale:\` *${formatBytes(totalMem)}*
│ >_ \`Usata (Sys):\` *${formatBytes(usedMem)}*
│ >_ \`Libera:\` *${formatBytes(freeMem)}*
│ >_ \`Usata (Bot):\` *${formatBytes(nodeMem)}*
│
├ 『 💻 』 *SPECIFICHE CPU*
│ >_ \`Modello:\` *${cpuModel}*
│ >_ \`Core:\` *${cpuCores} Threads*
│ >_ \`Velocità:\` *${cpuSpeed} MHz*
│
├ 『 ⚙️ 』 *SISTEMA*
│ >_ \`OS:\` *${platform} (${arch})*
│ >_ \`Host:\` *${hostname}*
│ >_ \`NodeJS:\` *${process.version}*
│ >_ \`Uptime Bot:\` *${uptime}*
│ >_ \`Uptime Server:\` *${osUptime}*
│ >_ \`Load Avg:\` *${loadAvg}*
│
╰⭑⭒━✦⋆ \`𝓿𝓪𝓻𝓮𝓫𝓸𝓽\` ⋆✦━⭒⭑
`.trim()
    await conn.sendPresenceUpdate('composing', m.chat)
    await conn.reply(m.chat, text, m, { ...global.rcanal })
}

handler.help = ['speed']
handler.tags = ['info']
handler.command = ['speed', 'info']

export default handler