import { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, LinearProgress } from "@mui/material";
import { LargerThanSm } from "../MediaQueries";
import SelectHoursType from "./SelectHoursType";
import ShowOwnFixedAvailabilities from "./ShowOwnFixedAvailabilities";
import ShowOwnVariableAvailabilities from "./ShowOwnVariableAvailabilities";

export default function ReadOnlyPopup(props) {
    const sm = LargerThanSm();

    const [fixedAvailabilities, setFixedAvailabilities] = useState([]);
    const [variableAvailabilities, setVariableAvailabilities] = useState([]);

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
                        <SelectHoursType selectedDate={props.selectedDate} setHoursType={setHoursType} incrementTab={incrementTab} text="visualizzare" />
                    }
                    {
                        tab === 1 &&
                        (hoursType === 0 ?
                            <ShowOwnFixedAvailabilities selectedDate={props.selectedDate} fixedAvailabilities={fixedAvailabilities} setFixedAvailabilities={setFixedAvailabilities} userInfo={props.userInfo} />
                            :
                            <ShowOwnVariableAvailabilities selectedDate={props.selectedDate} variableAvailabilities={variableAvailabilities} setVariableAvailabilities={setVariableAvailabilities} userInfo={props.userInfo} />
                        )
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={_ => tab === 0 ? closePopup() : decrementTab()}>{tab === 0 ? "Annulla" : "Indietro"}</Button>
                    <Button onClick={_ => {
                        closePopup();
                    }}
                        disabled={tab !== lastTab}
                    >
                        Chiudi
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}