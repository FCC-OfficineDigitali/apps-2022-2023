import React, { useCallback, useEffect, useRef, useState } from "react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, Drawer, IconButton, Tab, Tabs } from "@mui/material";
import AppBarComp from "./AppBarComp";
import { useBetween } from "use-between";
import { LargerThanLg } from "../MediaQueries";

const useToggle = _ => {
    const [isOpen, setIsOpen] = useState(false);
    const change = useCallback(() => setIsOpen(mo => !mo), []);
    return { isOpen, change };
};

const useSharedToggle = _ => useBetween(useToggle);

const HandleDrawerToggle = _ => {
    const { change } = useSharedToggle();
    return change;
};

export default function FiltersDrawerComp(props) {

    const { window } = props;
    const { change, isOpen } = useSharedToggle();
    const lg = LargerThanLg();
    const appBarRef = useRef();
    const drawerWidth = lg ? (isOpen ? 30 : 0) : 75;

    const container = window !== undefined ? _ => window().document.body : undefined;

    useEffect(_ => {
        if ((lg && !isOpen) || (!lg && isOpen))
            change();
    }, [lg, props.triggerOpen]);

    return (
        <>
            <div ref={appBarRef}>
                <AppBarComp appTitle={props.appTitle} minusWidth={drawerWidth} menuFunction={HandleDrawerToggle} isOpen={isOpen} />
            </div>
            <Box sx={{ display: "flex" }}>
                <Box
                    sx={{ flexGrow: 1, width: { lg: `calc(100% - ${drawerWidth}%)` }, height: `calc(100vh - ${appBarRef.current?.clientHeight}px)`, overflowY: "auto" }}
                >
                    {props.bodyProp}
                </Box>
                <Box sx={{ width: { lg: drawerWidth + "%" }, flexShrink: { lg: 0 } }}>
                    <Drawer
                        anchor={"right"}
                        container={container}
                        open={isOpen}
                        onClose={HandleDrawerToggle()}
                        ModalProps={{
                            keepMounted: true,
                        }}
                        variant={lg ? "persistent" : "temporary"}
                        sx={{
                            zIndex: "2000",
                            "& .MuiDrawer-paper": {
                                boxSizing: "border-box",
                                width: drawerWidth + "%",
                                px: "25px",
                                background: "linear-gradient(90deg, #CDCDEB 0.76%, #F5F6FD 83.63%, #FFFFFF 95.14%)",
                                borderLeft: 0
                            }
                        }}
                    >
                        <>
                            <IconButton
                                color="secondary"
                                onClick={_ => change()}
                                style={{ justifyContent: "end", padding: "8px 8px 8px 0px", transform: "translate(-16px, 0px)", maxWidth: "3rem" }}
                            >
                                <ChevronRightIcon style={{ fontSize: "2rem" }} />
                            </IconButton>
                            {lg &&
                                <>
                                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                                        <Tabs value={props.showFilters ? 0 : 1} onChange={(event, value) => props.setShowFilters(value ? 0 : 1)} variant="fullWidth">
                                            <Tab label="Filtri" />
                                            <Tab label="Informazioni" />
                                        </Tabs>
                                    </Box>
                                </>
                            }
                            {props.showFilters || !lg ? props.drawerButtons : props.info}
                        </>
                    </Drawer>
                </Box>
            </Box>
        </>
    );
}