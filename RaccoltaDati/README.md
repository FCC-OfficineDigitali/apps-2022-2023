# Introduzione

Il Libro Dei Passaggi è una webapp che, successivamente ad una fase di login che avviene da parte di un operatore, permette tramite comunicazione con un’applicazione server di eseguire operazioni CRUD sulla versione digitale del “Libro Dei Passaggi”, ovvero di un libro in cui chi visita [Punto Ristoro Ostiglia](https://www.facebook.com/Infopointostiglia) può riportare qualche informazione relativa al suo spostamento in corso.


# 1. Tipologia di webapp ed utilizzo

Trattandosi più precisamente di una [PWA](https://it.wikipedia.org/wiki/Progressive_Web_App), la webapp ha la possibilità di comportarsi su dispositivi mobili in maniera simile ad una vera e propria applicazione.

Le webapp in questione è raggiungibile al seguente link: [https://officinedigitali.fcc.veneto.it/RaccoltaDati/](https://officinedigitali.fcc.veneto.it/RaccoltaDati/) 

Per utilizzarla, gli operatori ai quali sono state fornite delle credenziali dovranno superare una fase di login. Fatto questo, potranno visualizzare le entries della versione digitale del Libro Dei Passaggi: è possibile aggiungere, eliminare e modificare entries.

Una singola riga dovrebbe rispecchiare ciò che una persona di passaggio presso Punto Ristoro Ostiglia ha scritto nella versione cartacea del libro: tra i vari dati riportabili ci sono nazione e comune di provenienza e destinazione, il motivo del viaggio che può rispecchiare alcune scelte prestabilite o meno, un pensiero libero.


# 2. Aspetti tecnici

Similmente all’applicazione server che è stata scritta in [Node.js](https://nodejs.org/it/) (un ambiente di esecuzione che permette di eseguire codice Javascript come un qualsiasi linguaggio di programmazione) e che fa utilizzo del framework [Express.js](https://expressjs.com/it/) per la creazione di [API](https://it.wikipedia.org/wiki/Application_programming_interface), la webapp è stata sviluppata con l’ausilio di derivati del linguaggio [Javascript](https://www.javascript.com/), in particolare della libreria [React.js](https://it.reactjs.org/) pensata per la creazione di interfacce utente.

Al fine di garantire responsività, il frontend è stato sviluppato principalmente utilizzando la libreria [MUI](https://mui.com/), la quale permette di importare componenti per creare interfacce utente nelle applicazioni React.

La webapp fa uso del [local storage](https://en.wikipedia.org/wiki/Web_storage#Local_and_session_storage), necessario per fini di autenticazione, dopo aver chiesto il permesso all’utente.

L’applicazione server si interfaccia con due basi di dati [MySQL](https://www.mysql.com/it/): una contiene i dati di accesso degli operatori che possono utilizzare il Libro Dei Passaggi digitale, l’altra contiene i dati presenti nel Libro Dei Passaggi digitale stesso.


# 3. Utilizzo in locale

Nel dispositivo devono essere installati principalmente il runtime Javascript Node.js, il gestore di pacchetti [npm](https://www.nodeacademy.it/cose-npm-installazione-locale-globale-aggiornamento) e la piattaforma [XAMPP](https://www.apachefriends.org/it/index.html).

È necessario copiare nel proprio dispositivo i file od_libropassaggi.sql e od_loginsystem.sql e le cartelle RaccoltaDati e Apps_server, presenti nella repository raggiungibile attraverso l’URL [https://github.com/FCC-OfficineDigitali/app-mappe-e-raccolta](https://github.com/FCC-OfficineDigitali/app-mappe-e-raccolta).

Per poter usufruire in locale di una copia della versione digitale del Libro Dei Passaggi, è necessario mantenere attivo MySQL tramite XAMPP per utilizzare i due database MySQL i cui file .sql sono contenuti nella repository. Se non si conoscono le credenziali di alcun utente, è necessario crearne uno eseguendo per il database degli utenti una query dalla forma _INSERT INTO users (username, password) VALUES ("NomeUtente", "Password");_ dove _NomeUtente _va sostituito con il nome utente desiderato e dove _Password _va sostituito con il risultato della funzione [SHA-1](http://www.sha1-online.com/) applicata alla password desiderata.

Per permettere una comunicazione corretta tra client-server-databases, è necessario modificare i file db.js e dbusers.js della cartella config dell’applicazione server, oltre che il file ipPortApi.js contenuto nella cartella src della webapp al fine di potersi riferire al server.

Lanciare il server eseguendo dalla sua cartella il comando _node index.js_, poi lanciare la webapp eseguendo il comando _npm start_ dalla sua cartella. L’applicazione server ed il client si possono lanciare solo dopo aver installato le dipendenze necessarie tramite l’esecuzione del comando _npm install_ (e, in caso di errori, _npm install –force_) dalle loro relative cartelle.


# 4. Crediti

Lavoro sviluppato da Francesco Camporese, Jacopo Trabona e Luca Zanardelli di Quantitas S.R.L. in collaborazione con Federazione dei Comuni del Camposampierese - Officine Digitali (ente attuatore del progetto).


![Loghi](/mergedLogos.png)