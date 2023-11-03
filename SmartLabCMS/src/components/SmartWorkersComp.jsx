import React, { useEffect, useState } from "react";
import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    Grid,
    Rating,
    Table,
    TableBody,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import { Email, Payment, Star } from "@mui/icons-material";
import moment from "moment";
import { StyledOutlinedButton, StyledTableCell, StyledTextButton } from "../styles";
import Axios from "axios";
import ipPortApi from "../ipPortApi";

export default function SmartWorkersComp(props) {
    const [smartWorkersList, setSmartWorkersList] = useState([]);
    const [updateToggle, setUpdateToggle] = useState(false);
    const [smartWorkerScores, setSmartWorkerScores] = useState([]);
    const [openRatings, setOpenRatings] = useState(false);

    const handleClickToUpdate = _ => setUpdateToggle(!updateToggle);

    const disableIfContract = (has_contract, contract_dt) => has_contract === 1 && moment().isSame(moment(contract_dt).format("YYYY-MM-DD"), "year");

    const clickToManageStatus = (smartworker_id) => {
        if (window.confirm("Vuoi davvero contrattualizzare lo smart-worker?"))
            Axios.put(ipPortApi + "updateSmartWorkerContractFromId/" + smartworker_id + "&tkn=" + props.token)
                .then(response => {
                    if (response.data.messageOk) {
                        props.enqueueSnackbar(response.data.messageOk, { variant: "success" });
                        handleClickToUpdate();
                    }
                    else
                        props.enqueueSnackbar("Errore dal server: " + response.data.message, { variant: "error" });
                })
                .catch(error => console.log(error));
    };

    const getSmartWorkerScoresButton = (score_about_call, score_about_working, score_about_conference) => {
        const hasRatings = [score_about_call, score_about_working, score_about_conference].some(e => e !== 0);
        return (
            <StyledOutlinedButton
                disabled={!hasRatings}
                style={{ borderColor: hasRatings ? props.theme.palette.primary.main : props.theme.palette.primary.disabledGrey }}
                onClick={_ => { setSmartWorkerScores([score_about_call, score_about_working, score_about_conference]); setOpenRatings(true); }}>
                <Star style={{ color: hasRatings ? props.theme.palette.primary.main : props.theme.palette.primary.disabledGrey }} />
            </StyledOutlinedButton>
        );
    };

    useEffect(_ => {
        Axios.get(ipPortApi + "getSmartWorkersInfo/" + props.token)
            .then(data => {
                if (data.data.message) {
                    props.enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                    setSmartWorkersList([]);
                }
                else
                    setSmartWorkersList(data.data);
            })
            .catch(error => { setSmartWorkersList([]); console.log(error); });
    }, [updateToggle]);

    return (
        <>
            <Dialog open={openRatings} PaperProps={{
                style: { ...(props.sm ? { padding: 20, minWidth: "60%" } : { width: "100vw", height: "100vh", position: "fixed", top: 35, borderRadius: "16px 16px 0px 0px" }) }
            }}>
                <Box style={{ ...(!props.sm && { display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }) }}>
                    <DialogContent>
                        <Typography variant="dialogTitle">
                            Esperienza con le sale relative a
                        </Typography>
                        <br />
                        <br />
                        <Grid container direction={props.sm ? "row" : "column"} justifyContent="space-between" alignItems="center"
                            sx={{
                                "& .MuiGrid-item": {
                                    width: "100%"
                                }
                            }}>
                            {
                                ["Call", "Co-Working/Smart Working", "Conferenze"].map((rt, index) => (
                                    smartWorkerScores[index] > 0 &&
                                    <Grid item py={1} key={index}>
                                        <Typography variant="infoText" component="legend">{rt}</Typography>
                                        <Rating
                                            name={rt}
                                            value={smartWorkerScores[index]}
                                            readOnly
                                            size="large"
                                        />
                                    </Grid>
                                ))
                            }
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <StyledTextButton
                            onClick={_ => { setOpenRatings(false); setSmartWorkerScores([]); }}
                        >
                            Chiudi
                        </StyledTextButton>
                    </DialogActions>
                </Box>
            </Dialog>
            {smartWorkersList.length > 0 ?
                <Box>
                    <Table sx={{
                        "& .MuiTableCell-root": {
                            padding: props.sm ? "16px" : "8px",
                            ...(!props.sm && { textAlign: "center" })
                        }
                    }}>
                        {
                            props.sm &&
                            <TableHead>
                                <TableRow style={{ backgroundColor: props.theme.palette.primary.mainLighter }}>
                                    {["Smart-worker", "Utilizzo previsto", "Contrattualizzato", "Ore Totali", "Ore da ult. Rinnovo", ...(props.lg ? ["Mail"] : []), "Azioni"].map((val, i, headArr) =>
                                    (
                                        <StyledTableCell style={{ fontWeight: "bold", ...(i === headArr.length - 1 && { textAlign: "right" }) }} key={i}>
                                            {val}
                                        </StyledTableCell>
                                    )
                                    )}
                                </TableRow>
                            </TableHead>
                        }
                        <TableBody>
                            {
                                smartWorkersList.map((obj, i) =>
                                    <TableRow key={i}>
                                        {props.sm ?
                                            <>
                                                <StyledTableCell style={{ wordBreak: "break-all" }}>
                                                    {obj.name + " " + obj.surname}
                                                </StyledTableCell>
                                                <StyledTableCell>
                                                    {obj.main_usage}
                                                </StyledTableCell>
                                                <StyledTableCell>
                                                    {(disableIfContract(obj.has_contract, obj.contract_dt) ? "Si" : "No")}
                                                </StyledTableCell>
                                                <StyledTableCell style={{ color: props.theme.palette.primary.orange }}>
                                                    {obj.all_reservations_count}
                                                </StyledTableCell>
                                                <StyledTableCell style={{ color: props.theme.palette.primary.green }}>
                                                    {obj.post_renew_reservations_count}
                                                </StyledTableCell>
                                                {
                                                    props.lg &&
                                                    <StyledTableCell style={{ wordBreak: "break-all" }}>
                                                        <a title="Invia mail allo smart-worker" href={"mailto:" + obj.mail} style={{ color: props.theme.palette.primary.main }}>
                                                            {obj.mail}
                                                        </a>
                                                    </StyledTableCell>
                                                }
                                                <StyledTableCell align="right">
                                                    <Grid container direction="row" justifyContent="flex-end" alignItems="center">
                                                        {
                                                            !props.lg &&
                                                            <Grid item style={{ padding: "8px" }}>
                                                                <StyledOutlinedButton onClick={_ => {
                                                                    window.location.href = "mailto:" + obj.mail;
                                                                }}>
                                                                    Invia mail
                                                                </StyledOutlinedButton>
                                                            </Grid>
                                                        }
                                                        <Grid item style={{ padding: "8px" }}>
                                                            {getSmartWorkerScoresButton(obj.score_about_call, obj.score_about_working, obj.score_about_conference)}
                                                        </Grid>
                                                        <Grid item style={{ padding: props.lg ? "8px 0px 8px 8px" : "8px" }}>
                                                            <StyledOutlinedButton
                                                                disabled={disableIfContract(obj.has_contract, obj.contract_dt)}
                                                                style={{ borderColor: disableIfContract(obj.has_contract, obj.contract_dt) ? props.theme.palette.primary.disabledGrey : props.theme.palette.primary.main }}
                                                                onClick={_ => clickToManageStatus(obj.account_id)}>
                                                                {(obj.contract_dt && !disableIfContract(obj.has_contract, obj.contract_dt)) ? "Rinnova" : "Onboarding"}
                                                            </StyledOutlinedButton>
                                                        </Grid>
                                                    </Grid>
                                                </StyledTableCell>
                                            </>
                                            :
                                            <StyledTableCell>
                                                <Box align="left" p={1}>
                                                    {[
                                                        ["Smart-worker", obj.name + " " + obj.surname],
                                                        ["Utilizzo previsto", obj.main_usage],
                                                        ["Contrattualizzato", disableIfContract(obj.has_contract, obj.contract_dt) ? "Si" : "No"]
                                                    ].map(([title, val], k) =>
                                                        <Box key={k}>
                                                            <Typography variant="data" component="span" style={{ fontWeight: "bold" }}>{title + ": "}</Typography>
                                                            <Typography variant="data" component="span">{val}</Typography>
                                                        </Box>
                                                    )}
                                                    <Box>
                                                        <Typography variant="data" component="span" style={{ fontWeight: "bold" }}>Ore Totali: </Typography>
                                                        <Typography variant="data" component="span" color={props.theme.palette.primary.orange}>{obj.all_reservations_count}</Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="data" component="span" style={{ fontWeight: "bold" }}>Ore da ult. Rinnovo: </Typography>
                                                        <Typography variant="data" component="span" color={props.theme.palette.primary.green}>{obj.post_renew_reservations_count}</Typography>
                                                    </Box>
                                                </Box>
                                                <Grid container direction="row" justifyContent="space-between" alignItems="center" py={1}>
                                                    <Grid item>
                                                        <StyledOutlinedButton onClick={_ => {
                                                            window.location.href = "mailto:" + obj.mail;
                                                        }}>
                                                            <Email style={{ color: props.theme.palette.primary.main }} />
                                                        </StyledOutlinedButton>
                                                    </Grid>
                                                    {getSmartWorkerScoresButton(obj.score_about_call, obj.score_about_working, obj.score_about_conference)}
                                                    <Grid item>
                                                        <StyledOutlinedButton
                                                            disabled={disableIfContract(obj.has_contract, obj.contract_dt)}
                                                            style={{ borderColor: disableIfContract(obj.has_contract, obj.contract_dt) ? props.theme.palette.primary.disabledGrey : props.theme.palette.primary.main }}
                                                            onClick={_ => clickToManageStatus(obj.account_id)}>
                                                            <Payment style={{ color: disableIfContract(obj.has_contract, obj.contract_dt) ? props.theme.palette.primary.disabledGrey : props.theme.palette.primary.main }} />
                                                        </StyledOutlinedButton>
                                                    </Grid>
                                                </Grid>
                                            </StyledTableCell>
                                        }
                                    </TableRow>
                                )
                            }
                        </TableBody>
                    </Table>
                </Box>
                :
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="h5" textAlign="center">
                        Nessuno smart-worker presente.
                    </Typography>
                </Box>
            }
        </>
    );
}