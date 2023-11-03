import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import { LargerThanSm } from "../MediaQueries";

export default function ReadOnlyPopupVariable(props) {
    const sm = LargerThanSm();

    const closePopup = _ => {
        props.closePopup();
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
                    <Typography gutterBottom variant="h5">Disponibilità richieste per il giorno {props.selectedDate.format(sm ? "dddd D MMMM YYYY" : "D/MM/YYYY")}</Typography>
                    {
                        props.variableResults.length
                            ?
                            <>
                                <Typography>
                                    <b>Da {props.facilitator.name + " " + props.facilitator.surname + " "}(</b>
                                    <a title={"Invia mail a " + props.facilitator.name + " " + props.facilitator.surname} href={"mailto:" + props.facilitator.mail}>
                                        {props.facilitator.mail}
                                    </a>
                                    <b>):</b>
                                </Typography>
                                <ul>
                                    {props.variableResults.map((availability, index) => (
                                        <li key={index}>
                                            <Typography>
                                                <b>{availability.gym_custom_place}:</b> {availability.operator_requested_times.split(",").join(", ")} {availability.notes && ("(" + availability.notes + ")")}
                                            </Typography>
                                        </li>
                                    ))}
                                </ul>
                            </>
                            :
                            <Typography>Non sono state richieste disponibilità per questo giorno</Typography>
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={closePopup}>Chiudi</Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}