import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../context/UserProvider";
import Loading from "../components/Loading";

const ProtectedRoute = ({ allowedRoles}) => {
   
    const { user, loading } = useContext(UserContext);
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (loading) {
        return <div className="w-lvw h-lvh"><Loading /></div>;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;