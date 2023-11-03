import React, { Fragment, useRef, useState } from "react";
import {
    Box,
    Tabs,
    useTheme
} from "@mui/material";
import { BarChart, Done, Schedule } from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import moment from "moment";
import { useSnackbar } from "notistack";
import AppBarComp from "../components/AppBarComp";
import FooterComp from "../components/FooterComp";
import { LargerThanLg, LargerThanSm } from "../MediaQueries";
import { StyledTab } from "../styles";
import WaitingReservationsComp from "../components/WaitingReservationsComp";
import ConfirmedReservationsComp from "../components/ConfirmedReservationsComp";
import OccupancyComp from "../components/OccupancyComp";

export default function Home() {
    const theme = useTheme();
    const [tab, setTab] = useState(0);
    const { enqueueSnackbar } = useSnackbar();
    const { token } = useAuth();
    const lg = LargerThanLg();
    const sm = LargerThanSm();
    const appBarRef = useRef();
    const tabsRef = useRef();
    const footerRef = useRef();

    const addEpoch = time => "1970-01-01T" + time;

    const capitalize = str => str.toLowerCase().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

    const groupData = data => {
        return Object.values(data.reduce((acc, obj) => {
            const { slot_day, room_id, account_id } = obj;
            if (!acc[slot_day])
                acc[slot_day] = {};
            if (!acc[slot_day][room_id])
                acc[slot_day][room_id] = {};
            if (!acc[slot_day][room_id][account_id])
                acc[slot_day][room_id][account_id] = [];
            acc[slot_day][room_id][account_id].push(obj);
            return acc;
        }, {}));
    }

    const mergeSlots = arr => {
        var groupedArr = [];

        var tempObj = {};

        arr.forEach(obj => {
            var key = obj.account_id + "_" + obj.room_id + "_" + obj.slot_day + "_" + obj.request_datetime;

            if (tempObj[key]) {
                tempObj[key].slot_id.push(obj.slot_id);
                tempObj[key].slot_start_time.push(obj.slot_start_time);
                tempObj[key].slot_end_time.push(obj.slot_end_time);
            }
            else {
                tempObj[key] = {
                    slot_id: [obj.slot_id],
                    slot_start_time: [obj.slot_start_time],
                    slot_end_time: [obj.slot_end_time],
                    slot_day: obj.slot_day,
                    room_id: obj.room_id,
                    room_name: obj.room_name,
                    room_name_updatable: obj.room_name_updatable,
                    room_type: obj.room_type,
                    room_description: obj.room_description,
                    account_id: obj.account_id,
                    name: obj.name,
                    surname: obj.surname,
                    mail: obj.mail,
                    participants_nr: obj.participants_nr,
                    topic: obj.topic,
                    needs_technical_assistance: obj.needs_technical_assistance,
                    request_datetime: obj.request_datetime
                };
            }
        });

        for (var key in tempObj)
            if (tempObj.hasOwnProperty(key))
                groupedArr.push(tempObj[key]);
        return groupedArr;
    };

    const mergeTimeIntervals = (obj) => {
        const timeIntervals = obj.slot_id.map((_, i) => [
            moment(addEpoch(obj.slot_start_time[i])).format(sm ? "HH:mm" : "HH"),
            moment(addEpoch(obj.slot_end_time[i])).format(sm ? "HH:mm" : "HH")
        ]);

        const unitedIntervals = [];

        const intervalToBox = (startTime, endTime) => (
            sm ?
                <Box key={startTime + "-" + endTime}>
                    {startTime + "-" + endTime + "; "}
                </Box>
                :
                <Fragment key={startTime + "-" + endTime}>
                    {startTime + "-" + endTime + "; "}
                </Fragment>
        );

        let currentInterval = timeIntervals[0];
        let startTime = currentInterval[0];
        let endTime = currentInterval[1];

        for (let i = 1; i < timeIntervals.length; i++) {
            const interval = timeIntervals[i];
            const intervalStartTime = interval[0];
            const intervalEndTime = interval[1];

            if (intervalStartTime <= endTime)
                endTime = intervalEndTime;
            else {
                unitedIntervals.push(intervalToBox(startTime, endTime));
                startTime = intervalStartTime;
                endTime = intervalEndTime;
            }
        }

        unitedIntervals.push(intervalToBox(startTime, endTime));

        return sm ? <Box>{unitedIntervals}</Box> : <>{unitedIntervals}</>;
    };

    return (
        <>
            <Box style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
                <div ref={appBarRef}>
                    <AppBarComp />
                </div>
                <Box style={{ padding: "24px 8%" + (!sm ? "72px" : "") }}>
                    <div ref={tabsRef}>
                        <Box my={sm ? 4 : 1}>
                            <Tabs value={tab} onChange={(event, value) => setTab(value)} variant="fullWidth" sx={{ borderRadius: "4px" }} TabIndicatorProps={{ sx: { backgroundColor: tab === 0 ? theme.palette.primary.selectedOrange : (tab === 1 ? theme.palette.primary.selectedGreen : theme.palette.primary.mainLight) } }}>
                                {[0, 1, 2].map((_, index) =>
                                    <StyledTab
                                        icon={index === 0 ? <Schedule /> : (index === 1 ? <Done /> : <BarChart />)}
                                        label={sm ? (index === 0 ? "Prenotazioni in attesa" : (index === 1 ? "Prenotazioni confermate" : "Occupazione")) : ""}
                                        value={index} key={index}
                                        sx={{
                                            color: index === 0 ? theme.palette.primary.orange : (index === 1 ? theme.palette.primary.green : theme.palette.primary.main),
                                            "&.Mui-selected": {
                                                color: index === 0 ? theme.palette.primary.selectedOrange : (index === 1 ? theme.palette.primary.selectedGreen : theme.palette.primary.mainLight)
                                            }
                                        }}
                                    />)}
                            </Tabs>
                        </Box>
                    </div>
                    {
                        tab === 0 ?
                            <WaitingReservationsComp capitalize={capitalize} enqueueSnackbar={enqueueSnackbar} groupData={groupData} lg={lg} mergeSlots={mergeSlots} mergeTimeIntervals={mergeTimeIntervals} moment={moment} sm={sm} theme={theme} token={token} />
                            :
                            (tab === 1 ?
                                <ConfirmedReservationsComp capitalize={capitalize} enqueueSnackbar={enqueueSnackbar} groupData={groupData} mergeSlots={mergeSlots} mergeTimeIntervals={mergeTimeIntervals} moment={moment} sm={sm} theme={theme} token={token} />
                                :
                                <OccupancyComp enqueueSnackbar={enqueueSnackbar} moment={moment} sm={sm} theme={theme} token={token} appBarRef={appBarRef} tabsRef={tabsRef} footerRef={footerRef} />
                            )
                    }
                </Box>
                {sm &&
                    <Box style={{ marginTop: "auto" }} ref={footerRef}>
                        <FooterComp />
                    </Box>
                }
            </Box>
        </>
    );
}