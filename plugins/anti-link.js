import { downloadContentFromMessage } from '@realvare/based';
import ffmpeg from 'fluent-ffmpeg';
import { createWriteStream, readFile } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { unlink } from 'fs/promises';
import Jimp from 'jimp';
import jsQR from 'jsqr';
import fetch from 'node-fetch';
import { FormData } from 'formdata-node';

const WHATSAPP_GROUP_REGEX = /\bchat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
const WHATSAPP_CHANNEL_REGEX = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i;
const GENERAL_URL_REGEX = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)/gi;
const SHORT_URL_DOMAINS = [
    'bit.ly', 'tinyurl.com', 't.co', 'short.link', 'shorturl.at',
    'is.gd', 'v.gd', 'goo.gl', 'ow.ly', 'buff.ly',
    'tiny.cc', 'shorte.st', 'adf.ly', 'linktr.ee', 'rebrand.ly',
    'bitly.com', 'cutt.ly', 'short.io', 'links.new', 'link.ly',
    'ur.ly', 'shrinkme.io', 'clck.ru', 'short.gy', 'lnk.to',
    'sh.st', 'ouo.io', 'bc.vc', 'adfoc.us', 'linkvertise.com',
    'exe.io', 'linkbucks.com', 'adfly.com', 'shrink-service.it',
    'cur.lv', 'gestyy.com', 'shrinkarn.com', 'za.gl', 'clicksfly.com',
    '6url.com', 'shortlink.sh', 'short.tn', 'rotator.ninja',
    'shrtco.de', 'ulvis.net', 'chilp.it', 'clicky.me',
    'budurl.com', 'po.st', 'shr.lc', 'dub.co'
];
const SHORT_URL_REGEX = new RegExp(
    `https?:\\/\\/(?:www\\.)?(?:${SHORT_URL_DOMAINS.map(d => d.replace('.', '\\.')).join('|')})\\/[\\w\\-._~:/?#[\\]@!$&'()*+,;=]*`,
    'gi'
);
const redirectCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000;
const FETCH_TIMEOUT = 10000;
const MAX_REDIRECTS = 5;
const MAX_URLS_TO_CHECK = 3;
const HIDDEN_LINK_PATTERNS = [
    /chat[^\w]*whatsapp[^\w]*com/i,
    /whatsapp[^\w]*com[^\w]*(invite|channel)/i,
];
const INVISIBLE_CHARS_REGEX = /[\u200b\u200c\u200d\uFEFF]/;
const BASE64_REGEX = /(?:[A-Za-z0-9+/]{4}){5,}(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?/g;
const URL_ENCODED_REGEX = /%[0-9a-fA-F]{2}/;
const REQUEST_HEADERS = {
    'User-Agent': 'varebot/2.5',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
};
function isWhatsAppLink(url) {
    return WHATSAPP_GROUP_REGEX.test(url) || WHATSAPP_CHANNEL_REGEX.test(url);
}

function resolveRedirectUrl(currentUrl, location) {
    try {
        if (location.startsWith('/')) {
            const urlObj = new URL(currentUrl);
            return `${urlObj.protocol}//${urlObj.host}${location}`;
        }
        if (location.startsWith('http')) {
            return location;
        }
        const urlObj = new URL(currentUrl);
        return new URL(location, urlObj.href).href;
    } catch {
        return location;
    }
}

async function checkUrlRedirect(url, maxRedirects = MAX_REDIRECTS) {
    const cacheKey = url.toLowerCase();
    const cached = redirectCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.result;
    }

    let currentUrl = url;
    let redirectCount = 0;
    
    try {
        while (redirectCount < maxRedirects) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
            
            try {
                const response = await fetch(currentUrl, {
                    method: 'HEAD',
                    redirect: 'manual',
                    signal: controller.signal,
                    headers: REQUEST_HEADERS
                });
                
                clearTimeout(timeout);
                
                if (isWhatsAppLink(currentUrl)) {
                    const result = true;
                    redirectCache.set(cacheKey, { result, timestamp: Date.now() });
                    return result;
                }
                
                if (response.status < 300 || response.status >= 400) {
                    if (response.status === 405 && redirectCount === 0) {
                        try {
                            const getResponse = await fetch(currentUrl, {
                                method: 'GET',
                                redirect: 'manual',
                                signal: controller.signal,
                                headers: { 'User-Agent': REQUEST_HEADERS['User-Agent'] }
                            });
                            
                            if (getResponse.status >= 300 && getResponse.status < 400) {
                                const location = getResponse.headers.get('location');
                                if (location) {
                                    currentUrl = resolveRedirectUrl(currentUrl, location);
                                    redirectCount++;
                                    continue;
                                }
                            }
                        } catch {}
                    }
                    break;
                }
                
                const location = response.headers.get('location');
                if (!location) break;
                
                currentUrl = resolveRedirectUrl(currentUrl, location);
                redirectCount++;
                
            } catch (fetchError) {
                clearTimeout(timeout);
                break;
            }
        }
        
        const result = isWhatsAppLink(currentUrl);
        redirectCache.set(cacheKey, { result, timestamp: Date.now() });
        return result;
        
    } catch {
        const result = false;
        redirectCache.set(cacheKey, { result, timestamp: Date.now() });
        return result;
    }
}

async function checkUrlsForRedirects(text) {
    if (!text) return false;
    
    const urls = text.match(GENERAL_URL_REGEX) || [];
    const urlsToCheck = urls.filter(url => !isWhatsAppLink(url));
    
    if (urlsToCheck.length === 0) return false;
    
    const urlsToProcess = urlsToCheck.slice(0, MAX_URLS_TO_CHECK);
    
    const promises = urlsToProcess.map(async (url) => {
        try {
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 15000)
            );
            
            return await Promise.race([checkUrlRedirect(url), timeoutPromise]);
        } catch {
            return false;
        }
    });
    
    try {
        const results = await Promise.all(promises);
        return results.some(result => result === true);
    } catch {
        return false;
    }
}

function cleanupCache() {
    const now = Date.now();
    for (const [key, value] of redirectCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
            redirectCache.delete(key);
        }
    }
}

setInterval(cleanupCache, CACHE_DURATION);

function unwrapMessageContent(message) {
    let content = message?.message || message;
    for (let i = 0; i < 10; i++) {
        if (content?.ephemeralMessage?.message) {
            content = content.ephemeralMessage.message;
            continue;
        }
        if (content?.viewOnceMessage?.message) {
            content = content.viewOnceMessage.message;
            continue;
        }
        if (content?.viewOnceMessageV2?.message) {
            content = content.viewOnceMessageV2.message;
            continue;
        }
        if (content?.viewOnceMessageV2Extension?.message) {
            content = content.viewOnceMessageV2Extension.message;
            continue;
        }
        if (content?.documentWithCaptionMessage?.message) {
            content = content.documentWithCaptionMessage.message;
            continue;
        }
        if (content?.editedMessage?.message) {
            content = content.editedMessage.message;
            continue;
        }
        break;
    }
    return content;
}

function findFirstMediaMessage(message, { excludeQuoted = false } = {}) {
    const root = unwrapMessageContent(message);
    const seen = new Set();
    const MEDIA_KEYS = new Set(['imageMessage', 'videoMessage', 'stickerMessage']);

    function visit(obj) {
        if (!obj || typeof obj !== 'object') return null;
        if (seen.has(obj)) return null;
        seen.add(obj);
        if (Buffer.isBuffer(obj)) return null;

        for (const key of Object.keys(obj)) {
            if (excludeQuoted && key === 'quotedMessage') continue;
            const value = obj[key];
            if (MEDIA_KEYS.has(key) && value && typeof value === 'object') {
                return { node: value, typeKey: key };
            }
            if (value && typeof value === 'object') {
                const hit = visit(value);
                if (hit) return hit;
            }
        }
        return null;
    }

    return visit(root);
}

async function getMediaBuffer(message) {
    try {
        const found = findFirstMediaMessage(message, { excludeQuoted: false });
        if (!found) return null;

        const { node, typeKey } = found;
        const type = typeKey === 'videoMessage' ? 'video' : typeKey === 'stickerMessage' ? 'sticker' : 'image';

        const stream = await downloadContentFromMessage(node, type);
        let buffer = Buffer.from([]);
        
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        return buffer;
    } catch {
        return null;
    }
}

async function extractFrameFromVideo(videoBuffer) {
    const tempVideoPath = join(tmpdir(), `video-${Date.now()}.mp4`);
    const tempImagePath = join(tmpdir(), `frame-${Date.now()}.jpg`);
    
    try {
        await new Promise((resolve, reject) => {
            createWriteStream(tempVideoPath)
                .on('finish', resolve)
                .on('error', reject)
                .end(videoBuffer);
        });
        
        await new Promise((resolve, reject) => {
            ffmpeg(tempVideoPath)
                .frames(1)
                .seekInput('00:00:01')
                .outputOptions('-q:v 2')
                .output(tempImagePath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });
        
        return new Promise((resolve, reject) => {
            readFile(tempImagePath, (err, data) => 
                err ? reject(err) : resolve(data)
            );
        });
    } catch {
        return null;
    } finally {
        unlink(tempVideoPath).catch(() => {});
        unlink(tempImagePath).catch(() => {});
    }
}

async function preprocessImageForQR(imageBuffer) {
    try {
        const image = await Jimp.read(imageBuffer);
        image.normalize();
        image.convolute([[0,-1,0],[-1,5,-1],[0,-1,0]]);
        return await image.getBufferAsync(Jimp.MIME_PNG);
    } catch {
        return imageBuffer;
    }
}

async function readQRCodeWithJsqr(imageBuffer) {
    if (!imageBuffer) return null;

    try {
        const processedBuffer = await preprocessImageForQR(imageBuffer);
        const image = await Jimp.read(processedBuffer);
        const { data, width, height } = image.bitmap;
        const imageData = new Uint8ClampedArray(data);
        const code = jsQR(imageData, width, height, {
            inversionAttempts: "dontInvert",
        });

        return code ? code.data : null;
    } catch {
        return null;
    }
}

async function readQRCodeWithExternalApi(imageBuffer) {
    if (!imageBuffer) return null;
    
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 8000);
        
        const formData = new FormData();
        const processedBuffer = await preprocessImageForQR(imageBuffer);
        formData.append('file', processedBuffer, 'image.png');
        
        const response = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });
        
        if (!response.ok) return null;
        
        const data = await response.json();
        return data?.[0]?.symbol?.[0]?.data || null;
    } catch {
        return null;
    }
}

async function readQRCode(imageBuffer) {
    const jsqrResult = await readQRCodeWithJsqr(imageBuffer);
    return jsqrResult || await readQRCodeWithExternalApi(imageBuffer);
}

async function checkForShortUrls(text) {
    if (!text) return false;
    return SHORT_URL_REGEX.test(text);
}

async function containsSuspiciousLink(text) {
    if (!text) return false;
    if (isWhatsAppLink(text)) return true;
    if (await checkForShortUrls(text)) return true;
    const hasRedirectingUrls = await checkUrlsForRedirects(text);
    if (hasRedirectingUrls) return true;
    if (HIDDEN_LINK_PATTERNS.some(pattern => pattern.test(text))) return true;
    if (INVISIBLE_CHARS_REGEX.test(text)) return true;
    const base64Matches = text.match(BASE64_REGEX);
    if (base64Matches) {
        for (const match of base64Matches) {
            try {
                const decoded = Buffer.from(match, 'base64').toString('utf-8');
                if (await containsSuspiciousLink(decoded)) return true;
            } catch {}
        }
    }
    
    if (URL_ENCODED_REGEX.test(text)) {
        try {
            const decoded = decodeURIComponent(text);
            if (decoded !== text && await containsSuspiciousLink(decoded)) return true;
        } catch {}
    }
    
    return false;
}

function getViolationReason(text) {
    if (isWhatsAppLink(text)) {
        return 'Link di gruppo/canale WhatsApp rilevato.';
    }
    if (SHORT_URL_REGEX.test(text)) {
        return 'Short URL sospetto rilevato.';
    }
    return 'Link sospetto rilevato.';
}

function getMediaName(mimeType) {
    if (mimeType.includes('sticker')) return 'sticker';
    if (mimeType.includes('video')) return 'video';
    return 'immagine';
}

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
    if (!m.isGroup || isAdmin || isOwner || isSam || m.fromMe) {
        return false;
    }

    const chat = global.db.data.chats[m.chat];
    if (!chat?.antiLink) {
        return false;
    }
    if (isQuoteOnlyMessage(m)) {
        return false;
    }

    try {
        let groupMetadata = global.groupCache.get(m.chat);
        if (!groupMetadata) {
            groupMetadata = await conn.groupMetadata(m.chat);
            if (groupMetadata) {
                global.groupCache.set(m.chat, groupMetadata, { ttl: 300 });
            }
        }

        let currentIsBotAdmin = isBotAdmin;
        if (groupMetadata) {
            const participants = groupMetadata.participants;
            const normalizedBot = conn.decodeJid(conn.user.jid);
            const normalizedOwner = groupMetadata.owner ? conn.decodeJid(groupMetadata.owner) : null;
            const normalizedOwnerLid = groupMetadata.ownerLid ? conn.decodeJid(groupMetadata.ownerLid) : null;

            currentIsBotAdmin = participants.some(u => {
                const participantIds = [
                    conn.decodeJid(u.id),
                    u.jid ? conn.decodeJid(u.jid) : null,
                    u.lid ? conn.decodeJid(u.lid) : null
                ].filter(Boolean);
                const isMatch = participantIds.includes(normalizedBot);
                return isMatch && (u.admin === 'admin' || u.admin === 'superadmin' || u.isAdmin === true || u.admin === true);
            }) || (normalizedBot === normalizedOwner || normalizedBot === normalizedOwnerLid);
        }

        let linkFound = false;
        let reason = '';
        const extractedText = extractTextFromMessage(m, true);

        if (await containsSuspiciousLink(extractedText)) {
            reason = getViolationReason(extractedText);
            linkFound = true;
        }
        const foundMedia = !linkFound ? findFirstMediaMessage(m, { excludeQuoted: false }) : null;

        if (!linkFound && foundMedia) {
            const mediaBuffer = await getMediaBuffer(m);
            const msgType = foundMedia.node;
            const mime = msgType?.mimetype || '';
            const isAnimated = mime.includes('sticker') && msgType.isAnimated === true;

            if (mediaBuffer && await scanMediaForQrCode(mediaBuffer, mime, isAnimated)) {
                linkFound = true;
                const mediaName = getMediaName(mime);
                reason = `QR code con link rilevato in ${mediaName}.`;
            }
        }

        if (linkFound) {
            const reasonMessage = `『 🚫 』 \`${reason}\``;
            await handleViolation(conn, m, reasonMessage, currentIsBotAdmin);
            return true;
        }
    } catch (err) {
        console.error('Errore nel sistema anti-link:', err);
    }

    return false;
}
