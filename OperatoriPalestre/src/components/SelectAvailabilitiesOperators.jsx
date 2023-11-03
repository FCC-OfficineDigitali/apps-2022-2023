import { useEffect, useState } from "react";
import { Autocomplete, TextField, Typography } from "@mui/material";
import { LargerThanSm } from "../MediaQueries";
import { getMyFacilitatorVariableHoursForDate } from "../services/apiOperatori";
import CheckList from "./CheckList";

export default function SelectAvailabilitiesOperators(props) {
    const sm = LargerThanSm();

    const [gymsForAutocomplete, setGymsForAutocomplete] = useState([]);
    const [selectedGym, setSelectedGym] = useState(null);
    const [choices, setChoices] = useState([]);
    const [anotherResult, setAnotherResult] = useState([]);

    const otherGym = { gym_id: -1 };

    useEffect(_ => {
        props.setGymCustomPlace("");
        props.setNotes("");
        getMyFacilitatorVariableHoursForDate(props.userInfo.operator_id, props.selectedDate.format("YYYY-MM-DD"), setChoices, props.setVer, setAnotherResult);
    }, []);

    useEffect(_ => {
        setSelectedGym(gymsForAutocomplete.length === 0 ? otherGym : gymsForAutocomplete[0]);
    }, [gymsForAutocomplete]);

    useEffect(_ => {
        const reservedHours = [...new Set(anotherResult.map(r => r.operator_requested_times.split(",")).flat().sort())];
        const notReservedHours = choices.filter(el => !reservedHours.includes(el)).sort();

        if (selectedGym) {
            if (selectedGym.gym_id === -1) {
                props.setSelectedHours([]);
                setChoices(notReservedHours);
                props.setGymCustomPlace("");
                props.setNotes("");
            }
            else {
                const operatorsReservationsForGym = anotherResult.filter(r => r.gym_custom_place.localeCompare(selectedGym.name) === 0 && r.operator_id === props.userInfo.operator_id);

                if (operatorsReservationsForGym.length) {
                    const unionHours = [...notReservedHours, ...(operatorsReservationsForGym[0].operator_requested_times.split(","))].sort();
                    props.setSelectedHours(operatorsReservationsForGym[0].operator_requested_times.split(","));
                    setChoices(unionHours);
                    props.setGymCustomPlace(operatorsReservationsForGym[0].gym_custom_place);
                    props.setNotes(operatorsReservationsForGym[0].notes !== null ? operatorsReservationsForGym[0].notes : "");
                }
                else {
                    props.setSelectedHours([]);
                    setChoices(notReservedHours);
                }
            }
        }
    }, [selectedGym]);

    useEffect(_ => {
        const reservedHours = [...new Set(anotherResult.map(r => r.operator_requested_times.split(",")).flat().sort())];
        const notReservedHours = choices.filter(el => !reservedHours.includes(el)).sort();

        const operatorsReservationsForGym = anotherResult.filter(r => r.gym_custom_place.localeCompare(selectedGym.name) === 0 && r.operator_id === props.userInfo.operator_id);

        const operatorGymsArr = anotherResult.filter(r => r.operator_id === props.userInfo.operator_id);

        const arr = operatorGymsArr.map(el => {
            return {
                gym_id: el.availability_id,
                name: el.gym_custom_place,
                address: null,
                opening_hours: null
            }
        });

        if (operatorsReservationsForGym.length) {
            const unionHours = [...notReservedHours, ...(operatorsReservationsForGym[0].operator_requested_times.split(","))].sort();
            props.setSelectedHours(operatorsReservationsForGym[0].operator_requested_times.split(","));
            setChoices(unionHours);
        }
        else {
            props.setSelectedHours([]);
            setChoices(notReservedHours);
        }
        setGymsForAutocomplete(arr);
    }, [anotherResult]);

    return (
        <>
            <Typography gutterBottom variant="h5">Richiedi le disponibilità dei facilitatori per il giorno {props.selectedDate.format(sm ? "dddd D MMMM YYYY" : "D/MM/YYYY")} in riferimento alla palestra selezionata</Typography>
            {
                gymsForAutocomplete.length > 0 &&
                <Autocomplete
                    disableClearable
                    value={selectedGym}
                    options={[...gymsForAutocomplete, otherGym]}
                    onChange={(event, value, reason) => setSelectedGym(value)}
                    isOptionEqualToValue={(option, value) => (!option && !value) || option.gym_id === value.gym_id}
                    getOptionLabel={option => option && option.gym_id > 0 ? (option.name + (option.address ? (" (" + option.address + ")") : "")) : "Altro..."}
                    renderInput={params => <TextField {...params} label="Palestra" placeholder="Palestra" helperText="Seleziona palestra" />}
                />
            }
            {
                (gymsForAutocomplete.length === 0 || (selectedGym && selectedGym.gym_id === -1)) &&
                <TextField
                    style={{ marginTop: 10 }}
                    label="Palestra personalizzata"
                    placeholder="Palestra personalizzata"
                    type="text"
                    fullWidth
                    required
                    value={props.gymCustomPlace}
                    onChange={e => props.setGymCustomPlace(e.target.value)}
                    inputProps={{ maxLength: 200 }}
                    helperText="Specifica un testo per definire la palestra personalizzata"
                />
            }
            <TextField
                style={{ marginTop: 10 }}
                label="Note"
                placeholder="Note"
                type="text"
                fullWidth
                value={props.notes}
                onChange={e => props.setNotes(e.target.value)}
                inputProps={{ maxLength: 200 }}
                helperText="Specifica eventuali note"
            />
            {
                choices.length ?
                    <CheckList choices={choices} selectedHours={props.selectedHours} setSelectedHours={props.setSelectedHours} />
                    :
                    <Typography variant="h5" textAlign="center">
                        Nessuna disponibilità per la palestra selezionata
                    </Typography>
            }
        </>
    );
}