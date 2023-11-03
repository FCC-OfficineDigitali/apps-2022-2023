import React from "react";
import {
  HashRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import Sign from "./pages/Sign";
import NotFoundComp from "./components/NotFoundComp";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Rules from "./pages/Rules";

export default function App() {
  return (
    <React.Fragment>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            <Route path="/" element={<Sign />} exact />
            <Route path="/rules" element={<Rules />} />
            <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFoundComp />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </React.Fragment>
  )
}