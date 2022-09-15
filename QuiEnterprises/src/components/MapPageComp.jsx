import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Link, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import ipPortApi from "../ipPortApi";
import FooterComp from "./FooterComp";
import FileDownloadButtonComp from "./FileDownloadButtonComp";
import FiltersDrawerComp from "./FiltersDrawerComp";
import BottomDrawerComp from "./BottomDrawerComp";
import CompanyInfoComp from "./CompanyInfoComp";
import { LargerThanLg } from "../MediaQueries";
import { StyledAutocomplete } from "../styles";
import words from "../words";
import { CircleMarker, GeoJSON, MapConsumer, MapContainer, ScaleControl, TileLayer } from "react-leaflet";
import L from "leaflet";
import { TagCloud } from "react-tagcloud";
import * as Papa from "papaparse";
import Axios from "axios";
import { useSnackbar } from "notistack";

export default function MapPageComp() {
	const lg = LargerThanLg();
	const history = useNavigate();
	const [showDrawer, setShowDrawer] = useState(false);
	const [showFilters, setShowFilters] = useState(true);
	const [triggerOpen, setTriggerOpen] = useState(false);
	const [lastClickedCircleMarker, setLastClickedCircleMarker] = useState(-1);
	const [mapRef, setMapRef] = useState(null);
	const [parsedCsvData, setParsedCsvData] = useState([]);
	const [filteredResults, setFilteredResults] = useState([]);
	const [municipalitiesArray, setMunicipalitiesArray] = useState([]);
	const [keywordsArray, setKeywordsArray] = useState([]);
	const [subcategoriesArray, setSubcategoriesArray] = useState([]);
	const [municipalitiesAutocompleteValues, setMunicipalitiesAutocompleteValues] = useState([]);
	const [keywordsAutocompleteValues, setKeywordsAutocompleteValues] = useState([]);
	const [filterCompaniesOnlyWith, setFilterCompaniesOnlyWith] = useState([]);
	const onlyWithValues = ["E-mail", "Form contatto", "Sito web", "Social media", "Telefono", "Traduzioni"];
	const [filterCompaniesWithSubcategory, setFilterCompaniesWithSubcategory] = useState([]);
	const [usedFilters, setUsedFilters] = useState({ withSubcategory: false, onlyWith: false, municipalities: false, keywords: false });
	const [usingParsedData, setUsingParsedData] = useState([]);
	const [municipalitiesLimitReached, setMunicipalitiesLimitReached] = useState(false);
	const [keywordsLimitReached, setKeywordsLimitReached] = useState(false);
	const { enqueueSnackbar } = useSnackbar();
	const geoJsonRef = useRef();
	const colorsArray = ["#D81B60", "#1E88E5", "#FFC107", "#004D40", "#630A6B", "#9E4921"];
	var circleMarkersArray = [];
	const defaultZoom = 10;
	const limit = 3;
	const accessToken = "pk.eyJ1IjoiamFjb3BvLXRyYWJvbmEiLCJhIjoiY2t1cGVteWd5MWM4ODJudGhyd2tmdDNlayJ9.d5dbeNUUL2aj3ug5TsSxdw";
	const fileName = "dataset_definitivo_camposampierese_servizi_alle_imprese";
	const bluCamposampierese = "#00009C";
	const yellow = "#EED202";
	const appTitle = "QuiSiFa Servizi alle Imprese";

	const handleFilterCompaniesOnlyWith = (event, parameters) => {
		setFilterCompaniesOnlyWith(parameters);
		if (parameters.length == 0)
			setUsedFilters(usedFilters => ({ ...usedFilters, onlyWith: false }));
		else
			setUsedFilters(usedFilters => ({ ...usedFilters, onlyWith: true }));
	};

	const handleFilterCompaniesWithSubcategory = (event, parameters) => {
		setFilterCompaniesWithSubcategory(parameters);
		if (parameters.length == 0)
			setUsedFilters(usedFilters => ({ ...usedFilters, withSubcategory: false }));
		else
			setUsedFilters(usedFilters => ({ ...usedFilters, withSubcategory: true }));
	};

	const checkDisableMunicipalities = useCallback(option => municipalitiesLimitReached && !municipalitiesAutocompleteValues.includes(option), [municipalitiesLimitReached, municipalitiesAutocompleteValues]);

	const checkDisableKeywords = useCallback(option => keywordsLimitReached && !keywordsAutocompleteValues.includes(option), [keywordsLimitReached, keywordsAutocompleteValues]);

	const intersect = arrays => arrays.reduce((a, b) => a.filter(c => b.includes(c)));

	const roundCoord = coord => parseFloat(coord).toFixed(7);

	const capitalize = str => str.toLowerCase().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

	const newShade = (hexColor, magnitude) => {
		hexColor = hexColor.replace("#", "");
		if (hexColor.length === 6) {
			const decimalColor = parseInt(hexColor, 16);
			let r = (decimalColor >> 16) + magnitude;
			r > 255 && (r = 255);
			r < 0 && (r = 0);
			let g = (decimalColor & 0x0000ff) + magnitude;
			g > 255 && (g = 255);
			g < 0 && (g = 0);
			let b = ((decimalColor >> 8) & 0x00ff) + magnitude;
			b > 255 && (b = 255);
			b < 0 && (b = 0);
			return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
		} else {
			return hexColor;
		}
	};

	const shouldShow = (lat, lon) => lat.length > 0 && lon.length > 0 && lat.localeCompare("nan") != 0 && lon.localeCompare("nan") != 0;

	const setMapInvalidator = (map) => {
		const resizeObserver = new ResizeObserver(_ => map.invalidateSize());
		const container = document.getElementById("map-container");
		resizeObserver.observe(container);
	}

	useEffect(_ => {
		if (mapRef && filteredResults.length > 0 && circleMarkersArray.length > 0) {
			mapRef.setMaxBounds(L.featureGroup(circleMarkersArray).getBounds().pad(0.5));
			mapRef.fitBounds(L.featureGroup(circleMarkersArray).getBounds().pad(0.5));
			fetch("municipalities_limits.geojson").then(res => res.json()).then(data => {
				if (geoJsonRef.current) {
					geoJsonRef.current.clearLayers();
					geoJsonRef.current.addData(data);
					geoJsonRef.current.bringToBack();
				}
			});
		}
	}, [mapRef, filteredResults.length]);

	useEffect(_ => {
		Axios.get(ipPortApi + "getCsv/" + fileName)
			.then(response => response.data.message ? enqueueSnackbar("Errore dal server: " + response.data.message, { variant: "error" }) : setParsedCsvData((Papa.parse(response.data, { skipEmptyLines: true })).data.splice(1).filter(parsedData => shouldShow(parsedData[56], parsedData[57]))))
			.catch(error => console.log(error));
		setFilterCompaniesWithSubcategory([]);
		setFilterCompaniesOnlyWith([]);
		setMunicipalitiesAutocompleteValues([]);
		setKeywordsAutocompleteValues([]);
		setUsedFilters({ withSubcategory: false, onlyWith: false, municipalities: false, keywords: false });
		setFilteredResults(parsedCsvData);
	}, [parsedCsvData.length]);

	useEffect(_ => {
		circleMarkersArray = [];
		const municipalities = [];
		parsedCsvData.map(parsedData => {
			if (!municipalities.includes(parsedData[27]))
				municipalities.push(parsedData[27]);
		});
		setMunicipalitiesArray(municipalities.map(m => capitalize(m)).sort());
		const subcategories = [];
		parsedCsvData.map(parsedData => {
			if (!subcategories.includes(parsedData[46]))
				subcategories.push(parsedData[46]);
		});
		setSubcategoriesArray(subcategories.sort());
	}, [parsedCsvData]);

	useEffect(_ => {
		const keywords = [];
		filteredResults.map(parsedData => {
			if (parsedData[63].length > 0)
				parsedData[63].split(", ").map(el => {
					if (words.includes(el)) {
						if (!keywords.some(item => item[0].localeCompare(el) == 0))
							keywords.push([el, 1]);
						else
							++((keywords[keywords.findIndex(elem => elem[0].localeCompare(el) == 0)])[1]);
					}
				});
		});
		setKeywordsArray(keywords.sort((a, b) => b[1] != a[1] ? b[1] - a[1] : capitalize(a[0]).localeCompare(capitalize(b[0]))).map(k => capitalize(k[0]) + " " + "(" + k[1] + ")"));
	}, [filteredResults]);
	useEffect(_ => {
		if (usedFilters.withSubcategory == false && usedFilters.onlyWith == false && usedFilters.municipalities == false && usedFilters.keywords == false)
			setFilteredResults(parsedCsvData);
		else {
			var arrayWithSubcategoryCities = parsedCsvData;
			var arrayOnlyWithCities = parsedCsvData;
			var arrayMunicipalitiesCities = parsedCsvData;
			var arrayKeywordsCities = parsedCsvData;
			if (usedFilters.withSubcategory)
				arrayWithSubcategoryCities = parsedCsvData.filter(parsedData => filterCompaniesWithSubcategory.some(element => parsedData[46].localeCompare(element) == 0));
			if (usedFilters.onlyWith)
				arrayOnlyWithCities = parsedCsvData.filter(parsedData => filterCompaniesOnlyWith.every(element => {
					var val = false;
					switch (element) {
						case onlyWithValues[0]:
							val = parsedData[14];
							break;
						case onlyWithValues[1]:
							val = parsedData[72];
							break;
						case onlyWithValues[2]:
							val = parsedData[60];
							break;
						case onlyWithValues[3]:
							val = parsedData[88] || parsedData[89] || parsedData[90] || parsedData[92] || parsedData[93] || parsedData[94];
							break;
						case onlyWithValues[4]:
							val = parsedData[39];
							break;
						case onlyWithValues[5]:
							val = parsedData[74] && parsedData[74].split(",").length > 1;
							break;
						default:
							val = false;
							break;
					}
					return val;
				}));
			if (usedFilters.municipalities)
				arrayMunicipalitiesCities = parsedCsvData.filter(parsedData => municipalitiesAutocompleteValues.some(element => capitalize(parsedData[27]).localeCompare(element) == 0));
			if (usedFilters.keywords)
				arrayKeywordsCities = parsedCsvData.filter(parsedData => keywordsAutocompleteValues.some(element => { if (parsedData[63].length > 0) { return parsedData[63].split(", ").map(e => capitalize(e)).includes(element) } }));
			setFilteredResults(intersect([arrayWithSubcategoryCities, arrayOnlyWithCities, arrayMunicipalitiesCities, arrayKeywordsCities]));
		}
	}, [filterCompaniesWithSubcategory, filterCompaniesOnlyWith, municipalitiesAutocompleteValues, keywordsAutocompleteValues]);

	return (
		<>
			<FiltersDrawerComp
				drawerButtons={
					<>
						{subcategoriesArray.length > 1 &&
							<>
								<Typography variant="h3">
									Ateco (Sottocategorie)
								</Typography>
								<ToggleButtonGroup value={filterCompaniesWithSubcategory} onChange={handleFilterCompaniesWithSubcategory} orientation={"vertical"}>
									{
										subcategoriesArray.map((subcategory, index) =>
											<ToggleButton
												key={index}
												selected={filterCompaniesWithSubcategory.some(x => x == subcategory)}
												value={subcategory}
												sx={{
													"&.MuiToggleButtonGroup-grouped": {
														m: "8px 8px 8px 0px",
														p: "6px 12px 6px 0px",
														border: "0px !important"
													},
													"& .circleIcon": {
														color: colorsArray[subcategoriesArray.indexOf(subcategory)],
														"& path": {
															transform: "scale(2)",
															transformOrigin: "50% 50%"
														}
													},
													"&:hover": {
														"& .circleIcon": {
															color: newShade(colorsArray[subcategoriesArray.indexOf(subcategory)], 20)
														}
													},
													"&.Mui-selected": {
														"& .circleIcon path": {
															stroke: bluCamposampierese,
															strokeWidth: "4px",
															transform: "scale(1.2)",
															transformOrigin: "50% 50%"
														}
													},
													justifyContent: "flex-start",
													textAlign: "left",
													textTransform: "none"
												}}>
												<CircleIcon className="circleIcon" style={{ fontSize: "1rem", marginRight: "0.75rem", boxShadow: "0px 1px 5px " + bluCamposampierese, borderRadius: "50%" }} />
												<Typography variant="sottocategoria">{subcategory}</Typography>
											</ToggleButton>
										)
									}
								</ToggleButtonGroup>
							</>
						}
						<Typography variant="h3">
							Filtra per parole chiave
						</Typography>
						<StyledAutocomplete
							disablePortal
							multiple
							value={keywordsAutocompleteValues}
							options={keywordsArray}
							getOptionDisabled={checkDisableKeywords}
							isOptionEqualToValue={(option) => keywordsAutocompleteValues.includes(option.lastIndexOf(" (") != - 1 ? option.substring(0, option.lastIndexOf(" (")) : option)}
							onChange={(event, values, reason) => {
								setKeywordsAutocompleteValues(values.map(val => val.lastIndexOf(" (") != - 1 ? val.substring(0, val.lastIndexOf(" (")) : val));
								setKeywordsLimitReached(values.length >= limit);
								if (reason.localeCompare("clear") == 0 || values.length == 0)
									setUsedFilters(usedFilters => ({ ...usedFilters, keywords: false }));
								else
									setUsedFilters(usedFilters => ({ ...usedFilters, keywords: true }));
							}}
							renderInput={params => (
								<TextField {...params} variant="standard" label="Parola chiave" placeholder="Cerca" />
							)}
						/>
						<TagCloud
							minSize={10}
							maxSize={26}
							tags={
								keywordsArray.slice(0, 15).map((el, index) => (
									{
										"value": (el.lastIndexOf(" (") != - 1 ? el.substring(0, el.lastIndexOf(" (")) : el),
										"count": el.lastIndexOf(" (") != - 1 ? el.substring(el.lastIndexOf(" (") + 2, el.lastIndexOf(")")) : 0,
										"key": index,
										"color": bluCamposampierese
									}
								))
							}
							disableRandomColor={true}
							style={{ fontFamily: "Graphik", marginTop: "40px", width: lg ? "85%" : "100%", textAlign: "center" }}
						/>
						<Typography variant="h3">
							Filtra per comune
						</Typography>
						<StyledAutocomplete
							disablePortal
							multiple
							value={municipalitiesAutocompleteValues}
							options={municipalitiesArray}
							getOptionDisabled={checkDisableMunicipalities}
							onChange={(event, values, reason) => {
								setMunicipalitiesAutocompleteValues(values);
								setMunicipalitiesLimitReached(values.length >= limit);
								if (reason.localeCompare("clear") == 0 || values.length == 0)
									setUsedFilters(usedFilters => ({ ...usedFilters, municipalities: false }));
								else
									setUsedFilters(usedFilters => ({ ...usedFilters, municipalities: true }));
							}}
							renderInput={params => (
								<TextField {...params} variant="standard" label="Comune" placeholder="Cerca" />
							)}
						/>
						<Typography variant="h3">
							Seleziona aziende solo con
						</Typography>
						<ToggleButtonGroup value={filterCompaniesOnlyWith} onChange={handleFilterCompaniesOnlyWith} style={{ flexWrap: "wrap" }}>
							{
								onlyWithValues.map((item, index) =>
									<ToggleButton
										key={index}
										selected={filterCompaniesOnlyWith.some(x => x == item)}
										value={item}
										sx={{
											"&.MuiToggleButtonGroup-grouped": {
												background: "#FFFFFF",
												borderRadius: "4px !important",
												m: 1,
												border: "1px solid " + bluCamposampierese + " !important",
												boxShadow: "0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px rgba(0, 0, 0, 0.14), 0px 1px 5px rgba(0, 0, 0, 0.12)",
												height: "30px",
												"&:hover": {
													backgroundColor: "#F8F8F8"
												},
												"&.Mui-selected": {
													backgroundColor: bluCamposampierese
												},
												marginLeft: "0px"
											}
										}}>
										<Typography variant={filterCompaniesOnlyWith.some(x => x == item) ? "soloConClicked" : "soloCon"}>{item}</Typography>
									</ToggleButton>
								)
							}
						</ToggleButtonGroup>
						<Typography variant="h3">
							Scarica .csv dati
						</Typography>
						<FileDownloadButtonComp fileName={fileName} />
						<Typography>
							<Link component="button" variant="infoText" onClick={_ => history("/informativaDati")} sx={{pb: 4}}>Informativa dati</Link>
						</Typography>
					</>
				}
				bodyProp={
					<>
						{parsedCsvData.length > 0 &&
							<>
								<Box style={{ width: "100%", height: lg ? "88%" : "100%", display: "flex", justifyContent: lg ? "flex-end" : "center", alignItems: lg ? "flex-end" : "center" }}>
									<Box style={{ display: "grid", gridTemplateColumns: "1fr", width: lg ? "96%" : "100%", height: lg ? "98%" : "100%" }}>
										<Box style={{ width: "100%", height: "100%", gridRowStart: "1", gridColumnStart: "1" }}>
											<MapContainer id="map-container" renderer={L.canvas({ tolerance: 15 })} whenCreated={instance => { setMapRef(instance); setMapInvalidator(instance) }}
												minZoom={defaultZoom} maxZoom={18} zoomDelta={.5} zoomSnap={.5} maxBoundsViscosity={0.75} zoom={defaultZoom}
												style={{ width: "100%", height: "100%", border: "1px solid " + bluCamposampierese }}>
												<TileLayer
													attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a target="_blank" rel="noopener" href="https://www.mapbox.com/map-feedback/">Improve this map</a></strong>'
													url={"https://api.mapbox.com/styles/v1/jacopo-trabona/cl5m8mcu8009314pvle8nc3r2/tiles/256/{z}/{x}/{y}@2x?&access_token=" + accessToken}
												/>
												<GeoJSON
													ref={geoJsonRef}
													attribution="Municipalities Limits"
													style={{ fill: false, weight: 2, color: bluCamposampierese, opacity: 0.2 }}
												/>
												<MapConsumer>
													{map => {
														map.on("click", _ => {
															setLastClickedCircleMarker(-1);
															setUsingParsedData([]);
															setShowDrawer(false);
														});
														return null;
													}}
												</MapConsumer>
												<ScaleControl position="bottomleft" />
												{filteredResults.map((parsedData, index) =>
													<CircleMarker center={[roundCoord(parsedData[56]), roundCoord(parsedData[57])]} key={index}
														whenCreated={circleMarkersArray.push(L.circleMarker([roundCoord(parsedData[56]), roundCoord(parsedData[57])]))}
														eventHandlers={{
															click: e => {
																setLastClickedCircleMarker(index);
																setUsingParsedData(filteredResults.filter(result => roundCoord(result[56]) == roundCoord(parsedData[56]) && roundCoord(result[57]) == roundCoord(parsedData[57])));
																setShowDrawer(!lg);
																setShowFilters(!lg);
																setTriggerOpen(!triggerOpen);
																L.DomEvent.stopPropagation(e);
															}
														}}
														color={yellow}
														fillOpacity={0.75}
														pathOptions={{
															stroke: index == lastClickedCircleMarker ? true : false,
															fillColor: colorsArray[subcategoriesArray.indexOf(parsedData[46])],
															radius: 8
														}}
													/>
												)}
											</MapContainer>
										</Box>
										<Box style={{ pointerEvents: "none", width: "100%", height: "100%", gridRowStart: "1", gridColumnStart: "1", boxShadow: "inset 0px 2px 2px #D0D0E7, inset 2px 2px 2px #D0D0E7", zIndex: "1001" }} />
									</Box>
								</Box>
								{lg && <Box style={{ width: "100%", height: "12%", display: "flex", justifyContent: "flex-end", alignItems: "center", background: "linear-gradient(0deg, #F0F0FC 0%, #FFFFFF 100%)" }}>
									<Box style={{ width: "96%" }} pr="10%">
										<FooterComp />
									</Box>
								</Box>
								}
								{showDrawer && <BottomDrawerComp setShowDrawer={setShowDrawer} title={usingParsedData.length > 1 ? "Informazioni aziende" : (usingParsedData[0])[18]} dataToShow={<CompanyInfoComp parsedData={usingParsedData} />} />}
							</>
						}
					</>
				}
				info={
					<>
						{usingParsedData.length > 0 ?
							<Box marginTop={"40px"}>
								{<CompanyInfoComp parsedData={usingParsedData} />}
							</Box> :
							<Typography variant="h3">
								Seleziona un marcatore della mappa per vedere le informazioni della rispettiva azienda
							</Typography>
						}
					</>
				}
				showFilters={showFilters}
				setShowFilters={setShowFilters}
				triggerOpen={triggerOpen}
				appTitle={appTitle}
			/>
		</>
	);
}