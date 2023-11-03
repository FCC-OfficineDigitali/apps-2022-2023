import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Box, Typography } from "@mui/material";
import { LargerThanSm } from "../MediaQueries";
import AppBarComp from "../components/AppBarComp";
import BottomLeftCalendar from "../components/BottomLeftCalendar";
import DeadlineDialog from "../components/DeadlineDialog";
import TopCalendar from "../components/TopCalendar";
import Footer from "../components/Footer";
import { getUserInfo } from "../services/apiOperatori";
import BottomRightCalendar from "../components/BottomRightCalendar";

export default function Operatore() {
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

    if (!Cookies.get("OperatoriPalestre")) {
        return <Navigate to="/login" />
    }

    if (userInfo !== "") {
        if (userInfo.is_operatore === 1)
            return (
                <Box className="operatorecss" flexDirection="column" display="flex" height="100vh">
                    <DeadlineDialog />
                    <Box ref={appBarRef}>
                        <AppBarComp />
                    </Box>
                    <Box {...(sm ? { overflow: "hidden" } : { flexDirection: "column" })} display="flex" alignItems="stretch" height={"calc(100vh - " + appBarHeight + "px - " + footerHeight + "px)"}>
                        <Box {...(sm && { width: "100%" })} flexDirection="column" display="flex" alignItems="center" justifyContent="space-around" px={sm ? 2 : 0} pt={sm ? 2 : 0} pb={2}>
                            <TopCalendar userInfo={userInfo} />
                            <Box flexDirection={sm ? "row" : "column"} width={sm ? "84%" : "100%"} height={sm ? "50%" : "100%"} display="flex" alignItems="center" justifyContent="space-around">
                                <BottomLeftCalendar userInfo={userInfo} />
                                <BottomRightCalendar userInfo={userInfo} />
                            </Box>
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