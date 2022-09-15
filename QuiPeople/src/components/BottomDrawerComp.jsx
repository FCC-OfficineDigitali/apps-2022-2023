import React, { useState } from "react";
import { Box, Drawer, Grid, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Global } from "@emotion/react";
import { LargerThanLg } from "../MediaQueries";
import { StyledBoxForDrawer } from "../styles";

export default function BottomDrawerComp(props) {
    const [open, setOpen] = useState(false);
    const lg = LargerThanLg();
    const drawerBleeding = 56;

    const toggleDrawer = (newOpen) => _ => {
        setOpen(newOpen);
    };

    return (
        <>
            {!lg &&
                <>
                    <Drawer
                        anchor="bottom"
                        open={open}
                        onClick={toggleDrawer(!open)}
                        ModalProps={{
                            keepMounted: true,
                        }}
                        sx={{
                            "> .MuiPaper-root": {
                                height: "calc(50% - ${drawerBleeding}px)",
                                overflow: "visible"
                            }
                        }}
                    >
                        <StyledBoxForDrawer
                            sx={{
                                position: "absolute",
                                top: -drawerBleeding,
                                borderTopLeftRadius: 8,
                                borderTopRightRadius: 8,
                                visibility: "visible",
                                right: 0,
                                left: 0,
                                pointerEvents: "all"
                            }}
                        >
                            <Grid
                                container
                                spacing={2}
                                justifyContent={"space-between"}
                                direction={"row"}
                                padding={2}
                                align="center"
                                maxHeight={72}
                            >
                                <Grid item xs={2} />
                                <Grid item xs={8}>
                                    <Typography variant="denominazione" sx={{ color: "#FFFFFF", display: "block", fontSize: 16 }} noWrap>{props.title}</Typography>
                                </Grid>
                                <Grid item xs={2}>
                                    {open &&
                                        <IconButton onClick={_ => props.setShowDrawer(false)} sx={{ transform: 'translate(-4px,-4px)' }}>
                                            <CloseIcon color="white" />
                                        </IconButton>
                                    }
                                </Grid>
                            </Grid>
                        </StyledBoxForDrawer>
                        <Box
                            onClick={e => e.stopPropagation()}
                            sx={{
                                px: 2,
                                height: "75vh",
                                overflow: "auto",
                                backgroundColor: "white",
                            }}
                            padding={2}
                        >
                            {props.dataToShow}
                        </Box>
                    </Drawer>
                </>
            }
        </>
    );
}