import React, { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Typography
} from "@mui/material";
import moment from "moment";
import { LargerThanSm } from "../MediaQueries";

export default function DeadlineDialog() {
    const sm = LargerThanSm();
    const limitDay = 28;
    const [open, setOpen] = useState(moment().date(limitDay).diff(moment(), "days") > 0 && moment().date(limitDay).diff(moment(), "days") <= 2);

    return (
        <Dialog open={open}
            PaperProps={{
                style: {
                    ...(sm ?
                        { width: "60vw", height: "60vh", maxWidth: "unset", maxHeight: "unset" }
                        :
                        { width: "100vw", height: "100vh", position: "fixed", top: 35, borderRadius: "16px 16px 0px 0px" }
                    )
                }
            }}
        >
            <Box style={{ ...(sm && { padding: 20 }), display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", overflow: "hidden" }}>
                <DialogContent>
                    <Typography gutterBottom variant="h5">Attenzione</Typography>
                    <Typography>La gestione delle ore relative al mese di {moment().add(1, "months").format("MMMM")} sarà disponibile fino al giorno {limitDay} del mese corrente</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={_ => setOpen(false)}>
                        Chiudi
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}