import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    Grid,
    IconButton,
    LinearProgress,
    Table,
    TableBody,
    TableHead,
    TableRow,
    Typography,
    useTheme
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Axios from "axios";
import moment from "moment";
import { useSnackbar } from "notistack";
import { useAuth } from "../hooks/useAuth";
import ipPortApi from "../ipPortApi";
import { LargerThanSm } from "../MediaQueries";
import { StyledFab, StyledFilledTextField, StyledTableCell, StyledTextButton } from "../styles";
import AgendaComp from "./AgendaComp";

export default function ReservationsDialogBtnComp(props) {
    const theme = useTheme();
    const sm = LargerThanSm();
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState(0);
    const dialogContentRef = useRef();

    const [wdywtdChoice, setWDYWTDChoice] = useState(null);
    const [lastTab, setLastTab] = useState(1);
    const summaryTab = -1;
    const [hasSummary, setHasSummary] = useState(false);
    const [isRoomSpecial, setIsRoomSpecial] = useState(false);
    const [agendaSlotsStatusList, setAgendaSlotsStatusList] = useState([]);
    const [selectedDayTimes, setSelectedDayTimes] = useState([]);
    const [seatsNr, setSeatsNr] = useState(0);
    const [topic, setTopic] = useState("");
    const [participantsNr, setParticipantsNr] = useState(1);
    const [needsTechnicalAssistance, setNeedsTechnicalAssistance] = useState(false);
    const [encounteredError, setEncounteredError] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [slotsWithStatusList, setSlotsWithStatusList] = useState([]);
    const [arrWDYWTDValues, setArrWDYWTDValues] = useState([]);
    const formRef = useRef();
    const { token } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const handleClose = _ => {
        setOpen(false);
    };

    const handleChangeNeedsTechnicalAssistance = event => setNeedsTechnicalAssistance(event.target.checked);

    const updateRowsTable = _ => {
        setHasSummary(false);
        setIsRoomSpecial(false);
        Axios.post(ipPortApi + "askForReservation/" + token, {
            wdywtdChoice: wdywtdChoice,
            selectedDayTimes: selectedDayTimes,
            topic: topic,
            participantsNr: participantsNr,
            needsTechnicalAssistance: needsTechnicalAssistance
        }).then(response => {
            if (response.data.messageOk) {
                enqueueSnackbar(response.data.messageOk, { variant: "success" });
                setHasSummary(true);
                setIsRoomSpecial(props.isSpecialRoom(wdywtdChoice.room_type));
                props.updateListFun();
            }
            else {
                enqueueSnackbar("Errore dal server: " + response.data.message, { variant: "error" });
                setEncounteredError(response.data.message);
            }
        }).catch(error => console.log(error));
        setTab(summaryTab);
    };

    const getWDYWTD = _ => {
        var uniqueFreeRooms = [];
        var uniqueReservedRooms = [];

        const removeDuplicates = arr => arr.filter((v, i, a) => a.findIndex(v2 => ["room_id", "room_name", "room_type"].every(k => v2[k] === v[k])) === i);

        for (const room of slotsWithStatusList) {
            const { room_id, room_name, room_name_for_card, room_card_id, room_type, is_free } = room;
            if (is_free === 1)
                uniqueFreeRooms.push({ room_id, room_name, room_name_for_card, room_card_id, room_type });
            else
                uniqueReservedRooms.push({ room_id, room_name, room_name_for_card, room_card_id, room_type });
        }

        uniqueFreeRooms = removeDuplicates(uniqueFreeRooms);
        uniqueReservedRooms = removeDuplicates(uniqueReservedRooms);

        var uniqueOnlyReservedRooms = uniqueReservedRooms.filter(room => !uniqueFreeRooms.some(freeRoom => room.room_name.localeCompare(freeRoom.room_name) === 0 && room.room_type.localeCompare(freeRoom.room_type) === 0));

        uniqueFreeRooms = uniqueFreeRooms.map(room => ({ ...room, is_full: false }));
        uniqueOnlyReservedRooms = uniqueOnlyReservedRooms.map(room => ({ ...room, is_full: true }));

        const uniqueRooms = [...uniqueFreeRooms, ...uniqueOnlyReservedRooms];

        const conferenceRooms = uniqueRooms.filter(e => e.room_type.localeCompare(props.specialRoomTypeString) === 0);
        const nonConferenceRT = [...new Set(uniqueRooms.filter(e => e.room_type.localeCompare(props.specialRoomTypeString) !== 0).map(e => ({ room_type: e.room_type, room_name_for_card: e.room_name_for_card, room_card_id: e.room_card_id })))].map(e => ({ room_type: e.room_type, is_full: !(uniqueFreeRooms.some(r => r.room_type.localeCompare(e.room_type) === 0)), room_name_for_card: e.room_name_for_card, room_card_id: e.room_card_id }));

        return [...conferenceRooms, ...nonConferenceRT].sort((a, b) => a.room_card_id - b.room_card_id);
    };

    const resetTab = tabNr => {
        if (tabNr === 0) {
            setWDYWTDChoice(null);
            setLastTab(1);
        }
        else if (tabNr === 1) {
            setSelectedDayTimes([]);
            setAgendaSlotsStatusList([]);
        }
        else if (tabNr === 2) {
            setSeatsNr(0);
            setTopic("");
            setParticipantsNr(1);
            setNeedsTechnicalAssistance(false);
        }
    };

    useEffect(_ => {
        if (encounteredError !== null)
            setTab(summaryTab);
    }, [encounteredError]);

    useEffect(_ => {
        if (isSubmitting === true) {
            updateRowsTable();
            setIsSubmitting(false);
        }
    }, [isSubmitting]);

    useEffect(_ => {
        props.setIsShowingCircularProgress(true);
        Axios.get(ipPortApi + "getNotMineSlotsWithStatus/" + token)
            .then(data => {
                if (data.data.message) {
                    enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                    setEncounteredError(data.data.message);
                    setSlotsWithStatusList([]);
                    props.setIsShowingCircularProgress(true);
                }
                else {
                    setSlotsWithStatusList(data.data);
                    props.setIsShowingCircularProgress(false);
                }
            })
            .catch(error => { setSlotsWithStatusList([]); props.setIsShowingCircularProgress(true); console.log(error); });

        if (open === true) {
            dialogContentRef.current?.scrollTo({
                top: 0
            });
            switch (tab) {
                case 0:
                    resetTab(0);
                    resetTab(1);
                    break;
                case 1:
                    setSelectedDayTimes([]);
                    setAgendaSlotsStatusList(slotsWithStatusList.filter(e => props.isSpecialRoom(wdywtdChoice.room_type) ? (e.room_id === wdywtdChoice.room_id) : (e.room_type.localeCompare(wdywtdChoice.room_type) === 0)));
                    resetTab(2);
                    break;
                case 2:
                    resetTab(2);
                    Axios.get(ipPortApi + "getRoomSeatsNr/" + wdywtdChoice.room_id + "&tkn=" + token)
                        .then(data => {
                            if (data.data.message) {
                                enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                                setEncounteredError(data.data.message);
                                setSeatsNr(0);
                            }
                            else
                                data.data.length > 0 ? setSeatsNr(data.data[0].seats_nr) : setSeatsNr(0);
                        })
                        .catch(error => { setSeatsNr(0); console.log(error); });
                    break;
                default:
                    break;
            }
        }
        else {
            setEncounteredError(null);
            [0, 1, 2].forEach(e => resetTab(e));
            setTab(0);
        }
    }, [tab, open]);

    useEffect(_ => {
        setArrWDYWTDValues(getWDYWTD());
    }, [slotsWithStatusList]);

    return (
        <>
            {!props.isShowingCircularProgress &&
                <StyledFab variant="extended" onClick={_ => setOpen(true)}>
                    <AddIcon sx={{ mr: sm ? 1 : 0 }} />
                    {sm ? "Nuova prenotazione" : "Prenota"}
                </StyledFab>
            }
            <Dialog open={open} onClose={handleClose} PaperProps={{
                style: { ...(sm ? { width: "90vw", height: "90vh", maxWidth: "unset", maxHeight: "unset" } : { width: "100vw", height: "100vh", position: "fixed", top: 35, borderRadius: "16px 16px 0px 0px" }) }
            }}>
                <LinearProgress variant="determinate" value={(100 / lastTab) * tab} />
                <Box style={{ ...(sm && { padding: 20 }), display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                    <DialogContent ref={dialogContentRef}>
                        <form ref={formRef} style={{ height: "100%" }}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="dialogTitle">
                                    Nuova prenotazione
                                </Typography>
                                <IconButton style={{ color: theme.palette.primary.main }} onClick={handleClose} sx={{ padding: "0" }}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <br />
                            {arrWDYWTDValues.length > 0 ?
                                <>
                                    <Box style={{ ...(sm && { textAlign: "center" }) }}>
                                        <Typography variant="dialogSubtitle" style={{ ...(sm && { fontSize: 20 }) }}>
                                            {tab === 0 && "Cosa vuoi fare?"}
                                            {tab === 1 && "Quando?"}
                                            {tab === 2 && "Ulteriori info"}
                                            {tab === summaryTab && "Prenotazione " + (hasSummary ? "" : "non ") + "effettuata"}
                                        </Typography>
                                    </Box>
                                    <br />
                                    {props.isShowingCircularProgress ?
                                        <Box display="flex" justifyContent="center" alignItems="center">
                                            <CircularProgress style={{ position: "absolute", top: "calc(50% - 20px)", left: "calc(50% - 20px)", transform: "translate(-50%, -50%)" }} />
                                        </Box>
                                        :
                                        <Box>
                                            {tab === 0 &&
                                                <Grid container direction={sm ? "row" : "column"} justifyContent="center" spacing={3} p={3}>
                                                    {
                                                        arrWDYWTDValues.map((value, index) => {
                                                            const isRoomSpecial = props.isSpecialRoom(value.room_type);
                                                            return (
                                                                <Grid item xs={12} md={6} lg={3} key={index} style={{ ...(!sm && { paddingTop: "12px" }) }}>
                                                                    <Card sx={{
                                                                        ":hover": {
                                                                            boxShadow: 10,
                                                                            transform: "scale3d(1.05, 1.05, 1)"
                                                                        },
                                                                        transition: "transform 0.15s ease-in-out",
                                                                        border: "none",
                                                                        boxShadow: "none",
                                                                        ...(value.is_full && {
                                                                            filter: "grayscale(1)",
                                                                            opacity: 0.5,
                                                                            pointerEvents: "none"
                                                                        })
                                                                    }
                                                                    } >
                                                                        <CardActionArea disabled={value.is_full} style={{ height: "100%", display: "flex", flexDirection: sm ? "column" : "row", justifyContent: "flex-start", ...(!sm && { alignItems: "center" }) }} onClick={_ => {
                                                                            if (!value.is_full) {
                                                                                setWDYWTDChoice(value);
                                                                                setLastTab(isRoomSpecial ? 2 : 1);
                                                                                setTab(tab + 1);
                                                                            }
                                                                        }}>
                                                                            <CardMedia
                                                                                component="img"
                                                                                image={"./img/wdywtdCards/" + (isRoomSpecial ? value.room_name : value.room_type) + (sm ? "" : "_m") + ".svg"}
                                                                                title={value.room_name_for_card}
                                                                                alt={value.room_name_for_card}
                                                                                sx={{ objectFit: "contain", ...(!sm && { width: "40%" }) }}
                                                                            />
                                                                            <CardContent sx={{ ...(!sm && { width: "60%" }) }}>
                                                                                <Typography variant="title" style={{ ...(!sm && { fontSize: 14 }) }}>
                                                                                    {value.room_name_for_card}
                                                                                </Typography>
                                                                            </CardContent>
                                                                        </CardActionArea>
                                                                    </Card>
                                                                </Grid>
                                                            );
                                                        })
                                                    }
                                                </Grid>
                                            }
                                            {tab === 1 &&
                                                <Box>
                                                    <AgendaComp
                                                        capitalize={props.capitalize}
                                                        agendaSlotsStatusList={agendaSlotsStatusList}
                                                        selectedDayTimes={selectedDayTimes}
                                                        setSelectedDayTimes={setSelectedDayTimes}
                                                        isWorking={wdywtdChoice.room_type.endsWith("working")}
                                                        wdywtdChoice={wdywtdChoice}
                                                        setEncounteredError={setEncounteredError}
                                                    />
                                                </Box>
                                            }
                                            {tab === 2 &&
                                                <Grid container direction={sm ? "row" : "column"} justifyContent="space-between" alignItems="center"
                                                    sx={{
                                                        "& .MuiGrid-item": {
                                                            width: "100%"
                                                        }
                                                    }}>
                                                    <Grid item py={1}>
                                                        <StyledFilledTextField
                                                            variant="filled"
                                                            style={{ marginTop: 10 }}
                                                            label="Qual è il motivo dell'utilizzo?"
                                                            placeholder="Qual è il motivo dell'utilizzo?"
                                                            type="text"
                                                            fullWidth
                                                            required
                                                            value={topic}
                                                            onChange={(e) => setTopic(e.target.value)}
                                                            inputProps={{ maxLength: 1000 }}
                                                            helperText="Specifica quale sarà il motivo dell'utilizzo"
                                                        />
                                                    </Grid>
                                                    <Grid item py={1}>
                                                        <StyledFilledTextField
                                                            variant="filled"
                                                            style={{ marginTop: 10 }}
                                                            label={"Quante persone sono previste? (max. " + seatsNr + ")"}
                                                            placeholder={"Quante persone sono previste? (max. " + seatsNr + ")"}
                                                            type="number"
                                                            fullWidth
                                                            required
                                                            value={participantsNr}
                                                            onChange={(e) => setParticipantsNr(e.target.value)}
                                                            InputProps={{
                                                                inputProps: {
                                                                    min: 1, max: seatsNr, onKeyDown: (event) => {
                                                                        if (event.target.value.length === (Math.pow(2, 64) - 1).toString().length
                                                                            && event.key.localeCompare("Delete")
                                                                            && event.key.localeCompare("Backspace")
                                                                            && event.key.localeCompare("ArrowUp")
                                                                            && event.key.localeCompare("ArrowDown")
                                                                            && event.key.localeCompare("ArrowLeft")
                                                                            && event.key.localeCompare("ArrowRight")
                                                                            && event.key.localeCompare("Shift")
                                                                            && event.key.localeCompare("Tab"))
                                                                            event.preventDefault();
                                                                    }
                                                                }
                                                            }}
                                                            helperText="Specifica quante persone sono previste"
                                                        />
                                                    </Grid>
                                                    <Grid item py={1}>
                                                        <Box sx={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
                                                            <Checkbox checked={needsTechnicalAssistance} onChange={handleChangeNeedsTechnicalAssistance} style={{ transform: "translateX(-9px)" }} />
                                                            <Typography variant="infoText">
                                                                Prevedo di necessitare di assistenza per la strumentazione della sala
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            }
                                            {
                                                tab === summaryTab && hasSummary &&
                                                <Box>
                                                    <Typography variant="infoText" fontWeight="bold">
                                                        Informazioni:
                                                    </Typography>
                                                    <br />
                                                    <Typography variant="infoText">
                                                        Per: {wdywtdChoice.room_name_for_card}
                                                        <br />
                                                    </Typography>
                                                    {isRoomSpecial &&
                                                        <>
                                                            <Typography variant="infoText">
                                                                Persone previste: {participantsNr}
                                                                <br />
                                                                Richiesta assistenza tecnica: {needsTechnicalAssistance ? "si" : "no"}
                                                                <br />
                                                                Argomento: {topic}
                                                                <br />
                                                                <br />
                                                            </Typography>
                                                            <Typography variant="infoText" fontWeight="bold">
                                                                La tua richiesta è in fase di accettazione da parte dell'amministratore.
                                                                <br />
                                                                Riceverai una mail di notifica quando questo avverrà
                                                                <br />
                                                            </Typography>
                                                        </>
                                                    }
                                                    <Table sx={{
                                                        "& .MuiTableCell-root": {
                                                            padding: sm ? "16px" : "8px",
                                                            ...(!sm && { textAlign: "center" })
                                                        }
                                                    }}>
                                                        <TableHead>
                                                            <TableRow>
                                                                {["Data", ...(sm ? ["Dalle", "Alle"] : ["Orario"])].map((val, index, headArr) =>
                                                                (
                                                                    <StyledTableCell style={{ fontWeight: "bold", ...(sm && index === headArr.length - 1 && { textAlign: "right" }) }} key={index}>
                                                                        {val}
                                                                    </StyledTableCell>
                                                                )
                                                                )}
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {selectedDayTimes.sort((a, b) => moment(a.slot_day + " " + a.slot_start_time, "MM/DD/YYYY HH:mm") - moment(b.slot_day + " " + b.slot_start_time, "MM/DD/YYYY HH:mm")).map((val, index) =>
                                                                <TableRow key={index}>
                                                                    <StyledTableCell>
                                                                        {props.capitalize(moment(val.slot_day, "MM/DD/YYYY").format((sm ? "dddd" : "ddd.") + " DD " + (sm ? "MMMM" : "MMM.") + " YYYY"))}
                                                                    </StyledTableCell>
                                                                    {
                                                                        sm &&
                                                                        <StyledTableCell>
                                                                            {val.slot_start_time}
                                                                        </StyledTableCell>
                                                                    }
                                                                    {
                                                                        sm &&
                                                                        <StyledTableCell align="right">
                                                                            {moment(val.slot_start_time, "HH:mm").add(1, "h").format("HH:mm")}
                                                                        </StyledTableCell>
                                                                    }
                                                                    {
                                                                        !sm &&
                                                                        <StyledTableCell>
                                                                            {val.slot_start_time}
                                                                            <br />
                                                                            -
                                                                            <br />
                                                                            {moment(val.slot_start_time, "HH:mm").add(1, "h").format("HH:mm")}
                                                                        </StyledTableCell>
                                                                    }
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </Box>
                                            }
                                            {
                                                encounteredError &&
                                                <Typography variant="infoText" fontWeight="bold">
                                                    Si è verificato un errore durante la prenotazione.
                                                    <br />
                                                    Messaggio d'errore: {encounteredError}.
                                                    <br />
                                                    <br />
                                                    Riprovare
                                                </Typography>
                                            }
                                        </Box>
                                    }
                                </>
                                :
                                <>
                                    <Typography variant="infoText" fontWeight="bold">
                                        Non è possibile procedere con la prenotazione: tutti gli slot esistenti sono stati occupati.
                                    </Typography>
                                </>
                            }
                        </form>
                    </DialogContent>
                    {
                        tab > 0 &&
                        <DialogActions>
                            <StyledTextButton onClick={_ => setTab(tab - 1)}>
                                Indietro
                            </StyledTextButton>
                            {tab === lastTab ?
                                <StyledTextButton type="submit" disabled={isSubmitting || !formRef.current.checkValidity() || selectedDayTimes.length === 0} onClick={(e) => {
                                    e.preventDefault();
                                    if (!isSubmitting && formRef.current.reportValidity())
                                        setIsSubmitting(true);
                                }}>
                                    Conferma
                                </StyledTextButton>
                                :
                                <StyledTextButton disabled={selectedDayTimes.length === 0} onClick={_ => setTab(tab + 1)}>
                                    Conferma
                                </StyledTextButton>
                            }
                        </DialogActions>
                    }
                    {tab === summaryTab &&
                        <StyledTextButton onClick={handleClose}>
                            Fine
                        </StyledTextButton>
                    }
                </Box>
            </Dialog>
        </>
    );
}