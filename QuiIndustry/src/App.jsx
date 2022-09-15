import React from "react";
import {
  HashRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import MapPageComp from "./components/MapPageComp";
import NotFoundComp from "./components/NotFoundComp";
import InformativaDati from "./InformativaDati";

export default function App() {
  return (
    <React.Fragment>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <Router>
            <Routes>
              <Route path="/" element={<MapPageComp />} exact />
              <Route path="/informativaDati" element={<InformativaDati />} />
              <Route path="*" element={<NotFoundComp />} />
            </Routes>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </React.Fragment>
  )
}