// Plugin by giuse, chiedere permesso prima di utilizzare.
global.virtualMatches = global.virtualMatches || {}

function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num)
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 🔥 SCUDO VIP LEGAM OS 🔥
const legamContext = (title) => ({
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363233544482011@newsletter',
        serverMessageId: 100,
        newsletterName: `⚽ ${title}`
    }
});

function refundBets(match) {
    if (!match || !match.bets) return;
    for (let b of match.bets) {
        if (global.db.data.users[b.sender]) {
            global.db.data.users[b.sender].euro += b.puntata;
        }
    }
}

// DATABASE GIOCATORI E FORZA SQUADRE
const serieAData = {
    "Inter": { rating: 95, roster: ["Lautaro Martinez", "Thuram", "Barella", "Calhanoglu", "Dimarco", "Bastoni"] },
    "Napoli": { rating: 93, roster: ["Kvaratskhelia", "Lukaku", "McTominay", "Politano", "Di Lorenzo", "Buongiorno"] },
    "Juventus": { rating: 92, roster: ["Vlahovic", "Yildiz", "Koopmeiners", "Conceicao", "Cambiaso", "Bremer"] },
    "Milan": { rating: 90, roster: ["Leao", "Morata", "Pulisic", "Reijnders", "Theo Hernandez", "Tomori"] },
    "Atalanta": { rating: 89, roster: ["Lookman", "Retegui", "De Ketelaere", "Ederson", "Pasalic", "Scalvini"] },
    "Lazio": { rating: 87, roster: ["Zaccagni", "Castellanos", "Dia", "Guendouzi", "Pedro", "Romagnoli"] },
    "Roma": { rating: 85, roster: ["Dybala", "Dovbyk", "Soulé", "Pellegrini", "El Shaarawy", "Mancini"] },
    "Fiorentina": { rating: 84, roster: ["Kean", "Gudmundsson", "Colpani", "Bove", "Gosens", "Dodo"] },
    "Bologna": { rating: 82, roster: ["Castro", "Orsolini", "Ndoye", "Freuler", "Fabbian", "Posch"] },
    "Torino": { rating: 79, roster: ["Adams", "Sanabria", "Ricci", "Ilic", "Vlasic", "Bellanova"] },
    "Genoa": { rating: 75, roster: ["Pinamonti", "Messias", "Frendrup", "Malinovskyi", "Bani"] },
    "Parma": { rating: 73, roster: ["Man", "Mihaila", "Bernabé", "Bonny", "Delprato"] },
    "Como": { rating: 72, roster: ["Cutrone", "Strefezza", "Nico Paz", "Fadera", "Dossena"] },
    "Empoli": { rating: 70, roster: ["Colombo", "Esposito", "Fazzini", "Gyasi", "Viti"] },
    "Verona": { rating: 68, roster: ["Tengstedt", "Lazovic", "Suslov", "Kastanos", "Dawidowicz"] },
    "Lecce": { rating: 65, roster: ["Krstovic", "Dorgu", "Oudin", "Banda", "Baschirotto"] }
}

function getPlayer(team, exclude = null) {
    let roster = serieAData[team].roster;
    let player = roster[Math.floor(Math.random() * roster.length)];
    while (player === exclude && roster.length > 1) {
        player = roster[Math.floor(Math.random() * roster.length)];
    }
    return player;
}

function calcolaQuote(sq1, sq2) {
    let r1 = serieAData[sq1].rating;
    let r2 = serieAData[sq2].rating;
    let diff = r1 - r2;

    let prob1 = 0.38 + (diff * 0.015);
    let prob2 = 0.38 - (diff * 0.015);
    let probX = 0.24 - (Math.abs(diff) * 0.005);

    prob1 = Math.max(0.10, Math.min(0.85, prob1));
    prob2 = Math.max(0.10, Math.min(0.85, prob2));
    
    let total = prob1 + prob2 + probX;
    prob1 /= total; prob2 /= total; probX /= total;

    const margin = 0.95; 

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

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    let chatId = m.chat;
    let cmd = command.toLowerCase();

    try {
        if (cmd === 'resetmatch' && isOwner) {
            if (global.virtualMatches[chatId]) {
                refundBets(global.virtualMatches[chatId]);
                delete global.virtualMatches[chatId];
                return m.reply(`『 👻 』 \`Fantasma esorcizzato! Partita resettata.\``);
            } else return m.reply(`『 💡 』 \`Nessun match bloccato in chat.\``);
        }

        if (cmd === 'virtuali') {
            if (global.virtualMatches[chatId]) return m.reply(`『 🛑 』 \`C'è già un match in corso!\``)

            const squadre = Object.keys(serieAData)
            let shuffled = squadre.sort(() => 0.5 - Math.random())
            let sq1 = shuffled[0]
            let sq2 = shuffled[1]

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

│ 💡 Usa: *${usedPrefix}bet [Esito] [Euro]*
│ 𝐄𝐬𝐞𝐦𝐩𝐢𝐨: *${usedPrefix}bet 1 500*

👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

            // Messaggio base senza foto per evitare timeout
            await conn.sendMessage(chatId, { text: msg, contextInfo: legamContext('Match Ufficiale') }, { quoted: m });

            global.virtualMatches[chatId].timer = setTimeout(async () => {
                await avviaPartita(conn, chatId, m)
            }, 40000)
            return
        }

        if (cmd === 'bet' || cmd === 'punta') {
            let match = global.virtualMatches[chatId]
            if (!match) return m.reply(`『 ⚠️ 』 \`Nessun match attivo. Usa ${usedPrefix}virtuali\``)
            if (match.state !== 'betting') return m.reply(`『 🛑 』 \`Botteghino chiuso! Partita iniziata.\``)

            let user = global.db.data.users[m.sender]
            if (!args[0] || !args[1]) return m.reply(`👉 Usa: *${usedPrefix}bet [ESITO] [EURO]*`)
            
            let scommessa = args[0].toUpperCase()
            let puntata = parseInt(args[1])
            let valide = Object.keys(match.quote)

            if (!valide.includes(scommessa)) return m.reply(`『 ⚠️ 』 \`Esito errato. Scegli tra: 1, X, 2, GG, NG, OVER, UNDER\``)
            if (isNaN(puntata) || puntata <= 0) return m.reply(`『 ⚠️ 』 \`Puntata non valida.\``)
            if (user.euro < puntata) return m.reply(`『 💸 』 \`Fondi insufficienti. Hai solo ${formatNumber(user.euro)} €.\``)
            
            if (match.bets.some(b => b.sender === m.sender)) {
                return m.reply(`『 ⏳ 』 \`Hai già piazzato un ticket! Goditi il match.\``)
            }

            user.euro -= puntata
            match.bets.push({ sender: m.sender, scommessa, puntata })

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

            await conn.sendMessage(chatId, { text: ricevuta, mentions: [m.sender], contextInfo: legamContext('Ticket Registrato') }, { quoted: m })
        }
    } catch (e) {
        console.error("Errore comandi:", e);
    }
}

// 🔥 LA MAXI-TELECRONACA ANTI-SPAM 🔥
async function avviaPartita(conn, chatId, originalMsg) {
    let match = global.virtualMatches[chatId]
    if (!match) return
    match.state = 'playing'

    try {
        await conn.sendMessage(chatId, { 
            text: `『 🚨 』 \`BOTTEGHINO CHIUSO!\`\n\n🏟️ Le squadre scendono in campo, atmosfera caldissima! ⏳ _Elaborazione del match in corso..._`,
            contextInfo: legamContext('Inizio Match')
        }, { quoted: originalMsg }).catch(()=>{})

        // Il bot "pensa" per 12 secondi (crea l'attesa ma NON manda messaggi spam)
        await delay(12000); 

        let eventsCount = Math.floor(Math.random() * 3) + 5 // Da 5 a 7 azioni per partita
        let minutiAzione = []
        for (let i = 0; i < eventsCount; i++) { minutiAzione.push(Math.floor(Math.random() * 89) + 1) }
        minutiAzione.sort((a, b) => a - b)
        
        let r1 = serieAData[match.sq1].rating;
        let r2 = serieAData[match.sq2].rating;
        let totalR = r1 + r2;

        let cronaca = `╭── 🎙️ 𝐇𝐈𝐆𝐇𝐋𝐈𝐆𝐇𝐓𝐒 𝐌𝐀𝐓𝐂𝐇 ──⬣\n\n`;

        for (let i = 0; i < eventsCount; i++) {
            let isTeam1 = Math.random() < (r1 / totalR) 
            let attTeam = isTeam1 ? match.sq1 : match.sq2
            let defTeam = isTeam1 ? match.sq2 : match.sq1
            
            let attPlayer = getPlayer(attTeam)
            let assistPlayer = getPlayer(attTeam, attPlayer)
            let defPlayer = getPlayer(defTeam)
            
            let actionType = Math.random()

            // 1. GOAL (35%)
            if (actionType < 0.35) {
                if (isTeam1) match.score1++; else match.score2++;
                let stiliGol = [
                    `Riceve da *${assistPlayer}* e trafigge il portiere con un missile!`,
                    `Azione personale! Salta netto *${defPlayer}* e la mette all'incrocio!`,
                    `Stacco imperioso su calcio d'angolo, palla in rete!`,
                    `Approfitta di uno svarione di *${defPlayer}* e non perdona da due passi!`,
                    `Pennellata magica su punizione, palla oltre la barriera!`
                ];
                let desc = stiliGol[Math.floor(Math.random() * stiliGol.length)];
                cronaca += `▶️ ⏱️ *${minutiAzione[i]}'*: ⚽ *GOOOAAAL ${attTeam.toUpperCase()}!* [${match.score1}-${match.score2}]\n↳ *${attPlayer}*! ${desc}\n\n`;
            } 
            // 2. PALO / TRAVERSA (15%)
            else if (actionType < 0.50) {
                let legni = [`Botta da fuori di *${attPlayer}*... *TRAVERSA PIENA!*`, `*${attPlayer}* incrocia di destro, palla sul *PALO* a portiere battuto!`];
                cronaca += `▶️ ⏱️ *${minutiAzione[i]}'*: 🪵 *CLAMOROSO LEGNO!*\n↳ ${legni[Math.floor(Math.random() * legni.length)]}\n\n`;
            }
            // 3. VAR (15%)
            else if (actionType < 0.65) {
                let isGoal = Math.random() > 0.5;
                if (isGoal) {
                    if (isTeam1) match.score1++; else match.score2++;
                    cronaca += `▶️ ⏱️ *${minutiAzione[i]}'*: 📺 *VAR!* Fallo su *${attPlayer}*...\n↳ ✅ *RIGORE ASSEGNATO E SEGNATO!* Spiazzato il portiere! [${match.score1}-${match.score2}]\n\n`;
                } else {
                    cronaca += `▶️ ⏱️ *${minutiAzione[i]}'*: 📺 *VAR!* Dubbio tocco di mano di *${defPlayer}*...\n↳ ❌ Niente rigore, l'arbitro fa proseguire.\n\n`;
                }
            } 
            // 4. MIRACOLO PORTIERE (15%)
            else if (actionType < 0.80) {
                cronaca += `▶️ ⏱️ *${minutiAzione[i]}'*: 🧤 *MIRACOLO!*\n↳ *${attPlayer}* calcia a botta sicura, ma il portiere del ${defTeam} vola e salva il risultato!\n\n`;
            } 
            // 5. CARTELLINI (20%)
            else {
                if (Math.random() > 0.3) {
                    cronaca += `▶️ ⏱️ *${minutiAzione[i]}'*: 🟨 *GIALLO!*\n↳ Intervento duro di *${defPlayer}* sulle caviglie di *${attPlayer}*.\n\n`;
                } else {
                    cronaca += `▶️ ⏱️ *${minutiAzione[i]}'*: 🟥 *ROSSO DIRETTO!*\n↳ Follia di *${defPlayer}* che stende l'avversario lanciato a rete. ${defTeam} in dieci!\n\n`;
                }
            }
        }

        cronaca += `╰───────────────⬣\n`;

        // CALCOLO VINCITORI
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
                let winAmount = Math.floor(b.puntata * match.quote[b.scommessa])
                global.db.data.users[b.sender].euro += winAmount
                winnersTxt += `\n✅ @${b.sender.split('@')[0]} vince *+${formatNumber(winAmount)} €*`
            } else {
                winnersTxt += `\n❌ @${b.sender.split('@')[0]} perde -${formatNumber(b.puntata)} €`
            }
        }

        // ASSEMBLAGGIO MESSAGGIO FINALE
        let finale = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 𝐓 𝐑 𝐈 𝐏 𝐋 𝐈 𝐂 𝐄  𝐅 𝐈 𝐒 𝐂 𝐇 𝐈 𝐎 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 ⚽ 』 𝐑 𝐈 𝐒 𝐔 𝐋 𝐓 𝐀 𝐓 𝐎
🛡️ *${match.sq1}* [ ${match.score1} - ${match.score2} ] *${match.sq2}* 🛡️

${cronaca}
🎯 *𝐄𝐬𝐢𝐭𝐢 𝐕𝐢𝐧𝐜𝐞𝐧𝐭𝐢:* ${esitiVincenti.join(', ')}

│ 🏆 𝐑 𝐄 𝐒 𝐎 𝐂 𝐎 𝐍 𝐓 𝐎`

        finale += match.bets.length === 0 ? `\n│ 😅 \`Nessuna giocata registrata.\`` : winnersTxt
        finale += `\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`

        await conn.sendMessage(chatId, { 
            text: finale.trim(), 
            mentions: scommettitori,
            contextInfo: legamContext('Risultato Ufficiale')
        }, { quoted: originalMsg })

    } catch (err) {
        console.error("[VIRTUALI] Errore critico in avviaPartita:", err)
        refundBets(match)
        await conn.sendMessage(chatId, { text: `『 ❌ 』 \`Errore tecnico. Partita annullata e puntate rimborsate.\`` }).catch(()=>{})
    } finally {
        // L'AMMAZZA-FANTASMI SUPREMO. Qualsiasi cosa succeda, libera la memoria.
        delete global.virtualMatches[chatId]
    }
}

handler.command = /^(virtuali|bet|punta|resetmatch)$/i;
handler.group = true
export default handler


