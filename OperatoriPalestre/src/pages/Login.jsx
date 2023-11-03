import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Box } from "@mui/material";
import AppBarComp from "../components/AppBarComp";
import LoginComp from "../components/LoginComp";

export default function Login() {
    if (Cookies.get("OperatoriPalestre"))
        return (
            <Navigate to="/operatore" />
        );
    else
        return (
            <Box className="logincss">
                <AppBarComp />
                <LoginComp />
            </Box>
        );
}