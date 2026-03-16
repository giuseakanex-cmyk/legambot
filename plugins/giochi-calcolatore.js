import axios from 'axios';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { promises as fs } from 'fs';

const braquage = 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg';
const varebot = './media/menu/menu.jpg';
let defaultAvatarBuffer = null;
let browser = null;

const getPuppeteerBrowser = async () => {
    if (browser && browser.isConnected()) return browser;
    try {
        const puppeteer = await import('puppeteer');
        if (browser) await browser.close().catch(() => {});
        browser = await puppeteer.launch({
            headless: 'shell',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-first-run', '--single-process']
        });
        return browser;
    } catch {
        return null;
    }
};

const createFallbackAvatar = async () => {
    const svgAvatar = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="200" r="200" fill="#6B7280"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="200" fill="white">?</text></svg>`;
    return Buffer.from(svgAvatar);
};

const preloadDefaultAvatar = async () => {
    if (defaultAvatarBuffer) return;
    try {
        const res = await axios.get(braquage, { responseType: 'arraybuffer', timeout: 5000 });
        defaultAvatarBuffer = res.status === 200 ? Buffer.from(res.data) : await createFallbackAvatar();
    } catch (error) {
        defaultAvatarBuffer = await createFallbackAvatar();
    }
};

const commandConfig = {
    gaymetro: {
        title: 'GAYMETRO',
        themeColors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
        icon: '🏳️‍🌈',
        getDescription: (p) => {
            if (p < 20) return 'Etero basico. Noioso come la merda.';
            if (p < 50) return 'Ti piace la figa ma il cazzo ti incuriosisce.';
            if (p < 80) return 'Il tuo culo è aperto h24 come il 7-Eleven.';
            return 'REGINA DELLE SBORRATE! Inchinati, succhiacazzi supremo.';
        },
    },
    lesbiometro: {
        title: 'LESBIOMETRO',
        themeColors: ['#D52D00', '#EF7627', '#FF9A56', '#FFFFFF', '#D162A4', '#B55690', '#A30262'],
        icon: '✂️',
        getDescription: (p) => {
            if (p < 20) return 'Ti piace il cazzo, inutile negarlo.';
            if (p < 50) return 'Fai l\'alternativa bisex per attirare attenzione.';
            if (p < 80) return 'Hai più camicie a quadri tu di un boscaiolo canadese.';
            return 'Mangi più figa che pasta sciutta. Camionista d\'assalto!';
        },
    },
    masturbometro: {
        title: 'SEGOMETRO',
        themeColors: ['#FFFF00', '#FFD700', '#FFA500', '#FF4500', '#FF0000'],
        icon: '💦',
        getDescription: (p) => {
            if (p < 20) return 'Non ti tira manco col viagra.';
            if (p < 50) return 'Una sega ogni tanto per non ammazzare nessuno.';
            if (p < 80) return 'Hai le mani più callose di un muratore bergamasco.';
            return 'CAMPIONE OLIMPICO DI SEGHE! Hai sburrato pure sul soffitto.';
        },
    },
    fortunometro: {
        title: 'FORTUNOMETRO',
        themeColors: ['#00FF00', '#32CD32', '#006400', '#FFD700'],
        icon: '🍀',
        getDescription: (p) => {
            if (p < 20) return 'Sfigato di merda. Ti piove sul cazzo anche al chiuso.';
            if (p < 50) return 'Mediocre. Come tutta la tua inutile vita.';
            if (p < 80) return 'Oggi scopi, domani ti investe un tram. Occhio.';
            return 'Hai più culo che anima, bastardo raccomandato.';
        },
    },
    intelligiometro: {
        title: 'QI-TEST',
        themeColors: ['#00FFFF', '#00BFFF', '#0000FF', '#4B0082'],
        icon: '🧠',
        getDescription: (p) => {
            if (p < 20) return 'Hai il QI di un posacenere usato.';
            if (p < 50) return 'Non sei stupido, ti applichi proprio male.';
            if (p < 80) return 'Ne sai, ma nessuno ti sopporta comunque.';
            return 'GENIO INCOMPRESO! (O forse sei solo autistico grave).';
        },
    },
    bellometro: {
        title: 'BELLOMETRO',
        themeColors: ['#FFD700', '#FFAACC', '#FFFFFF', '#DAA520'],
        icon: '✨',
        getDescription: (p) => {
            if (p < 20) return 'Cesso a pedali. Fai vomitare i ciechi.';
            if (p < 50) return 'Portabile. Con un sacchetto in testa e al buio.';
            if (p < 80) return 'Ti scoperei, ma mi fai schifo come persona.';
            return 'FREGNA SPAZIALE! Apri OnlyFans e diventa ricca/o.';
        },
    },
    simpmetro: {
        title: 'SIMPMETRO',
        themeColors: ['#D3D3D3', '#A9A9A9', '#708090', '#000000'],
        icon: '🥺',
        getDescription: (p) => {
            if (p < 20) return 'Chad assoluto. Tratti tutti di merda come giusto che sia.';
            if (p < 50) return 'Le paghi la cena sperando te la dia. Illuso.';
            if (p < 80) return 'Zerbinato del cazzo. Dignità sotto i piedi.';
            return 'PAGHI PER LE FOTO PIEDI?! Fatti curare.';
        }
    },
    furrometro: {
        title: 'FURROMETRO',
        themeColors: ['#FF8C00', '#D2691E', '#8B4513', '#A0522D'],
        icon: '🦊',
        getDescription: (p) => {
            if (p < 20) return 'Umano normale. Grazie a dio non sei malato.';
            if (p < 50) return 'Hai guardato Zootropolis troppe volte con occhi strani.';
            if (p < 80) return 'Ti seghi sui cartoni animati di animali. Disagio puro.';
            return 'BESTIA DI SATANA! Vuoi farti inculare dal cane.';
        }
    },
    cringemetro: {
        title: 'CRINGIOMETRO',
        themeColors: ['#ADFF2F', '#556B2F', '#8B4513', '#CD853F'],
        icon: '😬',
        getDescription: (p) => {
            if (p < 20) return 'Sei basato. Parli poco e non rompi i coglioni.';
            if (p < 50) return 'Ogni tanto spari una cazzata che gela la stanza.';
            if (p < 80) return 'Fai tik tok ballando. Mi vergogno io per te.';
            return 'IL RE DEL CRINGE. La gente si sotterra quando arrivi.';
        }
    },
    comunistometro: {
        title: 'COMUNISMOMETRO',
        themeColors: ['#FF0000', '#DC143C', '#FFD700', '#B22222'],
        icon: '☭',
        getDescription: (p) => {
            if (p < 20) return 'Capitalista porco. Vuoi solo fare soldi.';
            if (p < 50) return 'Voti PD e ti senti rivoluzionario con l\'iPhone.';
            if (p < 80) return 'Compagno! Dividi tutto, anche le malattie.';
            return 'STALIN REINCARNATO. Mandi la gente nei gulag per hobby.';
        }
    },
    fasciometro: {
        title: 'FASCIOMETRO',
        themeColors: ['#000000', '#2F4F4F', '#696969', '#000000'],
        icon: '🙋‍♂️',
        getDescription: (p) => {
            if (p < 20) return 'Zecca comunista. Ti lavi poco e puzzi di canne.';
            if (p < 50) return 'Dici "non sono razzista ma..." ad ogni frase.';
            if (p < 80) return 'Hai il busto del duce sul comodino.';
            return 'A NO1! Pelato di merda, vai a fare le ronde.';
        }
    },
};
const metroCard = ({ pfpUrl, bgUrl, username, title, percentage, description, themeColors, icon }) => {
    const safeUsername = username ? username.replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'Utente';
    const gradientColors = themeColors.length > 1 ? themeColors.join(', ') : `${themeColors[0]}, ${themeColors[0]}`;
    const mainColor = themeColors[Math.floor((themeColors.length - 1) / 2)];
    const backgroundUrl = bgUrl || pfpUrl;

    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            width: 1080px; height: 1080px; 
            font-family: 'Poppins', sans-serif; 
            background: #121212; 
            overflow: hidden; 
        }
        .container { 
            width: 100%; height: 100%; position: relative; 
            display: flex; justify-content: center; align-items: center; 
        }
        
        /* Sfondo: Usa bgUrl qui */
        .background-image {
            position: absolute; top: -10%; left: -10%; width: 120%; height: 120%;
            background: url('${backgroundUrl}') center/cover no-repeat;
            filter: blur(40px) brightness(0.6);
            z-index: 0;
        }
        .background-overlay {
            position: absolute; width: 100%; height: 100%;
            background: linear-gradient(135deg, ${gradientColors});
            opacity: 0.25;
            mix-blend-mode: overlay;
            z-index: 1;
        }
        .vignette {
            position: absolute; width: 100%; height: 100%;
            background: radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%);
            z-index: 1;
        }

        .content { 
            position: relative; z-index: 2;
            width: 1000px; padding: 50px 40px;
            display: flex; flex-direction: column; align-items: center; 
            color: white; 
        }

        .header {
            font-size: 80px; font-weight: 900; 
            text-transform: uppercase; margin-bottom: 20px;
            text-shadow: 0 4px 10px rgba(0,0,0,0.5);
            background: linear-gradient(90deg, ${gradientColors});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: 2px;
        }

        .avatar-container {
            position: relative; margin-bottom: 20px;
        }
        .avatar { 
            width: 220px; height: 220px; 
            border-radius: 50%; 
            border: 6px solid rgba(255,255,255,0.8);
            box-shadow: 0 0 30px ${mainColor}80;
            object-fit: cover;
        }
        .icon-badge {
            position: absolute; bottom: 0; right: 0;
            background: #fff; width: 70px; height: 70px;
            border-radius: 50%; display: flex; justify-content: center; align-items: center;
            font-size: 40px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        .username { 
            font-size: 48px; font-weight: 700; 
            margin-bottom: 30px; text-align: center; 
            color: #f0f0f0; text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .progress-container {
            width: 100%; height: 50px;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 25px;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
            position: relative;
            margin-bottom: 20px;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.4);
        }
        .progress-fill {
            height: 100%; width: ${percentage}%;
            background: linear-gradient(90deg, ${themeColors[0]}, ${mainColor});
            border-radius: 25px;
            box-shadow: 0 0 20px ${mainColor};
            position: relative;
            overflow: hidden;
            transition: width 1s ease;
        }
        .progress-fill::after {
            content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(rgba(255,255,255,0.2), transparent);
            border-radius: inherit;
        }

        .percentage-text {
            font-size: 90px; font-weight: 900;
            color: ${mainColor};
            text-shadow: 0 0 20px ${mainColor}40;
            line-height: 1; margin-bottom: 10px;
        }

        .description { 
            font-size: 32px; font-weight: 400; 
            color: #ddd; text-align: center; 
            line-height: 1.4; padding: 0 20px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.8);
            border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 20px; width: 100%;
        }
    `;

    return React.createElement('html', { lang: 'it' },
        React.createElement('head', null,
            React.createElement('meta', { charSet: 'utf-8' }),
            React.createElement('style', { dangerouslySetInnerHTML: { __html: styles } })
        ),
        React.createElement('body', null,
            React.createElement('div', { className: 'container' },
                React.createElement('div', { className: 'background-image' }),
                React.createElement('div', { className: 'background-overlay' }),
                React.createElement('div', { className: 'vignette' }),
                React.createElement('div', { className: 'content' },
                    React.createElement('div', { className: 'header' }, title),
                    React.createElement('div', { className: 'avatar-container' },
                        React.createElement('img', { src: pfpUrl, className: 'avatar', alt: 'Avatar' }),
                        React.createElement('div', { className: 'icon-badge' }, icon)
                    ),
                    React.createElement('div', { className: 'username' }, safeUsername),
                    React.createElement('div', { className: 'progress-container' },
                        React.createElement('div', { className: 'progress-fill' })
                    ),
                    React.createElement('div', { className: 'percentage-text' }, `${percentage}%`),
                    React.createElement('div', { className: 'description' }, description)
                )
            )
        )
    );
};

async function createImageWithPuppeteer(htmlContent) {
    const b = await getPuppeteerBrowser();
    if (!b) throw new Error('Puppeteer non disponibile');
    let page = null;
    try {
        page = await b.newPage();
        await page.setViewport({ width: 1080, height: 1080 });
        await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 10000 });
        const screenshot = await page.screenshot({ type: 'jpeg', quality: 90 });
        return Buffer.from(screenshot);
    } catch (error) {
        throw error;
    } finally {
        if (page) await page.close().catch(() => {});
    }
}

async function createImageWithBrowserless(htmlContent) {
    const browserlessApiKey = global.APIKeys?.browserless;
    if (!browserlessApiKey) throw new Error("API key Browserless non trovata");

    const res = await axios.post(`https://production-sfo.browserless.io/screenshot?token=${browserlessApiKey}`, {
        html: htmlContent,
        options: { type: 'jpeg', quality: 90 },
        viewport: { width: 1080, height: 1080 }
    }, { responseType: 'arraybuffer' });

    if (res.status === 200) return Buffer.from(res.data);
    throw new Error('Fallback fallito');
}

async function generatemetroImage({ title, percentage, description, avatarUrl, targetName, themeColors, icon }) {
    let pfpBuffer = null;
    let bgBuffer = null;

    try {
        if (!avatarUrl) throw new Error("No URL");
        
        const res = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
        pfpBuffer = Buffer.from(res.data);
        bgBuffer = pfpBuffer;

    } catch {
        if(!defaultAvatarBuffer) await preloadDefaultAvatar();
        pfpBuffer = defaultAvatarBuffer;
        try {
            bgBuffer = await fs.readFile(varebot);
        } catch (e) {
            console.warn(`Impossibile leggere sfondo locale ${varebot}, uso default avatar`);
            bgBuffer = defaultAvatarBuffer;
        }
    }

    const pfpBase64 = `data:image/jpeg;base64,${pfpBuffer.toString('base64')}`;
    const bgBase64 = `data:image/jpeg;base64,${bgBuffer.toString('base64')}`;

    const element = React.createElement(metroCard, { 
        pfpUrl: pfpBase64, 
        bgUrl: bgBase64,
        username: targetName, 
        title, 
        percentage, 
        description, 
        themeColors,
        icon
    });
    
    const htmlContent = `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(element)}`;

    try {
        return await createImageWithPuppeteer(htmlContent);
    } catch (e) {
        console.warn('Fallback a browserless per metro:', e.message);
        return await createImageWithBrowserless(htmlContent);
    }
}

const handler = async (m, { conn, command, text }) => {
    let cmdKey = command;
    const aliases = {
        'iqtest': 'intelligiometro',
        'culometro': 'fortunometro',
        'segometro': 'masturbometro',
        'simpmetro': 'simpmetro',
        'furrometro': 'furrometro',
        'cringemetro': 'cringemetro',
        'fasciometro': 'fasciometro'
    };
    if (aliases[command]) cmdKey = aliases[command];
    
    const config = commandConfig[cmdKey];
    if (!config) return;

    const targetUser = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
    let targetName = await conn.getName(targetUser) || "Utente";
    if (text) {
        const cleanText = text.replace(/@\d+/g, '').trim();
        if (cleanText) targetName = cleanText;
    }

    const percentage = Math.floor(Math.random() * 101);
    const descriptionText = config.getDescription(percentage);
    
    await conn.sendMessage(m.chat, { react: { text: config.icon, key: m.key } });

    try {
        const avatar = await conn.profilePictureUrl(targetUser, 'image').catch(() => null);
        const imageBuffer = await generatemetroImage({
            title: config.title,
            percentage: percentage,
            description: descriptionText,
            avatarUrl: avatar,
            targetName: targetName,
            themeColors: config.themeColors,
            icon: config.icon
        });

        const caption = `*📊 ${config.title}* per @${targetUser.split('@')[0]}\n` +
                        `*📈 Risultato:* ${percentage}%\n` +
                        `*📝 Verdetto:* ${descriptionText}`;
        
        await conn.sendMessage(m.chat, {
            image: imageBuffer,
            caption: caption,
            mentions: [targetUser],
            contextInfo: global.fake.contextInfo
        }, { quoted: m });

    } catch (e) {
        console.error(`Errore metro ${command}:`, e);
        await conn.reply(m.chat, `⚠️ Errore grafica: ${e.message}`, m);
    }
};
preloadDefaultAvatar().catch(console.error);

const mainCommands = Object.keys(commandConfig);
const aliasCommands = ['iqtest', 'culometro', 'segometro', 'simpmetro', 'furrometro', 'cringemetro'];
const allCommands = [...mainCommands, ...aliasCommands];

handler.help = mainCommands.map(cmd => `${cmd} <@tag>`);
handler.tags = ['giochi'];
handler.command = allCommands;
handler.group = true;

export default handler;