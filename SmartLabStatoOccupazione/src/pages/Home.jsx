import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    IconButton,
    Typography,
    useTheme
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { useAuth } from "../hooks/useAuth";
import ipPortApi from "../ipPortApi";
import Axios from "axios";
import { useSnackbar } from "notistack";
import { Chart as ChartJS } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";
import AppBarComp from "../components/AppBarComp";
import FooterComp from "../components/FooterComp";
import { LargerThanLg, LargerThanSm } from "../MediaQueries";

ChartJS.defaults.font.family = "Graphik";
ChartJS.register(ChartDataLabels);

export default function Home() {
    const roomType = ["conference", "smart working", "call"];
    const theme = useTheme();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [roomsData, setRoomsData] = useState([]);
    const [conferenceRooms, setConferenceRooms] = useState([]);
    const [smartWorkingRooms, setSmartWorkingRooms] = useState([]);
    const [callRooms, setCallRooms] = useState([]);
    const [usefulRooms, setUsefulRooms] = useState(0);
    const [updateToggle, setUpdateToggle] = useState(false);
    const [time, setTime] = useState(new Date());
    const { enqueueSnackbar } = useSnackbar();
    const appBarRef = useRef();
    const clockRef = useRef();
    const footerRef = useRef();
    const { token } = useAuth();
    const lg = LargerThanLg();
    const sm = LargerThanSm();

    const handleFullScreen = _ => {
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
            if (document.exitFullscreen)
                document.exitFullscreen();
            else if (document.webkitExitFullscreen)
                document.webkitExitFullscreen();
            else if (document.msExitFullscreen)
                document.msExitFullscreen();
        }
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
            if (document.documentElement.requestFullscreen)
                document.documentElement.requestFullscreen();
            else if (document.documentElement.webkitRequestFullscreen)
                document.documentElement.webkitRequestFullscreen();
            else if (document.documentElement.msRequestFullscreen)
                document.documentElement.msRequestFullscreen();
        }
    };

    const getGradient = (ctx, chartArea, zeroColorStop, nrOfBars) => {
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        for (var i = 0; i < nrOfBars; ++i) {
            gradient.addColorStop(i / nrOfBars, zeroColorStop);
            gradient.addColorStop((i + 1) / nrOfBars, zeroColorStop + "77");
        }
        return gradient;
    };

    setInterval(_ => {
        const now = new Date();
        if (now.getMinutes() === 1 || now.getMinutes() === 31)
            setUpdateToggle(!updateToggle);
    }, 6000);

    useEffect(_ => {
        const prefixes = ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "msfullscreenchange"];

        const handleFullscreenCB = _ => {
            setIsFullScreen(window.innerHeight === window.screen.height || !!document.fullscreenElement || !!document.webkitFullscreenElement || !!document.mozFullScreenElement || !!document.msFullscreenElement);
        };

        prefixes.map(el => document.addEventListener(el, handleFullscreenCB));
        window.addEventListener("resize", handleFullscreenCB);

        return _ => {
            prefixes.map(el => document.removeEventListener(el, handleFullscreenCB));
            window.removeEventListener("resize", handleFullscreenCB);
        };
    }, []);

    useEffect(_ => {
        Axios.get(ipPortApi + "getOccupancy/" + token)
            .then(data => {
                if (data.data.message) {
                    enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                    setRoomsData([]);
                }
                else
                    data.data.length > 0 ? setRoomsData(data.data) : setRoomsData([]);
            })
            .catch(error => { setRoomsData([]); console.log(error); });
    }, [updateToggle]);

    useEffect(_ => {
        if (roomsData && roomsData.length > 0) {
            setConferenceRooms(roomsData.filter(data => data.room_type.localeCompare(roomType[0]) === 0));

            [1, 2].map(typeIndex => {
                const typeRooms = roomsData.filter(data => data.room_type.localeCompare(roomType[typeIndex]) === 0);
                const counts = [];
                for (var i = 0; i < typeRooms.length; ++i) {
                    const room = typeRooms[i];
                    if (!counts[room.room_name])
                        counts[room.room_name] = [];
                    counts[room.room_name]["seats_nr"] = room.seats_nr;
                    counts[room.room_name]["room_name_updatable"] = room.room_name_updatable;
                    if (room.account_id !== null || room.coworker_id !== null)
                        counts[room.room_name]["reserved_seats_nr"] = (counts[room.room_name]["reserved_seats_nr"] || 0) + 1;
                }
                if (typeIndex === 1)
                    setSmartWorkingRooms(counts);
                else
                    setCallRooms(counts);
            });
        }
        else {
            setConferenceRooms([]);
            setSmartWorkingRooms([]);
            setCallRooms([]);
        }
    }, [roomsData]);

    useEffect(_ => setUsefulRooms((conferenceRooms.length > 0 ? 1 : 0) + (Object.keys(smartWorkingRooms).length > 0 ? 1 : 0) + (Object.keys(callRooms).length > 0 ? 1 : 0)), [conferenceRooms, smartWorkingRooms, callRooms]);

    useEffect(_ => {
        const interval = setInterval(_ => setTime(new Date()), 1000);
        return _ => clearInterval(interval);
    }, []);

    return (
        <>
            <Box style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
                <div ref={appBarRef}>
                    {(!sm || !isFullScreen) && <AppBarComp />}
                </div>
                <Box padding={isFullScreen ? 4 : "24px 8%"} display="flex" justifyContent="space-between" alignItems={sm ? "flex-end" : "center"} ref={clockRef}>
                    <Typography variant="h1Clock" fontSize={sm ? 48 : 24}>{time.toLocaleDateString()}</Typography>
                    <Typography variant="h1Clock" fontSize={sm ? 48 : 24}>{time.toLocaleTimeString()}</Typography>
                </Box>
                <Box style={{ padding: "24px 8%", height: `calc(100vh - ${appBarRef.current?.clientHeight}px - ${clockRef.current?.clientHeight}px - ${footerRef.current?.clientHeight}px)` }}>
                    {
                        [conferenceRooms.length > 0, ...[smartWorkingRooms, callRooms].map(arrRooms => (Object.keys(arrRooms).length > 0))].some(e => e)
                            ?
                            [
                                {
                                    show: conferenceRooms.length > 0,
                                    labels: conferenceRooms.map(r => r.room_name_updatable),
                                    freeLabel: "Posti inutilizzati",
                                    freeData: conferenceRooms.map(r => r.seats_nr - (r.account_id && r.is_allowed >= 0 ? r.seats_nr : 0)),
                                    reservedLabel: "Posti occupati",
                                    reservedData: conferenceRooms.map(r => (r.account_id && r.is_allowed >= 0 ? r.seats_nr : 0)),
                                    maxVal: Math.max(...conferenceRooms.map(r => r.seats_nr))
                                },
                                ...[smartWorkingRooms, callRooms].map(arrRooms => (
                                    {
                                        show: Object.keys(arrRooms).length > 0,
                                        labels: Object.keys(arrRooms).map(k => arrRooms[k].room_name_updatable),
                                        freeLabel: "Posti disponibili",
                                        freeData: Object.keys(arrRooms).map(r => arrRooms[r].seats_nr - (arrRooms[r].reserved_seats_nr ?? 0)),
                                        reservedLabel: "Posti occupati",
                                        reservedData: Object.keys(arrRooms).map(r => arrRooms[r].reserved_seats_nr),
                                        maxVal: Math.max(...Object.keys(arrRooms).map(r => arrRooms[r].seats_nr))
                                    }
                                ))
                            ].map((el, index) =>
                                el.show &&
                                <Box style={{ height: `calc(100% / ` + usefulRooms + `)` }} key={index}>
                                    <Bar
                                        data={
                                            {
                                                labels: el.labels,
                                                datasets: [
                                                    {
                                                        label: el.freeLabel,
                                                        backgroundColor: context => {
                                                            const chart = context.chart;
                                                            const { ctx, chartArea } = chart;
                                                            if (!chartArea)
                                                                return null;
                                                            else
                                                                return getGradient(ctx, chartArea, "#43A047", el.labels.length);
                                                        },
                                                        data: el.freeData,
                                                        order: 2
                                                    },
                                                    {
                                                        label: el.reservedLabel,
                                                        backgroundColor: context => {
                                                            const chart = context.chart;
                                                            const { ctx, chartArea } = chart;
                                                            if (!chartArea)
                                                                return null;
                                                            else
                                                                return getGradient(ctx, chartArea, "#D32F2F", el.labels.length);
                                                        },
                                                        data: el.reservedData,
                                                        order: 1
                                                    }
                                                ]
                                            }
                                        }
                                        options={
                                            {
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                indexAxis: "y",
                                                scales: {
                                                    x: {
                                                        display: false,
                                                        stacked: true,
                                                        beginAtZero: true,
                                                        max: el.maxVal,
                                                        grid: {
                                                            display: false
                                                        },
                                                        ticks: { callback: function (value) { if (value % 1 === 0) { return value; } } }
                                                    },
                                                    y: {
                                                        stacked: true,
                                                        grid: {
                                                            display: false
                                                        },
                                                        border: {
                                                            color: theme.palette.primary.main + "44"
                                                        },
                                                        ticks: {
                                                            autoSkip: false,
                                                            font: {
                                                                size: (sm ? 24 : 12) * window.innerHeight * 0.001,
                                                                weight: "bold"
                                                            },
                                                            color: theme.palette.primary.main,
                                                        },
                                                        afterFit(scale) {
                                                            scale.width = (sm ? 32 : 16) * window.innerHeight * 0.01
                                                        }
                                                    }
                                                },
                                                plugins: {
                                                    legend: {
                                                        display: false
                                                    },
                                                    datalabels: {
                                                        display: index !== 0,
                                                        font: {
                                                            size: (sm ? 24 : 12) * window.innerHeight * 0.001,
                                                        },
                                                        color: theme.palette.primary.white,
                                                        formatter: val => (val > 0 ? val : "")
                                                    }
                                                },
                                                maxBarThickness: 50
                                            }
                                        }
                                    />
                                </Box>
                            )
                            :
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                <Typography variant="h5" textAlign="center">
                                    Nessuno slot presente per l'orario attuale.
                                </Typography>
                            </Box>
                    }
                </Box>
                <Box style={{ marginTop: "auto" }} ref={footerRef}>
                    {sm &&
                        <Box padding={isFullScreen ? 4 : "24px 8%"} display="flex" justifyContent="flex-end" alignItems="flex-end">
                            <IconButton onClick={handleFullScreen} style={{ padding: 0 }}>
                                {isFullScreen ?
                                    <FullscreenExitIcon style={{ color: theme.palette.primary.main }} />
                                    :
                                    <FullscreenIcon style={{ color: theme.palette.primary.main }} />
                                }
                            </IconButton>
                        </Box>
                    }
                    {lg && !isFullScreen &&
                        <Box>
                            <FooterComp />
                        </Box>
                    }
                </Box>
            </Box>
        </>
    );
}