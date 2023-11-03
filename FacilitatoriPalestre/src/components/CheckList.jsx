import { Checkbox, FormControlLabel, FormGroup, Grid } from "@mui/material";

export default function CheckList(props) {
    function toggleHour(hour) {
        const updatedSelectedHours = [...props.selectedHours];

        if (updatedSelectedHours.includes(hour))
            updatedSelectedHours.splice(updatedSelectedHours.indexOf(hour), 1);
        else
            updatedSelectedHours.push(hour);

        updatedSelectedHours.sort();
        props.setSelectedHours(updatedSelectedHours);
    }

    return (
        <>
            <FormGroup>
                <Grid container justifyContent="center" spacing={2}>
                    {
                        props.choices.map((hour, index) =>
                            <Grid item key={index}>
                                <FormControlLabel control={<Checkbox checked={props.selectedHours.includes(hour)} onChange={_ => toggleHour(hour)} />} label={hour} />
                            </Grid>
                        )
                    }
                </Grid>
            </FormGroup>
        </>
    );
}