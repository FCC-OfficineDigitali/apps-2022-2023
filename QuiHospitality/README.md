# Introduzione

QuiSiFa Impresa Turistica è una webapp che permette al pubblico di esplorare il tessuto imprenditoriale dei comuni del [Camposampierese](https://www.fcc.veneto.it), visualizzando informazioni relative ad aziende riportate su mappa i cui dati sono ottenuti tramite richieste ad un’applicazione server.

Le aziende visualizzabili sono relative al settore alloggio e ristorazione.

# 1. Tipologia di webapp ed utilizzo

Trattandosi più precisamente di una [PWA](https://it.wikipedia.org/wiki/Progressive_Web_App), la webapp ha la possibilità di comportarsi su dispositivi mobili in maniera simile ad una vera e propria applicazione.

Le webapp in questione è raggiungibile al seguente link: [https://officinedigitali.fcc.veneto.it/QuiHospitality/](https://officinedigitali.fcc.veneto.it/QuiHospitality/)

Utilizzandola, sarà possibile selezionare un punto sulla mappa per visualizzare le informazioni di un’azienda (o di più aziende, se si trovano nello stesso punto).

Si possono applicare filtri basati su sottosettori, parole chiave, comuni e dati presenti per le singole aziende.

Una [word cloud](https://it.wikipedia.org/wiki/Nuvola_di_etichette) permette di visualizzare le parole chiave più presenti nell’insieme di aziende visualizzate in un certo momento, mentre i colori dei punti visualizzati su mappa determinano le sottocategorie di appartenenza delle relative aziende.

Risulta possibile scaricare una versione ridotta del dataset in formato .CSV che contiene i dati di tutte le aziende che la webapp può mostrare. Tra questi si possono notare ad esempio i link ad eventuali social network raggiungibili (Facebook, Twitter, Instagram…) di cui le singole aziende fanno uso, oltre agli indirizzi e gli eventuali siti web.

# 2. Aspetti tecnici

Similmente all’applicazione server che è stata scritta in [Node.js](https://nodejs.org/it/) (un ambiente di esecuzione che permette di eseguire codice Javascript come un qualsiasi linguaggio di programmazione) e che fa utilizzo del framework [Express.js](https://expressjs.com/it/) per la creazione di [API](https://it.wikipedia.org/wiki/Application_programming_interface), la webapp è stata sviluppata con l’ausilio di derivati del linguaggio [Javascript](https://www.javascript.com/), in particolare della libreria [React.js](https://it.reactjs.org/) pensata per la creazione di interfacce utente.

Al fine di garantire responsività, il frontend è stato sviluppato principalmente utilizzando la libreria [MUI](https://mui.com/), la quale permette di importare componenti per creare interfacce utente nelle applicazioni React.

L’applicazione server fornisce alla webapp i dati presenti in alcuni file .CSV.

I dati relativi alle aziende rappresentate sono stati estratti dai registri di Infocamere tramite acquisizione e sono stati poi arricchiti grazie a [QIBA](https://www.quantitas.it/it/prodotti/qiba/), uno strumento proprietario per il web-scraping e l’indicizzazione, mentre le coordinate funzionali alla rappresentazione su mappa sono state reperite mediante l’utilizzo di una API open source.

# 3. Utilizzo in locale

Nel dispositivo devono essere installati principalmente il runtime Javascript Node.js ed il gestore di pacchetti [npm](https://www.nodeacademy.it/cose-npm-installazione-locale-globale-aggiornamento).

È necessario copiare nel proprio dispositivo le cartelle QuiHospitality e Apps_server, presenti nella repository raggiungibile attraverso l’URL [https://github.com/FCC-OfficineDigitali/apps-2023](https://github.com/FCC-OfficineDigitali/apps-2023).

Per permettere una comunicazione corretta tra client e server, è necessario indicare le variabili d'ambiente necessarie creando un file .env nella cartella dell'applicazione server e modificare il file ipPortApi.js contenuto nella cartella src della webapp al fine di potersi riferire al server.

Lanciare il server eseguendo dalla sua cartella il comando _node index.js_, poi lanciare la webapp eseguendo il comando _npm start_ dalla sua cartella. L’applicazione server ed il client si possono lanciare solo dopo aver installato le dipendenze necessarie tramite l’esecuzione del comando _npm install_ (e, in caso di errori, _npm install –force_) dalle loro relative cartelle.

# 4. Crediti

Lavoro sviluppato da Francesco Camporese, Jacopo Trabona e Luca Zanardelli di Quantitas S.R.L. in collaborazione con Federazione dei Comuni del Camposampierese - Officine Digitali (ente attuatore del progetto).

![Loghi](/mergedLogos.png)
