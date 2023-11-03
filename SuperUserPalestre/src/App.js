import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Button, ThemeProvider } from "@mui/material";
import { SnackbarProvider, closeSnackbar } from "notistack";
import "moment/locale/it";
import Error from "./pages/Error";
import Login from "./pages/Login";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Cmssuperuser from "./pages/Cmssuperuser";
import theme from "./theme";

export default function App() {
  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3} action={snackbarId => <Button onClick={_ => closeSnackbar(snackbarId)} style={{ color: "white" }}>Chiudi</Button>}>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/superuser" element={<Cmssuperuser />} />
              <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
              <Route path="/" element={<Login />} />
              <Route path="*" element={<Error />} />
            </Routes>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </React.Fragment>
  );
}
