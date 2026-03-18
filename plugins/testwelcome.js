import { participantsUpdate } from '../handler.js'

let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat]
    
    // Controllo se il welcome è attivo nel gruppo
    if (!chat.welcome) return m.reply("⚠️ `Devi prima accendere il welcome nel gruppo!`\nUsa: *.attiva welcome*")

    await m.reply("⏳ `Simulazione del sistema di Benvenuto e Addio in corso...`")

    try {
        // 1. Simula l'ENTRATA (con te come utente)
        await participantsUpdate.call(conn, {
            id: m.chat,
            participants: [m.sender],
            action: 'add'
        })

        // Aspetta 4 secondi per farti vedere la prima grafica
        await new Promise(resolve => setTimeout(resolve, 4000))

        // 2. Simula l'USCITA
        await participantsUpdate.call(conn, {
            id: m.chat,
            participants: [m.sender],
            action: 'remove'
        })

    } catch (e) {
        m.reply("❌ `Errore nella simulazione. Assicurati che il bot sia Admin.`")
        console.error(e)
    }
}

handler.help = ['testwelcome']
handler.tags = ['admin']
// Comando per avviare il test
handler.command = ['testwelcome', 'simulawelcome'] 
handler.admin = true
handler.group = true

export default handler

