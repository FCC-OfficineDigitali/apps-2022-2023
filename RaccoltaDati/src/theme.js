import { createTheme } from "@mui/material/styles";

const bluCamposampierese = "#00009C";
const white = "#FFFFFF";
const black = "#000000";
const functionalBlackCamposampierese = "#151515";
const buttonHover = "#F6FAFD";
const filledTextFieldDark = "#EDEDFF";
const filledTextFieldLight = "#F9F9FF";

export default createTheme({
    palette: {
        primary: {
            main: bluCamposampierese,
            white: white,
            black: black,
            functionalBlackCamposampierese: functionalBlackCamposampierese,
            buttonHover: buttonHover,
            filledTextFieldDark: filledTextFieldDark,
            filledTextFieldLight: filledTextFieldLight
        }
    },
    typography: {
        h1: {
            fontFamily: "Atlas Grotesk",
            fontWeight: "bold",
            fontSize: 36,
            lineHeight: "38px",
            color: bluCamposampierese
        },
        subheader: {
            fontFamily: "Graphik",
            fontWeight: "bold",
            fontSize: 16.5,
            lineHeight: "18px",
            color: bluCamposampierese
        },
        h4: {
            fontFamily: "Atlas Grotesk",
            fontWeight: "bold",
            fontSize: 36,
            lineHeight: "43px",
            color: black
        },
        h5: {
            fontFamily: "Atlas Grotesk",
            fontSize: 16,
            color: black
        },
        title: {
            fontFamily: "Atlas Grotesk",
            fontWeight: "bold",
            fontSize: 17.5,
            lineHeight: "21px",
            color: functionalBlackCamposampierese
        },
        data: {
            fontFamily: "Graphik",
            fontWeight: 400,
            fontSize: 13.5,
            lineHeight: "15px",
            color: black
        },
        updateFields: {
            fontFamily: "Atlas Grotesk",
            fontWeight: "bold",
            fontSize: 17.5,
            lineHeight: "21px",
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