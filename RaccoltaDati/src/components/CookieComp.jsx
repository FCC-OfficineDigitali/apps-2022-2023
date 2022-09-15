import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Link } from "@mui/material";
import CookieConsent from "react-cookie-consent";
import Cookies from "js-cookie";

const CookiesBannerComp = () => {
    const history = useNavigate();
    
    const buttonsStyle = {
        "&:hover": {
            background: "#F6FAFD"
        },
        fontFamily: "Graphik",
        fontWeight: "bold",
        fontSize: 14,
        lineHeight: "24px",
        color: "#00009C",
        borderRadius: "4px",
        backgroundColor: "#FFFFFF"
    };

    return (
        <>
            <CookieConsent
                cookieName="RaccoltaDatiCookieConsent"
                location="bottom"
                enableDeclineButton
                buttonText="Accetto"
                declineButtonText="Rifiuto"
                ButtonComponent={Button}
                declineButtonStyle={buttonsStyle}
                style={{ background: "#00009C", zIndex: "5000", fontFamily: "Graphik" }}
                buttonStyle={buttonsStyle}
                onDecline={_ => {
                    localStorage.clear();
                    Cookies.remove("RaccoltaDatiCookieConsent");
                }}
            >
                Questo sito utilizza cookie o tecnologie simili.{" "}
                <Link color={"#F6FAFD"} onClick={_ => history("/cookiesPolicy")}>Leggi di più</Link>
            </CookieConsent>
        </>
    );
};

const IsUsingCookies = _ => Cookies.get("RaccoltaDatiCookieConsent") === "true";

export { CookiesBannerComp, IsUsingCookies };