import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, LinearProgress, Typography } from "@mui/material";
import useLocalStorage from "../hooks/useLocalStorage";
import { LargerThanSm } from "../MediaQueries";
import { StyledTextButton } from "../styles";
import { Box } from "@mui/system";

export default function WelcomeDialogComp() {
    const sm = LargerThanSm();
    const [open, setOpen] = useState(true);
    const [used, setUsed] = useLocalStorage("ReportsTOSignallerstutorialcompleted", false);
    const [tab, setTab] = useState(0);
    const dialogRef = useRef();
    const lastTab = 2;

    useEffect(_ => {
        dialogRef.current?.scrollTo({
            behavior: "smooth",
            top: 0
        });
    }, [tab]);

    return (
        <>
            {!used &&
                <Dialog open={open} PaperProps={{
                    ref: dialogRef,
                    style: {
                        maxWidth: sm ? "60%" : "90%"
                    }
                }}>
                    <LinearProgress variant="determinate" value={(100 / lastTab) * tab} />
                    <Box style={{ padding: sm ? 20 : 0 }}>
                        <DialogContent>
                            <Typography variant="dialogTitle">
                                {tab === 0 &&
                                    "Benvenuto/a nell'app di raccolta segnalazioni della Treviso-Ostiglia"
                                }
                                {tab === 1 &&
                                    "Funzionalità principali"
                                }
                                {tab === 2 &&
                                    "Mail e feedback"
                                }
                                {tab === 3 &&
                                    "Altre funzionalità"
                                }
                            </Typography>
                            <br />
                            <br />
                            <Typography variant="infoText" whiteSpace="pre-line" fontSize="15px">
                                {tab === 0 &&
                                    `Questa app ti permette di segnalare problematiche che si possono riscontrare nella Treviso-Ostiglia.
                                    Alcuni esempi possono essere: presenza di rami/radici/buche nella carreggiata, segnaletica e staccionate vandalizzate o rotte, presenza di rifiuti lungo la tratta, cestini pieni o senza sacchetti, piante da tagliare o con Bruco Americano, presenza di alveari, fontanelle malfunzionanti.`
                                }
                                {tab === 1 &&
                                    `Puoi visualizzare le tue segnalazioni aperte e le segnalazioni chiuse provenienti da tutti gli utenti.
                                    Per aprire una nuova segnalazione, premi il bottone \"INSERISCI NUOVA\", inserisci un titolo ed una descrizione (facoltativa) negli appositi campi di testo, carica delle immagini ed assicurati che la geolocalizzazione del tuo dispositivo sia attiva, questo per far sapere dove si trova il problema.`
                                }
                                {tab === 2 &&
                                    `Quando invii delle segnalazioni, l'ufficio che si occupa di gestirle riceve una mail per ciascuna di esse con i relativi dati. Inoltre, dal loro portale, potranno marcare le segnalazioni come risolte.
                                    Quando una segnalazione verrà risolta, riceverai una mail contenente informazioni riguardanti la risoluzione effettuata.`
                                }
                                {tab === 3 &&
                                    `In caso di necessità, puoi modificare le tue credenziali (indirizzo mail e password) premendo il bottone \"MODIFICA CREDENZIALI\".`
                                }
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
