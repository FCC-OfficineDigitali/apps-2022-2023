import { Box, Dialog, DialogContent, IconButton, Typography, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ApartmentIcon from "@mui/icons-material/Apartment";
import Axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import ipPortApi from "../ipPortApi";
import { LargerThanSm } from "../MediaQueries";
import { StyledOutlinedButton } from "../styles";

export default function ShowBuildingInfoDialogBtnComp() {
    const theme = useTheme();
    const sm = LargerThanSm();
    const [open, setOpen] = useState(false);
    const [roomsInfo, setRoomsInfo] = useState([]);
    const { token } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const handleClose = _ => {
        setOpen(false);
    };

    useEffect(_ => {
        if (open) {
            Axios.get(ipPortApi + "getRoomsInfo/" + token)
                .then(data => {
                    if (data.data.message) {
                        enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                        setRoomsInfo([]);
                    }
                    else
                        setRoomsInfo(data.data);
                })
                .catch(error => { setRoomsInfo([]); console.log(error); });
        }
    }, [open]);

    return (
        <>
            <IconButton onClick={_ => setOpen(true)}>
                <ApartmentIcon style={{ color: theme.palette.primary.main }} />
            </IconButton>
            <Dialog open={open} onClose={handleClose} PaperProps={{
                style: { ...(sm ? { padding: 20, minWidth: "60%" } : { width: "100vw", height: "100vh", position: "fixed", top: 35, borderRadius: "16px 16px 0px 0px" }) }
            }}>
                <Box style={{ ...(!sm && { display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }) }}>
                    <DialogContent>
                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="dialogTitle">
                                Informazioni edificio
                            </Typography>
                            <IconButton style={{ color: theme.palette.primary.main }} onClick={handleClose} sx={{ padding: "0" }}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <br />
                        <br />
                        <Typography variant="infoText">
                            <b>Come raggiungerci?</b>
                            <br />
                            Officine Digitali si trova a lato della stazione dei treni di San Giorgio delle Pertiche.
                            <br />
                            <br />
                            <b>In treno da Padova, Castelfranco, Bassano del Grappa e Cittadella:</b> fermata San Giorgio delle Pertiche. Prendete il sottopasso tenendo la destra e vi troverete nel piazzale di Innovation Lab.
                            <br />
                            <br />
                            <b>In autobus da Padova e Castelfranco:</b> linea 208 fermata SAN GIORGIO, proseguire per 100mt in via Roma fino alla stazione dei treni. Prendendo il sottopasso, vi troverete nel piazzale di Innovation Lab.
                            <br />
                            <b>Per chi arriva da Padova:</b> non c’è attraversamento pedonale in corrispondenza della fermata dell’autobus, attraversare la strada con molta attenzione.
                            <br />
                            <br />
                            <b>In auto,</b> impostando la destinazione sul proprio navigatore per sapere il percorso più veloce:
                            <br />
                            <i>Officine Digitali - Innovation Lab del Camposampierese, <a title="Apri in Google Maps" href="//goo.gl/maps/sj7TXAw4HhhbDfZT9" target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.main }}>Via Roma, 42, 35010 San Giorgio delle Pertiche PD</a></i>
                        </Typography>
                        {roomsInfo.length > 0 &&
                            <>
                                <br />
                                <br />
                                <br />
                                <Typography variant="title" fontSize="16px">
                                    Sale dell'edificio:
                                </Typography>
                                {roomsInfo.map((r, index) =>
                                    <Box key={index}>
                                        <br />
                                        <Typography variant="title" fontSize="15px">
                                            {r.room_name_updatable}
                                        </Typography>
                                        <br />
                                        <Typography variant="infoText">
                                            {r.room_description}
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        }
                        <br />
                        <br />
                        <Box textAlign="center">
                            <StyledOutlinedButton
                                onClick={_ => { window.location.href = "https://officinedigitali.fcc.veneto.it/SmartLabSegnalazioni/" }}
                                sx={{ fontFamily: "Graphik", fontSize: 15 }}>
                                Segnala un problema
                            </StyledOutlinedButton>
                        </Box>
                        <br />
                        <br />
                    </DialogContent>
                </Box>
            </Dialog>
        </>
    );
}