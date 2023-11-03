import React, { useEffect, useState } from "react";
import {
    Box,
    Dialog,
    DialogContent,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    Table,
    TableBody,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import { Clear, Close, Search } from "@mui/icons-material";
import ipPortApi from "../ipPortApi";
import Axios from "axios";
import { StyledMenuItem, StyledOutlinedButton, StyledOutlinedTextField, StyledSelect, StyledTableCell } from "../styles";

export default function ConfirmedReservationsComp(props) {
    const sortingOrdersArray = ["Data (ASC)", "Data (DISC)", "Sala (ASC)", "Sala (DISC)", "Prenotatore (ASC)", "Prenotatore (DISC)", "Argomento (ASC)", "Argomento (DISC)"];
    const [sortingOrder, setSortingOrder] = useState(sortingOrdersArray[0]);
    const [rowsList, setRowsList] = useState([]);
    const [showingRowsList, setShowingRowsList] = useState([]);
    const [searchContent, setSearchContent] = useState("");
    const [otherInfo, setOtherInfo] = useState(null);
    const [updateToggle, setUpdateToggle] = useState(false);
    const [open, setOpen] = useState(false);

    const handleClickToUpdate = _ => setUpdateToggle(!updateToggle);

    const handleClose = _ => {
        setOpen(false);
        setOtherInfo(null);
    };

    const otherInfoButton = val => {

        return (
            <StyledOutlinedButton onClick={_ => { setOtherInfo(val); setOpen(true); }} sx={{ textTransform: "none" }}>
                i
            </StyledOutlinedButton>
        );
    }

    const trimWithCompleteWords = str => {
        const maxLength = 32;

        if (str.length <= maxLength)
            return str;

        var truncatedStr = str.substr(0, maxLength);
        var lastSpaceIndex = truncatedStr.lastIndexOf(" ");

        if (lastSpaceIndex !== -1)
            truncatedStr = truncatedStr.substr(0, lastSpaceIndex);

        return truncatedStr + " [...]";
    };

    useEffect(_ => {
        Axios.get(ipPortApi + "getConferenceReservations/1&tkn=" + props.token)
            .then(data => {
                if (data.data.message) {
                    props.enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                    setRowsList([]);
                    setShowingRowsList([]);
                }
                else {
                    const rowsListGrouped = props.groupData(data.data);
                    const rowsList2D = [];

                    rowsListGrouped.forEach(obj =>
                        Object.keys(obj).forEach(index => {
                            const obj2 = obj[index];
                            Object.keys(obj2).forEach(index2 => {
                                const obj3 = obj2[index2];
                                props.mergeSlots(obj3).map(val => rowsList2D.push(val));
                            });
                        })
                    );

                    setRowsList(rowsList2D);

                    switch (sortingOrder.length > 0 ? (sortingOrder.split(" ")[0]) : "") {
                        case "Data":
                            break;
                        case "Sala":
                            rowsList2D.sort((a, b) => a.room_name_updatable.toLowerCase().localeCompare(b.room_name_updatable.toLowerCase()));
                            break;
                        case "Prenotatore":
                            rowsList2D.sort((a, b) => (a.name + " " + a.surname).toLowerCase().localeCompare((b.name + " " + b.surname).toLowerCase()));
                            break;
                        case "Argomento":
                            rowsList2D.sort((a, b) => a.topic.toLowerCase().localeCompare(b.topic.toLowerCase()));
                            break;
                        default:
                            break;
                    };

                    if (sortingOrder.length > 0 && (sortingOrder.split(" ")[1]).localeCompare("(DISC)") === 0)
                        rowsList2D.reverse();

                    if (searchContent.length > 0 && rowsList2D.length > 0)
                        setShowingRowsList(rowsList2D.filter(row =>
                            (row.room_name_updatable + row.name + " " + row.surname + row.topic).toLowerCase().includes(searchContent.toLowerCase())
                        ));
                    else
                        setShowingRowsList(rowsList2D);
                }
            })
            .catch(error => { setRowsList([]); setShowingRowsList([]); console.log(error); });
    }, [updateToggle]);

    useEffect(_ => handleClickToUpdate(), [searchContent]);

    return (
        <>
            {
                otherInfo &&
                <Dialog open={open} onClose={handleClose} PaperProps={{
                    style: { ...(props.sm ? { padding: 20, minWidth: "60%" } : { width: "100vw", height: "100vh", position: "fixed", top: 35, borderRadius: "16px 16px 0px 0px" }) }
                }}>
                    <Box style={{ ...(!props.sm && { display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }) }}>
                        <DialogContent>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="dialogTitle">
                                    Altre informazioni
                                </Typography>
                                <IconButton style={{ color: props.theme.palette.primary.main }} onClick={handleClose} sx={{ padding: "0" }}>
                                    <Close />
                                </IconButton>
                            </Box>
                            <br />
                            <Box align="left">
                                {[
                                    ["Argomento", otherInfo.topic],
                                    ["N. Partecipanti", otherInfo.participants_nr],
                                    ["Assistenza", otherInfo.needs_technical_assistance ? "Si" : "No"],
                                    ["Mail", <a title="Invia mail al prenotatore" href={"mailto:" + otherInfo.mail} style={{ color: props.theme.palette.primary.main }}>
                                        {otherInfo.mail}
                                    </a>]
                                ].map(([title, val], k) =>
                                    <Box key={k}>
                                        <Typography variant="data" component="span" style={{ fontWeight: "bold" }}>{title + ": "}</Typography>
                                        <Typography variant="data" component="span">{val}</Typography>
                                    </Box>
                                )}
                            </Box>
                        </DialogContent>
                    </Box>
                </Dialog>
            }
            {rowsList.length > 0 ?
                <Box p={1}>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns:
                                props.sm ? "repeat(2, minmax(0, 1fr))" : "repeat(1, 100%)",
                            gap: 3,
                            gridTemplateRows: "auto",
                            gridTemplateAreas:
                                props.sm ?
                                    `"search sort"`
                                    :
                                    `"search"
                                    "sort"`,
                            alignItems: "center"
                        }}
                        pb={props.sm ? 4 : 1}
                    >
                        <Box gridArea="search">
                            <StyledOutlinedTextField
                                variant="outlined"
                                placeholder="Cerca..."
                                type="text"
                                fullWidth
                                value={searchContent}
                                onChange={e => setSearchContent(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search color="primary" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={_ => setSearchContent("")} sx={{ visibility: searchContent.length > 0 ? "visible" : "hidden" }}>
                                                <Clear />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                sx={{
                                    "& .MuiInputBase-root": {
                                        height: 48
                                    }
                                }}
                            />
                        </Box>
                        <Box gridArea="sort">
                            <FormControl fullWidth>
                                <InputLabel id="Sorting-order">Ordina per</InputLabel>
                                <StyledSelect
                                    variant="outlined"
                                    labelId="Sorting-order"
                                    label="Sorting-order"
                                    fullWidth
                                    required
                                    value={sortingOrder}
                                    onChange={e => {
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
                    </Box>
                    <Table sx={{
                        "& .MuiTableCell-root": {
                            padding: props.sm ? "16px" : "8px",
                            ...(!props.sm && { textAlign: "center" })
                        }
                    }}>
                        {
                            props.sm &&
                            <TableHead>
                                <TableRow style={{ backgroundColor: props.theme.palette.primary.mainLighter }}>
                                    {["Sala", "Prenotatore", "Data", "Orario", "Argomento", "Azioni"].map((val, index3, headArr) =>
                                    (
                                        <StyledTableCell style={{ fontWeight: "bold" }} key={index3}>
                                            {val}
                                        </StyledTableCell>
                                    )
                                    )}
                                </TableRow>
                            </TableHead>
                        }
                        <TableBody>
                            {
                                showingRowsList.map((val, pos) =>
                                    <TableRow key={pos}>
                                        {props.sm ?
                                            <>
                                                {
                                                    [
                                                        val.room_name_updatable,
                                                        val.name + " " + val.surname,
                                                        props.capitalize(props.moment(val.slot_day).format("dddd D MMMM YYYY")),
                                                        props.mergeTimeIntervals(val),
                                                        trimWithCompleteWords(val.topic),
                                                        otherInfoButton(val)
                                                    ].map((el, k) =>
                                                        <StyledTableCell key={k} style={{ ...((k === 0 || k === 1) && { wordBreak: "break-all" }) }}>
                                                            {el}
                                                        </StyledTableCell>
                                                    )
                                                }
                                            </>
                                            :
                                            <StyledTableCell>
                                                <Box align="left" p={1}>
                                                    {[
                                                        ["Sala", val.room_name_updatable],
                                                        ["Prenotatore", val.name + " " + val.surname],
                                                        ["Data", props.capitalize(props.moment(val.slot_day).format("ddd. D MMM. YYYY"))],
                                                        ["Orario", props.mergeTimeIntervals(val)],
                                                        ["Argomento", trimWithCompleteWords(val.topic)]
                                                    ].map(([title, val], k) =>
                                                        <Box key={k}>
                                                            <Typography variant="data" component="span" style={{ fontWeight: "bold" }}>{title + ": "}</Typography>
                                                            <Typography variant="data" component="span">{val}</Typography>
                                                        </Box>
                                                    )}
                                                    <Box align="right" p={1}>
                                                        {otherInfoButton(val)}
                                                    </Box>
                                                </Box>
                                            </StyledTableCell>
                                        }
                                    </TableRow>
                                )
                            }
                        </TableBody>
                    </Table>
                </Box>
                :
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="h5" textAlign="center">
                        Nessuna prenotazione presente.
                    </Typography>
                </Box>
            }
        </>
    );
}