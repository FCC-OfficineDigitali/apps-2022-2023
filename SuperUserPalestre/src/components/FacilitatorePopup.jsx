import { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import { LargerThanSm } from "../MediaQueries";
import moment from "moment";
import { getFacilitatorAllAvailabilities } from "../services/apiSuperUsers";

export default function FacilitatorePopup(props) {
    const sm = LargerThanSm();

    const [calendarData, setCalendarData] = useState([]);
    const [realCalendarData, setRealCalendarData] = useState([]);

    const closePopup = _ => {
        props.closePopup();
    };

    const downloadFacilitatoreCsv = selectedFacilitatore => {
        const csvContent = "Nome;Cognome;Mail;Nome Palestra 1;Indirizzo Palestra 1;Nome Palestra 2;Indirizzo Palestra 2;Nome Palestra 3;Indirizzo Palestra 3\n";
        const row = selectedFacilitatore.name + ";" + selectedFacilitatore.surname + ";" + selectedFacilitatore.mail + ";" +
            selectedFacilitatore.g1name + ";" + selectedFacilitatore.g1address + ";" +
            selectedFacilitatore.g2name + ";" + selectedFacilitatore.g2address + ";" +
            selectedFacilitatore.g3name + ";" + selectedFacilitatore.g3address + "\n";

        const blob = new Blob([csvContent + row], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "Facilitatore " + selectedFacilitatore.name + " " + selectedFacilitatore.surname + ".csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const downloadImpegniFacilitatoreCsv = _ => {
        if (realCalendarData.length > 0) {
            const csvContent = "Data;Ora di inizio;Ora di fine;Tipologia ore;Luogo;Note;Selezionata\n";

            var rows = "";

            realCalendarData.map(obj => rows += (
                moment(obj.availability_date).format("dddd D MMMM YYYY").replace("ì", "i'") + ";" +
                obj.start_time + ";" +
                obj.end_time + ";" +
                (obj.row_type.localeCompare("fixed") === 0 ? "Fisse" : "A chiamata") + ";" +
                (obj.row_type.localeCompare("fixed") === 0 ? (obj.gym_name + " (" + obj.gym_address + ")") : (obj.used ? obj.gym_custom_place : "")) + ";" +
                (obj.notes ?? "") + ";" +
                (obj.used ? "Si" : "No") + "\n"
            ));

            const blob = new Blob([csvContent + rows], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = "Impegni di " + props.selectedFacilitatore.name + " " + props.selectedFacilitatore.surname + ".csv";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        }
    };

    const compareDateTimes = (a, b) => {
        const dateTimeA = moment(a.availability_date + " " + a.start_time, "YYYY-MM-DD HH:mm");
        const dateTimeB = moment(b.availability_date + " " + b.start_time, "YYYY-MM-DD HH:mm");
        const usedA = a.used;
        return dateTimeA.isSame(dateTimeB) ? (usedA ? -1 : 1) : dateTimeA.isBefore(dateTimeB) ? -1 : 1;
    };

    useEffect(_ => {
        if (props.showPopup)
            getFacilitatorAllAvailabilities(props.selectedFacilitatore.facilitator_id, setCalendarData);
    }, [props.showPopup]);

    useEffect(_ => {
        const rcd = calendarData
            .map(row => {
                if (row.row_type.localeCompare("fixed") === 0)
                    return row.availability_times.split(",").map(hour => Object.assign({}, row, { availability_times: hour, start_time: hour.split("-")[0], end_time: hour.split("-")[1], used: true }))
                else
                    return row.availability_times ? row.availability_times.split(",").map(hour => Object.assign({}, row, { availability_times: hour, availability_times: hour, start_time: hour.split("-")[0], end_time: hour.split("-")[1], used: row.operator_requested_times ? row.operator_requested_times.split(",").some(h => h.localeCompare(hour) === 0) : false })) : []
            })
            .flat()
            .sort((a, b) => compareDateTimes(a, b));

        var rcdWithoutEmptyDuplicates = [];
        rcd.forEach(obj => {
            if (obj.used || !(rcdWithoutEmptyDuplicates.some(r => r.availability_date.localeCompare(obj.availability_date) === 0 && r.availability_times.localeCompare(obj.availability_times) === 0 && r.facilitator_id === obj.facilitator_id)))
                rcdWithoutEmptyDuplicates.push(obj);
        });

        setRealCalendarData(rcdWithoutEmptyDuplicates.sort((a, b) => compareDateTimes(a, b)));
    }, [calendarData]);

    return (
        <Dialog open={props.showPopup} onClose={closePopup}
            PaperProps={{
                style: {
                    ...(sm ?
                        { width: "60vw", height: "60vh", maxWidth: "unset", maxHeight: "unset" }
                        :
                        { width: "100vw", height: "100vh", position: "fixed", top: 35, borderRadius: "16px 16px 0px 0px" })
                }
            }}
        >
            <Box style={{ ...(sm && { padding: 20 }), display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", overflow: "hidden" }}>
                <DialogContent>
                    <Typography gutterBottom variant="h5">
                        {props.selectedFacilitatore.name + " " + props.selectedFacilitatore.surname}
                    </Typography>
                    <Typography>
                        <b>Mail: </b>
                        <a title={"Invia mail a " + props.selectedFacilitatore.name + " " + props.selectedFacilitatore.surname} href={"mailto:" + props.selectedFacilitatore.mail}>
                            {props.selectedFacilitatore.mail}
                        </a>
                    </Typography>
                    <Typography>
                        <b>Palestre:</b>
                    </Typography>
                    <ul>
                        {[
                            [
                                props.selectedFacilitatore.g1id,
                                props.selectedFacilitatore.g1name,
                                props.selectedFacilitatore.g1address
                            ]
                            ,
                            [
                                props.selectedFacilitatore.g2id,
                                props.selectedFacilitatore.g2name,
                                props.selectedFacilitatore.g2address
                            ],
                            [
                                props.selectedFacilitatore.g3id,
                                props.selectedFacilitatore.g3name,
                                props.selectedFacilitatore.g3address
                            ]
                        ].map(([gymId, gymName, gymAddress], index) => (
                            <li key={index + "_" + gymId}>
                                <Typography>
                                    {gymName + " (" + gymAddress + ")"}
                                </Typography>
                            </li>
                        ))}
                    </ul>
                </DialogContent>
                <DialogActions>
                    <Button onClick={_ => downloadFacilitatoreCsv(props.selectedFacilitatore)}>Scarica info</Button>
                    <Button disabled={realCalendarData.length === 0} onClick={_ => downloadImpegniFacilitatoreCsv(props.selectedFacilitatore.facilitator_id)}>Scarica tutti gli impegni</Button>
                    <Button onClick={closePopup}>Chiudi</Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}