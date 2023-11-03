import { Box, Dialog, DialogActions, DialogContent, Grid, IconButton, InputAdornment, Tabs, Typography } from "@mui/material";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import Axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import ipPortApi from "../ipPortApi";
import { LargerThanSm } from "../MediaQueries";
import { StyledFilledTextField, StyledOutlinedButton, StyledTab, StyledTextButton } from "../styles";

export default function ChangeCredentialsDialogBtnComp(props) {
    const sm = LargerThanSm();
    const [open, setOpen] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);
    const [showPassword, setShowPassword] = useState([false, false]);

    const [oldMail, setOldMail] = useState("");
    const [newMail, setNewMail] = useState("");
    const [newMailCopy, setNewMailCopy] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordCopy, setNewPasswordCopy] = useState("");
    const [oldName, setOldName] = useState("");
    const [newName, setNewName] = useState("");
    const [oldSurname, setOldSurname] = useState("");
    const [newSurname, setNewSurname] = useState("");

    const formRef = useRef();
    const { logout, token } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const falseArr = [false, false];

    const handleClickShowPassword = index => {
        var arr = index === 0 ? [!showPassword[0], showPassword[1]] : [showPassword[0], !showPassword[1]];
        setShowPassword(arr);
    };

    const clearMail = _ => {
        setOldMail("");
        setNewMail("");
        setNewMailCopy("");
    };

    const clearPassword = _ => {
        setOldPassword("");
        setNewPassword("");
        setNewPasswordCopy("");
    };

    const clearNameSurname = _ => {
        setOldName("");
        setNewName("");
        setOldSurname("");
        setNewSurname("");
    };

    const handleClose = _ => {
        setOpen(false);
        setTabIndex(0);
        setShowPassword(falseArr);

        clearMail();
        clearPassword();
        clearNameSurname();
    };

    const updateCredentials = _ => {
        Axios.post(ipPortApi + "updateAccount" + (tabIndex === 0 ? "Mail" : (tabIndex === 1 ? "Password" : "NameSurname")) + "Reservations/" + token,
            (tabIndex === 0 ?
                {
                    oldMail: oldMail,
                    newMail: newMail,
                    newMailCopy: newMailCopy
                }
                :
                (tabIndex === 1 ?
                    {
                        oldPassword: oldPassword,
                        newPassword: newPassword,
                        newPasswordCopy: newPasswordCopy
                    }
                    :
                    {
                        oldName: oldName,
                        newName: newName,
                        oldSurname: oldSurname,
                        newSurname: newSurname
                    }
                )
            )
        ).then(response => {
            if (response.data.messageOk) {
                enqueueSnackbar(response.data.messageOk, { variant: "success" });
                handleClose();
                logout();
            }
            else
                enqueueSnackbar("Errore dal server: " + response.data.message, { variant: "error" });
        }).catch(error => console.log(error));
    };

    useEffect(_ => {
        setShowPassword(falseArr);
        if (tabIndex === 0) {
            clearPassword();
            clearNameSurname();
        }
        else if (tabIndex === 1) {
            clearMail();
            clearNameSurname();
        }
        else {
            clearMail();
            clearPassword();
        }
    }, [tabIndex]);

    return (
        <>
            <IconButton onClick={_ => setOpen(true)}>
                <ManageAccountsIcon style={{ color: props.bluCamposampierese }} />
            </IconButton>
            <Dialog open={open} onClose={handleClose} PaperProps={{
                style: { ...(sm ? { padding: 20, minWidth: "60%" } : { width: "100vw", height: "100vh", position: "fixed", top: 35, borderRadius: "16px 16px 0px 0px" }) }
            }}>
                <form ref={formRef} style={{ height: "100%" }}>
                    <Box style={{ ...(!sm && { display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }) }}>
                        <DialogContent>
                            <Typography variant="dialogTitle">
                                Modifica credenziali
                            </Typography>
                            <br />
                            <br />
                            <Tabs value={tabIndex} onChange={(event, value) => setTabIndex(value)} variant="fullWidth" sx={{ borderRadius: "4px" }}>
                                {[0, 1, 2].map((element, index) =>
                                    <StyledTab label={element === 0 ? "Indirizzo mail" : (element === 1 ? "Password" : ("Nome/" + (sm ? "" : " ") + "Cognome"))} value={element} key={index} />
                                )}
                            </Tabs>
                            <Grid container direction={sm ? "row" : "column"} justifyContent="space-between" alignItems="center"
                                sx={{
                                    "& .MuiGrid-item": {
                                        width: "100%"
                                    }
                                }}>
                                {
                                    (
                                        tabIndex === 0 ?
                                            [
                                                {
                                                    "labelPlaceholder": "Indirizzo mail attuale",
                                                    "value": oldMail,
                                                    "onChange": setOldMail,
                                                    "helperText": "Inserisci l'indirizzo mail attualmente in uso"
                                                },
                                                {
                                                    "labelPlaceholder": "Nuovo indirizzo mail",
                                                    "value": newMail,
                                                    "onChange": setNewMail,
                                                    "helperText": "Inserisci il nuovo indirizzo mail"
                                                },
                                                {
                                                    "labelPlaceholder": "Ripeti nuovo indirizzo mail",
                                                    "value": newMailCopy,
                                                    "onChange": setNewMailCopy,
                                                    "helperText": "Ripeti il nuovo indirizzo mail"
                                                }
                                            ]
                                            :
                                            (
                                                tabIndex === 1 ?
                                                    [
                                                        {
                                                            "labelPlaceholder": "Password attuale",
                                                            "value": oldPassword,
                                                            "onChange": setOldPassword,
                                                            "helperText": "Inserisci la password attualmente in uso"
                                                        },
                                                        {
                                                            "labelPlaceholder": "Nuova password",
                                                            "value": newPassword,
                                                            "onChange": setNewPassword,
                                                            "helperText": "Inserisci la nuova password"
                                                        },
                                                        {
                                                            "labelPlaceholder": "Ripeti nuova password",
                                                            "value": newPasswordCopy,
                                                            "onChange": setNewPasswordCopy,
                                                            "helperText": "Ripeti la nuova password"
                                                        }
                                                    ]
                                                    :
                                                    [
                                                        {
                                                            "labelPlaceholder": "Nome attuale",
                                                            "value": oldName,
                                                            "onChange": setOldName,
                                                            "helperText": "Inserisci il nome attualmente in uso"
                                                        },
                                                        {
                                                            "labelPlaceholder": "Nuovo nome",
                                                            "value": newName,
                                                            "onChange": setNewName,
                                                            "helperText": "Inserisci il nuovo nome"
                                                        },
                                                        {
                                                            "labelPlaceholder": "Cognome attuale",
                                                            "value": oldSurname,
                                                            "onChange": setOldSurname,
                                                            "helperText": "Inserisci il cognome attualmente in uso"
                                                        },
                                                        {
                                                            "labelPlaceholder": "Nuovo cognome",
                                                            "value": newSurname,
                                                            "onChange": setNewSurname,
                                                            "helperText": "Inserisci il nuovo cognome"
                                                        },
                                                    ]
                                            )
                                    ).map((el, index) =>
                                        <Grid item py={1} key={index}>
                                            <StyledFilledTextField
                                                variant="filled"
                                                style={{ marginTop: 10 }}
                                                label={el.labelPlaceholder}
                                                placeholder={el.labelPlaceholder}
                                                type={((index === 0 ? showPassword[0] : showPassword[1]) || tabIndex !== 1) ? "text" : "password"}
                                                fullWidth
                                                required
                                                value={el.value}
                                                onChange={(e) => el.onChange(e.target.value)}
                                                inputProps={{ ...(tabIndex === 0 ? { maxLength: 320 } : (tabIndex === 2 ? { maxLength: 100 } : {})) }}
                                                helperText={el.helperText}
                                                InputProps={{
                                                    ...(tabIndex === 1 && index < 2 && {
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <StyledTextButton onClick={_ => handleClickShowPassword(index)}>
                                                                    {(index === 0 ? showPassword[0] : showPassword[1]) ? "Nascondi" : "Mostra"}
                                                                </StyledTextButton>
                                                            </InputAdornment>
                                                        )
                                                    })
                                                }}
                                            />
                                        </Grid>
                                    )
                                }
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <StyledTextButton onClick={handleClose}>Annulla</StyledTextButton>
                            <StyledTextButton type="submit" onClick={(e) => {
                                e.preventDefault();
                                if (formRef.current.reportValidity())
                                    updateCredentials();
                            }}>Salva</StyledTextButton>
                        </DialogActions>
                    </Box>
                </form>
            </Dialog>
        </>
    );
}