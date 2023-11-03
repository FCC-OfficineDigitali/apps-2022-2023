import React, { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Table,
    TableBody,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import { Add, Edit, Email, Phone, Remove } from "@mui/icons-material";
import { StyledFab, StyledOutlinedButton, StyledTableCell } from "../styles";
import Axios from "axios";
import moment from "moment";
import ipPortApi from "../ipPortApi";
import CoWorkerDialogBtnComp from "./CoWorkerDialogBtnComp";

export default function CoWorkersComp(props) {
    const [coWorkersList, setCoWorkersList] = useState([]);
    const [updateToggle, setUpdateToggle] = useState(false);
    const [disableAddOrEnableCoWorker, setDisableAddOrEnableCoWorker] = useState(false);
    const [open, setOpen] = useState(false);
    const [cwData, setCwData] = useState(null);
    const [roomsList, setRoomsList] = useState([]);

    const handleClickOpen = obj => { setCwData(obj); setOpen(true); };

    const handleClickToUpdate = _ => setUpdateToggle(!updateToggle);

    const clickToManageStatus = (coworker_id, isAdd) => {
        if (window.confirm("Vuoi davvero " + (isAdd ? "riaggiungere" : "disattivare") + " il co-worker?"))
            Axios.put(ipPortApi + "updateCoWorkerStatusFromId/" + coworker_id + "&act=" + (isAdd ? 1 : 0) + "&tkn=" + props.token)
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

    useEffect(_ => {
        Axios.get(ipPortApi + "getCoWorkersInfo/" + props.token)
            .then(data => {
                if (data.data.message) {
                    props.enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                    setCoWorkersList([]);
                }
                else
                    setCoWorkersList(data.data);
            })
            .catch(error => { setCoWorkersList([]); console.log(error); });
    }, [updateToggle]);

    const fetchRooms = _ => {
        Axios.get(ipPortApi + "getRoomsInfo/" + props.token)
            .then(data => {
                if (data.data.message) {
                    props.enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                    setRoomsList([]);
                }
                else
                    setRoomsList(data.data);
            })
            .catch(error => { setRoomsList([]); console.log(error); });
    };

    useEffect(_ => {
        fetchRooms();
    }, []);

    useEffect(_ => {
        setDisableAddOrEnableCoWorker(roomsList.some(r => r.room_type.localeCompare("smart working") === 0 && coWorkersList.filter(cw => cw.deleted === 0).length >= r.seats_nr));
    }, [roomsList, coWorkersList]);

    return (
        <>
            <CoWorkerDialogBtnComp cwData={cwData} enqueueSnackbar={props.enqueueSnackbar} handleClickToUpdate={handleClickToUpdate} open={open} setCwData={setCwData} setOpen={setOpen} sm={props.sm} theme={props.theme} token={props.token} />
            <Box {...(props.sm ? { display: "flex", justifyContent: "right", my: 3 } : { m: 3 })} style={{ ...(!props.sm && { position: "fixed", bottom: "0", right: "0", zIndex: "1000" }) }}>
                <StyledFab
                    variant="extended"
                    disabled={disableAddOrEnableCoWorker}
                    style={{ background: disableAddOrEnableCoWorker ? props.theme.palette.primary.disabledGrey : props.theme.palette.primary.main }}
                    onClick={_ => handleClickOpen(null)}>
                    <Add sx={{ mr: props.sm ? 1 : 0 }} />
                    {props.sm ? "Nuovo co-worker" : "Nuovo"}
                </StyledFab>
            </Box>
            {coWorkersList.length > 0 ?
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
                                    {["Co-worker", "Attivo", "Inserito il", "Valido dal/disattivato il", ...(props.lg ? ["Telefono", "Mail"] : []), "Azioni"].map((val, i, headArr) =>
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
                                coWorkersList.map((obj, i) =>
                                    <TableRow key={i}>
                                        {props.sm ?
                                            <>
                                                <StyledTableCell style={{ wordBreak: "break-all" }}>
                                                    {obj.name + " " + obj.surname}
                                                </StyledTableCell>
                                                <StyledTableCell>
                                                    {obj.deleted ? "No" : "Si"}
                                                </StyledTableCell>
                                                <StyledTableCell>
                                                    {props.capitalize(moment(obj.insert_date).format((props.sm ? "dddd " : "ddd.") + " D " + (props.sm ? "MMMM" : "MMM.") + " YYYY"))}
                                                </StyledTableCell>
                                                <StyledTableCell style={{ color: obj.deleted ? props.theme.palette.primary.grey : (moment(obj.valid_from).isAfter(moment()) ? props.theme.palette.primary.orange : props.theme.palette.primary.green) }}>
                                                    {props.capitalize(moment(obj.deleted ? obj.deleted_date : obj.valid_from).format((props.sm ? "dddd " : "ddd.") + " D " + (props.sm ? "MMMM" : "MMM.") + " YYYY"))}
                                                </StyledTableCell>
                                                {
                                                    props.lg &&
                                                    <>
                                                        <StyledTableCell>
                                                            <a title="Chiama il co-worker" href={"tel:" + obj.phone} style={{ color: props.theme.palette.primary.main }}>
                                                                {obj.phone}
                                                            </a>
                                                        </StyledTableCell>
                                                        <StyledTableCell style={{ wordBreak: "break-all" }}>
                                                            <a title="Invia mail al co-worker" href={"mailto:" + obj.mail} style={{ color: props.theme.palette.primary.main }}>
                                                                {obj.mail}
                                                            </a>
                                                        </StyledTableCell>
                                                    </>
                                                }
                                                <StyledTableCell align="right">
                                                    <Grid container direction="row" justifyContent="flex-end" alignItems="center">
                                                        {
                                                            !props.lg &&
                                                            <>
                                                                <Grid item style={{ padding: "8px" }}>
                                                                    <StyledOutlinedButton onClick={_ => {
                                                                        window.location.href = "tel:" + obj.phone;
                                                                    }}>
                                                                        Chiama
                                                                    </StyledOutlinedButton>
                                                                </Grid>
                                                                <Grid item style={{ padding: "8px" }}>
                                                                    <StyledOutlinedButton onClick={_ => {
                                                                        window.location.href = "mailto:" + obj.mail;
                                                                    }}>
                                                                        Invia mail
                                                                    </StyledOutlinedButton>
                                                                </Grid>
                                                            </>
                                                        }
                                                        <Grid item p={1}>
                                                            <StyledOutlinedButton
                                                                disabled={obj.deleted === 1}
                                                                style={{ borderColor: obj.deleted ? props.theme.palette.primary.disabledGrey : props.theme.palette.primary.main }}
                                                                onClick={_ => handleClickOpen(obj)}>
                                                                {props.sm ?
                                                                    "Modifica"
                                                                    :
                                                                    <Edit style={{ color: props.theme.palette.primary.main }} />
                                                                }
                                                            </StyledOutlinedButton>
                                                        </Grid>
                                                        <Grid item style={{ padding: props.lg ? "8px 0px 8px 8px" : "8px" }}>
                                                            <StyledOutlinedButton
                                                                disabled={obj.deleted === 1 && disableAddOrEnableCoWorker}
                                                                style={{ borderColor: (obj.deleted === 1 && disableAddOrEnableCoWorker) ? props.theme.palette.primary.disabledGrey : props.theme.palette.primary.main }}
                                                                onClick={_ => {
                                                                    clickToManageStatus(obj.coworker_id, obj.deleted ? true : false);
                                                                }}>
                                                                {obj.deleted ? "Riaggiungi" : "Disattiva"}
                                                            </StyledOutlinedButton>
                                                        </Grid>
                                                    </Grid>
                                                </StyledTableCell>
                                            </>
                                            :
                                            <StyledTableCell>
                                                <Box align="left" p={1}>
                                                    {[
                                                        ["Co-worker", obj.name + " " + obj.surname],
                                                        ["Attivo", obj.deleted ? "No" : "Si"],
                                                        ["Inserito il", props.capitalize(moment(obj.insert_date).format("ddd. D MMM. YYYY"))]
                                                    ].map(([title, val], k) =>
                                                        <Box key={k}>
                                                            <Typography variant="data" component="span" style={{ fontWeight: "bold" }}>{title + ": "}</Typography>
                                                            <Typography variant="data" component="span">{val}</Typography>
                                                        </Box>
                                                    )}
                                                    <Box>
                                                        <Typography variant="data" component="span"
                                                            style={{ fontWeight: "bold" }}
                                                        >{(obj.deleted ? "Disattivato il" : "Valido dal") + ": "}</Typography>
                                                        <Typography variant="data" component="span"
                                                            color={obj.deleted ? props.theme.palette.primary.red : (moment(obj.valid_from).isAfter(moment()) ? props.theme.palette.primary.orange : props.theme.palette.primary.green)}
                                                        >{props.capitalize(moment(obj.deleted ? obj.deleted_date : obj.valid_from).format("ddd. D MMM. YYYY"))}</Typography>
                                                    </Box>
                                                </Box>
                                                <Grid container direction="row" justifyContent="space-between" alignItems="center" py={1}>
                                                    <Grid item>
                                                        <StyledOutlinedButton onClick={_ => {
                                                            window.location.href = "tel:" + obj.phone;
                                                        }}>
                                                            <Phone style={{ color: props.theme.palette.primary.main }} />
                                                        </StyledOutlinedButton>
                                                    </Grid>
                                                    <Grid item>
                                                        <StyledOutlinedButton onClick={_ => {
                                                            window.location.href = "mailto:" + obj.mail;
                                                        }}>
                                                            <Email style={{ color: props.theme.palette.primary.main }} />
                                                        </StyledOutlinedButton>
                                                    </Grid>
                                                    <Grid item>
                                                        <StyledOutlinedButton
                                                            disabled={obj.deleted === 1}
                                                            style={{ borderColor: obj.deleted ? props.theme.palette.primary.disabledGrey : props.theme.palette.primary.main }}
                                                            onClick={_ => handleClickOpen(obj)}>
                                                            {props.sm ?
                                                                "Modifica"
                                                                :
                                                                <Edit style={{ color: props.theme.palette.primary.main }} />
                                                            }
                                                        </StyledOutlinedButton>
                                                    </Grid>
                                                    <Grid item>
                                                        <StyledOutlinedButton
                                                            disabled={obj.deleted === 1 && disableAddOrEnableCoWorker}
                                                            style={{ borderColor: (obj.deleted === 1 && disableAddOrEnableCoWorker) ? props.theme.palette.primary.disabledGrey : props.theme.palette.primary.main }}
                                                            onClick={_ => clickToManageStatus(obj.coworker_id, obj.deleted ? true : false)}>
                                                            {obj.deleted ?
                                                                <Add style={{ color: (obj.deleted === 1 && disableAddOrEnableCoWorker) ? props.theme.palette.primary.disabledGrey : props.theme.palette.primary.main }} />
                                                                :
                                                                <Remove style={{ color: props.theme.palette.primary.main }} />
                                                            }
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
                        Nessun co-worker presente.
                    </Typography>
                </Box>
            }
        </>
    );
}