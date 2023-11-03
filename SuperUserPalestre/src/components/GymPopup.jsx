import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import { LargerThanSm } from "../MediaQueries";

export default function GymPopup(props) {
    const sm = LargerThanSm();

    const closePopup = _ => {
        props.closePopup();
    };

    const downloadGymCsv = selectedGym => {
        if (Object.keys(selectedGym).length > 0) {
            const csvContent = "Nome;Indirizzo;" + Object.keys(JSON.parse(selectedGym.opening_hours)).map(key => key.replace("ì", "i'")).join(";") + "\n";
            const row = selectedGym.name + ";" + selectedGym.address + ";" + Object.values(JSON.parse(selectedGym.opening_hours)).map(value => value.length ? value : "Chiuso").join(";") + "\n";

            const blob = new Blob([csvContent + row], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = "Palestra " + selectedGym.name + ".csv";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        }
    };

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
                        {props.selectedGym.name}
                    </Typography>
                    <Typography>
                        <b>Indirizzo:</b> {props.selectedGym.address}
                    </Typography>
                    <Typography>
                        <b>Orari:</b>
                    </Typography>
                    {Object.keys(props.selectedGym).length > 0 && Object.entries(JSON.parse(props.selectedGym.opening_hours)).map(([day, times]) => (
                        <Typography key={day}>
                            {day + ": " + (times.length ? times : "chiuso")}
                        </Typography>
                    ))}
                    <Typography>
                        <b>Facilitatore:</b> {props.selectedGym.facilitator_name + " " + props.selectedGym.facilitator_surname + " "}
                        (<a title={"Invia mail a " + props.selectedGym.facilitator_name + " " + props.selectedGym.facilitator_surname} href={"mailto:" + props.selectedGym.facilitator_mail}>
                            {props.selectedGym.facilitator_mail}
                        </a>)
                    </Typography>
                    <Typography>
                        <b>Operatore:</b> {props.selectedGym.operator_name + " " + props.selectedGym.operator_surname + " "}
                        (<a title={"Invia mail a " + props.selectedGym.operator_name + " " + props.selectedGym.operator_surname} href={"mailto:" + props.selectedGym.operator_mail}>
                            {props.selectedGym.operator_mail}
                        </a>)
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={_ => downloadGymCsv(props.selectedGym)}>Scarica</Button>
                    <Button onClick={closePopup}>Chiudi</Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}