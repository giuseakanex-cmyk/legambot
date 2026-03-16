
LEGAM BOT BY GIUSE AKA NEX


🔮 PANORAMICA DEL SISTEMA🎭 Il vertice dell'automazione su WhatsApp. Unico, spietato, perfetto.✨ Moduli Principali📥 PROTOCOLLO DI INSTALLAZIONE💻 SERVER LINUX / VPS / UBUNTU (CONSIGLIATO)Il sistema è progettato per girare al massimo delle prestazioni su server dedicati.Esegui questi comandi in sequenza nel terminale:sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ffmpeg imagemagick build-essential
curl -fsSL [https://deb.nodesource.com/setup_20.x](https://deb.nodesource.com/setup_20.x) | sudo -E bash -
sudo apt install -y nodejs

git clone [https://github.com/giuseakanex-cmyk/legambot.git](https://github.com/giuseakanex-cmyk/legambot.git)
cd legambot
mkdir -p lib plugin temp
npm install --legacy-peer-deps
npm start
📱 ANDROID (TERMUX)Se vuoi hostare il bot dal telefono, usa Termux (scaricabile da F-Droid).termux-setup-storage
pkg update && pkg upgrade -y
pkg install x11-repo tur-repo git nodejs ffmpeg imagemagick yarn -y

cd ~
git clone [https://github.com/giuseakanex-cmyk/legambot.git](https://github.com/giuseakanex-cmyk/legambot.git)
cd legambot
mkdir -p lib plugin temp
npm install --legacy-peer-deps
npm start
⚙️ CONFIGURAZIONE APIsPer sbloccare il 100% del potenziale del Legam OS, modifica il file config.js inserendo le tue chiavi API che puoi ottenere gratuitamente dai rispettivi provider:APIUsata inDove Ottenerlaspotifyclientid & secretDownload musica, RicercaSpotify DeveloperbrowserlessStrumenti Web e ScraperBrowserless.ioocrspaceLettura testo da immaginiOCR.spaceassemblyaiTrascrizione Note VocaliAssemblyAIgoogle & googleCXIA Gemini, Ricerca GoogleGoogle Cloud ConsoleremovebgScontorno Immagini AIRemove.bg APIopenrouterIA (Claude, Mistral, Llama)OpenRoutersightengineAnti-Porno e Anti-GoreSightengine⚠️ Il Legam Core è configurato per funzionare anche con i moduli base se alcune API mancano, ma le prestazioni ottimali si raggiungono con l'arsenale completo.👨‍💻 L'ARCHITETTOGIUSEFondatore e Sviluppatore del Sistema Legam OS
