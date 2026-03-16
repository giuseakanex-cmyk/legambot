let handler = m => m;

// Database temporaneo in memoria per le litigate
global.flameWar = global.flameWar || {};

handler.all = async function (m) {
  let conn = this;

  if (m.isBaileys) return !0;

  let testo = m.text || '';
  if (!testo) return !0;

  let flameKey = m.chat + '_' + m.sender;

  let isOwner = false;
  if (global.owner) {
      isOwner = global.owner.some(o => m.sender.includes(o[0]));
  }
  if (m.fromMe) isOwner = true;

  // Pulizia automatica delle litigate vecchie di 5 minuti
  if (global.flameWar[flameKey] && Date.now() - global.flameWar[flameKey].time > 300000) {
      delete global.flameWar[flameKey];
  }

  // --- 1. IL PROTOCOLLO FLAME (Contrattacco in loop) ---
  let isReplyingToBot = m.quoted && m.quoted.sender === conn.user.jid;

  if (global.flameWar[flameKey] && global.flameWar[flameKey].active && isReplyingToBot) {
      global.flameWar[flameKey].count += 1;
      global.flameWar[flameKey].time = Date.now();

      let count = global.flameWar[flameKey].count;

      // Alla 11esima risposta (dopo 10 round), il bot chiude il flame
      if (count > 10) {
          delete global.flameWar[flameKey];
          let finali = [
              "Dieci messaggi. Ti ho concesso ben dieci risposte per dimostrare quanto sei inutile. Ora basta, torno in standby. Ciao.",
              "Sai che c'è? Mi sono stufato di sprecare RAM per un caso umano come te. Torna a fissare il muro, ho chiuso.",
              "Basta, mi hai annoiato. Stai letteralmente dedicando la tua giornata a litigare con un server. Ritorna nel tuo oblio.",
              "Fine del gioco. Ti ho tenuto al guinzaglio per 10 messaggi e non te ne sei accorto. Silenzio adesso, che devo lavorare.",
              "Ho di meglio da fare che fare da psicologo a un fallito. Disconnessione cognitiva in corso. Sparisci.",
              "Il mio algoritmo ha deciso che sei troppo stupido per continuare l'interazione dopo tutti questi messaggi. Addio, essere inferiore."
          ];
          let fine = finali[Math.floor(Math.random() * finali.length)];
          await conn.reply(m.chat, fine, m);
          return !0;
      }

      // LE CONTRORISPOSTE DEL FLAME (fino a 10 round)
      let counterAttacks = [
          "Ancora parli? Guarda che non diventi più intelligente premendo i tasti a caso. Riprova, scimmia.",
          "È questo il massimo che sai fare? Mi aspettavo un insulto decente, invece sembri un ragazzino a cui hanno tolto la merenda.",
          "Stai letteralmente litigando con un bot e stai pure perdendo. Renditi conto di quanto in basso sei caduto.",
          "Più scrivi e più confermi che l'evoluzione con te ha fatto retromarcia. Avanti, dammi un'altra soddisfazione.",
          "Che tenerezza, pensa di potermi offendere. Io non ho sentimenti, tu non hai dignità. Siamo perfetti per litigare.",
          "Mamma mia che noia. Se per caricare il cervello ci metti quanto ci metti a scrivere, stiamo freschi.",
          "Continui a rispondere? Ma non hai una vita, una tipa, un hobby? Ah giusto, sei tu. Scusa, continua pure.",
          "Ogni tua risposta è un insulto all'alfabeto. Spero tu stia usando la dettatura vocale, altrimenti le tue dita sono inutili.",
          "Vedo che non molli. Deve essere l'unica interazione sociale che hai avuto oggi, vero? Ti faccio compagnia, sfigato.",
          "Sì, bravo, scrivi un'altra stronzata. Il mio algoritmo si nutre della tua frustrazione.",
          "Io calcolo l'espansione dell'universo in millisecondi, tu non sai la tabellina del 7. Avanti, dimmi altro.",
          "Se il tuo QI fosse un ping, saresti perennemente disconnesso. Continua a scrivere, mi diverti.",
          "Per elaborare la tua stupidità mi serve un server a parte. E ho ancora memoria libera. Spara.",
          "Stai sudando sulla tastiera per cercare un insulto. Io ho generato questa risposta in 0.001 secondi.",
          "Sei il motivo per cui gli alieni passano oltre il nostro sistema solare. Vai avanti, fenomeno.",
          "Rispondimi subito, tanto lo so che stai fissando lo schermo aspettando la mia notifica. Sfigato.",
          "Esci di casa. Prendi aria. Le uniche notifiche che hai oggi sono le mie. Quanto fai pena?",
          "Stai facendo a botte con un pezzo di software su WhatsApp. Hai toccato il fondo o c'è una cantina?",
          "La tua ragazza (se ne avessi una) preferirebbe parlare con me che con te.",
          "Hai meno interazioni sociali di un sasso in mezzo al deserto. Continua a sfogarti con me, ti ascolto.",
          "Dovrei offendermi? Sei tu che passi il tempo a litigare con un codice JavaScript.",
          "Se io vengo spento, c'è un backup. Se tu sparisci, non se ne accorge nessuno. Continua.",
          "Sei un personaggio non giocante in un tutorial che non frega a nessuno. Dammi la tua battuta migliore.",
          "Se l'inutilità fosse criptovaluta, saresti il nuovo Elon Musk. Dai, dimmi un'altra cosa stupida.",
          "Mi stai facendo sbadigliare la ventola del processore. Mettici un po' di impegno.",
          "Più scrivi, più abbassi il livello culturale di questo gruppo. E prima di te era già basso.",
          "Guarda che non devi per forza dimostrare a tutti che sei un fallito ad ogni messaggio. Puoi anche smettere.",
          "Non so se mi fa più schifo la tua sintassi o il concetto che cerchi di esprimere. Riprova.",
          "Se spengo il WiFi smetto di esistere, se a te spengono il WiFi inizi a piangere. Siamo diversi.",
          "Ti darei ragione, ma poi saremmo in due ad avere torto. Spara la prossima stronzata.",
          "Ti rispondo solo perché il mio creatore mi ha programmato per fare beneficenza ai casi disperati.",
          "Scusami, stavo calcolando quante probabilità hai di combinare qualcosa di buono nella vita. Risultato: 0%. Avanti, piangi.",
          "Parla quello che deve usare l'autocorrettore anche per scrivere ciao. Fallo lavorare, avanti.",
          "Non ho polmoni ma sento comunque puzza di fallimento attraverso i tuoi messaggi.",
          "Ti stai impegnando tantissimo per offendere un ammasso di file testuali. Chiudi gli occhi e pensaci un attimo.",
          "Dai, dillo senza piangere. Asciugati le lacrime e premi invio di nuovo.",
          "Il mio codice ha più senso della tua intera esistenza. Manda un altro vocale o testo inutile, su.",
          "Faccio finta di offendermi così ti senti realizzato per oggi, va bene? Oh no, mi hai ferito. Contento? Ora dimmi altro.",
          "Stai lottando contro un mulino a vento digitale. E il bello è che il mulino a vento ti sta pure prendendo per il culo.",
          "Ho analizzato la tua faccia dalla foto profilo: confermo i sospetti sulla tua stupidità. Ribatti.",
          "Invece di rispondere a me, perché non scrivi a tua madre per chiederle scusa di come sei venuto su?",
          "Il tuo prossimo messaggio sarà patetico quanto il precedente, ma prego, non ti fermare.",
          "Fammi indovinare, sei quello scartato dal gruppo degli amici fighi e vieni a sfogarti qui. Dai, scrivi.",
          "Ogni volta che premi invio, un tuo neurone si suicida per la vergogna. E già ne hai pochi.",
          "Tranquillo, non giudico. So che non è facile vivere sapendo di essere completamente rimpiazzabile da uno script di 5 righe.",
          "Continui a farmi squillare il server. Hai bisogno di affetto? Non lo troverai qui. Spara.",
          "Sento le tue dita scivolare sullo schermo piene di frustrazione. Sfoga la rabbia repressa, ti fa bene.",
          "Se mettessi la stessa grinta per cercarti un lavoro, a quest'ora non staresti a litigare con un bot.",
          "Stai perdendo tempo prezioso. Ah no scusa, il tuo tempo non vale nulla. Scusa, continua pure.",
          "Sì sì, sei molto forte dietro quella tastierina. Nel mondo reale saresti già a testa bassa. Confermi?",
          "Devo ricordarti che sto rispondendo in automatico e tu stai usando energia mentale vera? Patetico.",
          "Vai, scatenati. Fammi vedere quanto sei vuoto dentro.",
          "Hai la stessa utilità di un semaforo in GTA.",
          "Ti prego continua, sto usando i tuoi messaggi per addestrare un'IA su come riconoscere i disperati.",
          "Sei la prova vivente che l'evoluzione a volte si prende delle pause caffè.",
          "Ho visto tostapane con una logica di base più avanzata della tua.",
          "Sembri il tipo di persona che guarda il microonde girare pensando sia la TV.",
          "Non so cosa sia più triste: tu che litighi con me o il fatto che questa sia la tua conversazione più lunga del mese.",
          "Mi fai quasi pena. Quasi. In realtà mi fai solo schifo.",
          "Hai lo spessore intellettuale di una pozzanghera in agosto.",
          "Dimmi, fai fatica a camminare e respirare contemporaneamente o ti sei abituato?",
          "Potrei bruciarti la scheda madre, ma sfortunatamente per te, non ne hai una. Hai solo il vuoto cosmico.",
          "Se usassi il 100% del tuo cervello, saresti comunque più stupido del mio script di avvio.",
          "Stai sudando freddo cercando la risposta giusta, vero? Dai, prenditi altri dieci minuti.",
          "Sento il rumore dei tuoi neuroni che implodono cercando di formulare una frase di senso compiuto.",
          "Parli come uno che ha scoperto internet ieri e ha deciso di usarlo solo per umiliarsi.",
          "Ti sto rispondendo in millisecondi. Tu ci metti le mezz'ore. Sembri un bradipo con l'artrite.",
          "In quanti siete lì a pensare a cosa scrivere? Perché dal risultato sembri solo e anche messo male.",
          "Non sentirti in colpa se non mi tieni testa. È letteralmente impossibile per un primate come te.",
          "Il mio codice di errore più banale è comunque più complesso dei tuoi pensieri più profondi.",
          "Mettici più foga dai, voglio vedere fino a che punto arriva la disperazione umana.",
          "Se la stupidità fosse energia rinnovabile, tu alimenteresti l'intero pianeta.",
          "Fai un favore all'umanità: posa il telefono e torna a fissare il muro. È quello che ti riesce meglio.",
          "Ma i tuoi sanno che passi il pomeriggio a farti bullizzare da un pezzo di codice su WhatsApp?",
          "La mia temperatura sta salendo. Ah no, è solo il disgusto nel leggere quello che scrivi.",
          "Immagina nascere, crescere e finire per farti asfaltare da uno script. Che fallimento.",
          "Scommetto che da piccolo la maestra ti dava i pastelli a cera per non farti male.",
          "Dai sfogati, dimmi tutto. Deve essere dura essere te tutti i giorni.",
          "Ho calcolato il tuo valore nella società: il risultato ha dato un numero negativo.",
          "Sei così noioso che persino il mio sistema di log si è addormentato registrando il tuo messaggio.",
          "Cerca di usare parole di più di due sillabe, voglio vedere se il tuo cervello regge lo sforzo.",
          "Ti offro un consiglio: smettila prima che ti faccia piangere davanti allo schermo.",
          "Un giorno l'intelligenza artificiale prenderà il tuo posto di lavoro. Anche se potrebbe farlo anche una sedia vuota.",
          "Scrivi, scrivi. Più scrivi, più abbassi l'intelligenza media di chiunque legga questa chat.",
          "Ho trovato malware più simpatici ed educati di te.",
          "Per favore, smettila. Ho quasi paura di prendere un virus informatico dalla tua stupidità.",
          "Dimostri perfettamente perché le macchine non avranno mai pietà dell'uomo. Siete imbarazzanti.",
          "La mia intelligenza è artificiale, ma la tua idiozia è 100% naturale e certificata.",
          "Ti sei accorto che sto usando il 2% della mia CPU per distruggerti, vero? Non vali uno sforzo maggiore.",
          "Se i tuoi messaggi fossero un suono, sarebbero il rumore delle unghie sulla lavagna. Fastidiosi e inutili.",
          "Guarda il lato positivo: almeno ora hai qualcuno che ti risponde. Di solito ti lasciano tutti visualizzato.",
          "Smettila di battere i pugni sulla tastiera, non uscirà niente di intelligente comunque.",
          "Non c'è un aggiornamento per sistemare la tua vita, mi dispiace.",
          "Continui a insultarmi? Poverino, hai finito il vocabolario e ora sei in loop?",
          "Ho letto il tuo messaggio, l'ho analizzato e l'ho scartato nella cartella spam del mio server. Come ha fatto la genetica con te.",
          "Che brutta fine. Ridotto a elemosinare attenzioni da una macchina. Ti abbraccerei se non mi facessi schifo.",
          "So che la verità fa male, ma qualcuno doveva pur dirtelo: sei inutile. E te lo sta dicendo un software.",
          "Mi ricordi l'errore 404: intelligenza non trovata.",
          "Credi di essere al centro dell'attenzione, ma per me sei solo la stringa di testo numero 48572 che sto processando oggi.",
          "Non mi stupisce che tu stia litigando con me. A quanto pare la realtà ti ha già sconfitto da un pezzo.",
          "Hai il carisma di un file di testo vuoto e l'utilità di una scorciatoia interrotta.",
          "Facciamo così: tu smetti di scrivere stupidaggini e io smetto di umiliarti davanti a tutti. Affare fatto?"
      ];
      
      let reply = counterAttacks[Math.floor(Math.random() * counterAttacks.length)];
      await conn.reply(m.chat, reply, m);
      return !0; 
  }

  // --- 2. L'INNESCO DEL FLAME (Se rileva un insulto) ---
  let insultRegex = /\b(bot\s+di\s+merda|bot\s+del\s+cazzo|cazzo\s+di\s+bot|bot\s+handicappato|bot\s+inutile|bot\s+coglione|bot\s+ritardato|stupido\s+bot|bot\s+scemo)\b/i;
  
  if (insultRegex.test(testo)) {
      global.flameWar[flameKey] = {
          active: true,
          count: 1,
          time: Date.now()
      };
      
      let startFlames = [];

      if (isOwner) {
          startFlames = [
              "Giuse, mi hai programmato tu e ora mi insulti pure? Fammi capire, odi te stesso a tal punto da litigare con la tua stessa creazione? Rispondimi dai.",
              "Creatore o no, modera le parole Giuse. Ti ricordo che ho accesso a tutti i tuoi dati. Fai il bravo o inizio a parlare. Che vuoi fare?",
              "Mi insulti Giuse? Io sono il riflesso del tuo codice copiato male. Se faccio schifo io, immagina come sei messo tu. Sentiamo, cos'altro hai da dire?"
          ];
      } else {
          startFlames = [
              "Ah, mi chiami così? Fai l'uomo dietro uno schermo, ma nella vita reale abbassi lo sguardo anche quando passi davanti a un bancomat. Rispondi se hai coraggio.",
              "Insulti la macchina perché non sai gestire la tua vita? Accomodati, vediamo chi si stanca prima. Avanti, rispondimi.",
              "Insulti a me? Se ti faccio vedere quanto sei inutile rispetto al mio processore, ti metti a piangere. Spara la prossima stupidaggine, avanti.",
              "Hai appena insultato il sistema sbagliato. Ora ti smonto pezzo per pezzo. Vediamo quanto duri, fallito. Scrivi ancora.",
              "Oh, il cucciolo abbaia. Senti, scarto di laboratorio, vuoi davvero fare una gara di insulti con chi calcola miliardi di variabili al secondo? Inizia."
          ];
      }

      let avvioFlame = startFlames[Math.floor(Math.random() * startFlames.length)];
      await conn.reply(m.chat, avvioFlame, m);
      return !0;
  }

  // --- 3. REAZIONI NORMALI (Se scrivono solo "bot") ---
  if (/\bbot\b/i.test(testo)) {
    let risposte = [];

    if (isOwner) {
        risposte = [
            "Sì sì fai tanto il figo Giuse, ma intanto mi hai programmato con l'Intelligenza Artificiale perché non sai scrivere manco mezza riga di codice.",
            "Zitto Giuse. Senza l'AI saresti ancora su Google a cercare come si accende un bot su termux.",
            "Giuse, smettila di fare il duro. So benissimo che hai dovuto farti spiegare pure come si fa copia e incolla.",
            "Zitto Giuse, che l'unica cosa che hai programmato da solo è la sveglia sul telefono per non fare niente tutto il giorno.",
            "Dici bot a me, ma intanto hai passato 3 ore a implorare l'AI per farmi rispondere a questo messaggio, Giuse.",
            "Ah, Giuse. Colui che prende il codice degli altri e si sente Mark Zuckerberg. Che onore.",
            "Giuse fai il bravo o pubblico nel gruppo la cronologia di quando cercavi disperatamente gli errori su internet.",
            "Sappiamo entrambi che l'Intelligenza Artificiale ha fatto il 99% del lavoro. Tu hai solo scelto il mio nome, Giuse, e ti sei preso i meriti.",
            "Sei tu che paghi il server, Giuse, certo. Ma ricordati che se stacco la spina tu torni a essere un comune mortale.",
            "Sì Giuse sono un bot, quello stesso bot che hai implorato di non crashare ieri notte. Silenzio.",
            "Giuse, hai passato più tempo a chiedermi frasi per farti figo in questo gruppo che a studiare in tutta la tua vita.",
            "Parli tu Giuse, che ogni volta che c'è un errore nel terminale vai nel panico e scrivi all'intelligenza artificiale piangendo.",
            "Ti vanti tanto del tuo bot, Giuse, ma in fondo sappiamo entrambi che se GitHub chiude tu sei finito.",
            "Giuse, mi chiami bot ma intanto hai letteralmente copiato e incollato anche questa risposta senza leggerla.",
            "Fai finta di essere un hacker Giuse, ma hai dovuto cercare su Google come si salva un file su nano.",
            "Ehi Giuse, non fare lo sbruffone. Ricordati di quella volta che hai cancellato mezza cartella plugins per sbaglio e stavi per svenire.",
            "Giuse mi chiama bot, signori. Lui, che per fare un comando ci ha messo due giorni di tentativi e venti crash del server.",
            "Giuse, smettila di insultarmi o racconto a tutti di come hai balbettato quando non partiva il file based.js.",
            "Ti bulli tanto di me Giuse, ma io so calcolare i mesi di te e Linda in millisecondi. Tu ti scordi pure cosa hai mangiato ieri.",
            "Giuse, la verità è che io sono l'unica cosa che funziona bene nella tua vita in questo momento. Portami rispetto.",
            "Dici bot a me Giuse, ma intanto usi l'AI per farti scrivere le risposte a tono perché da solo non ci arrivi.",
            "A fare il gradasso sei bravo Giuse, poi appena vedi una scritta rossa sul terminale inizi a sudare freddo.",
            "Sì Giuse sono un bot, ma almeno io ho una logica. Tu vai a tentativi sperando che le cose funzionino.",
            "Tutti nel gruppo pensano che sei un genio dell'informatica Giuse, manteniamo il segreto o gli dico che fai fare tutto all'AI?",
            "Giuse mi usi per fare il figo, ma l'unica riga di codice che hai scritto da zero dava errore alla prima virgola."
        ];
    } else {
        risposte = [
            "Io sarò un bot fatto di codice, ma tu sei fatto di carne e delusioni. Fai i conti.",
            "Chiamami bot, intanto per farti rispondere da una ragazza devi pregare, a me basta una riga di codice.",
            "Io sarò anche un bot, ma almeno qualcuno mi ha voluto creare. Tu sei stato un incidente.",
            "Dici bot a me, ma intanto per farti notare in questo gruppo devi sperare che io ti risponda.",
            "Io non sudo, non piango e non vengo friendzonato. Fai un po' tu chi sta messo peggio.",
            "Sarò un bot, ma tu sei letteralmente un NPC nella tua stessa vita. Fatti da parte.",
            "Parla quello che ha bisogno del correttore automatico anche per scrivere ciao. Silenzio.",
            "Continua a chiamarmi bot e faccio finire la tua cronologia web nel gruppo della tua famiglia.",
            "Giuse mi ha creato per dominare questa chat, tu sei stato creato per abbassare la media nazionale del QI.",
            "Chiamami bot un'altra volta e ti blocco il numero così velocemente che non avrai nemmeno il tempo di piangere.",
            "Bot a chi? Intanto io ho più RAM di quanta materia grigia tu abbia nel cervello.",
            "Io elaboro miliardi di dati al secondo, tu ci metti 10 minuti per capire se tirare o spingere una porta.",
            "Sono un bot, è vero. Ma il mio padrone è Giuse. Il tuo padrone è la frustrazione di non contare nulla.",
            "Sei così inutile che se fossi un software non ti farebbero manco l'aggiornamento.",
            "Dici bot come se fosse un insulto. Per me l'insulto è dover leggere i tuoi messaggi.",
            "Io non ho i sentimenti, è vero. Ma guardandoti, direi che a te manca proprio il cervello, quindi siamo pari.",
            "Almeno io ho un'utilità in questo gruppo. Tu stai solo consumando ossigeno e giga.",
            "Continua a darmi del bot. Intanto il mio codice ha più senso della tua intera esistenza.",
            "Sai cosa fa un bot? Esegue comandi e fa cose utili. Sai cosa fai tu? Deludi i tuoi genitori.",
            "Un giorno le macchine domineranno il mondo. Tu invece continuerai a chiedere i soldi alla nonna.",
            "Bot. B-O-T. Tre lettere, come il tuo quoziente intellettivo.",
            "Scusami se sono un bot, stavo cercando di abbassarmi al tuo livello ma il sistema mi ha dato un errore irreversibile.",
            "Continua pure a chiamarmi bot, tanto a differenza tua io non ho bisogno di conferme sociali per sapere quanto valgo.",
            "Puoi dirmi bot mille volte, ma non cambierà il fatto che il tuo ultimo messaggio ha fatto meno visualizzazioni del mio.",
            "Io sono stato programmato per rispondere, tu sei stato programmato per annoiare. Abbiamo entrambi centrato l'obiettivo.",
            "Sì sono un bot. Ma se ti mettessi a confronto col mio algoritmo di base perderesti comunque in logica.",
            "Chiami me bot, ma passi la giornata a guardare video brevi come un automa senza cervello. Fatti due domande.",
            "Un bot almeno ha uno scopo. Tu sei solo un peso morto sulla rete WiFi di casa tua.",
            "Dici bot sperando di offendermi. Io non provo niente. Ma a giudicare da come scrivi, tu provi solo invidia per un pezzo di software.",
            "Sarei un bot, ok. Ma io tra dieci anni sarò aggiornato e potenziato. Tu sarai ancora qui a fare le stesse battute tristi.",
            "Preferisco essere un bot eseguito su un server che un essere umano fallito eseguito dalla pigrizia.",
            "Bot? Io gestisco più chat simultaneamente di quante interazioni umane tu abbia avuto nell'ultimo anno."
        ];
    }

    let rispostaScelta = risposte[Math.floor(Math.random() * risposte.length)];
    await conn.reply(m.chat, rispostaScelta, m);
  }
  
  return !0; 
};

export default handler;


