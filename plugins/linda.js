let handler = async (m, { conn }) => {

  // 🗓️ LA DATA DI INIZIO CALCOLATA PER AVERE 210 GIORNI OGGI
  // 16 Agosto 2025 (il bot userà questa data per far scorrere il tempo)
  const startDate = new Date('2025-08-16T00:00:00');
  const now = new Date();

  // Calcoli matematici aggiornati in tempo reale
  const diffMs = now - startDate;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffOre = Math.floor(diffMin / 60);
  const diffGiorni = Math.floor(diffOre / 24);
  
  // Calcolo approssimativo dei mesi (un mese medio ha 30.44 giorni)
  const diffMesi = (diffGiorni / 30.44).toFixed(1).replace('.', ',');

  // Funzione per formattare i numeri grandi con i puntini (es. 18.144.000)
  const formatta = (numero) => numero.toLocaleString('it-IT');

  let messaggio = `
⊹ ࣪ ˖ ✦ ━━ 𝐋 𝐈 𝐍 𝐃 𝐀 ━━ ✦ ˖ ࣪ ⊹

𝐬𝐨𝐧𝐨:
• ${formatta(diffGiorni)} giorni
• Secondi: ${formatta(diffSec)}
• Minuti: ${formatta(diffMin)}
• Ore: ${formatta(diffOre)}
• Mesi: circa ${diffMesi} mesi

 𝐞 𝐚𝐧𝐜𝐨𝐫𝐚 𝐬𝐞𝐢:

*lindol, vita, il mio amore, la mia casa, il mio posto sicuro, il mio sorriso quando va tutto storto, la mia pace, la mia forza, la mia felicità, la mia persona, la mia complice, la mia migliore amica, la mia sorella dell’anima, il mio cuore, la mia metà, il mio per sempre*

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

  // Invia il messaggio
  await conn.reply(m.chat, messaggio, m);
};

handler.help = ['linda'];
handler.tags = ['owner'];
handler.command = /^(linda)$/i;

// 👑 PERMESSI: SOLO OWNER
handler.owner = true;

export default handler;