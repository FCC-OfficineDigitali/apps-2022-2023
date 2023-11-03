import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from "@mui/material";
import Axios from "axios";
import moment from "moment";
import { useSnackbar } from "notistack";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import ipPortApi from "../ipPortApi";
import { LargerThanSm } from "../MediaQueries";
import { StyledFilledTextField, StyledOutlinedButton, StyledTextButton } from "../styles";

export default function ReportsDialogBtnComp(props) {
    const sm = LargerThanSm();
    const [open, setOpen] = useState(false);
    const [resolution_description, setResolutionDescription] = useState("");
    const [resolution_fix_date, setResolutionFixDate] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef();
    const { token } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const handleClose = _ => {
        setOpen(false);

        setResolutionDescription("");
        setResolutionFixDate("");
    };

    const updateRowsTable = _ => {
        Axios.put(ipPortApi + "updateReportFromId/" + props.report.report_id + "&tkn=" + token,
            {
                report_date_time: props.report.report_date_time,
                resolution_description: resolution_description,
                resolution_fix_date: resolution_fix_date
            }
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

    return (
        <>
            <StyledOutlinedButton onClick={_ => setOpen(true)}>
                Segnala come risolto
            </StyledOutlinedButton>
            <Dialog open={open} onClose={handleClose} PaperProps={{
                style: {
                    padding: sm ? 20 : 0,
                    minWidth: sm ? "60%" : "90%"
                }
            }}>
                <DialogTitle>
                    <Typography variant="dialogTitle">
                        {props.report.report_title}
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
                                    label="Descrizione della soluzione (sarà inviata all'utente segnalatore)"
                                    placeholder="Descrizione della soluzione"
                                    multiline
                                    type="text"
                                    fullWidth
                                    required
                                    value={resolution_description}
                                    onChange={(e) => setResolutionDescription(e.target.value)}
                                    inputProps={{ maxLength: 1000 }}
                                    helperText="Descrivi come è stato risolto il problema"
                                />
                            </Grid>
                            <Grid item p={1}>
                                <StyledFilledTextField
                                    variant="filled"
                                    label="Data termine lavori di risoluzione"
                                    placeholder="Data"
                                    type="date"
                                    fullWidth
                                    required
                                    value={resolution_fix_date}
                                    onChange={(e) => setResolutionFixDate(e.target.value)}
                                    InputProps={{ inputProps: { min: moment(props.report.report_date_time).format("YYYY-MM-DD"), max: new Date().toISOString().slice(0, 10) } }}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <StyledTextButton onClick={handleClose}>Annulla</StyledTextButton>
                        <StyledTextButton type="submit" disabled={isSubmitting} onClick={(e) => {
                            e.preventDefault();
                            if (!isSubmitting && formRef.current.reportValidity())
                                setIsSubmitting(true);

                        }}>Salva e invia</StyledTextButton>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}