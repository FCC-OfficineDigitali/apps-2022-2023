import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Axios from "axios";
import moment from "moment";
import ipPortApi from "../ipPortApi";
import ExceptionsComp from "./ExceptionsComp";
import FutureSlotsComp from "./FutureSlotsComp";

export default function CalendarComp(props) {
    const [lastSlotDate, setLastSlotDate] = useState(null);
    const [isSubmittingFutureSlots, setIsSubmittingFutureSlots] = useState(false);
    const [isSubmittingExceptions, setIsSubmittingExceptions] = useState(false);
    const [triggerCompsUE, setTriggerCompsUE] = useState(false);
    const openHour = 8;
    const closeHour = 22;
    const monthsNrLimit = 2;
    const timeSlots = [...Array(closeHour - openHour)].map((i, index) => ("0" + (index + openHour)).slice(-2) + ":00");

    const zoomIconStyle = {
        color: props.theme.palette.primary.main,
        position: "absolute",
        height: "calc(100% - " + (props.sm ? 8 : 4) + "px)",
        transform: "translate(-50%, -50%)",
        animation: "fadeAnimation 0.2s ease-in-out"
    };

    const lastLessThanMonths = lastSlotDate => {
        return moment(lastSlotDate).diff(moment(), "months") < monthsNrLimit;
    };

    useEffect(_ => {
        if (!isSubmittingFutureSlots && !isSubmittingExceptions)
            Axios.get(ipPortApi + "getLastSlotDate/" + props.token)
                .then(data => {
                    if (data.data.message) {
                        props.enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                        setLastSlotDate(null);
                    }
                    else
                        setLastSlotDate(data.data);
                })
                .catch(error => { setLastSlotDate(null); console.log(error); });
        if (triggerCompsUE === true)
            setTriggerCompsUE(false);
    }, [isSubmittingFutureSlots, isSubmittingExceptions, triggerCompsUE]);

    return (
        <>
            {lastSlotDate &&
                <>
                    <Box display="flex" flexDirection={props.sm ? "row" : "column"} {...(props.sm && { alignItems: "stretch" })}>
                        <Box {...(props.sm && { width: "40%" })} border={"1px solid " + (lastLessThanMonths(lastSlotDate) ? props.theme.palette.primary.orange : props.theme.palette.primary.green)} display="flex" alignItems="center" justifyContent="center" p={4}>
                            <Box textAlign="center">
                                <Typography variant="h5">Sono state create slot fino al</Typography>
                                <Typography fontFamily="Atlas Grotesk" fontSize={props.lg ? 48 : (props.sm ? 32 : 24)} color={lastLessThanMonths(lastSlotDate) ? props.theme.palette.primary.orange : props.theme.palette.primary.green} pt={1}>{moment(lastSlotDate).format("DD/MM/YYYY")}</Typography>
                            </Box>
                        </Box>
                        <Box {...(props.sm && { width: "60%" })} pl={props.sm ? 4 : 0}>
                            <FutureSlotsComp enqueueSnackbar={props.enqueueSnackbar} ipPortApi={ipPortApi} isSubmittingFutureSlots={isSubmittingFutureSlots} lastSlotDate={lastSlotDate} lg={props.lg} moment={moment} setIsSubmittingFutureSlots={setIsSubmittingFutureSlots} setTriggerCompsUE={setTriggerCompsUE} sm={props.sm} theme={props.theme} timeSlots={timeSlots} token={props.token} triggerCompsUE={triggerCompsUE} zoomIconStyle={zoomIconStyle} />
                        </Box>
                    </Box>
                </>
            }
            <Box py={2}>
                <Typography variant="calendarCompSubtitle">Seleziona eccezioni</Typography>
            </Box>
            <Box width="100%" display="flex" flexDirection={props.sm ? "row" : "column"} justifyContent="flex-end" py={2}>
                {[[props.theme.palette.primary.green, "Nessun utente prenotato"], [props.theme.palette.primary.red, "Prenotato da qualche utente"], [props.theme.palette.primary.grey, "Non selezionabile"]].map((e, i) =>
                    <Box p={1} key={i} display="flex" alignItems="center">
                        <Box bgcolor={e[0]} width="28px" height="14px" mr={1} />
                        <Typography variant="dialogSubtitle">{e[1]}</Typography>
                    </Box>
                )}
            </Box>
            <ExceptionsComp capitalize={props.capitalize} enqueueSnackbar={props.enqueueSnackbar} ipPortApi={ipPortApi} isSubmittingExceptions={isSubmittingExceptions} lastLessThanMonths={lastLessThanMonths} lastSlotDate={lastSlotDate} moment={moment} setIsSubmittingExceptions={setIsSubmittingExceptions} setTriggerCompsUE={setTriggerCompsUE} sm={props.sm} theme={props.theme} timeSlots={timeSlots} token={props.token} triggerCompsUE={triggerCompsUE} zoomIconStyle={zoomIconStyle} />
        </>
    );
}