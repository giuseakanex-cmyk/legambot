import fs from 'fs'
import path from 'path'
import os from 'os'
import { exec } from 'child_process'

// 🔥 SCUDO VIP LEGAM OS 🔥
const legamContext = (title) => ({
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363233544482011@newsletter',
        serverMessageId: 100,
        newsletterName: `🎛️ ${title}`
    }
});

// 🎛️ MOTORE AUDIO LEGAM (Formule FFmpeg proprietarie pre-calibrate)
const effettiLegam = {
    'bass': 'equalizer=f=60:width_type=h:width=50:g=15',
    '8d': 'apulsator=hz=0.125',
    'demone': 'asetrate=44100*0.7,acrusher=0.1:1:64:0:log',
    'alieno': 'asetrate=44100*1.15,atempo=0.85,aecho=0.8:0.8:50:0.5',
    'robot': 'afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75',
    'scoiattolo': 'asetrate=44100*1.35,atempo=0.85',
    'nightcore': 'atempo=1.06,asetrate=44100*1.25',
    'lento': 'atempo=0.75',
    'veloce': 'atempo=1.5',
    'sottacqua': 'asetrate=44100*0.7,atempo=1.2,lowpass=f=300',
    'radio': 'bandpass=f=1200:width_type=h,highpass=f=200,lowpass=f=2600',
    'telefono': 'highpass=f=800,lowpass=f=2500',
    'eco': 'aecho=0.8:0.9:500:0.5',
    'tremolo': 'tremolo=f=6.0:d=0.8',
    'reverse': 'areverse',
    'earrape': 'volume=5.0,alimiter=limit=0.95'
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. MENU ELEGANTE SE NON SI SPECIFICA L'EFFETTO
    let targetEffect = args[0]?.toLowerCase();

    if (!targetEffect || !effettiLegam[targetEffect]) {
        let listaEffetti = Object.keys(effettiLegam).map(e => `│ ➭ *${e}*`).join('\n');
        let menu = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🎛️ 𝐋𝐄𝐆𝐀𝐌 𝐒𝐎𝐔𝐍𝐃 𝐒𝐓𝐔𝐃𝐈𝐎 🎛️ ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 💡 』 *𝐂𝐨𝐦𝐞 𝐬𝐢 𝐮𝐬𝐚:*
Rispondi a un audio o a un vocale scrivendo:
*${usedPrefix}${command} [nome_effetto]*

╭── 🎚️ 𝐄𝐅𝐅𝐄𝐓𝐓𝐈 𝐃𝐈𝐒𝐏𝐎𝐍𝐈𝐁𝐈𝐋𝐈 ──⬣
${listaEffetti}
╰───────────────⬣

📌 *Esempio:* \`${usedPrefix}${command} demone\`
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        return conn.sendMessage(m.chat, { text: menu, contextInfo: legamContext('Mixer Audio') }, { quoted: m });
    }

    // 2. CONTROLLO MESSAGGIO (Deve essere un audio)
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    if (!/audio/.test(mime)) {
        return m.reply('『 ⚠️ 』 \`Devi rispondere a una nota vocale o a un file audio!\`');
    }

    try {
        await conn.sendPresenceUpdate('recording', m.chat);
        await m.react('⏳');

        // 3. PREPARAZIONE FILE TEMPORANEI (Sicuri e puliti)
        const tmpDir = os.tmpdir();
        const inputPath = path.join(tmpDir, `legam_in_${Date.now()}.ogg`);
        const outputPath = path.join(tmpDir, `legam_out_${Date.now()}.ogg`);

        // Scarica l'audio originale
        let audioData = await q.download();
        fs.writeFileSync(inputPath, audioData);

        // 4. ELABORAZIONE DIRETTA CON FFMPEG (Estrema Velocità)
        let filtro = effettiLegam[targetEffect];
        let comandoFFmpeg = `ffmpeg -i "${inputPath}" -af "${filtro}" -c:a libopus -b:a 128k -vbr on "${outputPath}"`;
        
        // Gestione speciale per il robot che usa filter_complex
        if (targetEffect === 'robot' || targetEffect === 'reverse') {
            let flag = targetEffect === 'robot' ? '-filter_complex' : '-af';
            comandoFFmpeg = `ffmpeg -i "${inputPath}" ${flag} "${filtro}" -c:a libopus -b:a 128k -vbr on "${outputPath}"`;
        }

        await new Promise((resolve, reject) => {
            exec(comandoFFmpeg, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // 5. INVIO COME NOTA VOCALE ORIGINALE WHATSAPP
        let audioModificato = fs.readFileSync(outputPath);

        await conn.sendMessage(m.chat, {
            audio: audioModificato,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true, // Lo manda come se l'avessi appena registrato col microfono!
            contextInfo: legamContext(`Effetto: ${targetEffect.toUpperCase()}`)
        }, { quoted: m });

        await m.react('✅');

        // 6. PULIZIA SERVER
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    } catch (e) {
        console.error("[LEGAM AUDIO FX ERROR]", e);
        await m.react('❌');
        m.reply('『 ❌ 』 \`Errore del mixer audio.\` _Assicurati che il file non sia corrotto._');
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
}

handler.help = ['fx <effetto>'];
handler.tags = ['strumenti'];
// Comandi per attivarlo
handler.command = /^(fx|effetto|audio|mix)$/i;

export default handler;

