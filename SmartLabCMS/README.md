# Introduzione

SmartLab-CMS è una webapp che, successivamente ad una fase di login che avviene da parte di un utente amministratore, permette tramite comunicazione con un’applicazione server di gestire l'Innovation Lab del Camposampierese insieme a SmartLab-Amministratore.

# 1. Tipologia di webapp ed utilizzo

Trattandosi più precisamente di una [PWA](https://it.wikipedia.org/wiki/Progressive_Web_App), la webapp ha la possibilità di comportarsi su dispositivi mobili in maniera simile ad una vera e propria applicazione.

Le webapp in questione è raggiungibile al seguente link: [https://officinedigitali.fcc.veneto.it/SmartLabCMS/](https://officinedigitali.fcc.veneto.it/SmartLabCMS/)

Per utilizzarla, gli amministratori ai quali sono state fornite delle credenziali dovranno superare una fase di login. Fatto questo, potranno creare velocemente slots per far risultare aperte tutte le sale dell’edificio e aggiungere/eliminare singole slot a livello di singole sale o di tutte le sale, specificare l’eventuale comunicazione che tutti i prenotatori potranno visualizzare, cambiare il nome alle sale e la loro descrizione, visualizzare e aggiungere/modificare co-workers potendo anche attivare/disattivare il loro contratto, visualizzare informazioni riguardanti gli smart-workers potendo anche rinnovare il loro contratto.

# 2. Aspetti tecnici

Similmente all’applicazione server che è stata scritta in [Node.js](https://nodejs.org/it/) (un ambiente di esecuzione che permette di eseguire codice Javascript come un qualsiasi linguaggio di programmazione) e che fa utilizzo del framework [Express.js](https://expressjs.com/it/) per la creazione di [API](https://it.wikipedia.org/wiki/Application_programming_interface), la webapp è stata sviluppata con l’ausilio di derivati del linguaggio [Javascript](https://www.javascript.com/), in particolare della libreria [React.js](https://it.reactjs.org/) pensata per la creazione di interfacce utente.

Al fine di garantire responsività, il frontend è stato sviluppato principalmente utilizzando la libreria [MUI](https://mui.com/), la quale permette di importare componenti per creare interfacce utente nelle applicazioni React.

La webapp fa uso del [local storage](https://en.wikipedia.org/wiki/Web_storage#Local_and_session_storage), necessario per fini di autenticazione.

L’applicazione server si interfaccia con una base di dati [MySQL](https://www.mysql.com/it/) che contiene dati riguardanti amministratori ed utilizzatori dell’edificio, tra cui le credenziali per il login. Inoltre contiene anche dati riguardanti l’edificio stesso, tra cui le sale, le segnalazioni effettuate, gli slots ed eventuali messaggi informativi.

# 3. Utilizzo in locale

Nel dispositivo devono essere installati principalmente il runtime Javascript Node.js, il gestore di pacchetti [npm](https://www.nodeacademy.it/cose-npm-installazione-locale-globale-aggiornamento) e la piattaforma [XAMPP](https://www.apachefriends.org/it/index.html).

È necessario copiare nel proprio dispositivo i file od_reservations.sql e le cartelle SmartLabCMS e Apps_server, presenti nella repository raggiungibile attraverso l’URL [https://github.com/FCC-OfficineDigitali/apps-2022-2023](https://github.com/FCC-OfficineDigitali/apps-2022-2023).

Per poter usufruire in locale di una copia di SmartLab-CMS, è necessario mantenere attivo MySQL tramite XAMPP per utilizzare il database MySQL il cui file .sql è contenuto nella repository.

Per permettere una comunicazione corretta tra client-server-database, è necessario indicare le variabili d'ambiente necessarie creando un file .env nella cartella dell'applicazione server e modificare il file dbreservations.js della cartella config dell’applicazione server, oltre che il file ipPortApi.js contenuto nella cartella src della webapp al fine di potersi riferire al server.

Lanciare il server eseguendo dalla sua cartella il comando _node index.js_, poi lanciare la webapp eseguendo il comando _npm start_ dalla sua cartella. L’applicazione server ed il client si possono lanciare solo dopo aver installato le dipendenze necessarie tramite l’esecuzione del comando _npm install_ (e, in caso di errori, _npm install –force_) dalle loro relative cartelle.

Se non si conoscono le credenziali di alcun amministratore, è necessario crearne uno eseguendo per il database una query dalla forma _INSERT INTO accounts (mail, password, name, surname, has_accepted_rules, is_user, contract_dt, main_usage) VALUES ("Mail", "Password", "Name", "Surname", 1, 0, NULL, "admin");_ dove _Mail \_va sostituito con la mail desiderata, come anche \_Name \_e \_Surname_, e dove \_Password \_va sostituito con il risultato della funzione [SHA-1](http://www.sha1-online.com/) applicata alla password desiderata.

# 4. Crediti

Lavoro sviluppato da Devid Mazzaferro, Francesco Camporese e Jacopo Trabona di Quantitas S.R.L. in collaborazione con Federazione dei Comuni del Camposampierese - Officine Digitali (ente attuatore del progetto).

![Loghi](/mergedLogos.png)
