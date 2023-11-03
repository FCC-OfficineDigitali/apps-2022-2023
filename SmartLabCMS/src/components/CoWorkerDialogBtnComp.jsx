import React, { useEffect, useRef, useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, Grid, Typography } from "@mui/material";
import Axios from "axios";
import ipPortApi from "../ipPortApi";
import { StyledFilledTextField, StyledTextButton } from "../styles";

export default function CoWorkerDialogBtnComp(props) {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [mail, setMail] = useState("");
    const [phone, setPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef();

    const handleClose = _ => {
        props.setOpen(false);
        props.setCwData(null);

        setName("");
        setSurname("");
        setMail("");
        setPhone("");
    };

    const updateRowsTable = _ => {
        (props.cwData ? Axios.put : Axios.post)(ipPortApi + (props.cwData ? ("updateCoWorkerFromId/" + props.cwData.coworker_id + "&tkn=") : "addCoWorker/") + props.token,
            {
                name: name,
                surname: surname,
                mail: mail,
                phone: phone
            }
        ).then(response => {
            if (response.data.messageOk) {
                props.enqueueSnackbar(response.data.messageOk, { variant: "success" });
                handleClose();
                props.handleClickToUpdate();
            }
            else
                props.enqueueSnackbar("Errore dal server: " + response.data.message, { variant: "error" });
        }).catch(error => console.log(error));
    };

    const loadFields = _ => {
        setName(props.cwData.name);
        setSurname(props.cwData.surname);
        setMail(props.cwData.mail);
        setPhone(props.cwData.phone);
    };

    useEffect(_ => {
        if (isSubmitting === true) {
            updateRowsTable();
            setIsSubmitting(false);
        }
    }, [isSubmitting]);

    useEffect(_ => {
        if (props.cwData && !props.cwData.deleted)
            loadFields();
    }, [props.cwData]);

    return (
        <>
            <Dialog open={props.open} onClose={handleClose} PaperProps={{
                style: { ...(props.sm ? { padding: 20, minWidth: "60%" } : { width: "100vw", height: "100vh", position: "fixed", top: 35, borderRadius: "16px 16px 0px 0px" }) }
            }}>
                <form ref={formRef} style={{ height: "100%" }}>
                    <Box style={{ ...(!props.sm && { display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }) }}>
                        <DialogContent>
                            <Typography variant="dialogTitle">
                                {(props.cwData ? "Modifica" : "Riempi") + " i seguenti campi"}
                            </Typography>
                            <br />
                            <br />
                            <Grid container direction={props.sm ? "row" : "column"} justifyContent="space-between" alignItems="center"
                                sx={{
                                    "& .MuiGrid-item": {
                                        width: "100%"
                                    }
                                }}>
                                <Grid item p={1}>
                                    <StyledFilledTextField
                                        variant="filled"
                                        style={{ marginTop: 10 }}
                                        label="Nome"
                                        placeholder="Nome"
                                        type="text"
                                        fullWidth
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        inputProps={{ maxLength: 100 }}
                                        helperText="Inserisci nome"
                                    />
                                </Grid>
                                <Grid item p={1}>
                                    <StyledFilledTextField
                                        variant="filled"
                                        style={{ marginTop: 10 }}
                                        label="Cognome"
                                        placeholder="Cognome"
                                        type="text"
                                        fullWidth
                                        required
                                        value={surname}
                                        onChange={e => setSurname(e.target.value)}
                                        inputProps={{ maxLength: 100 }}
                                        helperText="Inserisci cognome"
                                    />
                                </Grid>
                                <Grid item p={1}>
                                    <StyledFilledTextField
                                        variant="filled"
                                        style={{ marginTop: 10 }}
                                        label="Indirizzo mail"
                                        placeholder="Indirizzo mail"
                                        type="text"
                                        fullWidth
                                        required
                                        value={mail}
                                        onChange={e => setMail(e.target.value)}
                                        inputProps={{ maxLength: 320 }}
                                        helperText="Inserisci indirizzo mail"
                                    />
                                </Grid>
                                <Grid item p={1}>
                                    <StyledFilledTextField
                                        variant="filled"
                                        style={{ marginTop: 10 }}
                                        label="Numero di telefono"
                                        placeholder="Numero di telefono"
                                        type="text"
                                        fullWidth
                                        required
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        inputProps={{ maxLength: 20 }}
                                        helperText="Inserisci il numero di telefono (senza prefisso internazionale)"
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <StyledTextButton onClick={handleClose}>Annulla</StyledTextButton>
                            <StyledTextButton type="submit" onClick={e => {
                                e.preventDefault();
                                if (formRef.current.reportValidity() && !isSubmitting)
                                    setIsSubmitting(true);
                            }}>
                                {props.cwData ? "Modifica" : "Salva"}
                            </StyledTextButton>
                        </DialogActions>
                    </Box>
                </form>
            </Dialog>
        </>
    );
}