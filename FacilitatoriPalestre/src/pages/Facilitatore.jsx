import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Box, Divider, Typography } from "@mui/material";
import { LargerThanSm } from "../MediaQueries";
import AgendaDx from "../components/AgendaDx";
import AppBarComp from "../components/AppBarComp";
import BottomCalendar from "../components/BottomCalendar";
import DeadlineDialog from "../components/DeadlineDialog";
import TopCalendar from "../components/TopCalendar";
import Footer from "../components/Footer";
import { getUserInfo } from "../services/apiFacilitatori";

export default function Facilitatore() {
    const sm = LargerThanSm();

    const [appBarHeight, setAppBarHeight] = useState(0);
    const [footerHeight, setFooterHeight] = useState(0);

    const appBarRef = useRef();
    const footerRef = useRef();

    const [userInfo, setUserInfo] = useState("");

    useEffect(_ => {
        if (appBarRef.current)
            setAppBarHeight(appBarRef.current.offsetHeight);
        else
            setAppBarHeight(0);

        if (footerRef.current)
            setFooterHeight(footerRef.current.offsetHeight);
        else
            setFooterHeight(0);
    }, [sm, appBarRef.current, footerRef.current]);

    useEffect(_ => {
        getUserInfo(setUserInfo);
    }, []);

    if (!Cookies.get("FacilitatoriPalestre")) {
        return <Navigate to="/login" />
    }

    if (userInfo !== "") {
        if (userInfo.is_operatore === 0)
            return (
                <Box className="facilitatorecss" flexDirection="column" display="flex" height="100vh">
                    <DeadlineDialog />
                    <Box ref={appBarRef}>
                        <AppBarComp />
                    </Box>
                    <Box {...(sm ? { overflow: "hidden" } : { flexDirection: "column" })} display="flex" alignItems="stretch" height={"calc(100vh - " + appBarHeight + "px - " + footerHeight + "px)"}>
                        <Box {...(sm && { width: "80%" })} flexDirection="column" display="flex" alignItems="center" justifyContent="space-around" px={sm ? 2 : 0} pt={sm ? 2 : 0} pb={2}>
                            <TopCalendar userInfo={userInfo} />
                            <BottomCalendar userInfo={userInfo} />
                        </Box>
                        <Divider orientation={sm ? "vertical" : "horizontal"} />
                        <Box {...(sm && { width: "20%", overflow: "auto" })} p={2}>
                            <AgendaDx userInfo={userInfo} />
                        </Box>
                    </Box>
                    {sm &&
                        <Box ref={footerRef} marginTop="auto">
                            <Footer />
                        </Box>
                    }
                </Box>
            );
        else
            return (
                <Navigate to="/login" />
            );
    }
    else
        return (
            <Typography variant="h4">Caricamento...</Typography>
        );
}