require("dotenv").config();
const express = require("express");
const db = require("./config/db");
const dbusers = require("./config/dbusers");
const dbreports = require("./config/dbreports");
const dbreservations = require("./config/dbreservations");
const cors = require("cors");
const fs = require("fs");
const moment = require("moment");
const nodemailer = require("nodemailer");
const multer = require("multer");
const upload = multer();
const isDate = require("validator/lib/isDate");
const isEmail = require("validator/lib/isEmail");
const isPhoneNumber = require("libphonenumber-js");
const isTime = require("validator/lib/isTime");
const passwordValidator = require("password-validator");

const bodyParser = require("body-parser");

const palestreRoutes = require("./palestreIndex");

const app = express();
const PORT = 3002;

const passwordCheck = new passwordValidator().is().min(8).has().uppercase().has().lowercase().has().digits().has().symbols().has().not().spaces();
const fromAddressSegnalazioni = "segnalazioni.trevisoostiglia@quantitas.it";
const transporterSegnalazioni = nodemailer.createTransport({
    host: "out.wid.it",
    secure: true,
    port: 465,
    auth: {
        user: fromAddressSegnalazioni,
        pass: process.env.fromAddressSegnalazioniPassword
    }
});
const prenotazioniHubFederazionePhone = "049 931 5695";
const fromAddressPrenotazioniHub = "prenotazioni-hub@quantitas.it";
const transporterPrenotazioniHub = nodemailer.createTransport({
    host: "out.wid.it",
    secure: true,
    pool: true,
    maxConnections: 1,
    port: 465,
    auth: {
        user: fromAddressPrenotazioniHub,
        pass: process.env.fromAddressPrenotazioniHubPassword
    }
});
const fromAddressSegnalazioniHub = "segnalazioni-hub@quantitas.it";
const transporterSegnalazioniHub = nodemailer.createTransport({
    host: "out.wid.it",
    secure: true,
    port: 465,
    auth: {
        user: fromAddressSegnalazioniHub,
        pass: process.env.fromAddressSegnalazioniHubPassword
    }
});

const roomTypeTranslations = [["call", "Call"], ["co-working", "Co-working"], ["conference", "Conferenze"], ["smart working", "Smart working"]];
const scoresColumnsNamesStart = "score_about_";
const scoresColumns = ["conference", "working", "call"].map(end => scoresColumnsNamesStart + end);

const conferenceMonthHoursLimitPerRoom = 16;
const smartworkingAndCallMonthHoursLimit = 40;

const nForWarning = 4;

const slotsArrLimit = 1647;

const openHour = moment("8:00", "HH:mm");
const closeHour = moment("21:00", "HH:mm");

const maxAbsoluteSeatsNr = 100;

const rangeStr = "SELECT 1 AS nr " + [...Array(maxAbsoluteSeatsNr - 1).keys()].map(n => "UNION SELECT " + (n + 2)).join(" ");


var isReservationsMiddlewareLocked = false;

const isReservationsMiddlewareLockedMiddlewareCheck = (req, res, next) => {
    if (isReservationsMiddlewareLocked)
        res.send({ message: "Prenotazione non riuscita: scrittura slots in corso da un altro utente" });

    isReservationsMiddlewareLocked = true;

    next();
};

const mainUsageOptions = [
    "Studenti",
    "Insegnanti",
    "Ricercatori e Inventori",
    "Designer e Creativi",
    "Liberi Professionisti",
    "Start-upper",
    "Imprenditori",
    "Dipendenti di Piccole e Medie Imprese (PMI)",
    "Dipendenti di Grandi Aziende",
    "Dipendenti di Enti Governativi o Locali",
    "Dipendenti o soci di Organizzazioni Non Profit",
    "Investitori e Venture Capital",
    "Esperti e Mentori",
    "Pensionati",
    "Altro"
];

app.use(cors({
    methods: ["DELETE", "GET", "POST", "PUT"],
    credentials: true,
}));

app.use(bodyParser.json({ limit: "8mb" }));
app.use(bodyParser.urlencoded({ limit: "8mb", extended: true }));
app.use(express.static("files"));

/*Palestre*/
app.use(palestreRoutes);

/*Qui-RaccoltaDati*/


function calcToken(token, callback) {
    dbusers.query("SELECT username FROM users WHERE ? = CONCAT(SHA1(CONCAT(username, ' ')), password)", [token], (err, result) => {
        if (err)
            callback(err, -1);
        else
            callback(null, result.length);
    });
}

app.get("/api/downloadCsv/:filename", (req, res) => {
    const fileName = req.params.filename + "_export.csv";
    const filePath = "./dataset/public/" + fileName;

    if (fs.existsSync(filePath))
        res.download(filePath, fileName, err => {
            if (err)
                console.log(err);
        });
    else
        res.send({ message: "Download del file non riuscito" });
});

app.get("/api/getCsv/:filename", (req, res) => {
    const filePath = "./dataset/" + req.params.filename + ".csv";

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.log(err);
            res.send({ message: "Lettura del file non riuscita" });
        }
        else
            res.send(data);
    });
});

app.post("/api/login", (req, res) => {
    const username = req.body.username.trim();
    const password = req.body.password;

    dbusers.query("SELECT * FROM users WHERE username = ? AND password = SHA1(?)", [username, password], (err, result) => {
        if (err) {
            console.log(err);
            res.send({ message: "Controllo accesso non riuscito" });
        }
        else if (result.length > 0)
            res.send({ messageOk: "Accesso effettuato. Bentornato " + username });
        else {
            dbusers.query("SELECT * FROM users WHERE username = ?", [username], (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({ message: "Controllo esistenza utente non riuscito" });
                }
                else if (result.length > 0)
                    res.send({ message: "Password errata" });
                else
                    res.send({ message: "Utente non esistente" });
            })
        }
    });
});

app.get("/api/get/:token", (req, res) => {
    const token = req.params.token;

    calcToken(token, (err, data) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento dati non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0)
            db.query(
                "SELECT p.*, nfrom.nome AS nome_nazione_in_viaggio_da, cfrom.provincia AS provincia_comune_in_viaggio_da, cfrom.nome AS nome_comune_in_viaggio_da, nto.nome AS nome_nazione_destinazione, cto.provincia AS provincia_comune_destinazione, cto.nome AS nome_comune_destinazione FROM passaggi p LEFT JOIN nazioni nfrom ON p.nazione_in_viaggio_da = nfrom.iso_3166_1_alpha_3 LEFT JOIN comuni cfrom ON p.comune_in_viaggio_da = cfrom.codice_istat LEFT JOIN nazioni nto ON p.nazione_destinazione = nto.iso_3166_1_alpha_3 LEFT JOIN comuni cto ON p.comune_destinazione = cto.codice_istat WHERE p.deleted IS FALSE ORDER BY CASE WHEN DATE(p.data_inserimento_operatore) = CURDATE() THEN p.data_inserimento_operatore END DESC, CASE WHEN DATE(p.data_inserimento_operatore) <> CURDATE() THEN DATE(p.data_inserimento_operatore) END DESC, p.nome ASC",
                (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send({ message: "Caricamento dati non riuscito" });
                    }
                    else
                        res.send(result);
                })
        else
            res.send({ message: "Caricamento dati non riuscito: utente non autorizzato" });
    });
});

app.get("/api/getFromId/:id&tkn=:token", (req, res) => {
    const id = req.params.id;
    const token = req.params.token;

    calcToken(token, (err, data) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento dati del passaggio non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0)
            db.query(
                "SELECT p.*, nfrom.nome AS nome_nazione_in_viaggio_da, cfrom.provincia AS provincia_comune_in_viaggio_da, cfrom.nome AS nome_comune_in_viaggio_da, nto.nome AS nome_nazione_destinazione, cto.provincia AS provincia_comune_destinazione, cto.nome AS nome_comune_destinazione FROM passaggi p LEFT JOIN nazioni nfrom ON p.nazione_in_viaggio_da = nfrom.iso_3166_1_alpha_3 LEFT JOIN comuni cfrom ON p.comune_in_viaggio_da = cfrom.codice_istat LEFT JOIN nazioni nto ON p.nazione_destinazione = nto.iso_3166_1_alpha_3 LEFT JOIN comuni cto ON p.comune_destinazione = cto.codice_istat WHERE p.id_passaggio = ? AND p.deleted IS FALSE",
                [id], (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send({ message: "Caricamento dati del passaggio non riuscito" });
                    }
                    else {
                        if (result.length > 0)
                            res.send(result);
                        else
                            res.send({ message: "Dati del passaggio non disponibili" });
                    }
                });
        else
            res.send({ message: "Caricamento dati del passaggio non riuscito: utente non autorizzato" });
    });
});

app.put("/api/deleteFromId/:id&tkn=:token", (req, res) => {
    const id = req.params.id;
    const token = req.params.token;

    calcToken(token, (err, data) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Eliminazione del passaggio non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0)
            db.query("UPDATE passaggi SET deleted = 1 WHERE id_passaggio = ?", [id], (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({ message: "Eliminazione del passaggio non riuscita" });
                }
                else {
                    if (result.affectedRows > 0)
                        res.send({ messageOk: "Passaggio eliminato" });
                    else
                        res.send({ message: "Nessun passaggio è stato eliminato" });
                }
            });
        else
            res.send({ message: "Eliminazione del passaggio non riuscita: utente non autorizzato" });
    });
});

app.get("/api/getPairs/:str&tkn=:token", (req, res) => {
    const str = req.params.str;
    const token = req.params.token;

    calcToken(token, (err, data) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento dati riguardanti " + str + " non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0)
            db.query(
                str.localeCompare("nazioni") == 0 ? "SELECT * FROM nazioni ORDER BY FIELD(iso_3166_1_alpha_3, 'ITA') DESC, nome ASC" : "SELECT * FROM comuni ORDER BY nome ASC", (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send({ message: "Caricamento dati riguardanti " + str + " non riuscito" });
                    }
                    else
                        res.send(result);
                });
        else
            res.send({ message: "Caricamento dati riguardanti " + str + " non riuscito: utente non autorizzato" });
    });
});

app.post("/api/addRow/:token", (req, res) => {
    const nome = req.body.nome.trim();
    const eta = req.body.eta;
    const data_inserimento_viaggiatore = req.body.data_inserimento_viaggiatore ? req.body.data_inserimento_viaggiatore.trim() : null;
    const nazione_in_viaggio_da = req.body.nazione_in_viaggio_da.length > 0 ? req.body.nazione_in_viaggio_da.trim() : null;
    const comune_in_viaggio_da = req.body.comune_in_viaggio_da.length > 0 ? req.body.comune_in_viaggio_da.trim() : null;
    const nazione_destinazione = req.body.nazione_destinazione.length > 0 ? req.body.nazione_destinazione.trim() : null;
    const comune_destinazione = req.body.comune_destinazione.length > 0 ? req.body.comune_destinazione.trim() : null;
    const direttrice = req.body.direttrice.trim();
    const motivo = req.body.motivo.trim();
    const pensiero = req.body.pensiero.trim();
    const token = req.params.token;

    calcToken(token, (err, data) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Aggiunta del passaggio non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0) {
            if ((data_inserimento_viaggiatore && (data_inserimento_viaggiatore < "1900-01-01" || data_inserimento_viaggiatore > new Date().toISOString().slice(0, 10))) || nome.length > 100 || (eta && (eta < 0 || eta > 99)) || direttrice.length > 500 || pensiero.length > 1000 || motivo.length > 500)
                res.send({ message: "Aggiunta del passaggio non riuscita: dati non validi" });
            else
                db.query("INSERT INTO passaggi (nome, eta, data_inserimento_viaggiatore, data_inserimento_operatore, nazione_in_viaggio_da, comune_in_viaggio_da, nazione_destinazione, comune_destinazione, direttrice, motivo, pensiero) VALUES (?,?,?,NOW(),?,?,?,?,?,?,?)", [nome, eta, data_inserimento_viaggiatore, nazione_in_viaggio_da, comune_in_viaggio_da, nazione_destinazione, comune_destinazione, direttrice, motivo, pensiero], (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send({ message: "Aggiunta del passaggio non riuscita" });
                    }
                    else
                        res.send({ messageOk: "Aggiunta del passaggio riuscita" });
                });
        }
        else
            res.send({ message: "Aggiunta del passaggio non riuscita: utente non autorizzato" });
    });
});

app.put("/api/updateFromId/:id&tkn=:token", (req, res) => {
    const nome = req.body.nome.trim();
    const eta = req.body.eta;
    const data_inserimento_viaggiatore = req.body.data_inserimento_viaggiatore ? req.body.data_inserimento_viaggiatore.trim() : null;
    const nazione_in_viaggio_da = req.body.nazione_in_viaggio_da.length > 0 ? req.body.nazione_in_viaggio_da.trim() : null;
    const comune_in_viaggio_da = req.body.comune_in_viaggio_da.length > 0 ? req.body.comune_in_viaggio_da.trim() : null;
    const nazione_destinazione = req.body.nazione_destinazione.length > 0 ? req.body.nazione_destinazione.trim() : null;
    const comune_destinazione = req.body.comune_destinazione.length > 0 ? req.body.comune_destinazione.trim() : null;
    const direttrice = req.body.direttrice.trim();
    const motivo = req.body.motivo.trim();
    const pensiero = req.body.pensiero.trim();
    const id = req.params.id;
    const token = req.params.token;
    calcToken(token, (err, data) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Modifica del passaggio non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0) {
            if ((data_inserimento_viaggiatore && (data_inserimento_viaggiatore < "1900-01-01" || data_inserimento_viaggiatore > new Date().toISOString().slice(0, 10))) || nome.length > 100 || (eta && (eta < 0 || eta > 99)) || direttrice.length > 500 || pensiero.length > 1000 || motivo.length > 500)
                res.send({ message: "Modifica del passaggio non riuscita: dati non validi" });
            else
                db.query("UPDATE passaggi SET nome = ?, eta = ?, data_inserimento_viaggiatore = ?, data_inserimento_operatore = NOW(), nazione_in_viaggio_da = ?, comune_in_viaggio_da = ?, nazione_destinazione = ?, comune_destinazione = ?, direttrice = ?, motivo = ?, pensiero  = ? WHERE id_passaggio = ?", [nome, eta, data_inserimento_viaggiatore, nazione_in_viaggio_da, comune_in_viaggio_da, nazione_destinazione, comune_destinazione, direttrice, motivo, pensiero, id], (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send({ message: "Modifica del passaggio non riuscita" });
                    }
                    else {
                        if (result.affectedRows > 0)
                            res.send({ messageOk: "Modifica del passaggio riuscita" });
                        else
                            res.send({ message: "Nessun passaggio è stato modificato" });
                    }
                });
        }
        else
            res.send({ message: "Modifica del passaggio non riuscita: utente non autorizzato" });
    });
});


/*ReportsTO*/


function calcTokenReports(token, callback) {
    dbreports.query("SELECT mail, is_signaller FROM users WHERE deleted IS FALSE AND ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_signaller)", [token], (err, result) => {
        if (err)
            callback(err, -1, -1);
        else
            callback(null, result.length, result.length > 0 ? result[0].is_signaller : -1);
    });
}

app.post("/api/signUpReports", (req, res) => {
    const mail = req.body.mail.trim();
    const password = req.body.password;
    const passwordCopy = req.body.passwordCopy;
    const phone = req.body.phone && req.body.phone.trim().length > 0 ? req.body.phone.trim() : null;

    if (isEmail(mail) && mail.length <= 320) {
        dbreports.query("SELECT mail FROM users WHERE deleted IS FALSE AND mail = ?", [mail], (err, result) => {
            if (err) {
                console.log(err);
                res.send({ message: "Controllo mail non riuscito" });
            }
            else if (result.length > 0)
                res.send({ message: "Mail già in uso da un altro utente" });
            else {
                if (password && passwordCopy && password.trim().length > 0 && passwordCopy.trim().length > 0) {
                    if (password.localeCompare(passwordCopy) === 0) {
                        if (passwordCheck.validate(password)) {
                            if (!phone || (phone.length <= 20 && isPhoneNumber.isValidNumber(phone, "IT")))
                                dbreports.query("INSERT INTO users (mail, password, phone, is_signaller) VALUES (?, SHA1(?), ?, 1)", [mail, password, phone], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        res.send({ message: "Creazione dell'utente non riuscita" });
                                    }
                                    else {
                                        dbreports.query("SELECT * FROM users WHERE deleted IS FALSE AND mail = ? AND password = SHA1(?) AND is_signaller IS TRUE", [mail, password], (err, result) => {
                                            if (err) {
                                                console.log(err);
                                                res.send({ message: "Accesso non riuscito, riprovare più tardi" });
                                            }
                                            else if (result.length > 0) {
                                                var mailOptions = {
                                                    from: fromAddressSegnalazioni,
                                                    to: mail,
                                                    subject: "Benvenuto/a nell'app di raccolta segnalazioni della Treviso-Ostiglia",
                                                    html: "Gentile utente,<br/><br/>Stai ricevendo questa mail perché ti sei iscritto al portale di raccolta segnalazioni della Treviso-Ostiglia utilizzando questo indirizzo mail.<br/>Il tuo user ID è " + result[0].user_id + ". Conservalo in quanto rappresenta in modo univoco il tuo profilo utente.<br/>La tua password è " + password + ".<br/><br/>Cordiali saluti"
                                                };
                                                transporterSegnalazioni.sendMail(mailOptions, (error, info) => {
                                                    if (error) {
                                                        console.log(error);
                                                        res.send({ messageOk: "Benvenuto/a " + mail + ": il tuo user ID è " + result[0].user_id + ". Conservalo in quanto rappresenta in modo univoco il tuo profilo utente. La tua password è " + password + "." });
                                                    }
                                                    else
                                                        res.send({ messageOk: "Benvenuto/a " + mail + ". Ti è stata inviata una mail con alcune informazioni utili" });
                                                });
                                            }
                                            else
                                                res.send({ message: "Accesso non riuscito, riprovare più tardi" });
                                        });
                                    }
                                });
                            else
                                res.send({ message: "Numero di telefono non valido" });
                        }
                        else
                            res.send({ message: "La password deve contenere almeno una lettera minuscola, una lettera maiuscola, una cifra, un carattere speciale, essere lunga almeno 8 caratteri e non contenere spazi" });
                    }
                    else
                        res.send({ message: "Le password non corrispondono" });
                }
                else
                    res.send({ message: "I campi password non possono essere vuoti" });
            }
        });
    }
    else
        res.send({ message: "Formato mail non valido" });
});

app.post("/api/updateUserMailReports/:token", (req, res) => {
    const oldMail = req.body.oldMail.trim();
    const newMail = req.body.newMail.trim();
    const newMailCopy = req.body.newMailCopy.trim();
    const token = req.params.token;

    calcTokenReports(token, (err, data, is_signaller) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Modifica dell'indirizzo mail non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_signaller === 1) {
            if (isEmail(oldMail) && isEmail(newMail) && isEmail(newMailCopy) && oldMail.length <= 320 && newMail.length <= 320 && newMailCopy.length <= 320) {
                if (newMail.localeCompare(newMailCopy) === 0) {
                    if (oldMail.localeCompare(newMail) !== 0) {
                        dbreports.query("SELECT user_id FROM users WHERE mail = ? AND ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_signaller)", [oldMail, token], (err, result) => {
                            if (err) {
                                console.log(err);
                                res.send({ message: "Controllo corrispondenza vecchio indirizzo mail non riuscito" });
                            }
                            else if (result.length > 0)
                                dbreports.query("SELECT user_id FROM users WHERE mail = ?", [newMail], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        res.send({ message: "Controllo disponibilità nuovo indirizzo mail non riuscito" });
                                    }
                                    else if (result.length > 0)
                                        res.send({ message: "Indirizzo mail già in uso da un altro utente o appartenente ad un utente cancellato" });
                                    else {
                                        dbreports.query("UPDATE users SET mail = ? WHERE ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_signaller)", [newMail, token], (err, result) => {
                                            if (err) {
                                                console.log(err);
                                                res.send({ message: "Modifica dell'indirizzo mail non riuscita" });
                                            }
                                            else
                                                res.send({ messageOk: "Modifica dell'indirizzo mail riuscita. Accedi utilizzando il nuovo indirizzo mail" });
                                        });
                                    }
                                });
                            else
                                res.send({ message: "Il vecchio indirizzo mail inserito non è corretto" });
                        });
                    }
                    else
                        res.send({ message: "I due indirizzi mail devono essere diversi" });
                }
                else
                    res.send({ message: "Il nuovo indirizzo mail non è ripetuto correttamente" });
            }
            else
                res.send({ message: "Formato indirizzo mail non valido" });
        }
        else
            res.send({ message: "Modifica dell'indirizzo mail non riuscita: utente non autorizzato" });
    });
});

app.post("/api/updateUserPasswordReports/:token", (req, res) => {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const newPasswordCopy = req.body.newPasswordCopy.trim();
    const token = req.params.token;

    calcTokenReports(token, (err, data, is_signaller) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Modifica della password non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_signaller === 1) {
            if (oldPassword && newPassword && newPasswordCopy && oldPassword.trim().length > 0 && newPassword.trim().length > 0 && newPasswordCopy.trim().length > 0) {
                if (newPassword.localeCompare(newPasswordCopy) === 0) {
                    if (oldPassword.localeCompare(newPassword) !== 0) {
                        dbreports.query("SELECT user_id FROM users WHERE password = SHA1(?) AND ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_signaller)", [oldPassword, token], (err, result) => {
                            if (err) {
                                console.log(err);
                                res.send({ message: "Controllo corrispondenza vecchia password non riuscito" });
                            }
                            else if (result.length > 0) {
                                if (passwordCheck.validate(newPassword)) {
                                    dbreports.query("UPDATE users SET password = SHA1(?) WHERE ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_signaller)", [newPassword, token], (err, result) => {
                                        if (err) {
                                            console.log(err);
                                            res.send({ message: "Modifica della password non riuscita" });
                                        }
                                        else
                                            res.send({ messageOk: "Modifica della password riuscita. Accedi utilizzando la nuova password" });
                                    });
                                }
                                else
                                    res.send({ message: "La password deve contenere almeno una lettera minuscola, una lettera maiuscola, una cifra, un carattere speciale, essere lunga almeno 8 caratteri e non contenere spazi" });
                            }
                            else
                                res.send({ message: "La vecchia password inserita non è corretta" });
                        });
                    }
                    else
                        res.send({ message: "Le due password devono essere diverse" });
                }
                else
                    res.send({ message: "La nuova password non è ripetuta correttamente" });
            }
            else
                res.send({ message: "I campi password non possono essere vuoti" });
        }
        else
            res.send({ message: "Modifica della password non riuscita: utente non autorizzato" });
    });
});

app.post("/api/updateUserPhoneReports/:token", (req, res) => {
    const oldPhone = req.body.oldPhone && req.body.oldPhone.trim().length > 0 ? req.body.oldPhone.trim() : null;
    const newPhone = req.body.newPhone && req.body.newPhone.trim().length > 0 ? req.body.newPhone.trim() : null;
    const newPhoneCopy = req.body.newPhoneCopy && req.body.newPhoneCopy.trim().length > 0 ? req.body.newPhoneCopy.trim() : null;
    const token = req.params.token;

    calcTokenReports(token, (err, data, is_signaller) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Modifica del numero non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_signaller === 1) {
            if (newPhone == newPhoneCopy) {
                if (oldPhone != newPhone) {
                    dbreports.query("SELECT user_id FROM users WHERE " + (oldPhone ? "phone = ?" : "phone IS NULL") + " AND ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_signaller)", (oldPhone ? [oldPhone, token] : [token]), (err, result) => {
                        if (err) {
                            console.log(err);
                            res.send({ message: "Controllo corrispondenza vecchio numero non riuscito" });
                        }
                        else if (result.length > 0) {
                            if (!newPhone || isPhoneNumber.isValidNumber(newPhone, "IT")) {
                                dbreports.query("UPDATE users SET phone = ? WHERE ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_signaller)", [newPhone, token], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        res.send({ message: "Modifica del numero non riuscita" });
                                    }
                                    else
                                        res.send({ messageOk: "Modifica del numero riuscita. Accedi utilizzando le tue credenziali" });
                                });
                            }
                            else
                                res.send({ message: "Il numero inserito non è valido" });
                        }
                        else
                            res.send({ message: "Il vecchio numero inserito non è corretto" });
                    });
                }
                else
                    res.send({ message: "I due numeri devono essere diversi" });
            }
            else
                res.send({ message: "Il nuovo numero non è ripetuto correttamente" });
        }
        else
            res.send({ message: "Modifica del numero non riuscita: utente non autorizzato" });
    });
});

app.post("/api/loginReports", (req, res) => {
    const mail = req.body.mail.trim();
    const password = req.body.password;
    const appType = req.body.appType;

    dbreports.query("SELECT * FROM users WHERE deleted IS FALSE AND mail = ? AND password = SHA1(?) AND is_signaller = ?", [mail, password, appType.localeCompare("4bed232a318792afd4d4d86be5d92574cb72c45b") === 0], (err, result) => {
        if (err) {
            console.log(err);
            res.send({ message: "Controllo accesso non riuscito" });
        }
        else if (result.length > 0)
            res.send({ messageOk: "Accesso effettuato. Bentornato " + mail });
        else {
            dbreports.query("SELECT * FROM users WHERE deleted IS FALSE AND mail = ? AND is_signaller = ?", [mail, appType.localeCompare("4bed232a318792afd4d4d86be5d92574cb72c45b") === 0], (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({ message: "Controllo esistenza utente non riuscito" });
                }
                else if (result.length > 0)
                    res.send({ message: "Password errata" });
                else
                    res.send({ message: "Utente non esistente" });
            })
        }
    });
});

app.get("/api/getReports/:category&tkn=:token", (req, res) => {
    const category = req.params.category;
    const token = req.params.token;

    calcTokenReports(token, (err, data, is_signaller) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento dati non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && ((is_signaller === 0 && category === "0O") || (is_signaller === 1 && category === "0S") || (is_signaller === 0 && category === "-1O") || (is_signaller === 1 && category === "1S"))) {
            if ((["0O", "0S", "-1O", "1S"].includes(category))) {
                var queryText;

                if (category === "0O")
                    queryText = "SELECT r.*, u.phone AS phone FROM reports r JOIN users u ON r.signaller_id = u.user_id WHERE r.deleted IS FALSE AND r.is_resolved IS TRUE ORDER BY r.resolution_flag_date_time DESC";
                else if (category === "0S")
                    queryText = "SELECT report_id, report_date_time, report_title, report_description, report_location_description, signaller_id, is_resolved, maintainer_id, resolution_description, resolution_fix_date, resolution_flag_date_time, deleted FROM reports WHERE deleted IS FALSE AND is_resolved IS TRUE ORDER BY resolution_flag_date_time DESC";
                else if (category === "-1O")
                    queryText = "SELECT r.*, u.phone AS phone FROM reports r JOIN users u ON r.signaller_id = u.user_id WHERE r.deleted IS FALSE AND r.is_resolved IS FALSE ORDER BY r.report_date_time DESC";
                else if (category == "1S")
                    queryText = "SELECT * FROM reports WHERE deleted IS FALSE AND is_resolved IS FALSE AND signaller_id IN (SELECT user_id FROM users WHERE deleted IS FALSE AND ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_signaller)) ORDER BY report_date_time DESC";

                dbreports.query(queryText, [token], (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send({ message: "Caricamento dati non riuscito" });
                    }
                    else
                        res.send(result);
                });
            }
            else
                res.send({ message: "Caricamento dati non riuscito: categoria non riconosciuta" });
        }
        else
            res.send({ message: "Caricamento dati non riuscito: utente non autorizzato" });
    });
});

app.post("/api/addReports/:token", upload.array("images"), (req, res) => {
    const lat = req.body.lat && req.body.lat.length > 0 && !isNaN(req.body.lat) ? req.body.lat.trim() : null;
    const lon = req.body.lon && req.body.lon.length > 0 && !isNaN(req.body.lon) ? req.body.lon.trim() : null;
    const report_title = req.body.report_title && req.body.report_title.length > 0 ? req.body.report_title.trim() : null;
    const report_description = req.body.report_description && req.body.report_description.length > 0 ? req.body.report_description.trim() : null;
    const report_location_description = req.body.report_location_description && req.body.report_location_description.length > 0 ? req.body.report_location_description.trim() : null;
    const images = req.files;
    const token = req.params.token;
    const maxImagesWeight = 26214400;
    const imagesQty = 3;

    calcTokenReports(token, (err, data, is_signaller) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Aggiunta della segnalazione non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_signaller === 1) {
            if (((lat !== null) !== (lon !== null)) || (lat !== null && (lat < -90 || lat > 90)) || (lon !== null && (lon < -180 || lon > 180)) || !report_title || report_title.length > 200 || (report_description && (report_description.length > 1000)) || !report_location_description || report_location_description.length > 1000)
                res.send({ message: "Aggiunta della segnalazione non riuscita: dati non validi" });
            else {
                if (images.length > 0) {
                    const filesSize = images.reduce((totSize, el) => totSize + el.size, 0);

                    if (images.length > imagesQty || filesSize > maxImagesWeight)
                        res.send({ message: "Aggiunta della segnalazione non riuscita: le immagini sono più di " + imagesQty + " o hanno un peso troppo alto per poter essere caricate e inviate (max. " + (maxImagesWeight / 1048576) + "MB)" });
                    else if (images.some(el => el.mimetype.localeCompare("image/jpeg") !== 0))
                        res.send({ message: "Aggiunta della segnalazione non riuscita: sono accettate solo immagini jpeg" });
                    else {
                        dbreports.query("INSERT INTO reports (report_date_time, lat_lon, report_title, report_description, report_location_description, signaller_id) VALUES (NOW()," + ((lat !== null && lon !== null) ? "ST_PointFromText(?)" : "?") + ",?,?,?,(SELECT user_id FROM users WHERE deleted IS FALSE AND ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_signaller)))", [((lat !== null && lon !== null) ? ("POINT(" + lat + " " + lon + ")") : null), report_title, report_description, report_location_description, token], (err, result) => {
                            if (err) {
                                console.log(err);
                                res.send({ message: "Aggiunta della segnalazione non riuscita" });
                            }
                            else {
                                const failMessageOk = "Aggiunta della segnalazione riuscita, mail non inviata: per favore, inviare gli allegati via mail a " + fromAddressSegnalazioni + " specificando il titolo della segnalazione e la data odierna";

                                dbreports.query("SELECT mail, phone FROM users WHERE deleted IS FALSE AND ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_signaller)", [token], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        res.send({ messageOknm: failMessageOk });
                                    }
                                    else if (result.length > 0) {
                                        var reportPosition = (lat !== null && lon !== null) ? (lat + ", " + lon) : null;

                                        var mailOptions = {
                                            from: result[0].mail,
                                            to: fromAddressSegnalazioni,
                                            subject: "Nuova segnalazione (" + report_title + ")",
                                            html: "È stata aggiunta una nuova segnalazione" + (result[0].phone ? (" dall'utente contattabile al numero <a title=\"Chiama " + result[0].phone + "\" href=\"tel:+39" + result[0].phone + "\">" + result[0].phone + "</a>") : "") + ".<br/><br/>Titolo: " + report_title + "<br/>" + (report_description ? ("<br/>Descrizione della segnalazione: <p style=\"white-space: pre-line\">" + report_description + "</p><br/>") : "<br/>") + "<br/>Descrizione del luogo: <p style=\"white-space: pre-line\">" + report_location_description + "</p><br/>" + (reportPosition ? ("Posizione: <a title=\"Apri [" + reportPosition + "] in Google Maps\" href=\"//maps.google.com/?q=" + reportPosition + "\" target=\"_blank\" rel=\"noopener noreferrer\">[" + reportPosition + "]</a>") : ""),
                                            attachments: images.map(image => ({
                                                filename: image.originalname,
                                                content: image.buffer,
                                                contentType: "image/jpeg"
                                            }))
                                        };
                                        transporterSegnalazioni.sendMail(mailOptions, (error, info) => {
                                            if (error) {
                                                console.log(error);
                                                res.send({ messageOknm: failMessageOk });
                                            }
                                            else
                                                res.send({ messageOk: "Aggiunta della segnalazione riuscita" });
                                        });
                                    }
                                    else
                                        res.send({ messageOknm: failMessageOk });
                                });
                            }
                        });
                    }
                }
                else
                    res.send({ message: "Aggiunta della segnalazione non riuscita: è necessario allegare almeno un'immagine" });
            }
        }
        else
            res.send({ message: "Aggiunta della segnalazione non riuscita: utente non autorizzato" });
    });
});

app.put("/api/updateReportFromId/:id&tkn=:token", (req, res) => {
    const report_date_time = req.body.report_date_time;
    const resolution_description = req.body.resolution_description ? req.body.resolution_description.trim() : null;
    const resolution_fix_date = req.body.resolution_fix_date ? req.body.resolution_fix_date.trim() : null;
    const id = req.params.id;
    const token = req.params.token;
    calcTokenReports(token, (err, data, is_signaller) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Risoluzione della segnalazione non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_signaller === 0) {
            if (!resolution_description || resolution_description.length > 1000 || !resolution_fix_date || resolution_fix_date < report_date_time.slice(0, 10) || resolution_fix_date > new Date().toISOString().slice(0, 10))
                res.send({ message: "Risoluzione della segnalazione non riuscita: dati non validi" });
            else
                dbreports.query("UPDATE reports SET is_resolved = 1, maintainer_id = (SELECT user_id FROM users WHERE deleted IS FALSE AND ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_signaller)), resolution_description = ?, resolution_fix_date = ?, resolution_flag_date_time = NOW() WHERE deleted IS FALSE AND report_id = ?", [token, resolution_description, resolution_fix_date, id], (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send({ message: "Risoluzione della segnalazione non riuscita" });
                    }
                    else if (result.affectedRows > 0) {
                        const failMessageOk = "Risoluzione della segnalazione riuscita, mail riassuntiva non inviata";

                        dbreports.query("SELECT mail, report_date_time, lat_lon, report_title, resolution_description, resolution_fix_date FROM users JOIN reports WHERE users.deleted IS FALSE AND reports.deleted IS FALSE AND user_id = (SELECT signaller_id FROM reports WHERE deleted IS FALSE AND report_id = ?) AND report_id = ?", [id, id], (errAddress, signallerAddress) => {
                            if (errAddress) {
                                console.log(errAddress);
                                res.send({ messageOknm: failMessageOk });
                            }
                            else if (signallerAddress.length > 0) {
                                moment.locale("it");
                                var reportDate = moment(signallerAddress[0].report_date_time).format("DD MMMM YYYY");
                                var reportTime = moment(signallerAddress[0].report_date_time).format("HH:mm:ss");
                                var reportPosition = signallerAddress[0].lat_lon ? (signallerAddress[0].lat_lon.x + ", " + signallerAddress[0].lat_lon.y) : null;
                                var resolutionFixDate = moment(signallerAddress[0].resolution_fix_date).format("DD MMMM YYYY");

                                var mailOptions = {
                                    from: fromAddressSegnalazioni,
                                    to: signallerAddress[0].mail,
                                    subject: "Aggiornamento in merito alla segnalazione del " + reportDate,
                                    html: "Gentile segnalatore/segnalatrice,<br/><br/>La segnalazione con titolo \"" + signallerAddress[0].report_title + "\", effettuata il giorno " + reportDate + " alle " + reportTime + (reportPosition ? (" in posizione <a title=\"Apri [" + reportPosition + "] in Google Maps\" href=\"//maps.google.com/?q=" + reportPosition + "\" target=\"_blank\" rel=\"noopener noreferrer\">[" + reportPosition + "]</a>") : "") + ", è stata risolta il giorno " + resolutionFixDate + ".<br/><br/>Ulteriori informazioni riguardo la risoluzione:<br/><p style=\"white-space: pre-line\">" + signallerAddress[0].resolution_description + "</p><br/>Cordiali saluti"
                                };
                                transporterSegnalazioni.sendMail(mailOptions, (error, info) => {
                                    if (error) {
                                        console.log(error);
                                        res.send({ messageOknm: failMessageOk + ". Il destinatario sarebbe " + signallerAddress[0].mail });
                                    }
                                    else
                                        res.send({ messageOk: "Risoluzione della segnalazione riuscita, mail riassuntiva inviata a " + signallerAddress[0].mail });
                                });
                            }
                            else
                                res.send({ messageOknm: failMessageOk });
                        });
                    }
                    else
                        res.send({ message: "Nessuna segnalazione è stata risolta" });
                });
        }
        else
            res.send({ message: "Risoluzione della segnalazione non riuscita: utente non autorizzato" });
    });
});


/*Reservations*/


function calcTokenReservations(token, callback) {
    dbreservations.query("SELECT mail, is_user FROM accounts WHERE ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_user)", [token], (err, result) => {
        if (err)
            callback(err, -1, -1);
        else
            callback(null, result.length, result.length > 0 ? result[0].is_user : -1);
    });
}

app.get("/api/getRoomTypeTranslations", (req, res) => {
    res.send(roomTypeTranslations);
});

app.get("/api/getMainUsageOptions", (req, res) => {
    res.send(mainUsageOptions);
});

app.post("/api/signUpReservations", (req, res) => {
    const mail = req.body.mail.trim();
    const password = req.body.password;
    const passwordCopy = req.body.passwordCopy;
    const name = req.body.name.trim();
    const surname = req.body.surname.trim();
    const mainUsage = req.body.mainUsage ? req.body.mainUsage.trim() : null;
    const rulesAccepted = req.body.rulesAccepted;

    if (rulesAccepted === true) {
        if (isEmail(mail) && mail.length <= 320) {
            dbreservations.query("SELECT mail FROM accounts WHERE mail = ?", [mail], (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({ message: "Controllo mail non riuscito" });
                }
                else if (result.length > 0)
                    res.send({ message: "Mail già in uso da un altro account" });
                else {
                    if (password && passwordCopy && password.trim().length > 0 && passwordCopy.trim().length > 0) {
                        if (password.localeCompare(passwordCopy) === 0) {
                            if (passwordCheck.validate(password)) {
                                if (name && surname && name.length > 0 && name.length <= 100 && surname.length > 0 && surname.length <= 100) {
                                    if (mainUsageOptions.includes(mainUsage))
                                        dbreservations.query("INSERT INTO accounts (mail, password, name, surname, has_accepted_rules, is_user, main_usage) VALUES (?, SHA1(?), ?, ?, 1, 1, ?)", [mail, password, name, surname, mainUsage], (err, result) => {
                                            if (err) {
                                                console.log(err);
                                                res.send({ message: "Creazione dell'account non riuscita" });
                                            }
                                            else {
                                                dbreservations.query("SELECT * FROM accounts WHERE mail = ? AND password = SHA1(?) AND is_user IS TRUE", [mail, password], (err, result) => {
                                                    if (err) {
                                                        console.log(err);
                                                        res.send({ message: "Accesso non riuscito, riprovare più tardi" });
                                                    }
                                                    else if (result.length > 0) {
                                                        var mailOptions = {
                                                            from: fromAddressPrenotazioniHub,
                                                            to: mail,
                                                            subject: "Benvenuto/a nell'app di prenotazione posti per l'Innovation Lab del Camposampierese",
                                                            html: "Gentile " + result[0].name + " " + result[0].surname + ",<br/><br/>Stai ricevendo questa mail perché ti sei iscritto/a al <a title=\"Accedi alla webapp\" href=\"//officinedigitali.fcc.veneto.it/SmartLab\" target=\"_blank\" rel=\"noopener noreferrer\">portale di prenotazione posti per l'Innovation Lab del Camposampierese</a> utilizzando questo indirizzo mail.<br/>Il tuo user ID è " + result[0].account_id + ". Conservalo in quanto rappresenta in modo univoco il tuo profilo utente.<br/>La tua password è " + password + ".<br/><br/>Cordiali saluti"
                                                        };
                                                        transporterPrenotazioniHub.sendMail(mailOptions, (error, info) => {
                                                            if (error) {
                                                                console.log(error);
                                                                res.send({ messageOk: "Gentile " + result[0].name + " " + result[0].surname + ", la tua iscrizione al portale di prenotazione posti per l'Innovation Lab del Camposampierese è avvenuta con successo. Il tuo user ID è " + result[0].account_id + ". Conservalo in quanto rappresenta in modo univoco il tuo profilo utente. La tua password è " + password + "." });
                                                            }
                                                            else
                                                                res.send({ messageOk: "Gentile " + result[0].name + " " + result[0].surname + ", la tua iscrizione al portale di prenotazione posti per l'Innovation Lab del Camposampierese è avvenuta con successo. Ti è stata inviata una mail con alcune informazioni utili." });
                                                        });
                                                    }
                                                    else
                                                        res.send({ message: "Accesso non riuscito, riprovare più tardi" });
                                                });
                                            }
                                        });
                                    else
                                        res.send({ message: "Utilizzo previsto non valido" })
                                }
                                else
                                    res.send({ message: "Nome/cognome non validi" });
                            }
                            else
                                res.send({ message: "La password deve contenere almeno una lettera minuscola, una lettera maiuscola, una cifra, un carattere speciale, essere lunga almeno 8 caratteri e non contenere spazi" });
                        }
                        else
                            res.send({ message: "Le password non corrispondono" });
                    }
                    else
                        res.send({ message: "I campi password non possono essere vuoti" });
                }
            });
        }
        else
            res.send({ message: "Formato mail non valido" });
    }
    else
        res.send({ message: "Per iscriversi è necessario accettare le regole sull'utilizzo degli spazi" });
});

app.post("/api/updateAccountMailReservations/:token", (req, res) => {
    const oldMail = req.body.oldMail.trim();
    const newMail = req.body.newMail.trim();
    const newMailCopy = req.body.newMailCopy.trim();
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Modifica dell'indirizzo mail non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 1) {
            if (isEmail(oldMail) && isEmail(newMail) && isEmail(newMailCopy) && oldMail.length <= 320 && newMail.length <= 320 && newMailCopy.length <= 320) {
                if (newMail.localeCompare(newMailCopy) === 0) {
                    if (oldMail.localeCompare(newMail) !== 0) {
                        dbreservations.query("SELECT account_id FROM accounts WHERE mail = ? AND ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_user)", [oldMail, token], (err, result) => {
                            if (err) {
                                console.log(err);
                                res.send({ message: "Controllo corrispondenza vecchio indirizzo mail non riuscito" });
                            }
                            else if (result.length > 0)
                                dbreservations.query("SELECT account_id FROM accounts WHERE mail = ?", [newMail], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        res.send({ message: "Controllo disponibilità nuovo indirizzo mail non riuscito" });
                                    }
                                    else if (result.length > 0)
                                        res.send({ message: "Indirizzo mail già in uso da un altro account" });
                                    else {
                                        dbreservations.query("UPDATE accounts SET mail = ? WHERE ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_user)", [newMail, token], (err, result) => {
                                            if (err) {
                                                console.log(err);
                                                res.send({ message: "Modifica dell'indirizzo mail non riuscita" });
                                            }
                                            else
                                                res.send({ messageOk: "Modifica dell'indirizzo mail riuscita. Accedi utilizzando il nuovo indirizzo mail" });
                                        });
                                    }
                                });
                            else
                                res.send({ message: "Il vecchio indirizzo mail inserito non è corretto" });
                        });
                    }
                    else
                        res.send({ message: "I due indirizzi mail devono essere diversi" });
                }
                else
                    res.send({ message: "Il nuovo indirizzo mail non è ripetuto correttamente" });
            }
            else
                res.send({ message: "Formato indirizzo mail non valido" });
        }
        else
            res.send({ message: "Modifica dell'indirizzo mail non riuscita: utente non autorizzato" });
    });
});

app.post("/api/updateAccountPasswordReservations/:token", (req, res) => {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const newPasswordCopy = req.body.newPasswordCopy.trim();
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Modifica della password non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 1) {
            if (oldPassword && newPassword && newPasswordCopy && oldPassword.trim().length > 0 && newPassword.trim().length > 0 && newPasswordCopy.trim().length > 0) {
                if (newPassword.localeCompare(newPasswordCopy) === 0) {
                    if (oldPassword.localeCompare(newPassword) !== 0) {
                        dbreservations.query("SELECT account_id FROM accounts WHERE password = SHA1(?) AND ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_user)", [oldPassword, token], (err, result) => {
                            if (err) {
                                console.log(err);
                                res.send({ message: "Controllo corrispondenza vecchia password non riuscito" });
                            }
                            else if (result.length > 0) {
                                if (passwordCheck.validate(newPassword)) {
                                    dbreservations.query("UPDATE accounts SET password = SHA1(?) WHERE ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_user)", [newPassword, token], (err, result) => {
                                        if (err) {
                                            console.log(err);
                                            res.send({ message: "Modifica della password non riuscita" });
                                        }
                                        else
                                            res.send({ messageOk: "Modifica della password riuscita. Accedi utilizzando la nuova password" });
                                    });
                                }
                                else
                                    res.send({ message: "La password deve contenere almeno una lettera minuscola, una lettera maiuscola, una cifra, un carattere speciale, essere lunga almeno 8 caratteri e non contenere spazi" });
                            }
                            else
                                res.send({ message: "La vecchia password inserita non è corretta" });
                        });
                    }
                    else
                        res.send({ message: "Le due password devono essere diverse" });
                }
                else
                    res.send({ message: "La nuova password non è ripetuta correttamente" });
            }
            else
                res.send({ message: "I campi password non possono essere vuoti" });
        }
        else
            res.send({ message: "Modifica della password non riuscita: utente non autorizzato" });
    });
});

app.post("/api/updateAccountNameSurnameReservations/:token", (req, res) => {
    const oldName = req.body.oldName.trim();
    const newName = req.body.newName.trim();
    const oldSurname = req.body.oldSurname.trim();
    const newSurname = req.body.newSurname.trim();
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Modifica di nome/cognome non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 1) {
            if (oldName == newName && oldSurname == newSurname)
                res.send({ message: "Almeno uno tra nome e cognome dev'essere diverso rispetto a quello vecchio" });
            else {
                dbreservations.query("SELECT account_id FROM accounts WHERE name = ? AND surname = ? AND ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_user)", [oldName, oldSurname, token], (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send({ message: "Controllo corrispondenza vecchi nome e cognome non riuscito" });
                    }
                    else if (result.length > 0) {
                        if (newName && newSurname && newName.length > 0 && newName.length <= 100 && newSurname.length > 0 && newSurname.length <= 100) {
                            dbreservations.query("UPDATE accounts SET name = ?, surname = ? WHERE ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_user)", [newName, newSurname, token], (err, result) => {
                                if (err) {
                                    console.log(err);
                                    res.send({ message: "Modifica di nome/cognome non riuscita" });
                                }
                                else
                                    res.send({ messageOk: "Modifica di nome/cognome riuscita. Accedi utilizzando le tue credenziali" });
                            });
                        }
                        else
                            res.send({ message: "Almeno uno tra nome e cognome inseriti non è valido" });
                    }
                    else
                        res.send({ message: "I vecchi nome e cognome inseriti non sono corretti" });
                });
            }
        }
        else
            res.send({ message: "Modifica di nome/cognome non riuscita: utente non autorizzato" });
    });
});

app.post("/api/loginReservations", (req, res) => {
    const mail = req.body.mail.trim();
    const password = req.body.password;
    const appType = req.body.appType;
    const SmartLabSHA = "fe63849ee9cc5df870c3461729c79a0e9aee5e7a";

    dbreservations.query("SELECT * FROM accounts WHERE mail = ? AND password = SHA1(?) AND is_user = ?", [mail, password, appType.localeCompare(SmartLabSHA) === 0], (err, result) => {
        if (err) {
            console.log(err);
            res.send({ message: "Controllo accesso non riuscito" });
        }
        else if (result.length > 0)
            res.send({ messageOk: "Accesso effettuato. Bentornato " + result[0].name + " " + result[0].surname });
        else {
            dbreservations.query("SELECT * FROM accounts WHERE mail = ? AND is_user = ?", [mail, appType.localeCompare(SmartLabSHA) === 0], (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({ message: "Controllo esistenza account non riuscito" });
                }
                else if (result.length > 0)
                    res.send({ message: "Password errata" });
                else
                    res.send({ message: "Account non esistente" });
            })
        }
    });
});

app.get("/api/getFixedMessage/:token", (req, res) => {
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento messaggio fissato non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0) {
            dbreservations.query("SELECT fixed_message FROM fixed_messages", (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({ message: "Caricamento messaggio fissato non riuscito" });
                }
                else if (result.length > 0)
                    res.send(result[0].fixed_message);
                else
                    res.send({ message: "Caricamento messaggio fissato non riuscito: nessun messaggio fissato trovato" });
            });
        }
        else
            res.send({ message: "Caricamento messaggio fissato non riuscito: utente non autorizzato" });
    });
});

app.put("/api/updateFixedMessage/:token", (req, res) => {
    const fixed_message = req.body.fixed_message;
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Aggiornamento messaggio fissato non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 0) {
            if (fixed_message == null || !(typeof fixed_message === "string" || fixed_message instanceof String) || fixed_message.length > 256)
                res.send({ message: "Aggiornamento messaggio fissato non riuscito: dati non validi" });
            else {
                dbreservations.query("UPDATE fixed_messages SET fixed_message = ?", [fixed_message.trim().charAt(0).toUpperCase() + fixed_message.trim().slice(1)], (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send({ message: "Aggiornamento messaggio fissato non riuscito" });
                    }
                    else
                        res.send({ messageOk: "Aggiornamento messaggio fissato riuscito" });
                });
            }
        }
        else
            res.send({ message: "Aggiornamento messaggio fissato non riuscito: utente non autorizzato" });
    });
});

app.get("/api/getFromAddressPrenotazioniHub/:token", (req, res) => {
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento indirizzo mail non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 1) {
            res.send({ messageOk: fromAddressPrenotazioniHub });
        }
        else
            res.send({ message: "Caricamento indirizzo mail non riuscito: utente non autorizzato" });
    });
});

app.get("/api/getRoomsInfo/:token", (req, res) => {
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento informazioni sale non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0) {
            dbreservations.query("SELECT room_id, room_name_updatable, room_description, seats_nr, room_type FROM rooms", (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({ message: "Caricamento informazioni sale non riuscito" });
                }
                else
                    res.send(result);
            });
        }
        else
            res.send({ message: "Caricamento informazioni sale non riuscito: utente non autorizzato" });
    });
});

app.get("/api/getLastSlotDate/:token", (req, res) => {
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento data ultimo slot esistente non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 0) {
            dbreservations.query("SELECT slot_day FROM slots ORDER BY slot_day DESC LIMIT 1", (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({ message: "Caricamento data ultimo slot esistente non riuscito" });
                }
                else if (result.length > 0)
                    res.send(result[0].slot_day);
                else
                    res.send(moment().startOf("day"));
            });
        }
        else
            res.send({ message: "Caricamento data ultimo slot esistente non riuscito: utente non autorizzato" });
    });
});

app.post("/api/getExistingSlots/:token", (req, res) => {
    const firstDay = req.body.firstDay;
    const lastDay = req.body.lastDay;
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento informazioni slots non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 0) {
            if (firstDay && lastDay && isDate(firstDay, { format: "YYYY-MM-DD" }) && isDate(lastDay, { format: "YYYY-MM-DD" })) {
                dbreservations.query(`
                SELECT slot_id, slot_start_time, slot_day, ((room_type IN ("smart working", "call") AND account_id IS NULL AND coworker_id IS NULL) OR (room_type = "conference" AND ((account_id IS NOT NULL AND is_allowed = -1) OR (account_id IS NULL AND is_allowed = 0)))) AS is_free, room_id
                FROM slots JOIN rooms USING (room_id)
                WHERE slot_day BETWEEN ? AND ?
                `, [firstDay, lastDay], (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send({ message: "Caricamento informazioni slots non riuscito" });
                    }
                    else
                        res.send(result);
                });
            }
            else
                res.send({ message: "Caricamento informazioni slots non riuscito: dati non validi" });
        }
        else
            res.send({ message: "Caricamento informazioni slots non riuscito: utente non autorizzato" });
    });
});

app.post("/api/addFutureSlots/:token", isReservationsMiddlewareLockedMiddlewareCheck, (req, res) => {
    const slotsArr = req.body.slotsArr;
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            isReservationsMiddlewareLocked = false;
            res.send({ message: "Modifica orari non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 0) {
            dbreservations.query("SELECT * FROM coworkers WHERE deleted IS NOT TRUE", (err, resultCoworkers) => {
                if (err) {
                    console.log(err);
                    isReservationsMiddlewareLocked = false;
                    res.send({ message: "Modifica orari non riuscita: caricamento informazioni co-workers non riuscito" });
                }
                else {
                    const notDeletedCoworkers = resultCoworkers.map(c => JSON.parse(JSON.stringify(c)));
                    dbreservations.query("SELECT room_id, room_type FROM rooms", (err, resultRooms) => {
                        if (err) {
                            console.log(err);
                            isReservationsMiddlewareLocked = false;
                            res.send({ message: "Modifica orari non riuscita: caricamento informazioni sale non riuscito" });
                        }
                        else {
                            const roomIDs = resultRooms.map(r => [r.room_id, r.room_type.localeCompare("conference") !== 0, r.room_type]);
                            dbreservations.query("SELECT slot_day FROM slots ORDER BY slot_day DESC LIMIT 1", [], (err, resultLastSlotDay) => {
                                if (err) {
                                    console.log(err);
                                    isReservationsMiddlewareLocked = false;
                                    res.send({ message: "Modifica orari non riuscita: caricamento data ultimo slot esistente non riuscito" });
                                }
                                else {
                                    const lastSlotDay = resultLastSlotDay.length === 0 ? (moment().startOf("day")) : moment(resultLastSlotDay[0].slot_day);

                                    if (Array.isArray(slotsArr) && slotsArr !== null && slotsArr.length > 0 && slotsArr.every(key => moment(key, "MM/DD/YYYY HH:mm", true).isValid() && (moment(key, "MM/DD/YYYY HH:mm").startOf("day").isAfter(moment(lastSlotDay, "YYYY-MM-DD"))) && moment(moment(key, "MM/DD/YYYY HH:mm").format("HH:mm"), "HH:mm").isBetween(openHour, closeHour, undefined, "[]"))) {
                                        if (slotsArr.length <= slotsArrLimit) {
                                            const slotsToAdd = [];
                                            roomIDs.forEach(el => slotsArr.forEach(key => slotsToAdd.push([Number(el[0]), moment(key, "MM/DD/YYYY HH:mm").format("YYYY-MM-DD"), moment(key, "MM/DD/YYYY HH:mm").format("HH:mm:00"), moment(key, "MM/DD/YYYY HH:mm").add(1, "h").format("HH:mm:00"), el[2].localeCompare("smart working") === 0])));

                                            dbreservations.getConnection((err, connection) => {
                                                if (err) {
                                                    console.log(err);
                                                    connection.release();
                                                    isReservationsMiddlewareLocked = false;
                                                    res.send({ message: "Modifica orari non riuscita: connessione al database non riuscita" });
                                                    return;
                                                }
                                                connection.beginTransaction(err => {
                                                    if (err) {
                                                        console.log(err);
                                                        connection.release();
                                                        isReservationsMiddlewareLocked = false;
                                                        res.send({ message: "Modifica orari non riuscita: transazione non riuscita" });
                                                        return;
                                                    }

                                                    const slotsDataQueryPart = slotsToAdd.map((slot, sind) =>
                                                        "SELECT " + slot[0] + (sind === 0 ? " AS room_id" : "") + ", " +
                                                        "'" + slot[1] + "'" + (sind === 0 ? " AS slot_day" : "") + ", " +
                                                        "'" + slot[2] + "'" + (sind === 0 ? " AS slot_start_time" : "") + ", " +
                                                        "'" + slot[3] + "'" + (sind === 0 ? " AS slot_end_time" : "") + ", " +
                                                        ((roomIDs.find(r => r[0] === slot[0]))[1] ? ("'1_r" + slot[0] + "'") : "NULL") + (sind === 0 ? " AS chair_id" : "")
                                                    ).join(" UNION ALL ");
                                                    connection.query(slotsDataQueryPart.length > 0 ? `
                                                        INSERT INTO slots (room_id, slot_day, slot_start_time, slot_end_time, chair_id)
                                                        SELECT * FROM (
                                                            ${slotsDataQueryPart}
                                                        ) AS new_slots
                                                        ` : `SELECT null`
                                                        , [], (err, oneSeatInsertResult) => {
                                                            if (err) {
                                                                console.log(err);
                                                                connection.rollback(_ => {
                                                                    connection.release();
                                                                    isReservationsMiddlewareLocked = false;
                                                                    res.send({ message: "Modifica orari non riuscita: transazione non riuscita" });
                                                                });
                                                            } else {
                                                                const firstNewSlotDate = moment.min(slotsArr.map(dt => moment(dt, "MM/DD/YYYY HH:mm"))).format("YYYY-MM-DD");
                                                                connection.query(slotsDataQueryPart.length > 0 ? `
                                                                    INSERT INTO slots (slot_day, slot_start_time, slot_end_time, room_id, chair_id)
                                                                    SELECT 
                                                                        slot_day, 
                                                                        slot_start_time, 
                                                                        slot_end_time, 
                                                                        single_slots.room_id AS room_id,
                                                                        CONCAT(numbers.nr, "_r", room_id) AS chair_id
                                                                    FROM (
                                                                        SELECT slot_id, slot_day, slot_start_time, slot_end_time, chair_id, slots.room_id AS room_id, seats_nr
                                                                        FROM slots JOIN rooms USING (room_id)
                                                                        WHERE slot_day >= "` + firstNewSlotDate + `" AND (room_type = "smart working" OR room_type = "call")
                                                                    ) AS single_slots
                                                                    CROSS JOIN (
                                                                        ${rangeStr}
                                                                    ) AS numbers
                                                                    WHERE numbers.nr BETWEEN 2 AND seats_nr
                                                                    ` : `SELECT null`, [], (err, singleInsertedSlots) => {
                                                                    if (err) {
                                                                        console.log(err);
                                                                        connection.rollback(_ => {
                                                                            connection.release();
                                                                            isReservationsMiddlewareLocked = false;
                                                                            res.send({ message: "Modifica orari non riuscita: transazione non riuscita" });
                                                                        });
                                                                    } else {
                                                                        const hasAddedSomething = !Array.isArray(singleInsertedSlots);

                                                                        const filteredSTA = slotsToAdd.filter(slot => slot[4] === true);
                                                                        var slotsDateTimesForSmartWorking = filteredSTA.map(slot => slot[1] + " " + slot[2]).join('","');
                                                                        var slotDatesForSmartWorking = [...new Set(filteredSTA.map(slot => slot[1]))].join('","');
                                                                        var slotTimesForSmartWorking = [...new Set(filteredSTA.map(slot => slot[2]))].join('","');

                                                                        const swRooms = resultRooms.filter(r => r.room_type.localeCompare("smart working") === 0).map(r => r.room_id).join('","');
                                                                        var multiquery = "";
                                                                        notDeletedCoworkers.forEach(ndc => {
                                                                            multiquery +=
                                                                                `
                                                                                    UPDATE slots
                                                                                    SET coworker_id = ${ndc.coworker_id}
                                                                                    WHERE
                                                                                    slot_id IN
                                                                                    (
                                                                                        SELECT slot_id
                                                                                        FROM (
                                                                                            SELECT slot_id, ROW_NUMBER() OVER (PARTITION BY CONCAT(slot_day, " ", slot_start_time)) AS n
                                                                                            FROM slots
                                                                                            WHERE
                                                                                            room_id IN ("${swRooms}")
                                                                                            AND slot_day IN ("${slotDatesForSmartWorking}")
                                                                                            AND slot_start_time IN ("${slotTimesForSmartWorking}")
                                                                                            AND CONCAT(slot_day, " ", slot_start_time) IN ("${slotsDateTimesForSmartWorking}")
                                                                                            AND coworker_id IS NULL AND "${moment(ndc.valid_from).format("YYYY-MM-DD")}" <= slot_day
                                                                                        ) AS ss
                                                                                        WHERE ss.n = 1
                                                                                    );
                                                                                `
                                                                        });
                                                                        connection.query(
                                                                            hasAddedSomething && multiquery.length > 0 ? multiquery : `SELECT null`,
                                                                            [], (errArr, updatedSlotsForCoworkersArrRes) => {
                                                                                if (errArr) {
                                                                                    console.log(errArr);
                                                                                    connection.rollback(_ => {
                                                                                        connection.release();
                                                                                        isReservationsMiddlewareLocked = false;
                                                                                        res.send({ message: "Modifica orari non riuscita: transazione non riuscita" });
                                                                                    });
                                                                                } else {
                                                                                    connection.commit(err => {
                                                                                        if (err) {
                                                                                            console.log(err);
                                                                                            connection.rollback(_ => {
                                                                                                connection.release();
                                                                                                isReservationsMiddlewareLocked = false;
                                                                                                res.send({ message: "Modifica orari non riuscita: transazione non riuscita" });
                                                                                            });
                                                                                        } else {
                                                                                            connection.release();
                                                                                            isReservationsMiddlewareLocked = false;
                                                                                            res.send({ messageOk: "Modifica orari riuscita" });
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                });
                                            });
                                        }
                                        else {
                                            isReservationsMiddlewareLocked = false;
                                            res.send({ message: "Modifica orari non riuscita: è possibile aggiungere al massimo " + slotsArrLimit + " slot (l'equivalente di 8 ore al giorno per 6 mesi) alla volta" });
                                        }
                                    }
                                    else {
                                        isReservationsMiddlewareLocked = false;
                                        res.send({ message: "Modifica orari non riuscita: dati non validi" });
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
        else {
            isReservationsMiddlewareLocked = false;
            res.send({ message: "Modifica orari non riuscita: utente non autorizzato" });
        }
    });
});

app.post("/api/addRemoveSlots/:token", isReservationsMiddlewareLockedMiddlewareCheck, (req, res) => {
    const slotsObj = req.body.slotsObj;
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            isReservationsMiddlewareLocked = false;
            res.send({ message: "Modifica orari non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 0) {
            dbreservations.query("SELECT * FROM coworkers WHERE deleted IS NOT TRUE", (err, resultCoworkers) => {
                if (err) {
                    console.log(err);
                    isReservationsMiddlewareLocked = false;
                    res.send({ message: "Modifica orari non riuscita: caricamento informazioni co-workers non riuscito" });
                }
                else {
                    const notDeletedCoworkers = resultCoworkers.map(c => JSON.parse(JSON.stringify(c)));
                    dbreservations.query("SELECT room_id, room_type FROM rooms", (err, resultRooms) => {
                        if (err) {
                            console.log(err);
                            isReservationsMiddlewareLocked = false;
                            res.send({ message: "Modifica orari non riuscita: caricamento informazioni sale non riuscito" });
                        }
                        else {
                            const roomIDs = resultRooms.map(r => [r.room_id, r.room_type.localeCompare("conference") !== 0, r.room_type]);
                            dbreservations.query(`
                                SELECT slot_id, slot_start_time, slot_end_time, slot_day, slots.room_id AS room_id, room_name_updatable, accounts.mail AS account_mail, accounts.name AS account_name, accounts.surname AS account_surname, coworkers.mail AS coworker_mail, coworkers.name AS coworker_name, coworkers.surname AS coworker_surname, valid_from, topic, request_datetime,
                                ((room_type IN ("smart working", "call") AND slots.account_id IS NULL AND slots.coworker_id IS NULL) OR (room_type = "conference" AND ((slots.account_id IS NOT NULL AND is_allowed = -1) OR (slots.account_id IS NULL AND is_allowed = 0)))) AS is_free,
                                (room_type = "conference" AND slots.account_id IS NOT NULL AND is_allowed = 0) AS deleted_to_waiting_smartworker,
                                (room_type = "conference" AND slots.account_id IS NOT NULL AND is_allowed = 1) AS deleted_to_confirmed_smartworker,
                                (room_type IN ("smart working", "call") AND slots.account_id IS NOT NULL) AS deleted_for_smartworker,
                                (room_type IN ("smart working", "call") AND slots.coworker_id IS NOT NULL) AS deleted_for_coworker
                                FROM slots LEFT JOIN accounts USING (account_id) LEFT JOIN coworkers USING (coworker_id) JOIN rooms USING (room_id)
                                `, [], (err, resultAllSlots) => {
                                if (err) {
                                    console.log(err);
                                    isReservationsMiddlewareLocked = false;
                                    res.send({ message: "Modifica orari non riuscita: caricamento informazioni slots non riuscito" });
                                }
                                else {
                                    const allSlots = resultAllSlots.map(s => JSON.parse(JSON.stringify(s)));

                                    let lastSlotDay = null;

                                    for (const slot of allSlots)
                                        if (!lastSlotDay || slot.slot_day > lastSlotDay)
                                            lastSlotDay = slot.slot_day;

                                    if (lastSlotDay)
                                        lastSlotDay = moment(lastSlotDay);
                                    else
                                        lastSlotDay = moment().startOf("day");

                                    if (
                                        typeof slotsObj === "object" && !Array.isArray(slotsObj) && slotsObj !== null && Object.keys(slotsObj).length > 0
                                        &&
                                        Object.keys(slotsObj).every(key => roomIDs.map(r => r[0]).includes(Number(key)) && Object.keys(slotsObj[key]).every(key2 => moment(key2, "MM/DD/YYYY HH:mm", true).isValid() && (moment(key2, "MM/DD/YYYY HH:mm").startOf("day").isSameOrBefore(moment(lastSlotDay, "YYYY-MM-DD"))) && moment(moment(key2, "MM/DD/YYYY HH:mm").format("HH:mm"), "HH:mm").isBetween(openHour, closeHour, undefined, "[]") && ((slotsObj[key])[key2]).every(sId => allSlots.some(s => s.slot_id === sId && s.room_id === Number(key) && key2.localeCompare(moment(s.slot_day).format("MM/DD/YYYY") + " " + moment(s.slot_start_time, "HH:mm:ss").format("HH:mm")) === 0))))
                                    ) {
                                        const slotsToRemove = [];
                                        const slotsToAdd = [];
                                        Object.keys(slotsObj).forEach(key => {
                                            Object.keys(slotsObj[key]).forEach(key2 => {
                                                if (slotsObj[key][key2].length > 0)
                                                    slotsObj[key][key2].forEach(s => slotsToRemove.push(s));
                                                else
                                                    slotsToAdd.push([Number(key), moment(key2, "MM/DD/YYYY HH:mm").format("YYYY-MM-DD"), moment(key2, "MM/DD/YYYY HH:mm").format("HH:mm:00"), moment(key2, "MM/DD/YYYY HH:mm").add(1, "h").format("HH:mm:00"), ((roomIDs.find(r => r[0] === Number(key)))[2]).localeCompare("smart working") === 0]);
                                            });
                                        });

                                        dbreservations.getConnection((err, connection) => {
                                            if (err) {
                                                console.log(err);
                                                connection.release();
                                                isReservationsMiddlewareLocked = false;
                                                res.send({ message: "Modifica orari non riuscita: connessione al database non riuscita" });
                                                return;
                                            }
                                            connection.beginTransaction(err => {
                                                if (err) {
                                                    console.log(err);
                                                    connection.release();
                                                    isReservationsMiddlewareLocked = false;
                                                    res.send({ message: "Modifica orari non riuscita: transazione non riuscita" });
                                                    return;
                                                }
                                                connection.query("DELETE FROM slots WHERE slot_id IN (?)", [slotsToRemove.length > 0 ? slotsToRemove : [-1]], (err, deleteResult) => {
                                                    if (err) {
                                                        console.log(err);
                                                        connection.rollback(_ => {
                                                            connection.release();
                                                            isReservationsMiddlewareLocked = false;
                                                            res.send({ message: "Modifica orari non riuscita: transazione non riuscita" });
                                                        });
                                                    } else {
                                                        const slotsDataQueryPart = slotsToAdd.map((slot, sind) =>
                                                            "SELECT " + slot[0] + (sind === 0 ? " AS room_id" : "") + ", " +
                                                            "'" + slot[1] + "'" + (sind === 0 ? " AS slot_day" : "") + ", " +
                                                            "'" + slot[2] + "'" + (sind === 0 ? " AS slot_start_time" : "") + ", " +
                                                            "'" + slot[3] + "'" + (sind === 0 ? " AS slot_end_time" : "") + ", " +
                                                            ((roomIDs.find(r => r[0] === slot[0]))[1] ? ("'1_r" + slot[0] + "'") : "NULL") + (sind === 0 ? " AS chair_id" : "")
                                                        ).join(" UNION ALL ");
                                                        connection.query(slotsDataQueryPart.length > 0 ? `
                                                            INSERT INTO slots (room_id, slot_day, slot_start_time, slot_end_time, chair_id)
                                                            SELECT * FROM (
                                                                ${slotsDataQueryPart}
                                                            ) AS new_slots
                                                            WHERE NOT EXISTS (
                                                                SELECT 1
                                                                FROM slots
                                                                WHERE slots.room_id = new_slots.room_id
                                                                AND slots.slot_day = new_slots.slot_day
                                                                AND slots.slot_start_time = new_slots.slot_start_time
                                                            )
                                                            ` : `SELECT null`
                                                            , [], (err, oneSeatInsertResult) => {
                                                                if (err) {
                                                                    console.log(err);
                                                                    connection.rollback(_ => {
                                                                        connection.release();
                                                                        isReservationsMiddlewareLocked = false;
                                                                        res.send({ message: "Modifica orari non riuscita: transazione non riuscita" });
                                                                    });
                                                                } else {
                                                                    const firstPassedSlotDate = moment.min(slotsToAdd.map(s => moment(s[1], "YYYY-MM-DD"))).format("YYYY-MM-DD");
                                                                    const lastPassedSlotDate = moment.max(slotsToAdd.map(s => moment(s[1], "YYYY-MM-DD"))).format("YYYY-MM-DD");
                                                                    connection.query(slotsDataQueryPart.length > 0 ? `
                                                                        INSERT INTO slots (slot_day, slot_start_time, slot_end_time, room_id, chair_id)
                                                                        SELECT 
                                                                            slot_day, 
                                                                            slot_start_time, 
                                                                            slot_end_time, 
                                                                            single_slots.room_id AS room_id,
                                                                            CONCAT(numbers.nr, "_r", room_id) AS chair_id
                                                                        FROM (
                                                                            SELECT slot_id, slot_day, slot_start_time, slot_end_time, chair_id, slots.room_id AS room_id, seats_nr
                                                                            FROM slots JOIN rooms USING (room_id)
                                                                            WHERE slot_day >= "` + firstPassedSlotDate + `" AND slot_day <= "` + lastPassedSlotDate + `" AND (room_type = "smart working" OR room_type = "call")
                                                                            AND EXISTS (
                                                                                SELECT 1
                                                                                FROM (
                                                                                    ${slotsDataQueryPart}
                                                                                ) AS new_slots
                                                                                WHERE slots.room_id = new_slots.room_id
                                                                                AND slots.slot_day = new_slots.slot_day
                                                                                AND slots.slot_start_time = new_slots.slot_start_time
                                                                            )
                                                                        ) AS single_slots
                                                                        CROSS JOIN (
                                                                            ${rangeStr}
                                                                        ) AS numbers
                                                                        WHERE numbers.nr BETWEEN 2 AND seats_nr
                                                                        ` : `SELECT null`, [], (err, singleInsertedSlots) => {
                                                                        if (err) {
                                                                            console.log(err);
                                                                            connection.rollback(_ => {
                                                                                connection.release();
                                                                                isReservationsMiddlewareLocked = false;
                                                                                res.send({ message: "Modifica orari non riuscita: transazione non riuscita" });
                                                                            });
                                                                        } else {
                                                                            const hasAddedSomething = !Array.isArray(singleInsertedSlots);

                                                                            const filteredSTA = slotsToAdd.filter(slot => slot[4] === true);
                                                                            var slotsDateTimesForSmartWorking = filteredSTA.map(slot => slot[1] + " " + slot[2]).join('","');
                                                                            var slotDatesForSmartWorking = [...new Set(filteredSTA.map(slot => slot[1]))].join('","');
                                                                            var slotTimesForSmartWorking = [...new Set(filteredSTA.map(slot => slot[2]))].join('","');

                                                                            const swRooms = resultRooms.filter(r => r.room_type.localeCompare("smart working") === 0).map(r => r.room_id).join('","');
                                                                            var multiquery = "";
                                                                            notDeletedCoworkers.forEach(ndc => {
                                                                                multiquery +=
                                                                                    `
                                                                                        UPDATE slots
                                                                                        SET coworker_id = ${ndc.coworker_id}
                                                                                        WHERE
                                                                                        slot_id IN
                                                                                        (
                                                                                            SELECT slot_id
                                                                                            FROM (
                                                                                                SELECT slot_id, ROW_NUMBER() OVER (PARTITION BY CONCAT(slot_day, " ", slot_start_time)) AS n
                                                                                                FROM slots
                                                                                                WHERE
                                                                                                room_id IN ("${swRooms}")
                                                                                                AND slot_day IN ("${slotDatesForSmartWorking}")
                                                                                                AND slot_start_time IN ("${slotTimesForSmartWorking}")
                                                                                                AND CONCAT(slot_day, " ", slot_start_time) IN ("${slotsDateTimesForSmartWorking}")
                                                                                                AND coworker_id IS NULL AND "${moment(ndc.valid_from).format("YYYY-MM-DD")}" <= slot_day
                                                                                            ) AS ss
                                                                                            WHERE ss.n = 1
                                                                                        );
                                                                                    `
                                                                            });
                                                                            connection.query(
                                                                                hasAddedSomething && multiquery.length > 0 ? multiquery : `SELECT null`,
                                                                                [], (errArr, updatedSlotsForCoworkersArrRes) => {
                                                                                    if (errArr) {
                                                                                        console.log(errArr);
                                                                                        connection.rollback(_ => {
                                                                                            connection.release();
                                                                                            isReservationsMiddlewareLocked = false;
                                                                                            res.send({ message: "Modifica orari non riuscita: transazione non riuscita" });
                                                                                        });
                                                                                    } else {
                                                                                        connection.commit(err => {
                                                                                            if (err) {
                                                                                                console.log(err);
                                                                                                connection.rollback(_ => {
                                                                                                    connection.release();
                                                                                                    isReservationsMiddlewareLocked = false;
                                                                                                    res.send({ message: "Modifica orari non riuscita: transazione non riuscita" });
                                                                                                });
                                                                                            } else {
                                                                                                var mailSentCount = 0;
                                                                                                slotsToRemove.forEach(str => {
                                                                                                    const fs = allSlots.find(s => s.slot_id === str);
                                                                                                    if (!(fs.is_free)) {
                                                                                                        var dest = "";
                                                                                                        var subj = "";
                                                                                                        var dear = "";
                                                                                                        var but = "";
                                                                                                        var usingPortal = "";
                                                                                                        var deletedtxt = "";
                                                                                                        const otherInfoContacts = ".<br/><br/>Per ulteriori informazioni, rispondere a questa mail o contattare il numero <a title=\"Chiama " + prenotazioniHubFederazionePhone + "\" href=\"tel:+39" + prenotazioniHubFederazionePhone + "\">" + prenotazioniHubFederazionePhone + "</a>.<br/><br/>Cordiali saluti";

                                                                                                        if (fs.deleted_to_waiting_smartworker || fs.deleted_to_confirmed_smartworker) {
                                                                                                            dest = fs.account_mail;
                                                                                                            subj = "Aggiornamento su una prenotazione " + (fs.deleted_to_waiting_smartworker ? ("richiesta il " + moment(fs.request_datetime, "YYYY-MM-DD HH:mm:ss").format("D/M/YYYY")) : ("prevista per il " + moment(fs.slot_day).format("D/M/YYYY")));
                                                                                                            dear = "Gentile " + fs.account_name + " " + fs.account_surname + ",<br/><br/>";
                                                                                                            but = "Siamo spiacenti di comunicare che una slot riguardante la prenotazione richiesta il giorno " + moment(fs.request_datetime, "YYYY-MM-DD HH:mm:ss").format("D/M/YYYY") + " alle ore " + moment(fs.request_datetime).format("HH:mm");
                                                                                                            usingPortal = " utilizzando il <a title=\"Accedi alla webapp\" href=\"//officinedigitali.fcc.veneto.it/SmartLab\" target=\"_blank\" rel=\"noopener noreferrer\">portale di prenotazione posti per l'Innovation Lab del Camposampierese</a> ";
                                                                                                            deletedtxt = "e prevista per il giorno " + moment(fs.slot_day).format("D/M/YYYY") + " è stata eliminata, perciò si consiglia di visualizzare ed eventualmente gestire la prenotazione dal portale in modo coerente con le proprie necessità in quanto" + (fs.deleted_to_waiting_smartworker ? ", anche se verrà accettata, " : " ") + "non potrà essere svolta dalle ore " + moment(fs.slot_start_time, "HH:mm:ss").format("HH:mm") + " alle ore " + moment(fs.slot_end_time, "HH:mm:ss").format("HH:mm") + ".<br/> Il topic è il seguente: " + fs.topic;
                                                                                                        }
                                                                                                        else if (fs.deleted_for_smartworker) {
                                                                                                            dest = fs.account_mail;
                                                                                                            subj = "Aggiornamento su una prenotazione prevista per il " + moment(fs.slot_day).format("D/M/YYYY");
                                                                                                            dear = "Gentile " + fs.account_name + " " + fs.account_surname + ",<br/><br/>";
                                                                                                            but = "Siamo spiacenti di comunicare che una slot riguardante la prenotazione effettuata";
                                                                                                            usingPortal = " utilizzando il <a title=\"Accedi alla webapp\" href=\"//officinedigitali.fcc.veneto.it/SmartLab\" target=\"_blank\" rel=\"noopener noreferrer\">portale di prenotazione posti per l'Innovation Lab del Camposampierese</a> ";
                                                                                                            deletedtxt = "e prevista per il giorno " + moment(fs.slot_day).format("D/M/YYYY") + " è stata eliminata, perciò si consiglia di visualizzare ed eventualmente gestire la prenotazione dal portale in modo coerente con le proprie necessità in quanto non potrà essere svolta dalle ore " + moment(fs.slot_start_time, "HH:mm:ss").format("HH:mm") + " alle ore " + moment(fs.slot_end_time, "HH:mm:ss").format("HH:mm") + ".<br/> La prenotazione riguarda la " + fs.room_name_updatable;
                                                                                                        }
                                                                                                        var mailOptions = {
                                                                                                            from: fromAddressPrenotazioniHub,
                                                                                                            to: dest,
                                                                                                            subject: subj,
                                                                                                            html: dear + but + usingPortal + deletedtxt + otherInfoContacts
                                                                                                        };
                                                                                                        mailSentCount++;
                                                                                                        transporterPrenotazioniHub.sendMail(mailOptions, (error, info) => {
                                                                                                            if (error)
                                                                                                                console.log(error);
                                                                                                        });
                                                                                                    }
                                                                                                });
                                                                                                connection.release();
                                                                                                isReservationsMiddlewareLocked = false;
                                                                                                res.send({ messageOk: "Modifica orari riuscita " + (mailSentCount > 0 ? (", alcuni utenti riceveranno delle mail (" + mailSentCount + " inviate)") : "") });
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                    }
                                                });
                                            });
                                        });
                                    }
                                    else {
                                        isReservationsMiddlewareLocked = false;
                                        res.send({ message: "Modifica orari non riuscita: dati non validi" });
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
        else {
            isReservationsMiddlewareLocked = false;
            res.send({ message: "Modifica orari non riuscita: utente non autorizzato" });
        }
    });
});

app.put("/api/updateRooms/:token", (req, res) => {
    const newRoomsList = req.body.newRoomsList;
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Aggiornamento dati sale non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 0) {
            if (
                !Array.isArray(newRoomsList) ||
                newRoomsList.length === 0 ||
                newRoomsList.some(r =>
                    typeof r !== "object" ||
                    Array.isArray(r) ||
                    r === null ||
                    (!r.hasOwnProperty("room_id") || !r.hasOwnProperty("room_name_updatable") || !r.hasOwnProperty("room_description")) ||
                    (!r.room_name_updatable || !(typeof r.room_name_updatable === "string" || r.room_name_updatable instanceof String) || r.room_name_updatable.length > 20)
                    ||
                    (!r.room_description || !(typeof r.room_description === "string" || r.room_description instanceof String) || r.room_description.length > 2000)
                )
            )
                res.send({ message: "Aggiornamento dati sale non riuscito: dati non validi" });
            else {
                dbreservations.query("SELECT room_id FROM rooms WHERE room_id IN (?)", [newRoomsList.map(r => r.room_id)], (err, r) => {
                    if (err) {
                        console.log(err);
                        res.send({ message: "Aggiornamento dati sale non riuscito" });
                    }
                    else if (r.length === newRoomsList.length) {
                        let updateQuery = "UPDATE rooms SET room_name_updatable = CASE ";
                        newRoomsList.forEach(room => { updateQuery += "WHEN room_id = " + room.room_id + " THEN '" + room.room_name_updatable.trim() + "' "; });
                        updateQuery += "END, room_description = CASE ";
                        newRoomsList.forEach(room => { updateQuery += "WHEN room_id = " + room.room_id + " THEN '" + room.room_description.trim() + "' "; });
                        updateQuery += "END WHERE room_id IN (";
                        const roomIds = newRoomsList.map(room => room.room_id);
                        updateQuery += roomIds.join(", ") + ")";
                        dbreservations.query(updateQuery, [], (err, result) => {
                            if (err) {
                                console.log(err);
                                res.send({ message: "Aggiornamento dati sale non riuscito" });
                            }
                            else
                                res.send({ messageOk: "Aggiornamento dati sale riuscito" });
                        });
                    }
                    else
                        res.send({ message: "Aggiornamento dati sale non riuscito: alcune sale non sono state trovate" });
                });
            }
        }
        else
            res.send({ message: "Aggiornamento dati sale non riuscito: utente non autorizzato" });
    });
});

app.get("/api/getCoWorkersInfo/:token", (req, res) => {
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento informazioni co-workers non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 0) {
            dbreservations.query("SELECT * FROM coworkers", (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({ message: "Caricamento informazioni co-workers non riuscito" });
                }
                else
                    res.send(result);
            });
        }
        else
            res.send({ message: "Caricamento informazioni co-workers non riuscito: utente non autorizzato" });
    });
});

app.put("/api/updateCoWorkerStatusFromId/:id&act=:action&tkn=:token", isReservationsMiddlewareLockedMiddlewareCheck, (req, res) => {
    const id = req.params.id;
    const action = req.params.action;
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            isReservationsMiddlewareLocked = false;
            res.send({ message: "Modifica stato del co-worker non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 0) {
            if (action !== "0" && action !== "1") {
                isReservationsMiddlewareLocked = false;
                res.send({ message: "Modifica stato del co-worker non riuscita: dati non validi" });
            }
            else {
                dbreservations.query(`
                SELECT COUNT(*) AS fullcwrooms
                FROM rooms
                WHERE room_type = "smart working"
                AND seats_nr <= (
                    SELECT COUNT(*)
                    FROM coworkers
                    WHERE deleted IS FALSE
                )
                `, [], (err, tooMuchCoworkers) => {
                    if (err) {
                        console.log(err);
                        isReservationsMiddlewareLocked = false;
                        res.send({ message: "Attivazione del co-worker non riuscita" });
                    }
                    else if (action === "1" && tooMuchCoworkers[0].fullcwrooms > 0) {
                        isReservationsMiddlewareLocked = false;
                        res.send({ message: "Attivazione del co-worker non riuscita: le sale non potrebbero accogliere ulteriori co-workers" });
                    }
                    else {
                        if (action === "1") {
                            dbreservations.getConnection((err, connection) => {
                                if (err) {
                                    console.log(err);
                                    connection.release();
                                    isReservationsMiddlewareLocked = false;
                                    res.send({ message: "Attivazione del co-worker non riuscita: connessione al database non riuscita" });
                                    return;
                                }
                                connection.beginTransaction(err => {
                                    if (err) {
                                        console.log(err);
                                        connection.release();
                                        isReservationsMiddlewareLocked = false;
                                        res.send({ message: "Attivazione del co-worker non riuscita: transazione non riuscita" });
                                        return;
                                    }
                                    connection.query(
                                        "UPDATE coworkers SET valid_from = DATE_ADD(CURDATE(), INTERVAL 5 DAY), deleted_date = NULL, deleted = 0 WHERE coworker_id = ?"
                                        , [id], (err, cwEnableRes) => {
                                            if (err) {
                                                console.log(err);
                                                connection.rollback(_ => {
                                                    connection.release();
                                                    isReservationsMiddlewareLocked = false;
                                                    res.send({ message: "Attivazione del co-worker non riuscita: transazione non riuscita" });
                                                });
                                            } else {
                                                if (cwEnableRes.affectedRows > 0) {
                                                    connection.query(
                                                        "SELECT * FROM coworkers WHERE coworker_id = ?",
                                                        [id], (err, updatedCoworkerRow) => {
                                                            if (err) {
                                                                console.log(err);
                                                                connection.rollback(_ => {
                                                                    connection.release();
                                                                    isReservationsMiddlewareLocked = false;
                                                                    res.send({ message: "Attivazione del co-worker non riuscita: transazione non riuscita" });
                                                                });
                                                            } else {
                                                                connection.query(
                                                                    `
                                                                    SELECT slots.slot_id AS slot_id, slots.account_id AS account_id, mail, name, surname, slot_day, slot_start_time, slot_end_time, room_name_updatable
                                                                    FROM (
                                                                        SELECT s1.slot_id AS slot_id
                                                                        FROM
                                                                        (
                                                                            SELECT slot_id, slots.account_id, IF(slots.account_id IS NULL, 0, RAND()) AS rand_id, slot_day, slot_start_time, ROW_NUMBER() OVER (PARTITION BY slot_day, slot_start_time ORDER BY rand_id) AS n
                                                                            FROM slots
                                                                            JOIN rooms USING (room_id)
                                                                            LEFT JOIN accounts USING (account_id)
                                                                            WHERE slot_day >= ? AND room_type="smart working" AND coworker_id IS NULL
                                                                        ) AS s1
                                                                        WHERE n=1
                                                                    ) AS touse
                                                                    JOIN slots USING (slot_id)
                                                                    JOIN rooms USING (room_id)
                                                                    LEFT JOIN accounts USING (account_id)
                                                                    `,
                                                                    [updatedCoworkerRow[0].valid_from], (err, slotsToAssign) => {
                                                                        if (err) {
                                                                            console.log(err);
                                                                            connection.rollback(_ => {
                                                                                connection.release();
                                                                                isReservationsMiddlewareLocked = false;
                                                                                res.send({ message: "Attivazione del co-worker non riuscita: transazione non riuscita" });
                                                                            });
                                                                        } else {
                                                                            const slotsToAssignArr = slotsToAssign.map(s => JSON.parse(JSON.stringify(s)));
                                                                            connection.query(
                                                                                "UPDATE slots SET account_id = NULL, coworker_id = ? WHERE slot_id IN (?)",
                                                                                [updatedCoworkerRow[0].coworker_id, slotsToAssignArr.length > 0 ? slotsToAssignArr.map(s => s.slot_id) : [-1]], (err, assignedSlots) => {
                                                                                    if (err) {
                                                                                        console.log(err);
                                                                                        connection.rollback(_ => {
                                                                                            connection.release();
                                                                                            isReservationsMiddlewareLocked = false;
                                                                                            res.send({ message: "Attivazione del co-worker non riuscita: transazione non riuscita" });
                                                                                        });
                                                                                    } else {
                                                                                        connection.commit(err => {
                                                                                            if (err) {
                                                                                                console.log(err);
                                                                                                connection.rollback(_ => {
                                                                                                    connection.release();
                                                                                                    isReservationsMiddlewareLocked = false;
                                                                                                    res.send({ message: "Attivazione del co-worker non riuscita: transazione non riuscita" });
                                                                                                });
                                                                                            } else {
                                                                                                var mailSentCount = 0;
                                                                                                slotsToAssignArr.forEach(sta => {
                                                                                                    if (sta.account_id) {
                                                                                                        const dest = sta.mail;
                                                                                                        const subj = "Aggiornamento su una prenotazione prevista per il " + moment(sta.slot_day).format("D/M/YYYY");
                                                                                                        const dear = "Gentile " + sta.name + " " + sta.surname + ",<br/><br/>";
                                                                                                        const but = "Siamo spiacenti di comunicare che una slot riguardante la prenotazione effettuata";
                                                                                                        const usingPortal = " utilizzando il <a title=\"Accedi alla webapp\" href=\"//officinedigitali.fcc.veneto.it/SmartLab\" target=\"_blank\" rel=\"noopener noreferrer\">portale di prenotazione posti per l'Innovation Lab del Camposampierese</a> ";
                                                                                                        const deletedtxt = "e prevista per il giorno " + moment(sta.slot_day).format("D/M/YYYY") + " è stata liberata per un utente abbonato, perciò si consiglia di visualizzare ed eventualmente gestire la prenotazione dal portale in modo coerente con le proprie necessità in quanto non potrà essere svolta dalle ore " + moment(sta.slot_start_time, "HH:mm:ss").format("HH:mm") + " alle ore " + moment(sta.slot_end_time, "HH:mm:ss").format("HH:mm") + ".<br/> La prenotazione riguarda la " + sta.room_name_updatable;
                                                                                                        const otherInfoContacts = ".<br/><br/>Per ulteriori informazioni, rispondere a questa mail o contattare il numero <a title=\"Chiama " + prenotazioniHubFederazionePhone + "\" href=\"tel:+39" + prenotazioniHubFederazionePhone + "\">" + prenotazioniHubFederazionePhone + "</a>.<br/><br/>Cordiali saluti";

                                                                                                        var mailOptions = {
                                                                                                            from: fromAddressPrenotazioniHub,
                                                                                                            to: dest,
                                                                                                            subject: subj,
                                                                                                            html: dear + but + usingPortal + deletedtxt + otherInfoContacts
                                                                                                        };
                                                                                                        mailSentCount++;
                                                                                                        transporterPrenotazioniHub.sendMail(mailOptions, (error, info) => {
                                                                                                            if (error)
                                                                                                                console.log(error);
                                                                                                        });
                                                                                                    }
                                                                                                });

                                                                                                var mailOptions = {
                                                                                                    from: fromAddressPrenotazioniHub,
                                                                                                    to: updatedCoworkerRow[0].mail,
                                                                                                    subject: "Riattivazione contratto di co-working per l'Innovation Lab del Camposampierese",
                                                                                                    html: "Gentile " + updatedCoworkerRow[0].name + " " + updatedCoworkerRow[0].surname + ",<br/><br/>Con questa mail ti confermiamo l'avvenuta riattivazione del contratto che ti garantirà un posto nell'Innovation Lab del Camposampierese a partire dal giorno " + (moment().add(5, "days").format("D/M/YYYY")) + ".<br/><br/>Cordiali saluti"
                                                                                                };
                                                                                                mailSentCount++;
                                                                                                transporterPrenotazioniHub.sendMail(mailOptions, (error, info) => {
                                                                                                    if (error)
                                                                                                        console.log(error);
                                                                                                });

                                                                                                connection.release();
                                                                                                isReservationsMiddlewareLocked = false;
                                                                                                res.send({ messageOk: "Attivazione del co-worker riuscita " + (mailSentCount > 0 ? (", alcuni utenti riceveranno delle mail (" + mailSentCount + " inviate)") : "") });
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                });
                                                                        }
                                                                    });
                                                            }
                                                        });
                                                } else {
                                                    connection.rollback(_ => {
                                                        connection.release();
                                                        isReservationsMiddlewareLocked = false;
                                                        res.send({ message: "Nessun co-worker è stato attivato" });
                                                    });
                                                }
                                            }
                                        });
                                });
                            });
                        }
                        else {
                            dbreservations.getConnection((err, connection) => {
                                if (err) {
                                    console.log(err);
                                    connection.release();
                                    isReservationsMiddlewareLocked = false;
                                    res.send({ message: "Disattivazione del co-worker non riuscita: connessione al database non riuscita" });
                                    return;
                                }
                                connection.beginTransaction(err => {
                                    if (err) {
                                        console.log(err);
                                        connection.release();
                                        isReservationsMiddlewareLocked = false;
                                        res.send({ message: "Disattivazione del co-worker non riuscita: transazione non riuscita" });
                                        return;
                                    }
                                    connection.query(
                                        "SELECT * FROM coworkers WHERE coworker_id = ?",
                                        [id], (err, updatedCoworkerRow) => {
                                            if (err) {
                                                console.log(err);
                                                connection.rollback(_ => {
                                                    connection.release();
                                                    isReservationsMiddlewareLocked = false;
                                                    res.send({ message: "Disattivazione del co-worker non riuscita: transazione non riuscita" });
                                                });
                                            } else {
                                                connection.query(
                                                    "UPDATE coworkers SET valid_from = NULL, deleted_date = CURDATE(), deleted = 1 WHERE coworker_id = ?",
                                                    [id], (err, cwDisabledRes) => {
                                                        if (err) {
                                                            console.log(err);
                                                            connection.rollback(_ => {
                                                                connection.release();
                                                                isReservationsMiddlewareLocked = false;
                                                                res.send({ message: "Disattivazione del co-worker non riuscita: transazione non riuscita" });
                                                            });
                                                        }
                                                        else {
                                                            if (cwDisabledRes.affectedRows > 0) {
                                                                connection.query(
                                                                    "UPDATE slots SET coworker_id = NULL WHERE coworker_id = ?",
                                                                    [id], (err, setFreeSlotsArr) => {
                                                                        if (err) {
                                                                            console.log(err);
                                                                            connection.rollback(_ => {
                                                                                connection.release();
                                                                                isReservationsMiddlewareLocked = false;
                                                                                res.send({ message: "Disattivazione del co-worker non riuscita: transazione non riuscita" });
                                                                            });
                                                                        } else {
                                                                            connection.commit(err => {
                                                                                if (err) {
                                                                                    console.log(err);
                                                                                    connection.rollback(_ => {
                                                                                        connection.release();
                                                                                        isReservationsMiddlewareLocked = false;
                                                                                        res.send({ message: "Disattivazione del co-worker non riuscita: transazione non riuscita" });
                                                                                    });
                                                                                }
                                                                                else {
                                                                                    var mailOptions = {
                                                                                        from: fromAddressPrenotazioniHub,
                                                                                        to: updatedCoworkerRow[0].mail,
                                                                                        subject: "Disattivazione contratto di co-working per l'Innovation Lab del Camposampierese",
                                                                                        html: "Gentile " + updatedCoworkerRow[0].name + " " + updatedCoworkerRow[0].surname + ",<br/><br/>Con questa mail ti confermiamo l'avvenuta disattivazione del contratto che fino ad oggi ti ha garantito un posto nell'Innovation Lab del Camposampierese.<br/><br/>Cordiali saluti"
                                                                                    };
                                                                                    transporterPrenotazioniHub.sendMail(mailOptions, (error, info) => {
                                                                                        if (error)
                                                                                            console.log(error);
                                                                                    });
                                                                                    connection.release();
                                                                                    isReservationsMiddlewareLocked = false;
                                                                                    res.send({ messageOk: "Disattivazione del co-worker riuscita, alcuni utenti riceveranno delle mail (1 inviate)" });
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                            } else {
                                                                connection.rollback(_ => {
                                                                    connection.release();
                                                                    isReservationsMiddlewareLocked = false;
                                                                    res.send({ message: "Nessun co-worker è stato disattivato" });
                                                                });
                                                            }
                                                        }
                                                    });
                                            }
                                        });
                                });
                            });
                        }
                    }
                });
            }
        }
        else {
            isReservationsMiddlewareLocked = false;
            res.send({ message: "Modifica stato del co-worker non riuscita: utente non autorizzato" });
        }
    });
});

app.post("/api/addCoWorker/:token", isReservationsMiddlewareLockedMiddlewareCheck, (req, res) => {
    const name = req.body.name && req.body.name.length > 0 ? req.body.name.trim() : null;
    const surname = req.body.surname && req.body.surname.length > 0 ? req.body.surname.trim() : null;
    const mail = req.body.mail && req.body.mail.length > 0 ? req.body.mail.trim() : null;
    const phone = req.body.phone && req.body.phone.length > 0 ? req.body.phone.trim() : null;
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            isReservationsMiddlewareLocked = false;
            res.send({ message: "Aggiunta del co-worker non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 0) {
            dbreservations.query(`
            SELECT COUNT(*) AS fullcwrooms
            FROM rooms
            WHERE room_type = "smart working"
            AND seats_nr <= (
                SELECT COUNT(*)
                FROM coworkers
                WHERE deleted IS FALSE
            )
            `, [], (err, tooMuchCoworkers) => {
                if (err) {
                    console.log(err);
                    isReservationsMiddlewareLocked = false;
                    res.send({ message: "Aggiunta del co-worker non riuscita" });
                }
                else if (tooMuchCoworkers[0].fullcwrooms > 0) {
                    isReservationsMiddlewareLocked = false;
                    res.send({ message: "Aggiunta del co-worker non riuscita: le sale non potrebbero accogliere ulteriori co-workers" });
                }
                else {
                    if (!name || name.length > 100 || !surname || surname.length > 100 || !mail || mail.length > 320 || !isEmail(mail) || !phone || phone.length > 20 || !isPhoneNumber.isValidNumber(phone, "IT")) {
                        isReservationsMiddlewareLocked = false;
                        res.send({ message: "Aggiunta del co-worker non riuscita: dati non validi" });
                    }
                    else {
                        dbreservations.getConnection((err, connection) => {
                            if (err) {
                                console.log(err);
                                connection.release();
                                isReservationsMiddlewareLocked = false;
                                res.send({ message: "Aggiunta del co-worker non riuscita: connessione al database non riuscita" });
                                return;
                            }
                            connection.beginTransaction(err => {
                                if (err) {
                                    console.log(err);
                                    connection.release();
                                    isReservationsMiddlewareLocked = false;
                                    res.send({ message: "Aggiunta del co-worker non riuscita: transazione non riuscita" });
                                    return;
                                }
                                connection.query(
                                    "INSERT INTO coworkers (name, surname, mail, phone, insert_date, valid_from, deleted_date, deleted) VALUES (?,?,?,?,CURDATE(),DATE_ADD(CURDATE(), INTERVAL 5 DAY),NULL,0)",
                                    [name, surname, mail, phone], (err, insertRes) => {
                                        if (err) {
                                            console.log(err);
                                            connection.rollback(_ => {
                                                connection.release();
                                                isReservationsMiddlewareLocked = false;
                                                res.send({ message: "Aggiunta del co-worker non riuscita: transazione non riuscita" });
                                            });
                                        } else {
                                            connection.query(
                                                "SELECT * FROM coworkers ORDER BY coworker_id DESC LIMIT 1",
                                                [], (err, insertedCoworkerRow) => {
                                                    if (err) {
                                                        console.log(err);
                                                        connection.rollback(_ => {
                                                            connection.release();
                                                            isReservationsMiddlewareLocked = false;
                                                            res.send({ message: "Aggiunta del co-worker non riuscita: transazione non riuscita" });
                                                        });
                                                    } else {
                                                        connection.query(
                                                            `
                                                            SELECT slots.slot_id AS slot_id, slots.account_id AS account_id, mail, name, surname, slot_day, slot_start_time, slot_end_time, room_name_updatable
                                                            FROM (
                                                                SELECT s1.slot_id AS slot_id
                                                                FROM
                                                                (
                                                                    SELECT slot_id, slots.account_id, IF(slots.account_id IS NULL, 0, RAND()) AS rand_id, slot_day, slot_start_time, ROW_NUMBER() OVER (PARTITION BY slot_day, slot_start_time ORDER BY rand_id) AS n
                                                                    FROM slots
                                                                    JOIN rooms USING (room_id)
                                                                    LEFT JOIN accounts USING (account_id)
                                                                    WHERE slot_day >= ? AND room_type="smart working" AND coworker_id IS NULL
                                                                ) AS s1
                                                                WHERE n=1
                                                            ) AS touse
                                                            JOIN slots USING (slot_id)
                                                            JOIN rooms USING (room_id)
                                                            LEFT JOIN accounts USING (account_id)
                                                            `,
                                                            [insertedCoworkerRow[0].valid_from], (err, slotsToAssign) => {
                                                                if (err) {
                                                                    console.log(err);
                                                                    connection.rollback(_ => {
                                                                        connection.release();
                                                                        isReservationsMiddlewareLocked = false;
                                                                        res.send({ message: "Aggiunta del co-worker non riuscita: transazione non riuscita" });
                                                                    });
                                                                } else {
                                                                    const slotsToAssignArr = slotsToAssign.map(s => JSON.parse(JSON.stringify(s)));
                                                                    connection.query(
                                                                        "UPDATE slots SET account_id = NULL, coworker_id = ? WHERE slot_id IN (?)",
                                                                        [insertedCoworkerRow[0].coworker_id, slotsToAssignArr.length > 0 ? slotsToAssignArr.map(s => s.slot_id) : [-1]], (err, assignedSlots) => {
                                                                            if (err) {
                                                                                console.log(err);
                                                                                connection.rollback(_ => {
                                                                                    connection.release();
                                                                                    isReservationsMiddlewareLocked = false;
                                                                                    res.send({ message: "Aggiunta del co-worker non riuscita: transazione non riuscita" });
                                                                                });
                                                                            } else {
                                                                                connection.commit(err => {
                                                                                    if (err) {
                                                                                        console.log(err);
                                                                                        connection.rollback(_ => {
                                                                                            connection.release();
                                                                                            isReservationsMiddlewareLocked = false;
                                                                                            res.send({ message: "Aggiunta del co-worker non riuscita: transazione non riuscita" });
                                                                                        });
                                                                                    } else {
                                                                                        var mailSentCount = 0;
                                                                                        slotsToAssignArr.forEach(sta => {
                                                                                            if (sta.account_id) {
                                                                                                const dest = sta.mail;
                                                                                                const subj = "Aggiornamento su una prenotazione prevista per il " + moment(sta.slot_day).format("D/M/YYYY");
                                                                                                const dear = "Gentile " + sta.name + " " + sta.surname + ",<br/><br/>";
                                                                                                const but = "Siamo spiacenti di comunicare che una slot riguardante la prenotazione effettuata";
                                                                                                const usingPortal = " utilizzando il <a title=\"Accedi alla webapp\" href=\"//officinedigitali.fcc.veneto.it/SmartLab\" target=\"_blank\" rel=\"noopener noreferrer\">portale di prenotazione posti per l'Innovation Lab del Camposampierese</a> ";
                                                                                                const deletedtxt = "e prevista per il giorno " + moment(sta.slot_day).format("D/M/YYYY") + " è stata liberata per un utente abbonato, perciò si consiglia di visualizzare ed eventualmente gestire la prenotazione dal portale in modo coerente con le proprie necessità in quanto non potrà essere svolta dalle ore " + moment(sta.slot_start_time, "HH:mm:ss").format("HH:mm") + " alle ore " + moment(sta.slot_end_time, "HH:mm:ss").format("HH:mm") + ".<br/> La prenotazione riguarda la " + sta.room_name_updatable;
                                                                                                const otherInfoContacts = ".<br/><br/>Per ulteriori informazioni, rispondere a questa mail o contattare il numero <a title=\"Chiama " + prenotazioniHubFederazionePhone + "\" href=\"tel:+39" + prenotazioniHubFederazionePhone + "\">" + prenotazioniHubFederazionePhone + "</a>.<br/><br/>Cordiali saluti";

                                                                                                var mailOptions = {
                                                                                                    from: fromAddressPrenotazioniHub,
                                                                                                    to: dest,
                                                                                                    subject: subj,
                                                                                                    html: dear + but + usingPortal + deletedtxt + otherInfoContacts
                                                                                                };
                                                                                                mailSentCount++;
                                                                                                transporterPrenotazioniHub.sendMail(mailOptions, (error, info) => {
                                                                                                    if (error)
                                                                                                        console.log(error);
                                                                                                });
                                                                                            }
                                                                                        });

                                                                                        var mailOptions = {
                                                                                            from: fromAddressPrenotazioniHub,
                                                                                            to: mail,
                                                                                            subject: "Sottoscrizione contratto di co-working per l'Innovation Lab del Camposampierese",
                                                                                            html: "Gentile " + name + " " + surname + ",<br/><br/>Con questa mail ti confermiamo l'avvenuta sottoscrizione del contratto che ti garantirà un posto nell'Innovation Lab del Camposampierese a partire dal giorno " + (moment().add(5, "days").format("D/M/YYYY")) + ".<br/><br/>Cordiali saluti"
                                                                                        };
                                                                                        mailSentCount++;
                                                                                        transporterPrenotazioniHub.sendMail(mailOptions, (error, info) => {
                                                                                            if (error)
                                                                                                console.log(error);
                                                                                        });

                                                                                        connection.release();
                                                                                        isReservationsMiddlewareLocked = false;
                                                                                        res.send({ messageOk: "Aggiunta del co-worker riuscita " + (mailSentCount > 0 ? (", alcuni utenti riceveranno delle mail (" + mailSentCount + " inviate)") : "") });
                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                                                                }
                                                            });
                                                    }
                                                });
                                        }
                                    });
                            });
                        });
                    }
                }
            });
        }
        else {
            isReservationsMiddlewareLocked = false;
            res.send({ message: "Aggiunta del co-worker non riuscita: utente non autorizzato" });
        }
    });
});

app.put("/api/updateCoWorkerFromId/:id&tkn=:token", (req, res) => {
    const name = req.body.name && req.body.name.length > 0 ? req.body.name.trim() : null;
    const surname = req.body.surname && req.body.surname.length > 0 ? req.body.surname.trim() : null;
    const mail = req.body.mail && req.body.mail.length > 0 ? req.body.mail.trim() : null;
    const phone = req.body.phone && req.body.phone.length > 0 ? req.body.phone.trim() : null;
    const coworker_id = req.params.id;
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Modifica del co-worker non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 0) {
            if (!name || name.length > 100 || !surname || surname.length > 100 || !mail || mail.length > 320 || !isEmail(mail) || !phone || phone.length > 20 || !isPhoneNumber.isValidNumber(phone, "IT"))
                res.send({ message: "Modifica del co-worker non riuscita: dati non validi" });
            else {
                dbreservations.query("SELECT coworker_id FROM coworkers WHERE coworker_id = ? AND deleted IS FALSE", [coworker_id], (err, r) => {
                    if (err) {
                        console.log(err);
                        res.send({ message: "Modifica del co-worker non riuscita" });
                    }
                    else if (r.length > 0) {
                        dbreservations.query("UPDATE coworkers SET name = ?, surname = ?, mail = ?, phone = ? WHERE coworker_id = ?", [name, surname, mail, phone, coworker_id], (err, result) => {
                            if (err) {
                                console.log(err);
                                res.send({ message: "Modifica del co-worker non riuscita" });
                            }
                            else
                                res.send({ messageOk: "Modifica del co-worker riuscita" });
                        });
                    }
                    else
                        res.send({ message: "Modifica del co-worker non riuscita: co-worker non trovato" });
                });
            }
        }
        else
            res.send({ message: "Modifica del co-worker non riuscita: utente non autorizzato" });
    });
});

app.get("/api/getSmartWorkersInfo/:token", (req, res) => {
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento informazioni smart-workers non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 0) {
            dbreservations.query(
                `
                SELECT a.account_id, name, surname, main_usage, mail, contract_dt, contract_dt IS NOT NULL AS has_contract, IF(contract_dt IS NOT NULL, COALESCE(t.pre_renew_reservations_count, 0) + COALESCE(t.post_renew_reservations_count, 0), COALESCE(t.pre_renew_reservations_count, 0)) AS all_reservations_count, COALESCE(t.post_renew_reservations_count, 0) AS post_renew_reservations_count, score_about_call, score_about_working, score_about_conference
                FROM accounts a
                LEFT JOIN
                (
                    SELECT accounts.account_id AS t_account_id,
                    COUNT(CASE WHEN ((accounts.contract_dt IS NULL AND CONCAT(slot_day, " ", slot_start_time) < DATE_FORMAT(NOW(), "%Y-%m-%d %H:00:00")) OR (accounts.contract_dt IS NOT NULL AND CONCAT(slot_day, " ", slot_start_time) < DATE_FORMAT(accounts.contract_dt, "%Y-%m-%d %H:00:00"))) THEN 1 END) AS pre_renew_reservations_count,
                    COUNT(CASE WHEN (accounts.contract_dt IS NOT NULL AND CONCAT(slot_day, " ", slot_start_time) >= DATE_FORMAT(accounts.contract_dt, "%Y-%m-%d %H:00:00") AND CONCAT(slot_day, " ", slot_start_time) < DATE_FORMAT(NOW(), "%Y-%m-%d %H:00:00")) THEN 1 END) AS post_renew_reservations_count
                    FROM accounts 
                    JOIN slots USING (account_id) 
                    JOIN rooms USING (room_id)
                    WHERE is_user IS TRUE AND room_type <> "conference"
                    GROUP BY accounts.account_id
                ) t
                ON a.account_id = t.t_account_id
                WHERE is_user IS TRUE
                `, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({ message: "Caricamento informazioni smart-workers non riuscito" });
                }
                else
                    res.send(result);
            });
        }
        else
            res.send({ message: "Caricamento informazioni smart-workers non riuscito: utente non autorizzato" });
    });
});

app.put("/api/updateSmartWorkerContractFromId/:id&tkn=:token", (req, res) => {
    const id = req.params.id;
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Modifica data di contratto dello smart-worker non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 0) {

            dbreservations.query(
                "SELECT * from accounts WHERE account_id = ? AND is_user IS TRUE", [id], (err, userRow) => {
                    if (err) {
                        console.log(err);
                        res.send({ message: "Modifica data di contratto dello smart-worker non riuscita" });
                    }
                    else {
                        dbreservations.query(
                            "UPDATE accounts SET contract_dt = NOW() WHERE account_id = ? AND is_user IS TRUE", [id], (err, result) => {
                                if (err) {
                                    console.log(err);
                                    res.send({ message: "Modifica data di contratto dello smart-worker non riuscita" });
                                }
                                else {
                                    if (result.affectedRows > 0) {
                                        var mailOptions = {
                                            from: fromAddressPrenotazioniHub,
                                            to: userRow[0].mail,
                                            subject: "Attivazione contratto utente per l'Innovation Lab del Camposampierese",
                                            html: "Gentile " + userRow[0].name + " " + userRow[0].surname + ",<br/><br/>Con questa mail ti confermiamo l'avvenuta attivazione del contratto per il tuo profilo utente, riguardante i tuoi futuri utilizzi dell'Innovation Lab del Camposampierese.<br/><br/>Cordiali saluti"
                                        };
                                        transporterPrenotazioniHub.sendMail(mailOptions, (error, info) => {
                                            if (error)
                                                console.log(error);
                                        });

                                        res.send({ messageOk: "Modifica data di contratto dello smart-worker riuscita, alcuni utenti riceveranno delle mail (1 inviate)" });
                                    }
                                    else
                                        res.send({ message: "Nessuno smart-worker è stato modificato" });
                                }
                            });
                    }
                });
        }
        else
            res.send({ message: "Modifica data di contratto dello smart-worker non riuscita: utente non autorizzato" });
    });
});

app.get("/api/getScoresFieldsToFill/:token", (req, res) => {
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento campi punteggi non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 1) {
            dbreservations.query("SELECT DISTINCT room_type FROM slots JOIN rooms USING (room_id) WHERE account_id = (SELECT account_id FROM accounts WHERE ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_user)) AND (room_type <> 'conference' OR is_allowed = 1) AND CONCAT(slot_day, ' ', slot_start_time) < NOW()", [token], (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({ message: "Caricamento campi punteggi non riuscito" });
                }
                else if (result.length > 0) {
                    var rows_names = [];
                    for (let i = 0; i < result.length; i++)
                        rows_names.push(scoresColumnsNamesStart + (result[i].room_type.endsWith("working") ? "working" : result[i].room_type));
                    rows_names = [...new Set(rows_names)];

                    dbreservations.query("SELECT score_about_conference, score_about_working, score_about_call FROM accounts WHERE ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_user)", [token], (err, values) => {
                        if (err) {
                            console.log(err);
                            res.send({ message: "Caricamento campi punteggi non riuscito" });
                        }
                        else {
                            const columnsWithScore = [];
                            ["conference", "working", "call"].forEach(e => {
                                if ((values[0][scoresColumnsNamesStart + e] > 0))
                                    columnsWithScore.push(scoresColumnsNamesStart + e);
                            });
                            columnsWithScore.forEach(e => {
                                var pos = rows_names.indexOf(e);
                                if (pos !== -1)
                                    rows_names.splice(pos, 1);
                            });
                            res.send(rows_names);
                        }
                    });
                }
                else
                    res.send([]);
            });
        }
        else
            res.send({ message: "Caricamento campi punteggi non riuscito: utente non autorizzato" });
    });
});

app.post("/api/updateScores/:token", (req, res) => {
    const scores = req.body.scores ? req.body.scores : null;
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Valutazione non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 1) {
            if (typeof scores === "object" && !Array.isArray(scores) && scores !== null
                && Object.keys(scores).length > 0 && Object.keys(scores).every(prop => scoresColumns.includes(prop))) {
                if (Object.values(scores).every(val => [1, 2, 3, 4, 5].includes(val))) {
                    dbreservations.query("UPDATE accounts SET " + Object.keys(scores).map(k => k + " = ?").join(", ") + " WHERE ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_user)", [...Object.values(scores), token], (err, result) => {
                        if (err) {
                            console.log(err);
                            res.send({ message: "Valutazione non riuscita" });
                        }
                        else
                            res.send({ messageOk: "Valutazione riuscita" });
                    });
                }
                else
                    res.send({ message: "Valutazione non riuscita: punteggi non validi" });
            }
            else
                res.send({ message: "Valutazione non riuscita: proprietà non valide" });
        }
        else
            res.send({ message: "Valutazione non riuscita: utente non autorizzato" });
    });
});

app.get("/api/getReservations/:token", (req, res) => {
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento dati non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 1) {
            dbreservations.query("SELECT slot_id, slot_start_time, slot_end_time, slot_day, room_id, room_name, room_name_updatable, room_type, room_description, is_allowed, participants_nr, topic, needs_technical_assistance FROM slots JOIN rooms USING (room_id) WHERE account_id = (SELECT account_id FROM accounts WHERE ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_user)) AND is_allowed >= 0 AND CONCAT(slot_day, ' ', slot_start_time) > NOW() ORDER BY CONCAT(slot_day, ' ', slot_start_time) ASC", [token], (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({ message: "Caricamento dati non riuscito" });
                }
                else
                    res.send(result);
            });
        }
        else
            res.send({ message: "Caricamento dati non riuscito: utente non autorizzato" });
    });
});

app.get("/api/getNotMineSlotsWithStatus/:token", (req, res) => {
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento slots liberi non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 1) {
            dbreservations.query("SELECT account_id FROM accounts WHERE ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_user)", [token], (err, account_id) => {
                if (err) {
                    console.log(err);
                    res.send({ message: "Controllo ID utente non riuscito" });
                }
                else if (account_id.length > 0) {
                    dbreservations.query(
                        `
                        SELECT slot_id, slot_start_time, slot_end_time, slot_day, ssup.room_id AS room_id, room_name, room_name_for_card, room_card_id, room_type, seats_nr, room_description, (room_type IN ("smart working", "call") AND ssup.account_id IS NULL AND ssup.coworker_id IS NULL) OR (room_type = "conference" AND ((ssup.account_id IS NOT NULL AND is_allowed = -1) OR (ssup.account_id IS NULL AND is_allowed = 0))) AS is_free
                        FROM slots ssup JOIN rooms rsup USING (room_id)
                        WHERE CONCAT(slot_day, ' ', slot_start_time) > NOW()
                        AND NOT EXISTS (
                            SELECT ssub.slot_id
                            FROM slots ssub
                            WHERE ssub.slot_day = ssup.slot_day
                                AND ssub.slot_start_time = ssup.slot_start_time
                                AND ssub.account_id = ?
                                AND ssub.is_allowed <> -1
                        )
                        AND (IF(room_type = "conference", ?, ?)) > (
                            SELECT COUNT(*) AS reservedSlots
                            FROM slots JOIN rooms USING (room_id)
                            WHERE DATE_FORMAT(slot_day, "%Y-%m") = DATE_FORMAT(ssup.slot_day, "%Y-%m")
                            AND room_type = rsup.room_type AND IF(room_type = "conference", IF(room_id = ssup.room_id, 1, 0), 1) = 1
                            AND account_id = ?
                            AND is_allowed <> -1
                        )
                        `,
                        [account_id[0].account_id, conferenceMonthHoursLimitPerRoom, smartworkingAndCallMonthHoursLimit, account_id[0].account_id], (err, result) => {
                            if (err) {
                                console.log(err);
                                res.send({ message: "Caricamento slots liberi non riuscito" });
                            }
                            else
                                res.send(result);
                        });
                }
                else
                    res.send({ message: "Caricamento slots liberi non riuscito: ID utente non trovato" });
            });
        }
        else
            res.send({ message: "Caricamento slots liberi non riuscito: utente non autorizzato" });
    });
});

app.post("/api/getReservableSlotsNr/:token", (req, res) => {
    const showingMonday = req.body.showingMonday;
    const wdywtdChoice = req.body.wdywtdChoice;
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento quantità di slots prenotabili non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 1) {
            if (
                typeof wdywtdChoice === "object" && !Array.isArray(wdywtdChoice) && wdywtdChoice !== null && Object.keys(wdywtdChoice).length > 0
                &&
                isDate(showingMonday, { format: "YYYY-MM-DD" })
                &&
                (wdywtdChoice.room_type && (wdywtdChoice.room_type.localeCompare("conference") === 0 ?
                    (wdywtdChoice.room_id && Number.isInteger(wdywtdChoice.room_id) && wdywtdChoice.room_id > 0)
                    :
                    (wdywtdChoice.room_type && ["call", "smart working"].includes(wdywtdChoice.room_type))
                ))
            ) {
                dbreservations.query("SELECT account_id FROM accounts WHERE ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_user)", [token], (err, account_id) => {
                    if (err) {
                        console.log(err);
                        res.send({ message: "Controllo ID utente non riuscito" });
                    }
                    else if (account_id.length > 0) {
                        dbreservations.query(
                            `
                            SELECT (IF(? = "conference", ?, ?)) - 
                            (
                                SELECT COUNT(*) AS reservedSlots
                                FROM slots JOIN rooms USING (room_id)
                                WHERE DATE_FORMAT(slot_day, "%Y-%m") = DATE_FORMAT(?, "%Y-%m")
                                AND room_type = ?` + (wdywtdChoice.room_type.localeCompare("conference") === 0 ? ` AND slots.room_id = ? ` : ``) + `
                                AND account_id = ?
                                AND is_allowed <> -1
                            ) AS slots_nr
                        `,
                            [wdywtdChoice.room_type, conferenceMonthHoursLimitPerRoom, smartworkingAndCallMonthHoursLimit, showingMonday, wdywtdChoice.room_type, ...(wdywtdChoice.room_type.localeCompare("conference") === 0 ? [wdywtdChoice.room_id] : []), account_id[0].account_id], (err, result) => {
                                if (err) {
                                    console.log(err);
                                    res.send({ message: "Caricamento quantità di slots prenotabili non riuscito" });
                                }
                                else
                                    res.send(result);
                            });
                    }
                    else
                        res.send({ message: "Caricamento quantità di slots prenotabili non riuscito: ID utente non trovato" });
                });
            }
            else
                res.send({ message: "Caricamento quantità di slots prenotabili non riuscito: dati non validi" });
        }
        else
            res.send({ message: "Caricamento quantità di slots prenotabili non riuscito: utente non autorizzato" });
    });
});

app.get("/api/getRoomSeatsNr/:id&tkn=:token", (req, res) => {
    const id = req.params.id;
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento dati capienza sala non riuscito: non è possibile ottenere informazioni sulla capienza delle sale" });
        }
        else if (data > 0 && is_user === 1) {
            dbreservations.query("SELECT seats_nr FROM rooms WHERE ? = room_id", [id], (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({ message: "Caricamento dati capienza sala non riuscito" });
                }
                else
                    res.send(result);
            });
        }
        else
            res.send({ message: "Caricamento dati capienza sala non riuscito: utente non autorizzato" });
    });
});

app.post("/api/askForReservation/:token", isReservationsMiddlewareLockedMiddlewareCheck, (req, res) => {
    const wdywtdChoice = req.body.wdywtdChoice;
    const selectedDayTimes = req.body.selectedDayTimes;
    const topic = req.body.topic;
    const participantsNr = req.body.participantsNr;
    const needsTechnicalAssistance = req.body.needsTechnicalAssistance;
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            isReservationsMiddlewareLocked = false;
            res.send({ message: "Prenotazione non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 1) {
            if (
                typeof wdywtdChoice === "object" && !Array.isArray(wdywtdChoice) && wdywtdChoice !== null && Object.keys(wdywtdChoice).length > 0
                &&
                Array.isArray(selectedDayTimes) && selectedDayTimes.length > 0 &&
                selectedDayTimes.every(value => isDate(value.slot_day, { format: "MM/DD/YYYY" }) && isTime(value.slot_start_time, { format: "HH:mm" }) && moment(value.slot_day + " " + value.slot_start_time, "MM/DD/YYYY HH:mm").isAfter(moment()))
                &&
                (wdywtdChoice.room_type && (wdywtdChoice.room_type.localeCompare("conference") === 0 ?
                    (
                        wdywtdChoice.room_id && Number.isInteger(wdywtdChoice.room_id) && wdywtdChoice.room_id > 0
                        &&
                        topic && topic.length > 0 && topic.length <= 1000
                        &&
                        participantsNr > 0
                        &&
                        (needsTechnicalAssistance === true || needsTechnicalAssistance === false)
                    )
                    :
                    (wdywtdChoice.room_type && ["call", "smart working"].includes(wdywtdChoice.room_type))
                ))
            ) {
                dbreservations.query(
                    `
                    SELECT account_id, a.name AS name, a.surname AS surname, mail, IF(contract_dt IS NOT NULL, COALESCE(t.pre_renew_reservations_count, 0) + COALESCE(t.post_renew_reservations_count, 0), COALESCE(t.pre_renew_reservations_count, 0)) AS all_reservations_count, (COALESCE(t.post_renew_reservations_count, 0) + COALESCE(t.before_current_year, 0)) AS post_renew_reservations_count
                    FROM accounts a
                    LEFT JOIN
                    (
                        SELECT accounts.account_id AS t_account_id,
                        COUNT(CASE WHEN (accounts.contract_dt IS NULL OR (CONCAT(slot_day, " ", slot_start_time) < DATE_FORMAT(accounts.contract_dt, "%Y-%m-%d %H:00:00"))) THEN 1 END) AS pre_renew_reservations_count,
                        COUNT(CASE WHEN (accounts.contract_dt IS NOT NULL AND CONCAT(slot_day, " ", slot_start_time) >= DATE_FORMAT(accounts.contract_dt, "%Y-%m-%d %H:00:00")) THEN 1 END) AS post_renew_reservations_count,
                        COUNT(CASE WHEN (accounts.contract_dt IS NOT NULL AND DATE_FORMAT(accounts.contract_dt, "%Y-%m-%d %H:00:00") < DATE_FORMAT(NOW(), "%Y-01-01 00:00:00") AND CONCAT(slot_day, " ", slot_start_time) >= DATE_FORMAT(accounts.contract_dt, "%Y-%m-%d %H:00:00") AND slot_day < DATE_FORMAT(NOW(), "%Y-01-01")) THEN 1 END) AS before_current_year                                                                 
                        FROM accounts 
                        JOIN slots USING (account_id) 
                        JOIN rooms USING (room_id)
                        WHERE is_user IS TRUE AND room_type <> "conference"
                        GROUP BY accounts.account_id
                    ) t
                    ON a.account_id = t.t_account_id
                    WHERE ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_user)`
                    , [token], (err, account_id) => {
                        if (err) {
                            console.log(err);
                            isReservationsMiddlewareLocked = false;
                            res.send({ message: "Controllo ID utente non riuscito" });
                        }
                        else if (account_id.length > 0) {
                            const selectedDayTimesUniqueYearsMonths = [...new Set(selectedDayTimes.map(dt => moment(dt.slot_day, "MM/DD/YYYY").format("YYYY-MM")))];
                            const dayTimesPerYearMonth = {};

                            selectedDayTimes.forEach((dt) => {
                                const yearMonth = moment(dt.slot_day, "MM/DD/YYYY").format("YYYY-MM");

                                if (!dayTimesPerYearMonth[yearMonth])
                                    dayTimesPerYearMonth[yearMonth] = 1;
                                else
                                    dayTimesPerYearMonth[yearMonth]++;
                            });

                            dbreservations.query(
                                `
                            SELECT ym.yearMonth, 
                            (
                            SELECT COUNT(*)
                            FROM slots
                            JOIN rooms USING (room_id)
                            WHERE
                            DATE_FORMAT(slot_day, "%Y-%m") = ym.yearMonth
                            AND room_type = ?` + (wdywtdChoice.room_type.localeCompare("conference") === 0 ? ` AND slots.room_id = ? ` : ``) + `
                            AND account_id = ?
                            AND is_allowed <> -1
                            GROUP BY DATE_FORMAT(slot_day, "%Y-%m")
                            ) AS reservedSlots
                            FROM
                            (` + selectedDayTimesUniqueYearsMonths.map(dt => `SELECT "${dt}" AS yearMonth`).join(" UNION ") + `) AS ym;
                            `,
                                [wdywtdChoice.room_type, ...(wdywtdChoice.room_type.localeCompare("conference") === 0 ? [wdywtdChoice.room_id] : []), account_id[0].account_id],
                                (err, usedSlots) => {
                                    if (err) {
                                        console.log(err);
                                        isReservationsMiddlewareLocked = false;
                                        res.send({ message: "Prenotazione non riuscita: non è possibile controllare le ore rimanenti" });
                                    }
                                    else if (selectedDayTimesUniqueYearsMonths.every(uym => ((wdywtdChoice.room_type.localeCompare("conference") === 0 ? conferenceMonthHoursLimitPerRoom : smartworkingAndCallMonthHoursLimit) - (usedSlots.find(us => us.yearMonth.localeCompare(uym) === 0)).reservedSlots - dayTimesPerYearMonth[uym]) >= 0)) {
                                        dbreservations.query(
                                            `
                                        SELECT slot_day, slot_start_time
                                        FROM slots ssup JOIN rooms USING (room_id)
                                        WHERE
                                        CONCAT(slot_day, " ", slot_start_time) > NOW()
                                        AND NOT EXISTS (
                                            SELECT ssub.slot_id
                                            FROM slots ssub
                                            WHERE ssub.slot_day = ssup.slot_day
                                                AND ssub.slot_start_time = ssup.slot_start_time
                                                AND ssub.account_id = ?
                                                AND ssub.is_allowed <> -1
                                        )
                                        AND room_type = ?` + (wdywtdChoice.room_type.localeCompare("conference") === 0 ? ` AND ssup.room_id = ? ` : ``) +
                                            `AND ((room_type IN ("smart working", "call") AND ssup.account_id IS NULL AND ssup.coworker_id IS NULL) OR (room_type = "conference" AND ((ssup.account_id IS NOT NULL AND is_allowed = -1) OR (ssup.account_id IS NULL AND is_allowed = 0)))) IS TRUE`,
                                            [account_id[0].account_id, wdywtdChoice.room_type, ...(wdywtdChoice.room_type.localeCompare("conference") === 0 ? [wdywtdChoice.room_id] : [])],
                                            (err, freeSlots) => {
                                                if (err) {
                                                    console.log(err);
                                                    isReservationsMiddlewareLocked = false;
                                                    res.send({ message: "Prenotazione non riuscita: non è possibile controllare la capienza della sala" });
                                                }
                                                else {
                                                    const fsArr = freeSlots.map(obj => moment(obj.slot_day).format("MM/DD/YYYY") + " " + obj.slot_start_time.slice(0, -3));
                                                    if (selectedDayTimes.every(dt => fsArr.includes(dt.slot_day + " " + dt.slot_start_time))) {
                                                        dbreservations.query(
                                                            "SELECT seats_nr FROM rooms WHERE room_type = ?" + (wdywtdChoice.room_type.localeCompare("conference") === 0 ? " AND room_id = ?" : ""),
                                                            [wdywtdChoice.room_type, ...(wdywtdChoice.room_type.localeCompare("conference") === 0 ? [wdywtdChoice.room_id] : [])],
                                                            (err, nrOfSeats) => {
                                                                if (err) {
                                                                    console.log(err);
                                                                    isReservationsMiddlewareLocked = false;
                                                                    res.send({ message: "Prenotazione non riuscita: non è possibile controllare la capienza della sala" });
                                                                }
                                                                else if (nrOfSeats.length > 0) {
                                                                    if (participantsNr <= nrOfSeats[0].seats_nr) {
                                                                        dbreservations.query(
                                                                            `
                                                                        UPDATE slots
                                                                        SET account_id = ?` + (wdywtdChoice.room_type.localeCompare("conference") === 0 ? `, is_allowed = 0, participants_nr = ?, topic = ?, needs_technical_assistance = ?, request_datetime = NOW()` : ``) +
                                                                            `
                                                                        WHERE CONCAT(slot_day, " ", slot_start_time) IN (` + selectedDayTimes.map(value => `"${moment(value.slot_day, "MM/DD/YYYY").format("YYYY-MM-DD")} ${value.slot_start_time}:00"`).join(", ") + `)
                                                                        AND slot_id = (
                                                                        SELECT slot_id
                                                                        FROM slots s JOIN rooms ON (s.room_id = rooms.room_id)
                                                                        WHERE s.slot_day = slots.slot_day AND s.slot_start_time = slots.slot_start_time
                                                                        AND CONCAT(s.slot_day, " ", s.slot_start_time) > NOW()
                                                                        AND room_type = ?` + (wdywtdChoice.room_type.localeCompare("conference") === 0 ? ` AND s.room_id = ?` : ``) +
                                                                            `
                                                                        AND ((room_type IN ("smart working", "call") AND s.account_id IS NULL AND s.coworker_id IS NULL) OR (room_type = "conference" AND ((s.account_id IS NOT NULL AND s.is_allowed = -1) OR (s.account_id IS NULL AND s.is_allowed = 0)))) IS TRUE
                                                                        ORDER BY CONCAT(s.slot_day, " ", s.slot_start_time) ASC
                                                                        LIMIT 1
                                                                        )
                                                                        `,
                                                                            [
                                                                                account_id[0].account_id,
                                                                                ...(wdywtdChoice.room_type.localeCompare("conference") === 0 ? [participantsNr, topic, needsTechnicalAssistance] : []),
                                                                                wdywtdChoice.room_type,
                                                                                ...(wdywtdChoice.room_type.localeCompare("conference") === 0 ? [wdywtdChoice.room_id] : [])
                                                                            ], (err, retVal) => {
                                                                                if (err) {
                                                                                    console.log(err);
                                                                                    isReservationsMiddlewareLocked = false;
                                                                                    res.send({ message: "Controllo ID utente non riuscito" });
                                                                                }
                                                                                else {
                                                                                    if (wdywtdChoice.room_type.localeCompare("conference") === 0) {
                                                                                        dbreservations.query("SELECT name, surname, mail FROM accounts WHERE is_user = 0", [token], (err, admins) => {
                                                                                            if (err)
                                                                                                console.log(err);
                                                                                            else {
                                                                                                admins.map(admin => {
                                                                                                    var mailOptions = {
                                                                                                        from: account_id[0].mail,
                                                                                                        to: admin.mail,
                                                                                                        subject: "Nuova richiesta di prenotazione",
                                                                                                        html: "Gentile " + admin.name + " " + admin.surname + ",<br/><br/>Stai ricevendo questa mail perché un utente ha effettuato una prenotazione che richiede di essere gestita tramite <a title=\"Accedi alla webapp\" href=\"//officinedigitali.fcc.veneto.it/SmartLabAmministratore\" target=\"_blank\" rel=\"noopener noreferrer\">l'apposita piattaforma</a>.<br/><br/>Cordiali saluti"
                                                                                                    };
                                                                                                    transporterPrenotazioniHub.sendMail(mailOptions, (error, info) => {
                                                                                                        if (error)
                                                                                                            console.log(error);
                                                                                                    });
                                                                                                });
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                    else {
                                                                                        dbreservations.query(
                                                                                            `
                                                                                            SELECT contract_dt, contract_dt IS NOT NULL AS has_contract, IF(contract_dt IS NOT NULL, COALESCE(t.pre_renew_reservations_count, 0) + COALESCE(t.post_renew_reservations_count, 0), COALESCE(t.pre_renew_reservations_count, 0)) AS all_reservations_count, (COALESCE(t.post_renew_reservations_count, 0) + COALESCE(t.before_current_year, 0)) AS post_renew_reservations_count
                                                                                            FROM accounts a
                                                                                            LEFT JOIN
                                                                                            (
                                                                                                SELECT accounts.account_id AS t_account_id,
                                                                                                COUNT(CASE WHEN (accounts.contract_dt IS NULL OR (CONCAT(slot_day, " ", slot_start_time) < DATE_FORMAT(accounts.contract_dt, "%Y-%m-%d %H:00:00"))) THEN 1 END) AS pre_renew_reservations_count,
                                                                                                COUNT(CASE WHEN (accounts.contract_dt IS NOT NULL AND CONCAT(slot_day, " ", slot_start_time) >= DATE_FORMAT(accounts.contract_dt, "%Y-%m-%d %H:00:00")) THEN 1 END) AS post_renew_reservations_count,
                                                                                                COUNT(CASE WHEN (accounts.contract_dt IS NOT NULL AND DATE_FORMAT(accounts.contract_dt, "%Y-%m-%d %H:00:00") < DATE_FORMAT(NOW(), "%Y-01-01 00:00:00") AND CONCAT(slot_day, " ", slot_start_time) >= DATE_FORMAT(accounts.contract_dt, "%Y-%m-%d %H:00:00") AND slot_day < DATE_FORMAT(NOW(), "%Y-01-01")) THEN 1 END) AS before_current_year
                                                                                                FROM accounts 
                                                                                                JOIN slots USING (account_id) 
                                                                                                JOIN rooms USING (room_id)
                                                                                                WHERE is_user IS TRUE AND room_type <> "conference"
                                                                                                GROUP BY accounts.account_id
                                                                                            ) t
                                                                                            ON a.account_id = t.t_account_id
                                                                                            WHERE account_id = ?
                                                                                            `, [account_id[0].account_id], (err, cur_counters) => {
                                                                                            if (err)
                                                                                                console.log(err);
                                                                                            else {
                                                                                                if (
                                                                                                    cur_counters[0].has_contract === 1 ?
                                                                                                        (!(moment().isSame(moment(cur_counters[0].contract_dt).format("YYYY-MM-DD"), "year")) && account_id[0].post_renew_reservations_count < nForWarning && cur_counters[0].post_renew_reservations_count >= nForWarning)
                                                                                                        :
                                                                                                        (account_id[0].all_reservations_count < nForWarning && cur_counters[0].all_reservations_count >= nForWarning)
                                                                                                )
                                                                                                    dbreservations.query("SELECT name, surname, mail FROM accounts WHERE is_user = 0", [token], (err, admins) => {
                                                                                                        if (err)
                                                                                                            console.log(err);
                                                                                                        else {
                                                                                                            admins.map(admin => {
                                                                                                                var mailOptions = {
                                                                                                                    from: account_id[0].mail,
                                                                                                                    to: admin.mail,
                                                                                                                    subject: "Consiglio contrattualizzazione smart-worker",
                                                                                                                    html: "Gentile " + admin.name + " " + admin.surname + ",<br/><br/>Stai ricevendo questa mail perché lo smart-worker " + account_id[0].name + " " + account_id[0].surname + " ha almeno " + nForWarning + " ore a lui associate, perciò si consiglia di contrattualizzarlo tramite <a title=\"Accedi alla webapp\" href=\"//officinedigitali.fcc.veneto.it/SmartLabCMS\" target=\"_blank\" rel=\"noopener noreferrer\">l'apposita piattaforma</a>.<br/><br/>Cordiali saluti"
                                                                                                                };
                                                                                                                transporterPrenotazioniHub.sendMail(mailOptions, (error, info) => {
                                                                                                                    if (error)
                                                                                                                        console.log(error);
                                                                                                                });
                                                                                                            });
                                                                                                        }
                                                                                                    });
                                                                                            }
                                                                                        });
                                                                                    }

                                                                                    isReservationsMiddlewareLocked = false;
                                                                                    res.send({ messageOk: "Prenotazione effettuata" });
                                                                                }
                                                                            });
                                                                    }
                                                                    else {
                                                                        isReservationsMiddlewareLocked = false;
                                                                        res.send({ message: "Prenotazione non riuscita: il numero di partecipanti non deve superare la capienza della sala" });
                                                                    }
                                                                }
                                                                else {
                                                                    isReservationsMiddlewareLocked = false;
                                                                    res.send({ message: "Prenotazione non riuscita: dati non validi" });
                                                                }
                                                            }
                                                        );
                                                    }
                                                    else {
                                                        isReservationsMiddlewareLocked = false;
                                                        res.send({ message: "Prenotazione non riuscita: dati non validi" });
                                                    }
                                                }
                                            }
                                        );
                                    }
                                    else {
                                        isReservationsMiddlewareLocked = false;
                                        res.send({ message: "Prenotazione non riuscita: il limite di ore prenotabili per un certo mese verrebbe superato" });
                                    }
                                }
                            );
                        }
                        else {
                            isReservationsMiddlewareLocked = false;
                            res.send({ message: "Prenotazione non riuscita: ID utente non trovato" });
                        }
                    });
            }
            else {
                isReservationsMiddlewareLocked = false;
                res.send({ message: "Prenotazione non riuscita: dati non validi" });
            }
        }
        else {
            isReservationsMiddlewareLocked = false;
            res.send({ message: "Prenotazione non riuscita: utente non autorizzato" });
        }
    });
});

app.put("/api/freeReservations/:token", isReservationsMiddlewareLockedMiddlewareCheck, (req, res) => {
    const slots_arr = req.body.slots_arr;
    const token = req.params.token;
    const hrs = 24;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            isReservationsMiddlewareLocked = false;
            res.send({ message: "Disdicimento prenotazioni non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 1) {
            if (!Array.isArray(slots_arr) || slots_arr.length === 0 || !slots_arr.every(value => typeof value === "number" && Number.isInteger(value))) {
                isReservationsMiddlewareLocked = false;
                res.send({ message: "Disdicimento prenotazioni non riuscito: dati non validi" });
            }
            else {
                dbreservations.query("SELECT account_id FROM accounts WHERE ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_user)", [token], (err, result) => {
                    if (err) {
                        console.log(err);
                        isReservationsMiddlewareLocked = false;
                        res.send({ message: "Controllo ID utente non riuscito" });
                    }
                    else if (result.length > 0) {
                        var msg = null;
                        dbreservations.query("SELECT slot_id FROM slots WHERE slot_id IN (" + slots_arr.join(", ") + ") AND account_id <> ?", [result[0].account_id], (err, notMine) => {
                            if (err) {
                                console.log(err);
                                msg = "Disdicimento prenotazioni non riuscito: non è possibile controllare gli utenti associati";
                            }
                            else if (notMine.length > 0)
                                msg = "Disdicimento prenotazioni non riuscito: gli slot non devono essere associati ad altri utenti";
                            if (msg) {
                                isReservationsMiddlewareLocked = false;
                                res.send({ message: msg });
                            }
                            else {
                                dbreservations.query("SELECT slot_start_time, slot_day FROM slots WHERE slot_id IN (" + slots_arr.join(", ") + ")", [], (err, slotDateTime) => {
                                    if (err) {
                                        console.log(err);
                                        msg = "Disdicimento prenotazioni non riuscito: non è possibile controllare se il periodo utile per disdire è passato";
                                    }
                                    else if (slotDateTime.length > 0) {
                                        if (slotDateTime.some(s => (((new Date(moment(s.slot_day).format("YYYY-MM-DD") + "T" + s.slot_start_time)).getTime() - new Date().getTime()) < (hrs * 3600000))))
                                            msg = "Disdicimento prenotazioni non riuscito: il periodo utile per disdire è passato";
                                    }
                                    else
                                        msg = "Disdicimento prenotazioni non riuscito: prenotazione non trovata";
                                    if (msg) {
                                        isReservationsMiddlewareLocked = false;
                                        res.send({ message: msg });
                                    }
                                    else {
                                        dbreservations.query("UPDATE slots SET account_id = NULL, is_allowed = 0, participants_nr = 0, topic = NULL, needs_technical_assistance = 0, request_datetime = NULL WHERE slot_id IN (" + slots_arr.join(", ") + ")", [], (err, result) => {
                                            if (err) {
                                                console.log(err);
                                                isReservationsMiddlewareLocked = false;
                                                res.send({ message: "Disdicimento prenotazioni non riuscito" });
                                            }
                                            else {
                                                isReservationsMiddlewareLocked = false;
                                                res.send({ messageOk: "Disdicimento prenotazioni riuscito" });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                    else {
                        isReservationsMiddlewareLocked = false;
                        res.send({ message: "Disdicimento prenotazioni non riuscito: ID utente non trovato" });
                    }
                });
            }
        }
        else {
            isReservationsMiddlewareLocked = false;
            res.send({ message: "Disdicimento prenotazioni non riuscito: utente non autorizzato" });
        }
    });
});

app.get("/api/getConferenceReservations/:allowed&tkn=:token", (req, res) => {
    const allowed = req.params.allowed;
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento dati non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 0) {
            if (allowed === "1" || allowed === "0") {
                dbreservations.query(
                    `SELECT slot_id, slot_start_time, slot_end_time, slot_day, room_id, room_name, room_name_updatable, room_type, room_description, accounts.account_id AS account_id, name, surname, mail, participants_nr, topic, needs_technical_assistance, request_datetime
                FROM slots JOIN rooms USING (room_id) JOIN accounts USING (account_id)
                WHERE room_type = "conference" AND account_id IS NOT NULL AND is_allowed = ? AND CONCAT(slot_day, ' ', slot_start_time) > NOW()
                ORDER BY CONCAT(slot_day, ' ', slot_start_time) ASC`, [Number(allowed)], (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send({ message: "Caricamento dati non riuscito" });
                    }
                    else
                        res.send(result);
                });
            }
            else
                res.send({ message: "Caricamento dati non riuscito: dati non validi" });
        }
        else
            res.send({ message: "Caricamento dati non riuscito: utente non autorizzato" });
    });
});

app.put("/api/manageConferenceReservations/:accepted&tkn=:token", isReservationsMiddlewareLockedMiddlewareCheck, (req, res) => {
    const accepted = req.params.accepted;
    const slots_arr = req.body.slots_arr;
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            isReservationsMiddlewareLocked = false;
            res.send({ message: "Gestione richiesta di prenotazione non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 0) {
            if ((accepted !== "1" && accepted !== "-1") || !Array.isArray(slots_arr) || slots_arr.length === 0 || !slots_arr.every(value => typeof value === "number" && Number.isInteger(value))) {
                isReservationsMiddlewareLocked = false;
                res.send({ message: "Gestione richiesta di prenotazione non riuscita: dati non validi" });
            }
            else {
                dbreservations.query("UPDATE slots SET is_allowed = ? WHERE slot_id IN (" + slots_arr.join(", ") + ")", [Number(accepted)], (err, result) => {
                    if (err) {
                        console.log(err);
                        isReservationsMiddlewareLocked = false;
                        res.send({ message: "Gestione richiesta di prenotazione non riuscita" });
                    }
                    else {
                        dbreservations.query("SELECT mail, name, surname, topic, request_datetime, slot_day FROM accounts JOIN slots USING (account_id) WHERE slot_id = ?", [slots_arr[0]], (err, mailInfo) => {
                            if (err) {
                                console.log(err);
                                isReservationsMiddlewareLocked = false;
                                res.send({ messageOk: "Gestione richiesta di prenotazione riuscita, invio mail a " + mailInfo[0].mail + " non riuscito" });
                            }
                            else if (mailInfo.length > 0) {
                                var mailOptions = {
                                    from: fromAddressPrenotazioniHub,
                                    to: mailInfo[0].mail,
                                    subject: "Aggiornamento su una prenotazione richiesta il " + moment(mailInfo[0].request_datetime, "MM/DD/YYYY HH:mm:ss").format("D/M/YYYY"),
                                    html: "Gentile " + mailInfo[0].name + " " + mailInfo[0].surname + ",<br/><br/>" + (accepted > 0 ? "La" : "Siamo spiacenti di comunicare che la") + " prenotazione richiesta il giorno " + moment(mailInfo[0].request_datetime, "MM/DD/YYYY HH:mm:ss").format("D/M/YYYY") + " alle ore " + moment(mailInfo[0].request_datetime, "MM/DD/YYYY HH:mm:ss").format("HH:mm") + " utilizzando il <a title=\"Accedi alla webapp\" href=\"//officinedigitali.fcc.veneto.it/SmartLab\" target=\"_blank\" rel=\"noopener noreferrer\">portale di prenotazione posti per l'Innovation Lab del Camposampierese</a> e prevista per il giorno " + moment(mailInfo[0].slot_day, "MM/DD/YYYY HH:mm:ss").format("D/M/YYYY") + " è stata " + (accepted > 0 ? "accettata" : "rifiutata") + ".<br/> Il topic era il seguente: " + mailInfo[0].topic + ".<br/><br/>Per ulteriori informazioni, rispondere a questa mail o contattare il numero <a title=\"Chiama " + prenotazioniHubFederazionePhone + "\" href=\"tel:+39" + prenotazioniHubFederazionePhone + "\">" + prenotazioniHubFederazionePhone + "</a>.<br/><br/>Cordiali saluti"
                                };
                                transporterPrenotazioniHub.sendMail(mailOptions, (error, info) => {
                                    if (error) {
                                        console.log(error);
                                        isReservationsMiddlewareLocked = false;
                                        res.send({ messageOk: "Gestione richiesta di prenotazione riuscita, invio mail a " + mailInfo[0].mail + " non riuscito" });
                                    }
                                    else {
                                        isReservationsMiddlewareLocked = false;
                                        res.send({ messageOk: "Gestione richiesta di prenotazione riuscita, invio mail a " + mailInfo[0].mail + " riuscito" });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
        else {
            isReservationsMiddlewareLocked = false;
            res.send({ message: "Gestione richiesta di prenotazione non riuscita: utente non autorizzato" });
        }
    });
});

app.get("/api/getOccupancy/:token", (req, res) => {
    const dt = req.query.dt;
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento dati non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 0) {
            if (!dt) {
                dbreservations.query(
                    `
                    SELECT room_type, room_name, room_name_updatable, participants_nr, seats_nr, is_allowed, account_id, coworker_id
                    FROM slots JOIN rooms USING (room_id)
                    WHERE slot_day = CURDATE()
                    AND ? BETWEEN slot_start_time AND slot_end_time
                    `,
                    [moment().format("HH:00:01")], (err, result) => {
                        if (err) {
                            console.log(err);
                            res.send({ message: "Caricamento dati non riuscito" });
                        }
                        else
                            res.send(result);
                    });
            }
            else if (moment(dt, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
                dbreservations.query(
                    `
                    SELECT room_type, room_name, room_name_updatable, participants_nr, seats_nr, is_allowed, account_id, coworker_id
                    FROM slots JOIN rooms USING (room_id)
                    WHERE slot_day = ?
                    AND ? BETWEEN slot_start_time AND slot_end_time
                    `,
                    [moment(dt).format("YYYY-MM-DD"), moment(dt).format("HH:00:01")], (err, result) => {
                        if (err) {
                            console.log(err);
                            res.send({ message: "Caricamento dati non riuscito" });
                        }
                        else
                            res.send(result);
                    });
            }
            else
                res.send({ message: "Caricamento dati non riuscito: dati non validi" });
        }
        else
            res.send({ message: "Caricamento dati non riuscito: utente non autorizzato" });
    });
});

app.get("/api/getHubReports/:token", (req, res) => {
    const token = req.params.token;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Caricamento segnalazioni non riuscito: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 1) {
            dbreservations.query("SELECT reports.*, room_name_updatable FROM reports JOIN rooms USING (room_id) WHERE account_id = (SELECT account_id FROM accounts WHERE ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_user)) AND report_date_time >= DATE_SUB(CONCAT(CURDATE(), ' ', CURTIME()), INTERVAL 20 DAY) ORDER BY report_date_time DESC", [token], (err, result) => {
                if (err) {
                    console.log(err);
                    res.send({ message: "Caricamento segnalazioni non riuscito" });
                }
                else
                    res.send(result);
            });
        }
        else
            res.send({ message: "Caricamento segnalazioni non riuscito: utente non autorizzato" });
    });
});

app.post("/api/addHubReports/:token", upload.array("images"), (req, res) => {
    const report_title = req.body.report_title && req.body.report_title.length > 0 ? req.body.report_title.trim() : null;
    const report_description = req.body.report_description && req.body.report_description.length > 0 ? req.body.report_description.trim() : null;
    const selectedRoomId = Number(req.body.selectedRoomId);
    const images = req.files;
    const token = req.params.token;
    const maxImagesWeight = 26214400;
    const imagesQty = 3;

    calcTokenReservations(token, (err, data, is_user) => {
        if (err && data == -1) {
            console.log(err);
            res.send({ message: "Aggiunta della segnalazione non riuscita: non è possibile controllare se l'utente è autorizzato" });
        }
        else if (data > 0 && is_user === 1) {
            if (!report_title || report_title.length > 200 || !report_description || report_description.length > 1000 || !(typeof selectedRoomId === "number") || !Number.isInteger(selectedRoomId))
                res.send({ message: "Aggiunta della segnalazione non riuscita: dati non validi" });
            else {
                dbreservations.query("SELECT room_name_updatable FROM rooms WHERE room_id IN (?)", [selectedRoomId], (err, r) => {
                    if (err) {
                        console.log(err);
                        res.send({ message: "Aggiunta della segnalazione non riuscita" });
                    }
                    else if (r.length > 0) {
                        if (images.length > 0) {
                            const filesSize = images.reduce((totSize, el) => totSize + el.size, 0);
                            if (images.length > imagesQty || filesSize > maxImagesWeight)
                                res.send({ message: "Aggiunta della segnalazione non riuscita: le immagini sono più di " + imagesQty + " o hanno un peso troppo alto per poter essere caricate e inviate (max. " + (maxImagesWeight / 1048576) + "MB)" });
                            else if (images.some(el => el.mimetype.localeCompare("image/jpeg") !== 0))
                                res.send({ message: "Aggiunta della segnalazione non riuscita: sono accettate solo immagini jpeg" });
                            else {
                                dbreservations.query("INSERT INTO reports (report_date_time, report_title, report_description, room_id, account_id) VALUES (NOW(),?,?,?,(SELECT account_id FROM accounts WHERE ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_user)))", [report_title, report_description, selectedRoomId, token], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        res.send({ message: "Aggiunta della segnalazione non riuscita" });
                                    }
                                    else {
                                        const failMessageOk = "Aggiunta della segnalazione riuscita, mail non inviata: per favore, inviare gli allegati via mail a " + fromAddressSegnalazioniHub + " specificando il titolo della segnalazione e la data odierna";

                                        dbreservations.query("SELECT mail, name, surname FROM accounts WHERE ? = CONCAT(SHA1(CONCAT(mail, ' ')), password, is_user)", [token], (err, result) => {
                                            if (err) {
                                                console.log(err);
                                                res.send({ messageOknm: failMessageOk });
                                            }
                                            else if (result.length > 0) {
                                                var mailOptions = {
                                                    from: result[0].mail,
                                                    to: fromAddressSegnalazioniHub,
                                                    subject: "Nuova segnalazione (" + report_title + ")",
                                                    html: result[0].name + " " + result[0].surname + " ha aggiunto una nuova segnalazione.<br/><br/>Titolo: " + report_title + "<br/><br/>Descrizione della segnalazione: <p style=\"white-space: pre-line\">" + report_description + "</p><br/><br/>Sala: " + r[0].room_name_updatable + "<br/>",
                                                    attachments: images.map(image => ({
                                                        filename: image.originalname,
                                                        content: image.buffer,
                                                        contentType: "image/jpeg"
                                                    }))
                                                };
                                                transporterSegnalazioniHub.sendMail(mailOptions, (error, info) => {
                                                    if (error) {
                                                        console.log(error);
                                                        res.send({ messageOknm: failMessageOk });
                                                    }
                                                    else
                                                        res.send({ messageOk: "Aggiunta della segnalazione riuscita" });
                                                });
                                            }
                                            else
                                                res.send({ messageOknm: failMessageOk });
                                        });
                                    }
                                });
                            }
                        }
                        else
                            res.send({ message: "Aggiunta della segnalazione non riuscita: è necessario allegare almeno un'immagine" });
                    }
                    else
                        res.send({ message: "Aggiunta della segnalazione non riuscita: sala non trovata" });
                });
            }
        }
        else
            res.send({ message: "Aggiunta della segnalazione non riuscita: utente non autorizzato" });
    });
});


app.listen(PORT, _ =>
    console.log(`Server is running on ${PORT}`)
);