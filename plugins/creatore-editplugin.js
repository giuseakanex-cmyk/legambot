import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, isSam, usedPrefix, command, text }) => {
  if (!text) {
    return conn.reply(m.chat, `*🍬 Inserisci il nome e il nuovo contenuto del plugin*\n\n*—◉ Esempio*\n*◉ ${usedPrefix + command}* nome-plugin const handler = async (m, { conn }) => { await conn.reply(m.chat, 'Ciao modificato!', m); }; handler.help = ['test']; handler.tags = ['test']; handler.command = ['test']; export default handler;`, m);
  }

  const args = text.split(' ');
  if (args.length < 2) {
    return conn.reply(m.chat, `*🍬 Inserisci sia il nome che il nuovo contenuto del plugin*\n\n*—◉ Esempio*\n*◉ ${usedPrefix + command}* nome-plugin const handler = async (m, { conn }) => { await conn.reply(m.chat, 'Ciao modificato!', m); }; handler.help = ['test']; handler.tags = ['test']; handler.command = ['test']; export default handler;`, m);
  }

  const ar = Object.keys(plugins);
  const ar1 = ar.map((v) => v.replace('.js', ''));

  let pluginName = args[0];
  if (!pluginName.endsWith('.js')) {
    pluginName = pluginName + '.js';
  }

  const filePath = path.join('plugins', pluginName);
  const pluginContent = args.slice(1).join(' ');

  if (!fs.existsSync(filePath)) {
    // Trova i 5 plugin con nomi più simili
    const similarities = ar1.map(name => {
      const similarity = stringSimilarity(args[0].toLowerCase(), name.toLowerCase());
      return { name, similarity };
    }).sort((a, b) => b.similarity - a.similarity).slice(0, 5);

    let suggestionText = '';
    if (similarities.length > 0 && similarities[0].similarity > 0.3) {
      suggestionText = `\n\n*—◉ Forse intendevi uno di questi?*\n${similarities.map(item => `*◉* ${item.name}`).join('\n')}`;
    }

    return conn.reply(m.chat, `*🍭 Nessun plugin trovato con il nome "${args[0]}"*\n\n*—◉ Lista dei plugin esistenti:*\n*◉* ${ar1.map((v) => ' ' + v).join`\n*◉*`}${suggestionText}`, m);
  }

  try {
    fs.writeFileSync(filePath, pluginContent, 'utf8');
    await conn.reply(m.chat, `*✅ Plugin "${pluginName}" modificato con successo!*\n\n*Contenuto aggiornato in:* plugins/${pluginName}`, m);
  } catch (error) {
    await conn.reply(m.chat, `*❌ Errore durante la modifica del plugin*\n\n${error.message}`, m);
  }
};

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

handler.help = ['editplugin'];
handler.tags = ['creatore'];
handler.command = ['editplugin'];
handler.owner = true;

export default handler;
