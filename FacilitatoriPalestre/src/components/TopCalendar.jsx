import { useEffect, useState } from "react";
import { Badge, Box, Typography } from "@mui/material";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay } from "@mui/x-date-pickers";
import moment from "moment";
import { LargerThanSm } from "../MediaQueries";
import UpdaterPopup from "./UpdaterPopup";
import { getFacilitatorMonthAvailabilities } from "../services/apiFacilitatori";

export default function TopCalendar(props) {
    const sm = LargerThanSm();

    const month = moment().add(1, "month");
    const [showPopup, setShowPopup] = useState(false);
    const [selectedDate, setSelectedDate] = useState(month.startOf("month"));
    const [calendarData, setCalendarData] = useState([]);

    const [hoursToExcludeInFixed, setHoursToExcludeInFixed] = useState("");
    const [hoursToExcludeInVariable, setHoursToExcludeInVariable] = useState("");

    const [toggleTriggerUpdateCalendar, setToggleTriggerUpdateCalendar] = useState(false);

    const invertToggleTriggerUpdateCalendar = _ => setToggleTriggerUpdateCalendar(!toggleTriggerUpdateCalendar);

    const closePopup = _ => setShowPopup(false);

    useEffect(_ => {
        getFacilitatorMonthAvailabilities(props.userInfo.facilitator_id, month.format("YYYY-MM"), setCalendarData);
    }, [toggleTriggerUpdateCalendar]);

    useEffect(_ => {
        if (selectedDate) {
            setHoursToExcludeInFixed(calendarData.filter(row => moment(moment(row.availability_date).format("YYYY-MM-DD")).isSame(moment(selectedDate.format("YYYY-MM-DD")))).map(row => row.availability_times.split(",")).flat());
            setHoursToExcludeInVariable(calendarData.filter(row => row.row_type.localeCompare("fixed") === 0 && moment(moment(row.availability_date).format("YYYY-MM-DD")).isSame(moment(selectedDate.format("YYYY-MM-DD")))).map(row => row.availability_times.split(",")).flat());
        }
    }, [calendarData, selectedDate]);

    return (
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="it">
            <UpdaterPopup showPopup={showPopup} closePopup={closePopup} calendarData={calendarData} hoursToExcludeInFixed={hoursToExcludeInFixed} hoursToExcludeInVariable={hoursToExcludeInVariable} selectedDate={selectedDate} setSelectedDate={setSelectedDate} invertToggleTriggerUpdateCalendar={invertToggleTriggerUpdateCalendar} userInfo={props.userInfo} />
            <Box width={sm ? "84%" : "100%"} height={sm ? "50%" : "100%"} display="flex" flexDirection="column" alignItems="center" justifyContent="center" pt={sm ? 0 : 2}>
                <Typography gutterBottom={!sm} fontWeight="bold" textAlign="center">Disponibilità per il mese successivo</Typography>
                <DateCalendar
                    value={selectedDate}
                    views={["day"]}
                    onChange={newValue => { setSelectedDate(newValue); setShowPopup(true); }}
                    slots={{
                        day: props => (
                            <Badge
                                key={props.day.toString()}
                                color="primary"
                                invisible={!calendarData.some(e => moment(moment(e.availability_date).format("YYYY-MM-DD")).isSame(moment(props.day.format("YYYY-MM-DD"))))}
                                overlap="circular"
                                variant="dot"
                            >
                                <PickersDay {...props} />
                            </Badge>
                        )
                    }}
                    sx={{
                        width: "100%",
                        height: "100%",
                        "& .MuiDayCalendar-header, .MuiDayCalendar-weekContainer": {
                            display: "flex",
                            justifyContent: "space-between",
                            ...(sm && { mx: 2 })
                        },
                        "& .MuiPickersDay-dayWithMargin": {
                            height: sm ? "18px" : "36px"
                        },
                        "& .MuiPickersArrowSwitcher-root": {
                            visibility: "hidden"
                        }
                    }}
                    minDate={moment(month.startOf("month"))}
                    maxDate={moment(month.endOf("month"))}
                    disabled={moment().startOf("day").isAfter(moment(moment().format("YYYY-MM-15")))}
                />
            </Box>
        </LocalizationProvider>
    );
}
