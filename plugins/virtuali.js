// Database temporaneo per le partite in corso,BY GIUSE
global.virtualMatches = global.virtualMatches || {}

// Funzione per formattare i numeri (es. 1.000.000)
function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num)
}

// DATABASE GIOCATORI SERIE A 2025/2026
const roseSerieA = {
    "Napoli": ["Kvaratskhelia", "Lukaku", "McTominay", "Politano", "Buongiorno", "Di Lorenzo"],
    "Inter": ["Lautaro Martinez", "Thuram", "Barella", "Calhanoglu", "Dimarco", "Bastoni"],
    "Juventus": ["Vlahovic", "Yildiz", "Koopmeiners", "Conceicao", "Cambiaso", "Bremer"],
    "Milan": ["Leao", "Morata", "Pulisic", "Reijnders", "Theo Hernandez", "Maignan"],
    "Atalanta": ["Lookman", "Retegui", "De Ketelaere", "Ederson", "Bellanova"],
    "Roma": ["Dybala", "Dovbyk", "Soulé", "Pellegrini", "Mancini"],
    "Lazio": ["Zaccagni", "Castellanos", "Dia", "Guendouzi", "Rovella"],
    "Fiorentina": ["Kean", "Gudmundsson", "Colpani", "Dodo", "De Gea"],
    "Bologna": ["Castro", "Orsolini", "Ndoye", "Freuler", "Beukema"],
    "Torino": ["Adams", "Sanabria", "Ricci", "Ilic", "Coco"]
}

// Funzione per pescare un giocatore reale (o generico se la squadra è minore)
function getPlayer(team) {
    if (roseSerieA[team]) {
        return roseSerieA[team][Math.floor(Math.random() * roseSerieA[team].length)]
    }
    const generici = ["L'attaccante", "Il fantasista", "Il centravanti", "L'esterno", "Il difensore"]
    return generici[Math.floor(Math.random() * generici.length)]
}

// Quote fisse
const QUOTE = {
    '1': 2.0, 'X': 3.0, '2': 2.0, 'GG': 1.8, 'NG': 1.8, 'OVER': 2.0, 'UNDER': 1.8
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let chatId = m.chat

    // ==========================================
    // COMANDO 1: .virtuali (Crea la partita)
    // ==========================================
    if (command === 'virtuali') {
        if (global.virtualMatches[chatId]) {
            return m.reply(`『 🛑 』 \`C'è già un match in corso! Attendi il triplice fischio.\``)
        }

        const squadre = ["Napoli", "Inter", "Juventus", "Milan", "Atalanta", "Roma", "Lazio", "Fiorentina", "Bologna", "Torino", "Genoa", "Parma", "Como", "Empoli", "Verona", "Lecce"]
        let shuffled = squadre.sort(() => 0.5 - Math.random())
        let sq1 = shuffled[0]
        let sq2 = shuffled[1]

        global.virtualMatches[chatId] = {
            state: 'betting', sq1: sq1, sq2: sq2, score1: 0, score2: 0, bets: [], timer: null
        }

        // 🎨 GRAFICA PREMIUM BOTTEGHINO LEGAM OS
        let msg = `
╭── •✧ 𝐋𝐄𝐆𝐀𝐌 𝐁𝐄𝐓𝐓𝐈𝐍𝐆 ✧• ──╮
│ 🏆 𝐒𝐄𝐑𝐈𝐄 𝐀 𝐕𝐈𝐑𝐓𝐔𝐀𝐋𝐄
│ ⚔️ *${sq1}* 🆚 *${sq2}*
│ ⏱️ 𝐂𝐡𝐢𝐮𝐬𝐮𝐫𝐚: 40 Secondi
╰──────────────────╯

📊 𝐐 𝐔 𝐎 𝐓 𝐄  𝐎 𝐅 𝐅 𝐈 𝐂 𝐈 𝐀 𝐋 𝐈
[ 𝟏 ] Vittoria ${sq1} ➻ *${QUOTE['1'].toFixed(2)}x*
[ 𝐗 ] Pareggio ➻ *${QUOTE['X'].toFixed(2)}x*
[ 𝟐 ] Vittoria ${sq2} ➻ *${QUOTE['2'].toFixed(2)}x*
[ 𝐆𝐆 ] Entrambe a Segno ➻ *${QUOTE['GG'].toFixed(2)}x*
[ 𝐍𝐆 ] Nessun Goal/Una a secco ➻ *${QUOTE['NG'].toFixed(2)}x*
[ 𝐎𝐕𝐄𝐑 ] Più di 2 Goal ➻ *${QUOTE['OVER'].toFixed(2)}x*
[ 𝐔𝐍𝐃𝐄𝐑 ] Max 2 Goal ➻ *${QUOTE['UNDER'].toFixed(2)}x*

💡 𝐂 𝐎 𝐌 𝐄  𝐆 𝐈 𝐎 𝐂 𝐀 𝐑 𝐄
➤ Scrivi: *${usedPrefix}punta [Esito] [Euro]*
➤ Esempio: *${usedPrefix}punta 1 500*
`.trim()

        await conn.sendMessage(chatId, {
            text: msg,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363233544482011@newsletter',
                    newsletterName: "🎰 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐁𝐞𝐭𝐭𝐢𝐧𝐠",
                    serverMessageId: 100
                }
            }
        })

        // Timer di 40 secondi
        global.virtualMatches[chatId].timer = setTimeout(async () => {
            await avviaPartita(conn, chatId)
        }, 40000)
        
        return
    }

    // ==========================================
    // COMANDO 2: .punta (Piazza la scommessa)
    // ==========================================
    if (command === 'punta' || command === 'bet') {
        let match = global.virtualMatches[chatId]
        
        if (!match) return m.reply(`『 ⚠️ 』 \`Nessun match attivo. Usa ${usedPrefix}virtuali\``)
        if (match.state !== 'betting') return m.reply(`『 🛑 』 \`Botteghino chiuso! Partita iniziata.\``)

        let user = global.db.data.users[m.sender]
        if (!args[0] || !args[1]) return m.reply(`👉 Usa: *${usedPrefix}punta [ESITO] [EURO]*\n💡 Esempio: *${usedPrefix}punta X 100*`)
        
        let scommessa = args[0].toUpperCase()
        let puntata = parseInt(args[1])
        let valide = Object.keys(QUOTE)

        if (!valide.includes(scommessa)) return m.reply(`『 ⚠️ 』 \`Esito errato. Scegli tra: 1, X, 2, GG, NG, OVER, UNDER\``)
        if (isNaN(puntata) || puntata <= 0) return m.reply(`『 ⚠️ 』 \`Puntata non valida.\``)
        if (user.euro < puntata) return m.reply(`『 💸 』 \`Fondi insufficienti. Hai solo ${formatNumber(user.euro)} €.\``)
        
        if (match.bets.some(b => b.sender === m.sender)) {
            return m.reply(`『 ⏳ 』 \`Hai già piazzato un ticket! Goditi il match.\``)
        }

        // Scala i soldi
        user.euro -= puntata
        match.bets.push({ sender: m.sender, scommessa, puntata })

        // Calcolo vincita potenziale
        let moltiplicatore = QUOTE[scommessa];
        let potenziale = Math.floor(puntata * moltiplicatore);

        // 🎨 GRAFICA RICEVUTA PREMIUM
        let ricevuta = `
╭── •✧ 𝐓𝐈𝐂𝐊𝐄𝐓 𝐋𝐄𝐆𝐀𝐌 ✧• ──╮
│ 👤 𝐁𝐞𝐭𝐭𝐞𝐫: @${m.sender.split('@')[0]}
│ ⚽ 𝐌𝐚𝐭𝐜𝐡: ${match.sq1} - ${match.sq2}
│ 🎯 𝐏𝐫𝐨𝐧𝐨𝐬𝐭𝐢𝐜𝐨: [ *${scommessa}* ]
│ 💶 𝐏𝐮𝐧𝐭𝐚𝐭𝐚: *${formatNumber(puntata)} €*
│ 💰 𝐏𝐨𝐭𝐞𝐧𝐳𝐢𝐚𝐥𝐞: *${formatNumber(potenziale)} €*
╰──────────────────╯`.trim()

        await conn.sendMessage(chatId, { text: ricevuta, mentions: [m.sender] }, { quoted: m })
    }
}

// ==========================================
// TELECRONACA LIVE AVANZATA
// ==========================================
async function avviaPartita(conn, chatId) {
    let match = global.virtualMatches[chatId]
    if (!match) return
    
    match.state = 'playing'

    let startMsg = `『 🚨 』 \`BOTTEGHINO CHIUSO!\`\n\n🏟️ Le squadre scendono in campo. L'arbitro guarda il cronometro... FISCHIO D'INIZIO! ⚽`
    await conn.sendMessage(chatId, { text: startMsg })

    let eventsCount = Math.floor(Math.random() * 3) + 4 // Da 4 a 6 eventi
    let minutiAzione = []
    for (let i = 0; i < eventsCount; i++) { minutiAzione.push(Math.floor(Math.random() * 89) + 1) }
    minutiAzione.sort((a, b) => a - b)
    
    for (let i = 0; i < eventsCount; i++) {
        await new Promise(resolve => setTimeout(resolve, 6000)) // Suspense tra le azioni
        
        let isTeam1 = Math.random() > 0.5
        let attackingTeam = isTeam1 ? match.sq1 : match.sq2
        let defendingTeam = isTeam1 ? match.sq2 : match.sq1
        let player = getPlayer(attackingTeam)
        
        let actionType = Math.random()
        let msg = ''

        if (actionType < 0.40) {
            // GOAL
            if (isTeam1) match.score1++; else match.score2++;
            let stiliGol = [
                `botta micidiale da fuori area di *${player}*! Palla all'incrocio!`,
                `colpo di testa imperioso di *${player}* su calcio d'angolo!`,
                `magia di *${player}* che salta due difensori e la piazza all'angolino!`,
                `errore clamoroso della difesa, *${player}* a tu per tu col portiere non perdona!`
            ]
            msg = `⚽ 𝐆𝐎𝐎𝐎𝐀𝐀𝐀𝐋 𝐏𝐄𝐑 𝐈𝐋 ${attackingTeam.toUpperCase()}!!!\n${stiliGol[Math.floor(Math.random()*stiliGol.length)]}\n\n📊 *${match.sq1} [ ${match.score1} - ${match.score2} ] ${match.sq2}*`
            await conn.sendMessage(chatId, { text: `⏱️ 𝐌𝐢𝐧𝐮𝐭𝐨 ${minutiAzione[i]}'\n${msg}` })
        } 
        else if (actionType < 0.60) {
            // VAR / RIGORE (Con 7 SECONDI DI ATTESA REALI)
            let msgVar = `📺 𝐀𝐓𝐓𝐄𝐍𝐙𝐈𝐎𝐍𝐄! 𝐈𝐋 𝐕𝐀𝐑 𝐂𝐇𝐈𝐀𝐌𝐀 𝐋'𝐀𝐑𝐁𝐈𝐓𝐑𝐎!\nCheck in corso per un possibile contatto su *${player}* in area del ${defendingTeam}...`
            await conn.sendMessage(chatId, { text: `⏱️ 𝐌𝐢𝐧𝐮𝐭𝐨 ${minutiAzione[i]}'\n${msgVar}` })
            
            // 🔥 IL VAR DURA 7 SECONDI ESATTI 🔥
            await new Promise(resolve => setTimeout(resolve, 7000)) 
            
            if (Math.random() > 0.5) {
                if (isTeam1) match.score1++; else match.score2++;
                msg = `✅ 𝐃𝐄𝐂𝐈𝐒𝐈𝐎𝐍𝐄 𝐕𝐀𝐑: 𝐄' 𝐑𝐈𝐆𝐎𝐑𝐄!\nDal dischetto va *${player}*... RETE! Spiazza il portiere con freddezza glaciale!\n\n📊 *${match.sq1} [ ${match.score1} - ${match.score2} ] ${match.sq2}*`
            } else {
                msg = `❌ 𝐃𝐄𝐂𝐈𝐒𝐈𝐎𝐍𝐄 𝐕𝐀𝐑: 𝐍𝐔𝐋𝐋𝐀 𝐃𝐈 𝐅𝐀𝐓𝐓𝐎!\nL'arbitro fa ampi cenni di proseguire. Il tocco era sul pallone. Si gioca!`
            }
            await conn.sendMessage(chatId, { text: msg })
        }
        else if (actionType < 0.80) {
            // SALVATAGGIO / ERRORE
            msg = `😱 𝐌𝐈𝐑𝐀𝐂𝐎𝐋𝐎 𝐃𝐄𝐋 𝐏𝐎𝐑𝐓𝐈𝐄𝐑𝐄!\n*${player}* calcia a botta sicura dall'area piccola, ma l'estremo difensore del ${defendingTeam} compie un intervento paranormale!`
            await conn.sendMessage(chatId, { text: `⏱️ 𝐌𝐢𝐧𝐮𝐭𝐨 ${minutiAzione[i]}'\n${msg}` })
        } 
        else {
            // CARTELLINO
            let defPlayer = getPlayer(defendingTeam)
            msg = `🟨 *𝐂𝐀𝐑𝐓𝐄𝐋𝐋𝐈𝐍𝐎 𝐆𝐈𝐀𝐋𝐋𝐎!*\nEntrata durissima di *${defPlayer}* per fermare il contropiede. Ammonizione sacrosanta.`
            await conn.sendMessage(chatId, { text: `⏱️ 𝐌𝐢𝐧𝐮𝐭𝐨 ${minutiAzione[i]}'\n${msg}` })
        }
    }

    await new Promise(resolve => setTimeout(resolve, 5000))

    // ==========================================
    // CALCOLO VINCITE E RESOCONTO
    // ==========================================
    let is1 = match.score1 > match.score2
    let isX = match.score1 === match.score2
    let is2 = match.score1 < match.score2
    let isGG = match.score1 > 0 && match.score2 > 0
    let isNG = match.score1 === 0 || match.score2 === 0
    let isOver = (match.score1 + match.score2) > 2
    let isUnder = (match.score1 + match.score2) <= 2

    let esitiVincenti = []
    if (is1) esitiVincenti.push('1'); if (isX) esitiVincenti.push('X'); if (is2) esitiVincenti.push('2');
    if (isGG) esitiVincenti.push('GG'); if (isNG) esitiVincenti.push('NG');
    if (isOver) esitiVincenti.push('OVER'); if (isUnder) esitiVincenti.push('UNDER');

    let winnersTxt = ''
    let scommettitori = match.bets.map(b => b.sender)
    
    for (let b of match.bets) {
        let won = false
        let multiplier = 0.0
        
        switch(b.scommessa) {
            case '1': if (is1) { won = true; multiplier = QUOTE['1']; } break;
            case 'X': if (isX) { won = true; multiplier = QUOTE['X']; } break;
            case '2': if (is2) { won = true; multiplier = QUOTE['2']; } break;
            case 'GG': if (isGG) { won = true; multiplier = QUOTE['GG']; } break;
            case 'NG': if (isNG) { won = true; multiplier = QUOTE['NG']; } break;
            case 'OVER': if (isOver) { won = true; multiplier = QUOTE['OVER']; } break;
            case 'UNDER': if (isUnder) { won = true; multiplier = QUOTE['UNDER']; } break;
        }

        if (won) {
            let winAmount = Math.floor(b.puntata * multiplier)
            global.db.data.users[b.sender].euro += winAmount
            winnersTxt += `\n✅ @${b.sender.split('@')[0]} vince *+${formatNumber(winAmount)} €*`
        } else {
            winnersTxt += `\n❌ @${b.sender.split('@')[0]} perde -${formatNumber(b.puntata)} €`
        }
    }

    let finale = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 𝐓 𝐑 𝐈 𝐏 𝐋 𝐈 𝐂 𝐄  𝐅 𝐈 𝐒 𝐂 𝐇 𝐈 𝐎 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 ⚽ 』 𝐑 𝐈 𝐒 𝐔 𝐋 𝐓 𝐀 𝐓 𝐎
🛡️ *${match.sq1}* [ ${match.score1} - ${match.score2} ] *${match.sq2}* 🛡️

🎯 *𝐄𝐬𝐢𝐭𝐢 𝐕𝐢𝐧𝐜𝐞𝐧𝐭𝐢:* ${esitiVincenti.join(', ')}
─────────────────`

    if (match.bets.length === 0) {
        finale += `\n😅 \`Nessuna giocata registrata.\``
    } else {
        finale += `\n🏆 𝐑𝐄𝐒𝐎𝐂𝐎𝐍𝐓𝐎 𝐆𝐈𝐎𝐂𝐀𝐓𝐄:${winnersTxt}`
    }
    
    await conn.sendMessage(chatId, { 
        text: finale.trim(), 
        mentions: scommettitori,
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363233544482011@newsletter',
                newsletterName: "⚽ 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐑𝐞𝐬𝐮𝐥𝐭𝐬",
                serverMessageId: 100
            }
        }
    })
    
    // Pulisce il db a fine partita
    delete global.virtualMatches[chatId]
}

handler.command = ['virtuali', 'punta', 'bet']
handler.group = true
export default handler

