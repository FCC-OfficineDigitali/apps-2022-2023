import React, { useEffect, useRef, useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, Table, TableBody, TableHead, TableRow, Typography } from "@mui/material";
import ipPortApi from "../ipPortApi";
import Axios from "axios";
import { StyledCellTextField, StyledOutlinedButton, StyledTableCell, StyledTextButton } from "../styles";

export default function RoomsComp(props) {
    const [openChangingFixedMessageModal, setOpenChangingFixedMessageModal] = useState(false);
    const [openChangingRoomsModal, setOpenChangingRoomsModal] = useState(false);
    const [roomsList, setRoomsList] = useState([]);
    const [newRoomsList, setNewRoomsList] = useState([]);
    const [fixedMessage, setFixedMessage] = useState("");
    const [newFixedMessage, setNewFixedMessage] = useState("");
    const fixedMessageFormRef = useRef();
    const roomsFormRef = useRef();

    const handleCloseChangingFixedMessageModal = _ => {
        setOpenChangingFixedMessageModal(false);
    };

    const handleCloseChangingRoomsModal = _ => {
        setOpenChangingRoomsModal(false);
    };

    const fetchFixedMessage = _ => {
        Axios.get(ipPortApi + "getFixedMessage/" + props.token)
            .then(data => {
                if (data.data.message) {
                    props.enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                    setFixedMessage("");
                }
                else
                    setFixedMessage(data.data);
            })
            .catch(error => { setFixedMessage(""); console.log(error); });
    };

    const fetchRooms = _ => {
        Axios.get(ipPortApi + "getRoomsInfo/" + props.token)
            .then(data => {
                if (data.data.message) {
                    props.enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                    setRoomsList([]);
                }
                else
                    setRoomsList(data.data);
            })
            .catch(error => { setRoomsList([]); console.log(error); });
    };

    const updateFixedMessage = _ => {
        Axios.put(ipPortApi + "updateFixedMessage/" + props.token,
            {
                fixed_message: newFixedMessage
            }).then(response => {
                if (response.data.messageOk) {
                    props.enqueueSnackbar(response.data.messageOk, { variant: "success" });
                    handleCloseChangingFixedMessageModal();
                    fetchFixedMessage();
                }
                else
                    props.enqueueSnackbar("Errore dal server: " + response.data.message, { variant: "error" });
            }).catch(error => console.log(error));
    };

    const updateRooms = _ => {
        Axios.put(ipPortApi + "updateRooms/" + props.token, { newRoomsList }).then(response => {
            if (response.data.messageOk) {
                props.enqueueSnackbar(response.data.messageOk, { variant: "success" });
                handleCloseChangingRoomsModal();
                fetchRooms();
            }
            else
                props.enqueueSnackbar("Errore dal server: " + response.data.message, { variant: "error" });
        }).catch(error => console.log(error))
    };

    const updateNewRoomsList = (ind, p, val) => {
        setNewRoomsList(oldNRL => {
            const newArray = [...oldNRL];
            newArray[ind] = { ...oldNRL[ind], [p]: val };
            return newArray;
        });
    };

    useEffect(_ => {
        fetchFixedMessage();
        fetchRooms();
    }, []);

    useEffect(_ => {
        setNewFixedMessage(fixedMessage.trim().charAt(0).toUpperCase() + fixedMessage.trim().slice(1));
        setNewRoomsList([...roomsList]);
    }, [fixedMessage, roomsList]);

    return (
        <>
            <form ref={fixedMessageFormRef}>
                <Table sx={{
                    "& .MuiTableCell-root": {
                        padding: props.sm ? "16px" : "8px",
                        border: "1px solid " + props.theme.palette.primary.mainLighter
                    }
                }}>
                    <TableHead>
                        <TableRow style={{ backgroundColor: props.theme.palette.primary.mainLighter }}>
                            <StyledTableCell style={{ fontWeight: "bold" }}>
                                Messaggio Alert (comparirà come fisso nell'app utente)
                            </StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <StyledTableCell>
                                <StyledCellTextField
                                    type="text"
                                    multiline
                                    fullWidth
                                    value={newFixedMessage}
                                    onChange={e => setNewFixedMessage(e.target.value)}
                                    onBlur={_ => setNewFixedMessage(newFixedMessage.trim().charAt(0).toUpperCase() + newFixedMessage.trim().slice(1))}
                                    inputProps={{ maxLength: 256, style: { padding: 0 } }}
                                />
                            </StyledTableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <Box width="100%" display="flex" justifyContent="flex-end" py={2}>
                    <StyledOutlinedButton
                        disabled={newFixedMessage.localeCompare(fixedMessage) === 0}
                        style={{ borderColor: newFixedMessage.localeCompare(fixedMessage) === 0 ? props.theme.palette.primary.disabledGrey : props.theme.palette.primary.main }}
                        onClick={_ => {
                            if (fixedMessageFormRef.current.reportValidity() && newFixedMessage.localeCompare(fixedMessage) !== 0)
                                setOpenChangingFixedMessageModal(true);
                        }}>
                        Salva
                    </StyledOutlinedButton>
                </Box>
                <Dialog open={openChangingFixedMessageModal} onClose={handleCloseChangingFixedMessageModal} PaperProps={{
                    style: { ...(props.sm ? { padding: 20, minWidth: "60%" } : { width: "100vw", height: "100vh", position: "fixed", top: 35, borderRadius: "16px 16px 0px 0px" }) }
                }}>
                    <Box style={{ ...(!props.sm && { display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }) }}>
                        <DialogContent>
                            <Typography variant="dialogTitle">
                                Richiesta modifica per il messaggio alert
                            </Typography>
                            <br />
                            <br />
                            <Table sx={{
                                "& .MuiTableCell-root": {
                                    padding: props.sm ? "16px" : "8px",
                                    border: "1px solid " + props.theme.palette.primary.mainLighter
                                }
                            }}>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: props.theme.palette.primary.mainLighter }}>
                                        <StyledTableCell style={{ fontWeight: "bold" }}>
                                            Messaggio Alert (comparirà come fisso nell'app utente)
                                        </StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <StyledTableCell>
                                            <Box color={props.theme.palette.primary.red}>{newFixedMessage}</Box>
                                            {fixedMessage && fixedMessage.length > 0 && "(Messaggio precedentemente fissato: " + fixedMessage + ")"}
                                        </StyledTableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </DialogContent>
                        <DialogActions>
                            <StyledTextButton onClick={handleCloseChangingFixedMessageModal}>Annulla</StyledTextButton>
                            <StyledTextButton type="submit"
                                onClick={e => {
                                    e.preventDefault();
                                    updateFixedMessage();
                                }}>
                                Conferma
                            </StyledTextButton>
                        </DialogActions>
                    </Box>
                </Dialog>
            </form>
            <form ref={roomsFormRef}>
                <Table sx={{
                    "& .MuiTableCell-root": {
                        padding: props.sm ? "16px" : "8px",
                        border: "1px solid " + props.theme.palette.primary.mainLighter,
                    }
                }}>
                    <TableHead>
                        <TableRow style={{ backgroundColor: props.theme.palette.primary.mainLighter }}>
                            {["Sala", "Descrizione"].map((val, index) =>
                            (
                                <StyledTableCell style={{ fontWeight: "bold" }} key={index}>
                                    {val}
                                </StyledTableCell>
                            )
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            newRoomsList.map((room, r) =>
                                <TableRow key={r}>
                                    <StyledTableCell>
                                        <StyledCellTextField
                                            type="text"
                                            multiline
                                            fullWidth
                                            required
                                            value={room.room_name_updatable || ""}
                                            onChange={e => updateNewRoomsList(r, "room_name_updatable", e.target.value.replace(/[\r\n\v]+/g, ""))}
                                            inputProps={{ maxLength: 20, style: { padding: 0 } }}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <StyledCellTextField
                                            type="text"
                                            multiline
                                            fullWidth
                                            required
                                            value={room.room_description || ""}
                                            onChange={e => updateNewRoomsList(r, "room_description", e.target.value)}
                                            inputProps={{ maxLength: 2000 }}
                                        />
                                    </StyledTableCell>
                                </TableRow>
                            )
                        }
                    </TableBody>
                </Table>
                <Box width="100%" display="flex" justifyContent="flex-end" py={2}>
                    <StyledOutlinedButton
                        disabled={newRoomsList.every((room, r) =>
                            room.room_name_updatable.localeCompare(roomsList[r].room_name_updatable) === 0
                            && room.room_description.localeCompare(roomsList[r].room_description) === 0
                        )}
                        style={{
                            borderColor: newRoomsList.every((room, r) =>
                                room.room_name_updatable.localeCompare(roomsList[r].room_name_updatable) === 0
                                && room.room_description.localeCompare(roomsList[r].room_description) === 0
                            ) ? props.theme.palette.primary.disabledGrey : props.theme.palette.primary.main
                        }}
                        onClick={_ => {
                            if (roomsFormRef.current.reportValidity()
                                &&
                                newRoomsList.some((room, r) =>
                                    room.room_name_updatable.localeCompare(roomsList[r].room_name_updatable) !== 0
                                    || room.room_description.localeCompare(roomsList[r].room_description) !== 0
                                ))
                                setOpenChangingRoomsModal(true);
                        }}>
                        Salva
                    </StyledOutlinedButton>
                </Box>
                <Dialog open={openChangingRoomsModal} onClose={handleCloseChangingRoomsModal} PaperProps={{
                    style: { ...(props.sm ? { padding: 20, minWidth: "60%" } : { width: "100vw", height: "100vh", position: "fixed", top: 35, borderRadius: "16px 16px 0px 0px" }) }
                }}>
                    <Box style={{ ...(!props.sm && { display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }) }}>
                        <DialogContent>
                            <Typography variant="dialogTitle">
                                Richiesta modifica per i dati delle sale
                            </Typography>
                            <br />
                            <br />
                            <Table sx={{
                                "& .MuiTableCell-root": {
                                    padding: props.sm ? "16px" : "8px",
                                    border: "1px solid " + props.theme.palette.primary.mainLighter,
                                }
                            }}>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: props.theme.palette.primary.mainLighter }}>
                                        {["Sala", "Descrizione"].map((val, index) =>
                                        (
                                            <StyledTableCell style={{ fontWeight: "bold" }} key={index}>
                                                {val}
                                            </StyledTableCell>
                                        )
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        newRoomsList.map((room, r) =>
                                            <TableRow key={r}>
                                                <StyledTableCell>
                                                    {room.room_name_updatable.localeCompare(roomsList[r].room_name_updatable) !== 0 ?
                                                        <Box>
                                                            <Box color={props.theme.palette.primary.red}>{room.room_name_updatable}</Box>
                                                            (Nome precedente: {roomsList[r].room_name_updatable})
                                                        </Box>
                                                        :
                                                        roomsList[r].room_name_updatable
                                                    }

                                                </StyledTableCell>
                                                <StyledTableCell style={{ whiteSpace: "pre-line" }}>
                                                    {room.room_description.localeCompare(roomsList[r].room_description) !== 0 ?
                                                        <Box>
                                                            <Box color={props.theme.palette.primary.red}>{room.room_description}</Box>
                                                            (Descrizione precedente:
                                                            <br />
                                                            {roomsList[r].room_description})
                                                        </Box>
                                                        :
                                                        roomsList[r].room_description
                                                    }
                                                </StyledTableCell>
                                            </TableRow>
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </DialogContent>
                        <DialogActions>
                            <StyledTextButton onClick={handleCloseChangingRoomsModal}>Annulla</StyledTextButton>
                            <StyledTextButton type="submit"
                                onClick={e => {
                                    e.preventDefault();
                                    updateRooms();
                                }}>
                                Conferma
                            </StyledTextButton>
                        </DialogActions>
                    </Box>
                </Dialog>
            </form>
        </>
    );
}