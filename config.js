import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import chalk from 'chalk'
import fs from 'fs'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

/*⭑⭒━━━✦❘༻☾⋆⁺₊✧ 𝐋𝐄𝐆𝐀𝐌 𝐎𝐒 ✧₊⁺⋆☽༺❘✦━━━⭒⭑*/

// Prefisso impostato per leggere sia . che !
global.prefisso = '.!' 

global.sam = ['4915511872095']
global.owner = [
  ['4915511872095', 'giuse5', true],
  ['212780909981', 'linda', true],
  ['393780450454', 'giuse2', true],
  ['4915511872095', 'giusee', true],
]
global.mods = ['4915511872095', '393780450454']
global.prems = ['4915511872095', '393780450454']

/*⭑⭒━━━✦❘༻🩸 INFO BOT 🕊️༺❘✦━━━⭒⭑*/

global.nomepack = 'giuse ✧ bot'
global.nomebot = '✧˚🩸 𝐋𝐄𝐆𝐀𝐌 𝐁𝐎𝐓 🕊️˚✧'
global.wm = 'giuse ✧ bot'
global.autore = 'giuse'
global.dev = '⋆｡˚- giuse'
global.testobot = `༻⋆⁺₊ 𝐋𝐄𝐆𝐀𝐌 𝐂𝐎𝐑𝐄 ₊⁺⋆༺`
global.versione = pkg.version
global.errore = '⚠️ *Errore inatteso!* Usa il comando `.segnala <errore>` per avvisare lo sviluppatore.'

/*⭑⭒━━━✦❘༻🌐 LINK 🌐༺❘✦━━━⭒⭑*/

global.repobot = 'https://github.com/giuseakanex-cmyk/legambot'
global.gruppo = 'https://chat.whatsapp.com/bysamakavare'
global.canale = 'https://whatsapp.com/channel/0029VbB41Sa1Hsq1JhsC1Z1z'
global.insta = 'https://www.instagram.com/giuse'

/*⭑⭒━━━✦❘🗝️ API KEYS 🌍༺❘✦━━━⭒⭑*/

// Chiavi mantenute esattamente come le avevi tu
global.APIKeys = {
    spotifyclientid: 'varebot',
    spotifysecret: 'varebot',
    browserless: 'varebot',
    tmdb: 'varebot',
    ocrspace: 'jjjsheu',
    assemblyai: 'varebot',
    google: 'varebot',
    googleCX: 'varebot',
    genius: 'varebot',
    removebg: 'varebot',
    openrouter: 'varebot',
    sightengine_user: 'varebot',
    sightengine_secret: 'varebot',
    lastfm: '36f859a1fc4121e7f0e931806507d5f9',
}

/*⭑⭒━━━✦❘༻🪷 SISTEMA XP/EURO 💸༺❘✦━━━⭒⭑*/

global.multiplier = 1

/*⭑⭒━━━✦❘༻📦 RELOAD 📦༺❘✦━━━⭒⭑*/

let filePath = fileURLToPath(import.meta.url)
let fileUrl = pathToFileURL(filePath).href

const reloadConfig = async () => {
  console.log(chalk.bgHex('#3b0d95')(chalk.white.bold("File: 'config.js' Aggiornato")))
  try {
    await import(`${fileUrl}?update=${Date.now()}`)
  } catch (e) {
    console.error('[ERRORE] Errore nel reload di config.js:', e)
  }
}

watchFile(filePath, reloadConfig)

export default {}
