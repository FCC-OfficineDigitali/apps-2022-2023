import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { LargerThanSm } from "../MediaQueries";
import GymsTab from "./GymsTab";
import FacilitatoriTab from "./FacilitatoriTab";
import OperatoriTab from "./OperatoriTab";

export default function TabsComp() {
    const [tab, setTab] = useState(0);
    const sm = LargerThanSm();

    return (
        <>
            <Tabs value={tab} onChange={(event, value) => setTab(value)} variant="fullWidth" style={{ padding: sm ? "0 8%" : "0" }}>
                {[0, 1, 2].map(element =>
                    <Tab label={element === 0 ? "Palestre" : (element === 1 ? "Facilitatori" : "Operatori")} value={element} key={element} style={{ fontWeight: "bold" }} />
                )}
            </Tabs>
            <Box mt={3} mb={10} px={sm ? "8%" : 0}>
                {
                    tab === 0 ?
                        <GymsTab />
                        :
                        (
                            tab === 1 ?
                                <FacilitatoriTab />
                                :
                                <OperatoriTab />
                        )
                }
            </Box>
        </>
    );
}
