import { useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, Button, Dialog, DialogContent, InputAdornment, TextField, Typography } from "@mui/material";
import { LargerThanSm, LargerThanLg } from "../MediaQueries";
import { login } from "../services/apiSuperUsers";

export default function LoginComp() {
    const sm = LargerThanSm();
    const lg = LargerThanLg();

    const formRef = useRef();

    const [showPassword, setShowPassword] = useState(false);
    const [mail, setMail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("");

    const handleClickShowPassword = _ => setShowPassword(!showPassword);

    const setEmpty = _ => {
        setMail("");
        setPassword("");
    };

    if (status.startsWith("Accesso effettuato."))
        return (
            <Navigate to="/superuser" />
        );
    else
        return (
            <Dialog open={true}
                BackdropProps={{
                    style: {
                        backgroundColor: "white",
                        opacity: "50%"
                    }
                }}
                PaperProps={{
                    style: {
                        maxWidth: sm ? (lg ? "25vw" : "50vw") : "100vw",
                        padding: sm ? 20 : 0,
                        position: "fixed",
                        top: sm ? 100 : 35,
                        ...(!sm && { width: "100vw", height: "calc(100vh - 35px - 32px)", borderRadius: "16px 16px 0px 0px" })
                    }
                }}
            >
                <DialogContent align="center">
                    <Typography gutterBottom variant="h4" fontWeight="bold">Login</Typography>
                    <form ref={formRef}>
                        <TextField type="text" label="Indirizzo mail" placeholder="Inserisci indirizzo mail" autoComplete="on" required fullWidth
                            style={{ marginTop: 30 }} value={mail} onChange={e => setMail(e.target.value.trim())} inputProps={{ maxLength: 320 }} />
                        <TextField type={showPassword ? "text" : "password"} label="Password" placeholder="Inserisci password" autoComplete="on" required fullWidth
                            style={{ marginBottom: 20, marginTop: 20 }} value={password} onChange={e => setPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Button onClick={handleClickShowPassword}>
                                            {showPassword ? "Nascondi" : "Mostra"}
                                        </Button>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Button variant="contained" type="submit" fullWidth
                            style={{ marginBottom: 20 }}
                            onClick={e => {
                                e.preventDefault();
                                if (formRef.current.reportValidity())
                                    login(mail, password, setStatus, setEmpty);
                            }}
                        >Accedi</Button>
                    </form>
                    <Box textAlign="center">
                        <Box pb={4} pt={2}>
                            <Typography>
                                <a title="Apri la privacy policy" href=".#/privacyPolicy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                            </Typography>
                        </Box>
                        <Typography variant="h5">{status}</Typography>
                    </Box>
                </DialogContent>
            </Dialog>
        );
}