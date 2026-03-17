let handler = async (m, { conn, text }) => {
    // Individua il bersaglio
    let target = m.mentionedJid?.[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
    const botJid = conn.user.jid.split('@')[0];
    const targetId = target.split('@')[0];
    const normalizedTarget = conn.decodeJid?.(target) || target;

    // Se prova a doxare il bot
    if (target.includes(botJid)) {
        await conn.sendMessage(m.chat, { react: { text: '🛡️', key: m.key } });
        return m.reply('『 🛑 』 \`Accesso Negato.\`\n> I firewall del Legam OS sono impenetrabili. Non sfidare il tuo creatore.');
    }

    const isSelf = target === m.sender;

    // Animazione di caricamento Hacking
    let waitMsg = await conn.sendMessage(m.chat, { text: '\`[ 0% ] Inizializzazione protocollo OSINT...\`' }, { quoted: m });
    
    const hackSteps = [
        '\`[ 12% ] Intercettazione pacchetti TCP/IP...\`',
        '\`[ 38% ] Risoluzione indirizzo MAC e IP Pubblico...\`',
        '\`[ 64% ] Bypass della crittografia end-to-end...\`',
        '\`[ 89% ] Estrazione cronologia browser locale...\`',
        '\`[ 100% ] Compilazione report Legam OSINT...\`'
    ];

    for (let step of hackSteps) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Suspense
        await conn.sendMessage(m.chat, { edit: waitMsg.key, text: step });
    }

    // Recupera Info
    let targetName = null;
    try { targetName = await conn.getName(normalizedTarget); } catch (e) { targetName = targetId; }
    
    let isBusiness = false;
    try {
        const biz = await conn.getBusinessProfile?.(target);
        isBusiness = !!(biz && (biz.wid || biz.description));
    } catch (e) { isBusiness = false; }

    let ppUrl = null;
    try { ppUrl = await conn.profilePictureUrl(target, 'image'); } 
    catch (e) { ppUrl = 'https://i.ibb.co/gMDMVjJn/IMG-1824.png'; } // Fallback su Logo Legam se non ha la foto

    // Generazione Dati Realistici
    const carrier = getItalianCarrier(targetId);
    const deviceType = getDeviceType(m, target, isSelf);
    const fake = getExtendedFakeData(carrier, deviceType);
    const header = isSelf ? '𝐀𝐔𝐓𝐎-𝐁𝐑𝐄𝐀𝐂𝐇 𝐑𝐄𝐏𝐎𝐑𝐓' : '𝐎𝐒𝐈𝐍𝐓 𝐓𝐀𝐑𝐆𝐄𝐓 𝐑𝐄𝐏𝐎𝐑𝐓';

    const caption = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐒 𝐈 𝐍 𝐓 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🌐 』 ${header}
· 𝐓𝐚𝐫𝐠𝐞𝐭 ➻ @${targetId}
· 𝐀𝐜𝐜𝐨𝐮𝐧𝐭 ➻ ${isBusiness ? 'Business (API)' : 'Standard (Mobile)'}
· 𝐒𝐭𝐚𝐭𝐨 ➻ \`Compromesso\`

『 📡 』 𝐍 𝐄 𝐓 𝐖 𝐎 𝐑 𝐊
· 𝐈𝐏 𝐏𝐮𝐛𝐛𝐥𝐢𝐜𝐨 ➻ ${fake.ip}
· 𝐈𝐒𝐏 ➻ ${fake.isp}
· 𝐌𝐀𝐂 𝐀𝐝𝐝𝐫𝐞𝐬𝐬 ➻ ${fake.mac}
· 𝐏𝐨𝐫𝐭𝐞 𝐀𝐩𝐞𝐫𝐭𝐞 ➻ 80, 443, 22 (Vuln)
· 𝐂𝐞𝐥𝐥 𝐈𝐃 ➻ ${Math.floor(Math.random() * 90000) + 10000} (LTE)

『 📍 』 𝐆 𝐄 𝐎 𝐋 𝐎 𝐂 𝐀 𝐓 𝐈 𝐎 𝐍
· 𝐂𝐢𝐭𝐭𝐚̀ ➻ ${fake.city}
· 𝐂𝐨𝐨𝐫𝐝𝐢𝐧𝐚𝐭𝐞 ➻ ${fake.coords}
· 𝐏𝐫𝐞𝐜𝐢𝐬𝐢𝐨𝐧𝐞 ➻ ± 4.2 metri

『 📱 』 𝐃 𝐄 𝐕 𝐈 𝐂 𝐄
· 𝐌𝐨𝐝𝐞𝐥𝐥𝐨 ➻ ${fake.deviceModel}
· 𝐒𝐢𝐬𝐭𝐞𝐦𝐚 ➻ ${fake.os}
· 𝐂𝐏𝐔 ➻ ${fake.cpu}
· 𝐁𝐚𝐭𝐭𝐞𝐫𝐢𝐚 ➻ ${fake.battery}

『 👁️ 』 𝐏 𝐑 𝐈 𝐕 𝐀 𝐂 𝐘  𝐁 𝐑 𝐄 𝐀 𝐂 𝐇
· 𝐔𝐥𝐭𝐢𝐦𝐚 𝐑𝐢𝐜𝐞𝐫𝐜𝐚 ➻ "${fake.history}"
· 𝐌𝐚𝐥𝐰𝐚𝐫𝐞 ➻ ${fake.virus}

👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    // Elimina il messaggio di caricamento e invia il report ufficiale
    await conn.sendMessage(m.chat, { delete: waitMsg.key });

    await conn.sendMessage(m.chat, {
        image: { url: ppUrl },
        caption: caption,
        mentions: [target],
        contextInfo: {
            mentionedJid: [target],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363233544482011@newsletter',
                newsletterName: "☠️ 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐁𝐫𝐞𝐚𝐜𝐡",
                serverMessageId: 100
            }
        }
    }, { quoted: m });
};

handler.help = ['dox @utente'];
handler.tags = ['giochi'];
handler.command = /^(dox|osint)$/i;

export default handler;

// =========================================================
// FUNZIONI DI GENERAZIONE DATI REALISTICI
// =========================================================

function getItalianCarrier(num) {
  if (!num.startsWith('39')) return 'International Roaming / VoIP';
  const p = num.replace('39', '').substring(0, 3);
  
  const m = {
    'TIM Italia S.p.A.': ['330','331','333','334','335','336','337','338','339','360','368'],
    'Vodafone Omnitel B.V.': ['340','341','342','343','344','345','346','347','348','349','383'],
    'Wind Tre S.p.A.': ['320','322','323','324','327','328','329','380','388','389','391','392','393'],
    'Iliad Italia S.p.A.': ['351','352'],
    'PostePay S.p.A.': ['350','370','371','377','379','375'],
    'Fastweb S.p.A.': ['373', '3756'],
  };

  for (let [k, v] of Object.entries(m)) {
    if (v.includes(p)) return k;
  }
  return 'MVNO Sconosciuto';
}

function getDeviceType(m, target, isSelf) {
  const qId = m.quoted ? m.quoted.id : (isSelf ? m.key.id : null);
  if (qId) {
    if (qId.startsWith('3A') && qId.length < 30) return 'ios';
    if (qId.startsWith('3EB0')) return 'web';
    if (qId.length > 18) return 'android';
  }
  return 'unknown';
}

function getExtendedFakeData(carrier, type) {
  const iosModels = ['iPhone 15 Pro Max', 'iPhone 14 Pro', 'iPhone 13', 'iPhone 12 Mini', 'iPhone 11 (Refurbished)'];
  const androidModels = ['Samsung Galaxy S24 Ultra', 'Samsung Galaxy A54', 'Xiaomi 13 Pro', 'Google Pixel 8', 'Motorola Edge 40', 'OnePlus 11'];
  const webModels = ['Windows 11 Desktop', 'MacBook Air M2', 'Windows 10 Laptop', 'Linux Ubuntu Workstation'];
  
  const locations = [
    { c: 'Milano (IT)', lat: 45.464, lon: 9.190 },
    { c: 'Roma (IT)', lat: 41.902, lon: 12.496 },
    { c: 'Napoli (IT)', lat: 40.851, lon: 14.268 },
    { c: 'Torino (IT)', lat: 45.070, lon: 7.686 },
    { c: 'Palermo (IT)', lat: 38.115, lon: 13.362 },
    { c: 'Bologna (IT)', lat: 44.494, lon: 11.342 }
  ];

  const history = [
    'Come spiare WhatsApp gratis',
    'Prestiti senza busta paga',
    'Sintomi calvizie precoce',
    'Come bypassare ban Tinder',
    'Rolex replica perfetta',
    'Aumentare follower Instagram bot',
    'Test QI online gratis',
    'Come cancellare cronologia router'
  ];

  const virus = [
    'Trojan.Win32.Agent', 'Nessuno (Scansione pulita)', 'Keylogger_Hidden.apk', 
    'Adware.TrackingCookie', 'Spyware.Pegasus (Trace)'
  ];

  const loc = pick(locations);
  let model, os, cpu;
  
  if (type === 'ios') {
    model = pick(iosModels);
    os = `iOS 17.${randomInt(1, 4)}.${randomInt(0, 2)}`;
    cpu = 'Apple A' + randomInt(13, 17) + ' Bionic';
  } else if (type === 'web') {
    model = pick(webModels);
    os = 'Windows NT 10.0 / macOS 14.3';
    cpu = 'Intel Core i' + pick([5, 7, 9]) + ' / Apple Silicon';
  } else {
    model = pick(androidModels);
    os = `Android ${randomInt(12, 14)} (API ${randomInt(31, 34)})`;
    cpu = pick(['Snapdragon 8 Gen 2', 'Exynos 2200', 'MediaTek Dimensity 9200']);
  }

  const ip = `${randomInt(11, 212)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
  const mac = Array.from({length: 6}, () => Math.floor(Math.random()*256).toString(16).padStart(2, '0').toUpperCase()).join(':');

  return {
    deviceModel: model,
    ip: ip,
    mac: mac,
    isp: carrier,
    city: loc.c,
    coords: `${(loc.lat + (Math.random() * 0.01 - 0.005)).toFixed(6)}, ${(loc.lon + (Math.random() * 0.01 - 0.005)).toFixed(6)}`,
    os: os,
    cpu: cpu,
    battery: `${randomInt(5, 95)}%${randomInt(1,10) > 8 ? ' (In carica)' : ''}`,
    history: pick(history),
    virus: pick(virus)
  };
}

function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

