import { useEffect } from "react";
import { Typography } from "@mui/material";
import moment from "moment";
import { LargerThanSm } from "../MediaQueries";
import { getFixedAvailabilitiesAllDataForDateFacilitator } from "../services/apiFacilitatori";

export default function ShowOwnFixedAvailabilities(props) {
    const sm = LargerThanSm();

    useEffect(_ => {
        props.setFixedAvailabilities([]);
        getFixedAvailabilitiesAllDataForDateFacilitator(props.userInfo.facilitator_id, moment(props.selectedDate).format("YYYY-MM-DD"), props.setFixedAvailabilities);
    }, []);

    return (
        <>
            <Typography gutterBottom variant="h5">Le tue ore fisse per il giorno {props.selectedDate.format(sm ? "dddd D MMMM YYYY" : "D/MM/YYYY")}</Typography>
            {
                props.fixedAvailabilities.length
                    ?
                    <ul>
                        {props.fixedAvailabilities.map(availability => (
                            <li key={availability.availability_id}>
                                <Typography>
                                    <b>{availability.gym_name}:</b> {availability.availability_times.split(",").join(", ")}
                                </Typography>
                            </li>
                        ))}
                    </ul>
                    :
                    <Typography>Non hai indicato ore fisse per questo giorno</Typography>
            }
        </>
    );
}