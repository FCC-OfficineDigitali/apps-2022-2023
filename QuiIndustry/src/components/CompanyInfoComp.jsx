import React from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";

export default function CompanyInfoComp(props) {
    const bluCamposampierese = "#00009C";
    const iconGrey = "#727272";

    const capitalize = str => str.toLowerCase().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

    const singleTextData = (parsedData, title, index) =>
        parsedData[index] &&
        <Box>
            <Typography variant="subheading">
                {title}
            </Typography>
            <br />
            <Typography variant="paragraph2">
                {parsedData[index]}
            </Typography>
            <br />
        </Box>;

    const showCompanyName = (companyName) =>
        <>
            {companyName &&
                <Typography variant="denominazione">
                    {companyName}
                </Typography>
            }
        </>;

    const showData = (company) =>
        <>
            <Box sx={{
                "& .MuiBox-root": {
                    breakInside: "avoid",
                    margin: "0"
                },
                margin: "20px 0px"
            }}>
                {company[65] &&
                    <Box maxHeight="46.8px">
                        <Box
                            component="img"
                            src={company[65]}
                            height="100%"
                            maxHeight="38.8px"
                            width="auto"
                            m="0rem 0.25rem"
                            title={"logo " + company[18]}
                            alt={"logo " + company[18]}
                        />
                    </Box>
                }
                {company[27] &&
                    <Box>
                        <Typography variant="subheading">
                            Comune
                        </Typography>
                        <br />
                        <Typography variant="paragraph2">
                            {capitalize(company[27])}
                        </Typography>
                        <br />
                    </Box>
                }
                {company[60] &&
                    <Box>
                        <Typography variant="subheading">
                            Sito Web
                        </Typography>
                        <br />
                        <Typography variant="paragraph2">
                            {<a title="Sito Web" href={company[60]} style={{ color: "#151515" }} target="_blank" rel="noopener noreferrer">{company[60]}</a>}
                        </Typography>
                        <br />
                    </Box>
                }
            </Box>
            <Divider style={{ background: "#171717" }} />
            <Box sx={{
                "& .MuiBox-root": {
                    breakInside: "avoid",
                    margin: "0.5rem 0.25rem"
                }
            }}>
                {singleTextData(company, "ATECO", 44)}
                {singleTextData(company, "Data iscrizione", 15)}
                {singleTextData(company, "Partita IVA", 5)}
                {company[63] &&
                    <Box>
                        <Typography variant="subheading">
                            Keys
                        </Typography>
                        <br />
                        <Typography variant="paragraph2" title={company[63].split(",").map(word => word.charAt(0) != " " ? capitalize(word) : word.charAt(0) + capitalize(word.slice(1))).join(",")}>
                            {company[63].split(",").slice(0, 10).map(word => word.charAt(0) != " " ? capitalize(word) : word.charAt(0) + capitalize(word.slice(1))).join(",") + (company[63].split(",").length > 3 ? "..." : "")}
                        </Typography>
                        <br />
                    </Box>
                }
                {company[12] &&
                    <Box>
                        <Typography variant="subheading">
                            Forma Giuridica
                        </Typography>
                        <br />
                        <Typography variant="paragraph2">
                            {company[12].charAt(0).toUpperCase() + company[12].slice(1).toLowerCase()}
                        </Typography>
                        <br />
                    </Box>
                }
                {singleTextData(company, "Numero dipendenti", 38)}
                {company[42] &&
                    <Box>
                        <Typography variant="subheading">
                            Attività Dichiarata
                        </Typography>
                        <br />
                        <Typography variant="paragraph2" title={company[42].charAt(0).toUpperCase() + company[42].slice(1).toLowerCase()}>
                            {(company[42].charAt(0).toUpperCase() + company[42].slice(1).toLowerCase()).slice(0, 128) + (company[42].length > 128 ? "..." : "")}
                        </Typography>
                        <br />
                    </Box>
                }
                {company[74] &&
                    <Box>
                        <Typography variant="subheading">
                            Lingue Sito Web
                        </Typography>
                        <br />
                        <Typography variant="paragraph2">
                            {company[74].toUpperCase().split(";").join(",")}
                        </Typography>
                        <br />
                    </Box>
                }
                {company[14] &&
                    <Box>
                        <Typography variant="subheading">
                            Email
                        </Typography>
                        <br />
                        <Typography variant="paragraph2">
                            {company[14].toLowerCase()}
                        </Typography>
                        <br />
                    </Box>
                }
                <Box>
                    <Typography variant="subheading">
                        Social Media
                    </Typography>
                    <br />
                    <Box display="block">
                        {company[88] ?
                            <a title="Social Media (Facebook)" href={company[88]} target="_blank" rel="noopener noreferrer">
                                <FacebookIcon style={{ marginRight: "0.75rem", color: bluCamposampierese }} />
                            </a> :
                            <FacebookIcon style={{ marginRight: "0.75rem", color: iconGrey }} />
                        }

                        {company[90] ?
                            <a title="Social Media (LinkedIn)" href={company[90]} target="_blank" rel="noopener noreferrer">
                                <LinkedInIcon style={{ marginRight: "0.75rem", color: bluCamposampierese }} />
                            </a> :
                            <LinkedInIcon style={{ marginRight: "0.75rem", color: iconGrey }} />
                        }

                        {company[89] ?
                            <a title="Social Media (Twitter)" href={company[89]} target="_blank" rel="noopener noreferrer">
                                <TwitterIcon style={{ marginRight: "0.75rem", color: bluCamposampierese }} />
                            </a> :
                            <TwitterIcon style={{ marginRight: "0.75rem", color: iconGrey }} />
                        }

                        {company[92] ?
                            <a title="Social Media (YouTube)" href={company[92]} target="_blank" rel="noopener noreferrer">
                                <YouTubeIcon style={{ marginRight: "0.75rem", color: bluCamposampierese }} />
                            </a> :
                            <YouTubeIcon style={{ marginRight: "0.75rem", color: iconGrey }} />
                        }

                        {company[94] ?
                            <a title="Social Media (Instagram)" href={company[94]} target="_blank" rel="noopener noreferrer">
                                <InstagramIcon style={{ marginRight: "0.75rem", color: bluCamposampierese }} />
                            </a> :
                            <InstagramIcon style={{ marginRight: "0.75rem", color: iconGrey }} />
                        }

                        {company[93] ?
                            <a title="Social Media (Pinterest)" href={company[93]} target="_blank" rel="noopener noreferrer">
                                <PinterestIcon style={{ marginRight: "0.75rem", color: bluCamposampierese }} />
                            </a> :
                            <PinterestIcon style={{ marginRight: "0.75rem", color: iconGrey }} />
                        }
                    </Box>
                </Box>
                {company[55] &&
                    <Box>
                        <Typography variant="subheading">
                            Indirizzo
                        </Typography>
                        <br />
                        <Typography variant="paragraph2">
                            {[capitalize(company[55].split(",")[0]), (company[55].split(",")[1]).toUpperCase(), ((capitalize(company[55].split(",")[2])).substring(0, ((company[55].split(",")[2]).length) - 1) + company[55].split(",")[2].substr(-1))].join(",")}
                        </Typography>
                        <br />
                    </Box>
                }
                {singleTextData(company, "CAP", 24)}
                {company[6] &&
                    <Box>
                        <Typography variant="subheading">
                            Tipologia Sede
                        </Typography>
                        <br />
                        <Typography variant="paragraph2">
                            {company[6].localeCompare("UL") == 0 ? "Unità locale" : "Sede principale"}
                        </Typography>
                        <br />
                    </Box>
                }
            </Box>
        </>

    return (
        <>
            {
                props.parsedData.map((company, index) =>
                    <Accordion key={company[0] + "-" + index} disableGutters={true} defaultExpanded={props.parsedData.length == 1 && index == 0}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={"panel-" + company[0] + "-" + index + "-content"}
                            id={"panel-" + company[0] + "-" + index + "-header"}
                        >
                            {showCompanyName(company[18])}
                        </AccordionSummary>
                        <AccordionDetails>
                            {showData(company)}
                        </AccordionDetails>
                    </Accordion>
                )
            }
        </>
    );
}