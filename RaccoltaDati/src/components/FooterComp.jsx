import { Box, Grid } from "@mui/material";
import React from "react";

export default function FooterComp() {
    return (
        <>
            <footer>
                <Box>
                    <Grid container justifyContent="space-between" alignItems="center">
                        {
                            ["Federazione Camposampierese", "Officine Digitali", "por-fesr@2x 2", "PSC"].map((name, index) =>
                                <Grid item key={index}>
                                    <Box
                                        component="img"
                                        src={"./img/" + name + ".svg"}
                                        title={name}
                                        alt={"logo " + name}
                                    />
                                </Grid>
                            )
                        }
                    </Grid>
                </Box>
            </footer>
        </>
    );
}