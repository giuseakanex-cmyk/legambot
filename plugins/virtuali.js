// Database temporaneo per le partite in corso, By Giuse
global.virtualMatches = global.virtualMatches || {}

// Funzione per formattare i numeri (es. 1.000.000)
function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num)
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let chatId = m.chat

    // ==========================================
    // COMANDO 1: .virtuali (Crea la partita)
    // ==========================================
    if (command === 'virtuali') {
        if (global.virtualMatches[chatId]) {
            return m.reply(`⚠️ *C'è già una partita in corso in questo gruppo!* Attendi il triplice fischio.`)
        }

        const squadre = ["Napoli", "Inter", "Juventus", "Milan", "Bologna", "Roma", "Atalanta", "Lazio", "Fiorentina", "Torino", "Monza", "Genoa", "Lecce", "Udinese", "Verona", "Cagliari", "Empoli", "Como", "Parma", "Venezia"]
        let shuffled = squadre.sort(() => 0.5 - Math.random())
        let sq1 = shuffled[0]
        let sq2 = shuffled[1]

        global.virtualMatches[chatId] = {
            state: 'betting',
            sq1: sq1,
            sq2: sq2,
            score1: 0,
            score2: 0,
            bets: [],
            timer: null
        }

        // 🎨 GRAFICA BOTTEGHINO PREMIUM
        let msg = `
╔══════ ≪ °⚽° ≫ ══════╗
     𝐒𝐄𝐑𝐈𝐄 𝐀 𝐕𝐈𝐑𝐓𝐔𝐀𝐋𝐄
╚══════ ≪ °⚽° ≫ ══════╝

🏟️ 𝐌𝐀𝐓𝐂𝐇 𝐃𝐄𝐋 𝐆𝐈𝐎𝐑𝐍𝐎:
⚔️ *${sq1}* 🆚 *${sq2}*
☁️ 𝘊𝘭𝘪𝘮𝘢: 𝘗𝘦𝘳𝘧𝘦𝘵𝘵𝘰 𝘱𝘦𝘳 𝘨𝘪𝘰𝘤𝘢𝘳𝘦
👨🏻‍⚖️ 𝘈𝘳𝘣𝘪𝘵𝘳𝘰: 𝘚𝘪𝘨. 𝘎𝘪𝘶𝘴𝘦𝘣𝘰𝘵

📊 𝐐𝐔𝐎𝐓𝐄 𝐔𝐅𝐅𝐈𝐂𝐈𝐀𝐋𝐈:
  [𝟏] Vittoria ${sq1} ➠ *2.0x*
  [𝐗] Pareggio ➠ *3.0x*
  [𝟐] Vittoria ${sq2} ➠ *2.0x*
  [𝐆𝐆] Entrambe a segno ➠ *1.8x*
  [𝐍𝐆] Almeno una a secco ➠ *1.8x*
  [𝐎𝐕𝐄𝐑] Più di 2 gol ➠ *2.0x*
  [𝐔𝐍𝐃𝐄𝐑] Max 2 gol ➠ *1.8x*
  [𝟏𝐗 / 𝐗𝟐] Doppia Chance ➠ *1.3x*
  [𝟏𝟐] Nessun Pareggio ➠ *1.2x*

⏳ 𝐁𝐎𝐓𝐓𝐄𝐆𝐇𝐈𝐍𝐎 𝐀𝐏𝐄𝐑𝐓𝐎!
Avete 𝟑𝟓 𝐬𝐞𝐜𝐨𝐧𝐝𝐢 per piazzare la vostra giocata.

✍️ 𝘊𝘰𝘮𝘢𝘯𝘥𝘰: *${usedPrefix}punta [Esito] [Euro]*
💡 𝘌𝘴𝘦𝘮𝘱𝘪𝘰: *${usedPrefix}punta OVER 500*`.trim()

        await conn.sendMessage(chatId, { text: msg })

        // Timer di 35 secondi
        global.virtualMatches[chatId].timer = setTimeout(async () => {
            await avviaPartita(conn, chatId)
        }, 35000)
        
        return
    }

    // ==========================================
    // COMANDO 2: .punta (Piazza la scommessa)
    // ==========================================
    if (command === 'punta' || command === 'bet') {
        let match = global.virtualMatches[chatId]
        
        if (!match) return m.reply(`⚠️ Nessun match in programma! Usa *${usedPrefix}virtuali* per crearne uno.`)
        if (match.state !== 'betting') return m.reply(`⛔ Troppo tardi! Le squadre sono già scese in campo.`)

        let user = global.db.data.users[m.sender]
        if (!args[0] || !args[1]) return m.reply(`👉 Usa: *${usedPrefix}punta [ESITO] [EURO]*`)
        
        let scommessa = args[0].toUpperCase()
        let puntata = parseInt(args[1])
        let valide = ['1', 'X', '2', 'GG', 'NG', 'OVER', 'UNDER', '1X', 'X2', '12']

        if (!valide.includes(scommessa)) return m.reply(`⚠️ Esito non valido!\nScegli tra: *1, X, 2, GG, NG, OVER, UNDER, 1X, X2, 12*.`)
        if (isNaN(puntata) || puntata <= 0) return m.reply(`⚠️ Inserisci una puntata valida!`)
        if (user.euro < puntata) return m.reply(`💸 Fondi insufficienti! Hai solo *${formatNumber(user.euro)} €*.`)
        
        if (match.bets.some(b => b.sender === m.sender)) {
            return m.reply(`⚠️ Hai già piazzato la tua scommessa! Mettiti comodo e guarda la partita.`)
        }

        user.euro -= puntata
        match.bets.push({ sender: m.sender, scommessa, puntata })

        // 🎨 GRAFICA SCHEDINA TIPO RICEVUTA
        let ricevuta = `
🧾 𝗦𝗖𝗛𝗘𝗗𝗜𝗡𝗔 𝗨𝗙𝗙𝗜𝗖𝗜𝗔𝗟𝗘 🧾
👤 𝘎𝘪𝘰𝘤𝘢𝘵𝘰𝘳𝘦: @${m.sender.split('@')[0]}
🎯 𝘗𝘳𝘰𝘯𝘰𝘴𝘵𝘪𝘤𝘰: *${scommessa}*
💸 𝘐𝘮𝘱𝘰𝘳𝘵𝘰: *${formatNumber(puntata)} €*
💳 𝘚𝘢𝘭𝘥𝘰 𝘙𝘦𝘴𝘪𝘥𝘶𝘰: *${formatNumber(user.euro)} €*
🍀 𝘉𝘶𝘰𝘯𝘢 𝘧𝘰𝘳𝘵𝘶𝘯𝘢!`.trim()

        await conn.sendMessage(chatId, { text: ricevuta, mentions: [m.sender] }, { quoted: m })
    }
}

// ==========================================
// TELECRONACA E RISULTATI
// ==========================================
async function avviaPartita(conn, chatId) {
    let match = global.virtualMatches[chatId]
    if (!match) return
    
    match.state = 'playing'

    // 🎨 GRAFICA INIZIO MATCH
    let startMsg = `
🚨 𝐁𝐎𝐓𝐓𝐄𝐆𝐇𝐈𝐍𝐎 𝐂𝐇𝐈𝐔𝐒𝐎! 🚨

🏟️ Le squadre sono in campo, i tifosi cantano a squarciagola!
🔊 L'arbitro guarda il cronometro... 𝐅𝐈𝐒𝐂𝐇𝐈𝐎 𝐃'𝐈𝐍𝐈𝐙𝐈𝐎! 
⚽ Seguiamo la telecronaca live del match...`.trim()

    await conn.sendMessage(chatId, { text: startMsg })

    let eventsCount = Math.floor(Math.random() * 3) + 4 // Da 4 a 6 eventi salienti
    let minutiAzione = []
    for (let i = 0; i < eventsCount; i++) {
        minutiAzione.push(Math.floor(Math.random() * 89) + 1) 
    }
    minutiAzione.sort((a, b) => a - b)
    
    for (let i = 0; i < eventsCount; i++) {
        await new Promise(resolve => setTimeout(resolve, 6000)) 
        
        let isTeam1 = Math.random() > 0.5
        let team = isTeam1 ? match.sq1 : match.sq2
        let actionType = Math.random()
        let msg = ''

        if (actionType < 0.35) {
            if (isTeam1) match.score1++
            else match.score2++
            msg = `🥅 𝐆𝐎𝐎𝐎𝐀𝐀𝐀𝐋𝐋𝐋!!!\nMagia del ${team}! L'attaccante salta il difensore e la insacca sotto il sette!\n\n📊 *${match.sq1} [ ${match.score1} - ${match.score2} ] ${match.sq2}*`
        } else if (actionType < 0.60) {
            msg = `😱 𝐁𝐑𝐈𝐕𝐈𝐃𝐎 𝐈𝐍 𝐂𝐀𝐌𝐏𝐎!\nDisattenzione difensiva, l'attaccante del ${team} a tu per tu col portiere tira incredibilmente a lato!`
        } else if (actionType < 0.80) {
            let color = Math.random() > 0.8 ? '🟥 *𝐄𝐒𝐏𝐔𝐋𝐒𝐈𝐎𝐍𝐄*' : '🟨 *𝐀𝐌𝐌𝐎𝐍𝐈𝐙𝐈𝐎𝐍𝐄*'
            msg = `${color}!\nIntervento killer di un giocatore del ${team}! L'arbitro estrae il cartellino senza pensarci due volte.`
        } else {
            msg = `💥 𝐋𝐄𝐆𝐍𝐎 𝐂𝐋𝐀𝐌𝐎𝐑𝐎𝐒𝐎!\nChe sfortuna per il ${team}! Un bolide da 30 metri si infrange in pieno sulla traversa!`
        }

        let minuto = minutiAzione[i]
        await conn.sendMessage(chatId, { text: `⏱️ 𝐌𝐢𝐧𝐮𝐭𝐨 ${minuto}'\n${msg}` })
    }

    await new Promise(resolve => setTimeout(resolve, 5000))

    // ==========================================
    // CALCOLO ESITI E VINCITE
    // ==========================================
    let is1 = match.score1 > match.score2
    let isX = match.score1 === match.score2
    let is2 = match.score1 < match.score2
    let isGG = match.score1 > 0 && match.score2 > 0
    let isNG = match.score1 === 0 || match.score2 === 0
    let isOver = (match.score1 + match.score2) > 2
    let isUnder = (match.score1 + match.score2) <= 2
    let is1X = is1 || isX
    let isX2 = is2 || isX
    let is12 = is1 || is2

    // Calcoliamo gli esiti vincenti per mostrarli a fine partita
    let esitiVincenti = []
    if (is1) esitiVincenti.push('1')
    if (isX) esitiVincenti.push('X')
    if (is2) esitiVincenti.push('2')
    if (isGG) esitiVincenti.push('GG')
    if (isNG) esitiVincenti.push('NG')
    if (isOver) esitiVincenti.push('OVER')
    if (isUnder) esitiVincenti.push('UNDER')
    if (is1X) esitiVincenti.push('1X')
    if (isX2) esitiVincenti.push('X2')
    if (is12) esitiVincenti.push('12')

    let winnersTxt = ''
    let scommettitori = match.bets.map(b => b.sender)
    
    for (let b of match.bets) {
        let won = false
        let multiplier = 0.0
        
        switch(b.scommessa) {
            case '1': if (is1) { won = true; multiplier = 2.0; } break;
            case 'X': if (isX) { won = true; multiplier = 3.0; } break;
            case '2': if (is2) { won = true; multiplier = 2.0; } break;
            case 'GG': if (isGG) { won = true; multiplier = 1.8; } break;
            case 'NG': if (isNG) { won = true; multiplier = 1.8; } break;
            case 'OVER': if (isOver) { won = true; multiplier = 2.0; } break;
            case 'UNDER': if (isUnder) { won = true; multiplier = 1.8; } break;
            case '1X': if (is1X) { won = true; multiplier = 1.3; } break;
            case 'X2': if (isX2) { won = true; multiplier = 1.3; } break;
            case '12': if (is12) { won = true; multiplier = 1.2; } break;
        }

        if (won) {
            let winAmount = Math.floor(b.puntata * multiplier)
            global.db.data.users[b.sender].euro += winAmount
            winnersTxt += `\n✅ @${b.sender.split('@')[0]} vince *+${formatNumber(winAmount)} €* (Quota ${multiplier}x)`
        } else {
            winnersTxt += `\n❌ @${b.sender.split('@')[0]} ha perso *-${formatNumber(b.puntata)} €*`
        }
    }

    // 🎨 GRAFICA FINALE PREMIUM
    let finale = `
╔═════ ≪ °🏁° ≫ ═════╗
   𝐓𝐑𝐈𝐏𝐋𝐈𝐂𝐄 𝐅𝐈𝐒𝐂𝐇𝐈𝐎
╚═════ ≪ °🏁° ≫ ═════╝

⚽ 𝐑𝐈𝐒𝐔𝐋𝐓𝐀𝐓𝐎 𝐅𝐈𝐍𝐀𝐋𝐄:
🛡️ *${match.sq1}* [ ${match.score1} - ${match.score2} ]  *${match.sq2}* 🛡️

🎯 𝐄𝐬𝐢𝐭𝐢 𝐕𝐢𝐧𝐜𝐞𝐧𝐭𝐢: _${esitiVincenti.join(', ')}_
─────────────────`

    if (match.bets.length === 0) {
        finale += `\n😅 𝘕𝘦𝘴𝘴𝘶𝘯𝘢 𝘴𝘤𝘩𝘦𝘥𝘪𝘯𝘢 𝘨𝘪𝘰𝘤𝘢𝘵𝘢.`
    } else {
        finale += `\n🏆 𝐑𝐄𝐒𝐎𝐂𝐎𝐍𝐓𝐎 𝐆𝐈𝐎𝐂𝐀𝐓𝐄:${winnersTxt}`
    }
    
    await conn.sendMessage(chatId, { text: finale.trim(), mentions: scommettitori })
    
    delete global.virtualMatches[chatId]
}

handler.command = ['virtuali', 'punta']
handler.group = true
export default handler
