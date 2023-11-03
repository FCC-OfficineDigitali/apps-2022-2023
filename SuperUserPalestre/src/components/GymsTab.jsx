import { useEffect, useState } from "react";
import { Box, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { LargerThanSm } from "../MediaQueries";
import { getAllGyms } from "../services/apiSuperUsers";
import GymPopup from "./GymPopup";
import { StyledOutlinedButton } from "../styles";

export default function GymsTab() {
    const sm = LargerThanSm();

    const [gymsArr, setGymsArr] = useState([]);

    const [showPopup, setShowPopup] = useState(false);
    const [selectedGym, setSelectedGym] = useState({});

    const closePopup = _ => setShowPopup(false);

    const downloadGymsCsv = _ => {
        if (gymsArr.length > 0) {
            const csvContent = "Nome;Indirizzo;" + Object.keys(JSON.parse(gymsArr[0].opening_hours)).map(key => key.replace("ì", "i'")).join(";") + "\n";

            var rows = "";

            gymsArr.map(gym => rows += (gym.name + ";" + gym.address + ";" + Object.values(JSON.parse(gym.opening_hours)).map(value => value.length ? value : "Chiuso").join(";") + "\n"));

            const blob = new Blob([csvContent + rows], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = "Palestre.csv";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        }
    };

    useEffect(_ => {
        getAllGyms(setGymsArr);
    }, []);

    return (
        <>
            <Box display="flex" alignItems="center" justifyContent="space-between" m={1}>
                {
                    gymsArr.length > 0 &&
                    <Box>
                        <StyledOutlinedButton onClick={_ => downloadGymsCsv(gymsArr)}>Scarica</StyledOutlinedButton>
                    </Box>
                }
            </Box>
            <GymPopup showPopup={showPopup} closePopup={closePopup} selectedGym={selectedGym} />
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ fontWeight: "bold" }}>Nome</TableCell>
                            {sm && <TableCell style={{ fontWeight: "bold" }}>Indirizzo</TableCell>}
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {gymsArr.map(gym => (
                            <TableRow key={gym.gym_id}>
                                <TableCell>{gym.name}</TableCell>
                                {sm && <TableCell>{gym.address}</TableCell>}
                                <TableCell align="right">
                                    {sm ?
                                        <StyledOutlinedButton onClick={_ => { setSelectedGym(gym); setShowPopup(true); }}>
                                            Info
                                        </StyledOutlinedButton>
                                        :
                                        <IconButton onClick={_ => { setSelectedGym(gym); setShowPopup(true); }} color="primary">
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
