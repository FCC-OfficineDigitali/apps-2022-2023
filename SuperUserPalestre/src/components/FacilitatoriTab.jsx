import { useEffect, useRef, useState } from "react";
import { Box, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { LargerThanSm } from "../MediaQueries";
import { StyledOutlinedButton } from "../styles";
import { getFacilitatori, getHoursFutureCounters, updateHoursFutureCounters } from "../services/apiSuperUsers";
import FacilitatorePopup from "./FacilitatorePopup";

export default function FacilitatoriTab() {
    const sm = LargerThanSm();

    const formRef = useRef();

    const [facilitatoriArr, setFacilitatoriArr] = useState([]);

    const [showPopup, setShowPopup] = useState(false);
    const [selectedFacilitatore, setSelectedFacilitatore] = useState({});

    const [fixedHoursFutureCount, setFixedHoursFutureCount] = useState("");
    const [variableHoursFutureCount, setVariableHoursFutureCount] = useState("");

    const closePopup = _ => setShowPopup(false);

    const downloadFacilitatoriCsv = _ => {
        if (facilitatoriArr.length > 0) {
            const csvContent = "Nome;Cognome;Mail;Nome Palestra 1;Indirizzo Palestra 1;Nome Palestra 2;Indirizzo Palestra 2;Nome Palestra 3;Indirizzo Palestra 3\n";

            var rows = "";

            facilitatoriArr.map(facilitatore => rows += (
                facilitatore.name + ";" + facilitatore.surname + ";" + facilitatore.mail + ";" +
                facilitatore.g1name + ";" + facilitatore.g1address + ";" +
                facilitatore.g2name + ";" + facilitatore.g2address + ";" +
                facilitatore.g3name + ";" + facilitatore.g3address + "\n"
            ));

            const blob = new Blob([csvContent + rows], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = "Facilitatori.csv";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        }
    };

    useEffect(_ => {
        getFacilitatori(setFacilitatoriArr);
        getHoursFutureCounters(setFixedHoursFutureCount, setVariableHoursFutureCount);
    }, []);

    return (
        <>
            <Box display="flex" flexDirection={sm ? "row" : "column"} alignItems="center" justifyContent="space-between" m={1}>
                {
                    facilitatoriArr.length > 0 &&
                    <Box>
                        <StyledOutlinedButton onClick={_ => downloadFacilitatoriCsv(facilitatoriArr)}>Scarica</StyledOutlinedButton>
                    </Box>
                }

                <form ref={formRef}>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns:
                                sm ? "repeat(3, 1fr)" : "repeat(2, 50%)",
                            gap: 1,
                            gridTemplateRows: "auto",
                            gridTemplateAreas:
                                sm ? `"fixed variable btn"`
                                    :
                                    `"fixed variable"
                                    "btn btn"`
                        }}
                        alignItems="center"
                        m={sm ? 1 : 2}
                    >
                        <Box gridArea="fixed">
                            <TextField
                                type="number"
                                label="Ore fisse"
                                value={fixedHoursFutureCount}
                                onChange={e => setFixedHoursFutureCount(e.target.value)}
                                InputProps={{ inputProps: { min: "1", max: "200", step: "1" } }}
                                fullWidth
                                required
                            />
                        </Box>
                        <Box gridArea="variable">
                            <TextField
                                type="number"
                                label="Ore variabili"
                                value={variableHoursFutureCount}
                                onChange={e => setVariableHoursFutureCount(e.target.value)}
                                InputProps={{ inputProps: { min: "1", max: "200", step: "1" } }}
                                fullWidth
                                required
                            />
                        </Box>
                        <Box gridArea="btn">
                            <StyledOutlinedButton type="submit"
                                onClick={e => {
                                    e.preventDefault();
                                    if (formRef.current.reportValidity())
                                        updateHoursFutureCounters(Number(fixedHoursFutureCount), Number(variableHoursFutureCount));
                                }}
                                fullWidth
                            >
                                Applica dal mese prossimo
                            </StyledOutlinedButton>
                        </Box>
                    </Box>
                </form>
            </Box>
            <FacilitatorePopup showPopup={showPopup} closePopup={closePopup} selectedFacilitatore={selectedFacilitatore} />
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ fontWeight: "bold" }}>Nome e cognome</TableCell>
                            {sm && <TableCell style={{ fontWeight: "bold" }}>Mail</TableCell>}
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {facilitatoriArr.map(facilitator => (
                            <TableRow key={facilitator.facilitator_id}>
                                <TableCell>{facilitator.name + " " + facilitator.surname}</TableCell>
                                {sm &&
                                    <TableCell>
                                        <a title={"Invia mail a " + facilitator.name + " " + facilitator.surname} href={"mailto:" + facilitator.mail}>
                                            {facilitator.mail}
                                        </a>
                                    </TableCell>
                                }
                                <TableCell align="right">
                                    {sm ?
                                        <StyledOutlinedButton onClick={_ => { setSelectedFacilitatore(facilitator); setShowPopup(true); }}>
                                            Info
                                        </StyledOutlinedButton>
                                        :
                                        <IconButton onClick={_ => { setSelectedFacilitatore(facilitator); setShowPopup(true); }} color="primary">
                                            <ChevronRightIcon />
                                        </IconButton>
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}
