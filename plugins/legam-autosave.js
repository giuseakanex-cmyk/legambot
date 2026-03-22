import chalk from 'chalk'

let handler = m => m

// Intercettatore Globale: viene letto ad ogni azione del bot
handler.before = async function (m) {
    let now = new Date()
    
    // Controlla se il database esiste e se è passato almeno 1 minuto dall'ultimo salvataggio
    if (global.db.data && (!global.lastSaveTime || now - global.lastSaveTime > 60000)) {
        try {
            // Forza la scrittura dei dati dalla RAM al file database.json
            await global.db.write()
            global.lastSaveTime = now
            
            // Console log super discreto ed elegante (puoi anche rimuoverlo se non lo vuoi vedere)
            // console.log(chalk.bgHex('#3b0d95').white.bold(' LEGAM OS ') + chalk.gray(' 💾 Salvataggio database eseguito in background.'));
        } catch (e) {
            console.error(chalk.red('[LEGAM OS] Errore critico nel salvataggio automatico del database:'), e)
        }
    }
    return true
}

export default handler

