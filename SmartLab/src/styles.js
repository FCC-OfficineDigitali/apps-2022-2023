import { Autocomplete, Button, Divider, Fab, MenuItem, Select, styled, Tab, TableCell, TextField } from "@mui/material";

const graphikBold = {
  fontFamily: "Graphik",
  fontWeight: "bold"
};

const graphikForComponents = {
  fontFamily: "Graphik",
  fontSize: 15,
  lineHeight: "24px"
};

const StyledTextButton = styled(Button)(({ theme }) => ({
  "&:hover": {
    background: theme.palette.primary.buttonHover
  },
  ...graphikBold,
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

const StyledFab = styled(Fab)(({ theme }) => ({
  "&:hover": {
    background: theme.palette.primary.mainLight
  },
  ...graphikForComponents,
  color: theme.palette.primary.white,
  background: theme.palette.primary.main
}));

const StyledDivider = styled(Divider)(({ theme, thickness, orientation }) => ({
  ...(thickness !== undefined && (orientation === "vertical" ? { borderRightWidth: thickness } : { borderBottomWidth: thickness })),
  background: theme.palette.primary.functionalBlackCamposampierese,
  opacity: 0.25,
  marginBottom: "16px !important"
}));

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  "& .MuiAutocomplete-inputRoot": {
    ...graphikForComponents,
    color: theme.palette.primary.functionalBlackCamposampierese,
    minHeight: "32px",
    paddingLeft: "13.5px"
  }
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  ...graphikForComponents,
  color: theme.palette.primary.functionalBlackCamposampierese,
  whiteSpace: "normal"
}));

const StyledFilledTextField = styled(TextField)(({ theme, value }) => ({
  "& .MuiInputBase-root": {
    ...graphikForComponents,
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

const StyledOutlinedTextField = styled(TextField)(({ theme, value }) => ({
  "& .MuiInputBase-root": {
    ...graphikForComponents,
    color: theme.palette.primary.functionalBlackCamposampierese,
    backgroundColor: theme.palette.primary.filledTextFieldLight,
    borderRadius: "28px"
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  ...graphikForComponents,
  color: theme.palette.primary.functionalBlackCamposampierese,
  backgroundColor: theme.palette.primary.filledTextFieldLight,
  height: "48px"
}));

const StyledTab = styled(Tab)(_ => ({
  ...graphikBold
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontFamily: "Graphik",
  fontSize: 13.5,
  color: theme.palette.primary.functionalBlackCamposampierese
}));

export { StyledTextButton, StyledOutlinedButton, StyledFab, StyledDivider, StyledAutocomplete, StyledMenuItem, StyledFilledTextField, StyledOutlinedTextField, StyledSelect, StyledTab, StyledTableCell };