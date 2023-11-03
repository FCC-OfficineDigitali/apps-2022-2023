import React, { useState, useRef, useEffect } from "react";
import { Box, Dialog, DialogActions, DialogContent, LinearProgress, Typography } from "@mui/material";
import useLocalStorage from "../hooks/useLocalStorage";
import { LargerThanSm } from "../MediaQueries";
import { StyledTextButton } from "../styles";

export default function WelcomeDialogComp(props) {
    const sm = LargerThanSm();
    const [open, setOpen] = useState(true);
    const [used, setUsed] = useLocalStorage("SmartLabtutorialcompleted", false);
    const [tab, setTab] = useState(0);
    const dialogContentRef = useRef();
    const lastTab = 2;

    useEffect(_ => {
        dialogContentRef.current?.scrollTo({
            behavior: "smooth",
            top: 0
        });
    }, [tab]);

    return (
        <>
            {!used &&
                <Dialog open={open} PaperProps={{
                    style: { ...(sm ? { maxWidth: "60%" } : { width: "100vw", height: "100vh", position: "fixed", top: 35, borderRadius: "16px 16px 0px 0px" }) }
                }}>
                    <LinearProgress variant="determinate" value={(100 / lastTab) * tab} />
                    <Box style={{ ...(sm ? { padding: 20 } : { display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }) }}>
                        <DialogContent ref={dialogContentRef}>
                            <Typography variant="dialogTitle">
                                {tab === 0 &&
                                    "Benvenuto/a nell'App di prenotazione degli spazi dell'INNOVATION LAB di Officine Digitali"
                                }
                                {tab === 1 &&
                                    "Seleziona la tua slot!"
                                }
                                {tab === 2 &&
                                    "Utilizza gli spazi dell’INNOVATION LAB di Officine Digitali"
                                }
                            </Typography>
                            <br />
                            <br />
                            <Typography variant="infoText" whiteSpace="pre-line" fontSize="15px">
                                {tab === 0 &&
                                    `L'app ti permette di prenotare gratuitamente una o più postazioni per lavorare in smart working, effettuare call e riunioni o allestire conferenze e workshop. Premi il bottone "Nuova Prenotazione" e scegli cosa vuoi fare.`
                                }
                                {tab === 1 &&
                                    `Una volta effettuata la tua scelta, seleziona una o più fasce orarie e conferma per effettuare la tua prenotazione. Ricordati che per alcuni spazi potrai effettuare prenotazioni solo per il mese corrente.`
                                }
                                {tab === 2 &&
                                    `Sulla base delle tue prenotazioni, recati fisicamente all'INNOVATION LAB, situato a San Giorgio delle Pertiche in Via Roma 42.`
                                }
                                <br />
                                <br />
                                <Box textAlign="center" position="relative" border={"1px solid" + props.theme.palette.primary.main + "44"} boxShadow={"0 0 5px " + props.theme.palette.primary.main + "88"}>
                                    <Box
                                        component="img"
                                        src={"./img/tutorial/t" + tab + (sm ? "" : "_m") + ".png"}
                                        title={"Immagine tab" + tab}
                                        alt={"Immagine tab" + tab}
                                        maxWidth="100%"
                                    />
                                </Box>
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            {tab > 0 &&
                                <StyledTextButton onClick={_ => setTab(tab - 1)}>
                                    Indietro
                                </StyledTextButton>
                            }
                            <StyledTextButton onClick={_ => {
                                if (tab === lastTab) {
                                    setOpen(false);
                                    setUsed(true);
                                }
                                else
                                    setTab(tab + 1);
                            }}>
                                {tab === lastTab ? "Chiudi" : "Avanti"}
                            </StyledTextButton>
                        </DialogActions>
                    </Box>
                </Dialog>
            }
        </>
    );
}
