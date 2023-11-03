import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyledAutocomplete, StyledFilledTextField, StyledOutlinedButton, StyledTableCell } from "../styles";
import { Box, IconButton, CircularProgress, Table, TableBody, TableHead, TableRow, Typography } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, ArrowRightAlt, CheckCircle, DeleteForever } from "@mui/icons-material";
import Axios from "axios";

export default function ExceptionsComp(props) {
    const [startSelectionException, setStartSelectionException] = useState({});
    const [selectedRoom, setselectedRoom] = useState(null);
    const [selectedDayTimesExceptions, setSelectedDayTimesExceptions] = useState({});
    const [existingSlots, setExistingSlots] = useState([]);
    const [roomsInfo, setRoomsInfo] = useState([]);
    const [singleRoomsInfo, setSingleRoomsInfo] = useState([]);
    const [singleRoomsInfoIDs, setSingleRoomsInfoIDs] = useState([]);
    const [weekIndex, setWeekIndex] = useState(0);
    const [currentYearMonth, setCurrentYearMonth] = useState(null);
    const [isShowingCircularProgress, setIsShowingCircularProgress] = useState(true);
    const [hideTable, setHideTable] = useState(true);
    const [lastTableHeight, setLastTableHeight] = useState(0);
    const tableRef = useRef();

    const handleResize = _ => {
        if (tableRef.current?.clientHeight)
            setLastTableHeight(tableRef.current?.clientHeight);
    };

    const allEqual = arr => arr.every(val => val === arr[0]);

    const getWeekDates = _ => {
        const today = new Date();
        const mondayOffset = 1 - today.getDay();
        const mondayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + mondayOffset);
        const cym = props.moment(new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + (7 * weekIndex)).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }), "MM-DD-YYYY");

        setCurrentYearMonth(cym);

        return [...Array(7)].map((_, index) => (
            new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + index + (7 * weekIndex))
                .toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
        ));
    };

    const weekDates = useMemo(_ => getWeekDates(), [weekIndex]);

    const blackCellNoIconForAllRoomsChoice = (day, time) => !allEqual(singleRoomsInfoIDs.map(r => selectedDayTimesExceptions[r].hasOwnProperty(day + " " + time) ? ((selectedDayTimesExceptions[r])[day + " " + time].length === 0 ? 1 : -1) : 0));

    const styleExceptionCell = (isDisabled, day, time, bcniForAllRooms) => {
        if (isDisabled)
            return [props.theme.palette.primary.grey, false, false, [], false];

        var slotsAboutCell;
        var isAdding;
        if (selectedRoom.room_id === null) {
            slotsAboutCell = existingSlots.filter(s => props.moment(s.slot_day).format("MM/DD/YYYY").localeCompare(day) === 0 && s.slot_start_time.localeCompare(time + ":00") === 0);
            if (bcniForAllRooms)
                isAdding = 0;
            else
                isAdding = selectedDayTimesExceptions[singleRoomsInfo[0].room_id].hasOwnProperty(day + " " + time) ? ((selectedDayTimesExceptions[singleRoomsInfo[0].room_id])[day + " " + time].length === 0 ? 1 : -1) : 0;
        }
        else {
            slotsAboutCell = existingSlots.filter(s => s.room_id === selectedRoom.room_id && props.moment(s.slot_day).format("MM/DD/YYYY").localeCompare(day) === 0 && s.slot_start_time.localeCompare(time + ":00") === 0);
            isAdding = selectedDayTimesExceptions[selectedRoom.room_id].hasOwnProperty(day + " " + time) ? ((selectedDayTimesExceptions[selectedRoom.room_id])[day + " " + time].length === 0 ? 1 : -1) : 0;
        }

        const usedRooms = selectedRoom.room_id === null ? ([...new Set(existingSlots.filter(s => props.moment(s.slot_day).format("MM/DD/YYYY").localeCompare(day) === 0 && s.slot_start_time.localeCompare(time + ":00") === 0 && s.is_free === 0).map(s => s.room_id))].map(rid => roomsInfo.find(r => r.room_id === rid).room_name_updatable)) : [];

        if (slotsAboutCell.length === 0)
            return [props.theme.palette.primary.white, isAdding, false, usedRooms, false];
        else if (slotsAboutCell.some(s => s.is_free === 0))
            return [props.theme.palette.primary.red, isAdding, !isAdding, usedRooms, true];
        else
            return [props.theme.palette.primary.green, isAdding, !isAdding, usedRooms, false];
    };


    const onMouseDownHandlerException = (e, day, time) => {
        e.preventDefault();
        props.enqueueSnackbar("Caricamento in corso...", { variant: "warning" });

        setTimeout(_ => {
            setStartSelectionException({ day, time });
        }, 1);
    };

    const onMouseUpHandlerException = (e, day, time, isDisabled) => {
        const selectedDayTimesExceptionsCopy = { ...selectedDayTimesExceptions };

        if (Object.keys(startSelectionException).length > 0) {
            const [startDay, startTime] = Object.values(startSelectionException);

            const days = weekDates.slice(weekDates.indexOf(startDay), weekDates.indexOf(day) + 1);
            const times = props.timeSlots.slice(props.timeSlots.indexOf(startTime), props.timeSlots.indexOf(time) + 1);
            if (selectedRoom.room_id === null) {
                for (const day of days)
                    for (const time of times) {
                        const key = day + " " + time;
                        if (!isDisabled)
                            singleRoomsInfoIDs.forEach(r => {
                                if (!selectedDayTimesExceptionsCopy[r].hasOwnProperty(key))
                                    (selectedDayTimesExceptionsCopy[r])[key] = existingSlots.filter(s => s.room_id === r && props.moment(s.slot_day).format("MM/DD/YYYY").localeCompare(day) === 0 && s.slot_start_time.localeCompare(time + ":00") === 0);
                                else
                                    delete (selectedDayTimesExceptionsCopy[r])[key];
                            });
                    }
            }
            else {
                for (const day of days)
                    for (const time of times) {
                        const key = day + " " + time;
                        if (!selectedDayTimesExceptionsCopy[selectedRoom.room_id].hasOwnProperty(key))
                            (selectedDayTimesExceptionsCopy[selectedRoom.room_id])[key] = existingSlots.filter(s => s.room_id === selectedRoom.room_id && props.moment(s.slot_day).format("MM/DD/YYYY").localeCompare(day) === 0 && s.slot_start_time.localeCompare(time + ":00") === 0);
                        else
                            delete (selectedDayTimesExceptionsCopy[selectedRoom.room_id])[key];
                    }
            }

            setSelectedDayTimesExceptions(selectedDayTimesExceptionsCopy);
        }
        setStartSelectionException({});
    };

    const addBulkExceptions = _ => {
        var selectedDayTimesExceptionsIDs = {};

        Object.keys(selectedDayTimesExceptions).forEach(key => {
            const updatedNestedArray = {};
            Object.entries(selectedDayTimesExceptions[key]).map(([date, objects]) => updatedNestedArray[date] = objects.map(obj => obj.slot_id));
            selectedDayTimesExceptionsIDs[key] = updatedNestedArray;
        });

        Axios.post(props.ipPortApi + "addRemoveSlots/" + props.token, {
            slotsObj: selectedDayTimesExceptionsIDs
        }).then(response => {
            if (response.data.messageOk) {
                props.enqueueSnackbar(response.data.messageOk, { variant: "success" });
                setHideTable(true);
                props.setIsSubmittingExceptions(false);
                props.setTriggerCompsUE(true);
            }
            else {
                props.enqueueSnackbar("Errore dal server: " + response.data.message, { variant: "error" });
                props.setIsSubmittingExceptions(false);
            }
        }).catch(error => { console.log(error); props.setIsSubmittingExceptions(false); });
    };

    const isCellDisabled = (day, time, bcniForAllRooms) => {
        return (props.moment(day + " " + time, "MM/DD/YYYY HH:mm").isSameOrBefore(props.moment()) || props.moment(day, "MM/DD/YYYY").isAfter(props.moment(props.lastSlotDate)))
            || (selectedRoom.room_id === null && (!allEqual(singleRoomsInfoIDs.map(r => existingSlots.some(s => s.room_id === r && props.moment(s.slot_day).format("MM/DD/YYYY").localeCompare(day) === 0 && s.slot_start_time.localeCompare(time + ":00") === 0))) || bcniForAllRooms));
    };

    const shouldDisableForwardArrow = _ => {
        const firstDayOfNextPage = props.moment(weekDates[0], "MM/DD/YYYY").clone().add(7, "days");
        return firstDayOfNextPage.isAfter(props.moment(props.lastSlotDate));
    };

    const getExistingSlots = _ => {
        const maxFirstDay = props.moment.max([props.moment(), currentYearMonth].map(d => props.moment(d.format("YYYY-MM-DD")))).format("YYYY-MM-DD");
        Axios.post(props.ipPortApi + "getExistingSlots/" + props.token, {
            firstDay: maxFirstDay,
            lastDay: currentYearMonth.clone().add(6, "d").format("YYYY-MM-DD")
        }).then(data => {
            if (data.data.message) {
                props.enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                setExistingSlots([]);
                setIsShowingCircularProgress(true);
            }
            else {
                setExistingSlots(data.data);
                setIsShowingCircularProgress(false);
                setHideTable(false);
            }
        }).catch(error => { setExistingSlots([]); setIsShowingCircularProgress(true); console.log(error); });
    };

    useEffect(_ => {
        if (hideTable || props.triggerCompsUE) {
            setWeekIndex(0);
            Axios.get(props.ipPortApi + "getRoomsInfo/" + props.token)
                .then(data => {
                    if (data.data.message) {
                        props.enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                        setRoomsInfo([]);
                        setSingleRoomsInfo([]);
                        setSingleRoomsInfoIDs([]);
                        setselectedRoom(null);
                        setSelectedDayTimesExceptions({});
                    }
                    else {
                        const allRoomsChoice = { room_id: null, room_name_updatable: "(Tutte)" };
                        setRoomsInfo([allRoomsChoice, ...data.data]);
                        setSingleRoomsInfo(data.data);
                        setSingleRoomsInfoIDs(data.data.map(r => r.room_id));
                        setselectedRoom(allRoomsChoice);
                        const selectedDayTimesExceptionsCopy = { ...selectedDayTimesExceptions };
                        data.data.forEach(e => selectedDayTimesExceptionsCopy[e.room_id] = []);
                        setSelectedDayTimesExceptions(selectedDayTimesExceptionsCopy);
                    }
                })
                .catch(error => { setRoomsInfo([]); setSingleRoomsInfo([]); setSingleRoomsInfoIDs([]); setselectedRoom(null); setSelectedDayTimesExceptions({}); console.log(error); });
        }
    }, [props.triggerCompsUE, hideTable]);

    useEffect(_ => {
        if (currentYearMonth !== null && (!props.isSubmittingExceptions || props.triggerCompsUE))
            getExistingSlots();
    }, [currentYearMonth, props.isSubmittingExceptions, props.triggerCompsUE]);

    useEffect(_ => {
        if (!isShowingCircularProgress && !hideTable) {
            window.addEventListener("resize", handleResize);
            handleResize();

            return _ => {
                window.removeEventListener("resize", handleResize);
            };
        }
    }, [props.sm, isShowingCircularProgress, hideTable, tableRef.current]);

    return (
        <>
            {
                roomsInfo && roomsInfo.length > 0 &&
                <>
                    <Box py={2}>
                        <StyledAutocomplete
                            id="Sala"
                            fullWidth
                            value={selectedRoom}
                            onChange={(event, value, reason) => { setselectedRoom(value); setWeekIndex(0); }}
                            options={roomsInfo}
                            getOptionLabel={option => option.room_name_updatable}
                            renderInput={params => (
                                <StyledFilledTextField
                                    {...params}
                                    variant="outlined"
                                    label="Sala"
                                    placeholder="Sala"
                                    required
                                />
                            )}
                            disableClearable
                        />
                    </Box>
                    {currentYearMonth &&
                        <Box display="flex" alignItems="center" justifyContent={props.sm ? "flex-start" : "center"}>
                            <Typography variant="dialogSubtitle" fontWeight="bold">
                                {(props.sm ? props.capitalize(currentYearMonth.format("MMMM YYYY")) : currentYearMonth.format("MM/YYYY"))}
                            </Typography>
                            {props.lastSlotDate &&
                                <ArrowRightAlt style={{ color: props.theme.palette.primary.functionalBlackCamposampierese }} />
                            }
                            {props.lastSlotDate &&
                                <Typography variant="dialogSubtitle" fontWeight="bold" color={props.lastLessThanMonths(props.lastSlotDate) ? props.theme.palette.primary.orange : props.theme.palette.primary.green}>{props.moment(props.lastSlotDate).format("DD/MM/YYYY")}</Typography>
                            }
                        </Box>
                    }
                    <Box py={props.sm ? 3 : 0}>
                        <Box display="flex" justifyContent="space-between">
                            <IconButton onClick={_ => {
                                if (weekIndex > 0) {
                                    setIsShowingCircularProgress(true);
                                    setWeekIndex(weekIndex - 1);
                                }
                            }} disabled={weekIndex === 0}>
                                <ArrowBackIos style={{ color: weekIndex === 0 ? props.theme.palette.primary.disabledGrey : props.theme.palette.primary.main }} />
                            </IconButton>
                            {
                                (_ => {
                                    const sdfa = shouldDisableForwardArrow();
                                    return (
                                        <IconButton onClick={_ => { setIsShowingCircularProgress(true); setWeekIndex(weekIndex + 1); }} disabled={sdfa}>
                                            <ArrowForwardIos style={{ color: sdfa ? props.theme.palette.primary.disabledGrey : props.theme.palette.primary.main }} />
                                        </IconButton>
                                    );
                                })()
                            }
                        </Box>
                        {hideTable || isShowingCircularProgress ?
                            <Box
                                style={{
                                    width: "100%",
                                    height: 0,
                                    paddingTop: lastTableHeight + "px",
                                    position: "relative"
                                }}
                            >
                                <CircularProgress style={{ position: "absolute", top: "calc(50% - 20px)", left: "calc(50% - 20px)", transform: "translate(-50%, -50%)" }} />
                            </Box>
                            :
                            <Table ref={tableRef} sx={{
                                "& .MuiTableCell-root": {
                                    padding: props.sm ? "4px" : "2px",
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    ":not(:first-of-type):not(.MuiTableCell-head)": {
                                        border: "1px solid " + props.theme.palette.primary.disabledGrey
                                    },
                                    ":first-of-type": {
                                        border: "none"
                                    }
                                }
                            }}
                            >
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell />
                                        {weekDates.map(day => (
                                            <StyledTableCell
                                                style={{
                                                    ...(props.moment(new Date()).format("MM/DD/YYYY").localeCompare(day) === 0 && { color: props.theme.palette.primary.main })
                                                }}
                                                key={day}
                                            >
                                                <Box align="center">
                                                    {props.sm ? props.capitalize(props.moment(day, "MM/DD/YYYY").format("dddd")) : props.capitalize(props.moment(day, "MM/DD/YYYY").format("dddd").charAt(0))}
                                                    <br />
                                                    {props.moment(day, "MM/DD/YYYY").format("DD")}
                                                </Box>
                                            </StyledTableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.timeSlots.map(time => (
                                        <TableRow key={time}>
                                            <StyledTableCell>{time}</StyledTableCell>
                                            {weekDates.map(day => {
                                                const bcniForAllRooms = selectedRoom.room_id === null ? blackCellNoIconForAllRoomsChoice(day, time) : null;
                                                const isDisabled = isCellDisabled(day, time, bcniForAllRooms);
                                                const cellStyle = styleExceptionCell(isDisabled, day, time, bcniForAllRooms);
                                                return (
                                                    <StyledTableCell
                                                        key={day}
                                                        disabled={isDisabled}
                                                        onMouseDown={e => !isDisabled && onMouseDownHandlerException(e, day, time)}
                                                        onMouseUp={e => onMouseUpHandlerException(e, day, time, isDisabled)}
                                                        style={{
                                                            backgroundColor: cellStyle[0], position: "relative", ...(Object.keys(startSelectionException).length > 0 && startSelectionException.day.localeCompare(day) === 0 && startSelectionException.time.localeCompare(time) === 0 && { boxShadow: "inset 0px 0px 5px" + props.theme.palette.primary.yellow })
                                                        }}
                                                        title={selectedRoom.room_id === null && cellStyle[4] ? (cellStyle[3].length > 0 ? ("Sale occupate: " + cellStyle[3].join(", ")) : "Nessuna sala occupata") : undefined}
                                                    >
                                                        {
                                                            (cellStyle[1] > 0 || cellStyle[2]) &&
                                                            <CheckCircle style={props.zoomIconStyle} />
                                                        }
                                                        {
                                                            cellStyle[1] < 0 &&
                                                            <DeleteForever style={props.zoomIconStyle} />
                                                        }
                                                    </StyledTableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        }
                    </Box>
                    <Box width="100%" display="flex" justifyContent="flex-end" py={2}>
                        <StyledOutlinedButton
                            disabled={props.isSubmittingExceptions || Object.keys(selectedDayTimesExceptions).length === 0 || Object.values(selectedDayTimesExceptions).every(v => Object.keys(v).length === 0)}
                            style={{ borderColor: (props.isSubmittingExceptions || Object.keys(selectedDayTimesExceptions).length === 0 || Object.values(selectedDayTimesExceptions).every(v => Object.keys(v).length === 0)) ? props.theme.palette.primary.disabledGrey : props.theme.palette.primary.main }}
                            onClick={_ => {
                                if (Object.keys(selectedDayTimesExceptions).every(key => Object.entries(selectedDayTimesExceptions[key]).every(([date, objects]) => objects.length === 0)) || window.confirm("Vuoi davvero rimuovere delle slot? Se sono prenotate da alcuni utenti, essi potrebbero ricevere delle mail a rimozione avvenuta")) {
                                    props.setIsSubmittingExceptions(true);
                                    addBulkExceptions();
                                }
                            }}>
                            Conferma
                        </StyledOutlinedButton>
                    </Box>
                </>
            }
        </>
    );
}