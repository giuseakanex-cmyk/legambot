/*
 * 👑 LEGAM BOT CORE - SIMPLE LIBRARY 👑
 * Gestione avanzata dei messaggi e del socket
*/

import path from 'path';
import chalk from 'chalk';
import fetch from 'node-fetch';
import PhoneNumber from 'awesome-phonenumber';
import fs from 'fs';
import util from 'util';
import { fileTypeFromBuffer } from 'file-type';
import { format } from 'util';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';
import { toAudio } from './converter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const {
  makeWASocket: _makeWASocket,
  proto,
  downloadContentFromMessage,
  jidDecode,
  areJidsSameUser,
  generateWAMessage,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  WAMessageStubType,
  extractMessageContent,
  WA_DEFAULT_EPHEMERAL,
  prepareWAMessageMedia,
  jidNormalizedUser
} = (await import('@whiskeysockets/baileys')).default || await import('@whiskeysockets/baileys');

export function makeWASocket(connectionOptions, options = {}) {
  const conn = _makeWASocket(connectionOptions);
  
  if (!conn.ev) conn.ev = new EventEmitter();

  // Estensione del socket con funzioni personalizzate
  Object.defineProperties(conn, {
    decodeJid: {
      value(jid) {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
          const decode = jidDecode(jid) || {};
          return (decode.user && decode.server && decode.user + '@' + decode.server || jid).trim();
        }
        return jid.trim();
      }
    },
    
    getFile: {
      async value(PATH, saveToFile = false) {
        let res;
        let filename;
        const data = Buffer.isBuffer(PATH) ? PATH : PATH instanceof ArrayBuffer ? PATH.toBuffer() : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? (await (res = await fetch(PATH)).arrayBuffer()).toBuffer() : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0);
        if (!Buffer.isBuffer(data)) throw new TypeError('Il risultato non è un buffer');
        const type = await fileTypeFromBuffer(data) || { mime: 'application/octet-stream', ext: '.bin' };
        if (data && saveToFile && !filename) {
          filename = path.join(__dirname, '../temp/' + new Date * 1 + '.' + type.ext);
          if (!fs.existsSync(path.join(__dirname, '../temp'))) fs.mkdirSync(path.join(__dirname, '../temp'));
          await fs.promises.writeFile(filename, data);
        }
        return { res, filename, ...type, data, deleteFile() { return filename && fs.promises.unlink(filename); } };
      }
    },

    waitEvent: {
        value(eventName, is = () => true, maxTries = 25) {
            return new Promise((resolve, reject) => {
                let tries = 0;
                const on = (...args) => {
                    if (++tries > maxTries) {
                        conn.ev.off(eventName, on);
                        reject('Max tries reached');
                    } else if (is(...args)) {
                        conn.ev.off(eventName, on);
                        resolve(...args);
                    }
                };
                conn.ev.on(eventName, on);
            });
        }
    },

    sendFile: {
      async value(jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) {
        const type = await conn.getFile(path, true);
        let { data: file, filename: pathFile } = type;
        let mtype = '';
        let mimetype = options.mimetype || type.mime;
        
        if (/webp/.test(type.mime) || options.asSticker) mtype = 'sticker';
        else if (/image/.test(type.mime) || options.asImage) mtype = 'image';
        else if (/video/.test(type.mime)) mtype = 'video';
        else if (/audio/.test(type.mime)) {
          let convert = await toAudio(file, type.ext);
          file = convert.data;
          pathFile = convert.filename;
          mtype = 'audio';
          mimetype = options.mimetype || 'audio/mpeg; codecs=opus';
        } else mtype = 'document';

        const message = {
          ...options,
          caption,
          ptt,
          [mtype]: { url: pathFile },
          mimetype,
          fileName: filename || pathFile.split('/').pop(),
        };
        return await conn.sendMessage(jid, message, { quoted, ...options });
      }
    },

    reply: {
      value(jid, text = '', quoted, options) {
        return Buffer.isBuffer(text) ? conn.sendFile(jid, text, 'file', '', quoted, false, options) : conn.sendMessage(jid, { ...options, text }, { quoted, ...options });
      }
    }
  });

  return conn;
}

export function smsg(conn, m, store) {
    if (!m) return m
    let M = proto.WebMessageInfo
    if (m.key) {
        m.id = m.key.id
        m.chat = jidNormalizedUser(m.key.remoteJid)
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = jidNormalizedUser(m.fromMe ? conn.user.id : m.key.participant || m.key.remoteJid)
    }
    if (m.message) {
        m.mtype = Object.keys(m.message)[0]
        m.msg = extractMessageContent(m.message[m.mtype])
        m.text = m.message.conversation || m.msg.text || m.msg.caption || m.msg.contentText || m.msg.selectedDisplayText || ''
        m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
        
        let quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
        if (quoted) {
            m.quoted = {}
            m.quoted.message = extractMessageContent(quoted)
            m.quoted.mtype = Object.keys(m.quoted.message)[0]
            m.quoted.text = m.quoted.message.conversation || m.quoted.message[m.quoted.mtype]?.text || m.quoted.message[m.quoted.mtype]?.caption || ''
            m.quoted.key = {
                remoteJid: m.chat,
                fromMe: m.msg.contextInfo.participant === jidNormalizedUser(conn.user.id),
                id: m.msg.contextInfo.stanzaId,
                participant: jidNormalizedUser(m.msg.contextInfo.participant)
            }
            m.quoted.sender = m.quoted.key.participant
        }
    }
    m.reply = (text, chatId, options) => conn.sendMessage(chatId ? chatId : m.chat, { text: text }, { quoted: m, ...options })
    return m
}

export function protoType() {
    Buffer.prototype.toArrayBuffer = function toArrayBuffer() {
        const ab = new ArrayBuffer(this.length);
        const view = new Uint8Array(ab);
        for (let i = 0; i < this.length; ++i) view[i] = this[i];
        return ab;
    };
    String.prototype.capitalize = function capitalize() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };
}

export function serialize() {}

