import React, { useState, useEffect } from "react";
import {
    Box,
    Divider,
    Grid,
    ListItem,
    ListItemText,
    Typography
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import ipPortApi from "../ipPortApi";
import Axios from "axios";
import moment from "moment";
import { useSnackbar } from "notistack";
import AppBarComp from "../components/AppBarComp";
import DialogBtnComp from "../components/DialogBtnComp";
import FooterComp from "../components/FooterComp";
import PaginationComp from "../components/PaginationComp";
import { LargerThanSm } from "../MediaQueries";
import { StyledOutlinedButton } from "../styles";

export default function Admin() {
    const [pageNr, setPageNr] = useState(0);
    const [rowsList, setRowsList] = useState([]);
    const [data, setData] = useState([]);
    const [updateToggle, setUpdateToggle] = useState(false);
    const [isRowsListLoaded, setIsRowsListLoaded] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const { logout, token } = useAuth();
    const sm = LargerThanSm();
    const perPage = 5;


    const handleClickToUpdate = _ => setUpdateToggle(!updateToggle);

    useEffect(_ => {
        Axios.get(ipPortApi + "get/" + token)
            .then(data => {
                if (data.data.message) {
                    enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                    setIsRowsListLoaded(false);
                }
                else {
                    setRowsList(data.data);
                    setIsRowsListLoaded(true);
                }
            })
            .catch(error => console.log(error));
    }, [updateToggle]);

    const deleteRow = id => {
        Axios.put(ipPortApi + "deleteFromId/" + id + "&tkn=" + token)
            .then(response => {
                if (response.data.messageOk) {
                    enqueueSnackbar(response.data.messageOk, { variant: "success" });
                    handleClickToUpdate();
                }
                else
                    enqueueSnackbar("Errore dal server: " + response.data.message, { variant: "error" });
            })
            .catch(error => console.log(error));
    };

    return (
        <>
            <AppBarComp />
            <Box style={{ padding: "24px 8%" }}>
                <Grid container direction={sm ? "row" : "column"} justifyContent={"space-between"} alignItems={"center"}>
                    <Grid item sx={{ marginBottom: sm ? "0" : "10%" }}>
                        <StyledOutlinedButton onClick={_ => logout()} sx={{ fontFamily: "Graphik", fontSize: 15 }}>
                            Logout
                        </StyledOutlinedButton>
                    </Grid>
                    <Grid item>
                        {isRowsListLoaded && <DialogBtnComp dialogUse="insert" updateListFun={handleClickToUpdate} />}
                    </Grid>
                </Grid>
                {rowsList.length > 0 &&
                    <PaginationComp datas={rowsList} setData={setData} perPage={perPage} setPageNr={setPageNr}>
                        {data.map((val, key) =>
                            <React.Fragment
                                key={key}>
                                <ListItem>
                                    <ListItemText
                                        primary={
                                            <>
                                                <Grid container direction={sm ? "row" : "column"} justifyContent="space-between">
                                                    {[
                                                        ["Nome", val.nome],
                                                        ["Eta", val.eta],
                                                        ["Data inserimento viaggiatore", val.data_inserimento_viaggiatore && moment(val.data_inserimento_viaggiatore).format("DD-MM-YYYY")],
                                                        ["Data inserimento operatore", moment(val.data_inserimento_operatore).format(moment(val.data_inserimento_operatore).format("YYYY-MM-DD").localeCompare(new Date().toISOString().slice(0, 10)) == 0 ? "DD-MM-YYYY HH:mm:ss" : "DD-MM-YYYY")],
                                                        ["In viaggio da", val.nome_comune_in_viaggio_da ? val.nome_comune_in_viaggio_da + ", " + val.provincia_comune_in_viaggio_da + ", " + val.nome_nazione_in_viaggio_da : val.nome_nazione_in_viaggio_da],
                                                        ["Destinazione", val.nome_comune_destinazione ? val.nome_comune_destinazione + ", " + val.provincia_comune_destinazione + ", " + val.nome_nazione_destinazione : val.nome_nazione_destinazione],
                                                        ["Direttrice", val.direttrice],
                                                        ["Motivo", val.motivo],
                                                        ["Pensiero", val.pensiero]
                                                    ].map(([title, data], key2) =>
                                                        <Grid item xs={4} key={key2} p={1}>
                                                            <Typography variant="title">{title}: </Typography>
                                                            <Typography variant="data">{data}</Typography>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                                <Grid
                                                    container
                                                    marginTop={2}
                                                    spacing={2}
                                                    component="span">
                                                    <Grid item component="span">
                                                        <StyledOutlinedButton
                                                            onClick={_ => {
                                                                if (window.confirm("Vuoi davvero eliminare la riga?")) {
                                                                    deleteRow(val.id_passaggio);
                                                                }
                                                                else {
                                                                    enqueueSnackbar("Eliminazione della riga annullata", { variant: "warning" });
                                                                }
                                                            }}>
                                                            Elimina
                                                        </StyledOutlinedButton>
                                                    </Grid>
                                                    <Grid item component="span">
                                                        <DialogBtnComp dialogUse="update" updateListFun={handleClickToUpdate} id={val.id_passaggio} />
                                                    </Grid>
                                                </Grid>
                                            </>
                                        }
                                    />
                                </ListItem>
                                <Divider variant="middle" />
                            </React.Fragment>
                        )}
                    </PaginationComp>
                }
                {sm &&
                    <Box pt={5}>
                        <FooterComp />
                    </Box>
                }
            </Box>
        </>
    );
}