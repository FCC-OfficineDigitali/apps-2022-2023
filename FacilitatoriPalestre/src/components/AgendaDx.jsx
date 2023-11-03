import { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Typography,
} from "@mui/material";
import { LargerThanSm } from "../MediaQueries";
import moment from "moment";
import { getFacilitatorMonthAvailabilities } from "../services/apiFacilitatori";
import { StyledOutlinedButton } from "../styles";

export default function AgendaDx(props) {
    const sm = LargerThanSm();

    const [calendarData, setCalendarData] = useState([]);
    const [realCalendarData, setRealCalendarData] = useState([]);

    const compareDateTimes = (a, b) => {
        const dateTimeA = moment(a.availability_date + " " + a.start_time, "YYYY-MM-DD HH:mm");
        const dateTimeB = moment(b.availability_date + " " + b.start_time, "YYYY-MM-DD HH:mm");
        return dateTimeA.isBefore(dateTimeB) ? -1 : 1;
    };

    const downloadProssimiImpegni = _ => {
        if (realCalendarData.length > 0) {
            const csvContent = "Data;Ora di inizio;Ora di fine;Tipologia ore;Luogo;Note\n";

            var rows = "";

            realCalendarData.map(obj => rows += (
                moment(obj.availability_date).format("dddd D MMMM YYYY").replace("ì", "i'") + ";" +
                obj.start_time + ";" +
                obj.end_time + ";" +
                (obj.row_type.localeCompare("fixed") === 0 ? "Fisse" : "A chiamata") + ";" +
                (obj.row_type.localeCompare("fixed") === 0 ? (obj.gym_name + " (" + obj.gym_address + ")") : obj.gym_custom_place) + ";" +
                (obj.notes ?? "") + "\n"
            ));

            const blob = new Blob([csvContent + rows], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = "Impegni dal " + moment().format("DD MMMM YYYY") + ".csv";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        }
    };

    useEffect(_ => {
        getFacilitatorMonthAvailabilities(props.userInfo.facilitator_id, moment().format("YYYY-MM"), setCalendarData);
    }, []);

    useEffect(_ => {
        const rcd = calendarData
            .map(row => {
                if (row.row_type.localeCompare("fixed") === 0)
                    return row.availability_times.split(",").map(hour => Object.assign({}, row, { availability_times: hour, start_time: hour.split("-")[0], end_time: hour.split("-")[1] }))
                else
                    return row.operator_requested_times ? row.operator_requested_times.split(",").map(hour => Object.assign({}, row, { availability_times: hour, operator_requested_times: hour, start_time: hour.split("-")[0], end_time: hour.split("-")[1] })) : []
            })
            .flat()
            .filter(row => moment(row.availability_date).isSameOrAfter(moment().startOf("day")))
            .sort((a, b) => compareDateTimes(a, b)
            );

        setRealCalendarData(rcd);
    }, [calendarData]);

    return (
        <>
            <Typography gutterBottom variant="h4">Prossimi impegni</Typography>
            <StyledOutlinedButton onClick={downloadProssimiImpegni}>Scarica</StyledOutlinedButton>
            <Box mt={2}>
                {
                    realCalendarData.reduce((acc, obj, index, array) => {
                        const prevDate = index > 0 ? array[index - 1].availability_date : null;
                        if (prevDate !== obj.availability_date)
                            acc.push(<Typography gutterBottom variant="h5" key={"date-" + obj.availability_date}>{moment(obj.availability_date).format(sm ? "dddd D MMMM YYYY" : "D/MM/YYYY").charAt(0).toUpperCase() + moment(obj.availability_date).format(sm ? "dddd D MMMM YYYY" : "D/MM/YYYY").slice(1)}</Typography>);
                        acc.push(
                            <Card
                                key={index}
                                sx={{
                                    ":hover": {
                                        boxShadow: 8,
                                        transform: "scale3d(1.05, 1.05, 1)"
                                    },
                                    boxShadow: 4,
                                    transition: "transform 0.15s ease-in-out",
                                    marginTop: "16px",
                                    marginBottom: "16px"
                                }}
                            >
                                <CardActionArea onClick={_ => { }}>
                                    <CardContent>
                                        <Typography gutterBottom variant="h5">
                                            {obj.start_time}-{obj.end_time}
                                        </Typography>
                                        <Typography>
                                            <b>Tipologia:</b> {obj.row_type.localeCompare("fixed") === 0 ? "fisso" : "a chiamata"}
                                        </Typography>
                                        <Typography>
                                            <b>Luogo:</b> {obj.row_type.localeCompare("fixed") === 0 ? (obj.gym_name + " (" + obj.gym_address + ")") : obj.gym_custom_place}
                                        </Typography>
                                        {obj.notes &&
                                            <Typography>
                                                <b>Note:</b> {obj.notes}
                                            </Typography>
                                        }
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        );
                        return acc;
                    }, [])
                }
            </Box>
        </>
    );
}