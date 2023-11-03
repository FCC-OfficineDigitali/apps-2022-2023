import React, { useState, useLayoutEffect, useRef } from "react";
import {
	AppBar,
	Box,
	Grid,
	Typography,
	Toolbar,
	IconButton,
	Dialog,
	DialogContent,
	useTheme
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../hooks/useAuth";
import { LargerThanLg, LargerThanSm } from "../MediaQueries";
import { StyledOutlinedButton } from "../styles";

export default function AppBarComp(props) {
	const theme = useTheme();
	const lg = LargerThanLg();
	const sm = LargerThanSm();
	const nav = useRef();
	const [navHeight, setNavHeight] = useState(0);
	const [isMobile, setIsMobile] = useState(false);
	const [open, setOpen] = useState(false);
	const { logout, user } = useAuth();

	useLayoutEffect(() => {
		nav.current && setNavHeight(nav.current.clientHeight);
	}, [isMobile]);

	const checkIsMobile = _ => (window.innerWidth < 960 ? true : false);
	if ((typeof window).localeCompare("undefined") !== 0)
		window.onresize = _ => isMobile !== checkIsMobile && setIsMobile(checkIsMobile);

	return (
		<>
			<Dialog open={open} PaperProps={{
				style: {
					padding: sm ? 20 : 0,
					maxWidth: sm ? "60%" : "90%"
				}
			}}>
				<DialogContent>
					<Typography variant="h4" align="center">Effettuare il logout?</Typography>
					<br />
					<Grid container direction={sm ? "row" : "column"} justifyContent="space-evenly" alignItems="center" gap={4}>
						{[["Si", _ => logout()], ["No", _ => { }]].map(([text, action], key) =>
							<Grid item key={key}>
								<StyledOutlinedButton
									onClick={_ => {
										action();
										setOpen(false);
									}}
									sx={{ fontFamily: "Graphik", fontSize: 15 }}>
									{text}
								</StyledOutlinedButton>
							</Grid>
						)}
					</Grid>
				</DialogContent>
			</Dialog>
			<AppBar position="fixed" ref={nav} elevation={0} sx={{ bgcolor: theme.palette.primary.white }}>
				<Toolbar style={{ padding: "0.5% 4% 0%" }}>
					<Box
						component="img"
						src="./img/logoCamposampierese.svg"
						maxHeight={lg ? navHeight - 10 : navHeight / 2}
						sx={{ marginRight: "2.5%" }}
						title="Camposampierese"
						alt="logo Camposampierese"
					/>
					<Grid container direction="column">
						<Grid item>
							<Typography variant="h1" style={{ fontSize: lg ? 36 : 18 }}>
								SmartLab-Segnalazioni
							</Typography>
						</Grid>
						{lg && <Grid item>
							<Typography variant="subheader">
								Segnala problematiche riguardanti l'Innovation Lab del Camposampierese
							</Typography>
						</Grid>
						}
					</Grid>
					{
						user &&
						<Box ml={1}>
							<IconButton onClick={_ => setOpen(true)}>
								<LogoutIcon style={{ color: theme.palette.primary.main }} />
							</IconButton>
						</Box>
					}
				</Toolbar>
			</AppBar>
			<Toolbar style={{ paddingTop: `${navHeight}px` }} />
			{props.children}
		</>
	);
}