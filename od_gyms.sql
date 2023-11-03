CREATE DATABASE IF NOT EXISTS od_gyms;
USE od_gyms;

CREATE TABLE gyms (
  gym_id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  address VARCHAR(200) NOT NULL,
  opening_hours JSON NOT NULL,
  PRIMARY KEY (gym_id)
);

CREATE TABLE facilitators (
  facilitator_id INT NOT NULL AUTO_INCREMENT,
  gym_id_1 INT NOT NULL,
  gym_id_2 INT NOT NULL,
  gym_id_3 INT NOT NULL,
  mail VARCHAR(320) UNIQUE NOT NULL,
  password VARCHAR(40) NOT NULL,
  name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  fixed_hours_count INT NOT NULL DEFAULT 20,
  variable_hours_count INT NOT NULL DEFAULT 20,
  fixed_hours_future_count INT NOT NULL DEFAULT 20,
  variable_hours_future_count INT NOT NULL DEFAULT 20,
  FOREIGN KEY (gym_id_1) REFERENCES gyms (gym_id),
  FOREIGN KEY (gym_id_2) REFERENCES gyms (gym_id),
  FOREIGN KEY (gym_id_3) REFERENCES gyms (gym_id),
  PRIMARY KEY (facilitator_id)
);

CREATE TABLE operators (
  operator_id INT NOT NULL AUTO_INCREMENT,
  gym_id INT NOT NULL,
  mail VARCHAR(320) UNIQUE NOT NULL,
  password VARCHAR(40) NOT NULL,
  name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  FOREIGN KEY (gym_id) REFERENCES gyms (gym_id),
  PRIMARY KEY (operator_id)
);

CREATE TABLE accounts (
  account_id INT NOT NULL AUTO_INCREMENT,
  mail VARCHAR(320) UNIQUE NOT NULL,
  password VARCHAR(40) NOT NULL,
  name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  is_operatore BOOLEAN DEFAULT 0, -- 1 = operatore, 0 = facilitatore, null = superuser
  facilitator_id INT,
  operator_id INT,
  FOREIGN KEY (facilitator_id) REFERENCES facilitators (facilitator_id),
  FOREIGN KEY (operator_id) REFERENCES operators (operator_id),
  PRIMARY KEY (account_id)
);

CREATE TABLE fixed_availabilities_facilitators (
  availability_id INT NOT NULL AUTO_INCREMENT,
  facilitator_id INT NOT NULL,
  gym_id INT NOT NULL,
  availability_date DATE NOT NULL,
  availability_times VARCHAR(500) NOT NULL,
  FOREIGN KEY (facilitator_id) REFERENCES facilitators (facilitator_id),
  FOREIGN KEY (gym_id) REFERENCES gyms (gym_id),
  PRIMARY KEY (availability_id)
);

CREATE TABLE variable_availabilities_facilitators (
  availability_id INT NOT NULL AUTO_INCREMENT,
  facilitator_id INT NOT NULL,
  availability_date DATE NOT NULL,
  availability_times VARCHAR(500) NOT NULL,
  availability_times_for_operator VARCHAR(500),
  ver INT NOT NULL DEFAULT 0,
  FOREIGN KEY (facilitator_id) REFERENCES facilitators (facilitator_id),
  PRIMARY KEY (availability_id)
);

CREATE TABLE availabilities_operators (
  availability_id INT NOT NULL AUTO_INCREMENT,
  variable_availabilities_facilitators_id INT NOT NULL,
  facilitator_id INT NOT NULL,
  operator_id INT,
  gym_custom_place VARCHAR(200),
  availability_date DATE NOT NULL,
  operator_requested_times VARCHAR(500),
  notes VARCHAR(200),
  FOREIGN KEY (variable_availabilities_facilitators_id) REFERENCES variable_availabilities_facilitators (availability_id),
  FOREIGN KEY (facilitator_id) REFERENCES facilitators (facilitator_id),
  FOREIGN KEY (operator_id) REFERENCES operators (operator_id),
  PRIMARY KEY (availability_id)
);

INSERT INTO gyms (gym_id, name, address, opening_hours) VALUES
(1, "Borgoricco", "Biblioteca Comunale di Borgoricco - viale Europa, 12", '{"Lunedì": "15:00-18:00", "Martedì": "09:00-13:00", "Mercoledì": "10:00-13:00,15:00-19:00", "Giovedì": "", "Venerdì": "15:00-19:00", "Sabato": "09:00-12:00", "Domenica": ""}'),
(2, "Campodarsego", "Associazione Pensionati - Via Bachelet, 28", '{"Lunedì": "15:00-18:00", "Martedì": "09:00-13:00", "Mercoledì": "10:00-13:00,15:00-19:00", "Giovedì": "", "Venerdì": "15:00-19:00", "Sabato": "09:00-12:00", "Domenica": ""}'),
(3, "Camposampiero", "Biblioteca - via Tiso da Camposampiero, 12", '{"Lunedì": "09:00-12:30,14:30-18:00", "Martedì": "14:30-18:00", "Mercoledì": "09:00-12:30,14:30-19:00", "Giovedì": "", "Venerdì": "14:30-19:00", "Sabato": "09:00-12:30", "Domenica": ""}'),
(4, "Loreggia", "Biblioteca Comunale - via Roma, 37", '{"Lunedì": "", "Martedì": "15:00-18:15", "Mercoledì": "", "Giovedì": "15:00-18:15", "Venerdì": "08:30-11:45,15:00-18:15", "Sabato": "08:30-11:45", "Domenica": ""}'),
(5, "Massanzago", "Bilbioteca Comunale - Via Roma, 59", '{"Lunedì": "", "Martedì": "14:00-18:30", "Mercoledì": "14:00-18:30", "Giovedì": "14:00-18:30", "Venerdì": "", "Sabato": "09:00-12:00", "Domenica": ""}'),
(6, "Piombino Dese", "Biblioteca Comunale - Viale della Vittoria, 19", '{"Lunedì": "14:30-18:30", "Martedì": "14:30-18:30", "Mercoledì": "09:00-12:00,14:30-18:30", "Giovedì": "14:30-18:30", "Venerdì": "14:30-18:30", "Sabato": "09:00-12:00", "Domenica": ""}'),
(7, "San Giorgio delle Pertiche", "Biblioteca Comunale - Via Pinaffo, 9", '{"Lunedì": "", "Martedì": "14:30-18:30", "Mercoledì": "14:30-18:30", "Giovedì": "14:30-18:30", "Venerdì": "09:30-12:30", "Sabato": "", "Domenica": ""}'),
(8, "Santa Giustina in Colle", "Biblioteca Comunale - Piazza Martiri, 60", '{"Lunedì": "09:30-13:00", "Martedì": "15:00-18:00", "Mercoledì": "09:30-13:00", "Giovedì": "15:00-18:00", "Venerdì": "", "Sabato": "09:00-12:00", "Domenica": ""}'),
(9, "Villa del Conte", "Biblioteca Comunale - Piazza Vittoria, 28", '{"Lunedì": "14:00-18:00", "Martedì": "14:00-18:00", "Mercoledì": "14:00-18:00", "Giovedì": "14:00-18:00", "Venerdì": "14:00-18:00", "Sabato": "09:00-12:00", "Domenica": ""}'),
(10, "Villanova di Camposampiero", "Biblioteca Comunale - Via Caltana, 156", '{"Lunedì": "", "Martedì": "09:00-12:00,15:30-18:30", "Mercoledì": "15:30-18:30", "Giovedì": "15:30-18:30", "Venerdì": "15:30-18:30", "Sabato": "09:00-12:00", "Domenica": ""}'),
(11, "INNOVATION LAB", "Via Roma 42, San Giorgio delle Pertiche", '{"Lunedì": "09:00-18:00", "Martedì": "09:00-18:00", "Mercoledì": "09:00-18:00", "Giovedì": "09:00-18:00", "Venerdì": "09:00-13:00", "Sabato": "", "Domenica": ""}'),
(12, "Comune di Vigonza 1", "Via Esempio 1, Comune", '{"Lunedì": "09:00-13:00,14:00-18:00", "Martedì": "09:00-13:00,14:00-18:00", "Mercoledì": "09:00-13:00,14:00-18:00", "Giovedì": "09:00-13:00,14:00-18:00", "Venerdì": "09:00-13:00,14:00-18:00", "Sabato": "09:00-13:00,14:00-18:00", "Domenica": "09:00-13:00,14:00-18:00"}'), -- in attesa degli orari definitivi e dell'indirizzo
(13, "Comune di Vigonza 2", "Via Esempio 1, Comune", '{"Lunedì": "09:00-13:00,14:00-18:00", "Martedì": "09:00-13:00,14:00-18:00", "Mercoledì": "09:00-13:00,14:00-18:00", "Giovedì": "09:00-13:00,14:00-18:00", "Venerdì": "09:00-13:00,14:00-18:00", "Sabato": "09:00-13:00,14:00-18:00", "Domenica": "09:00-13:00,14:00-18:00"}'), -- in attesa degli orari definitivi e dell'indirizzo
(14, "Comune di Vigodarzere", "Via Esempio 1, Comune", '{"Lunedì": "09:00-13:00,14:00-18:00", "Martedì": "09:00-13:00,14:00-18:00", "Mercoledì": "09:00-13:00,14:00-18:00", "Giovedì": "09:00-13:00,14:00-18:00", "Venerdì": "09:00-13:00,14:00-18:00", "Sabato": "09:00-13:00,14:00-18:00", "Domenica": "09:00-13:00,14:00-18:00"}'), -- in attesa degli orari definitivi e dell'indirizzo
(15, "Comune quindici", "Via Esempio 1, Comune", '{"Lunedì": "09:00-13:00,14:00-18:00", "Martedì": "09:00-13:00,14:00-18:00", "Mercoledì": "09:00-13:00,14:00-18:00", "Giovedì": "09:00-13:00,14:00-18:00", "Venerdì": "09:00-13:00,14:00-18:00", "Sabato": "09:00-13:00,14:00-18:00", "Domenica": "09:00-13:00,14:00-18:00"}'); -- per avere numero di palestre multiplo di 3

INSERT INTO facilitators (facilitator_id, gym_id_1, gym_id_2, gym_id_3, mail, password, name, surname) VALUES
(1, 1, 2, 3, "facilitator1@gmail.com", "516cde77891fe36112ac0d0a5818ee6222a4f826", "Facilitatore1", "Uno"),
(2, 4, 5, 6, "facilitator2@gmail.com", "8cbdb5920035eaeca7228723451bde9ee779e9a9", "Facilitatore2", "Due"),
(3, 7, 8, 9, "facilitator3@gmail.com", "eda767838968e464931480f79fd96f0bad88950a", "Facilitatore3", "Tre"),
(4, 10, 11, 12, "facilitator4@gmail.com", "a9e8238ce854bd327ca55a7d225f6f3cf0ffbc1d", "Facilitatore4", "Quattro"),
(5, 13, 14, 15, "facilitator5@gmail.com", "092011139f0099b2cf8b8d63551bcad18f7810d9", "Facilitatore5", "Cinque");

INSERT INTO operators (operator_id, gym_id, mail, password, name, surname) VALUES
(1, 1, "operator1@gmail.com", "629a2e10c2b7fcef221e9787405d1d8487b8be96", "Operatore1", "Uno"),
(2, 2, "operator2@gmail.com", "30714b8447be5ae30762758bd76ce5f22d3647b1", "Operatore2", "Due"),
(3, 3, "operator3@gmail.com", "3bd1374aeac79b43576c118e8ab38937fa99154c", "Operatore3", "Tre"),
(4, 4, "operator4@gmail.com", "8b40454572f47b82ce90580b6dbbde0abb9fdfc1", "Operatore4", "Quattro"),
(5, 5, "operator5@gmail.com", "397a19d6165335727569a9cf2bca9463de9315e6", "Operatore5", "Cinque"),
(6, 6, "operator6@gmail.com", "c464fffbe3f886d107c84113115097081a89c1a1", "Operatore6", "Sei"),
(7, 7, "operator7@gmail.com", "e395957f9e537907eae49ed9f8d50cad1fe538eb", "Operatore7", "Sette"),
(8, 8, "operator8@gmail.com", "c701d74ede5408b57bfe8eae93cf477ee253760a", "Operatore8", "Otto"),
(9, 9, "operator9@gmail.com", "d3ffe27e392b547c6447c2884f82bbe6ac9c377d", "Operatore9", "Nove"),
(10, 10, "operator10@gmail.com", "90997b84b64c5ea44070c1c922c545ca8e10d330", "Operatore10", "Dieci"),
(11, 11, "operator11@gmail.com", "79ce535c378f474e55ba66c7bb166e4a79d0994d", "Operatore11", "Undici"),
(12, 12, "operator12@gmail.com", "12a1b0aba5ee2c0f9d76d758295efbebb45be2d1", "Operatore12", "Dodici"),
(13, 13, "operator13@gmail.com", "e0ce889cec5aeb531aca277931eb997ab632347c", "Operatore13", "Tredici"),
(14, 14, "operator14@gmail.com", "f4ea8495f8f06f987f0ed685748ef57958430665", "Operatore14", "Quattordici"),
(15, 15, "operator15@gmail.com", "53f845c0304e60e154e9b55ae331989ae10c7749", "Operatore15", "Quindici");

INSERT INTO accounts (account_id, mail, password, name, surname, is_operatore, facilitator_id, operator_id) VALUES
(1, "superadmin@gmail.com", "a52082800b5bb7562a9a81e3be3db2a1b0570507", "Super", "User", null, null, null),
(2, "facilitator1@gmail.com", "516cde77891fe36112ac0d0a5818ee6222a4f826", "Facilitatore1", "Uno", 0, 1, null),
(3, "facilitator2@gmail.com", "8cbdb5920035eaeca7228723451bde9ee779e9a9", "Facilitatore2", "Due", 0, 2, null),
(4, "facilitator3@gmail.com", "eda767838968e464931480f79fd96f0bad88950a", "Facilitatore3", "Tre", 0, 3, null),
(5, "facilitator4@gmail.com", "a9e8238ce854bd327ca55a7d225f6f3cf0ffbc1d", "Facilitatore4", "Quattro", 0, 4, null),
(6, "facilitator5@gmail.com", "092011139f0099b2cf8b8d63551bcad18f7810d9", "Facilitatore5", "Cinque", 0, 5, null),
(7, "operator1@gmail.com", "629a2e10c2b7fcef221e9787405d1d8487b8be96", "Operatore1", "Uno", 1, null, 1),
(8, "operator2@gmail.com", "30714b8447be5ae30762758bd76ce5f22d3647b1", "Operatore2", "Due", 1, null, 2),
(9, "operator3@gmail.com", "3bd1374aeac79b43576c118e8ab38937fa99154c", "Operatore3", "Tre", 1, null, 3),
(10, "operator4@gmail.com", "8b40454572f47b82ce90580b6dbbde0abb9fdfc1", "Operatore4", "Quattro", 1, null, 4),
(11, "operator5@gmail.com", "397a19d6165335727569a9cf2bca9463de9315e6", "Operatore5", "Cinque", 1, null, 5),
(12, "operator6@gmail.com", "c464fffbe3f886d107c84113115097081a89c1a1", "Operatore6", "Sei", 1, null, 6),
(13, "operator7@gmail.com", "e395957f9e537907eae49ed9f8d50cad1fe538eb", "Operatore7", "Sette", 1, null, 7),
(14, "operator8@gmail.com", "c701d74ede5408b57bfe8eae93cf477ee253760a", "Operatore8", "Otto", 1, null, 8),
(15, "operator9@gmail.com", "d3ffe27e392b547c6447c2884f82bbe6ac9c377d", "Operatore9", "Nove", 1, null, 9),
(16, "operator10@gmail.com", "90997b84b64c5ea44070c1c922c545ca8e10d330", "Operatore10", "Dieci", 1, null, 10),
(17, "operator11@gmail.com", "79ce535c378f474e55ba66c7bb166e4a79d0994d", "Operatore11", "Undici", 1, null, 11),
(18, "operator12@gmail.com", "12a1b0aba5ee2c0f9d76d758295efbebb45be2d1", "Operatore12", "Dodici", 1, null, 12),
(19, "operator13@gmail.com", "e0ce889cec5aeb531aca277931eb997ab632347c", "Operatore13", "Tredici", 1, null, 13),
(20, "operator14@gmail.com", "f4ea8495f8f06f987f0ed685748ef57958430665", "Operatore14", "Quattordici", 1, null, 14),
(21, "operator15@gmail.com", "53f845c0304e60e154e9b55ae331989ae10c7749", "Operatore15", "Quindici", 1, null, 15);
