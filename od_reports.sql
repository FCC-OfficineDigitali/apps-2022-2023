CREATE DATABASE IF NOT EXISTS od_reports;
USE od_reports;

CREATE TABLE users (
  user_id INT NOT NULL AUTO_INCREMENT,
  mail VARCHAR(320) UNIQUE NOT NULL,
  password VARCHAR(40) NOT NULL,
  phone VARCHAR(20),
  is_signaller BOOLEAN NOT NULL DEFAULT 1,
  deleted BOOLEAN NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id)
);

CREATE TABLE reports (
  report_id INT NOT NULL AUTO_INCREMENT,
  report_date_time DATETIME NOT NULL,
  lat_lon POINT,
  report_title VARCHAR(200) NOT NULL,
  report_description VARCHAR(1000),
  report_location_description VARCHAR(1000) NOT NULL,
  signaller_id INT NOT NULL,
  is_resolved BOOLEAN NOT NULL DEFAULT 0,
  maintainer_id INT DEFAULT NULL,
  resolution_description VARCHAR(1000),
  resolution_fix_date DATE,
  resolution_flag_date_time DATETIME,
  deleted BOOLEAN NOT NULL DEFAULT 0,
  FOREIGN KEY (signaller_id) REFERENCES users (user_id),
  FOREIGN KEY (maintainer_id) REFERENCES users (user_id),
  PRIMARY KEY (report_id)
);

INSERT INTO users (user_id, mail, password, phone, is_signaller, deleted) VALUES
(1, "manutenzione@asi-srl.it", "4651bef81f1c7b55fe2234496fcae5f0bc615c0c", NULL, 0, 0),
(2, "xovekada@afia.pro", "664819d8c5343676c9225b5ed00a5cdc6f3a1ff3", NULL, 0, 0);

select * from users;