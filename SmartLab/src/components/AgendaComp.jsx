import React, { useEffect, useMemo, useState } from "react";
import { Box, Dialog, DialogContent, IconButton, Table, TableBody, TableHead, TableRow, Typography, useTheme } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, CheckCircle, Close } from "@mui/icons-material";
import { LargerThanSm } from "../MediaQueries";
import { StyledTableCell } from "../styles";
import Axios from "axios";
import moment from "moment";
import { useSnackbar } from "notistack";
import { useAuth } from "../hooks/useAuth";
import ipPortApi from "../ipPortApi";

export default function AgendaComp(props) {
    const theme = useTheme();
    const sm = LargerThanSm();
    const [weekIndex, setWeekIndex] = useState(0);
    const [currentYearMonth, setCurrentYearMonth] = useState(null);
    const [isForwardArrowEnabled, setIsForwardArrowEnabled] = useState(true);
    const [reservableSlotsNr, setReservableSlotsNr] = useState(null);
    const [reservableAndSelectedSlotsNr, setReservableAndSelectedSlotsNr] = useState(null);
    const [openFinishedHoursDialog, setOpenFinishedHoursDialog] = useState(false);
    const [mailAddress, setMailAddress] = useState(null);
    const openHour = 8;
    const closeHour = 22;
    const timeSlots = [...Array(closeHour - openHour)].map((i, index) => ("0" + (index + openHour)).slice(-2) + ":00");
    const { enqueueSnackbar } = useSnackbar();
    const { token } = useAuth();

    const getWeekDates = _ => {
        const today = new Date();
        const mondayOffset = 1 - today.getDay();
        const mondayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + mondayOffset);
        const cym = moment(new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + (7 * weekIndex)).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }), "MM-DD-YYYY");

        setCurrentYearMonth(cym);
        Axios.post(ipPortApi + "getReservableSlotsNr/" + token, {
            showingMonday: cym.format("YYYY-MM-DD"),
            wdywtdChoice: props.wdywtdChoice
        })
            .then(data => {
                if (data.data.message) {
                    enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                    props.setEncounteredError(data.data.message);
                    setReservableSlotsNr(null);
                }
                else
                    setReservableSlotsNr(data.data[0].slots_nr);
            })
            .catch(error => { setReservableSlotsNr(null); console.log(error); });

        return [...Array(7)].map((_, index) => (
            new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + index + (7 * weekIndex))
                .toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
        ));
    };

    const weekDates = useMemo(_ => getWeekDates(), [weekIndex]);


    const agendaSlotsForShowingWeek = useMemo(_ => props.agendaSlotsStatusList.filter(slot => weekDates.includes(moment(slot.slot_day).format("MM/DD/YYYY"))), [props.agendaSlotsStatusList, weekDates]);

    const isCellDisabled = (day, time) => {
        const dayTimeSlots = agendaSlotsForShowingWeek.filter(slot => moment(slot.slot_day).format("MM/DD/YYYY").localeCompare(day) === 0 && slot.slot_start_time.localeCompare(time + ":00") === 0);
        if (dayTimeSlots.length === 0)
            return true;
        const freeSlots = dayTimeSlots.filter(slot => slot.is_free);
        if (freeSlots.length === 0)
            return true;
        if (reservableAndSelectedSlotsNr <= 0 && !props.selectedDayTimes.find(slot => slot.slot_day.localeCompare(day) === 0 && slot.slot_start_time.localeCompare(time) === 0))
            return true;
        return false;
    }

    const styleCell = (isDisabled, day, time) => {
        if (isDisabled)
            return [theme.palette.primary.grey, false];
        else if (props.selectedDayTimes.some(e => e.slot_day.localeCompare(day) === 0 && e.slot_start_time.localeCompare(time) === 0))
            return [theme.palette.primary.green, true];
        else
            return [theme.palette.primary.white, false];
    };

    const onClickHandler = (e, day, time) => {
        const selectedDayTimesCopy = [...props.selectedDayTimes];
        const foundIndex = selectedDayTimesCopy.findIndex(slot => slot.slot_day.localeCompare(day) === 0 && slot.slot_start_time.localeCompare(time) === 0);

        if (foundIndex !== -1)
            selectedDayTimesCopy.splice(foundIndex, 1);
        else
            selectedDayTimesCopy.push({ slot_day: day, slot_start_time: time });
        props.setSelectedDayTimes(selectedDayTimesCopy);
    };

    const handleCloseFinishedHoursDialog = _ => {
        setOpenFinishedHoursDialog(false);
    };

    const getNextWeekMonday = nextWeekIndex => {
        const today = new Date();
        const mondayOffset = 1 - today.getDay();
        const mondayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + mondayOffset);

        return new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + (7 * nextWeekIndex))
            .toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
    };

    useEffect(_ => {
        const nwm = moment(getNextWeekMonday(weekIndex + 1));
        setIsForwardArrowEnabled(props.agendaSlotsStatusList.some(slot => moment(slot.slot_day).isSameOrAfter(nwm)));
    }, [weekIndex]);

    useEffect(_ => {
        if (reservableSlotsNr != null) {
            const reservableAndSelectedSlotsNrCopy = reservableSlotsNr - (props.selectedDayTimes.filter(dt => moment(dt.slot_day, "MM/DD/YYYY").format("YYYY-MM").localeCompare(currentYearMonth.format("YYYY-MM")) === 0).length);
            setReservableAndSelectedSlotsNr(reservableAndSelectedSlotsNrCopy);
            setOpenFinishedHoursDialog(props.isWorking && reservableAndSelectedSlotsNrCopy <= 0);
        }
    }, [reservableSlotsNr, props.selectedDayTimes, currentYearMonth]);

    useEffect(_ => {
        if (openFinishedHoursDialog === true)
            Axios.get(ipPortApi + "getFromAddressPrenotazioniHub/" + token)
                .then(data => {
                    if (data.data.messageOk)
                        setMailAddress(data.data.messageOk, { variant: "success" });
                    else {
                        enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                        setMailAddress(null);
                    }
                })
                .catch(error => { setMailAddress(null); console.log(error); });
    }, [openFinishedHoursDialog]);

    return (
        <>
            <Dialog open={openFinishedHoursDialog} onClose={handleCloseFinishedHoursDialog} PaperProps={{
                style: { ...(sm ? { padding: 20, minWidth: "60%" } : { width: "100vw", height: "100vh", position: "fixed", top: 35, borderRadius: "16px 16px 0px 0px" }) }
            }}>
                <Box style={{ ...(!sm && { display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }) }}>
                    <DialogContent>
                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="dialogTitle">
                                Monte ore terminato
                            </Typography>
                            <IconButton style={{ color: theme.palette.primary.main }} onClick={handleCloseFinishedHoursDialog} sx={{ padding: "0" }}>
                                <Close />
                            </IconButton>
                        </Box>
                        <br />
                        <br />
                        <Box align="center">
                            <Typography variant="infoText">
                                Hai terminato il tuo monte ore disponibile per questo mese.
                            </Typography>
                            {mailAddress &&
                                <Typography variant="infoText">
                                    <br />
                                    <br />
                                    Sei interessato a utilizzare lo spazio quotidianamente? Contatta la Federazione all'indirizzo
                                    {" "}
                                    <a title="Invia mail alla Federazione" href={"mailto:" + mailAddress} style={{ color: theme.palette.primary.main }}>
                                        {mailAddress}
                                    </a>
                                </Typography>
                            }
                        </Box>
                        <br />
                        <br />
                    </DialogContent>
                </Box>
            </Dialog>
            {currentYearMonth && reservableSlotsNr !== null &&
                <>
                    <Typography variant="dialogSubtitle">
                        Ore prenotabili
                    </Typography>
                    <Typography variant="dialogSubtitle" fontWeight="bold">
                        {" " + (sm ? props.capitalize(currentYearMonth.format("MMMM YYYY")) : currentYearMonth.format("MM/YYYY"))}
                    </Typography>
                    <Typography variant="dialogSubtitle" color={theme.palette.primary.main} fontWeight="bold">
                        {": " + reservableAndSelectedSlotsNr}
                    </Typography>
                </>
            }
            <Box p={sm ? 3 : 0}>
                <Box display="flex" justifyContent="space-between">
                    <IconButton onClick={_ => weekIndex > 0 && setWeekIndex(weekIndex - 1)} disabled={weekIndex === 0}>
                        <ArrowBackIos style={{ color: weekIndex === 0 ? theme.palette.primary.disabledGrey : theme.palette.primary.main }} />
                    </IconButton>
                    <IconButton onClick={_ => isForwardArrowEnabled && setWeekIndex(weekIndex + 1)} disabled={!isForwardArrowEnabled}>
                        <ArrowForwardIos style={{ color: isForwardArrowEnabled ? theme.palette.primary.main : theme.palette.primary.disabledGrey }} />
                    </IconButton>
                </Box>
                <Table sx={{
                    "& .MuiTableCell-root": {
                        padding: sm ? "4px" : "2px",
                        textAlign: "center",
                        fontWeight: "bold",
                        ":not(:first-of-type):not(.MuiTableCell-head)": {
                            border: "1px solid " + theme.palette.primary.disabledGrey
                        },
                        ":first-of-type": {
                            border: "none"
                        }
                    }
                }}>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell />
                            {weekDates.map(day => (
                                <StyledTableCell
                                    style={{
                                        ...(moment(new Date()).format("MM/DD/YYYY").localeCompare(day) === 0 && { color: theme.palette.primary.main })
                                    }}
                                    key={day}
                                >
                                    <Box align="center">
                                        {sm ? props.capitalize(moment(day, "MM/DD/YYYY").format("dddd")) : props.capitalize(moment(day, "MM/DD/YYYY").format("dddd").charAt(0))}
                                        <br />
                                        {moment(day, "MM/DD/YYYY").format("DD")}
                                    </Box>
                                </StyledTableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {timeSlots.map(time => (
                            <TableRow key={time}>
                                <StyledTableCell>{time}</StyledTableCell>
                                {weekDates.map(day => {
                                    const isDisabled = isCellDisabled(day, time);
                                    const cellStyle = styleCell(isDisabled, day, time);
                                    return (
                                        <StyledTableCell
                                            key={day}
                                            disabled={isDisabled}
                                            onClick={e => !isDisabled && onClickHandler(e, day, time)}
                                            style={{ backgroundColor: cellStyle[0], position: "relative" }}>
                                            {cellStyle[1] &&
                                                <CheckCircle style={{
                                                    color: theme.palette.primary.white,
                                                    position: "absolute",
                                                    height: "calc(100% - " + (sm ? 8 : 4) + "px)",
                                                    transform: "translate(-50%, -50%)"
                                                }} />
                                            }
                                        </StyledTableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        </>
    );
}