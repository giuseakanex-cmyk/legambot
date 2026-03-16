import cp, { exec as _exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const exec = promisify(_exec).bind(cp);

const handler = async (m, { conn, isSam, usedPrefix, command, text }) => {
  const ar = Object.keys(plugins);
  const ar1 = ar.map((v) => v.replace('.js', ''));

  if (!text) {
    return conn.reply(m.chat, `*🍬 Inserisci il nome di un plugin (file) esistente*\n\n*—◉ Esempio*\n*◉ ${usedPrefix + command}* info-infobot\n\n*—◉ Lista dei plugin (file) esistenti:*\n*◉* ${ar1.map((v) => ' ' + v).join`\n*◉*`}`, m);
  }

  if (!ar1.includes(text)) {
    // Trova i 5 plugin con nomi più simili
    const similarities = ar1.map(name => {
      const similarity = stringSimilarity(text.toLowerCase(), name.toLowerCase());
      return { name, similarity };
    }).sort((a, b) => b.similarity - a.similarity).slice(0, 5);

    let suggestionText = '';
    if (similarities.length > 0 && similarities[0].similarity > 0.3) {
      suggestionText = `\n\n*—◉ Forse intendevi uno di questi?*\n${similarities.map(item => `*◉* ${item.name}`).join('\n')}`;
    }

    return conn.reply(m.chat, `*🍭 Nessun plugin (file) trovato con il nome "${text}", inserisci un nome esistente*\n\n*==================================*\n\n*—◉ Lista dei plugin (file) esistenti:*\n*◉* ${ar1.map((v) => ' ' + v).join`\n*◉*`}${suggestionText}`, m);
  }

  let o;
  try {
    o = await exec('cat plugins/' + text + '.js');
  } catch (e) {
    o = e;
  } finally {
    const { stdout, stderr } = o;
    if (stdout.trim()) {
      await conn.sendMessage(m.chat, { document: fs.readFileSync(`./plugins/${text}.js`), mimetype: 'application/javascript', fileName: `${text}.js` }, { quoted: m });
    }
    if (stderr.trim()) {
      await conn.sendMessage(m.chat, { document: fs.readFileSync(`./plugins/${text}.js`), mimetype: 'application/javascript', fileName: `${text}.js` }, { quoted: m });
    }
  }
};

handler.help = ['getplugin'];
handler.tags = ['creatore'];
handler.command = ['getplugin', 'plugin'];
handler.owner = true;

// Funzione per calcolare la similarità tra stringhe
function stringSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// Funzione per calcolare la distanza di Levenshtein
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

export default handler;