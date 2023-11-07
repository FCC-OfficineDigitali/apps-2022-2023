import { useEffect, useState } from "react";
import { Badge, Box, Typography } from "@mui/material";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay } from "@mui/x-date-pickers";
import moment from "moment";
import { LargerThanSm } from "../MediaQueries";
import ReadOnlyPopup from "./ReadOnlyPopup";
import { getFacilitatorMonthAvailabilities } from "../services/apiFacilitatori";

export default function BottomCalendar(props) {
    const sm = LargerThanSm();

    const month = moment();
    const [showPopup, setShowPopup] = useState(false);
    const [selectedDate, setSelectedDate] = useState(month);
    const [calendarData, setCalendarData] = useState([]);

    const closePopup = _ => setShowPopup(false);

    useEffect(_ => {
        getFacilitatorMonthAvailabilities(props.userInfo.facilitator_id, month.format("YYYY-MM"), setCalendarData);
    }, []);

    return (
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="it">
            <ReadOnlyPopup showPopup={showPopup} closePopup={closePopup} selectedDate={selectedDate} setSelectedDate={setSelectedDate} userInfo={props.userInfo} />
            <Box width={sm ? "84%" : "100%"} height={sm ? "50%" : "100%"} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Typography gutterBottom={!sm} fontWeight="bold" textAlign="center">Impegni per il mese in corso</Typography>
                <DateCalendar
                    value={selectedDate}
                    views={["day"]}
                    onChange={newValue => { setSelectedDate(newValue); setShowPopup(true); }}
                    slots={{
                        day: props => (
                            <Badge
                                key={props.day.toString()}
                                color="primary"
                                invisible={!(calendarData.some(e => moment(moment(e.availability_date).format("YYYY-MM-DD")).isSame(moment(props.day.format("YYYY-MM-DD"))) && (e.row_type.localeCompare("fixed") === 0 || e.operator_requested_times !== null)))}
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
                />
            </Box>
        </LocalizationProvider>
    );
}
