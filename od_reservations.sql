CREATE DATABASE IF NOT EXISTS od_reservations;
USE od_reservations;

CREATE TABLE fixed_messages (
  fixed_message VARCHAR(256) NOT NULL
);

CREATE TABLE accounts (
  account_id INT NOT NULL AUTO_INCREMENT,
  mail VARCHAR(320) UNIQUE NOT NULL,
  password VARCHAR(40) NOT NULL,
  name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  has_accepted_rules BOOLEAN NOT NULL DEFAULT 0,
  is_user BOOLEAN NOT NULL DEFAULT 1, -- 0 per gli admin
  contract_dt DATETIME, -- null per gli admin e per chi non ha mai pagato
  main_usage VARCHAR(100) NOT NULL, -- utilizzo della piattaforma previsto da parte dell'utente, corrisponde ai possibili valori mainUsageOptions + admin
  score_about_conference INT NOT NULL DEFAULT 0,
  score_about_working INT NOT NULL DEFAULT 0,
  score_about_call INT NOT NULL DEFAULT 0,
  PRIMARY KEY (account_id)
);

CREATE TABLE coworkers (
  coworker_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  mail VARCHAR(320) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  insert_date DATE NOT NULL,
  valid_from DATE,
  deleted_date DATE,
  deleted BOOLEAN NOT NULL DEFAULT 0,
  PRIMARY KEY (coworker_id)
);

CREATE TABLE rooms (
  room_id INT NOT NULL AUTO_INCREMENT,
  room_name VARCHAR(100) NOT NULL,
  room_name_updatable VARCHAR(20) NOT NULL,
  room_name_for_card VARCHAR(100) NOT NULL,
  room_card_id INT NOT NULL,
  room_type VARCHAR(20) NOT NULL, -- conference, smart working o call
  seats_nr INT NOT NULL DEFAULT 1, -- per la sala conference serve a mostrare warning in caso di troppe sedie richieste per la prenotazione. Per la sala smart working e per la sala call serve a capire quanti slots creare in un certo momento
  room_description VARCHAR(2000) NOT NULL,
  PRIMARY KEY (room_id)
);

-- per crearli per un certo orario:
-- se ne crea uno per ciascuna conference room e potrà avere participants_nr <= seats_nr
-- in caso di prenotazione di una conference room, bisogna anche specificare in quanti si e', cosa si vuole fare, se si vuole assistenza tecnica
-- se ne creano tanti quanti seats_nr per la sala smart working e per la sala call
CREATE TABLE slots (
  slot_id INT NOT NULL AUTO_INCREMENT,
  slot_start_time TIME NOT NULL, -- saranno tutti slot da un'ora, inizialmente non utilizzati da nessuno
  slot_end_time TIME NOT NULL,
  slot_day DATE NOT NULL,
  chair_id VARCHAR(100), -- solo per le sale smart working e call, lo creo sinteticamente concatenando numero incrementale che ho da 1 a seats_nr + _r + room_id
  is_allowed INT NOT NULL DEFAULT 0, -- le prenotazioni riguardanti le conference rooms dovranno essere accettate (rese 1) o rifiutate (rese -1) tramite area admin (la persona potra' richiedere lo slot se questo valore e' < 1, settandolo a 0 cioe' mettendosi in attesa di accettazione). Se una di queste è in attesa di accettazione, nessun altro puo' provare a prenotarla in quanto...
  participants_nr INT DEFAULT 0,
  topic VARCHAR(1000),
  needs_technical_assistance BOOLEAN DEFAULT 0,
  request_datetime DATETIME,
  room_id INT NOT NULL,
  account_id INT, -- ...qui ci va l'id dell'account che ha la richiesta in attesa di accettazione
  coworker_id INT, -- ...qui ci va l'id del coworker se si tratta dell'occupazione dei posti della sala smart working per lui
  FOREIGN KEY (room_id) REFERENCES rooms (room_id),
  FOREIGN KEY (account_id) REFERENCES accounts (account_id),
  FOREIGN KEY (coworker_id) REFERENCES coworkers (coworker_id),
  PRIMARY KEY (slot_id)
);

CREATE TABLE reports (
  report_id INT NOT NULL AUTO_INCREMENT,
  report_date_time DATETIME NOT NULL,
  report_title VARCHAR(200) NOT NULL,
  report_description VARCHAR(1000) NOT NULL,
  room_id INT NOT NULL,
  account_id INT NOT NULL,
  FOREIGN KEY (room_id) REFERENCES rooms (room_id),
  FOREIGN KEY (account_id) REFERENCES accounts (account_id),
  PRIMARY KEY (report_id)
);

CREATE INDEX r_d_t ON reports (report_date_time);
CREATE INDEX r_t ON rooms (room_type);
CREATE INDEX s_d_st ON slots (slot_day, slot_start_time);

INSERT INTO fixed_messages (fixed_message) VALUES("");

INSERT INTO accounts (account_id, mail, password, name, surname, has_accepted_rules, is_user, contract_dt, main_usage) VALUES
(1, "officine.digitali@fcc.veneto.it", "5a498417bb2668297b3040232918818407a8dca8", "Amministratore", "Hub", 1, 0, NULL, "admin"),
(2, "xovekada@afia.pro", "664819d8c5343676c9225b5ed00a5cdc6f3a1ff3", "Revisore", "Applicazioni", 1, 0, NULL, "admin");

INSERT INTO rooms (room_id, room_name, room_name_updatable, room_name_for_card, room_card_id, room_type, seats_nr, room_description) VALUES
(1, "Sala Conferenze", "Sala Conferenze", "Conferenza", 3, "conference", 35, "Accessibile anche da persone con disabilità.\nDisposizione: 35 sedie senza appoggio per scrivere + 4 posti extra dedicati ad eventuali relatori e cattedra modulare elettrificata.\nTecnologie: una LIM, un impianto audio e 4 microfoni wireless con asta di appoggio."),
(2, "Sala Hackathon", "Sala Hackathon", "Hackathon/Workshop", 5, "conference", 20, "Disposizione: 20 sedie, 2 tavoli elettrificati che compongono una cattedra modulare e 6 tavoli non elettrificati.\nTecnologie: una LIM."),
(3, "Sala Riunioni", "Sala Riunioni", "Riunione", 4, "conference", 8, "Disposizione: 8 sedie e un grande tavolo centrale.\nTecnologie: una smart TV."),
(4, "Sala Call", "Sala Call", "Video Call", 2, "call", 2, "Disposizione: 2 scrivanie con le relative sedie, separate da pannelli fonoassorbenti.\nTecnologie: sono previste delle ring light."),
(5, "Sala Smart Working", "Sala Smart Working", "Smart Working", 1, "smart working", 14, "Disposizione: 14 sedie, scrivanie, armadietti e cassettiere.");