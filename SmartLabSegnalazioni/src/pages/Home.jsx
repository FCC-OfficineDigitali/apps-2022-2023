import React, { useEffect, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    ListItem,
    ListItemText,
    Typography,
    useTheme
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAuth } from "../hooks/useAuth";
import ipPortApi from "../ipPortApi";
import Axios from "axios";
import moment from "moment";
import { useSnackbar } from "notistack";
import AppBarComp from "../components/AppBarComp";
import FooterComp from "../components/FooterComp";
import { LargerThanSm } from "../MediaQueries";
import { StyledDivider } from "../styles";
import ReportsDialogBtnComp from "../components/ReportsDialogBtnComp";

export default function Home() {
    const theme = useTheme();
    const [rowsList, setRowsList] = useState([]);
    const [updateToggle, setUpdateToggle] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const { token } = useAuth();
    const sm = LargerThanSm();

    const handleClickToUpdate = _ => setUpdateToggle(!updateToggle);

    useEffect(_ => {
        Axios.get(ipPortApi + "getHubReports/" + token)
            .then(data => {
                if (data.data.message) {
                    enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                    setRowsList([]);
                }
                else
                    setRowsList(data.data);
            })
            .catch(error => { setRowsList([]); console.log(error); });
    }, [updateToggle]);

    return (
        <>
            <Box style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <AppBarComp />
                <Box style={{ padding: "24px 8%" + (!sm ? "72px" : "") }}>
                    <Box {...(sm ? { display: "flex", justifyContent: "right", my: 3 } : { m: 3 })} style={{ ...(!sm && { position: "fixed", bottom: "0", right: "0", zIndex: "1000" }) }}>
                        <ReportsDialogBtnComp updateListFun={handleClickToUpdate} />
                    </Box>
                    {rowsList.length > 0 ?
                        <Box>
                            <Typography variant="h1" pb={2} color={theme.palette.primary.functionalBlackCamposampierese} style={{ fontSize: 26 }}>{sm ? "Le mie segnalazioni degli ultimi 20 giorni" : "Ultimi 20 giorni"}</Typography>
                            {rowsList.map((val, index) =>
                                <Accordion p={1} key={index + "_" + val.report_id} disableGutters={true} sx={{ border: "1px solid" + theme.palette.primary.main + "22" }}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls={"panel-" + index + "_" + val.report_id + "-content"}
                                        id={"panel-" + index + "_" + val.report_id + "-header"}
                                    >
                                        <Box>
                                            <Typography variant="documentTitle">{index + 1} - {val.report_title}</Typography>
                                            <br />
                                            <Typography variant="data">
                                                Segnalato il giorno
                                            </Typography>
                                            <Typography variant="data" style={{ fontWeight: "bold" }}>
                                                {" " + moment(val.report_date_time).format("DD MMMM YYYY") + " "}
                                            </Typography>
                                            <Typography variant="data">
                                                alle {moment(val.report_date_time).format("HH:mm:ss")}
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ py: 0, px: 1 }}>
                                        <ListItem sx={{ padding: 0 }}>
                                            <ListItemText
                                                primary={
                                                    <Box>
                                                        {(_ => [["Descrizione della segnalazione", val.report_description], ["Luogo", val.room_name_updatable]].map(([title, data], key2) =>
                                                            <Box key={key2} p={1}>
                                                                <StyledDivider variant="middle" thickness={1} sx={{ m: 0 }} />
                                                                <Typography variant="title">{title}: </Typography>
                                                                <br />
                                                                <Typography variant="data" style={{ whiteSpace: "pre-line" }}>{data}</Typography>
                                                            </Box>
                                                        )
                                                        )()}
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    </AccordionDetails>
                                </Accordion>
                            )}
                        </Box>
                        :
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <Typography variant="h5" textAlign="center">
                                Nessuna segnalazione presente. Puoi aggiungerne una premendo sull'apposito bottone
                            </Typography>
                        </Box>
                    }
                </Box>
                {sm &&
                    <Box style={{ marginTop: "auto" }}>
                        <FooterComp />
                    </Box>
                }
            </Box>
        </>
    );
}