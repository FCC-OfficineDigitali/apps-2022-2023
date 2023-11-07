import { useEffect, useState } from "react";
import { Badge, Box, Typography } from "@mui/material";
import moment from "moment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LargerThanSm } from "../MediaQueries";
import UpdaterPopup from "./UpdaterPopup";
import { getFacilitatorMonthAvailabilitiesGivenOperator } from "../services/apiOperatori";

export default function TOPCalendar(props) {
    const sm = LargerThanSm();

    const month = moment().add(1, "month");
    const [showPopup, setShowPopup] = useState(false);
    const [selectedDate, setSelectedDate] = useState(month.startOf("month"));
    const [topCalendarData, setTopCalendarData] = useState({});

    const closePopup = _ => setShowPopup(false);

    useEffect(_ => {
        getFacilitatorMonthAvailabilitiesGivenOperator(props.userInfo.operator_id, month.format("YYYY-MM"), setTopCalendarData);
    }, []);

    return (
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="it">
            <UpdaterPopup showPopup={showPopup} closePopup={closePopup} selectedDate={selectedDate} userInfo={props.userInfo} />
            <Box width={sm ? "84%" : "100%"} height={sm ? "50%" : "100%"} display="flex" flexDirection="column" alignItems="center" justifyContent="center" pt={sm ? 0 : 2}>
                <Typography gutterBottom={!sm} fontWeight="bold" textAlign="center">Prenota impegni per il facilitatore su sue disponibilità per il mese successivo</Typography>
                <DateCalendar
                    value={selectedDate}
                    views={["day"]}
                    onChange={newValue => { setSelectedDate(newValue); setShowPopup(true); }}
                    slots={{
                        day: slotProps => (
                            <Badge
                                key={slotProps.day.toString()}
                                color="primary"
                                invisible={Object.keys(topCalendarData).length === 0 || !topCalendarData.variableResults.some(e => e.operator_id === props.userInfo.operator_id && moment(moment(e.availability_date).format("YYYY-MM-DD")).isSame(moment(slotProps.day.format("YYYY-MM-DD"))))}
                                overlap="circular"
                                variant="dot"
                            >
                                <PickersDay {...slotProps} />
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
                    disabled={moment().startOf("day").isSameOrBefore(moment(moment().format("YYYY-MM-15"))) || moment().startOf("day").isAfter(moment(moment().format("YYYY-MM-28")))}
                />
            </Box>
        </LocalizationProvider>
    );
}
