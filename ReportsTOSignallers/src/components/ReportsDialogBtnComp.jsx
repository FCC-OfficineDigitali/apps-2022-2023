import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, InputLabel, Typography, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { isMobile } from "react-device-detect";
import Axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import ipPortApi from "../ipPortApi";
import { LargerThanSm } from "../MediaQueries";
import { StyledFab, StyledFilledTextField, StyledTextButton } from "../styles";
import { Box } from "@mui/system";

export default function ReportsDialogBtnComp(props) {
    const theme = useTheme();
    const sm = LargerThanSm();
    const [open, setOpen] = useState(false);
    const [report_title, setReportTitle] = useState("");
    const [report_description, setReportDescription] = useState("");
    const [report_location_description, setReportLocationDescription] = useState("");
    const [latLon, setLatLon] = useState(null);
    const [images, setImages] = useState([]);
    const maxImagesWeight = 26214400;
    const imagesQty = 3;
    const emptyArr = [null, null];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef();
    const inputRef = useRef();
    const { token } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const handleClose = _ => {
        setOpen(false);

        setReportTitle("");
        setReportDescription("");
        setReportLocationDescription("");
        setLatLon(null);
        setImages([]);
    };

    const resetInputFiles = _ => {
        setImages([]);
        inputRef.current.value = null;
    };

    const handleFileChange = event => {
        const files = Array.from(event.target.files);
        const filesSize = files.reduce((totSize, el) => totSize + el.size, 0);

        if (files.length > imagesQty || filesSize > maxImagesWeight) {
            enqueueSnackbar("Le immagini sono più di " + imagesQty + " o hanno un peso troppo alto per poter essere caricate e inviate (max. " + (maxImagesWeight / 1048576) + "MB)", { variant: "error" });
            resetInputFiles();
        }
        else if (files.some(el => el.type.localeCompare("image/jpeg") !== 0)) {
            enqueueSnackbar("Sono accettate solo immagini jpeg", { variant: "error" });
            resetInputFiles();
        }
        else
            setImages(files);
    };

    const updateRowsTable = _ => {
        var formData = new FormData();
        formData.append("report_title", report_title);
        formData.append("report_description", report_description);
        formData.append("report_location_description", report_location_description);
        formData.append("lat", latLon[0]);
        formData.append("lon", latLon[1]);
        images.forEach(img => formData.append("images", img));

        Axios.post(ipPortApi + "addReports/" + token,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        ).then(response => {
            if (response.data.messageOk || response.data.messageOknm) {
                if (response.data.messageOk)
                    enqueueSnackbar(response.data.messageOk, { variant: "success" });
                else
                    enqueueSnackbar(response.data.messageOknm, { variant: "warning" });
                handleClose();
                props.updateListFun();
            }
            else {
                enqueueSnackbar("Errore dal server: " + response.data.message, { variant: "error" });
            }
        }).catch(error => console.log(error));
    };

    useEffect(_ => {
        if (isSubmitting === true && latLon) {
            updateRowsTable();
            setIsSubmitting(false);
        }
    }, [isSubmitting, latLon]);

    return (
        <>
            <StyledFab variant="extended" onClick={_ => setOpen(true)}>
                <AddIcon sx={{ mr: 1 }} />
                Inserisci nuova
            </StyledFab>
            <Dialog open={open} onClose={handleClose} PaperProps={{
                style: {
                    padding: sm ? 20 : 0,
                    minWidth: sm ? "60%" : "90%"
                }
            }}>
                <DialogTitle>
                    <Typography variant="dialogTitle">
                        Nuova segnalazione
                    </Typography>
                    <br />
                    <Typography variant="dialogSubtitle">
                        Verrà inoltrata all'ufficio predisposto alla manutenzione
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
                            <Grid item p={1}>
                                <StyledFilledTextField
                                    variant="filled"
                                    style={{ marginTop: 10 }}
                                    label="Titolo della segnalazione"
                                    placeholder="Titolo della segnalazione"
                                    type="text"
                                    fullWidth
                                    required
                                    value={report_title}
                                    onChange={(e) => setReportTitle(e.target.value)}
                                    inputProps={{ maxLength: 200 }}
                                    helperText="Dai un titolo alla segnalazione"
                                />
                            </Grid>
                            <Grid item p={1}>
                                <StyledFilledTextField
                                    variant="filled"
                                    label="Descrizione della segnalazione"
                                    placeholder="Descrizione della segnalazione"
                                    multiline
                                    type="text"
                                    fullWidth
                                    value={report_description}
                                    onChange={(e) => setReportDescription(e.target.value)}
                                    inputProps={{ maxLength: 1000 }}
                                    helperText="Descrivi il problema"
                                />
                            </Grid>
                            <Grid item p={1}>
                                <StyledFilledTextField
                                    variant="filled"
                                    label="Descrizione del luogo"
                                    placeholder="Descrizione del luogo"
                                    multiline
                                    type="text"
                                    fullWidth
                                    required
                                    value={report_location_description}
                                    onChange={(e) => setReportLocationDescription(e.target.value)}
                                    inputProps={{ maxLength: 1000 }}
                                    helperText="Descrivi il luogo"
                                />
                            </Grid>
                            <Grid item p={1}>
                                <Typography style={{ color: theme.palette.primary.disabledGreyText }}>
                                    Obbligatorio al fine di aiutarci a valutare la priorità dell'intervento:
                                </Typography>
                                <InputLabel htmlFor="fileInput" style={{ paddingBottom: "8px" }}>carica da 1 a 3 immagini relative alla segnalazione (max. 25MB)*</InputLabel>
                                <input type="file" id="fileInput" multiple ref={inputRef} required onChange={handleFileChange} accept="image/jpeg" style={{ width: "100%" }} />
                                {
                                    images.length > 0 &&
                                    <Grid item pt={2}>
                                        <Grid container spacing={1}>
                                            {images.map((image, index) => (
                                                <Grid item xs={4} sm={2} key={index}>
                                                    <Box style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                                        <Box
                                                            component="img"
                                                            src={URL.createObjectURL(image)}
                                                            width="100%"
                                                            height="auto"
                                                            title={image.name}
                                                            alt={image.name + " preview"}
                                                        />
                                                        <Box style={{ display: "flex", flexDirection: "column" }}>
                                                            <Typography variant="data">{image.name}</Typography>
                                                            <Typography variant="data">{image.size} bytes</Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Grid>
                                }
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <StyledTextButton onClick={handleClose}>Annulla</StyledTextButton>
                        <StyledTextButton type="submit" disabled={isSubmitting} onClick={(e) => {
                            e.preventDefault();
                            if (!isSubmitting && formRef.current.reportValidity()) {
                                if (images.length > 0) {
                                    if ("geolocation" in navigator)
                                        navigator.geolocation.getCurrentPosition(
                                            position => {
                                                if (isMobile) {
                                                    var latLonArr = [position.coords.latitude, position.coords.longitude];
                                                    setLatLon(latLonArr);
                                                }
                                                else
                                                    setLatLon(emptyArr);
                                                setIsSubmitting(true);
                                            },
                                            error => {
                                                var message;
                                                switch (error.code) {
                                                    case 1:
                                                        message = "non è stato permesso l'utilizzo della geolocalizzazione";
                                                        break;
                                                    case 2:
                                                        message = "la geolocalizzazione non è disponibile a causa di un errore interno";
                                                        break;
                                                    case 3:
                                                        message = "la geolocalizzazione non è avvenuta in tempi normali";
                                                        break;
                                                    default:
                                                        message = "problema di geolocalizzazione sconosciuto";
                                                        break;
                                                }
                                                enqueueSnackbar("Attenzione: " + message + " (errore " + error.code + "). Invio segnalazione senza geolocalizzazione in corso...", { variant: "warning" });
                                                setLatLon(emptyArr);
                                                setIsSubmitting(true);
                                            },
                                            { enableHighAccuracy: true }
                                        );
                                    else
                                        enqueueSnackbar("Geolocalizzazione non disponibile", { variant: "error" });
                                }
                                else
                                    enqueueSnackbar("È necessario allegare almeno un'immagine", { variant: "error" });
                            }
                        }}>Salva e invia</StyledTextButton>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}