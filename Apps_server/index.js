const express = require("express");
const db = require("./config/db");
const dbusers = require("./config/dbusers");
const cors = require("cors");
const fs = require("fs");
const app = express();
const PORT = 3002;

function calcToken(token, callback) {
    dbusers.query("SELECT username FROM users WHERE ? = CONCAT(SHA1(CONCAT(username, ' ')), password)", [token], (err, result) => {
        if (err)
            callback(err, -1);
        else
            callback(null, result.length);
    });
}

app.use(cors({
    methods: ["DELETE", "GET", "POST", "PUT"],
    credentials: true,
}));
app.use(express.json());
app.use(express.static("files"));


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
                "SELECT p.*, nfrom.nome AS nome_nazione_in_viaggio_da, cfrom.provincia AS provincia_comune_in_viaggio_da, cfrom.nome AS nome_comune_in_viaggio_da, nto.nome AS nome_nazione_destinazione, cto.provincia AS provincia_comune_destinazione, cto.nome AS nome_comune_destinazione FROM passaggi p LEFT JOIN nazioni nfrom ON p.nazione_in_viaggio_da = nfrom.iso_3166_1_alpha_3 LEFT JOIN comuni cfrom ON p.comune_in_viaggio_da = cfrom.codice_istat LEFT JOIN nazioni nto ON p.nazione_destinazione = nto.iso_3166_1_alpha_3 LEFT JOIN comuni cto ON p.comune_destinazione = cto.codice_istat WHERE p.deleted = 0 ORDER BY CASE WHEN DATE(p.data_inserimento_operatore) = CURDATE() THEN p.data_inserimento_operatore END DESC, CASE WHEN DATE(p.data_inserimento_operatore) <> CURDATE() THEN DATE(p.data_inserimento_operatore) END DESC, p.nome ASC",
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
                "SELECT p.*, nfrom.nome AS nome_nazione_in_viaggio_da, cfrom.provincia AS provincia_comune_in_viaggio_da, cfrom.nome AS nome_comune_in_viaggio_da, nto.nome AS nome_nazione_destinazione, cto.provincia AS provincia_comune_destinazione, cto.nome AS nome_comune_destinazione FROM passaggi p LEFT JOIN nazioni nfrom ON p.nazione_in_viaggio_da = nfrom.iso_3166_1_alpha_3 LEFT JOIN comuni cfrom ON p.comune_in_viaggio_da = cfrom.codice_istat LEFT JOIN nazioni nto ON p.nazione_destinazione = nto.iso_3166_1_alpha_3 LEFT JOIN comuni cto ON p.comune_destinazione = cto.codice_istat WHERE p.id_passaggio = ? AND p.deleted = 0",
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

app.listen(PORT, _ =>
    console.log(`Server is running on ${PORT}`)
);