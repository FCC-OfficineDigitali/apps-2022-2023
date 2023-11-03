import React, { useRef, useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, Grid, Rating, Typography } from "@mui/material";
import Axios from "axios";
import { useSnackbar } from "notistack";
import { useAuth } from "../hooks/useAuth";
import ipPortApi from "../ipPortApi";
import { LargerThanSm } from "../MediaQueries";
import { StyledTextButton } from "../styles";

export default function ScoreDialogComp(props) {
    const sm = LargerThanSm();
    const [open, setOpen] = useState(true);
    const [scores, setScores] = useState(props.scoresFieldsToFill.reduce((acc, val) => ({ ...acc, [val]: 0 }), {}));
    const formRef = useRef();
    const { token } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const updateScores = _ => {
        Axios.post(ipPortApi + "updateScores/" + token,
            {
                scores: scores
            }
        ).then(response => {
            if (response.data.messageOk) {
                enqueueSnackbar(response.data.messageOk, { variant: "success" });
                setOpen(false);
            }
            else
                enqueueSnackbar("Errore dal server: " + response.data.message, { variant: "error" });
        }).catch(error => console.log(error));
    };

    return (
        <>
            <Dialog open={open} PaperProps={{
                style: { ...(sm ? { padding: 20, minWidth: "60%" } : { width: "100vw", height: "100vh", position: "fixed", top: 35, borderRadius: "16px 16px 0px 0px" }) }
            }}>
                <form ref={formRef} style={{ height: "100%" }}>
                    <Box style={{ ...(!sm && { display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }) }}>
                        <DialogContent>
                            <Typography variant="dialogTitle">
                                Valuta la tua esperienza con le sale relative a
                            </Typography>
                            <br />
                            <br />
                            <Grid container direction={sm ? "row" : "column"} justifyContent="space-between" alignItems="center"
                                sx={{
                                    "& .MuiGrid-item": {
                                        width: "100%"
                                    }
                                }}>
                                {
                                    props.scoresFieldsToFill.map(col => {
                                        var about = col.substring(col.lastIndexOf("_") + 1);
                                        about = about.endsWith("working") ? "Co-Working/Smart Working" : props.capitalize(props.translateRoomType(about));
                                        return (
                                            <Grid item py={1} key={col}>
                                                <Typography variant="infoText" component="legend">{about}*</Typography>
                                                <Rating
                                                    name={about}
                                                    value={scores[col]}
                                                    onChange={(event, newScore) => {
                                                        const scoresCopy = { ...scores };
                                                        scoresCopy[col] = newScore;
                                                        setScores(scoresCopy);
                                                    }}
                                                    size="large"
                                                />
                                            </Grid>
                                        );
                                    })
                                }
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <StyledTextButton
                                type="submit"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (formRef.current.reportValidity())
                                        updateScores();
                                }}
                                disabled={Object.values(scores).some(val => [1, 2, 3, 4, 5].includes(val) === false)}
                            >
                                Fatto
                            </StyledTextButton>
                        </DialogActions>
                    </Box>
                </form>
            </Dialog>
        </>
    );
}