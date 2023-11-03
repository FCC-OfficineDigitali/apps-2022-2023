import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogContent,
    InputAdornment,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import Axios from "axios";
import ipPortApi from "../ipPortApi";
import AppBarComp from "../components/AppBarComp";
import FooterComp from "../components/FooterComp";
import { LargerThanSm, LargerThanLg } from "../MediaQueries";
import { StyledAutocomplete, StyledTextButton } from "../styles";

export default function Sign() {
    const theme = useTheme();
    const sm = LargerThanSm();
    const lg = LargerThanLg();
    const formRef = useRef();
    const footer = useRef(null);
    const [footerHeight, setFooterHeight] = useState(0);

    const [showPassword, setShowPassword] = useState(false);
    const [mail, setMail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCopy, setPasswordCopy] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [mainUsage, setMainUsage] = useState(null);
    const [rulesAccepted, setRulesAccepted] = useState(false);
    const [status, setStatus] = useState("");
    const [isMessageOk, setIsMessageOk] = useState(false);
    const [mainUsageOptions, setMainUsageOptions] = useState([]);

    const handleClickShowPassword = _ => setShowPassword(!showPassword);

    const handleChangeRulesAccepted = event => setRulesAccepted(event.target.checked);

    const Sign = _ => {
        Axios.post(ipPortApi + "signUpReservations", {
            mail: mail,
            password: password,
            passwordCopy: passwordCopy,
            name: name,
            surname: surname,
            mainUsage: mainUsage,
            rulesAccepted: rulesAccepted
        }).then(response => {
            if (response.data.messageOk) {
                setStatus(response.data.messageOk);
                setIsMessageOk(true);
            }
            else {
                setStatus("Errore dal server: " + response.data.message);
            }
        }).catch(error => console.log(error));
    };

    const setEmpty = _ => {
        setShowPassword(false);
        setMail("");
        setPassword("");
        setPasswordCopy("");
        setName("");
        setSurname("");
        setMainUsage(null);
        setRulesAccepted(false);
        setStatus("");
        setIsMessageOk(false);
    };

    useEffect(_ => {
        Axios.get(ipPortApi + "getMainUsageOptions")
            .then(data => setMainUsageOptions(data.data.sort())).catch(error => console.log(error));
    }, []);

    useEffect(_ => {
        const { current } = footer;
        if (!current)
            return;

        const updateHeight = _ => footer.current && setFooterHeight(footer.current.clientHeight);
        updateHeight();

        const obs = new ResizeObserver(updateHeight);
        obs.observe(current);

        return _ => obs.unobserve(current);
    }, []);

    return (
        <>
            <Box style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
                <AppBarComp />
                <Dialog open={true}
                    BackdropProps={{
                        style: {
                            backgroundColor: theme.palette.primary.white,
                            opacity: "50%"
                        }
                    }}
                    PaperProps={{
                        style: {
                            maxWidth: sm ? (lg ? "25vw" : "50vw") : "100vw",
                            padding: sm ? 20 : 0,
                            position: "fixed",
                            top: 35,
                            height: "calc(100vh - " + (sm ? footerHeight : "0") + "px - 35px - 32px)",
                            ...(!sm && { width: "100vw", borderRadius: "16px 16px 0px 0px" })
                        }
                    }}
                >
                    <DialogContent>
                        {isMessageOk ?
                            <Box textAlign="center">
                                <Typography variant="h4">Registrazione riuscita</Typography>
                                <Typography variant="h5" style={{ marginTop: 30, marginBottom: 20 }}>{status}</Typography>
                                <Typography variant="h5" style={{ marginBottom: 60 }}>
                                    <a title={"Accedi alla webapp"} href={"//officinedigitali.fcc.veneto.it/SmartLab"} style={{ color: theme.palette.primary.main }}>Accedi alla webapp</a>
                                </Typography>
                                <StyledTextButton onClick={setEmpty}>
                                    Registra un altro utente
                                </StyledTextButton>
                            </Box>
                            :
                            <>
                                <Typography variant="h4" align="center">Registrazione</Typography>
                                <form ref={formRef}>
                                    <TextField type="text" label="Indirizzo mail" placeholder="Inserisci indirizzo mail" autoComplete="on" required fullWidth
                                        style={{ marginTop: 30 }} value={mail} onChange={(e) => setMail(e.target.value.trim())} inputProps={{ maxLength: 320 }} />
                                    <TextField type={showPassword ? "text" : "password"} label="Password" placeholder="Inserisci password" autoComplete="on" required fullWidth
                                        style={{ marginBottom: 20, marginTop: 20 }} value={password} onChange={(e) => setPassword(e.target.value)}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <StyledTextButton onClick={handleClickShowPassword}>
                                                        {showPassword ? "Nascondi" : "Mostra"}
                                                    </StyledTextButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                    <TextField type={showPassword ? "text" : "password"} label="Ripeti Password" placeholder="Ripeti password" autoComplete="on" required fullWidth
                                        style={{ marginBottom: 20 }} value={passwordCopy} onChange={(e) => setPasswordCopy(e.target.value)} />
                                    <TextField type="text" label="Inserisci nome" placeholder="Inserisci nome" autoComplete="on" required fullWidth
                                        style={{ marginBottom: 20 }} value={name} onChange={(e) => setName(e.target.value)} inputProps={{ maxLength: 100 }} />
                                    <TextField type="text" label="Inserisci cognome" placeholder="Inserisci cognome" autoComplete="on" required fullWidth
                                        style={{ marginBottom: 20 }} value={surname} onChange={(e) => setSurname(e.target.value)} inputProps={{ maxLength: 100 }} />
                                    <StyledAutocomplete
                                        id="Categoria"
                                        fullWidth
                                        value={mainUsage}
                                        onChange={(event, value, reason) => setMainUsage(value)}
                                        options={mainUsageOptions}
                                        renderInput={params => (
                                            <TextField
                                                {...params}
                                                variant="outlined"
                                                label="Categoria"
                                                placeholder="Seleziona categoria..."
                                                required
                                            />
                                        )}
                                        style={{ marginBottom: 20 }}
                                    />
                                    <Box sx={{ display: "flex", alignItems: "center", pb: 4 }}>
                                        <Checkbox checked={rulesAccepted} onChange={handleChangeRulesAccepted} inputProps={{ "aria-label": "Regole sull'utilizzo degli spazi" }} />
                                        <Typography variant="infoText">
                                            Accetto di rispettare le
                                            <br />
                                            <a title={"Apri le regole sull'utilizzo degli spazi"} href={".#/rules"} target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.main }}>regole sull'utilizzo degli spazi</a>
                                        </Typography>
                                    </Box>
                                    <Button variant="contained" type="submit" fullWidth
                                        style={{ marginBottom: 20 }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (formRef.current.reportValidity())
                                                Sign();
                                        }}
                                        sx={{
                                            "&:hover": {
                                                background: theme.palette.primary.mainLight
                                            }
                                        }}>Registrati</Button>
                                </form>
                                <Box textAlign="center">
                                    <Box pb={4} pt={2}>
                                        <Typography variant="infoText">
                                            <a title={"Apri l'informativa dati"} href={".#/privacyPolicy"} target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.main }}>Privacy Policy</a>
                                        </Typography>
                                    </Box>
                                    <Typography variant="h5">{status}</Typography>
                                </Box>
                            </>
                        }
                    </DialogContent>
                </Dialog>
                {sm &&
                    <Box style={{ marginTop: "auto" }} ref={footer}>
                        <FooterComp />
                    </Box>
                }
            </Box >
        </>
    );
}