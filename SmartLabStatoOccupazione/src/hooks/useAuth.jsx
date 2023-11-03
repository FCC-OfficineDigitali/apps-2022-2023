import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import sha1 from "sha1";
import useLocalStorage from "./useLocalStorage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useLocalStorage("SmartLabStatoOccupazioneadmin", null);
    const [token, setToken] = useLocalStorage("SmartLabStatoOccupazionetoken", null);
    const history = useNavigate();

    const login = async (data) => {
        setUser(true);
        setToken(sha1(data.mail + " ") + sha1(data.password) + "0");
        history("/", { replace: true });
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        history("/login", { replace: true });
    };

    const value = useMemo(
        () => ({
            user,
            token,
            login,
            logout
        }),
        [user]
    );
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};