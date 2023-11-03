import React, { Fragment, useEffect, useState } from "react";
import {
    Box,
    Grid,
    Table,
    TableBody,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import { Close, Done, Email } from "@mui/icons-material";
import ipPortApi from "../ipPortApi";
import Axios from "axios";
import { StyledOutlinedButton, StyledTableCell } from "../styles";

export default function WaitingReservationsComp(props) {
    const [rowsList, setRowsList] = useState([]);
    const [updateToggle, setUpdateToggle] = useState(false);

    const handleClickToUpdate = _ => setUpdateToggle(!updateToggle);

    const manageReservation = (slots_arr, isAccept) => {
        Axios.put(ipPortApi + "manageConferenceReservations/" + isAccept + "&tkn=" + props.token, { slots_arr: slots_arr })
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

    const clickManage = (slot_id, i) => {
        if (window.confirm("Vuoi davvero " + (i ? "rifiutare" : "accettare") + " la prenotazione?"))
            manageReservation(slot_id, i === 1 ? -1 : 1);
    }

    useEffect(_ => {
        Axios.get(ipPortApi + "getConferenceReservations/0&tkn=" + props.token)
            .then(data => {
                if (data.data.message) {
                    props.enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                    setRowsList([]);
                }
                else
                    setRowsList(props.groupData(data.data));
            })
            .catch(error => { setRowsList([]); console.log(error); });
    }, [updateToggle]);

    return (
        <>
            {rowsList.length > 0 ?
                <Box p={1}>
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
                                    {["Prenotatore", "Orario", "Argomento", props.lg ? "N. Partecipanti" : "Part.", props.lg ? "Assistenza" : "Ass.", ...(props.lg ? ["Mail"] : []), "Azioni"].map((val, index3, headArr) =>
                                    (
                                        <StyledTableCell style={{ fontWeight: "bold", ...(index3 === headArr.length - 1 && { textAlign: "right" }) }} key={index3}>
                                            {val}
                                        </StyledTableCell>
                                    )
                                    )}
                                </TableRow>
                            </TableHead>
                        }
                        <TableBody>
                            {
                                rowsList.map((obj, i) =>
                                    <Fragment key={"d" + i}>
                                        <TableRow style={{ backgroundColor: props.theme.palette.primary.filledTextFieldDark }}>
                                            <StyledTableCell colSpan={props.sm ? 7 : 1}>
                                                <Typography variant="data" style={{ fontSize: "17.5px", fontWeight: "bold" }}>
                                                    {props.capitalize(props.moment(((Object.values(Object.values(obj)[0])[0])[0]).slot_day).format((props.sm ? "dddd " : "ddd.") + " D " + (props.sm ? "MMMM" : "MMM.") + " YYYY"))}
                                                </Typography>
                                            </StyledTableCell>
                                        </TableRow>
                                        {
                                            Object.keys(obj).map(index => {
                                                const obj2 = obj[index];
                                                return (
                                                    <Fragment key={"d" + i + "_rid" + index}>
                                                        <TableRow key={"d" + i + "_rid" + index} style={{ backgroundColor: props.theme.palette.primary.filledTextFieldLight }}>
                                                            <StyledTableCell colSpan={props.sm ? 7 : 1}>
                                                                <Typography variant="data" style={{ fontSize: "15px", fontWeight: "bold" }}>
                                                                    {(obj2[(Object.keys(obj2))[0]])[0].room_name_updatable}
                                                                </Typography>
                                                            </StyledTableCell>
                                                        </TableRow>
                                                        {
                                                            Object.keys(obj2).map(index2 => {
                                                                const obj3 = obj2[index2];
                                                                return (
                                                                    props.mergeSlots(obj3).map((val, pos) =>
                                                                        <TableRow key={"d" + i + "_rid" + index + "_uid" + index2 + "_ind" + pos}>
                                                                            {props.sm ?
                                                                                <>
                                                                                    {
                                                                                        [
                                                                                            val.name + " " + val.surname,
                                                                                            props.mergeTimeIntervals(val),
                                                                                            val.topic,
                                                                                            val.participants_nr,
                                                                                            val.needs_technical_assistance ? "Si" : "No"
                                                                                        ].map((el, k) =>
                                                                                            <StyledTableCell key={k} style={{ ...((k === 0 || k === 2) && { wordBreak: "break-all" }) }}>
                                                                                                {el}
                                                                                            </StyledTableCell>
                                                                                        )
                                                                                    }
                                                                                    {
                                                                                        props.lg &&
                                                                                        <StyledTableCell style={{ wordBreak: "break-all" }}>
                                                                                            <a title="Invia mail al prenotatore" href={"mailto:" + obj3[(Object.keys(obj3))[0]].mail} style={{ color: props.theme.palette.primary.main }}>
                                                                                                {obj3[(Object.keys(obj3))[0]].mail}
                                                                                            </a>
                                                                                        </StyledTableCell>
                                                                                    }
                                                                                    <StyledTableCell align="right">
                                                                                        <Grid container direction="row" justifyContent="flex-end" alignItems="center">
                                                                                            {
                                                                                                !props.lg &&
                                                                                                <Grid item style={{ padding: "8px" }}>
                                                                                                    <StyledOutlinedButton onClick={_ => {
                                                                                                        window.location.href = "mailto:" + obj3[(Object.keys(obj3))[0]].mail;
                                                                                                    }}>
                                                                                                        Invia mail
                                                                                                    </StyledOutlinedButton>
                                                                                                </Grid>
                                                                                            }
                                                                                            {
                                                                                                [false, true].map((b, i) =>
                                                                                                    <Grid item key={i} style={{ padding: i && props.lg ? "8px 0px 8px 8px" : "8px" }}>
                                                                                                        <StyledOutlinedButton onClick={_ => {
                                                                                                            clickManage(val.slot_id, i ? 0 : 1);
                                                                                                        }}>
                                                                                                            {i ? "Accetta" : "Rifiuta"}
                                                                                                        </StyledOutlinedButton>
                                                                                                    </Grid>
                                                                                                )
                                                                                            }
                                                                                        </Grid>
                                                                                    </StyledTableCell>
                                                                                </>
                                                                                :
                                                                                <StyledTableCell>
                                                                                    <Box align="left" p={1}>
                                                                                        {[
                                                                                            ["Prenotatore", val.name + " " + val.surname],
                                                                                            ["Orario", props.mergeTimeIntervals(val)],
                                                                                            ["Argomento", val.topic],
                                                                                            ["N. Partecipanti", val.participants_nr],
                                                                                            ["Assistenza", val.needs_technical_assistance ? "Si" : "No"]
                                                                                        ].map(([title, val], k) =>
                                                                                            <Box key={k}>
                                                                                                <Typography variant="data" component="span" style={{ fontWeight: "bold" }}>{title + ": "}</Typography>
                                                                                                <Typography variant="data" component="span">{val}</Typography>
                                                                                            </Box>
                                                                                        )}
                                                                                    </Box>
                                                                                    <Grid container direction="row" justifyContent="space-between" alignItems="center" py={1}>
                                                                                        <Grid item>
                                                                                            <StyledOutlinedButton onClick={_ => {
                                                                                                window.location.href = "mailto:" + obj3[(Object.keys(obj3))[0]].mail;
                                                                                            }}>
                                                                                                <Email style={{ color: props.theme.palette.primary.main }} />
                                                                                            </StyledOutlinedButton>
                                                                                        </Grid>
                                                                                        {
                                                                                            [false, true].map((b, i) =>
                                                                                                <Grid item key={i}>
                                                                                                    <StyledOutlinedButton onClick={_ => {
                                                                                                        clickManage(val.slot_id, i ? 0 : 1);
                                                                                                    }}>
                                                                                                        {i ?
                                                                                                            <Done style={{ color: props.theme.palette.primary.main }} />
                                                                                                            :
                                                                                                            <Close style={{ color: props.theme.palette.primary.main }} />
                                                                                                        }
                                                                                                    </StyledOutlinedButton>
                                                                                                </Grid>
                                                                                            )
                                                                                        }
                                                                                    </Grid>
                                                                                </StyledTableCell>
                                                                            }
                                                                        </TableRow>
                                                                    )
                                                                );
                                                            })
                                                        }
                                                    </Fragment>
                                                );
                                            })
                                        }
                                    </Fragment>
                                )
                            }
                        </TableBody>
                    </Table>
                </Box>
                :
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="h5" textAlign="center" color={props.theme.palette.primary.green}>
                        Tutto ok: hai già confermato tutte le prenotazioni in sospeso
                    </Typography>
                </Box>
            }
        </>
    );
}