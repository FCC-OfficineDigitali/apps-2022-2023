import { useEffect, useState } from "react";
import { Badge, Box, Typography } from "@mui/material";
import moment from "moment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LargerThanSm } from "../MediaQueries";
import ReadOnlyPopupFixed from "./ReadOnlyPopupFixed";
import { getFacilitatorMonthAvailabilitiesGivenOperatorObj } from "../services/apiOperatori";

export default function BottomLeftCalendar(props) {
    const sm = LargerThanSm();

    const [month, setMonth] = useState(moment());
    const [showPopup, setShowPopup] = useState(false);
    const [selectedDate, setSelectedDate] = useState(moment());
    const [bottomLeftCalendarData, setBottomLeftCalendarData] = useState({ fixedResults: [], variableResults: [], facilitator: {} });

    const closePopup = _ => setShowPopup(false);

    useEffect(_ => {
        getFacilitatorMonthAvailabilitiesGivenOperatorObj(props.userInfo.operator_id, month.format("YYYY-MM"), setBottomLeftCalendarData);
    }, [month]);

    return (
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="it">
            <ReadOnlyPopupFixed showPopup={showPopup} closePopup={closePopup} facilitator={bottomLeftCalendarData.facilitator} fixedResults={bottomLeftCalendarData.fixedResults.filter(e => moment(moment(e.availability_date).format("YYYY-MM-DD")).isSame(moment(selectedDate.format("YYYY-MM-DD"))))} selectedDate={selectedDate} />
            <Box width={sm ? "50%" : "100%"} height="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Typography gutterBottom={!sm} fontWeight="bold">Ore fisse</Typography>
                <DateCalendar
                    value={selectedDate}
                    views={["day"]}
                    onMonthChange={newMonth => setMonth(newMonth)}
                    onChange={newValue => { setSelectedDate(newValue); setShowPopup(true); }}
                    slots={{
                        day: props => (
                            <Badge
                                key={props.day.toString()}
                                color="primary"
                                invisible={bottomLeftCalendarData.fixedResults.length === 0 || !bottomLeftCalendarData.fixedResults.some(e => moment(moment(e.availability_date).format("YYYY-MM-DD")).isSame(moment(props.day.format("YYYY-MM-DD"))))}
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
                        }
                    }}
                    maxDate={moment(moment().endOf("month"))}
                />
            </Box>
        </LocalizationProvider>
    );
}
