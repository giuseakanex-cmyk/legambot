const commandConfig = {
    gaymetro: {
        title: '🏳️‍🌈 𝐆𝐀𝐘𝐌𝐄𝐓𝐑𝐎 🏳️‍🌈',
        icon: '🏳️‍🌈',
        getDescription: (p) => {
            if (p < 20) return 'Etero basico. Noioso come la merda.';
            if (p < 50) return 'Ti piace la figa ma il cazzo ti incuriosisce.';
            if (p < 80) return 'Il tuo culo è aperto h24 come il 7-Eleven.';
            return 'REGINA DELLE SBORRATE! Inchinati, succhiacazzi supremo.';
        },
    },
    lesbiometro: {
        title: '✂️ 𝐋𝐄𝐒𝐁𝐈𝐎𝐌𝐄𝐓𝐑𝐎 ✂️',
        icon: '✂️',
        getDescription: (p) => {
            if (p < 20) return 'Ti piace il cazzo, inutile negarlo.';
            if (p < 50) return 'Fai l\'alternativa bisex per attirare attenzione.';
            if (p < 80) return 'Hai più camicie a quadri tu di un boscaiolo canadese.';
            return 'Mangi più figa che pasta sciutta. Camionista d\'assalto!';
        },
    },
    masturbometro: {
        title: '💦 𝐒𝐄𝐆𝐎𝐌𝐄𝐓𝐑𝐎 💦',
        icon: '💦',
        getDescription: (p) => {
            if (p < 20) return 'Non ti tira manco col viagra.';
            if (p < 50) return 'Una sega ogni tanto per non ammazzare nessuno.';
            if (p < 80) return 'Hai le mani più callose di un muratore bergamasco.';
            return 'CAMPIONE OLIMPICO DI SEGHE! Hai sburrato pure sul soffitto.';
        },
    },
    fortunometro: {
        title: '🍀 𝐅𝐎𝐑𝐓𝐔𝐍𝐎𝐌𝐄𝐓𝐑𝐎 🍀',
        icon: '🍀',
        getDescription: (p) => {
            if (p < 20) return 'Sfigato di merda. Ti piove sul cazzo anche al chiuso.';
            if (p < 50) return 'Mediocre. Come tutta la tua inutile vita.';
            if (p < 80) return 'Oggi scopi, domani ti investe un tram. Occhio.';
            return 'Hai più culo che anima, bastardo raccomandato.';
        },
    },
    intelligiometro: {
        title: '🧠 𝐐𝐈-𝐓𝐄𝐒𝐓 🧠',
        icon: '🧠',
        getDescription: (p) => {
            if (p < 20) return 'Hai il QI di un posacenere usato.';
            if (p < 50) return 'Non sei stupido, ti applichi proprio male.';
            if (p < 80) return 'Ne sai, ma nessuno ti sopporta comunque.';
            return 'GENIO INCOMPRESO! (O forse sei solo autistico grave).';
        },
    },
    bellometro: {
        title: '✨ 𝐁𝐄𝐋𝐋𝐎𝐌𝐄𝐓𝐑𝐎 ✨',
        icon: '✨',
        getDescription: (p) => {
            if (p < 20) return 'Cesso a pedali. Fai vomitare i ciechi.';
            if (p < 50) return 'Portabile. Con un sacchetto in testa e al buio.';
            if (p < 80) return 'Ti scoperei, ma mi fai schifo come persona.';
            return 'FREGNA SPAZIALE! Apri OnlyFans e diventa ricca/o.';
        },
    },
    simpmetro: {
        title: '🥺 𝐒𝐈𝐌𝐏𝐌𝐄𝐓𝐑𝐎 🥺',
        icon: '🥺',
        getDescription: (p) => {
            if (p < 20) return 'Chad assoluto. Tratti tutti di merda come giusto che sia.';
            if (p < 50) return 'Le paghi la cena sperando te la dia. Illuso.';
            if (p < 80) return 'Zerbinato del cazzo. Dignità sotto i piedi.';
            return 'PAGHI PER LE FOTO PIEDI?! Fatti curare.';
        }
    },
    furrometro: {
        title: '🦊 𝐅𝐔𝐑𝐑𝐎𝐌𝐄𝐓𝐑𝐎 🦊',
        icon: '🦊',
        getDescription: (p) => {
            if (p < 20) return 'Umano normale. Grazie a dio non sei malato.';
            if (p < 50) return 'Hai guardato Zootropolis troppe volte con occhi strani.';
            if (p < 80) return 'Ti seghi sui cartoni animati di animali. Disagio puro.';
            return 'BESTIA DI SATANA! Vuoi farti inculare dal cane.';
        }
    },
    cringemetro: {
        title: '😬 𝐂𝐑𝐈𝐍𝐆𝐈𝐎𝐌𝐄𝐓𝐑𝐎 😬',
        icon: '😬',
        getDescription: (p) => {
            if (p < 20) return 'Sei basato. Parli poco e non rompi i coglioni.';
            if (p < 50) return 'Ogni tanto spari una cazzata che gela la stanza.';
            if (p < 80) return 'Fai tik tok ballando. Mi vergogno io per te.';
            return 'IL RE DEL CRINGE. La gente si sotterra quando arrivi.';
        }
    },
    comunistometro: {
        title: '☭ 𝐂𝐎𝐌𝐔𝐍𝐈𝐒𝐌𝐎𝐌𝐄𝐓𝐑𝐎 ☭',
        icon: '☭',
        getDescription: (p) => {
            if (p < 20) return 'Capitalista porco. Vuoi solo fare soldi.';
            if (p < 50) return 'Voti PD e ti senti rivoluzionario con l\'iPhone.';
            if (p < 80) return 'Compagno! Dividi tutto, anche le malattie.';
            return 'STALIN REINCARNATO. Mandi la gente nei gulag per hobby.';
        }
    },
    fasciometro: {
        title: '🙋‍♂️ 𝐅𝐀𝐒𝐂𝐈𝐎𝐌𝐄𝐓𝐑𝐎 🙋‍♂️',
        icon: '🙋‍♂️',
        getDescription: (p) => {
            if (p < 20) return 'Zecca comunista. Ti lavi poco e puzzi di canne.';
            if (p < 50) return 'Dici "non sono razzista ma..." ad ogni frase.';
            if (p < 80) return 'Hai il busto del duce sul comodino.';
            return 'A NOI! Pelato di merda, vai a fare le ronde.';
        }
    },
};

const handler = async (m, { conn, command, text, usedPrefix }) => {
    // Mappatura degli alias ai comandi originali
    const aliases = {
        'iqtest': 'intelligiometro',
        'culometro': 'fortunometro',
        'segometro': 'masturbometro',
        'simpmetro': 'simpmetro',
        'furrometro': 'furrometro',
        'cringemetro': 'cringemetro',
        'fasciometro': 'fasciometro'
    };
    
    let cmdKey = command.toLowerCase();
    if (aliases[cmdKey]) cmdKey = aliases[cmdKey];
    
    const config = commandConfig[cmdKey];
    if (!config) return;

    // Identifica il bersaglio (Taggato, Quotato, o se stesso)
    const targetUser = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : m.sender);

    // Genera la percentuale
    const percentage = Math.floor(Math.random() * 101);
    const descriptionText = config.getDescription(percentage);
    
    // Reazione immediata al messaggio
    await conn.sendMessage(m.chat, { react: { text: config.icon, key: m.key } });

    // Ottieni la foto profilo del bersaglio in modo sicuro
    let avatarUrl = await conn.profilePictureUrl(targetUser, 'image').catch(() => 'https://files.catbox.moe/57bmbv.jpg');

    // Estetica Legam OS
    let captionText = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· ${config.title} ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 👤 』 𝐁𝐞𝐫𝐬𝐚𝐠𝐥𝐢𝐨: @${targetUser.split('@')[0]}
『 📊 』 𝐑𝐢𝐬𝐮𝐥𝐭𝐚𝐭𝐨: *${percentage}%*

╰ ⌕ _"${descriptionText}"_
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

    // 🔥 CONTESTO CANALE VIP (INFALLIBILE E ANTI-CRASH) 🔥
    let channelContext = {
        mentionedJid: [targetUser],
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363233544482011@newsletter',
            serverMessageId: 100,
            newsletterName: `Analisi Completata ${config.icon}`
        }
    };

    try {
        // Invia il risultato con l'immagine profilo e il testo VIP
        await conn.sendMessage(m.chat, {
            image: { url: avatarUrl },
            caption: captionText,
            contextInfo: channelContext
        }, { quoted: m });
    } catch (e) {
        // Fallback testuale di sicurezza
        await conn.sendMessage(m.chat, { text: captionText, contextInfo: channelContext }, { quoted: m });
    }
};

const mainCommands = Object.keys(commandConfig);
const aliasCommands = ['iqtest', 'culometro', 'segometro', 'simpmetro', 'furrometro', 'cringemetro', 'fasciometro'];
const allCommands = [...mainCommands, ...aliasCommands];

handler.help = mainCommands.map(cmd => `${cmd} <@tag>`);
handler.tags = ['giochi'];
// Crea un regex che accetta tutti i comandi della lista
handler.command = new RegExp(`^(${allCommands.join('|')})$`, 'i');
handler.group = true;

export default handler;

