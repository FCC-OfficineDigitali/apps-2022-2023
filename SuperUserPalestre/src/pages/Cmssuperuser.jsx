import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Box, Typography } from "@mui/material";
import { LargerThanSm } from "../MediaQueries";
import AppBarComp from "../components/AppBarComp";
import Footer from "../components/Footer";
import TabsComp from "../components/TabsComp";
import { getUserInfo } from "../services/apiSuperUsers";

export default function Cmssuperuser() {
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

    if (!Cookies.get("SuperUserPalestre")) {
        return <Navigate to="/login" />
    }

    if (userInfo !== "") {
        if (userInfo.is_operatore === null)
            return (
                <Box className="cmssuperusercss" flexDirection="column" display="flex" height="100vh">
                    <Box ref={appBarRef}>
                        <AppBarComp />
                    </Box>
                    <Box overflow="auto" height={"calc(100vh - " + appBarHeight + "px - " + footerHeight + "px)"}>
                        <TabsComp />
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