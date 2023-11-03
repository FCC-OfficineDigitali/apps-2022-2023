import { useEffect, useState } from "react";
import { Autocomplete, TextField, Typography } from "@mui/material";
import moment from "moment";
import { LargerThanSm } from "../MediaQueries";
import { getFixedAvailabilityForDateGymFacilitator, getOwnGyms } from "../services/apiFacilitatori";
import CheckList from "./CheckList";

export default function SelectOwnFixedHours(props) {
    const sm = LargerThanSm();

    const [gymsArr, setGymsArr] = useState([]);
    const [gymOpeningHours, setGymOpeningHours] = useState([]);

    const capitalizeWord = word => word.charAt(0).toUpperCase() + word.slice(1);

    useEffect(_ => {
        props.setSelectedFixedGym(null);
        props.setSelectedFixedHours([]);
        getOwnGyms(props.userInfo.facilitator_id, setGymsArr, capitalizeWord(moment(props.selectedDate).format("dddd")));
    }, []);

    useEffect(_ => {
        if (props.selectedFixedGym)
            getFixedAvailabilityForDateGymFacilitator(props.userInfo.facilitator_id, props.selectedFixedGym.gym_id, moment(props.selectedDate).format("YYYY-MM-DD"), props.setSelectedFixedHours);
        if (props.selectedFixedGym) {
            const arrOfRanges = JSON.parse(props.selectedFixedGym.opening_hours)[capitalizeWord(moment(props.selectedDate).format("dddd"))].split(",").map(rng => rng.split("-"));
            const timeSlots = [];

            arrOfRanges.forEach(([startTime, endTime]) => {
                const start = moment(startTime, "HH:mm");
                const end = moment(endTime, "HH:mm");

                const minsDifference = end.diff(start, "minutes");

                var curHour = minsDifference % 60 === 0 ? start : start.clone().add(minsDifference % 60, "minutes");
                const hoursNr = (minsDifference - (minsDifference % 60)) / 60;

                for (let i = 0; i < hoursNr; ++i) {
                    const nextHourStart = curHour.clone().add("1", "hours");
                    timeSlots.push(curHour.format("HH:mm") + "-" + nextHourStart.format("HH:mm"));
                    curHour = nextHourStart;
                }
            });

            var slotsString = timeSlots.join(",");
            var hoursToExcludeString = props.hoursToExcludeInFixed.join(",");
            var finalStr = props.rimuoviSovrapposizioni(slotsString, hoursToExcludeString).split(",").sort();
            const filteredCalendarData = props.calendarData.find(row => row.row_type.localeCompare("fixed") === 0 && moment(row.availability_date).format("YYYY-MM-DD").localeCompare(moment(props.selectedDate).format("YYYY-MM-DD")) === 0 && row.gym_id === props.selectedFixedGym.gym_id);

            if (filteredCalendarData)
                finalStr = [...finalStr, ...(filteredCalendarData.availability_times.split(","))].sort();

            setGymOpeningHours(finalStr != "" ? finalStr.filter(h => h != "") : []);
            props.setFinalFixedHours(finalStr != "" ? finalStr.filter(h => h != "") : []);
        }
    }, [props.selectedFixedGym]);

    return (
        <>
            <Typography gutterBottom variant="h5">Indica le tue ore fisse per il giorno {props.selectedDate.format(sm ? "dddd D MMMM YYYY" : "D/MM/YYYY")} in riferimento alla palestra selezionata</Typography>
            <Autocomplete
                value={props.selectedFixedGym}
                options={gymsArr}
                onChange={(event, value, reason) => props.setSelectedFixedGym(value)}
                getOptionLabel={option => option.name + " (" + option.address + ")"}
                renderInput={params => <TextField {...params} label="Palestra" placeholder="Palestra" helperText="Seleziona palestra" />}
            />
            {
                props.selectedFixedGym ?
                    (
                        gymOpeningHours.length > 0 ?
                            <CheckList choices={gymOpeningHours} selectedHours={props.selectedFixedHours} setSelectedHours={props.setSelectedFixedHours} />
                            :
                            <Typography variant="h5" textAlign="center">
                                Nessun orario disponibile
                            </Typography>
                    )
                    :
                    <Typography variant="h5" textAlign="center">
                        Selezionare una palestra per visualizzare gli orari
                    </Typography>
            }
        </>
    );
}