import React, { useEffect, useRef, useState } from "react";
import {
    Button,
    Dialog,
    DialogContent,
    InputAdornment,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import ipPortApi from "../ipPortApi";
import { useAuth } from "../hooks/useAuth";
import AppBarComp from "../components/AppBarComp";
import { LargerThanSm, LargerThanLg } from "../MediaQueries";
import Axios from "axios";
import { useSnackbar } from "notistack";
import { StyledTextButton } from "../styles";
import { Box } from "@mui/system";

export default function Sign() {
    const theme = useTheme();
    const sm = LargerThanSm();
    const lg = LargerThanLg();
    const formRef = useRef();
    const { login } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [mail, setMail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCopy, setPasswordCopy] = useState("");
    const [phone, setPhone] = useState("");
    const [status, setStatus] = useState("");

    const handleClickShowPassword = _ => setShowPassword(!showPassword);

    const setEmpty = _ => {
        setMail("");
        setPassword("");
        setPasswordCopy("");
        setPhone("");
    };

    const Sign = _ => {
        Axios.post(ipPortApi + (isLogin ? "login" : "signUp") + "Reports", {
            mail: mail,
            password: password,
            ...(isLogin ? { appType: "4bed232a318792afd4d4d86be5d92574cb72c45b" } : { passwordCopy: passwordCopy, phone: phone })
        }).then(response => {
            if (response.data.messageOk) {
                setStatus(response.data.messageOk);
                enqueueSnackbar(response.data.messageOk, { variant: "success" });
                login({ mail: mail, password: password });
            }
            else {
                setStatus("Errore dal server: " + response.data.message);
                if (isLogin)
                    setEmpty();
            }
        }).catch(error => console.log(error));
    };

    useEffect(_ => {
        setEmpty();
        setShowPassword(false);
    }, [isLogin]);

    return (
        <>
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
                        top: 35
                    }
                }}
            >
                <DialogContent>
                    <Typography variant="h4" align="center">{isLogin ? "Login" : "Registrazione"}</Typography>
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
                        {
                            isLogin === false &&
                            <>
                                <TextField type={showPassword ? "text" : "password"} label="Ripeti Password" placeholder="Ripeti password" autoComplete="on" required fullWidth
                                    style={{ marginBottom: 20 }} value={passwordCopy} onChange={(e) => setPasswordCopy(e.target.value)} />
                                <TextField label="Inserisci numero di telefono/cellulare italiano (facoltativo)" placeholder="Inserisci numero di telefono/cellulare italiano (facoltativo)" autoComplete="on" fullWidth
                                    style={{ marginBottom: 20 }} value={phone} onChange={(e) => setPhone(e.target.value)} inputProps={{ maxLength: 20 }} />
                            </>
                        }
                        <Button variant="contained" type="submit" fullWidth
                            style={{ marginBottom: 20 }}
                            onClick={(e) => { e.preventDefault(); if (formRef.current.reportValidity()) Sign() }}
                            sx={{
                                "&:hover": {
                                    background: theme.palette.primary.mainLight
                                }
                            }}>{isLogin ? "Accedi" : "Registrati"}</Button>
                    </form>
                    <Box textAlign="center">
                        <StyledTextButton onClick={_ => { setIsLogin(!isLogin); setStatus(""); }}>
                            {isLogin ? "Registrati" : "Accedi"}
                        </StyledTextButton>
                        <br />
                        <Box pb={4} pt={2}>
                            <Typography variant="infoText">
                                <a title={"Apri la privacy policy"} href={".#/privacyPolicy"} target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.main }}>Privacy Policy</a>
                            </Typography>
                        </Box>
                        <Typography variant="h5">{status}</Typography>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}