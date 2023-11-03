import { useEffect, useState } from "react";
import { Box, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { LargerThanSm } from "../MediaQueries";
import { getOperatori } from "../services/apiSuperUsers";
import OperatorePopup from "./OperatorePopup";
import { StyledOutlinedButton } from "../styles";

export default function OperatoriTab() {
    const sm = LargerThanSm();

    const [operatoriArr, setOperatoriArr] = useState([]);

    const [showPopup, setShowPopup] = useState(false);
    const [selectedOperatore, setSelectedOperatore] = useState({});

    const closePopup = _ => setShowPopup(false);

    const downloadOperatoriCsv = _ => {
        if (operatoriArr.length > 0) {
            const csvContent = "Nome;Cognome;Mail;Nome Palestra;Indirizzo Palestra\n";

            var rows = "";

            operatoriArr.map(operatore => rows += (
                operatore.name + ";" + operatore.surname + ";" + operatore.mail + ";" +
                operatore.gymName + ";" + operatore.gymAddress + "\n"
            ));

            const blob = new Blob([csvContent + rows], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = "Operatori.csv";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        }
    };

    useEffect(_ => {
        getOperatori(setOperatoriArr);
    }, []);

    return (
        <>
            <Box display="flex" alignItems="center" justifyContent="space-between" m={1}>
                {
                    operatoriArr.length > 0 &&
                    <Box>
                        <StyledOutlinedButton onClick={_ => downloadOperatoriCsv(operatoriArr)}>Scarica</StyledOutlinedButton>
                    </Box>
                }
            </Box>
            <OperatorePopup showPopup={showPopup} closePopup={closePopup} selectedOperatore={selectedOperatore} />
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
                        {operatoriArr.map(operator => (
                            <TableRow key={operator.operator_id}>
                                <TableCell>{operator.name + " " + operator.surname}</TableCell>
                                {sm &&
                                    <TableCell>
                                        <a title={"Invia mail a " + operator.name + " " + operator.surname} href={"mailto:" + operator.mail}>
                                            {operator.mail}
                                        </a>
                                    </TableCell>
                                }
                                <TableCell align="right">
                                    {sm ?
                                        <StyledOutlinedButton onClick={_ => { setSelectedOperatore(operator); setShowPopup(true); }}>
                                            Info
                                        </StyledOutlinedButton>
                                        :
                                        <IconButton onClick={_ => { setSelectedOperatore(operator); setShowPopup(true); }} color="primary">
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
