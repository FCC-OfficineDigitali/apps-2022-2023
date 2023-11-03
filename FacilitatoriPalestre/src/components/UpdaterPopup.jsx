import { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, LinearProgress } from "@mui/material";
import { LargerThanSm } from "../MediaQueries";
import SelectHoursType from "./SelectHoursType";
import SelectOwnFixedHours from "./SelectOwnFixedHours";
import SelectOwnVariableHours from "./SelectOwnVariableHours";
import { addFixedAvailability, addVariableAvailability } from "../services/apiFacilitatori";

export default function UpdaterPopup(props) {
    const sm = LargerThanSm();

    const [selectedFixedGym, setSelectedFixedGym] = useState(null);
    const [selectedFixedHours, setSelectedFixedHours] = useState([]);
    const [selectedVariableHours, setSelectedVariableHours] = useState([]);
    const [finalFixedHours, setFinalFixedHours] = useState([]);
    const [finalVariableHours, setFinalVariableHours] = useState([]);

    const [tab, setTab] = useState(0);
    const lastTab = 1;

    const [hoursType, setHoursType] = useState(null);

    const closePopup = _ => {
        setTab(0);
        setHoursType(null);
        props.closePopup();
    };

    const decrementTab = _ => setTab(tab - 1);
    const incrementTab = _ => setTab(tab + 1);

    const rimuoviSovrapposizioni = (intervalli1, intervalli2) => {
        const convertiInIntervallo = orario => {
            const [inizio, fine] = orario.split("-");
            return { inizio, fine };
        }

        const arrayIntervalli1 = intervalli1.split(",").map(convertiInIntervallo);
        const arrayIntervalli2 = intervalli2.split(",").map(convertiInIntervallo);

        const intervalliRimasti = [];

        for (const intervallo1 of arrayIntervalli1) {
            let sovrapposto = false;

            for (const intervallo2 of arrayIntervalli2) {
                if (intervallo1.inizio >= intervallo2.inizio && intervallo1.inizio < intervallo2.fine) {
                    sovrapposto = true;
                    break;
                }

                if (intervallo1.fine > intervallo2.inizio && intervallo1.fine <= intervallo2.fine) {
                    sovrapposto = true;
                    break;
                }
            }

            if (!sovrapposto)
                intervalliRimasti.push(intervallo1);
        }

        const stringaIntervalliRimasti = intervalliRimasti.map(intervallo => intervallo.inizio + "-" + intervallo.fine).join(",");

        return stringaIntervalliRimasti;
    }

    return (
        <Dialog open={props.showPopup} onClose={closePopup}
            PaperProps={{
                style: {
                    ...(sm ?
                        { width: "60vw", height: "60vh", maxWidth: "unset", maxHeight: "unset" }
                        :
                        { width: "100vw", height: "100vh", position: "fixed", top: 35, borderRadius: "16px 16px 0px 0px" }
                    )
                }
            }}
        >
            <LinearProgress variant="determinate" value={(100 / lastTab) * tab} />
            <Box style={{ ...(sm && { padding: 20 }), display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", overflow: "hidden" }}>
                <DialogContent>
                    {
                        tab === 0 &&
                        <SelectHoursType selectedDate={props.selectedDate} setHoursType={setHoursType} incrementTab={incrementTab} text="gestire" />
                    }
                    {
                        tab === 1 &&
                        (hoursType === 0 ?
                            <SelectOwnFixedHours calendarData={props.calendarData} hoursToExcludeInFixed={props.hoursToExcludeInFixed} rimuoviSovrapposizioni={rimuoviSovrapposizioni} selectedDate={props.selectedDate} selectedFixedGym={selectedFixedGym} selectedFixedHours={selectedFixedHours} setFinalFixedHours={setFinalFixedHours} setSelectedFixedGym={setSelectedFixedGym} setSelectedFixedHours={setSelectedFixedHours} userInfo={props.userInfo} />
                            :
                            <SelectOwnVariableHours hoursToExcludeInVariable={props.hoursToExcludeInVariable} rimuoviSovrapposizioni={rimuoviSovrapposizioni} selectedDate={props.selectedDate} selectedVariableHours={selectedVariableHours} setSelectedVariableHours={setSelectedVariableHours} setFinalVariableHours={setFinalVariableHours} userInfo={props.userInfo} />
                        )
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={_ => tab === 0 ? closePopup() : decrementTab()}>{tab === 0 ? "Annulla" : "Indietro"}</Button>
                    <Button onClick={_ => hoursType === 0 ?
                        addFixedAvailability(props.userInfo.facilitator_id, selectedFixedGym.gym_id, props.selectedDate.format("YYYY-MM-DD"), selectedFixedHours.join(","), props.invertToggleTriggerUpdateCalendar, closePopup)
                        :
                        addVariableAvailability(props.userInfo.facilitator_id, props.selectedDate.format("YYYY-MM-DD"), selectedVariableHours.join(","), props.invertToggleTriggerUpdateCalendar, closePopup)
                    }
                        disabled={tab !== lastTab || (hoursType === 0 && !selectedFixedGym) || (finalFixedHours.length === 0 && finalVariableHours.length === 0)}
                    >
                        Salva
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}