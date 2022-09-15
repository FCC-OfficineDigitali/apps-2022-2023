import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Dialog,
    DialogContent,
    InputAdornment,
    Link,
    TextField,
    Typography
} from "@mui/material";
import ipPortApi from "../ipPortApi";
import { useAuth } from "../hooks/useAuth";
import { IsUsingCookies } from "../components/CookieComp";
import AppBarComp from "../components/AppBarComp";
import { LargerThanSm, LargerThanLg } from "../MediaQueries";
import Axios from "axios";
import { useSnackbar } from "notistack";
import { StyledTextButton } from "../styles";

export default function Sign() {
    const sm = LargerThanSm();
    const lg = LargerThanLg();
    const history = useNavigate();
    const formRef = useRef();
    const { login } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("");

    const white = "#FFFFFF";

    const handleClickShowPassword = _ => setShowPassword(!showPassword);
    const setEmpty = _ => { setUsername(""); setPassword("") };

    const Sign = _ => {
        Axios.post(ipPortApi + "login", {
            username: username,
            password: password,
        }).then(response => {
            if (response.data.messageOk) {
                if (IsUsingCookies()) {
                    setStatus(response.data.messageOk);
                    enqueueSnackbar(response.data.messageOk, { variant: "success" });
                    login({ username: username, password: password });
                }
                else {
                    setStatus("È necessario accettare l'utilizzo dei cookies o tecnologie simili");
                    setEmpty();
                }
            }
            else {
                setStatus("Errore dal server: " + response.data.message);
                setEmpty();
            }
        }).catch(error => console.log(error));
    };

    return (
        <>
            <AppBarComp />
            <Dialog open={true}
                BackdropProps={{
                    style: {
                        backgroundColor: white,
                        opacity: "50%"
                    }
                }}
                PaperProps={{
                    style: {
                        maxWidth: sm ? (lg ? "25vw" : "50vw") : "100vw",
                        padding: sm ? 20 : 0,
                        position: "fixed",
                        top: 35
                    }
                }}
            >
                <DialogContent>
                    <Typography variant="h4" align="center">Login</Typography>
                    <form ref={formRef}>
                        <TextField type="text" label="Nome utente" placeholder="Inserisci nome utente" autoComplete="on" required fullWidth
                            style={{ marginTop: 30 }} value={username} onChange={(e) => setUsername(e.target.value.trim())} />
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
                            }} />
                        <Button variant="contained" type="submit" fullWidth
                            style={{ marginBottom: 20 }}
                            onClick={(e) => { e.preventDefault(); if (formRef.current.reportValidity()) Sign() }}
                            sx={{
                                "&:hover": {
                                    background: "#24249C"
                                }
                            }}>Accedi</Button>
                    </form>
                    <Typography align="center">
                        <Link component="button" variant="infoText" onClick={_ => history("/informativaDati")} sx={{pb: 4}}>Informativa dati</Link>
                    </Typography>
                    <Typography variant="h5" align="center">{status}</Typography>
                </DialogContent>
            </Dialog>
        </>
    );
}