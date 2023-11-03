import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    Grid,
    InputLabel,
    Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../hooks/useAuth";
import ipPortApi from "../ipPortApi";
import Axios from "axios";
import { useSnackbar } from "notistack";
import { LargerThanSm } from "../MediaQueries";
import { StyledAutocomplete, StyledFab, StyledFilledTextField, StyledTextButton } from "../styles";

export default function ReportsDialogBtnComp(props) {
    const sm = LargerThanSm();
    const [open, setOpen] = useState(false);
    const [report_title, setReportTitle] = useState("");
    const [report_description, setReportDescription] = useState("");
    const [selectedRoom, setselectedRoom] = useState(null);
    const [roomsInfo, setRoomsInfo] = useState([]);
    const [images, setImages] = useState([]);
    const maxImagesWeight = 26214400;
    const imagesQty = 3;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef();
    const inputRef = useRef();
    const { token } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const handleClose = _ => {
        setOpen(false);

        setReportTitle("");
        setReportDescription("");
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
        formData.append("selectedRoomId", selectedRoom.room_id);
        images.forEach(img => formData.append("images", img));

        Axios.post(ipPortApi + "addHubReports/" + token,
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
        if (isSubmitting === true) {
            updateRowsTable();
            setIsSubmitting(false);
        }
    }, [isSubmitting]);

    useEffect(_ => {
        Axios.get(ipPortApi + "getRoomsInfo/" + token)
            .then(data => {
                if (data.data.message) {
                    enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                    setRoomsInfo([]);
                    setselectedRoom(null);
                }
                else {
                    setRoomsInfo(data.data);
                    setselectedRoom(data.data && data.data.length > 0 ? data.data[0] : null);
                }
            })
            .catch(error => { setRoomsInfo([]); setselectedRoom(null); console.log(error); });
    }, []);

    return (
        <>
            <StyledFab variant="extended" onClick={_ => setOpen(true)}>
                <AddIcon sx={{ mr: sm ? 1 : 0 }} />
                {sm ? "Inserisci nuova" : "Inserisci"}
            </StyledFab>
            <Dialog open={open} onClose={handleClose} PaperProps={{
                style: { ...(sm ? { padding: 20, minWidth: "60%" } : { width: "100vw", height: "100vh", position: "fixed", top: 35, borderRadius: "16px 16px 0px 0px" }) }
            }}>
                <form ref={formRef} style={{ height: "100%" }}>
                    <Box style={{ ...(!props.sm && { display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }) }}>
                        <DialogContent>
                            <Typography variant="dialogTitle">
                                Nuova segnalazione
                            </Typography>
                            <br />
                            <Typography variant="dialogSubtitle">
                                Verrà inoltrata agli amministratori dell'edificio
                            </Typography>
                            <br />
                            <br />
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
                                        onChange={e => setReportTitle(e.target.value)}
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
                                        required
                                        value={report_description}
                                        onChange={e => setReportDescription(e.target.value)}
                                        inputProps={{ maxLength: 1000 }}
                                        helperText="Descrivi il problema"
                                    />
                                </Grid>
                                <Grid item p={1}>
                                    <StyledAutocomplete
                                        id="Luogo"
                                        fullWidth
                                        value={selectedRoom}
                                        onChange={(event, value, reason) => setselectedRoom(value)}
                                        options={roomsInfo}
                                        getOptionLabel={option => option.room_name_updatable}
                                        renderInput={params => (
                                            <StyledFilledTextField
                                                {...params}
                                                variant="outlined"
                                                label="Luogo"
                                                placeholder="Luogo"
                                                required
                                            />
                                        )}
                                        disableClearable
                                    />
                                </Grid>
                                <Grid item p={1}>
                                    <InputLabel htmlFor="fileInput" style={{ paddingBottom: "8px" }}>Carica da 1 a 3 immagini relative alla segnalazione (max. 25MB)</InputLabel>
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
                            <StyledTextButton type="submit" disabled={isSubmitting} onClick={e => {
                                e.preventDefault();
                                if (!isSubmitting && formRef.current.reportValidity()) {
                                    if (images.length > 0)
                                        setIsSubmitting(true);
                                    else
                                        enqueueSnackbar("È necessario allegare almeno un'immagine", { variant: "error" });
                                }
                            }}>Salva e invia</StyledTextButton>
                        </DialogActions>
                    </Box>
                </form>
            </Dialog>
        </>
    );
}