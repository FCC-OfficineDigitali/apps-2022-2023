import React, { useState, useLayoutEffect, useRef } from "react";
import {
	AppBar,
	Box,
	Grid,
	IconButton,
	Typography,
	Toolbar
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
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
			<AppBar position="fixed" ref={nav} elevation={0} sx={(props.minusWidth !== undefined ? {
				width: { lg: `calc(100% - ${props.minusWidth}%)` },
				ml: { lg: "0" },
				mr: { lg: `${props.minusWidth}%` }
			} : {}) && { bgcolor: "#FFFFFF" }}>
				<Toolbar style={{ padding: (lg && props.minusWidth > 0) ? "0.5% 2.5% 0%" : "0.5% 4% 0%" }}>
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
								{props.appTitle}
							</Typography>
						</Grid>
						{lg && <Grid item>
							<Typography variant="subheader">
								La mappa del settore servizi alle imprese del Camposampierese
							</Typography>
						</Grid>
						}
					</Grid>

					{props.menuFunction !== undefined &&
						<IconButton
							color="secondary"
							edge="end"
							onClick={props.menuFunction()}
							sx={{ ml: "auto", display: (props.isOpen ? { lg: "none" } : "inline") }}
						>
							<MenuIcon />
						</IconButton>
					}
				</Toolbar>
			</AppBar>
			<Toolbar style={{ paddingTop: `${navHeight}px` }} />
			{props.children}
		</>
	);
}