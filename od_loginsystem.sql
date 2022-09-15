CREATE DATABASE IF NOT EXISTS od_loginsystem;
USE od_loginsystem;

CREATE TABLE users (
  username VARCHAR(50) NOT NULL,
  password VARCHAR(500) NOT NULL,
  PRIMARY KEY (username)
);

INSERT INTO users (username, password) VALUES
("Utente1", "21f5c37712439b4b8bb20f3c96de5057fd93ae5a"),
("Utente2", "bc36739a7e31f837e40ca1b4397af821242b4a8a"),
("Utente3", "0f02cd4afdaae15b392fb1dd944d9d2a08ffb4e8"),
("Utente4", "7abd48ab8b6b762b87865acb2f00900366b4454f"),
("Utente5", "f87f7bb3a3b1912f44ca2050eab26fb9beccb6ea"),
("Francesco", "1f7f150f518d93cc92812dee89dd94465373672b");