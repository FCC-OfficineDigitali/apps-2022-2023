import { createTheme } from "@mui/material/styles";

const bluCamposampierese = "#00009C";
const bluCamposampiereseLight = "#24249C";
const bluCamposampiereseLighter = "#DCDCEE";
const black = "#000000";
const functionalBlackCamposampierese = "#151515";
const grey = "#E0E0E0";
const disabledGrey = "#00000040"
const buttonHover = "#F6FAFD";
const filledTextFieldDark = "#EDEDFF";
const filledTextFieldLight = "#F9F9FF";
const filledAccordionLight = "#FDFDFF";
const white = "#FFFFFF";
const green = "#5DC937";
const selectedGreen = "#41C014";
const orange = "#EF7A26";
const selectedOrange = "#EC6300";
const red = "#C9375D";
const yellow = "#FFFF00"; 

const atlasBold = {
    fontFamily: "Atlas Grotesk",
    fontWeight: "bold"
};

const darkAtlasBold = {
    ...atlasBold,
    color: functionalBlackCamposampierese,
    overflowWrap: "anywhere"
};

export default createTheme({
    palette: {
        primary: {
            main: bluCamposampierese,
            mainLight: bluCamposampiereseLight,
            mainLighter: bluCamposampiereseLighter,
            functionalBlackCamposampierese: functionalBlackCamposampierese,
            grey: grey,
            disabledGrey: disabledGrey,
            buttonHover: buttonHover,
            filledTextFieldDark: filledTextFieldDark,
            filledTextFieldLight: filledTextFieldLight,
            filledAccordionLight: filledAccordionLight,
            white: white,
            green: green,
            selectedGreen: selectedGreen,
            orange: orange,
            selectedOrange: selectedOrange,
            red: red,
            yellow: yellow
        }
    },
    typography: {
        h1: {
            ...atlasBold,
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
            ...atlasBold,
            fontSize: 36,
            lineHeight: "43px",
            color: black
        },
        h5: {
            fontFamily: "Atlas Grotesk",
            fontSize: 16,
            color: black
        },
        documentTitle: {
            ...darkAtlasBold,
            fontSize: 20,
            lineHeight: "24px"
        },
        title: {
            ...darkAtlasBold,
            fontSize: 17.5,
            lineHeight: "35px"
        },
        data: {
            fontFamily: "Graphik",
            fontSize: 13.5,
            lineHeight: "27px",
            color: functionalBlackCamposampierese,
            overflowWrap: "anywhere"
        },
        dialogTitle: {
            ...atlasBold,
            fontSize: 17.5,
            lineHeight: "21px",
            color: functionalBlackCamposampierese
        },
        dialogSubtitle: {
            fontFamily: "Atlas Grotesk",
            fontSize: 14,
            lineHeight: "16px",
            color: functionalBlackCamposampierese
        },
        infoText: {
            fontFamily: "Graphik",
            fontSize: 14,
            lineHeight: "16px",
            color: functionalBlackCamposampierese
        },
        calendarCompSubtitle: {
            ...atlasBold,
            fontSize: 20,
            lineHeight: "24px",
            color: functionalBlackCamposampierese
        }
    }
});