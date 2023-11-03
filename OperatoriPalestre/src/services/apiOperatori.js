import Cookies from "js-cookie";
import { enqueueSnackbar } from "notistack";
import ipPortApi from "../ipPortApi";

const cookieName = "OperatoriPalestre";

const getFacilitatorMonthAvailabilitiesGivenOperator = (operator_id, month, setCalendarData) => {
    fetch(ipPortApi + "getFacilitatorMonthAvailabilitiesGivenOperator/" + operator_id + "&m=" + month, {
        headers: {
            "Content-Type": "application/json"
        },
        method: "GET"
    }).then(response => response.json())
        .then(res => {
            if (res.message) {
                enqueueSnackbar("Errore dal server: " + res.message, { variant: "error" });
                setCalendarData({});
            }
            else
                setCalendarData(res.result);
        })
        .catch(error => console.log(error));
};

const getFacilitatorMonthAvailabilitiesGivenOperatorObj = (operator_id, month, setCalendarData) => {
    fetch(ipPortApi + "getFacilitatorMonthAvailabilitiesGivenOperator/" + operator_id + "&m=" + month, {
        headers: {
            "Content-Type": "application/json"
        },
        method: "GET"
    }).then(response => response.json())
        .then(res => {
            if (res.message) {
                enqueueSnackbar("Errore dal server: " + res.message, { variant: "error" });
                setCalendarData({ fixedResults: [], variableResults: [], facilitator: {} });
            }
            else
                setCalendarData(res.result);
        })
        .catch(error => console.log(error));
};

const getMyFacilitatorVariableHoursForDate = (operator_id, availabilityDate, setFacilitatorAvailabilities, setVer, setAnotherResult) => {
    fetch(ipPortApi + "getMyFacilitatorVariableHoursForDate/" + operator_id + "&ad=" + availabilityDate, {
        headers: {
            "Content-Type": "application/json"
        },
        method: "GET"
    }).then(response => response.json())
        .then(res => {
            if (res.message) {
                enqueueSnackbar("Errore dal server: " + res.message, { variant: "error" });
                setFacilitatorAvailabilities([]);
                setVer(null);
                setAnotherResult([]);
            }
            else {
                setFacilitatorAvailabilities(res.result);
                setVer(res.ver);
                setAnotherResult(res.anotherResult);
            }
        })
        .catch(error => console.log(error));
};

const getMyAvailabilitiesOperatorsHoursForDate = (operator_id, availabilityDate, setSelectedHoursAvailabilities, gymCustomPlace) => {
    fetch(ipPortApi + "getMyAvailabilitiesOperatorsHoursForDate/" + operator_id + "&ad=" + availabilityDate + "&gcp=" + gymCustomPlace, {
        headers: {
            "Content-Type": "application/json"
        },
        method: "GET"
    }).then(response => response.json())
        .then(res => {
            if (res.message) {
                enqueueSnackbar("Errore dal server: " + res.message, { variant: "error" });
            }
            else
                setSelectedHoursAvailabilities(res.result);
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
        is_operatore: 1
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

const updateAvailabilityTimesForOperator = (operator_id, gym_custom_place, availability_date, availability_times_for_operator, ver, notes) => {
    const data = {
        operator_id: operator_id,
        gym_custom_place: gym_custom_place,
        availability_date: availability_date,
        availability_times_for_operator: availability_times_for_operator,
        ver: ver,
        notes: notes
    };

    fetch(ipPortApi + "updateAvailabilityTimesForOperator/", {
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

export { getFacilitatorMonthAvailabilitiesGivenOperator, getFacilitatorMonthAvailabilitiesGivenOperatorObj, getMyFacilitatorVariableHoursForDate, getMyAvailabilitiesOperatorsHoursForDate, getUserInfo, login, updateAvailabilityTimesForOperator };