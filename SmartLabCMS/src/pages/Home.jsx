import React, { useState } from "react";
import {
    Box,
    Tabs,
    useTheme
} from "@mui/material";
import { CalendarMonth, Edit, People, Work } from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { useSnackbar } from "notistack";
import AppBarComp from "../components/AppBarComp";
import FooterComp from "../components/FooterComp";
import { LargerThanLg, LargerThanSm } from "../MediaQueries";
import { StyledTab } from "../styles";
import CalendarComp from "../components/CalendarComp";
import RoomsComp from "../components/RoomsComp";
import CoWorkersComp from "../components/CoWorkersComp";
import SmartWorkersComp from "../components/SmartWorkersComp";

export default function Home() {
    const theme = useTheme();
    const [tab, setTab] = useState(0);
    const { enqueueSnackbar } = useSnackbar();
    const { token } = useAuth();
    const lg = LargerThanLg();
    const sm = LargerThanSm();

    const capitalize = str => str.toLowerCase().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

    return (
        <>
            <Box style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
                <AppBarComp />
                <Box style={{ padding: "24px 8%" + (!sm ? "72px" : "") }}>
                    <div>
                        <Box my={sm ? 4 : 1}>
                            <Tabs value={tab} onChange={(event, value) => setTab(value)} variant="fullWidth" sx={{ borderRadius: "4px" }} TabIndicatorProps={{ sx: { backgroundColor: theme.palette.primary.mainLight } }}>
                                {[0, 1, 2, 3].map((_, index) =>
                                    <StyledTab
                                        icon={index === 0 ? <CalendarMonth /> : (index === 1 ? <Edit /> : (index === 2 ? <People /> : <Work />))}
                                        label={sm ? (index === 0 ? "Orari e slot" : (index === 1 ? "Sale" : (index === 2 ? "Co-workers" : "Smart-workers"))) : ""}
                                        value={index} key={index}
                                        sx={{
                                            color: theme.palette.primary.main,
                                            "&.Mui-selected": {
                                                color: theme.palette.primary.mainLight
                                            }
                                        }}
                                    />)}
                            </Tabs>
                        </Box>
                    </div>
                    {
                        tab === 0 ?
                            <CalendarComp capitalize={capitalize} enqueueSnackbar={enqueueSnackbar} lg={lg} sm={sm} theme={theme} token={token} />
                            :
                            (tab === 1 ?
                                <RoomsComp enqueueSnackbar={enqueueSnackbar} sm={sm} theme={theme} token={token} />
                                :
                                (tab === 2 ?
                                    <CoWorkersComp capitalize={capitalize} enqueueSnackbar={enqueueSnackbar} lg={lg} sm={sm} theme={theme} token={token} />
                                    :
                                    <SmartWorkersComp enqueueSnackbar={enqueueSnackbar} lg={lg} sm={sm} theme={theme} token={token} />
                                )
                            )
                    }
                </Box>
                {sm &&
                    <Box style={{ marginTop: "auto" }}>
                        <FooterComp />
                    </Box>
                }
            </Box>
        </>
    );
}