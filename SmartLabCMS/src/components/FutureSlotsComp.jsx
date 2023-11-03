import React, { useEffect, useState } from "react";
import { Box, Table, TableBody, TableHead, TableRow, Typography } from "@mui/material";
import { StyledFilledTextField, StyledOutlinedButton, StyledTableCell } from "../styles";
import { AddCircle } from "@mui/icons-material";
import Axios from "axios";

export default function FutureSlotsComp(props) {
    const [fromDate, setFromDate] = useState("");
    const [untilDate, setUntilDate] = useState("");
    const [startSelectionFutureSlot, setStartSelectionFutureSlot] = useState({});
    const [selectedDayTimesFutureSlots, setSelectedDayTimesFutureSlots] = useState([]);
    const weekDays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

    const styleFutureSlotCell = (day, time) => {
        return selectedDayTimesFutureSlots.includes(day + " " + time);
    };

    const onMouseDownHandlerFutureSlot = (e, day, time) => {
        e.preventDefault();
        setStartSelectionFutureSlot({ day, time });
    };

    const onMouseUpHandlerFutureSlot = (e, day, time) => {
        const selectedDayTimesFutureSlotsCopy = new Set(selectedDayTimesFutureSlots);
        if (Object.keys(startSelectionFutureSlot).length > 0) {
            const [startDay, startTime] = Object.values(startSelectionFutureSlot);

            if (day >= startDay) {
                const days = [...Array(day - startDay + 1).keys()].map(e => e + startDay);
                const times = props.timeSlots.slice(props.timeSlots.indexOf(startTime), props.timeSlots.indexOf(time) + 1);

                for (const day of days)
                    for (const time of times) {
                        const key = day + " " + time;
                        if (!selectedDayTimesFutureSlotsCopy.has(key))
                            selectedDayTimesFutureSlotsCopy.add(key);
                        else
                            selectedDayTimesFutureSlotsCopy.delete(key);
                    }

                setSelectedDayTimesFutureSlots(Array.from(selectedDayTimesFutureSlotsCopy));
            }
        }
        setStartSelectionFutureSlot({});
    };

    const addBulkFutureSlots = _ => {
        const futureSlotsDays = [];
        const startDate = props.moment(fromDate);
        const endDate = props.moment(untilDate);
        const bulk = [];

        while (startDate.isSameOrBefore(endDate)) {
            futureSlotsDays.push(startDate.format("MM/DD/YYYY"));
            startDate.add(1, "days");
        }

        futureSlotsDays.flatMap(d => 
            selectedDayTimesFutureSlots.flatMap(sdt => 
                ((props.moment(d, "MM/DD/YYYY").day()) === ((Number(sdt.split(" ")[0]) + 1) % 7)) ? [d + " " + sdt.split(" ")[1]] : [])).forEach(k => {
            if (!(bulk.includes(k)))
                bulk.push(k);
        });

        props.enqueueSnackbar("Richiesta di creazione slot effettuata, attendere...", { variant: "warning" });

        Axios.post(props.ipPortApi + "addFutureSlots/" + props.token, {
            slotsArr: bulk
        }).then(response => {
            if (response.data.messageOk) {
                props.enqueueSnackbar(response.data.messageOk, { variant: "success" });
                props.setIsSubmittingFutureSlots(false);
                props.setTriggerCompsUE(true);
            }
            else {
                props.enqueueSnackbar("Errore dal server: " + response.data.message, { variant: "error" });
                props.setIsSubmittingFutureSlots(false);
            }
        }).catch(error => { console.log(error); props.setIsSubmittingFutureSlots(false); });
    };

    useEffect(_ => {
        if (props.isSubmittingFutureSlots && props.triggerCompsUE === false) {
            addBulkFutureSlots();
        }
        else {
            setFromDate("");
            setUntilDate("");
            setSelectedDayTimesFutureSlots([]);
        }
    }, [props.isSubmittingFutureSlots, props.triggerCompsUE]);

    return (
        <>
            <Box py={props.sm ? 0 : 2}>
                <Typography variant="calendarCompSubtitle">Crea slot future</Typography>
            </Box>
            <Box py={1} {...(props.lg && { display: "flex", justifyContent: "space-between" })}>
                <StyledFilledTextField
                    style={{ margin: "12px 0px", ...(props.lg && { width: "40%" }) }}
                    fullWidth={!props.lg}
                    variant="filled"
                    label="Da"
                    placeholder="Da"
                    type="date"
                    required
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    InputProps={{ inputProps: { min: props.moment(props.lastSlotDate).clone().add(1, "days").format("YYYY-MM-DD"), ...(untilDate && { max: props.moment(untilDate).format("YYYY-MM-DD") }) } }}
                    InputLabelProps={{ shrink: true }}
                />
                <StyledFilledTextField
                    style={{ margin: "12px 0px", ...(props.lg && { width: "40%" }) }}
                    fullWidth={!props.lg}
                    variant="filled"
                    label="A"
                    placeholder="A"
                    type="date"
                    required
                    value={untilDate}
                    onChange={e => setUntilDate(e.target.value)}
                    InputProps={{ inputProps: { min: fromDate ? props.moment(fromDate).format("YYYY-MM-DD") : props.moment(props.lastSlotDate).clone().add(1, "days").format("YYYY-MM-DD") } }}
                    InputLabelProps={{ shrink: true }}
                />
            </Box>
            <Table sx={{
                "& .MuiTableCell-root": {
                    padding: props.sm ? "4px" : "2px",
                    textAlign: "center",
                    fontWeight: "bold",
                    ":not(:first-of-type):not(.MuiTableCell-head)": {
                        border: "1px solid " + props.theme.palette.primary.disabledGrey
                    },
                    ":first-of-type": {
                        border: "none",
                        width: "1%",
                        whiteSpace: "nowrap"
                    }
                }
            }}>
                <TableHead>
                    <TableRow>
                        <StyledTableCell />
                        {weekDays.map((day, i) => (
                            <StyledTableCell key={i}>
                                <Box align="center">
                                    {props.sm ? day : day.charAt(0)}
                                </Box>
                            </StyledTableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.timeSlots.map(time => (
                        <TableRow key={time}>
                            <StyledTableCell>{props.moment(time, "HH:mm").format("H")}</StyledTableCell>
                            {weekDays.map((_, index) =>
                                <StyledTableCell
                                    key={index}
                                    onMouseDown={e => onMouseDownHandlerFutureSlot(e, index, time)}
                                    onMouseUp={e => onMouseUpHandlerFutureSlot(e, index, time)}
                                    style={{
                                        position: "relative",
                                        ...(Object.keys(startSelectionFutureSlot).length > 0 && startSelectionFutureSlot.day === index && startSelectionFutureSlot.time.localeCompare(time) === 0 && { boxShadow: "inset 0px 0px 5px" + props.theme.palette.primary.yellow })
                                    }}
                                >
                                    {
                                        styleFutureSlotCell(index, time) &&
                                        <AddCircle style={props.zoomIconStyle} />
                                    }
                                </StyledTableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Box width="100%" display="flex" justifyContent="flex-end" py={2}>
                <StyledOutlinedButton
                    disabled={props.isSubmittingFutureSlots || selectedDayTimesFutureSlots.length === 0 || !(fromDate && untilDate)}
                    style={{ borderColor: (props.isSubmittingFutureSlots || selectedDayTimesFutureSlots.length === 0 || !(fromDate && untilDate)) ? props.theme.palette.primary.disabledGrey : props.theme.palette.primary.main }}
                    onClick={_ => props.setIsSubmittingFutureSlots(true)}>
                    Conferma
                </StyledOutlinedButton>
            </Box>
        </>
    );
}