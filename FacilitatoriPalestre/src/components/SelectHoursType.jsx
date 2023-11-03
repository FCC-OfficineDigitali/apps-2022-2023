import { Box, Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { LargerThanSm } from "../MediaQueries";

export default function SelectHoursType(props) {
    const sm = LargerThanSm();

    return (
        <>
            <Typography gutterBottom variant="h5">Cosa vuoi {props.text} per il giorno {props.selectedDate.format(sm ? "dddd D MMMM YYYY" : "D/MM/YYYY")}?</Typography>
            <Box {...(!sm && { flexDirection: "column" })} display="flex" alignItems="center" justifyContent="space-around">
                {
                    ["Ore fisse", "Ore a chiamata"].map((e, index) =>
                        <Card
                            key={index}
                            sx={{
                                ":hover": {
                                    boxShadow: 8,
                                    transform: "scale3d(1.05, 1.05, 1)"
                                },
                                boxShadow: 4,
                                transition: "transform 0.15s ease-in-out",
                                width: sm ? "50%" : "100%",
                                margin: "8px"
                            }}
                        >
                            <CardActionArea onClick={_ => { props.setHoursType(index); props.incrementTab(); }}>
                                <CardContent>
                                    <Typography gutterBottom variant="h5" textAlign="center">
                                        {e}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    )
                }
            </Box>
        </>
    );
}