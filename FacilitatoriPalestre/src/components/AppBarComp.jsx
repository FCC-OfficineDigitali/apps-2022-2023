import React, { useState, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
	AppBar,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	Grid,
	IconButton,
	Toolbar,
	Typography,
	useTheme
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { LargerThanSm } from "../MediaQueries";

export default function AppBarComp() {
	const theme = useTheme();
	const history = useNavigate();
	const sm = LargerThanSm();
	const nav = useRef();
	const [navHeight, setNavHeight] = useState(0);
	const [open, setOpen] = useState(false);

	useLayoutEffect(_ => {
		nav.current && setNavHeight(nav.current.clientHeight);
	}, [sm]);

	return (
		<>
			<Dialog open={open}
				PaperProps={{
					style: {
						...(sm ?
							{ width: "60vw", height: "60vh", maxWidth: "unset", maxHeight: "unset" }
							:
							{ width: "100vw", height: "100vh", position: "fixed", top: 35, borderRadius: "16px 16px 0px 0px" }
						)
					}
				}}
			>
				<Box style={{ ...(sm && { padding: 20 }), display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", overflow: "hidden" }}>
					<DialogContent>
						<Typography gutterBottom variant="h5">Effettuare il logout?</Typography>
					</DialogContent>
					<DialogActions>
						{[["No", _ => { }], ["Si", _ => {
							Cookies.remove("FacilitatoriPalestre");
							history("/login", { replace: true });
						}]].map(([text, action], key) =>
							<Grid item key={key}>
								<Button
									onClick={_ => {
										action();
										setOpen(false);
									}}
								>
									{text}
								</Button>
							</Grid>
						)}
					</DialogActions>
				</Box>
			</Dialog>
			<AppBar position="fixed" ref={nav} elevation={0} sx={{ backgroundColor: "white" }}>
				<Toolbar style={{ padding: "0.5% 4% 0%" }}>
					<Box
						component="img"
						src="./img/logoCamposampierese.svg"
						maxHeight={navHeight / 2}
						sx={{ marginRight: "2.5%" }}
						title="Camposampierese"
						alt="logo Camposampierese"
					/>
					<Grid container direction="column">
						<Grid item>
							<Typography variant="h4" color={theme.palette.primary.main} fontWeight="bold" style={{ ...(!sm && { fontSize: 18 }) }}>
								FacilitatoriPalestre
							</Typography>
						</Grid>
						{sm &&
							<Grid item>
								<Typography gutterBottom variant="h5" color={theme.palette.primary.main} fontSize="16.5px" fontWeight="bold">
									L'app dei facilitatori per le palestre del Camposampierese
								</Typography>
							</Grid>
						}
					</Grid>
					{
						true &&
						<Box ml={1}>
							<IconButton onClick={_ => setOpen(true)}>
								<LogoutIcon style={{ color: theme.palette.primary.main }} />
							</IconButton>
						</Box>
					}
				</Toolbar>
			</AppBar>
			<Toolbar style={{ height: navHeight + "px" }} />
		</>
	);
}