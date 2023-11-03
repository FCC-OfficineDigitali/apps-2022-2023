import Cookies from "js-cookie";
import { enqueueSnackbar } from "notistack";
import ipPortApi from "../ipPortApi";

const cookieName = "FacilitatoriPalestre";

const addFixedAvailability = (facilitator_id, gym_id, availability_date, availability_times, invertToggleTriggerUpdateCalendar, closePopup) => {
    const data = {
        facilitator_id: facilitator_id,
        gym_id: gym_id,
        availability_date: availability_date,
        availability_times: availability_times
    };

    fetch(ipPortApi + "addFixedAvailability/", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(data)
    }).then(response => response.json())
        .then(res => {
            if (res.messageOk) {
                invertToggleTriggerUpdateCalendar();
                closePopup();
                enqueueSnackbar(res.messageOk, { variant: "success" });
            }
            else
                enqueueSnackbar("Errore dal server: " + res.message, { variant: "error" });
        })
        .catch(error => console.log(error));
};

const addVariableAvailability = (facilitator_id, availability_date, availability_times, invertToggleTriggerUpdateCalendar, closePopup) => {
    const data = {
        facilitator_id: facilitator_id,
        availability_date: availability_date,
        availability_times: availability_times
    };

    fetch(ipPortApi + "addVariableAvailability/", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(data)
    }).then(response => response.json())
        .then(res => {
            if (res.messageOk) {
                invertToggleTriggerUpdateCalendar();
                closePopup();
                enqueueSnackbar(res.messageOk, { variant: "success" });
            }
            else
                enqueueSnackbar("Errore dal server: " + res.message, { variant: "error" });
        })
        .catch(error => console.log(error));
};

const getFixedAvailabilityForDateGymFacilitator = (facilitator_id, gym_id, availability_date, setSelectedFixedHours) => {
    const data = {
        facilitator_id: facilitator_id,
        gym_id: gym_id,
        availability_date: availability_date
    };

    fetch(ipPortApi + "getFixedAvailabilityForDateGymFacilitator/", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(data)
    }).then(response => response.json())
        .then(res => {
            if (res.message)
                enqueueSnackbar("Errore dal server: " + res.message, { variant: "error" });
            else
                setSelectedFixedHours(res.result);
        })
        .catch(error => console.log(error));
};

const getFixedAvailabilitiesAllDataForDateFacilitator = (facilitator_id, availability_date, setFixedAvailabilities) => {
    const data = {
        facilitator_id: facilitator_id,
        availability_date: availability_date
    };

    fetch(ipPortApi + "getFixedAvailabilitiesAllDataForDateFacilitator/", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(data)
    }).then(response => response.json())
        .then(res => {
            if (res.message)
                enqueueSnackbar("Errore dal server: " + res.message, { variant: "error" });
            else
                setFixedAvailabilities(res.result);
        })
        .catch(error => console.log(error));
};

const getVariableAvailabilitiesAllDataForDateFacilitator = (facilitator_id, availability_date, setVariableAvailabilities, shouldSplit) => {
    const data = {
        facilitator_id: facilitator_id,
        availability_date: availability_date
    };

    fetch(ipPortApi + "getVariableAvailabilitiesAllDataForDateFacilitator/", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(data)
    }).then(response => response.json())
        .then(res => {
            if (res.message)
                enqueueSnackbar("Errore dal server: " + res.message, { variant: "error" });
            else
                setVariableAvailabilities(shouldSplit ? (res.result.length === 0 ? [] : res.result[0].availability_times.split(",")) : res.result);
        })
        .catch(error => console.log(error));
};

const getFacilitatorMonthAvailabilities = (facilitator_id, monthYear, setCalendarData) => {
    fetch(ipPortApi + "getFacilitatorMonthAvailabilities/" + facilitator_id + "&my=" + monthYear, {
        headers: {
            "Content-Type": "application/json"
        },
        method: "GET"
    }).then(response => response.json())
        .then(res => {
            if (res.message) {
                enqueueSnackbar("Errore dal server: " + res.message, { variant: "error" });
                setCalendarData([]);
            }
            else
                setCalendarData(res.result);
        })
        .catch(error => console.log(error));
};

const getOwnGyms = (facilitator_id, setGymsArr, dayOfWeek) => {
    fetch(ipPortApi + "getOwnGyms/" + facilitator_id + "&dow=" + dayOfWeek, {
        headers: {
            "Content-Type": "application/json"
        },
        method: "GET"
    }).then(response => response.json())
        .then(res => {
            if (res.message) {
                enqueueSnackbar("Errore dal server: " + res.message, { variant: "error" });
                setGymsArr([]);
            }
            else
                setGymsArr(res.result);
        })
        .catch(error => console.log(error));
};

const getUserInfo = (setUserInfo) => {
    const token = Cookies.get(cookieName);

    if (token !== undefined)
        fetch(ipPortApi + "getUserInfo/", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            method: "GET"
        }).then(response => response.json())
            .then(res => {
                if (res.message) {
                    Cookies.remove(cookieName);
                    setUserInfo({});
                }
                else
                    setUserInfo(res.result);
            })
            .catch(error => console.log(error));
};

const login = (mail, password, setStatus, setEmpty) => {
    const data = {
        mail: mail,
        password: password,
        is_operatore: 0
    }
    fetch(ipPortApi + "loginIntoGyms/", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(data)
    }).then(response => response.json())
        .then(res => {
            if (res.messageOk) {
                setStatus(res.messageOk);
                Cookies.set(cookieName, res.token);
            }
            else {
                setStatus("Errore dal server: " + res.message);
                setEmpty();
            }
        }).catch(error => console.log(error));
};

export { addFixedAvailability, addVariableAvailability, getFixedAvailabilityForDateGymFacilitator, getFixedAvailabilitiesAllDataForDateFacilitator, getVariableAvailabilitiesAllDataForDateFacilitator, getFacilitatorMonthAvailabilities, getOwnGyms, getUserInfo, login };