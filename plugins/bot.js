/*⭑⭒━━━✦❘༻☾⋆⁺₊✧ Importazioni ✧₊⁺⋆☽༺❘✦━━━⭒⭑*/

import path from 'path'
import { promises as fs } from 'fs'

/*⭑⭒━━━✦❘༻☾⋆⁺₊✧ Handler base ✧₊⁺⋆☽༺❘✦━━━⭒⭑*/

var handler = m => m
handler.all = async function (m) {
  
/*⭑⭒━━━✦❘༻☾⋆⁺₊✧ Dati utente globali ✧₊⁺⋆☽༺❘✦━━━⭒⭑*/

  global.nome = conn.getName(m.sender)
  global.readMore = String.fromCharCode(8206).repeat(4001)
  global.authsticker = global.nome
  global.packsticker = global.nomepack

/*⭑⭒━━━✦❘༻☾⋆⁺₊✧ Immagini ✧₊⁺⋆☽༺❘✦━━━⭒⭑*/

  // Sceglie un numero a caso tra 1 e 6 per i tuoi sticker numerati
  let numStk = Math.floor(Math.random() * 6) + 1

  global.foto = [
    path.join(process.cwd(), 'media', 'sticker', `${numStk}.webp`),
    path.join(process.cwd(), 'media', 'menu', 'menu.jpg')
  ].getRandom()

/*⭑⭒━━━✦❘༻☾⋆⁺₊✧ Estetica: Thumb + Estilo ✧₊⁺⋆☽༺❘✦━━━⭒⭑*/

 let zwag = await fs.readFile(global.foto)
  global.estilo = {
    key: {
      fromMe: true,
      participant: `0@s.whatsapp.net`,
    },
    message: {
      orderMessage: {
        itemCount: 67,
        status: 0,
        surface: 1,
        message: global.nomepack,
        orderTitle: 'js gimme my moneyyy',
        thumbnail: zwag,
        sellerJid: '0@s.whatsapp.net'
      }
    }
  }

/*⭑⭒━━━✦❘༻☾⋆⁺₊✧ Contatto fake ✧₊⁺⋆☽༺❘✦━━━⭒⭑*/

global.fkontak = {
  key: {
    participant: "0@s.whatsapp.net",
    remoteJid: "status@broadcast",
    fromMe: false,
    id: "Halo"
  },
  message: {
    contactMessage: {
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:giuse ✧ bot\nitem1.TEL;waid=0:0\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
    }
  },
  participant: "0@s.whatsapp.net"
}

/*⭑⭒━━━✦❘༻☾⋆⁺₊✧ Canali newsletter ✧₊⁺⋆☽༺❘✦━━━⭒⭑*/

  let canale = await getRandomChannel()
  global.canaleRD = canale

  global.fake = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: canale.id,
        newsletterName: canale.name,
        serverMessageId: 1
      }
    },
    quoted: m
  }

  global.rcanal = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: canale.id,
        serverMessageId: 1,
        newsletterName: canale.name
      },
      externalAdReply: {
        title: testobot,
        body: dev,
        thumbnail: zwag,
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }
  }
}

/*⭑⭒━━━✦❘༻☾⋆⁺₊✧ Canali predefiniti ✧₊⁺⋆☽༺❘✦━━━⭒⭑*/

global.IdCanale = ['120363418582531215@newsletter'] 
global.NomeCanale = [
  '⭒━━✧❘༻☾⋆⁺₊🩸 𝓰𝓲𝓾𝓼𝓮𝓫𝓸𝓽 🕊️₊⁺⋆☽༺❘✧━━⭒',
  '✧⋆⁺₊❖⭑ 𝓰𝓲𝓾𝓼𝓮𝓫𝓸𝓽 ⭑❖₊⁺⋆✧',
  '༺☾⋆⁺₊✧ 𝓰𝓲𝓾𝓼𝓮𝓫𝓸𝓽 🕊️ ✧₊⁺⋆☽༻',
  '⋆⁺₊✦⭑彡 𝓰𝓲𝓾𝓼𝓮𝓫𝓸𝓽 彡⭑✦₊⁺⋆',
  '⭑⭒━━━✦༻ 𝖌𝖎𝖚𝖘𝖊𝖇𝖔𝖙 ༺✦━━━⭒⭑',
  '☁️⋆｡°✩ 𝕘𝕚𝕦𝕤𝕖𝕓𝕠𝕥 ✩°｡⋆☁️',
  '⋆⁺₊✧༚ 𝓖𝓲𝓾𝓼𝓮𝓫𝓸𝓽 ༚✧₊⁺⋆',
  '🌙⋆⁺₊ 𝙜𝙞𝙪𝙨𝙚𝙗𝙤𝙩 ₊⁺⋆🌙',
  '⌜☆⌟ 𝓰𝓲𝓾𝓼𝓮𝓫𝓸𝓽 ⌞☆⌝',
  '✧ 彡 𝘨𝘪𝘶𝘴𝘦𝘣𝘰𝘵 彡 ✧',
  '✦ ⌈ 𝔾𝕀𝕌𝕊𝔼𝔹𝕆𝕋 ⌋ ✦',
  '⋆⭑˚₊ 𝓖𝓲𝓾𝓼𝓮𝓫𝓸𝓽 ₊˚⭑⋆',
  '╰⊱♡⊰╮𝓰𝓲𝓾𝓼𝓮𝓫𝓸𝓽╭⊱♡⊰╯',
  '✿｡❀ 𓆩 𝖌𝖎𝖚𝖘𝖊𝖇𝖔𝖙 𓆪 ❀｡✿',
  '✧･ﾟ: *✧･ﾟ:* 𝓖𝓲𝓾𝓼𝓮𝓫𝓸𝓽 *:･ﾟ✧*:･ﾟ✧',
  '✦⭑★⭒ 𝒈𝒊𝒖𝒔𝒆𝒃𝒐𝒕 ⭒★⭑✦',
  '˗ˏˋ ☾ 𝚐𝚒𝚞𝚜𝚎𝚋𝚘𝚝 ☽ ˎˊ˗',
]

/*⭑⭒━━━✦❘༻☾⋆⁺₊✧ Utility globali ✧₊⁺⋆☽༺❘✦━━━⭒⭑*/

Array.prototype.getRandom = function () {
  return this[Math.floor(Math.random() * this.length)]
}
async function getRandomChannel() {
  if (!Array.isArray(global.IdCanale) || !Array.isArray(global.NomeCanale) || global.IdCanale.length === 0 || global.NomeCanale.length === 0) {
    return {
      id: '120363418582531215@newsletter',
      name: '⭒━━✧❘༻☾⋆⁺₊🩸 𝓰𝓲𝓾𝓼𝓮𝓫𝓸𝓽 🕊️₊⁺⋆☽༺❘✧━━⭒'
    }
  }
  let id = global.IdCanale.getRandom()
  let name = global.NomeCanale.getRandom()
  return { id, name }
}

export default handler
