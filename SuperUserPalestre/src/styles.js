import { Button, styled } from "@mui/material";

const StyledOutlinedButton = styled(Button)(({ theme }) => ({
    "&:hover": {
        background: theme.palette.primary.buttonHover
    },
    border: "1px solid " + theme.palette.primary.main,
    boxShadow: "0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px rgba(0, 0, 0, 0.14), 0px 1px 5px rgba(0, 0, 0, 0.12)",
    borderRadius: "4px"
}));

export { StyledOutlinedButton };