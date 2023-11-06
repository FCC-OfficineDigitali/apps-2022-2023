# Introduzione

FacilitatoriPalestre è una webapp che, successivamente ad una fase di login che avviene da parte di un utente facilitatore, permette tramite comunicazione con un’applicazione server di gestire le proprie disponibilità riguardanti le palestre digitali.

# 1. Tipologia di webapp ed utilizzo

Trattandosi più precisamente di una [PWA](https://it.wikipedia.org/wiki/Progressive_Web_App), la webapp ha la possibilità di comportarsi su dispositivi mobili in maniera simile ad una vera e propria applicazione.

Le webapp in questione è raggiungibile al seguente link: [https://officinedigitali.fcc.veneto.it/FacilitatoriPalestre/](https://officinedigitali.fcc.veneto.it/FacilitatoriPalestre/)

Per utilizzarla, i facilitatori ai quali sono state fornite delle credenziali dovranno superare una fase di login. Fatto questo, potranno visualizzare gli impegni del mese corrente e, durante la prima metà del mese, gestire le proprie ore fisse e disponibilità per il mese successivo.

Le ore fisse sono relative alle 3 palestre a cui il facilitatore è associato, mentre le disponibilità possono essere richieste dagli operatori associati alle 3 palestre a cui il facilitatore è a sua volta associato.

È inoltre possibile visualizzare e scaricare una lista dei prossimi impegni per il mese corrente.

# 2. Aspetti tecnici

Similmente all’applicazione server che è stata scritta in [Node.js](https://nodejs.org/it/) (un ambiente di esecuzione che permette di eseguire codice Javascript come un qualsiasi linguaggio di programmazione) e che fa utilizzo del framework [Express.js](https://expressjs.com/it/) per la creazione di [API](https://it.wikipedia.org/wiki/Application_programming_interface), la webapp è stata sviluppata con l’ausilio di derivati del linguaggio [Javascript](https://www.javascript.com/), in particolare della libreria [React.js](https://it.reactjs.org/) pensata per la creazione di interfacce utente.

Al fine di garantire responsività, il frontend è stato sviluppato principalmente utilizzando la libreria [MUI](https://mui.com/), la quale permette di importare componenti per creare interfacce utente nelle applicazioni React.

La webapp fa uso di [cookie tecnici](https://it.wikipedia.org/wiki/Cookie), necessari per fini di autenticazione.

L’applicazione server si interfaccia con una base di dati [MySQL](https://www.mysql.com/it/) che contiene dati riguardanti palestre, facilitatori, operatori e superUser, come le disponibilità e le credenziali per il login.

# 3. Utilizzo in locale

Nel dispositivo devono essere installati principalmente il runtime Javascript Node.js, il gestore di pacchetti [npm](https://www.nodeacademy.it/cose-npm-installazione-locale-globale-aggiornamento) e la piattaforma [XAMPP](https://www.apachefriends.org/it/index.html).

È necessario copiare nel proprio dispositivo i file od_gyms.sql e le cartelle FacilitatoriPalestre e Apps_server, presenti nella repository raggiungibile attraverso l’URL [https://github.com/FCC-OfficineDigitali/apps-2023](https://github.com/FCC-OfficineDigitali/apps-2023).

Per poter usufruire in locale di una copia di FacilitatoriPalestre, è necessario mantenere attivo MySQL tramite XAMPP per utilizzare il database MySQL il cui file .sql è contenuto nella repository.

Per permettere una comunicazione corretta tra client-server-database, è necessario indicare le variabili d'ambiente necessarie creando un file .env nella cartella dell'applicazione server e modificare il file dbgyms.js della cartella config dell’applicazione server, oltre che il file ipPortApi.js contenuto nella cartella src della webapp al fine di potersi riferire al server.

Lanciare il server eseguendo dalla sua cartella il comando _node index.js_, poi lanciare la webapp eseguendo il comando _npm start_ dalla sua cartella. L’applicazione server ed il client si possono lanciare solo dopo aver installato le dipendenze necessarie tramite l’esecuzione del comando _npm install_ (e, in caso di errori, _npm install –force_) dalle loro relative cartelle.

Se non si conoscono le credenziali di alcun facilitatore, è necessario modificare dal database la password di uno di loro mettendo, nella colonna password delle rispettive entry presenti nelle tabelle facilitators e accounts, il risultato della funzione [SHA-1](http://www.sha1-online.com/) applicata alla password desiderata.

# 4. Crediti

Lavoro sviluppato da Devid Mazzaferro, Francesco Camporese e Jacopo Trabona di Quantitas S.R.L. in collaborazione con Federazione dei Comuni del Camposampierese - Officine Digitali (ente attuatore del progetto).

![Loghi](/mergedLogos.png)
