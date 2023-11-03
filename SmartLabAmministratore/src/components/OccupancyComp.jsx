import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Typography
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import ipPortApi from "../ipPortApi";
import Axios from "axios";
import { Chart as ChartJS } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";

ChartJS.defaults.font.family = "Graphik";
ChartJS.register(ChartDataLabels);

export default function OccupancyComp(props) {
    const roomType = ["conference", "smart working", "call"];
    const [roomsData, setRoomsData] = useState([]);
    const [conferenceRooms, setConferenceRooms] = useState([]);
    const [smartWorkingRooms, setSmartWorkingRooms] = useState([]);
    const [callRooms, setCallRooms] = useState([]);
    const [selectedDateTime, setSelectedDateTime] = useState(props.moment().format("YYYY-MM-DD HH:00:00"));
    const [compsBoxHeight, setCompsBoxHeight] = useState(0);
    const heightThreshold = 32;
    const dtRef = useRef();

    const handleResize = _ => {
        setCompsBoxHeight(window.innerHeight - 112 - props.appBarRef.current?.clientHeight - props.tabsRef.current?.clientHeight - dtRef.current?.clientHeight - (props.footerRef.current?.clientHeight || 0));
    };

    const getGradient = (ctx, chartArea, zeroColorStop, nrOfBars) => {
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        for (var i = 0; i < nrOfBars; ++i) {
            gradient.addColorStop(i / nrOfBars, zeroColorStop);
            gradient.addColorStop((i + 1) / nrOfBars, zeroColorStop + "77");
        }
        return gradient;
    };

    useEffect(_ => {
        window.addEventListener("resize", handleResize);
        handleResize();

        return _ => {
            window.removeEventListener("resize", handleResize);
        };
    }, [props.sm]);

    useEffect(_ => {
        Axios.get(ipPortApi + "getOccupancy/" + props.token + "?dt=" + props.moment(selectedDateTime).format("YYYY-MM-DD HH:00:00"))
            .then(data => {
                if (data.data.message) {
                    props.enqueueSnackbar("Errore dal server: " + data.data.message, { variant: "error" });
                    setRoomsData([]);
                }
                else
                    data.data.length > 0 ? setRoomsData(data.data) : setRoomsData([]);
            })
            .catch(error => { setRoomsData([]); console.log(error); });
    }, [selectedDateTime]);

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

    return (
        <>
            <Box style={{ ...(compsBoxHeight > heightThreshold && { height: compsBoxHeight + "px" }), display: "flex", flexDirection: "column" }}>
                <Box display="flex" justifyContent="flex-end" alignItems="flex-end" ref={dtRef}>
                    <DateTimePicker
                        label="Seleziona data e ora"
                        value={props.moment(selectedDateTime)}
                        onChange={dt => {
                            if (props.moment(dt, "YYYY-MM-DD HH:mm:ss", true).isValid() && dt.isAfter(props.moment().format("YYYY-MM-DD")))
                                setSelectedDateTime(props.moment(dt).format("YYYY-MM-DD HH:00:00"));
                        }}
                        minDateTime={props.moment(props.moment().format("YYYY-MM-DD"))}
                        format="YYYY-MM-DD HH"
                        views={["day", "hours"]}
                    />
                </Box>
                {compsBoxHeight > heightThreshold ?
                    <Box style={{ height: `calc(100% - ${dtRef.current?.clientHeight}px`, position: "relative" }}>
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
                                    <Box key={index} style={{ height: "calc(100% / 3)" }}>
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
                                                                color: props.theme.palette.primary.main + "44"
                                                            },
                                                            ticks: {
                                                                autoSkip: false,
                                                                font: {
                                                                    size: (props.sm ? 24 : 12) * window.innerHeight * 0.001,
                                                                    weight: "bold"
                                                                },
                                                                color: props.theme.palette.primary.main,
                                                            },
                                                            afterFit(scale) {
                                                                scale.width = (props.sm ? 32 : 16) * window.innerHeight * 0.01
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
                                                                size: (props.sm ? 24 : 12) * window.innerHeight * 0.001,
                                                            },
                                                            color: props.theme.palette.primary.white,
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
                                    <Typography variant="h5" textAlign="center" color={props.theme.palette.primary.red}>
                                        Hai indicato questa data o ora come non disponibile per la prenotazione.
                                    </Typography>
                                </Box>
                        }
                    </Box>
                    :
                    <Box textAlign="center" py={4}>
                        <Typography variant="info">
                            L'altezza dello schermo non permette la visualizzazione corretta dei grafici. Ruotare il display o provare da un altro dispositivo
                        </Typography>
                    </Box>
                }
            </Box>
        </>
    );
}