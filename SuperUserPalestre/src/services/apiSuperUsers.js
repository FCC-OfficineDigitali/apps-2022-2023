import Cookies from "js-cookie";
import { enqueueSnackbar } from "notistack";
import ipPortApi from "../ipPortApi";

const cookieName = "SuperUserPalestre";

const getFacilitatori = (setFacilitatoriArr) => {
    fetch(ipPortApi + "getFacilitatori/", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "GET"
    }).then(response => response.json())
        .then(res => {
            if (res.message) {
                enqueueSnackbar("Errore dal server: " + res.message, { variant: "error" });
                setFacilitatoriArr([]);
            }
            else
                setFacilitatoriArr(res.result);
        })
        .catch(error => console.log(error));
};

const getFacilitatorAllAvailabilities = (facilitator_id, setCalendarData) => {
    fetch(ipPortApi + "getFacilitatorAllAvailabilities/" + facilitator_id, {
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

const getFacilitatorRequestedAvailabilitiesFromOperatorObj = (operator_id, setDataToShow) => {
    fetch(ipPortApi + "getFacilitatorRequestedAvailabilitiesFromOperator/" + operator_id, {
        headers: {
            "Content-Type": "application/json"
        },
        method: "GET"
    }).then(response => response.json())
        .then(res => {
            if (res.message) {
                enqueueSnackbar("Errore dal server: " + res.message, { variant: "error" });
                setDataToShow({ variableResults: [], facilitator: {} });
            }
            else
                setDataToShow(res.result);
        })
        .catch(error => console.log(error));
};

const getHoursFutureCounters = (setFixedHoursFutureCount, setVariableHoursFutureCount) => {
    fetch(ipPortApi + "getHoursFutureCounters/", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "GET"
    }).then(response => response.json())
        .then(res => {
            if (res.message) {
                enqueueSnackbar("Errore dal server: " + res.message, { variant: "error" });
                setFixedHoursFutureCount("");
                setVariableHoursFutureCount("");
            }
            else {
                setFixedHoursFutureCount(res.result[0].fixed_hours_future_count);
                setVariableHoursFutureCount(res.result[0].variable_hours_future_count);
            }
        })
        .catch(error => console.log(error));
};

const getOperatori = (setOperatoriArr) => {
    fetch(ipPortApi + "getOperatori/", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "GET"
    }).then(response => response.json())
        .then(res => {
            if (res.message) {
                enqueueSnackbar("Errore dal server: " + res.message, { variant: "error" });
                setOperatoriArr([]);
            }
            else
                setOperatoriArr(res.result);
        })
        .catch(error => console.log(error));
};

const getAllGyms = (setGymsArr) => {
    fetch(ipPortApi + "getAllGyms/", {
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
        is_operatore: null
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

const updateHoursFutureCounters = (fixedHoursFutureCount, variableHoursFutureCount) => {
    const data = {
        fixed_hours_future_count: fixedHoursFutureCount,
        variable_hours_future_count: variableHoursFutureCount
    };

    fetch(ipPortApi + "updateHoursFutureCounters/", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "PUT",
        body: JSON.stringify(data)
    }).then(response => response.json())
        .then(res => {
            if (res.messageOk)
                enqueueSnackbar(res.messageOk, { variant: "success" });
            else
                enqueueSnackbar("Errore dal server: " + res.message, { variant: "error" });
        })
        .catch(error => console.log(error));
};

export { getFacilitatori, getFacilitatorAllAvailabilities, getFacilitatorRequestedAvailabilitiesFromOperatorObj, getHoursFutureCounters, getOperatori, getAllGyms, getUserInfo, login, updateHoursFutureCounters };