import fetch from 'node-fetch';

const PERM = {
  ADMIN: 'admin',
  OWNER: 'owner',
  sam: 'sam',
};

const featureRegistry = [
  { key: 'welcome', store: 'chat', perm: PERM.ADMIN, aliases: ['benvenuto'], groupOnly: true, name: '👋 Welcome', desc: 'Messaggio di benvenuto' },
  { key: 'goodbye', store: 'chat', perm: PERM.ADMIN, aliases: ['addio'], groupOnly: true, name: '🚪 Addio', desc: 'Messaggio di addio' },
  { key: 'antispam', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '🛑 Antispam', desc: 'Antispam' },
  { key: 'antisondaggi', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '📊🚫 Anti-sondaggi', desc: 'Blocca sondaggi (non-admin)' },
  { key: 'antiparolacce', store: 'chat', perm: PERM.ADMIN, aliases: ['antitossici'], name: '🧼 Filtro parolacce', desc: 'Rimuove per parolacce/insulti' },
  { key: 'antiBot', store: 'chat', perm: PERM.ADMIN, aliases: ['antibot', 'antibots'], name: '🤖❌ Antibot', desc: 'Rimuove bot indesiderati' },
  { key: 'antiBot2', store: 'chat', perm: PERM.ADMIN, aliases: ['antisubbots', 'antisub'], name: '🤖🚫 Anti-subbots', desc: 'Blocca sub-bot' },
  { key: 'antitrava', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '🧨❌ Antitrava', desc: 'Blocca messaggi trava' },
  { key: 'antimedia', store: 'chat', perm: PERM.ADMIN, aliases: [], groupOnly: true, name: '🖼️❌ Antimedia', desc: 'Elimina foto/video' },
  { key: 'antioneview', store: 'chat', perm: PERM.ADMIN, aliases: ['antiviewonce'], groupOnly: true, name: '👁️‍🗨️ Antiviewonce', desc: 'Apre i viewonce' },
  { key: 'antitagall', store: 'chat', perm: PERM.ADMIN, aliases: ['anti-tagall', 'antimentioni'], groupOnly: true, name: '🏷️🚫 Anti-tagall', desc: 'Evita menzioni massive' },
  { key: 'autotrascrizione', store: 'chat', perm: PERM.ADMIN, aliases: ['autotrascrivi'], groupOnly: true, name: '📝🎧 Auto-trascrizione', desc: 'Trascrive gli audio' },
  { key: 'autotraduzione', store: 'chat', perm: PERM.ADMIN, aliases: ['autotraduci'], groupOnly: true, name: '🌍🈯 Auto-traduzione', desc: 'Traduce in italiano' },
  { key: 'rileva', store: 'chat', perm: PERM.ADMIN, aliases: ['detect'], groupOnly: true, name: '📡 Rileva', desc: 'Rileva eventi gruppo' },
  { key: 'antiporno', store: 'chat', perm: PERM.ADMIN, aliases: ['antiporn', 'antinsfw'], name: '🔞 Antiporno', desc: 'Filtro NSFW' },
  { key: 'antigore', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '🚫 Antigore', desc: 'Filtro contenuti violenti' },
  { key: 'modoadmin', store: 'chat', perm: PERM.ADMIN, aliases: ['soloadmin'], name: '🛡️ Soloadmin', desc: 'Solo admin usano bot' },
  { key: 'ai', store: 'chat', perm: PERM.ADMIN, aliases: ['ia'], groupOnly: true, name: '🧠 IA', desc: 'Intelligenza artificiale' },
  { key: 'vocali', store: 'chat', perm: PERM.ADMIN, aliases: ['siri'], groupOnly: true, name: '🎤 Siri', desc: 'Risponde con audio' },
  { key: 'antivoip', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '📞❌ Antivoip', desc: 'Antivoip' },
  { key: 'antiLink', store: 'chat', perm: PERM.ADMIN, aliases: ['antilink', 'nolink'], name: '🔗❌ Antilink', desc: 'Antilink WhatsApp' },
  { key: 'antiLinkUni', store: 'chat', perm: PERM.ADMIN, aliases: ['antilinkuni'], name: '🌍🔗❌ Antilink Uni', desc: 'Blocca tutti i link' },
  { key: 'antiLink2', store: 'chat', perm: PERM.ADMIN, aliases: ['antilink2'], name: '🌐❌ Antilink Social', desc: 'Blocca social link' },
  { key: 'reaction', store: 'chat', perm: PERM.ADMIN, aliases: ['reazioni'], groupOnly: true, name: '😎 Reazioni', desc: 'Reazioni automatiche' },
  { key: 'autolevelup', store: 'chat', perm: PERM.ADMIN, aliases: ['autolivello'], name: '⬆️ Autolivello', desc: 'Messaggio livello' },
  { key: 'antiprivato', store: 'bot', perm: PERM.OWNER, aliases: ['antipriv'], name: '🔒 Blocco privato', desc: 'Blocca chat privata' },
  { key: 'soloe', store: 'bot', perm: PERM.sam, aliases: ['solocreatore'], name: '👑 Solocreatore', desc: 'Solo owner' },
  { key: 'multiprefix', store: 'bot', perm: PERM.OWNER, aliases: ['multiprefisso'], onToggle: 'multiprefix', name: '🔣 Multiprefix', desc: 'Più prefissi' },
  { key: 'jadibotmd', store: 'bot', perm: PERM.OWNER, aliases: ['subbots', 'jadibotmd'], name: '🧬 Subbots', desc: 'Bot multi-sessione' },
  { key: 'antispambot', store: 'bot', perm: PERM.OWNER, aliases: [], name: '🤖🛑 Anti-spam comandi', desc: 'Limita spam bot' },
  { key: 'autoread', store: 'bot', perm: PERM.OWNER, aliases: ['read', 'lettura'], name: '👀 Lettura', desc: 'Autolettura msg' },
  { key: 'anticall', store: 'bot', perm: PERM.sam, aliases: [], name: '❌📞 Antichiamate', desc: 'Rifiuta chiamate' },
  { key: 'registrazioni', store: 'bot', perm: PERM.OWNER, aliases: ['registrazione'], name: '📛 Registrazione', desc: 'Obbligo registrazione' },
];

const aliasMap = new Map();
for (const feat of featureRegistry) {
  aliasMap.set(feat.key.toLowerCase(), feat);
  for (const alias of feat.aliases) {
    aliasMap.set(alias.toLowerCase(), feat);
  }
}

const adminkeyz = new Set(['welcome', 'goodbye', 'antispam', 'antisondaggi', 'antiparolacce', 'antiBot', 'antitrava', 'antimedia', 'antioneview', 'antitagall', 'autotrascrizione', 'autotraduzione', 'rileva', 'antiporno', 'antigore', 'modoadmin', 'ai', 'vocali', 'antivoip', 'antiLink', 'antiLinkUni', 'antiLink2', 'reaction', 'autolevelup']);
const ownerkeyz = new Set(['antiprivato', 'soloCreatore', 'multiprefix', 'jadibotmd', 'antispambot', 'autoread', 'anticall', 'registrazioni']);

const adminz = featureRegistry.filter(f => adminkeyz.has(f.key));
const ownerz = featureRegistry.filter(f => ownerkeyz.has(f.key));

function checkPermission(feat, { m, isAdmin, isOwner, isSam }) {
  if (feat.groupOnly && !m.isGroup && !isOwner) {
    return '╭ ━━━ ❨ ⚠️ 𝐀𝐕𝐕𝐈𝐒𝐎 ❩ ━━━ ╮\n│ ✦ 𝐆𝐑𝐔𝐏𝐏𝐎\n│ ╰➤ Comando valido solo nei gruppi.\n╰ ━━━━━━━━━━━━━ ╯';
  }
  switch (feat.perm) {
    case PERM.sam:
      if (!isSam) return '╭ ━━━ ❨ 👑 𝐎𝐖𝐍𝐄𝐑 ❩ ━━━ ╮\n│ ✦ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎\n│ ╰➤ Richiede privilegi di creatore.\n╰ ━━━━━━━━━━━━━ ╯';
      break;
    case PERM.OWNER:
      if (feat.store === 'bot' && !isOwner && !isSam) return '╭ ━━━ ❨ 👑 𝐎𝐖𝐍𝐄𝐑 ❩ ━━━ ╮\n│ ✦ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎\n│ ╰➤ Richiede privilegi di proprietario.\n╰ ━━━━━━━━━━━━━ ╯';
      if (feat.store === 'chat' && m.isGroup && !(isAdmin || isOwner || isSam))
        return '\n🛡️ *𝐒𝐎𝐋𝐎 𝐀𝐃𝐌𝐈𝐍*\n╰➤ ✦ Questo comando è riservato agli admin.';
      break;
    case PERM.ADMIN:
      if (m.isGroup && !(isAdmin || isOwner || isSam))
        return '\n🛡️ *𝐒𝐎𝐋𝐎 𝐀𝐃𝐌𝐈𝐍*\n╰➤ ✦ Questo comando è riservato agli admin.';
      break;
  }
  return null;
}

function handleMultiprefixToggle(bot) { /* ... [Codice originale] ... */ }

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isSam }) => {
  const userName = m.pushName || 'Utente';

  let groupProfilePicBuffer;
  try {
    const profilePicUrl = await conn.profilePictureUrl(m.chat, 'image');
    groupProfilePicBuffer = Buffer.from(await (await fetch(profilePicUrl)).arrayBuffer());
  } catch (e) {
    try {
      groupProfilePicBuffer = Buffer.from(await (await fetch(global.foto)).arrayBuffer());
    } catch (e2) {
      groupProfilePicBuffer = Buffer.from([]);
    }
  }

  // Creazione Canale Fake Inoltrato
  let contextFake = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363233544482011@newsletter',
      newsletterName: "✨.✦★彡 Settings by Giuse Ξ★✦.•",
      serverMessageId: 100
    },
    externalAdReply: {
      title: "✨ 𝐆𝐈𝐔𝐒𝐄𝐁𝐎𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 ✨",
      body: "Pannello di Controllo Moduli",
      mediaType: 1,
      jpegThumbnail: groupProfilePicBuffer
    }
  };

  let isEnable = /true|enable|attiva|(turn)?on|1/i.test(command);
  if (/disable|disattiva|off|0/i.test(command)) isEnable = false;

  // Inizializzazione DB
  global.db.data.chats = global.db.data.chats || {};
  global.db.data.users = global.db.data.users || {};
  global.db.data.settings = global.db.data.settings || {};
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
  global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};
  const botJid = conn.decodeJid(conn.user.jid);
  global.db.data.settings[botJid] = global.db.data.settings[botJid] || {};
  let chat = global.db.data.chats[m.chat];
  let bot = global.db.data.settings[botJid];

  const getStatus = (key) => {
    const feat = aliasMap.get(key.toLowerCase());
    if (!feat) return false;
    const target = feat.store === 'bot' ? bot : chat;
    return target[feat.key] || false;
  };

  const createSections = (features) => {
    const active = features.filter(f => getStatus(f.key));
    const inactive = features.filter(f => !getStatus(f.key));
    return [
      { title: '🔴 𝐌𝐨𝐝𝐮𝐥𝐢 𝐃𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐢', rows: inactive.map(f => ({ title: f.name, description: f.desc, id: `${usedPrefix}attiva ${f.key}` })) },
      { title: '🟢 𝐌𝐨𝐝𝐮𝐥𝐢 𝐀𝐭𝐭𝐢𝐯𝐚𝐭𝐢', rows: active.map(f => ({ title: f.name, description: f.desc, id: `${usedPrefix}disattiva ${f.key}` })) }
    ];
  };

  const buildVcard = () => `BEGIN:VCARD\nVERSION:3.0\nN:;${userName};;;\nFN:${userName}\nitem1.X-ABLabel:📱 Cellulare\nitem1.TEL;waid=${m.sender.split('@')[0]}:+${m.sender.split('@')[0]}\nitem2.EMAIL;type=INTERNET:bot@whatsapp.com\nitem2.X-ABLabel:💌 Email\nEND:VCARD`;

  // === MESSAGGIO MENU ===
  if (!args.length) {
    const adminSections = createSections(adminz);
    const ownerSections = createSections(ownerz);

    const adminCard = {
      image: { url: 'https://files.catbox.moe/pyp87f.jpg' }, // <--- FIX: Immagine riparata!
      title: '『 👥 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒 𝐀𝐃𝐌𝐈𝐍 』',
      body: '✧ _Gestisci le funzioni di sicurezza e intrattenimento del gruppo._',
      footer: '*─ׄ✦☾⋆⁺₊✧ 𝐆𝐈𝐔𝐒𝐄𝐁𝐎𝐓 ✧₊⁺⋆☽✦─ׅ⭒*',
      buttons: [{ name: 'single_select', buttonParamsJson: JSON.stringify({ title: '⚙️ APRI PANNELLO', sections: adminSections }) }]
    };

    let cards = [adminCard];
    if (isOwner || isSam) {
      cards.push({
        image: { url: 'https://files.catbox.moe/pyp87f.jpg' }, // <--- FIX: Immagine riparata per sicurezza!
        title: '『 👑 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒 𝐎𝐖𝐍𝐄𝐑 』',
        body: '✧ _Gestisci il core e i limiti globali del bot._',
        footer: '*─ׄ✦☾⋆⁺₊✧ 𝐆𝐈𝐔𝐒𝐄𝐁𝐎𝐓 ✧₊⁺⋆☽✦─ׅ⭒*',
        buttons: [{ name: 'single_select', buttonParamsJson: JSON.stringify({ title: '⚙️ APRI PANNELLO', sections: ownerSections }) }]
      });
    }

    const fkontak = { key: { participant: m.sender, remoteJid: '0@s.whatsapp.net', fromMe: false, id: 'BotAssistant' }, message: { contactMessage: { displayName: userName, vcard: buildVcard(), jpegThumbnail: groupProfilePicBuffer } }, participant: m.sender };

    return conn.sendMessage(m.chat, {
      text: 'ㅤㅤ⋆｡˚『 ╭ `𝐏𝐀𝐍𝐍𝐄𝐋𝐋𝐎 𝐃𝐈 𝐂𝐎𝐍𝐓𝐑𝐎𝐋𝐋𝐎` ╯ 』˚｡⋆',
      cards,
      contextInfo: contextFake
    }, { quoted: fkontak });
  }

  // === MESSAGGIO DI RIEPILOGO AZIONE ===
  let results = [];
  for (let type of args.map(arg => arg.toLowerCase())) {
    let result = { type, status: '', success: false };

    const feat = aliasMap.get(type);
    if (!feat) {
      result.status = '❌ _Comando Sconosciuto_';
      results.push(result);
      continue;
    }

    const permError = checkPermission(feat, { m, isAdmin, isOwner, isSam });
    if (permError) {
      result.status = permError;
      results.push(result);
      continue;
    }

    const target = feat.store === 'bot' ? bot : chat;
    if (target[feat.key] === isEnable) {
      result.status = `⚠️ _Già ${isEnable ? 'Attivo' : 'Disattivato'}_`;
      results.push(result);
      continue;
    }

    target[feat.key] = isEnable;
    if (feat.onToggle === 'multiprefix') handleMultiprefixToggle(bot);

    result.status = `✅ *${isEnable ? '𝐀𝐓𝐓𝐈𝐕𝐀𝐓𝐎' : '𝐃𝐈𝐒𝐀𝐓𝐓𝐈𝐕𝐀𝐓𝐎'}*`;
    result.success = true;
    results.push(result);
  }

  let summaryMessage = `ㅤㅤ⋆｡˚『 ╭ \`𝐒𝐘𝐒𝐓𝐄𝐌 𝐋𝐎𝐆\` ╯ 』˚｡⋆\n╭━━━━━━━━━━━━━━━━━━━━⬣\n`;
  for (const result of results) {
    const cleanType = String(result.type || '').trim().toUpperCase();
    const cleanStatus = String(result.status || '').replace(/^\s*\n+/, ' ').replace(/^\s*-\s*/, ' ').trimEnd();
    summaryMessage += `┃ ➤ 𝐅𝐮𝐧𝐳𝐢𝐨𝐧𝐞: \`${cleanType}\`\n┃ ╰ ⌕ 𝐒𝐭𝐚𝐭𝐨: ${cleanStatus}\n`;
  }
  summaryMessage += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒*`;

  const fkontak_confirm = { key: { participant: m.sender, remoteJid: '0@s.whatsapp.net', fromMe: false, id: 'BotFunction' }, message: { contactMessage: { displayName: userName, vcard: buildVcard(), jpegThumbnail: groupProfilePicBuffer } }, participant: m.sender };

  await conn.sendMessage(m.chat, { 
    text: summaryMessage, 
    contextInfo: contextFake 
  }, { quoted: fkontak_confirm });
};

handler.help = ['attiva', 'disattiva'];
handler.tags = ['main'];
handler.command = ['enable', 'disable', 'attiva', 'disattiva']; // <--- FIX: Rimosso 'on' e 'off' !

export default handler;
