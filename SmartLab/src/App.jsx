import React from "react";
import {
  HashRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import "moment/locale/it";
import { SnackbarProvider, closeSnackbar } from "notistack";
import { CssBaseline } from "@mui/material";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import Sign from "./pages/Sign";
import NotFoundComp from "./components/NotFoundComp";
import Home from "./pages/Home";
import ProtectedLayout from "./ProtectedLayout";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { StyledTextButton } from "./styles";

export default function App() {
  return (
    <React.Fragment>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3} action={snackbarId => <StyledTextButton onClick={_ => closeSnackbar(snackbarId)} style={{ color: theme.palette.primary.white, background: "unset" }}>Chiudi</StyledTextButton>}>
          <Router>
            <AuthProvider>
              <Routes>
                <Route element={<ProtectedLayout lockWhenLogged="On" />}>
                  <Route path="/login" element={<Sign />} />
                </Route>
                <Route element={<ProtectedLayout lockWhenLogged="Off" />}>
                  <Route path="/" element={<Home />} exact />
                </Route>
                <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
                <Route path="*" element={<NotFoundComp />} />
              </Routes>
            </AuthProvider>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </React.Fragment>
  )
}