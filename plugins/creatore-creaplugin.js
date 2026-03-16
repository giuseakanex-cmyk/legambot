import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, isSam, usedPrefix, command, text }) => {
  if (!text) {
    return conn.reply(m.chat, `*🍬 Inserisci il nome e il contenuto del plugin*\n\n*◉ Esempio*\n- *\`${usedPrefix + command} nome-plugin\`*\n- const handler = async (m, { conn }) => {\n- await conn.reply(m.chat, 'Ciao!', m);\n- };\n- handler.help = ['test'];\n- handler.tags = ['test'];\n- handler.command = ['test'];\n- export default handler;`, m);
  }

  const args = text.split(' ');
  if (args.length < 2) {
    return conn.reply(m.chat, `*🍬 Inserisci sia il nome che il contenuto del plugin*\n\n*- ◉ Esempio*\n- *\`${usedPrefix + command} nome-plugin\`*\n- const handler = async (m, { conn }) => {\n- await conn.reply(m.chat, 'Ciao!', m);\n- };\n- handler.help = ['test'];\n- handler.tags = ['test'];\n- handler.command = ['test'];\n- export default handler;`, m);
  }

  const pluginName = args[0];
  const pluginContent = args.slice(1).join(' ');

  if (!pluginName.endsWith('.js')) {
    args[0] = pluginName + '.js';
  }

  const filePath = path.join('plugins', args[0]);

  if (fs.existsSync(filePath)) {
    return conn.reply(m.chat, `*⚠️ Il plugin "${args[0]}" esiste già*\n\n*Usa .editplugin per modificarlo*`, m);
  }

  try {
    fs.writeFileSync(filePath, pluginContent, 'utf8');
    await conn.reply(m.chat, `*✅ Plugin "${args[0]}" creato con successo!*\n\n*Contenuto salvato in:* plugins/${args[0]}`, m);
  } catch (error) {
    await conn.reply(m.chat, `*❌ Errore durante la creazione del plugin*\n\n${error.message}`, m);
  }
};

handler.help = ['creaplugin'];
handler.tags = ['creatore'];
handler.command = ['creaplugin', 'creapl', 'nuovopl', 'nuovoplugin'];
handler.owner = true;

export default handler;