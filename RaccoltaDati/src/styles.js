import { Button, TextField, styled } from "@mui/material";

const StyledFilledTextField = styled(TextField)(({ theme, value }) => ({
  "& .MuiInputBase-root": {
    fontFamily: "Graphik",
    fontSize: "15px",
    lineHeight: "24px",
    color: theme.palette.primary.functionalBlackCamposampierese,
    background: value ? theme.palette.primary.filledTextFieldDark : theme.palette.primary.filledTextFieldLight + " !important",
    "&:hover": {
      background: theme.palette.primary.filledTextFieldDark + " !important"
    },
  },
  "& .Mui-focused": {
    background: theme.palette.primary.filledTextFieldDark + " !important"
  }
}));

const StyledTextButton = styled(Button)(({ theme }) => ({
  "&:hover": {
    background: theme.palette.primary.buttonHover
  },
  fontFamily: "Graphik",
  fontWeight: "bold",
  fontSize: 14,
  lineHeight: "24px",
  color: theme.palette.primary.main,
  borderRadius: "4px"
}));

const StyledOutlinedButton = styled(Button)(({ theme }) => ({
  "&:hover": {
    background: theme.palette.primary.buttonHover
  },
  fontFamily: "Atlas Grotesk",
  fontWeight: "bold",
  fontSize: 12,
  lineHeight: "22px",
  color: theme.palette.primary.main,
  border: "1px solid " + theme.palette.primary.main,
  boxShadow: "0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px rgba(0, 0, 0, 0.14), 0px 1px 5px rgba(0, 0, 0, 0.12)",
  borderRadius: "4px"
}));

export { StyledFilledTextField, StyledTextButton, StyledOutlinedButton };