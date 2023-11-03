import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, Tabs, Typography } from "@mui/material";
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
    const [oldPhone, setOldPhone] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newPhoneCopy, setNewPhoneCopy] = useState("");

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

    const clearPhone = _ => {
        setOldPhone("");
        setNewPhone("");
        setNewPhoneCopy("");
    };

    const handleClose = _ => {
        setOpen(false);
        setTabIndex(0);
        setShowPassword(falseArr);

        clearMail();
        clearPassword();
        clearPhone();
    };

    const updateCredentials = _ => {
        Axios.post(ipPortApi + "updateUser" + (tabIndex === 0 ? "Mail" : (tabIndex === 1 ? "Password" : "Phone")) + "Reports/" + token,
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
                        oldPhone: oldPhone,
                        newPhone: newPhone,
                        newPhoneCopy: newPhoneCopy
                    }
                )
            )
        ).then(response => {
            if (response.data.messageOk) {
                enqueueSnackbar(response.data.messageOk, { variant: "success" });
                handleClose();
                logout();
            }
            else {
                enqueueSnackbar("Errore dal server: " + response.data.message, { variant: "error" });
            }
        }).catch(error => console.log(error));
    };

    useEffect(_ => {
        setShowPassword(falseArr);
        if (tabIndex === 0) {
            clearPassword();
            clearPhone();
        }
        else if (tabIndex === 1) {
            clearMail();
            clearPhone();
        }
        else {
            clearMail();
            clearPassword();
        }
    }, [tabIndex]);

    return (
        <>
            {
                sm ?
                    <StyledOutlinedButton onClick={_ => setOpen(true)} sx={{ fontFamily: "Graphik", fontSize: 15, whiteSpace: "nowrap", minWidth: "auto" }}>
                        Modifica credenziali
                    </StyledOutlinedButton>
                    :
                    <IconButton onClick={_ => setOpen(true)}>
                        <ManageAccountsIcon style={{ color: props.bluCamposampierese }} />
                    </IconButton>

            }
            <Dialog open={open} onClose={handleClose} PaperProps={{
                style: {
                    padding: sm ? 20 : 0,
                    minWidth: sm ? "60%" : "90%"
                }
            }}>
                <DialogTitle>
                    <Typography variant="dialogTitle">
                        Modifica credenziali
                    </Typography>
                </DialogTitle>
                <form ref={formRef}>
                    <DialogContent sx={{ padding: sm ? "5px 10px" : "5px 5px" }}>
                        <Tabs value={tabIndex} onChange={(event, value) => setTabIndex(value)} variant="fullWidth" sx={{ borderRadius: "4px" }}>
                            {[0, 1, 2].map((element, index) =>
                                <StyledTab label={element === 0 ? "Indirizzo mail" : (element === 1 ? "Password" : "Numero")} value={element} key={index} />
                            )}
                        </Tabs>
                        <Grid container direction={sm ? "row" : "column"} justifyContent="space-between" alignItems="center"
                            sx={{
                                "& .MuiGrid-item": {
                                    width: "100%"
                                }
                            }} >
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
                                                        "labelPlaceholder": "Numero attuale (se presente)",
                                                        "value": oldPhone,
                                                        "onChange": setOldPhone,
                                                        "helperText": "Inserisci il numero attualmente in uso (se presente)"
                                                    },
                                                    {
                                                        "labelPlaceholder": "Nuovo numero italiano (vuoto per eliminare quello presente)",
                                                        "value": newPhone,
                                                        "onChange": setNewPhone,
                                                        "helperText": "Inserisci il nuovo numero italiano (vuoto per eliminare quello presente)"
                                                    },
                                                    {
                                                        "labelPlaceholder": "Ripeti nuovo numero",
                                                        "value": newPhoneCopy,
                                                        "onChange": setNewPhoneCopy,
                                                        "helperText": "Ripeti il nuovo numero"
                                                    }
                                                ]
                                        )
                                ).map((el, index) =>
                                    <Grid item p={1} key={index}>
                                        <StyledFilledTextField
                                            variant="filled"
                                            style={{ marginTop: 10 }}
                                            label={el.labelPlaceholder}
                                            placeholder={el.labelPlaceholder}
                                            type={((index === 0 ? showPassword[0] : showPassword[1]) || tabIndex !== 1) ? "text" : "password"}
                                            fullWidth
                                            required={tabIndex !== 2}
                                            value={el.value}
                                            onChange={(e) => el.onChange(e.target.value)}
                                            inputProps={{ ...(tabIndex === 0 ? { maxLength: 320 } : (tabIndex === 2 ? { maxLength: 20 } : {})) }}
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
                </form>
            </Dialog>
        </>
    );
}