import { Buffer } from 'buffer';

let handler = async (m, { conn }) => {
    if (!m.quoted) {
        throw '𝐑𝐈𝐒𝐏𝐎𝐍𝐃𝐈 𝐀𝐋 𝐌𝐄𝐒𝐒𝐀𝐆𝐆𝐈𝐎 ×𝟏 𝐃𝐀 𝐒𝐂𝐀𝐑𝐈𝐂𝐀𝐑𝐄.';
    }

    let q = m.quoted;
    let mime = (q.msg || q).mimetype || q.mediaType || '';

    if (!/image|video|audio/g.test(mime)) {
        throw `𝐓𝐈 𝐒𝐄𝐌𝐁𝐑𝐀 𝐔𝐍 𝐌𝐄𝐃𝐈𝐀 ×1?`;
    }

    let isViewOnce = false;
    let originalMsgType = '';
    try {
        originalMsgType = Object.keys(q.message || {})[0];
        if (originalMsgType === 'viewOnceMessageV2' || originalMsgType === 'viewOnceMessageV2Extension') {
            isViewOnce = true;
        }
    } catch (e) {
        console.error("𝐄𝐑𝐑:", e);
    }

    if (isViewOnce) {
        console.log(`𝐈𝐍𝐅𝐎: 𝐌𝐄𝐒𝐒𝐀𝐆𝐆𝐈𝐎 ${q.id.id} 𝐂𝐀𝐏𝐓𝐈𝐎𝐍 (${originalMsgType}). 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐃.`);
    }

    try {
        let buffer = await q.download?.();

        if (!buffer) {
             throw '𝐄𝐑𝐑𝐎𝐑𝐄.';
        }

        let caption = '';
        try {
            const msg = q.message;
            const type = originalMsgType || Object.keys(msg)[0];
            const messageContent = msg[type];

            if (messageContent?.caption) {
                caption = messageContent.caption;
            } else if (messageContent?.message?.[Object.keys(messageContent.message)[0]]?.caption) {
                caption = messageContent.message[Object.keys(messageContent.message)[0]].caption;
            }
        } catch (captionError) {
             console.error("𝐄𝐑𝐑𝐎𝐑𝐄 𝐂𝐀𝐏𝐓𝐈𝐎𝐍:", captionError);
             caption = '';
        }

        if (/video/g.test(mime)) {
            await conn.sendFile(m.chat, buffer, '𝐃𝐄𝐀𝐓𝐇.mp4', caption || '', m);
        } else if (/image/g.test(mime)) {
            await conn.sendFile(m.chat, buffer, '𝐃𝐄𝐀𝐓𝐇.jpg', caption || '', m);
        } else if (/audio/g.test(mime)) {
            await conn.sendFile(m.chat, buffer, '𝐃𝐄𝐀𝐓𝐇.mp3', '', m, { asDocument: false, mimetype: 'audio/mpeg', ptt: false });
        }

    } catch (e) {
        console.error(e);
        if (e.message === '𝐄𝐑𝐑𝐎𝐑𝐄.') {
             throw '𝐈𝐌𝐏𝐎𝐒𝐒𝐈𝐁𝐈𝐋𝐄 𝐏𝐑𝐎𝐂𝐄𝐃𝐄𝐑𝐄 𝐂𝐎𝐍 𝐈𝐋 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃.';
        } else {
            throw `𝐄𝐑𝐑𝐎𝐑𝐄: ${e.message || e}`;
        }
    }
};

handler.help = ['rivela', 'readvo', 'getmedia'];
handler.tags = ['strumenti'];
handler.command = ['readviewonce', 'view', 'nocap', 'rivela', 'readvo', 'getmedia'];

export default handler;