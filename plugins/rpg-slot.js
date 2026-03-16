let cooldowns = {}

const fruits = ['🍒', '🍋', '🍉', '🍇', '🍎', '🍓']

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]

    // ⏳ Cooldown 2 minuti
    const COOLDOWN = 2 * 60 * 1000
    if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < COOLDOWN) {
        let timeLeft = cooldowns[m.sender] + COOLDOWN - Date.now()
        let min = Math.floor(timeLeft / 60000)
        let sec = Math.floor((timeLeft % 60000) / 1000)
        return conn.reply(
            m.chat,
            `⏳ 𝗖𝗢𝗢𝗟𝗗𝗢𝗪𝗡\n\n⏱️ Aspetta ${min}m ${sec}s`,
            m
        )
    }

    // 🎰 Estrazione casuale
    let r1 = fruits[Math.floor(Math.random() * fruits.length)]
    let r2 = fruits[Math.floor(Math.random() * fruits.length)]
    let r3 = fruits[Math.floor(Math.random() * fruits.length)]

    let win = (r1 === r2 || r2 === r3 || r1 === r3)

    // Inizializza valori
    user.euro = Number(user.euro) || 0
    user.exp = Number(user.exp) || 0
    user.level = Number(user.level) || 1

    let { min: minXP, xp: levelXP } = xpRange(user.level, global.multiplier || 1)
    let currentLevelXP = user.exp - minXP

    let resultMsg = '🎰 𝗦𝗟𝗢𝗧 𝗠𝗔𝗖𝗛𝗜𝗡𝗘\n'
    resultMsg += '━━━━━━━━━━━━━━━\n\n'
    resultMsg += '🎲 𝗥𝗜𝗦𝗨𝗟𝗧𝗔𝗧𝗢:\n\n'
    resultMsg += `┃ ${r1} │ ${r2} │ ${r3} ┃\n\n`

    if (win) {
        // Vincita casuale soldi e XP
        let moneyWin = Math.floor(Math.random() * 901) + 100 // 100–1000 €
        let xpWin = Math.floor(Math.random() * 51) + 50       // 50–100 XP

        user.euro += moneyWin
        user.exp += xpWin

        resultMsg += '🎉 𝗩𝗜𝗧𝗧𝗢𝗥𝗜𝗔!\n'
        resultMsg += `➕ ${moneyWin} €\n`
        resultMsg += `➕ ${xpWin} XP\n`
    } else {
        // Perdita simbolica (facoltativa)
        let moneyLose = Math.min(user.euro, Math.floor(Math.random() * 101) + 50) // 50–150 €
        let xpLose = Math.floor(Math.random() * 31) + 20                          // 20–50 XP
        user.euro -= moneyLose
        user.exp = Math.max(0, user.exp - xpLose)

        resultMsg += '🤡 𝗦𝗖𝗢𝗡𝗙𝗜𝗧𝗧𝗔!\n'
        resultMsg += `➖ ${moneyLose} €\n`
        resultMsg += `➖ ${xpLose} XP\n`
    }

    resultMsg += '\n━━━━━━━━━━━━━━━\n'
    resultMsg += '💼 𝗦𝗔𝗟𝗗𝗢 𝗔𝗧𝗧𝗨𝗔𝗟𝗘\n\n'
    resultMsg += `💰 Euro: ${user.euro}\n`
    resultMsg += `⭐ XP: ${user.exp}\n`
    resultMsg += `📊 Progresso: ${currentLevelXP}/${levelXP} XP\n`

    cooldowns[m.sender] = Date.now()

    await new Promise(resolve => setTimeout(resolve, 1500))
    await conn.reply(m.chat, resultMsg, m)
}

handler.help = ['slot']
handler.tags = ['game', 'economy']
handler.command = ['slot']

export default handler

function xpRange(level, multiplier = 1) {
    if (level < 0) level = 0
    let min = level === 0 ? 0 : Math.pow(level, 2) * 20
    let max = Math.pow(level + 1, 2) * 20
    let xp = Math.floor((max - min) * multiplier)
    return { min, xp, max }
}
