import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import moment from "moment";
import { LargerThanSm } from "../MediaQueries";
import { getVariableAvailabilitiesAllDataForDateFacilitator } from "../services/apiFacilitatori";

export default function ShowOwnVariableAvailabilities(props) {
    const sm = LargerThanSm();

    const [filteredVariableAvailabilities, setFilteredVariableAvailabilities] = useState([]);

    useEffect(_ => {
        props.setVariableAvailabilities([]);
        getVariableAvailabilitiesAllDataForDateFacilitator(props.userInfo.facilitator_id, moment(props.selectedDate).format("YYYY-MM-DD"), props.setVariableAvailabilities, false);
    }, []);

    useEffect(_ => {
        if (props.variableAvailabilities.length > 0)
            setFilteredVariableAvailabilities(props.variableAvailabilities.filter(e => e.operator_requested_times !== null));
        else
            setFilteredVariableAvailabilities([]);
    }, [props.variableAvailabilities]);

    return (
        <>
            <Typography gutterBottom variant="h5">Le tue disponibilità richieste per il giorno {props.selectedDate.format(sm ? "dddd D MMMM YYYY" : "D/MM/YYYY")}</Typography>
            {
                filteredVariableAvailabilities.length
                    ?
                    <ul>
                        {filteredVariableAvailabilities.map((availability, index) => (
                            <li key={index}>
                                <Typography>
                                    <b>{availability.gym_custom_place}:</b> {availability.operator_requested_times.split(",").join(", ")} {(availability.notes && "(" + availability.notes + ")")}
                                </Typography>
                            </li>
                        ))}
                    </ul>
                    :
                    <Typography>Non sono state richieste disponibilità per questo giorno</Typography>
            }
        </>
    );
}