import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

export default function ProtectedLayout(props) {
    const { user } = useAuth();

    if (props.lockWhenLogged.localeCompare("Off") === 0 && !user)
        return <Navigate to="/login" />;
    if (props.lockWhenLogged.localeCompare("On") === 0 && user)
        return <Navigate to="/" />;
    return <Outlet />;
};