require("dotenv").config();
const express = require("express");
const moment = require("moment");
const cron = require("node-cron");
/*
l'invio mail verrà attivato in futuro

const nodemailer = require("nodemailer");
*/
const jwt = require("jsonwebtoken");
const router = express.Router();
const dbgyms = require("./config/dbgyms");

const jwtPsw = "Apps_server";

/*
l'invio mail verrà attivato in futuro

const fromAddress = "test@mail.com";
const transporter = nodemailer.createTransport({
    host: "host",
    secure: true,
    pool: true,
    maxConnections: 1,
    port: 465,
    auth: {
        user: fromAddress,
        pass: process.env.fromAddressPassword
    }
});

cron.schedule("0 0 13-14 * *", _ => {
    const facilitatoriPalestreURL = "<a title=\"Accedi alla webapp\" href=\"//officinedigitali.fcc.veneto.it/FacilitatoriPalestre\" target=\"_blank\" rel=\"noopener noreferrer\">l' app dei facilitatori per le palestre del Camposampierese</a>";
    const facilitatoriLimitDay = 15;

    dbgyms.query("SELECT facilitator_id, name, surname, mail FROM facilitators", [], (err, facilitators) => {
        if (err)
            console.log(err);
        else
            facilitators.forEach(facilitator => {
                var mailOptions = {
                    from: fromAddress,
                    to: facilitator.mail,
                    subject: "Scadenza gestione ore mensili",
                    html: "Gentile " + facilitator.name + " " + facilitator.surname + ",<br/><br/> ti ricordiamo che la gestione delle ore relative al mese di " + moment().locale("it").add(1, "months").format("MMMM") + " sarà disponibile tramite " + facilitatoriPalestreURL + " fino al giorno " + facilitatoriLimitDay + " del mese corrente.<br/><br/>Cordiali saluti"
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error)
                        console.log(error);
                });
            });
    });
});

cron.schedule("0 0 26-27 * *", _ => {
    const operatoriPalestreURL = "<a title=\"Accedi alla webapp\" href=\"//officinedigitali.fcc.veneto.it/OperatoriPalestre\" target=\"_blank\" rel=\"noopener noreferrer\">l'app degli operatori per le palestre del Camposampierese</a>";
    const operatoriLimitDay = 28;

    dbgyms.query("SELECT operator_id, name, surname, mail FROM operators", [], (err, operators) => {
        if (err)
            console.log(err);
        else
            operators.forEach(operator => {
                var mailOptions = {
                    from: fromAddress,
                    to: operator.mail,
                    subject: "Scadenza gestione ore mensili",
                    html: "Gentile " + operator.name + " " + operator.surname + ",<br/><br/> ti ricordiamo che la gestione delle ore relative al mese di " + moment().locale("it").add(1, "months").format("MMMM") + " sarà disponibile tramite " + operatoriPalestreURL + " fino al giorno " + operatoriLimitDay + " del mese corrente.<br/><br/>Cordiali saluti"
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error)
                        console.log(error);
                });
            });
    });
});
*/

cron.schedule("0 0 1 * *", _ => {
    dbgyms.query("UPDATE facilitators SET fixed_hours_count = fixed_hours_future_count, variable_hours_count = variable_hours_future_count", [], (err, result) => {
        if (err)
            console.log(err);
    });
});

router.post("/api/addFixedAvailability", (req, res) => {
    const facilitator_id = req.body.facilitator_id;
    const gym_id = req.body.gym_id;
    const availability_date = req.body.availability_date;
    const availability_times = req.body.availability_times;

    if (gym_id)
        dbgyms.query(`SELECT * FROM fixed_availabilities_facilitators WHERE facilitator_id = ? AND DATE_FORMAT(availability_date, "%Y-%m") = ?`, [facilitator_id, moment(availability_date).format("YYYY-MM")], (err, passedMonthFixedResults) => {
            if (err) {
                console.log(err);
                res.json({ message: "Aggiunta della disponibilità non riuscita" });
            }
            else {
                const totalCurrentHours = passedMonthFixedResults.map(row => row.availability_times).join(",").split(",").length;
                const selectedDayCurrentHours = passedMonthFixedResults.filter(row => row.gym_id === gym_id && moment(row.availability_date).format("YYYY-MM-DD").localeCompare(moment(availability_date).format("YYYY-MM-DD")) === 0).map(row => row.availability_times).join(",").split(",").length;

                dbgyms.query("SELECT fixed_hours_count FROM facilitators WHERE facilitator_id = ?", [facilitator_id], (err, fhc) => {
                    if (err) {
                        console.log(err);
                        res.json({ message: "Aggiunta della disponibilità non riuscita" });
                    }
                    else {
                        dbgyms.query("SELECT * FROM fixed_availabilities_facilitators WHERE facilitator_id = ? AND gym_id = ? AND availability_date = ?", [facilitator_id, gym_id, availability_date], (err, result) => {
                            if (err) {
                                console.log(err);
                                res.json({ message: "Aggiunta della disponibilità non riuscita" });
                            }
                            else if (result.length === 0) {
                                if (availability_times.length === 0)
                                    res.json({ message: "Aggiunta della disponibilità non riuscita: è necessario selezionare almeno un orario" });
                                else if ((totalCurrentHours + availability_times.split(",").length) > fhc[0].fixed_hours_count)
                                    res.json({ message: "Aggiunta della disponibilità non riuscita: non è possibile indicare più di " + fhc[0].fixed_hours_count + " ore fisse per questo mese" });
                                else
                                    dbgyms.query("INSERT INTO fixed_availabilities_facilitators (facilitator_id, gym_id, availability_date, availability_times) VALUES(?, ?, ?, ?)", [facilitator_id, gym_id, availability_date, availability_times], (err, result) => {
                                        if (err) {
                                            console.log(err);
                                            res.json({ message: "Aggiunta della disponibilità non riuscita" });
                                        }
                                        else
                                            res.json({ messageOk: "Aggiunta della disponibilità riuscita" });
                                    });
                            }
                            else {
                                if (availability_times.length === 0)
                                    dbgyms.query("DELETE FROM fixed_availabilities_facilitators WHERE availability_id = ? ", [result[0].availability_id], (err, result) => {
                                        if (err) {
                                            console.log(err);
                                            res.json({ message: "Aggiunta della disponibilità non riuscita" });
                                        }
                                        else
                                            res.json({ messageOk: "Aggiunta della disponibilità riuscita" });
                                    });
                                else if ((totalCurrentHours - selectedDayCurrentHours + availability_times.split(",").length) > fhc[0].fixed_hours_count)
                                    res.json({ message: "Aggiunta della disponibilità non riuscita: non è possibile indicare più di " + fhc[0].fixed_hours_count + " ore fisse per questo mese" });
                                else
                                    dbgyms.query("UPDATE fixed_availabilities_facilitators SET availability_times = ? WHERE availability_id = ? ", [availability_times, result[0].availability_id], (err, result) => {
                                        if (err) {
                                            console.log(err);
                                            res.json({ message: "Aggiunta della disponibilità non riuscita" });
                                        }
                                        else
                                            res.json({ messageOk: "Aggiunta della disponibilità riuscita" });
                                    });
                            }
                        });
                    }
                });
            }
        });
    else
        res.json({ message: "Aggiunta della disponibilità non riuscita: è necessario selezionare luogo e orario" });
});

router.post("/api/addVariableAvailability", (req, res) => {
    const facilitator_id = req.body.facilitator_id;
    const availability_date = req.body.availability_date;
    const availability_times = req.body.availability_times;

    dbgyms.query(`SELECT * FROM variable_availabilities_facilitators WHERE facilitator_id = ? AND DATE_FORMAT(availability_date, "%Y-%m") = ?`, [facilitator_id, moment(availability_date).format("YYYY-MM")], (err, passedMonthVariableResults) => {
        if (err) {
            console.log(err);
            res.json({ message: "Aggiunta della disponibilità non riuscita" });
        }
        else {
            const totalCurrentHours = passedMonthVariableResults.map(row => row.availability_times).join(",").split(",").length;
            const selectedDayCurrentHours = passedMonthVariableResults.filter(row => moment(row.availability_date).format("YYYY-MM-DD").localeCompare(moment(availability_date).format("YYYY-MM-DD")) === 0).map(row => row.availability_times).join(",").split(",").length;

            dbgyms.query("SELECT variable_hours_count FROM facilitators WHERE facilitator_id = ?", [facilitator_id], (err, vhc) => {
                if (err) {
                    console.log(err);
                    res.json({ message: "Aggiunta della disponibilità non riuscita" });
                }
                else {
                    dbgyms.query("SELECT * FROM variable_availabilities_facilitators WHERE facilitator_id = ? AND availability_date = ?", [facilitator_id, availability_date], (err, result) => {
                        if (err) {
                            console.log(err);
                            res.json({ message: "Aggiunta della disponibilità non riuscita" });
                        }
                        else if (result.length === 0)
                            if (availability_times.length === 0)
                                res.json({ message: "Aggiunta della disponibilità non riuscita: è necessario selezionare almeno un orario" });
                            else if ((totalCurrentHours + availability_times.split(",").length) > vhc[0].variable_hours_count)
                                res.json({ message: "Aggiunta della disponibilità non riuscita: non è possibile indicare più di " + vhc[0].variable_hours_count + " ore a chiamata per questo mese" });
                            else
                                dbgyms.query("INSERT INTO variable_availabilities_facilitators (facilitator_id, availability_date, availability_times) VALUES(?, ?, ?)", [facilitator_id, availability_date, availability_times], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        res.json({ message: "Aggiunta della disponibilità non riuscita" });
                                    }
                                    else
                                        res.json({ messageOk: "Aggiunta della disponibilità riuscita" });
                                });
                        else {
                            if (availability_times.length === 0)
                                dbgyms.query("DELETE FROM variable_availabilities_facilitators WHERE availability_id = ? ", [result[0].availability_id], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        res.json({ message: "Aggiunta della disponibilità non riuscita" });
                                    }
                                    else
                                        res.json({ messageOk: "Aggiunta della disponibilità riuscita" });
                                });
                            else if ((totalCurrentHours - selectedDayCurrentHours + availability_times.split(",").length) > vhc[0].variable_hours_count)
                                res.json({ message: "Aggiunta della disponibilità non riuscita: non è possibile indicare più di " + vhc[0].variable_hours_count + " ore a chiamata per questo mese" });
                            else
                                dbgyms.query("UPDATE variable_availabilities_facilitators SET availability_times = ? WHERE availability_id = ? ", [availability_times, result[0].availability_id], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        res.json({ message: "Aggiunta della disponibilità non riuscita" });
                                    }
                                    else
                                        res.json({ messageOk: "Aggiunta della disponibilità riuscita" });
                                });
                        }
                    });
                }
            });
        }
    });
});

router.post("/api/getFixedAvailabilityForDateGymFacilitator", (req, res) => {
    const facilitator_id = req.body.facilitator_id;
    const gym_id = req.body.gym_id;
    const availability_date = req.body.availability_date;

    dbgyms.query("SELECT availability_times FROM fixed_availabilities_facilitators WHERE facilitator_id = ? AND gym_id = ? AND availability_date = ?", [facilitator_id, gym_id, availability_date], (err, result) => {
        if (err) {
            console.log(err);
            res.json({ message: "Caricamento disponibilità non riuscito" });
        }
        else
            res.json({ result: result.length === 0 ? [] : result[0].availability_times.split(",") });
    });
});

router.post("/api/getFixedAvailabilitiesAllDataForDateFacilitator", (req, res) => {
    const facilitator_id = req.body.facilitator_id;
    const availability_date = req.body.availability_date;

    dbgyms.query("SELECT *, gyms.name AS gym_name FROM fixed_availabilities_facilitators JOIN gyms USING (gym_id) WHERE facilitator_id = ? AND availability_date = ?", [facilitator_id, availability_date], (err, result) => {
        if (err) {
            console.log(err);
            res.json({ message: "Caricamento disponibilità non riuscito" });
        }
        else
            res.json({ result: result });
    });
});

router.post("/api/getVariableAvailabilitiesAllDataForDateFacilitator", (req, res) => {
    const facilitator_id = req.body.facilitator_id;
    const availability_date = req.body.availability_date;

    dbgyms.query(`
            SELECT vaf.availability_times AS availability_times, ao.operator_requested_times AS operator_requested_times, ao.gym_custom_place AS gym_custom_place, ao.notes AS notes
            FROM variable_availabilities_facilitators AS vaf
            LEFT JOIN availabilities_operators AS ao ON vaf.availability_id = ao.variable_availabilities_facilitators_id
            WHERE vaf.facilitator_id = ? AND vaf.availability_date = ?`,
        [facilitator_id, availability_date], (err, result) => {
            if (err) {
                console.log(err);
                res.json({ message: "Caricamento disponibilità non riuscito" });
            }
            else
                res.json({ result: result });
        });
});

router.get("/api/getFacilitatorAllAvailabilities/:fid", (req, res) => {
    const facilitator_id = req.params.fid;

    dbgyms.query(`SELECT *, "fixed" AS row_type, gyms.name AS gym_name, gyms.address AS gym_address FROM fixed_availabilities_facilitators JOIN gyms USING (gym_id) WHERE facilitator_id = ?`, [facilitator_id], (err, fixedResults) => {
        if (err) {
            console.log(err);
            res.json({ message: "Caricamento disponibilità non riuscito" });
        }
        else {
            dbgyms.query(`
                SELECT vaf.*, "variable" AS row_type, ao.gym_custom_place AS gym_custom_place, ao.operator_requested_times AS operator_requested_times, ao.notes AS notes
                FROM variable_availabilities_facilitators AS vaf
                LEFT JOIN availabilities_operators AS ao ON vaf.availability_id = ao.variable_availabilities_facilitators_id
                WHERE vaf.facilitator_id = ?`,
                [facilitator_id], (err, variableResults) => {
                    if (err) {
                        console.log(err);
                        res.json({ message: "Caricamento disponibilità non riuscito" });
                    }
                    else
                        res.json({ result: [...fixedResults, ...variableResults] });
                });
        }
    });
});

router.get("/api/getFacilitatorMonthAvailabilities/:fid&my=:monthYear", (req, res) => {
    const facilitator_id = req.params.fid;
    const monthYear = req.params.monthYear;

    dbgyms.query(`SELECT *, "fixed" AS row_type, gyms.name AS gym_name, gyms.address AS gym_address FROM fixed_availabilities_facilitators JOIN gyms USING (gym_id) WHERE facilitator_id = ? AND DATE_FORMAT(availability_date, "%Y-%m") = ?`, [facilitator_id, monthYear], (err, fixedResults) => {
        if (err) {
            console.log(err);
            res.json({ message: "Caricamento disponibilità non riuscito" });
        }
        else {
            dbgyms.query(`
                SELECT vaf.*, "variable" AS row_type, ao.gym_custom_place AS gym_custom_place, ao.operator_requested_times AS operator_requested_times, ao.notes AS notes
                FROM variable_availabilities_facilitators AS vaf
                LEFT JOIN availabilities_operators AS ao ON vaf.availability_id = ao.variable_availabilities_facilitators_id
                WHERE vaf.facilitator_id = ? AND DATE_FORMAT(vaf.availability_date, "%Y-%m") = ?`,
                [facilitator_id, monthYear], (err, variableResults) => {
                    if (err) {
                        console.log(err);
                        res.json({ message: "Caricamento disponibilità non riuscito" });
                    }
                    else
                        res.json({ result: [...fixedResults, ...variableResults] });
                });
        }
    });
});

router.get("/api/getFacilitatorRequestedAvailabilitiesFromOperator/:oid", (req, res) => {
    const operator_id = req.params.oid;

    dbgyms.query(`
            SELECT facilitator_id, name, surname, mail
            FROM facilitators
            WHERE (
                SELECT gym_id
                FROM operators
                WHERE operator_id = ?
            )
            IN (gym_id_1, gym_id_2, gym_id_3)
        `, [operator_id], (err, result) => {
        if (err) {
            console.log(err);
            res.json({ message: "Caricamento disponibilità non riuscito" });
        }
        else {
            dbgyms.query(`
                    SELECT vaf.*, "variable" AS row_type, ao.operator_requested_times AS operator_requested_times, ao.gym_custom_place AS gym_custom_place, ao.notes AS notes
                    FROM variable_availabilities_facilitators AS vaf
                    JOIN availabilities_operators AS ao ON vaf.availability_id = ao.variable_availabilities_facilitators_id
                    WHERE ao.operator_id = ? AND vaf.facilitator_id = ?`,
                [operator_id, result[0].facilitator_id], (err, variableResults) => {
                    if (err) {
                        console.log(err);
                        res.json({ message: "Caricamento disponibilità non riuscito" });
                    }
                    else
                        res.json({ result: { variableResults: variableResults, facilitator: result[0] } });
                });
        }
    });
});

router.get("/api/getFacilitatorMonthAvailabilitiesGivenOperator/:oid&m=:monthYear", (req, res) => {
    const operator_id = req.params.oid;
    const monthYear = req.params.monthYear;

    dbgyms.query(`
            SELECT facilitator_id, name, surname, mail
            FROM facilitators
            WHERE (
                SELECT gym_id
                FROM operators
                WHERE operator_id = ?
            )
            IN (gym_id_1, gym_id_2, gym_id_3)
        `, [operator_id], (err, result) => {
        if (err) {
            console.log(err);
            res.json({ message: "Caricamento disponibilità non riuscito" });
        }
        else {
            dbgyms.query(`SELECT *, "fixed" AS row_type, gyms.name AS gym_name, gyms.address AS gym_address FROM fixed_availabilities_facilitators JOIN gyms USING (gym_id) WHERE facilitator_id = ? AND DATE_FORMAT(availability_date, "%Y-%m") = ?`, [result[0].facilitator_id, monthYear], (err, fixedResults) => {
                if (err) {
                    console.log(err);
                    res.json({ message: "Caricamento disponibilità non riuscito" });
                }
                else {
                    dbgyms.query(`
                        SELECT vaf.*, "variable" AS row_type, ao.operator_requested_times AS operator_requested_times, ao.gym_custom_place AS gym_custom_place, ao.operator_id AS operator_id, ao.notes AS notes
                        FROM variable_availabilities_facilitators AS vaf
                        LEFT JOIN availabilities_operators AS ao ON vaf.availability_id = ao.variable_availabilities_facilitators_id
                        WHERE vaf.facilitator_id = ? AND DATE_FORMAT(vaf.availability_date, "%Y-%m") = ?`,
                        [result[0].facilitator_id, monthYear], (err, variableResults) => {
                            if (err) {
                                console.log(err);
                                res.json({ message: "Caricamento disponibilità non riuscito" });
                            }
                            else
                                res.json({ result: { fixedResults: fixedResults, variableResults: variableResults, facilitator: result[0] } });
                        });
                }
            });
        }
    });
});

router.get("/api/getFacilitatori", (req, res) => {
    dbgyms.query(`
        SELECT facilitator_id, mail, facilitators.name, surname,
        g1.gym_id as g1id, g1.name AS g1name, g1.address AS g1address,
        g2.gym_id as g2id, g2.name AS g2name, g2.address AS g2address,
        g3.gym_id as g3id, g3.name AS g3name, g3.address AS g3address
        FROM facilitators
        JOIN gyms g1 ON g1.gym_id = facilitators.gym_id_1
        JOIN gyms g2 ON g2.gym_id = facilitators.gym_id_2
        JOIN gyms g3 ON g3.gym_id = facilitators.gym_id_3
        ORDER BY name`
        , [], (err, result) => {
            if (err) {
                console.log(err);
                res.json({ message: "Caricamento informazioni facilitatori non riuscito" });
            }
            else
                res.json({ result: result });
        });
});

router.get("/api/getHoursFutureCounters", (req, res) => {
    dbgyms.query("SELECT fixed_hours_future_count, variable_hours_future_count FROM facilitators LIMIT 1", [], (err, result) => {
        if (err) {
            console.log(err);
            res.json({ message: "Caricamento contatori ore non riuscito" });
        }
        else
            res.json({ result: result });
    });
});

router.get("/api/getOperatori", (req, res) => {
    dbgyms.query(`
        SELECT operator_id, mail, operators.name, surname,
        g.name AS gymName, g.address AS gymAddress
        FROM operators
        JOIN gyms g ON g.gym_id = operators.gym_id
        ORDER BY operator_id`
        , [], (err, result) => {
            if (err) {
                console.log(err);
                res.json({ message: "Caricamento informazioni operatori non riuscito" });
            }
            else
                res.json({ result: result });
        });
});

router.get("/api/getAllGyms", (req, res) => {
    dbgyms.query(`
            SELECT g.*, f.name AS facilitator_name, f.surname AS facilitator_surname, f.mail AS facilitator_mail, o.name AS operator_name, o.surname AS operator_surname, o.mail AS operator_mail
            FROM gyms g JOIN facilitators f ON (g.gym_id = f.gym_id_1 OR g.gym_id = f.gym_id_2 OR g.gym_id = f.gym_id_3) JOIN operators o ON (g.gym_id = o.gym_id)
            `
        , [], (err, result) => {
            if (err) {
                console.log(err);
                res.json({ message: "Caricamento informazioni palestre non riuscito" });
            }
            else
                res.json({ result: result });
        });
});

router.get("/api/getOwnGyms/:fid&dow=:dayOfWeek", (req, res) => {
    const facilitator_id = req.params.fid;
    const dayOfWeek = req.params.dayOfWeek;

    const days = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];

    if (days.includes(dayOfWeek))
        dbgyms.query(`
            SELECT *
            FROM gyms
            WHERE 
            gym_id IN (
                SELECT gym_id_1 AS gym_id FROM facilitators WHERE facilitator_id = ?
                UNION
                SELECT gym_id_2 AS gym_id FROM facilitators WHERE facilitator_id = ?
                UNION
                SELECT gym_id_3 AS gym_id FROM facilitators WHERE facilitator_id = ?
            )
            AND JSON_EXTRACT(opening_hours, ?) ORDER BY name
        `, [facilitator_id, facilitator_id, facilitator_id, "$." + dayOfWeek], (err, result) => {
            if (err) {
                console.log(err);
                res.json({ message: "Caricamento informazioni palestre non riuscito" });
            }
            else
                res.json({ result: result });
        });
    else
        res.json({ message: "Caricamento informazioni palestre non riuscito: giorno non valido" });
});

router.get("/api/getMyAvailabilitiesOperatorsHoursForDate/:oid&ad=:availabilityDate&gcp=:gymCustomPlace", (req, res) => {
    const operator_id = req.params.oid;
    const availability_date = req.params.availabilityDate;
    const gym_custom_place = req.params.gymCustomPlace;

    dbgyms.query(`
        SELECT operator_requested_times, notes
        FROM availabilities_operators
        WHERE operator_id = ? AND availability_date = ? AND gym_custom_place = ?
        `, [operator_id, availability_date, gym_custom_place], (err, result) => {
        if (err) {
            console.log(err);
            res.json({ message: "Caricamento disponibilità non riuscito" });
        }
        else
            res.json({ result: result.length ? (result[0].operator_requested_times.split(",") ?? []) : [] });
    });
});

router.get("/api/getMyFacilitatorVariableHoursForDate/:oid&ad=:availabilityDate", (req, res) => {
    const operator_id = req.params.oid;
    const availability_date = req.params.availabilityDate;

    dbgyms.query(`
        SELECT availability_times, ver
        FROM variable_availabilities_facilitators
        WHERE facilitator_id = (
            SELECT facilitator_id
            FROM facilitators
            WHERE (
                SELECT gym_id
                FROM operators
                WHERE operator_id = ?
            )
            IN (gym_id_1, gym_id_2, gym_id_3)
        )
        AND availability_date = ?
        `, [operator_id, availability_date], (err, result) => {
        if (err) {
            console.log(err);
            res.json({ message: "Caricamento disponibilità non riuscito" });
        }
        else {
            const responseData = result.length === 0 ? { result: [], ver: null } : { result: result[0].availability_times.split(","), ver: result[0].ver };

            dbgyms.query(`
                SELECT *
                FROM availabilities_operators
                WHERE facilitator_id = (
                    SELECT facilitator_id
                    FROM facilitators
                    WHERE (
                        SELECT gym_id
                        FROM operators
                        WHERE operator_id = ?
                    )
                    IN (gym_id_1, gym_id_2, gym_id_3)
                )
                AND availability_date = ?
            `, [operator_id, availability_date], (err, anotherResult) => {
                if (err) {
                    console.log(err);
                    res.json({ message: "Caricamento disponibilità non riuscito" });
                }
                else {
                    responseData.anotherResult = anotherResult;
                    res.json(responseData);
                }
            });
        }
    });
});

router.get("/api/getUserInfo", (req, res) => {
    if (req.headers.authorization !== undefined)
        try {
            res.json({ result: jwt.verify(req.headers.authorization, jwtPsw) });
        }
        catch (error) {
            res.json({ message: "Caricamento informazioni utente non riuscito: errore nella gestione del token" });
        };
});

router.post("/api/loginIntoGyms", (req, res) => {
    const mail = req.body.mail.trim();
    const password = req.body.password;
    const is_operatore = req.body.is_operatore;

    dbgyms.query("SELECT account_id, name, surname, is_operatore, facilitator_id, operator_id FROM accounts WHERE mail = ? AND password = SHA1(?) AND " + (is_operatore === null ? "is_operatore IS NULL" : "is_operatore = ?"), is_operatore === null ? [mail, password] : [mail, password, is_operatore], (err, result) => {
        if (err) {
            console.log(err);
            res.json({ message: "Controllo accesso non riuscito" });
        }
        else if (result.length > 0) {
            if (result[0].is_operatore === 0)
                dbgyms.query("SELECT fixed_hours_count, variable_hours_count FROM facilitators WHERE facilitator_id = ?", [result[0].facilitator_id], (err, facilitator_limits) => {
                    if (err) {
                        console.log(err);
                        res.json({ message: "Controllo accesso non riuscito" });
                    }
                    else {
                        const token = jwt.sign({ account_id: result[0].account_id, is_operatore: result[0].is_operatore, facilitator_id: result[0].facilitator_id, operator_id: result[0].operator_id, fixed_hours_count: facilitator_limits[0].fixed_hours_count, variable_hours_count: facilitator_limits[0].variable_hours_count }, jwtPsw, { expiresIn: "1h" });
                        res.json({ messageOk: "Accesso effettuato. Bentornato " + (result[0].is_operatore === null ? "superuser" : "facilitatore") + " " + result[0].name + " " + result[0].surname, token: token });
                    }
                });
            else {
                const token = jwt.sign({ account_id: result[0].account_id, is_operatore: result[0].is_operatore, facilitator_id: result[0].facilitator_id, operator_id: result[0].operator_id }, jwtPsw, { expiresIn: "1h" });
                res.json({ messageOk: "Accesso effettuato. Bentornato " + (result[0].is_operatore === null ? "superuser" : "operatore") + " " + result[0].name + " " + result[0].surname, token: token });
            }
        }
        else {
            dbgyms.query("SELECT * FROM accounts WHERE mail = ? AND " + (is_operatore === null ? "is_operatore IS NULL" : "is_operatore = ?"), is_operatore === null ? [mail] : [mail, is_operatore], (err, result) => {
                if (err) {
                    console.log(err);
                    res.json({ message: "Controllo esistenza utente non riuscito" });
                }
                else if (result.length > 0)
                    res.json({ message: "Password errata" });
                else
                    res.json({ message: "Utente non esistente" });
            });
        }
    });
});

router.put("/api/updateAvailabilityTimesForOperator", (req, res) => {
    const operator_id = req.body.operator_id;
    const gym_custom_place = req.body.gym_custom_place;
    const availability_date = req.body.availability_date;
    const availability_times_for_operator = req.body.availability_times_for_operator;
    const ver = req.body.ver;
    const notes = req.body.notes;

    if ((typeof gym_custom_place).localeCompare("string") === 0 && gym_custom_place.length <= 200 && (((typeof notes).localeCompare("string") === 0 && notes.length > 0 && notes.length <= 200) || notes === null))
        dbgyms.query(`
            SELECT ver
            FROM variable_availabilities_facilitators
            WHERE availability_id = 
            (
                SELECT availability_id
                FROM variable_availabilities_facilitators
                WHERE facilitator_id = (
                    SELECT facilitator_id
                    FROM facilitators
                    WHERE (
                        SELECT gym_id
                        FROM operators
                        WHERE operator_id = ?
                    )
                    IN (gym_id_1, gym_id_2, gym_id_3)
                )
                AND availability_date = ?
            )
        `, [operator_id, availability_date], (err, result) => {
            if (err) {
                console.log(err);
                res.json({ message: "Aggiornamento disponibilità non riuscito" });
            }
            else if (result.length === 0)
                res.json({ message: "Aggiornamento disponibilità non riuscito: nessuna disponibilità aggiornabile trovata" });
            else if (ver === result[0].ver)
                dbgyms.getConnection((err, connection) => {
                    if (err) {
                        console.log(err);
                        connection.release();
                        res.json({ message: "Aggiornamento disponibilità non riuscito: connessione al database non riuscita" });
                        return;
                    }
                    connection.beginTransaction(err => {
                        if (err) {
                            console.log(err);
                            connection.release();
                            res.json({ message: "Aggiornamento disponibilità non riuscito: transazione non riuscita" });
                            return;
                        }
                        connection.query(`
                            UPDATE variable_availabilities_facilitators
                            SET availability_times_for_operator = ` + (availability_times_for_operator.length > 0 ? `?` : `NULL`) + `, ver = ver + 1
                            WHERE availability_id = 
                            (
                                SELECT availability_id
                                FROM variable_availabilities_facilitators
                                WHERE facilitator_id = (
                                    SELECT facilitator_id
                                    FROM facilitators
                                    WHERE (
                                        SELECT gym_id
                                        FROM operators
                                        WHERE operator_id = ?
                                    )
                                    IN (gym_id_1, gym_id_2, gym_id_3)
                                )
                                AND availability_date = ?
                            )
                        `, availability_times_for_operator.length > 0 ? [availability_times_for_operator, operator_id, availability_date] : [operator_id, availability_date], (err, result) => {
                            if (err) {
                                console.log(err);
                                connection.rollback(_ => {
                                    connection.release();
                                    res.json({ message: "Aggiornamento disponibilità non riuscito" });
                                });
                            }
                            else {
                                connection.query("SELECT * FROM availabilities_operators WHERE operator_id = ? AND gym_custom_place = ? AND availability_date = ?", [operator_id, gym_custom_place, availability_date], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        connection.rollback(_ => {
                                            connection.release();
                                            res.json({ message: "Aggiunta della disponibilità non riuscita" });
                                        });
                                    }
                                    else if (result.length === 0) {
                                        if (availability_times_for_operator.length > 0 && gym_custom_place.length > 0)
                                            connection.query(`
                                                INSERT INTO availabilities_operators (variable_availabilities_facilitators_id, facilitator_id, operator_id, gym_custom_place, availability_date, operator_requested_times, notes)
                                                SELECT availability_id, facilitator_id, ?, ?, ?, ?, ` + (notes === null ? "NULL" : "?") + `
                                                FROM variable_availabilities_facilitators
                                                WHERE facilitator_id = (
                                                    SELECT facilitator_id
                                                    FROM facilitators
                                                    WHERE (
                                                        SELECT gym_id
                                                        FROM operators
                                                        WHERE operator_id = ?
                                                    )
                                                    IN (gym_id_1, gym_id_2, gym_id_3)
                                                )
                                                AND availability_date = ?
                                            `,
                                            notes === null ?
                                            [operator_id, gym_custom_place, availability_date, availability_times_for_operator, operator_id, availability_date]
                                            :
                                            [operator_id, gym_custom_place, availability_date, availability_times_for_operator, notes, operator_id, availability_date]
                                            , (err, result) => {
                                                if (err) {
                                                    console.log(err);
                                                    connection.rollback(_ => {
                                                        connection.release();
                                                        res.json({ message: "Aggiunta della disponibilità non riuscita" });
                                                    });
                                                }
                                                else
                                                    connection.commit(err => {
                                                        if (err) {
                                                            console.log(err);
                                                            connection.rollback(_ => {
                                                                connection.release();
                                                                res.json({ message: "Aggiunta della disponibilità non riuscita: transazione non riuscita" });
                                                            });
                                                        } else {
                                                            connection.release();
                                                            res.json({ messageOk: "Aggiunta della disponibilità riuscita" });
                                                        }
                                                    });
                                            });
                                        else {
                                            connection.rollback(_ => {
                                                connection.release();
                                                res.json({ message: "Aggiunta della disponibilità non riuscita: è necessario selezionare luogo e orario" });
                                            });
                                        }
                                    }
                                    else {
                                        if (availability_times_for_operator.length > 0)
                                            connection.query(`
                                                UPDATE availabilities_operators
                                                SET operator_requested_times = ?, notes = ` + (notes === null ? "NULL" : "?") + `
                                                WHERE operator_id = ? AND gym_custom_place = ? AND availability_date = ?
                                            `,
                                                notes === null ?
                                                    [availability_times_for_operator, operator_id, gym_custom_place, availability_date]
                                                    :
                                                    [availability_times_for_operator, notes, operator_id, gym_custom_place, availability_date]
                                                , (err, result) => {
                                                    if (err) {
                                                        console.log(err);
                                                        connection.rollback(_ => {
                                                            connection.release();
                                                            res.json({ message: "Aggiunta della disponibilità non riuscita" });
                                                        });
                                                    }
                                                    else
                                                        connection.commit(err => {
                                                            if (err) {
                                                                console.log(err);
                                                                connection.rollback(_ => {
                                                                    connection.release();
                                                                    res.json({ message: "Aggiunta della disponibilità non riuscita: transazione non riuscita" });
                                                                });
                                                            } else {
                                                                connection.release();
                                                                res.json({ messageOk: "Aggiunta della disponibilità riuscita" });
                                                            }
                                                        });
                                                });
                                        else
                                            connection.query(`
                                                DELETE FROM availabilities_operators
                                                WHERE operator_id = ? AND gym_custom_place = ? AND availability_date = ?
                                            `, [operator_id, gym_custom_place, availability_date], (err, result) => {
                                                if (err) {
                                                    console.log(err);
                                                    connection.rollback(_ => {
                                                        connection.release();
                                                        res.json({ message: "Aggiunta della disponibilità non riuscita" });
                                                    });
                                                }
                                                else
                                                    connection.commit(err => {
                                                        if (err) {
                                                            console.log(err);
                                                            connection.rollback(_ => {
                                                                connection.release();
                                                                res.json({ message: "Aggiunta della disponibilità non riuscita: transazione non riuscita" });
                                                            });
                                                        } else {
                                                            connection.release();
                                                            res.json({ messageOk: "Aggiunta della disponibilità riuscita" });
                                                        }
                                                    });
                                            });
                                    }
                                });
                            }
                        });
                    });
                });
            else
                res.json({ message: "Aggiornamento disponibilità non riuscito: per favore ricaricare la pagina" });
        });
    else
        res.json({ message: "Aggiornamento disponibilità non riuscito: il contenuto dei campi relativi alla palestra personalizzata e alle note non può essere più lungo di 200 caratteri per ciascun campo" });
});

router.put("/api/updateHoursFutureCounters", (req, res) => {
    const fixed_hours_future_count = req.body.fixed_hours_future_count;
    const variable_hours_future_count = req.body.variable_hours_future_count;

    if ((typeof fixed_hours_future_count).localeCompare("number") === 0 && (typeof variable_hours_future_count).localeCompare("number") === 0 && fixed_hours_future_count >= 1 && variable_hours_future_count >= 1 && fixed_hours_future_count <= 200 && variable_hours_future_count <= 200)
        dbgyms.query("UPDATE facilitators SET fixed_hours_future_count = ?, variable_hours_future_count = ?", [fixed_hours_future_count, variable_hours_future_count], (err, result) => {
            if (err) {
                console.log(err);
                res.json({ message: "Aggiornamento contatori ore non riuscito" });
            }
            else
                res.json({ messageOk: "Aggiornamento contatori ore riuscito" });
        });
    else
        res.json({ message: "Aggiornamento contatori ore riuscito: valori non validi" });
});

module.exports = router;