import React, { useEffect, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    CircularProgress,
    Table,
    TableBody,
    TableHead,
    TableRow,
    Typography,
    useTheme
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DoneIcon from "@mui/icons-material/Done";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../hooks/useAuth";
import ipPortApi from "../ipPortApi";
import Axios from "axios";
import moment from "moment";
import { useSnackbar } from "notistack";
import AppBarComp from "../components/AppBarComp";
import FooterComp from "../components/FooterComp";
import ReservationsDialogBtnComp from "../components/ReservationsDialogBtnComp";
import ScoreDialogComp from "../components/ScoreDialogComp";
import WelcomeDialogComp from "../components/WelcomeDialogComp";
import { LargerThanSm } from "../MediaQueries";
import { StyledOutlinedButton, StyledTableCell } from "../styles";

export default function Home() {
    const theme = useTheme();
    const [isShowingCircularProgress, setIsShowingCircularProgress] = useState(true);
    const [justOpened, setJustOpened] = useState(true);
    const [scoresFieldsToFill, setScoresFieldsToFill] = useState([]);
    const [rowsList, setRowsList] = useState([]);
    const [roomTypeTranslations, setRoomTypeTranslations] = useState([]);
    const [fixedMessage, setFixedMessage] = useState(null);
    const [updateToggle, setUpdateToggle] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const { token } = useAuth();
    const sm = LargerThanSm();
    const specialRoomTypeString = "conference";

    const isSpecialRoom = str => str.localeCompare(specialRoomTypeString) === 0;

    const addEpoch = time => "1970-01-01T" + time;

    const capitalize = str => str.toLowerCase().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

    const handleClickToUpdate = _ => setUpdateToggle(!updateToggle);

    const freeReservations = (slots_arr) => {
        Axios.put(ipPortApi + "freeReservations/" + token, { slots_arr: slots_arr })
            .then(response => {
                if (response.data.messageOk) {
                    enqueueSnackbar(response.data.messageOk, { variant: "success" });
                    handleClickToUpdate();
                }
                else
                    enqueueSnackbar("Errore dal server: " + response.data.message, { variant: "error" });
            })
            .catch(error => console.log(error));
    };

    const isMissingLessThanHrs = (d, t, hrs) => ((new Date(moment(d).format("YYYY-MM-DD") + "T" + t)).getTime() - new Date().getTime()) < (hrs * 3600000);

    const cancelButton = (slots_arr, slot_days_and_start_times, content) => {
        const disabled = slot_days_and_start_times.some(e => isMissingLessThanHrs(e[0], e[1], 24));
        return (
            <>
                <StyledOutlinedButton onClick={_ => {
                    if (window.confirm("Vuoi davvero disdire " + (slots_arr.length > 1 ? "le prenotazioni" : "la prenotazione") + "?"))
                        freeReservations(slots_arr);
                }}
                    disabled={disabled}
                    style={{ borderColor: disabled ? theme.palette.primary.disabledGrey : theme.palette.primary.main }}
                >
                    {content}
                    <DeleteIcon style={{ color: disabled ? theme.palette.primary.disabledGrey : theme.palette.primary.main }} />
                </StyledOutlinedButton>
            </>)
    };

    const translateRoomType = str => {
        const res = roomTypeTranslations.find(e => e[0].localeCompare(str) === 0);
        return res ? (res[1]).toLowerCase() : "";
    };

    useEffect(_ => {
        Axios.get(ipPortApi + "getRoomTypeTranslations")
            .then(data => setRoomTypeTranslations(data.data)).catch(error => console.log(error));

        Axios.get(ipPortApi + "getFixedMessage/" + token)
            .then(data => {
                if (data.data.message) {
                    enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                    setFixedMessage(null);
                }
                else
                    setFixedMessage(data.data);
            })
            .catch(error => { setFixedMessage(null); console.log(error); });
    }, []);

    useEffect(_ => {
        Axios.get(ipPortApi + "getReservations/" + token)
            .then(data => {
                if (data.data.message) {
                    enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                    setRowsList([]);
                }
                else {
                    const groupedData = Object.values(data.data.reduce((acc, obj) => {
                        const { slot_day, room_id } = obj;
                        if (!acc[slot_day])
                            acc[slot_day] = {};
                        if (!acc[slot_day][room_id])
                            acc[slot_day][room_id] = [];
                        acc[slot_day][room_id].push(obj);
                        return acc;
                    }, {}));
                    setRowsList(groupedData);
                }
            })
            .catch(error => { setRowsList([]); console.log(error); });
    }, [updateToggle]);

    useEffect(_ => {
        if (justOpened === true) {
            Axios.get(ipPortApi + "getScoresFieldsToFill/" + token)
                .then(data => {
                    if (data.data.message) {
                        enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                        setScoresFieldsToFill([]);
                    }
                    else
                        setScoresFieldsToFill(data.data);
                })
                .catch(error => { setScoresFieldsToFill([]); console.log(error); });
            setJustOpened(false);
        }
    }, [justOpened]);

    return (
        <>
            <Box style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
                <WelcomeDialogComp theme={theme} />
                {scoresFieldsToFill.length > 0 && <ScoreDialogComp capitalize={capitalize} translateRoomType={translateRoomType} scoresFieldsToFill={scoresFieldsToFill} />}
                <AppBarComp />
                <Box style={{ padding: "24px 8%" + (!sm ? "72px" : "") }}>
                    {
                        fixedMessage && fixedMessage.length > 0 &&
                        <Box display="flex" flexDirection={sm ? "row" : "column"} alignItems="center" justifyContent="space-between">
                            <Box
                                component="img"
                                src="./img/Warning.svg"
                                title="Warning"
                                alt="Warning"
                                display="block"
                                style={{ marginRight: sm ? "auto" : 0 }}
                            />
                            <Box my={3} p={2} textAlign="center" whiteSpace="pre-wrap">
                                <Typography variant="fixedMessage" fontSize={sm ? 28 : 20} lineHeight={sm ? "48px" : "36px"}>{fixedMessage}</Typography>
                            </Box>
                            {sm &&
                                <Box
                                    component="img"
                                    src="./img/Warning.svg"
                                    title="Warning"
                                    alt="Warning"
                                    display="block"
                                    style={{ marginLeft: "auto" }}
                                />
                            }
                        </Box>
                    }
                    <Box {...(sm ? { display: "flex", justifyContent: "right", my: 3 } : { m: 3 })} style={{ ...(!sm && { position: "fixed", bottom: "0", right: "0", zIndex: "1000" }) }}>
                        <ReservationsDialogBtnComp updateListFun={handleClickToUpdate} translateRoomType={translateRoomType} capitalize={capitalize} isSpecialRoom={isSpecialRoom} specialRoomTypeString={specialRoomTypeString} isShowingCircularProgress={isShowingCircularProgress} setIsShowingCircularProgress={setIsShowingCircularProgress} />
                    </Box>
                    {isShowingCircularProgress ?
                        <Box display="flex" justifyContent="center" alignItems="center">
                            <CircularProgress style={{ position: "absolute", top: "calc(50% - 20px)", left: "calc(50% - 20px)", transform: "translate(-50%, -50%)" }} />
                        </Box>
                        :
                        (
                            rowsList.length > 0 ?
                                <Box p={1}>
                                    <Typography variant="h1" pb={2} color={theme.palette.primary.functionalBlackCamposampierese} style={{ fontSize: 26 }}>Prenotate</Typography>
                                    {
                                        rowsList.map((obj, i) =>
                                            <Accordion key={"d" + i} disableGutters sx={{
                                                borderWidth: "none", boxShadow: "none",
                                                backgroundColor: theme.palette.primary.filledTextFieldDark
                                            }}>
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    aria-controls={"panel-d" + i + "-content"}
                                                    id={"panel-d" + i + "-header"}
                                                >
                                                    <Typography variant="data" style={{ fontSize: "17.5px", fontWeight: "bold" }}>{capitalize(moment(((Object.values(obj)[0])[0]).slot_day).format((sm ? "dddd " : "ddd.") + " D " + (sm ? "MMMM" : "MMM.") + " YYYY"))}</Typography>
                                                </AccordionSummary>
                                                <AccordionDetails sx={{ p: 0 }}>
                                                    {Object.keys(obj).map(index => {
                                                        const arr = obj[index];
                                                        return (
                                                            <Accordion key={"d" + i + "_rid" + index} disableGutters sx={{
                                                                borderWidth: "none", boxShadow: "none",
                                                                backgroundColor: theme.palette.primary.filledTextFieldLight
                                                            }}>
                                                                <AccordionSummary
                                                                    expandIcon={<ExpandMoreIcon />}
                                                                    aria-controls={"panel-d" + i + "_rid" + index + "-content"}
                                                                    id={"panel-d" + i + "_rid" + index + "-header"}
                                                                >
                                                                    <Typography variant="data" style={{ fontSize: "15px", fontWeight: "bold" }} title={arr[0].room_description.length > 0 ? arr[0].room_description : ""}>{arr[0].room_name_updatable}</Typography>
                                                                </AccordionSummary>
                                                                <AccordionDetails sx={{ p: 0, backgroundColor: theme.palette.primary.filledAccordionLight }}>
                                                                    <Table sx={{
                                                                        "& .MuiTableCell-root": {
                                                                            padding: sm ? "16px" : "8px",
                                                                            ...(!sm && { textAlign: "center" })
                                                                        }
                                                                    }}>
                                                                        <TableHead>
                                                                            <TableRow>
                                                                                {[...(sm ? ["Data", "Dalle", "Alle"] : ["Orario"]), ...(isSpecialRoom(arr[0].room_type) ? ["Stato"] : []), "Azioni"].map((val, index, headArr) =>
                                                                                (
                                                                                    <StyledTableCell style={{ fontWeight: "bold", ...(sm && index === headArr.length - 1 && { textAlign: "right" }) }} key={index}>
                                                                                        {val}
                                                                                    </StyledTableCell>
                                                                                )
                                                                                )}
                                                                            </TableRow>
                                                                        </TableHead>
                                                                        <TableBody>
                                                                            {arr.map((val, pos) =>
                                                                                <TableRow key={"d" + i + "_rid" + index + "_ind" + pos}>
                                                                                    {
                                                                                        sm ?
                                                                                            <>
                                                                                                {[
                                                                                                    capitalize(moment(val.slot_day).format("dddd DD MMMM YYYY")),
                                                                                                    moment(addEpoch(val.slot_start_time)).format("HH:mm"),
                                                                                                    moment(addEpoch(val.slot_end_time)).format("HH:mm")
                                                                                                ].map((el, k) =>
                                                                                                    <StyledTableCell key={k}>
                                                                                                        {el}
                                                                                                    </StyledTableCell>
                                                                                                )}
                                                                                            </>
                                                                                            :
                                                                                            <StyledTableCell>
                                                                                                {moment(addEpoch(val.slot_start_time)).format("HH:mm")}
                                                                                                <br />
                                                                                                -
                                                                                                <br />
                                                                                                {moment(addEpoch(val.slot_end_time)).format("HH:mm")}
                                                                                            </StyledTableCell>
                                                                                    }
                                                                                    {
                                                                                        isSpecialRoom(val.room_type) &&
                                                                                        <StyledTableCell
                                                                                            title={"Argomento: " + val.topic + "\nNumero di partecipanti: " + val.participants_nr + (val.needs_technical_assistance && "\nRichiesta assistenza tecnica")}
                                                                                        >
                                                                                            {val.room_type.localeCompare("conference") === 0 && val.is_allowed === 0 ?
                                                                                                (
                                                                                                    sm ?
                                                                                                        <Typography variant="data">Richiesto</Typography>
                                                                                                        :
                                                                                                        <ScheduleIcon style={{ color: theme.palette.primary.main }} />
                                                                                                )
                                                                                                :
                                                                                                (
                                                                                                    sm ?
                                                                                                        <Typography variant="data">Confermato</Typography>
                                                                                                        :
                                                                                                        <DoneIcon style={{ color: theme.palette.primary.main }} />
                                                                                                )
                                                                                            }
                                                                                        </StyledTableCell>
                                                                                    }
                                                                                    <StyledTableCell {...(sm && { align: "right" })}>
                                                                                        {cancelButton(
                                                                                            [val.slot_id],
                                                                                            [[val.slot_day, val.slot_start_time]],
                                                                                            ""
                                                                                        )}
                                                                                    </StyledTableCell>
                                                                                </TableRow>
                                                                            )}
                                                                        </TableBody>
                                                                    </Table>
                                                                    <Box p={2} display="flex" justifyContent="right">
                                                                        {cancelButton(
                                                                            arr.map(val => val.slot_id),
                                                                            arr.map(val => [val.slot_day, val.slot_start_time]),
                                                                            "Disdici Sala"
                                                                        )}
                                                                    </Box>
                                                                </AccordionDetails>
                                                            </Accordion>
                                                        );
                                                    })}
                                                </AccordionDetails>
                                            </Accordion>
                                        )
                                    }
                                </Box>
                                :
                                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                    <Typography variant="h5" textAlign="center">
                                        Non hai ancora effettuato alcuna prenotazione. Premi il bottone {sm ? "NUOVA PRENOTAZIONE" : "PRENOTA"} per iniziare.
                                    </Typography>
                                </Box>
                        )
                    }
                </Box>
                {sm &&
                    <Box style={{ marginTop: "auto" }}>
                        <FooterComp />
                    </Box>
                }
            </Box>
        </>
    );
}