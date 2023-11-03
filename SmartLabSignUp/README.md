# Introduzione

SmartLab-SignUp è una webapp che permette tramite comunicazione con un’applicazione server di registrarsi come utente prenotatore per poter accedere alle relative app dell'Innovation Lab del Camposampierese.

# 1. Tipologia di webapp ed utilizzo

Trattandosi più precisamente di una [PWA](https://it.wikipedia.org/wiki/Progressive_Web_App), la webapp ha la possibilità di comportarsi su dispositivi mobili in maniera simile ad una vera e propria applicazione.

Le webapp in questione è raggiungibile al seguente link: [https://officinedigitali.fcc.veneto.it/SmartLabSignUp/](https://officinedigitali.fcc.veneto.it/SmartLabSignUp/)

Per utilizzarla, i futuri prenotatori dovranno premere sul bottone “registrati” dopo aver inserito i propri dati e accettato di rispettare le regole sull’utilizzo degli spazi.

# 2. Aspetti tecnici

Similmente all’applicazione server che è stata scritta in [Node.js](https://nodejs.org/it/) (un ambiente di esecuzione che permette di eseguire codice Javascript come un qualsiasi linguaggio di programmazione) e che fa utilizzo del framework [Express.js](https://expressjs.com/it/) per la creazione di [API](https://it.wikipedia.org/wiki/Application_programming_interface), la webapp è stata sviluppata con l’ausilio di derivati del linguaggio [Javascript](https://www.javascript.com/), in particolare della libreria [React.js](https://it.reactjs.org/) pensata per la creazione di interfacce utente.

Al fine di garantire responsività, il frontend è stato sviluppato principalmente utilizzando la libreria [MUI](https://mui.com/), la quale permette di importare componenti per creare interfacce utente nelle applicazioni React.

L’applicazione server si interfaccia con una base di dati [MySQL](https://www.mysql.com/it/) che contiene dati riguardanti amministratori ed utilizzatori dell’edificio, tra cui le credenziali per il login. Inoltre contiene anche dati riguardanti l’edificio stesso, tra cui le sale, le segnalazioni effettuate, gli slots ed eventuali messaggi informativi.

# 3. Utilizzo in locale

Nel dispositivo devono essere installati principalmente il runtime Javascript Node.js, il gestore di pacchetti [npm](https://www.nodeacademy.it/cose-npm-installazione-locale-globale-aggiornamento) e la piattaforma [XAMPP](https://www.apachefriends.org/it/index.html).

È necessario copiare nel proprio dispositivo i file od_reservations.sql e le cartelle SmartLabSignUp e Apps_server, presenti nella repository raggiungibile attraverso l’URL [https://github.com/FCC-OfficineDigitali/app-mappe-e-raccolta](https://github.com/FCC-OfficineDigitali/app-mappe-e-raccolta).

Per poter usufruire in locale di una copia di SmartLab-SignUp, è necessario mantenere attivo MySQL tramite XAMPP per utilizzare il database MySQL il cui file .sql è contenuto nella repository.

Per permettere una comunicazione corretta tra client-server-database, è necessario indicare le variabili d'ambiente necessarie creando un file .env nella cartella dell'applicazione server e modificare il file dbreservations.js della cartella config dell’applicazione server, oltre che il file ipPortApi.js contenuto nella cartella src della webapp al fine di potersi riferire al server.

Lanciare il server eseguendo dalla sua cartella il comando _node index.js_, poi lanciare la webapp eseguendo il comando _npm start_ dalla sua cartella. L’applicazione server ed il client si possono lanciare solo dopo aver installato le dipendenze necessarie tramite l’esecuzione del comando _npm install_ (e, in caso di errori, _npm install –force_) dalle loro relative cartelle.

# 4. Crediti

Lavoro sviluppato da Devid Mazzaferro, Francesco Camporese e Jacopo Trabona di Quantitas S.R.L. in collaborazione con Federazione dei Comuni del Camposampierese - Officine Digitali (ente attuatore del progetto).

![Loghi](/mergedLogos.png)
