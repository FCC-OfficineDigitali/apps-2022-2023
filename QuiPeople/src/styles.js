import { Autocomplete, Box, styled } from "@mui/material";

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  maxWidth: 300,
  "& .MuiChip-root": {
    backgroundColor: theme.palette.white.main,
    border: "1px solid #AAAAAA"
  },
  "& .MuiChip-label": {
    color: theme.palette.primary.main
  },
  "& .MuiChip-deleteIcon": {
    color: theme.palette.primary.main + " !important"
  },
  "& .MuiAutocomplete-popupIndicator": {
    color: theme.palette.primary.main
  },
  "& .MuiAutocomplete-clearIndicator": {
    color: theme.palette.black.main
  }
}));

const StyledBoxForDrawer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main
}));

export { StyledAutocomplete, StyledBoxForDrawer };