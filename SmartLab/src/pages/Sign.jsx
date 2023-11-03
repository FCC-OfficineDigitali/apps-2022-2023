import React, { useRef, useState } from "react";
import {
    Box,
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

export default function Sign() {
    const theme = useTheme();
    const sm = LargerThanSm();
    const lg = LargerThanLg();
    const formRef = useRef();
    const { login } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const [showPassword, setShowPassword] = useState(false);
    const [mail, setMail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("");

    const handleClickShowPassword = _ => setShowPassword(!showPassword);

    const setEmpty = _ => {
        setMail("");
        setPassword("");
    };

    const Sign = _ => {
        Axios.post(ipPortApi + "loginReservations", {
            mail: mail,
            password: password,
            appType: "fe63849ee9cc5df870c3461729c79a0e9aee5e7a"
        }).then(response => {
            if (response.data.messageOk) {
                setStatus(response.data.messageOk);
                enqueueSnackbar(response.data.messageOk, { variant: "success" });
                login({ mail: mail, password: password });
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
                        ...(!sm && { width: "100vw", height: "calc(100vh - 35px - 32px)", borderRadius: "16px 16px 0px 0px" })
                    }
                }}
            >
                <DialogContent>
                    <Typography variant="h4" align="center">Login</Typography>
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
                            }}>Accedi</Button>
                    </form>
                    <Box textAlign="center">
                        <Box pb={4} pt={2}>
                            <Typography variant="infoText">
                                <a title="Apri la privacy policy" href=".#/privacyPolicy" target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.main }}>Privacy Policy</a>
                            </Typography>
                        </Box>
                        <Typography variant="h5">{status}</Typography>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}