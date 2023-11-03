import React, { useEffect, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Checkbox,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    ListItem,
    ListItemText,
    Tabs,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../hooks/useAuth";
import ipPortApi from "../ipPortApi";
import Axios from "axios";
import moment from "moment";
import { useSnackbar } from "notistack";
import AppBarComp from "../components/AppBarComp";
import FooterComp from "../components/FooterComp";
import PaginationComp from "../components/PaginationComp";
import { LargerThanSm } from "../MediaQueries";
import { StyledAutocomplete, StyledDivider, StyledMenuItem, StyledOutlinedTextField, StyledSelect, StyledTab } from "../styles";
import ReportsDialogBtnComp from "../components/ReportsDialogBtnComp";
import WelcomeDialogComp from "../components/WelcomeDialogComp";

export default function Home() {
    const theme = useTheme();
    const sortingOrdersArray = ["Data chiusura segnalazione (DESC)", "Data chiusura segnalazione (ASC)", "Titolo (DESC)", "Titolo (ASC)"];
    const [sortingOrder, setSortingOrder] = useState(sortingOrdersArray[0]);
    const [searchContent, setSearchContent] = useState("");
    const [months, setMonths] = useState([]);
    const [category, setCategory] = useState(1);
    const [pageNr, setPageNr] = useState(0);
    const [rowsList, setRowsList] = useState([]);
    const [rowsListFull, setRowsListFull] = useState([]);
    const [data, setData] = useState([]);
    const [updateToggle, setUpdateToggle] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const { token } = useAuth();
    const sm = LargerThanSm();
    const perPage = 5;

    const capitalize = str => str.toLowerCase().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

    const handleClickToUpdate = _ => setUpdateToggle(!updateToggle);

    const intersect = arrays => arrays.reduce((a, b) => a.filter(c => b.includes(c)));

    const filtersManagement = rowsListCopy => {
        var rows_filter_search, rows_filter_months, rowsIntersection;

        rows_filter_search = searchContent.length > 0 ? rowsListCopy.filter(row => (row.report_title && row.report_title.toLowerCase().includes(searchContent.toLowerCase())) || (row.report_description && row.report_description.toLowerCase().includes(searchContent.toLowerCase())) || (row.resolution_description && row.resolution_description.toLowerCase().includes(searchContent.toLowerCase()))) : rowsListCopy;
        rows_filter_months = months.length > 0 ? rowsListCopy.filter(row => months.some(m => moment(row.resolution_flag_date_time).format("MMMM YYYY") ? moment(row.resolution_flag_date_time).format("MMMM YYYY").localeCompare(m) === 0 : false)) : rowsListCopy;

        rowsIntersection = intersect([rows_filter_search, rows_filter_months]);
        setRowsList(rowsIntersection);
    };

    useEffect(_ => handleClickToUpdate(), [searchContent, months]);


    useEffect(_ => {
        if (category !== null) {
            Axios.get(ipPortApi + "getReports/" + category + "S&tkn=" + token)
                .then(data => {
                    if (data.data.message) {
                        enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                        setRowsList([]);
                        setRowsListFull([]);
                    }
                    else {
                        if (data.data.length > 0) {
                            var rowsListCopy = data.data;
                            if (category === 0) {
                                if (sortingOrder.startsWith("Data"))
                                    rowsListCopy.sort((a, b) => a.resolution_flag_date_time.localeCompare(b.resolution_flag_date_time) * (sortingOrder.endsWith("(DESC)") ? -1 : 1));
                                else
                                    rowsListCopy.sort((a, b) => a.report_title.localeCompare(b.report_title) * (sortingOrder.endsWith("(DESC)") ? -1 : 1));
                            }
                            filtersManagement(rowsListCopy);
                            setRowsListFull(rowsListCopy);
                        }
                        else {
                            setRowsList([]);
                            setRowsListFull([]);
                        }
                    }
                })
                .catch(error => { setRowsList([]); setRowsListFull([]); console.log(error); });
        };
    }, [updateToggle, category]);

    useEffect(_ => { setSortingOrder(sortingOrdersArray[0]); setSearchContent(""); setMonths([]); }, [category]);

    return (
        <>
            <Box style={{ minHeight: "101vh", display: "flex", flexDirection: "column" }}>
                <WelcomeDialogComp />
                <AppBarComp />
                <Box style={{ padding: "24px 8%" }}>
                    <Box my={sm ? 4 : 1}>
                        <Tabs value={category} onChange={(event, value) => setCategory(value)} variant="fullWidth" sx={{ borderRadius: "4px" }} TabIndicatorProps={{ sx: { backgroundColor: category === 0 ? theme.palette.primary.selectedGreen : theme.palette.primary.selectedOrange } }}>
                            {[1, 0].map((element, index) =>
                                <StyledTab label={element === 1 ? "Le mie segnalazioni aperte" : "Segnalazioni chiuse"} value={element} key={index}
                                    sx={{
                                        color: index === 0 ? theme.palette.primary.orange : theme.palette.primary.green,
                                        "&.Mui-selected": {
                                            color: index === 0 ? theme.palette.primary.selectedOrange : theme.palette.primary.selectedGreen
                                        }
                                    }}
                                />)}
                        </Tabs>
                    </Box>
                    <Box my={3}>
                        {
                            category === 0 ?
                                (
                                    rowsListFull.length > 0 &&
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                sm ? "repeat(3, minmax(0, 1fr))" : "repeat(1, 100%)",
                                            gap: 3,
                                            gridTemplateRows: "auto",
                                            gridTemplateAreas:
                                                sm ?
                                                    `"sort search month"`
                                                    :
                                                    `"sort"
                                    "search"
                                    "month"`,
                                            alignItems: "center"
                                        }}
                                    >
                                        <Box gridArea="sort">
                                            <FormControl fullWidth>
                                                <InputLabel id="Sorting-order" sx={{ color: theme.palette.primary.main }}>Ordina per</InputLabel>
                                                <StyledSelect
                                                    variant="outlined"
                                                    labelId="Sorting-order"
                                                    label="Sorting-order"
                                                    fullWidth
                                                    required
                                                    value={sortingOrder}
                                                    onChange={(e) => {
                                                        setSortingOrder(e.target.value);
                                                        handleClickToUpdate();
                                                    }}
                                                >
                                                    {sortingOrdersArray.map((element, index) =>
                                                        <StyledMenuItem value={element} key={index}>
                                                            {element}
                                                        </StyledMenuItem>
                                                    )}
                                                </StyledSelect>
                                            </FormControl>
                                        </Box>
                                        <Box gridArea="search">
                                            <StyledOutlinedTextField
                                                variant="outlined"
                                                placeholder="Cerca..."
                                                type="text"
                                                fullWidth
                                                value={searchContent}
                                                onChange={(e) => setSearchContent(e.target.value)}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SearchIcon color="primary" />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={_ => setSearchContent("")} sx={{ visibility: searchContent.length > 0 ? "visible" : "hidden" }}>
                                                                <ClearIcon />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                                sx={{
                                                    "& .MuiInputBase-root": {
                                                        height: 64
                                                    }
                                                }}
                                            />
                                        </Box>
                                        <Box gridArea="month">
                                            <StyledAutocomplete
                                                id="Mese"
                                                fullWidth
                                                multiple
                                                disableCloseOnSelect
                                                value={months}
                                                renderTags={selected => selected.sort().map(e => capitalize(e)).join(", ")}
                                                onChange={(event, value, reason) => {
                                                    setMonths(typeof value === "string" ? value.split(",") : value);
                                                }}
                                                options={[...new Set(rowsListFull.map(e => e.resolution_flag_date_time).sort().reverse().map(e => moment(e).format("MMMM YYYY")))]}
                                                renderOption={
                                                    (_ => {
                                                        var monthsCopy = months;
                                                        return ((props, option) => (
                                                            <StyledMenuItem {...props}>
                                                                <Checkbox checked={monthsCopy.includes(option)} />
                                                                {capitalize(option)}
                                                            </StyledMenuItem>
                                                        ))
                                                    })()
                                                }
                                                renderInput={params => (
                                                    <TextField {...params} style={{ backgroundColor: theme.palette.primary.filledTextFieldLight }} variant="outlined" label="Seleziona mese di risoluzione" />
                                                )}
                                            />
                                        </Box>
                                    </Box>
                                )
                                :
                                <Box
                                    display="flex"
                                    justifyContent={sm ? "right" : "center"}>
                                    <ReportsDialogBtnComp updateListFun={handleClickToUpdate} />
                                </Box>
                        }
                    </Box>
                    {rowsList.length > 0 ?
                        <PaginationComp datas={rowsList} setData={setData} perPage={perPage} setPageNr={setPageNr}>
                            {data.map((val, index) =>
                                <Accordion p={1} key={category + "_" + pageNr + "_" + index + "_" + val.report_id} disableGutters={true} sx={{ border: "1px solid" + theme.palette.primary.main + "22" }}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls={"panel-" + category + "_" + pageNr + "_" + index + "_" + val.report_id + "-content"}
                                        id={"panel-" + category + "_" + pageNr + "_" + index + "_" + val.report_id + "-header"}
                                    >
                                        <Box>
                                            <Typography variant="documentTitle">{(index + 1) + (pageNr - 1) * perPage} - {val.report_title}</Typography>
                                            <br />
                                            <Typography variant="data">Segnalato
                                            </Typography>
                                            {
                                                val.lat_lon &&
                                                <Typography variant="data"> in posizione{" "}
                                                    <a title={"Apri [" + val.lat_lon.x + ", " + val.lat_lon.y + "] in Google Maps"} href={"//maps.google.com/?q=" + val.lat_lon.x + "," + val.lat_lon.y} target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.main }}>{"[" + val.lat_lon.x + ", " + val.lat_lon.y + "]"}</a>
                                                </Typography>
                                            }
                                            <Typography variant="data">
                                                {" "}il giorno
                                            </Typography>
                                            <Typography variant="data" style={{ fontWeight: "bold" }}>
                                                {" " + moment(val.report_date_time).format("DD MMMM YYYY") + " "}
                                            </Typography>
                                            <Typography variant="data">
                                                alle {moment(val.report_date_time).format("HH:mm:ss")}
                                                {val.is_resolved ? (" e segnato come risolto il giorno " + moment(val.resolution_flag_date_time).format("DD MMMM YYYY") + " alle " + moment(val.resolution_flag_date_time).format("HH:mm:ss")) : ""}
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ py: 0, px: 1 }}>
                                        <ListItem sx={{ padding: 0 }}>
                                            <ListItemText
                                                primary={
                                                    <Box>
                                                        {(_ => {
                                                            var otherContent = val.is_resolved ?
                                                                [
                                                                    ["Descrizione della segnalazione", val.report_description],
                                                                    ["Descrizione del luogo", val.report_location_description],
                                                                    ["Descrizione della soluzione (completata il giorno " + moment(val.resolution_fix_date).format("DD MMMM YYYY") + ")", val.resolution_description]
                                                                ]
                                                                :
                                                                [
                                                                    ["Descrizione della segnalazione", val.report_description],
                                                                    ["Descrizione del luogo", val.report_location_description]
                                                                ];
                                                            return otherContent.some(([title, data]) => data) ?
                                                                (otherContent.map(([title, data], key2) =>
                                                                    data &&
                                                                    <Box key={key2} p={1}>
                                                                        <StyledDivider variant="middle" thickness={1} sx={{ m: 0 }} />
                                                                        <Typography variant="title">{title}: </Typography>
                                                                        <br />
                                                                        <Typography variant="data" style={{ whiteSpace: "pre-line" }}>{data}</Typography>
                                                                    </Box>
                                                                ))
                                                                :
                                                                (
                                                                    <Box p={1}>
                                                                        <Typography variant="data">Non sono disponibili altri dati per questa segnalazione</Typography>
                                                                    </Box>
                                                                );
                                                        })()}
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    </AccordionDetails>
                                </Accordion>
                            )}
                        </PaginationComp>
                        :
                        <Box display="flex" justifyContent="center" alignItems="center" height={(60 * perPage) + "px"}>
                            <Typography variant="h5" textAlign="center">
                                Nessuna segnalazione presente. {category === 1 && "Puoi aggiungerne una premendo sull'apposito bottone"}
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