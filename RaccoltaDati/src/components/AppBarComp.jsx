import React, { useState, useLayoutEffect, useRef } from "react";
import {
	AppBar,
	Box,
	Grid,
	Typography,
	Toolbar
} from "@mui/material";
import { LargerThanLg } from "../MediaQueries";

export default function AppBarComp(props) {
	const lg = LargerThanLg();
	const nav = useRef();
	const [navHeight, setNavHeight] = useState(0);
	const [isMobile, setIsMobile] = useState(false);

	useLayoutEffect(() => {
		nav.current && setNavHeight(nav.current.clientHeight);
	}, [isMobile]);

	const checkIsMobile = _ => (window.innerWidth < 960 ? true : false);
	if ((typeof window).localeCompare("undefined") !== 0)
		window.onresize = _ => isMobile !== checkIsMobile && setIsMobile(checkIsMobile);

	return (
		<>
			<AppBar position="fixed" ref={nav} elevation={0} sx={{ bgcolor: "#FFFFFF" }}>
				<Toolbar style={{ padding: "0.5% 4% 0%" }}>
					<Box
						component="img"
						src="./img/logoCamposampierese.svg"
						maxHeight={lg ? navHeight - 10 : navHeight / 2}
						sx={{ marginRight: "2.5%" }}
						title={"Camposampierese"}
                        alt={"logo Camposampierese"}
					/>
					<Grid container direction={"column"}>
						<Grid item>
							<Typography variant="h1" style={{ fontSize: lg ? 36 : 18 }}>
								Il Libro Dei Passaggi
							</Typography>
						</Grid>
						{lg && <Grid item>
							<Typography variant="subheader">
								L'app di raccolta dati della Treviso-Ostiglia
							</Typography>
						</Grid>
						}
					</Grid>
				</Toolbar>
			</AppBar>
			<Toolbar style={{ paddingTop: `${navHeight}px` }} />
			{props.children}
		</>
	);
}