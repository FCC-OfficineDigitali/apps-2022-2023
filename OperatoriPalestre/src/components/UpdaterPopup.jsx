import { useRef, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import { LargerThanSm } from "../MediaQueries";
import { updateAvailabilityTimesForOperator } from "../services/apiOperatori";
import SelectAvailabilitiesOperators from "./SelectAvailabilitiesOperators";

export default function UpdaterPopup(props) {
    const sm = LargerThanSm();

    const [gymCustomPlace, setGymCustomPlace] = useState("");
    const [selectedHours, setSelectedHours] = useState([]);
    const [ver, setVer] = useState(null);
    const [notes, setNotes] = useState("");

    const formRef = useRef();

    const closePopup = _ => {
        props.closePopup();
    };

    return (
        <Dialog open={props.showPopup} onClose={closePopup}
            PaperProps={{
                style: {
                    ...(sm ?
                        { width: "60vw", height: "60vh", maxWidth: "unset", maxHeight: "unset" }
                        :
                        { width: "100vw", height: "100vh", position: "fixed", top: 35, borderRadius: "16px 16px 0px 0px" })
                }
            }}
        >
            <form ref={formRef} style={{ ...(sm && { padding: 20 }), display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", overflow: "hidden" }}>
                <DialogContent>
                    <SelectAvailabilitiesOperators gymCustomPlace={gymCustomPlace} notes={notes} selectedDate={props.selectedDate} selectedHours={selectedHours} setGymCustomPlace={setGymCustomPlace} setNotes={setNotes} setSelectedHours={setSelectedHours} setVer={setVer} userInfo={props.userInfo} ver={ver} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closePopup}>Annulla</Button>
                    <Button onClick={_ => {
                        if (formRef.current.reportValidity()) {
                            updateAvailabilityTimesForOperator(props.userInfo.operator_id, gymCustomPlace, props.selectedDate.format("YYYY-MM-DD"), selectedHours.join(","), ver, notes.length > 0 ? notes : null);
                            closePopup();
                        }
                    }}>Salva</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}