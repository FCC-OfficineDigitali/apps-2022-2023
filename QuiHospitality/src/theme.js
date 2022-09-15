import { createTheme } from "@mui/material/styles";

const bluCamposampierese = "#00009C";
const functionalBlackCamposampierese = "#151515";
const black = "#000000";
const white = "#FFFFFF";

export default createTheme({
    palette: {
        primary: {
            main: bluCamposampierese,
            white: white
        },
        secondary: {
            main: functionalBlackCamposampierese
        },
        white: {
            main: white
        },
        black: {
            main: black
        }
    },
    typography: {
        h1: {
            fontFamily: "Atlas Grotesk",
            fontWeight: "bold",
            fontSize: 36,
            lineHeight: "43.2px",
            color: bluCamposampierese
        },
        subheader: {
            fontFamily: "Graphik",
            fontWeight: "bold",
            fontSize: 16.5,
            lineHeight: "18px",
            color: bluCamposampierese
        },
        h3: {
            fontFamily: "Atlas Grotesk",
            fontWeight: "bold",
            fontSize: 17.5,
            lineHeight: "21px",
            color: functionalBlackCamposampierese,
            marginTop: "40px",
            marginBottom: "15px"
        },
        sottocategoria: {
            fontFamily: "Graphik",
            fontSize: 14,
            lineHeight: "15.4px",
            color: bluCamposampierese
        },
        soloCon: {
            fontFamily: "Graphik",
            fontWeight: "bold",
            fontSize: 12,
            lineHeight: "22px",
            color: bluCamposampierese
        },
        soloConClicked: {
            fontFamily: "Graphik",
            fontWeight: "bold",
            fontSize: 12,
            lineHeight: "22px",
            color: white
        },
        per: {
            fontFamily: "Graphik",
            fontSize: 13,
            lineHeight: "18px",
            color: bluCamposampierese
        },
        download: {
            fontFamily: "Graphik",
            fontWeight: "bold",
            fontSize: 14,
            lineHeight: "22px",
            color: white
        },
        h2: {
            fontFamily: "Atlas Grotesk",
            fontWeight: "bold",
            fontSize: 20,
            lineHeight: "24px",
            color: black
        },
        paragraph1: {
            fontFamily: "Graphik",
            fontSize: 16.5,
            lineHeight: "24px",
            color: black
        },
        denominazione: {
            fontFamily: "Graphik",
            fontWeight: "bold",
            fontSize: 18,
            lineHeight: "29px",
            color: bluCamposampierese
        },
        subheading: {
            fontFamily: "Graphik",
            fontWeight: "bold",
            fontSize: 16.5,
            lineHeight: "22px",
            color: bluCamposampierese
        },
        paragraph2: {
            fontFamily: "Graphik",
            fontSize: 13.5,
            lineHeight: "15px",
            color: functionalBlackCamposampierese
        },
        infoText: {
            fontFamily: "Graphik",
            fontSize: 14,
            lineHeight: "16px",
            color: functionalBlackCamposampierese
        }
    }
});