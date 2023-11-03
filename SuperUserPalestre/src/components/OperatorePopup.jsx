import { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import { LargerThanSm } from "../MediaQueries";
import moment from "moment";
import { getFacilitatorRequestedAvailabilitiesFromOperatorObj } from "../services/apiSuperUsers";

export default function OperatorePopup(props) {
    const sm = LargerThanSm();

    const [dataToShow, setDataToShow] = useState({ variableResults: [], facilitator: {} });

    const closePopup = _ => {
        props.closePopup();
    };

    const downloadOperatoreCsv = selectedOperatore => {
        const csvContent = "Nome;Cognome;Mail;Nome Palestra;Indirizzo Palestra\n";
        const row = selectedOperatore.name + ";" + selectedOperatore.surname + ";" + selectedOperatore.mail + ";" +
            selectedOperatore.gymName + ";" + selectedOperatore.gymAddress + "\n";

        const blob = new Blob([csvContent + row], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "Operatore " + selectedOperatore.name + " " + selectedOperatore.surname + ".csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const downloadRichiesteOperatoreCsv = selectedOperatore => {
        const csvContent = "Data;Ore;Luogo;Note\n";

        var rows = "";

        dataToShow.variableResults.map(result => rows += (
            moment(result.availability_date).format("D/MM/YYYY") + ";" + result.operator_requested_times.split(",").join(", ") + ";" + result.gym_custom_place + ";" + (result.notes ?? "") + "\n"
        ));

        const blob = new Blob([csvContent + rows], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "Richieste di " + selectedOperatore.name + " " + selectedOperatore.surname + " per " + dataToShow.facilitator.name + " " + dataToShow.facilitator.surname + ".csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    useEffect(_ => {
        if (props.showPopup)
            getFacilitatorRequestedAvailabilitiesFromOperatorObj(props.selectedOperatore.operator_id, setDataToShow);
    }, [props.showPopup]);

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
                        {props.selectedOperatore.name + " " + props.selectedOperatore.surname}
                    </Typography>
                    <Typography>
                        <b>Mail: </b>
                        <a title={"Invia mail a " + props.selectedOperatore.name + " " + props.selectedOperatore.surname} href={"mailto:" + props.selectedOperatore.mail}>
                            {props.selectedOperatore.mail}
                        </a>
                    </Typography>
                    <Typography>
                        <b>Palestra:</b> {props.selectedOperatore.gymName + " (" + props.selectedOperatore.gymAddress + ")"}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={_ => downloadOperatoreCsv(props.selectedOperatore)}>Scarica info</Button>
                    <Button disabled={dataToShow.variableResults.length === 0} onClick={_ => downloadRichiesteOperatoreCsv(props.selectedOperatore)}>Scarica ore richieste</Button>
                    <Button onClick={closePopup}>Chiudi</Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}