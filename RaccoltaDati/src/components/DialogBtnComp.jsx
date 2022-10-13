import React, { useEffect, useRef, useState } from "react";
import {
    Autocomplete,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    Grid,
    TextField,
    Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../hooks/useAuth";
import { LargerThanSm } from "../MediaQueries";
import Axios from "axios";
import moment from "moment";
import { useSnackbar } from "notistack";
import ipPortApi from "../ipPortApi";
import { StyledFilledTextField, StyledOutlinedButton, StyledTextButton } from "../styles";

export default function DialogBtnComp(props) {
    const sm = LargerThanSm();
    const isUpdate = props.dialogUse.localeCompare("update") === 0;
    const [open, setOpen] = useState(false);
    const [nome, setNome] = useState("");
    const [eta, setEta] = useState("");
    const [data_inserimento_viaggiatore, setDataInserimentoViaggiatore] = useState("");
    const [arr_nazione_in_viaggio_da, setArrNazioneInViaggioDa] = useState(["ITA", "Italia"]);
    const [arr_comune_in_viaggio_da, setArrComuneInViaggioDa] = useState(null);
    const [arr_nazione_destinazione, setArrNazioneDestinazione] = useState(["ITA", "Italia"]);
    const [arr_comune_destinazione, setArrComuneDestinazione] = useState(null);
    const [direttrice, setDirettrice] = useState("");
    const [motivo, setMotivo] = useState(null);
    const [realMotivo, setRealMotivo] = useState("");
    const [pensiero, setPensiero] = useState("");
    const [nazioniArray, setNazioniArray] = useState([]);
    const [comuniArray,setComuniArray] = useState([]);

    const formRef = useRef();
    const { token } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const motiviArray = ["Allargare gli orizzonti", "Benessere mentale", "Connessione", "Conoscenza", "Cultura", "Divertimento", "Esperienze enogastronomiche", "Natura e scoperta", "Sport e salute", "Altro"];

    useEffect(_ => {
        ["nazioni", "comuni"].map(toGet =>
        Axios.get(ipPortApi + "getPairs/" + toGet + "&tkn=" + token)
            .then(data => {
                if (data.data.message)
                    enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                else
                    toGet.localeCompare("nazioni") == 0 ? setNazioniArray(data.data.map(Object.values)) : setComuniArray(data.data.map(Object.values).sort((a, b) => -b[2].localeCompare(a[2]) || -b[1].localeCompare(a[1]) || 0));
            }
            ).catch(error => console.log(error))
        );
    }, []);

    const handleClickOpen = _ => {
        setOpen(true);
    };

    const handleClose = _ => {
        setOpen(false);

        setNome("");
        setEta("");
        setDataInserimentoViaggiatore("");
        setArrNazioneInViaggioDa(["ITA", "Italia"]);
        setArrComuneInViaggioDa(null);
        setArrNazioneDestinazione(["ITA", "Italia"]);
        setArrComuneDestinazione(null);
        setDirettrice("");
        setMotivo(null);
        setRealMotivo("");
        setPensiero("");
    };

    const updateRowsTable = _ => {
        (isUpdate ? Axios.put : Axios.post)(ipPortApi + (isUpdate ? ("updateFromId/" + props.id + "&tkn=") : "addRow/") + token, {
            nome: nome,
            eta: eta.toString().length > 0 ? eta : null,
            data_inserimento_viaggiatore: data_inserimento_viaggiatore,
            nazione_in_viaggio_da: arr_nazione_in_viaggio_da != null ? arr_nazione_in_viaggio_da[0] : "",
            comune_in_viaggio_da: arr_comune_in_viaggio_da != null ? arr_comune_in_viaggio_da[0] : "",
            nazione_destinazione: arr_nazione_destinazione != null ? arr_nazione_destinazione[0] : "",
            comune_destinazione: arr_comune_destinazione != null ? arr_comune_destinazione[0] : "",
            direttrice: direttrice,
            motivo: realMotivo.length > 0 ? realMotivo : motivo != null ? motivo : "",
            pensiero: pensiero

        }).then(response => {
            if (response.data.messageOk) {
                enqueueSnackbar(response.data.messageOk, { variant: "success" });
                handleClose();
                props.updateListFun();
            }
            else {
                enqueueSnackbar("Errore dal server: " + response.data.message, { variant: "error" });
            }
        }).catch(error => console.log(error));
    };

    const loadRowData = _ => {
        Axios.get(ipPortApi + "getFromId/" + props.id + "&tkn=" + token)
            .then(data => {
                if (data.data.message)
                    enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                else {
                    setNome(data.data[0].nome);
                    setEta(data.data[0].eta == null ? "" : data.data[0].eta);
                    setDataInserimentoViaggiatore(data.data[0].data_inserimento_viaggiatore ? moment(data.data[0].data_inserimento_viaggiatore).format("YYYY-MM-DD") : "");
                    setArrNazioneInViaggioDa(data.data[0].nazione_in_viaggio_da && data.data[0].nome_nazione_in_viaggio_da ? [data.data[0].nazione_in_viaggio_da, data.data[0].nome_nazione_in_viaggio_da] : null);
                    setArrComuneInViaggioDa(data.data[0].comune_in_viaggio_da && data.data[0].nome_comune_in_viaggio_da ? [data.data[0].comune_in_viaggio_da, data.data[0].nome_comune_in_viaggio_da] : null);
                    setArrNazioneDestinazione(data.data[0].nazione_destinazione && data.data[0].nome_nazione_destinazione ? [data.data[0].nazione_destinazione, data.data[0].nome_nazione_destinazione] : null);
                    setArrComuneDestinazione(data.data[0].comune_destinazione && data.data[0].nome_comune_destinazione ? [data.data[0].comune_destinazione, data.data[0].nome_comune_destinazione] : null);
                    setDirettrice(data.data[0].direttrice);
                    setMotivo(data.data[0].motivo.length > 0 ? (motiviArray.includes(data.data[0].motivo) ? data.data[0].motivo : "Altro") : null);
                    setRealMotivo(motiviArray.includes(data.data[0].motivo) ? "" : data.data[0].motivo)
                    setPensiero(data.data[0].pensiero);
                    handleClickOpen();
                }
            }
            ).catch(error => console.log(error));
    };

    return (
        <>
            {isUpdate ?

                <StyledOutlinedButton onClick={_ => loadRowData()}>
                    Modifica
                </StyledOutlinedButton>
                :
                <Fab variant="extended" color="primary" onClick={_ => handleClickOpen()}
                    sx={{
                        "&:hover": {
                            background: "#24249C"
                        }
                    }}>
                    <AddIcon sx={{ mr: 1 }} />
                    Inserisci nuova
                </Fab>

            }
            <Dialog open={open} onClose={handleClose} PaperProps={{
                style: {
                    padding: sm ? 20 : 0,
                    minWidth: sm ? "60%" : "90%"
                }
            }}>
                <DialogTitle>
                    <Typography variant="updateFields">
                        {isUpdate ? "Modifica i seguenti campi" : "Compila i seguenti campi sulla base del registro cartaceo"}
                    </Typography>
                </DialogTitle>
                <form ref={formRef}>
                    <DialogContent sx={{ padding: sm ? "5px 10px" : "5px 5px" }}>
                        <Grid container direction={sm ? "row" : "column"} justifyContent="space-between" alignItems="center"
                            sx={{
                                "& .MuiGrid-item": {
                                    width: "100%"
                                }
                            }} >
                            <Grid item xs={4} p={1}>
                                <StyledFilledTextField
                                    variant="filled"
                                    label="Data riportata nel reg.cartaceo"
                                    placeholder="Data"
                                    type="date"
                                    fullWidth
                                    required
                                    value={data_inserimento_viaggiatore}
                                    onChange={(e) => setDataInserimentoViaggiatore(e.target.value)}
                                    InputProps={{ inputProps: { min: "1900-01-01", max: new Date().toISOString().slice(0, 10) } }}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={4} p={1}>
                                <StyledFilledTextField
                                    variant="filled"
                                    style={{ marginTop: sm ? 0 : 30 }}
                                    label="Nome del viaggiatore"
                                    placeholder="Nome"
                                    type="text"
                                    fullWidth
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    inputProps={{ maxLength: 100 }}
                                />
                            </Grid>
                            <Grid item xs={4} p={1}>
                                <StyledFilledTextField
                                    variant="filled"
                                    style={{ marginTop: sm ? 0 : 30 }}
                                    label="Età del viaggiatore"
                                    placeholder="Età"
                                    type="number"
                                    fullWidth
                                    value={eta}
                                    onChange={(e) => setEta(e.target.value)}
                                    InputProps={{
                                        inputProps: {
                                            min: 0, max: 99, onKeyDown: (event) => {
                                                if (event.target.value.length == 2
                                                    && event.key.localeCompare("Delete")
                                                    && event.key.localeCompare("Backspace")
                                                    && event.key.localeCompare("ArrowUp")
                                                    && event.key.localeCompare("ArrowDown")
                                                    && event.key.localeCompare("ArrowLeft")
                                                    && event.key.localeCompare("ArrowRight")
                                                    && event.key.localeCompare("Shift")
                                                    && event.key.localeCompare("Tab"))
                                                    event.preventDefault();
                                            }
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6} p={1}>
                                <Autocomplete
                                    fullWidth
                                    style={{ marginTop: sm ? 0 : 30 }}
                                    value={arr_nazione_in_viaggio_da}
                                    options={nazioniArray}
                                    getOptionLabel={(value) => value[1]}
                                    onChange={(event, value, reason) => { setArrNazioneInViaggioDa(value); setArrComuneInViaggioDa(null) }}
                                    renderInput={params => (
                                        <StyledFilledTextField variant="filled" {...params} label="Nazione di provenienza" placeholder="Cerca nazione..." />
                                    )}
                                    isOptionEqualToValue={(option, newValue) => option[0] == newValue[0]}

                                />
                            </Grid>
                            <Grid item xs={6} p={1}>
                                <Autocomplete
                                    fullWidth
                                    style={{ marginTop: sm ? 0 : 30 }}
                                    disabled={!(arr_nazione_in_viaggio_da != null && arr_nazione_in_viaggio_da[0].localeCompare("ITA") == 0)}
                                    value={arr_comune_in_viaggio_da}
                                    groupBy={option => option[2]}
                                    options={comuniArray}
                                    getOptionLabel={option => option[1]}
                                    onChange={(event, value, reason) => setArrComuneInViaggioDa(value)}
                                    renderInput={params => (
                                        <StyledFilledTextField variant="filled" {...params} label="Comune di provenienza" placeholder="Cerca comune..." />
                                    )}
                                    isOptionEqualToValue={(option, newValue) => option[0] == newValue[0]}
                                />
                            </Grid>
                            <Grid item xs={6} p={1}>
                                <Autocomplete
                                    fullWidth
                                    style={{ marginTop: sm ? 0 : 30 }}
                                    value={arr_nazione_destinazione}
                                    options={nazioniArray}
                                    getOptionLabel={(value) => value[1]}
                                    onChange={(event, value, reason) => { setArrNazioneDestinazione(value); setArrComuneDestinazione(null) }}
                                    renderInput={params => (
                                        <StyledFilledTextField variant="filled" {...params} label="Nazione di destinazione" placeholder="Cerca nazione..." />
                                    )}
                                    isOptionEqualToValue={(option, newValue) => option[0] == newValue[0]}
                                />
                            </Grid>
                            <Grid item xs={6} p={1}>
                                <Autocomplete
                                    fullWidth
                                    style={{ marginTop: sm ? 0 : 30 }}
                                    disabled={!(arr_nazione_destinazione != null && arr_nazione_destinazione[0].localeCompare("ITA") == 0)}
                                    value={arr_comune_destinazione}
                                    groupBy={option => option[2]}
                                    options={comuniArray}
                                    getOptionLabel={option => option[1]}
                                    onChange={(event, value, reason) => setArrComuneDestinazione(value)}
                                    renderInput={params => (
                                        <StyledFilledTextField variant="filled" {...params} label="Comune di destinazione" placeholder="Cerca comune..." />
                                    )}
                                    isOptionEqualToValue={(option, newValue) => option[0] == newValue[0]}
                                />
                            </Grid>
                            <Grid item p={1}>
                                <StyledFilledTextField
                                    variant="filled"
                                    style={{ marginTop: sm ? 0 : 30 }}
                                    label="Direttrice percorsa"
                                    placeholder="Direttrice"
                                    type="text"
                                    fullWidth
                                    value={direttrice}
                                    onChange={(e) => setDirettrice(e.target.value)}
                                    inputProps={{ maxLength: 500 }}
                                />
                            </Grid>
                            <Grid item p={1}>
                                <StyledFilledTextField
                                    variant="filled"
                                    style={{ marginTop: sm ? 0 : 30 }}
                                    label="Pensiero"
                                    placeholder="Pensiero"
                                    multiline
                                    type="text"
                                    fullWidth
                                    value={pensiero}
                                    onChange={(e) => setPensiero(e.target.value)}
                                    inputProps={{ maxLength: 1000 }}
                                />
                            </Grid>
                            <Grid container direction={"column"} justifyContent="space-between">
                                <Grid item p={1}>
                                    <Grid container direction={sm ? "row" : "column"} justifyContent="space-between" alignItems="flex-start">
                                        <Grid item xs={sm ? 6 : 12} paddingRight={sm ? 0.5 : 0}>
                                            <Autocomplete
                                                fullWidth
                                                style={{ marginTop: sm ? 0 : 30 }}
                                                value={motivo ? (motiviArray.includes(motivo) ? motivo : "Altro") : null}
                                                options={motiviArray}
                                                onChange={(event, value, reason) => { setMotivo(value); setRealMotivo(value ? value : "") }}
                                                renderInput={params => (
                                                    <StyledFilledTextField variant="filled" {...params} label="Motivo del viaggio riportato nel reg.cartaceo" placeholder="Motivo" />
                                                )}
                                            />
                                        </Grid>
                                        {motivo && (motivo.localeCompare("Altro") == 0 || motiviArray.includes(motivo) == false) &&
                                            <Grid item xs={sm ? 6 : 12} paddingLeft={sm ? 0.5 : 0}>
                                                <TextField
                                                    variant="outlined"
                                                    style={{ marginTop: sm ? 0 : 30 }}
                                                    label="Motivo personalizzato"
                                                    placeholder="Motivo"
                                                    multiline
                                                    type="text"
                                                    fullWidth
                                                    value={realMotivo.length > 0 && realMotivo.localeCompare("Altro") != 0 ? realMotivo : ""}
                                                    onChange={(e) => setRealMotivo(e.target.value)}
                                                    inputProps={{ maxLength: 500 }}
                                                />
                                            </Grid>
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <StyledTextButton onClick={handleClose}>Annulla</StyledTextButton>
                        <StyledTextButton type="submit" onClick={(e) => { e.preventDefault(); if (formRef.current.reportValidity()) updateRowsTable() }}>Salva</StyledTextButton>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}