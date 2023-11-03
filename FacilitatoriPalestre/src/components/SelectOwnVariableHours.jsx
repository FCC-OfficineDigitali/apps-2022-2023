import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import moment from "moment";
import { LargerThanSm } from "../MediaQueries";
import { getVariableAvailabilitiesAllDataForDateFacilitator } from "../services/apiFacilitatori";
import CheckList from "./CheckList";

export default function SelectOwnVariableHours(props) {
    const sm = LargerThanSm();

    const [openingHours, setOpeningHours] = useState([]);

    const choices = ["09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00"];

    useEffect(_ => {
        getVariableAvailabilitiesAllDataForDateFacilitator(props.userInfo.facilitator_id, moment(props.selectedDate).format("YYYY-MM-DD"), props.setSelectedVariableHours, true);

        var slotsString = choices.join(",");
        var hoursToExcludeString = props.hoursToExcludeInVariable.join(",");
        var finalStr = props.rimuoviSovrapposizioni(slotsString, hoursToExcludeString).split(",");

        setOpeningHours(finalStr != "" ? finalStr : []);
        props.setFinalVariableHours(finalStr != "" ? finalStr : []);
    }, []);

    return (
        <>
            <Typography gutterBottom variant="h5">Indica le tue disponibilità per il giorno {props.selectedDate.format(sm ? "dddd D MMMM YYYY" : "D/MM/YYYY")}</Typography>
            {
                openingHours.length > 0 ?
                    <CheckList choices={openingHours} selectedHours={props.selectedVariableHours} setSelectedHours={props.setSelectedVariableHours} />
                    :
                    <Typography variant="h5" textAlign="center">
                        Selezionare una palestra per visualizzare gli orari
                    </Typography>
            }
        </>
    );
}