import React from "react";
import {
  HashRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { CssBaseline } from "@mui/material";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import Sign from "./pages/Sign";
import { CookiesBannerComp } from "./components/CookieComp";
import NotFoundComp from "./components/NotFoundComp";
import Admin from "./pages/Admin";
import ProtectedLayout from "./ProtectedLayout";
import InformativaDati from "./pages/InformativaDati";
import CookiesPolicy from "./pages/CookiesPolicy";

export default function App() {
  return (
    <React.Fragment>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <Router>
            <CookiesBannerComp />
            <AuthProvider>
              <Routes>
                <Route element={<ProtectedLayout lockWhenLogged={"On"} />}>
                  <Route path="/login" element={<Sign />} />
                </Route>
                <Route element={<ProtectedLayout lockWhenLogged={"Off"} />}>
                  <Route path="/" element={<Admin />} exact />
                </Route>
                <Route path="/informativaDati" element={<InformativaDati />} />
                <Route path="/cookiesPolicy" element={<CookiesPolicy />} />
                <Route path="*" element={<NotFoundComp />} />
              </Routes>
            </AuthProvider>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </React.Fragment>
  )
}