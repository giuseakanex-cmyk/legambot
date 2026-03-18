// Database temporaneo per le partite
global.crazyTime = global.crazyTime || {}

// Funzione formattazione valuta
const f = (n) => new Intl.NumberFormat('it-IT').format(n)

// Configurazione Segmenti Ruota (Distribuzione reale)
const WHEEL = [
    { name: '1', mul: 1, weight: 21 },
    { name: '2', mul: 2, weight: 13 },
    { name: '5', mul: 5, weight: 7 },
    { name: '10', mul: 10, weight: 4 },
    { name: 'COIN', mul: 0, weight: 4 },     // Coin Flip
    { name: 'PACHINKO', mul: 0, weight: 2 }, // Pachinko
    { name: 'CASH', mul: 0, weight: 2 },     // Cash Hunt
    { name: 'CRAZY', mul: 0, weight: 1 }     // Crazy Time
]

// Estrazione ponderata
function spinWheel() {
    let totalWeight = WHEEL.reduce((acc, s) => acc + s.weight, 0)
    let random = Math.random() * totalWeight
    for (let s of WHEEL) {
        if (random < s.weight) return s
        random -= s.weight
    }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let chatId = m.chat
    let user = global.db.data.users[m.sender]

    // ==========================================
    // COMANDO: .crazytime (Apre la sessione da 5 Round)
    // ==========================================
    if (command === 'crazytime' || command === 'ct') {
        if (global.crazyTime[chatId]) return m.reply(`『 🛑 』 \`C'è già una sessione VIP in corso! Partecipa o attendi la fine.\``)

        // Setup della Sessione
        global.crazyTime[chatId] = {
            state: 'betting',
            round: 1,
            maxRounds: 5,
            bets: [],
            timer: null
        }

        apriLobby(conn, chatId, usedPrefix)
        return
    }

    // ==========================================
    // COMANDO: .betct (Punta per il round corrente)
    // ==========================================
    if (command === 'betct') {
        let game = global.crazyTime[chatId]
        if (!game) return m.reply(`『 ⚠️ 』 \`Nessuna sessione attiva. Usa ${usedPrefix}ct\``)
        if (game.state !== 'betting') return m.reply(`『 🛑 』 \`Puntate chiuse! La ruota sta già girando.\``)

        if (!args[0] || !args[1]) return m.reply(`👉 Usa: *${usedPrefix}betct [SEGMENTO] [EURO]*`)

        let pick = args[0].toUpperCase()
        let amount = parseInt(args[1])
        let validPicks = WHEEL.map(s => s.name)

        if (!validPicks.includes(pick)) return m.reply(`『 ❌ 』 \`Segmento non valido. Scegli tra: 1, 2, 5, 10, COIN, PACHINKO, CASH, CRAZY\``)
        if (isNaN(amount) || amount <= 0) return m.reply(`『 ⚠️ 』 \`Puntata non valida.\``)
        if (user.euro < amount) return m.reply(`『 💸 』 \`Fondi insufficienti. Hai solo ${f(user.euro)} €.\``)

        user.euro -= amount
        game.bets.push({ sender: m.sender, pick, amount })

        let ticket = `
╭── •✧ 𝐂𝐓 𝐓𝐈𝐂𝐊𝐄𝐓 ✧• ──╮
│ 👤 @${m.sender.split('@')[0]}
│ 🔄 𝐑𝐨𝐮𝐧𝐝: ${game.round}/${game.maxRounds}
│ 🎯 𝐒𝐞𝐠𝐦𝐞𝐧𝐭𝐨: *${pick}*
│ 💶 𝐏𝐮𝐧𝐭𝐚𝐭𝐚: *${f(amount)} €*
╰──────────────────╯`.trim()

        await conn.sendMessage(chatId, { text: ticket, mentions: [m.sender] }, { quoted: m })
    }
}

// ==========================================
// FUNZIONE LOBBY (Richiamata ad ogni round)
// ==========================================
async function apriLobby(conn, chatId, usedPrefix) {
    let game = global.crazyTime[chatId]
    if (!game) return

    let tempo = game.round === 1 ? 45000 : 30000 // 45s per il primo round, 30s per i successivi
    let secondi = tempo / 1000

    let lobby = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
·  𝐂 𝐑 𝐀 𝐙 𝐘  𝐓 𝐈 𝐌 𝐄  ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🔄 』 𝐑 𝐎 𝐔 𝐍 𝐃  ${game.round} / ${game.maxRounds}
Fate le vostre puntate! Il banco è aperto.

『 💰 』 𝐒 𝐄 𝐆 𝐌 𝐄 𝐍 𝐓 𝐈
· [𝟏] · [𝟐] · [𝟓] · [𝟏𝟎]
· [𝐂𝐎𝐈𝐍] · [𝐏𝐀𝐂𝐇𝐈𝐍𝐊𝐎] 
· [𝐂𝐀𝐒𝐇] · [𝐂𝐑𝐀𝐙𝐘]

💡 Scrivi: *.betct [Segmento] [Euro]*
𝐄𝐬𝐞𝐦𝐩𝐢𝐨: *.betct crazy 5000*

⏱️ 𝐂𝐡𝐢𝐮𝐬𝐮𝐫𝐚: ${secondi} Secondi
👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵`.trim()

    await conn.sendMessage(chatId, { 
        text: lobby,
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363233544482011@newsletter',
                newsletterName: `🎡 Legam Casino | Round ${game.round}`,
                serverMessageId: 100
            }
        }
    })

    game.timer = setTimeout(() => startSpin(conn, chatId), tempo)
}

// ==========================================
// LOGICA DEL GIRO E TOP SLOT
// ==========================================
async function startSpin(conn, chatId) {
    let game = global.crazyTime[chatId]
    if (!game) return
    game.state = 'spinning'

    await conn.sendMessage(chatId, { text: `『 🚨 』 \`PUNTATE CHIUSE!\` (Round ${game.round}/${game.maxRounds})\n\n🎰 Inizializzazione Top Slot...` })
    await new Promise(r => setTimeout(r, 3000))

    // 1. TOP SLOT (Genera un moltiplicatore extra)
    let tsSegment = WHEEL[Math.floor(Math.random() * WHEEL.length)].name
    let tsMultiplier = [2, 3, 5, 7, 10, 15, 20, 50][Math.floor(Math.random() * 8)]
    let tsHit = Math.random() > 0.6 // 40% di probabilità che la Top Slot colpisca

    let tsMsg = tsHit 
        ? `🔥 **TOP SLOT HIT!** 🔥\n[ *${tsSegment}* ] ➻ **${tsMultiplier}x**\n\n🎡 La ruota gigante inizia a girare...`
        : `💨 **TOP SLOT MISS!**\nNessun moltiplicatore bonus.\n\n🎡 La ruota gigante inizia a girare...`
    
    await conn.sendMessage(chatId, { text: tsMsg })
    await new Promise(r => setTimeout(r, 5000))

    // 2. RISULTATO RUOTA
    let result = spinWheel()
    let finalMultiplier = result.mul
    let isBonus = result.mul === 0

    let bonusTS = (tsHit && tsSegment === result.name) ? tsMultiplier : 1

    let resMsg = `🎡 La ruota rallenta e si ferma su... \n\n✨ [ **${result.name}** ] ✨`
    await conn.sendMessage(chatId, { text: resMsg })
    await new Promise(r => setTimeout(r, 2000))

    // 3. GESTIONE BONUS O VINCITA
    if (isBonus) {
        await handleBonus(conn, chatId, result.name, game, bonusTS)
    } else {
        await finalizeRound(conn, chatId, result.name, finalMultiplier * bonusTS, game)
    }
}

// ==========================================
// GESTIONE BONUS GAMES
// ==========================================
async function handleBonus(conn, chatId, type, game, ts) {
    let winMul = 0
    let bonusName = ""

    switch(type) {
        case 'COIN':
            bonusName = "🪙 𝐂𝐎𝐈𝐍 𝐅𝐋𝐈𝐏"
            await conn.sendMessage(chatId, { text: `🚀 Inizio **${bonusName}**!\nLato Rosso vs Lato Blu...` })
            await new Promise(r => setTimeout(r, 4000))
            winMul = Math.floor(Math.random() * 20) + 5
            await conn.sendMessage(chatId, { text: `🔴 ROSSO: 5x\n🔵 BLU: ${winMul}x\n\nLancio della moneta in corso...` })
            await new Promise(r => setTimeout(r, 3000))
            let side = Math.random() > 0.5 ? "ROSSO (5x)" : `BLU (${winMul}x)`
            if (side.includes("ROSSO")) winMul = 5;
            await conn.sendMessage(chatId, { text: `✨ Risultato: **${side}**!` })
            break

        case 'PACHINKO':
            bonusName = "🏮 𝐏𝐀𝐂𝐇𝐈𝐍𝐊𝐎"
            await conn.sendMessage(chatId, { text: `🚀 Inizio **${bonusName}**!\nLa pallina luminosa sta cadendo tra i chiodini...` })
            await new Promise(r => setTimeout(r, 6000))
            winMul = [10, 20, 30, 50, 100, 200][Math.floor(Math.random() * 6)]
            await conn.sendMessage(chatId, { text: `🎯 La pallina è atterrata su: **${winMul}x**!` })
            break

        case 'CASH':
            bonusName = "🎯 𝐂𝐀𝐒𝐇 𝐇𝐔𝐍𝐓"
            await conn.sendMessage(chatId, { text: `🚀 Inizio **${bonusName}**!\nIl sistema sta prendendo la mira sul grande tabellone...` })
            await new Promise(r => setTimeout(r, 5000))
            winMul = Math.floor(Math.random() * 90) + 10
            await conn.sendMessage(chatId, { text: `💥 BOOM! Colpito un moltiplicatore nascosto da **${winMul}x**!` })
            break

        case 'CRAZY':
            bonusName = "🌈 𝐂𝐑𝐀𝐙𝐘 𝐓𝐈𝐌𝐄"
            await conn.sendMessage(chatId, { text: `🔥 BENVENUTI NEL MONDO **CRAZY TIME**! 🔥\nEntriamo nella porta rossa. La ruota colossale sta girando...` })
            await new Promise(r => setTimeout(r, 8000))
            winMul = [50, 100, 150, 200, 500, 1000][Math.floor(Math.random() * 6)]
            await conn.sendMessage(chatId, { text: `👑 INCREDIBILE! Il flapper si ferma su: **${winMul}x**!` })
            break
    }

    await finalizeRound(conn, chatId, type, winMul * ts, game)
}

// ==========================================
// CHIUSURA ROUND E PASSAGGIO AL SUCCESSIVO
// ==========================================
async function finalizeRound(conn, chatId, resultName, totalMul, game) {
    let winners = ""
    let participants = game.bets.map(b => b.sender)

    for (let b of game.bets) {
        if (b.pick === resultName) {
            let winAmount = Math.floor(b.amount * totalMul)
            global.db.data.users[b.sender].euro += (winAmount + b.amount) 
            winners += `\n✅ @${b.sender.split('@')[0]} vince **+${f(winAmount)} €**`
        } else {
            winners += `\n❌ @${b.sender.split('@')[0]} perde -${f(b.amount)} €`
        }
    }

    let report = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
·   𝐑 𝐎 𝐔 𝐍 𝐃  ${game.round} / ${game.maxRounds}   ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🏆 』 𝐄 𝐒 𝐈 𝐓 𝐎 : [ **${resultName}** ]
· 𝐌𝐨𝐥𝐭𝐢𝐩𝐥𝐢𝐜𝐚𝐭𝐨𝐫𝐞 ➻ ${totalMul}x

${game.bets.length > 0 ? `『 💰 』 𝐑 𝐄 𝐒 𝐎 𝐂 𝐎 𝐍 𝐓 𝐎${winners}` : "『 😅 』 Nessuna giocata in questo round."}

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

    await conn.sendMessage(chatId, { 
        text: report, 
        mentions: participants,
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363233544482011@newsletter',
                newsletterName: `💸 Risultati Round ${game.round}`,
                serverMessageId: 100
            }
        }
    })

    // Controllo se ci sono altri round
    if (game.round < game.maxRounds) {
        await new Promise(r => setTimeout(r, 5000)) // Pausa di 5 secondi tra i round
        game.round++
        game.bets = [] // Azzera le scommesse per il nuovo round
        game.state = 'betting'
        await apriLobby(conn, chatId, ".") // Riapre la lobby in automatico
    } else {
        // Fine totale della sessione
        await new Promise(r => setTimeout(r, 3000))
        await conn.sendMessage(chatId, { text: `🛑 **SESSIONE CRAZY TIME CONCLUSA!**\nGrazie per aver giocato nel Casinò di Legam OS. Il banco chiude.` })
        delete global.crazyTime[chatId]
    }
}

handler.command = /^(crazytime|ct|betct)$/i
handler.group = true
export default handler


