// Plugin by giuse, chiedere permesso prima di utilizzare.
global.virtualMatches = global.virtualMatches || {}

// URL Immagine Ufficiale Virtuali
const VIRTUALI_IMAGE_URL = 'https://i.ibb.co/XkXzT452/IMG-2039.jpg';

function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num)
}

// DATABASE GIOCATORI E FORZA SQUADRE (RATING DA 1 A 100)
const serieAData = {
    "Inter": { rating: 95, roster: ["Lautaro Martinez", "Thuram", "Barella", "Calhanoglu", "Dimarco"] },
    "Napoli": { rating: 93, roster: ["Kvaratskhelia", "Lukaku", "McTominay", "Politano", "Di Lorenzo"] },
    "Juventus": { rating: 92, roster: ["Vlahovic", "Yildiz", "Koopmeiners", "Conceicao", "Cambiaso"] },
    "Milan": { rating: 90, roster: ["Leao", "Morata", "Pulisic", "Reijnders", "Theo Hernandez"] },
    "Atalanta": { rating: 89, roster: ["Lookman", "Retegui", "De Ketelaere", "Ederson", "Pasalic"] },
    "Lazio": { rating: 87, roster: ["Zaccagni", "Castellanos", "Dia", "Guendouzi", "Pedro"] },
    "Roma": { rating: 85, roster: ["Dybala", "Dovbyk", "Soulé", "Pellegrini", "El Shaarawy"] },
    "Fiorentina": { rating: 84, roster: ["Kean", "Gudmundsson", "Colpani", "Bove", "Gosens"] },
    "Bologna": { rating: 82, roster: ["Castro", "Orsolini", "Ndoye", "Freuler", "Fabbian"] },
    "Torino": { rating: 79, roster: ["Adams", "Sanabria", "Ricci", "Ilic", "Vlasic"] },
    "Genoa": { rating: 75, roster: ["Pinamonti", "Messias", "Frendrup", "Malinovskyi"] },
    "Parma": { rating: 73, roster: ["Man", "Mihaila", "Bernabé", "Bonny"] },
    "Como": { rating: 72, roster: ["Cutrone", "Strefezza", "Nico Paz", "Fadera"] },
    "Empoli": { rating: 70, roster: ["Colombo", "Esposito", "Fazzini", "Gyasi"] },
    "Verona": { rating: 68, roster: ["Tengstedt", "Lazovic", "Suslov", "Kastanos"] },
    "Lecce": { rating: 65, roster: ["Krstovic", "Dorgu", "Oudin", "Banda"] }
}

function getPlayer(team) {
    return serieAData[team].roster[Math.floor(Math.random() * serieAData[team].roster.length)]
}

// ALGORITMO LEGAM: Generazione Quote Dinamiche in base alla forza
function calcolaQuote(sq1, sq2) {
    let r1 = serieAData[sq1].rating;
    let r2 = serieAData[sq2].rating;
    let diff = r1 - r2;

    // Calcolo probabilità (Normalizzate)
    let prob1 = 0.38 + (diff * 0.015);
    let prob2 = 0.38 - (diff * 0.015);
    let probX = 0.24 - (Math.abs(diff) * 0.005);

    // Muro di sicurezza probabilità
    prob1 = Math.max(0.10, Math.min(0.85, prob1));
    prob2 = Math.max(0.10, Math.min(0.85, prob2));
    
    // Ricalibro totale a 1 (100%)
    let total = prob1 + prob2 + probX;
    prob1 /= total; prob2 /= total; probX /= total;

    // Margine del banco (5% di aggio come i veri bookmaker)
    const margin = 0.95; 

    // OVER/UNDER & GG/NG dinamici
    let avgR = (r1 + r2) / 2;
    let probOver = 0.45 + (avgR > 85 ? 0.08 : 0) + (Math.abs(diff) > 15 ? 0.07 : 0);
    let probGG = 0.50 + (Math.abs(diff) < 10 ? 0.08 : -0.05);

    return {
        '1': parseFloat(((1 / prob1) * margin).toFixed(2)),
        'X': parseFloat(((1 / probX) * margin).toFixed(2)),
        '2': parseFloat(((1 / prob2) * margin).toFixed(2)),
        'OVER': parseFloat(((1 / probOver) * margin).toFixed(2)),
        'UNDER': parseFloat(((1 / (1 - probOver)) * margin).toFixed(2)),
        'GG': parseFloat(((1 / probGG) * margin).toFixed(2)),
        'NG': parseFloat(((1 / (1 - probGG)) * margin).toFixed(2))
    }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let chatId = m.chat

    if (command === 'virtuali') {
        if (global.virtualMatches[chatId]) return m.reply(`『 🛑 』 \`C'è già un match in corso!\``)

        const squadre = Object.keys(serieAData)
        let shuffled = squadre.sort(() => 0.5 - Math.random())
        let sq1 = shuffled[0]
        let sq2 = shuffled[1]

        // Calcola e blocca le quote per questo specifico match
        let quoteMatch = calcolaQuote(sq1, sq2)

        global.virtualMatches[chatId] = {
            state: 'betting', sq1: sq1, sq2: sq2, score1: 0, score2: 0, 
            bets: [], timer: null, quote: quoteMatch
        }

        let msg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 𝐋 𝐄 𝐆 𝐀 𝐌  𝐁 𝐄 𝐓 𝐓 𝐈 𝐍 𝐆 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🏟️ 』 𝐌 𝐀 𝐓 𝐂 𝐇  𝐔 𝐅 𝐅 𝐈 𝐂 𝐈 𝐀 𝐋 𝐄
· ⚔️ *${sq1}* 🆚 *${sq2}*
· ⏱️ 𝐂𝐡𝐢𝐮𝐬𝐮𝐫𝐚: 40 Secondi

『 📊 』 𝐐 𝐔 𝐎 𝐓 𝐄  𝐃 𝐈 𝐍 𝐀 𝐌 𝐈 𝐂 𝐇 𝐄
· [ 𝟏 ] Vittoria ${sq1} ➻ *${quoteMatch['1'].toFixed(2)}x*
· [ 𝐗 ] Pareggio ➻ *${quoteMatch['X'].toFixed(2)}x*
· [ 𝟐 ] Vittoria ${sq2} ➻ *${quoteMatch['2'].toFixed(2)}x*
· [ 𝐆𝐆 ] Entrambe a Segno ➻ *${quoteMatch['GG'].toFixed(2)}x*
· [ 𝐍𝐆 ] Almeno una a secco ➻ *${quoteMatch['NG'].toFixed(2)}x*
· [ 𝐎𝐕𝐄𝐑 ] Più di 2 Goal ➻ *${quoteMatch['OVER'].toFixed(2)}x*
· [ 𝐔𝐍𝐃𝐄𝐑 ] Max 2 Goal ➻ *${quoteMatch['UNDER'].toFixed(2)}x*

│ 💡 Usa: *${usedPrefix}punta [Esito] [Euro]*
│ 𝐄𝐬𝐞𝐦𝐩𝐢𝐨: *${usedPrefix}punta 1 500*

👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

        await conn.sendMessage(chatId, {
            image: { url: VIRTUALI_IMAGE_URL },
            caption: msg,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363233544482011@newsletter',
                    newsletterName: "🎰 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐁𝐞𝐭𝐭𝐢𝐧𝐠",
                    serverMessageId: 100
                }
            }
        })

        global.virtualMatches[chatId].timer = setTimeout(async () => {
            await avviaPartita(conn, chatId)
        }, 40000)
        return
    }

    if (command === 'punta' || command === 'bet') {
        let match = global.virtualMatches[chatId]
        if (!match) return m.reply(`『 ⚠️ 』 \`Nessun match attivo. Usa ${usedPrefix}virtuali\``)
        if (match.state !== 'betting') return m.reply(`『 🛑 』 \`Botteghino chiuso! Partita iniziata.\``)

        let user = global.db.data.users[m.sender]
        if (!args[0] || !args[1]) return m.reply(`👉 Usa: *${usedPrefix}punta [ESITO] [EURO]*`)
        
        let scommessa = args[0].toUpperCase()
        let puntata = parseInt(args[1])
        let valide = Object.keys(match.quote) // Prende le chiavi dal match attuale

        if (!valide.includes(scommessa)) return m.reply(`『 ⚠️ 』 \`Esito errato. Scegli tra: 1, X, 2, GG, NG, OVER, UNDER\``)
        if (isNaN(puntata) || puntata <= 0) return m.reply(`『 ⚠️ 』 \`Puntata non valida.\``)
        if (user.euro < puntata) return m.reply(`『 💸 』 \`Fondi insufficienti. Hai solo ${formatNumber(user.euro)} €.\``)
        
        if (match.bets.some(b => b.sender === m.sender)) {
            return m.reply(`『 ⏳ 』 \`Hai già piazzato un ticket! Goditi il match.\``)
        }

        user.euro -= puntata
        match.bets.push({ sender: m.sender, scommessa, puntata })

        // Usa la quota dinamica esatta per calcolare il potenziale
        let moltiplicatore = match.quote[scommessa];
        let potenziale = Math.floor(puntata * moltiplicatore);

        let ricevuta = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 𝐓 𝐈 𝐂 𝐊 𝐄 𝐓  𝐋 𝐄 𝐆 𝐀 𝐌 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 👤 』 𝐁 𝐞 𝐭 𝐭 𝐞 𝐫
· @${m.sender.split('@')[0]}

『 🎯 』 𝐃 𝐞 𝐭 𝐭 𝐚 𝐠 𝐥 𝐢
· 𝐌𝐚𝐭𝐜𝐡 ➻ ${match.sq1} - ${match.sq2}
· 𝐏𝐫𝐨𝐧𝐨𝐬𝐭𝐢𝐜𝐨 ➻ [ *${scommessa}* ] (Quota: ${moltiplicatore.toFixed(2)})
· 𝐏𝐮𝐧𝐭𝐚𝐭𝐚 ➻ *${formatNumber(puntata)} €*
· 𝐏𝐨𝐭𝐞𝐧𝐳𝐢𝐚𝐥𝐞 ➻ *${formatNumber(potenziale)} €*

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

        await conn.sendMessage(chatId, { text: ricevuta, mentions: [m.sender] }, { quoted: m })
    }
}

// ==========================================
// TELECRONACA E SIMULATORE MATEMATICO
// ==========================================
async function avviaPartita(conn, chatId) {
    let match = global.virtualMatches[chatId]
    if (!match) return
    match.state = 'playing'

    await conn.sendMessage(chatId, { text: `『 🚨 』 \`BOTTEGHINO CHIUSO!\`\n\n🏟️ Le squadre scendono in campo. FISCHIO D'INIZIO! ⚽` })

    let eventsCount = Math.floor(Math.random() * 3) + 4
    let minutiAzione = []
    for (let i = 0; i < eventsCount; i++) { minutiAzione.push(Math.floor(Math.random() * 89) + 1) }
    minutiAzione.sort((a, b) => a - b)
    
    // Simula la partita basandosi sulla forza reale delle squadre
    let r1 = serieAData[match.sq1].rating;
    let r2 = serieAData[match.sq2].rating;
    let totalR = r1 + r2;

    for (let i = 0; i < eventsCount; i++) {
        await new Promise(resolve => setTimeout(resolve, 6000)) 
        
        // Chi attacca? La squadra con più rating ha percentuali più alte di fare l'azione
        let isTeam1 = Math.random() < (r1 / totalR) 
        let attackingTeam = isTeam1 ? match.sq1 : match.sq2
        let defendingTeam = isTeam1 ? match.sq2 : match.sq1
        let player = getPlayer(attackingTeam)
        
        let actionType = Math.random()
        let msg = ''

        if (actionType < 0.40) {
            if (isTeam1) match.score1++; else match.score2++;
            let stiliGol = [
                `che fa partire un missile terra-aria da fuori area!`,
                `che svetta più in alto di tutti su calcio d'angolo e insacca di testa!`,
                `che salta netto l'ultimo difensore e deposita in rete!`,
                `che approfitta di una dormita clamorosa della difesa e non perdona!`
            ]
            msg = `⚽ 𝐆𝐎𝐎𝐎𝐀𝐀𝐀𝐋 𝐏𝐄𝐑 𝐈𝐋 ${attackingTeam.toUpperCase()}!!!\nRete di *${player}* ${stiliGol[Math.floor(Math.random()*stiliGol.length)]}\n\n📊 *${match.sq1} [ ${match.score1} - ${match.score2} ] ${match.sq2}*`
            await conn.sendMessage(chatId, { text: `⏱️ 𝐌𝐢𝐧𝐮𝐭𝐨 ${minutiAzione[i]}'\n${msg}` })
        } 
        else if (actionType < 0.60) {
            let msgVar = `📺 𝐀𝐓𝐓𝐄𝐍𝐙𝐈𝐎𝐍𝐄 𝐀𝐋 𝐕𝐀𝐑!\nCheck per un possibile fallo su *${player}* nell'area del ${defendingTeam}...`
            await conn.sendMessage(chatId, { text: `⏱️ 𝐌𝐢𝐧𝐮𝐭𝐨 ${minutiAzione[i]}'\n${msgVar}` })
            await new Promise(resolve => setTimeout(resolve, 7000)) 
            
            if (Math.random() > 0.5) {
                if (isTeam1) match.score1++; else match.score2++;
                msg = `✅ 𝐃𝐄𝐂𝐈𝐒𝐈𝐎𝐍𝐄 𝐕𝐀𝐑: 𝐄' 𝐑𝐈𝐆𝐎𝐑𝐄!\n*${player}* dal dischetto... RETE! Spiazza il portiere!\n\n📊 *${match.sq1} [ ${match.score1} - ${match.score2} ] ${match.sq2}*`
            } else {
                msg = `❌ 𝐃𝐄𝐂𝐈𝐒𝐈𝐎𝐍𝐄 𝐕𝐀𝐑: 𝐍𝐈𝐄𝐍𝐓𝐄 𝐑𝐈𝐆𝐎𝐑𝐄!\nSi continua a giocare, palla al ${defendingTeam}.`
            }
            await conn.sendMessage(chatId, { text: msg })
        }
        else if (actionType < 0.80) {
            msg = `😱 𝐌𝐈𝐑𝐀𝐂𝐎𝐋𝐎 𝐃𝐄𝐋 𝐏𝐎𝐑𝐓𝐈𝐄𝐑𝐄!\n*${player}* calcia a botta sicura, ma l'estremo difensore del ${defendingTeam} fa una parata pazzesca!`
            await conn.sendMessage(chatId, { text: `⏱️ 𝐌𝐢𝐧𝐮𝐭𝐨 ${minutiAzione[i]}'\n${msg}` })
        } else {
            let defPlayer = getPlayer(defendingTeam)
            msg = `🟨 *𝐂𝐀𝐑𝐓𝐄𝐋𝐋𝐈𝐍𝐎 𝐆𝐈𝐀𝐋𝐋𝐎!*\nIntervento in ritardo di *${defPlayer}* (${defendingTeam}) per fermare il contropiede di ${player}.`
            await conn.sendMessage(chatId, { text: `⏱️ 𝐌𝐢𝐧𝐮𝐭𝐨 ${minutiAzione[i]}'\n${msg}` })
        }
    }

    await new Promise(resolve => setTimeout(resolve, 5000))
    await finalizeGame(conn, chatId, match)
}

async function finalizeGame(conn, chatId, match) {
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
        switch(b.scommessa) {
            case '1': won = is1; break; case 'X': won = isX; break; case '2': won = is2; break;
            case 'GG': won = isGG; break; case 'NG': won = isNG; break;
            case 'OVER': won = isOver; break; case 'UNDER': won = isUnder; break;
        }

        if (won) {
            let winAmount = Math.floor(b.puntata * match.quote[b.scommessa]) // Usa la quota dinamica
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

│ 🏆 𝐑 𝐄 𝐒 𝐎 𝐂 𝐎 𝐍 𝐓 𝐎`

    finale += match.bets.length === 0 ? `\n│ 😅 \`Nessuna giocata registrata.\`` : winnersTxt
    finale += `\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`

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
    
    delete global.virtualMatches[chatId]
}

handler.command = ['virtuali', 'punta', 'bet']
handler.group = true
export default handler


