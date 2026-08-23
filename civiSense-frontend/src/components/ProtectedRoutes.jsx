import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    // Wait until /auth/me finishes
    // checking the authentication status.
    if (loading) {
        return (
            <div className="auth-loading">
                Checking authentication...
            </div>
        );
    }

    // User is not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // User is authenticated
    return <Outlet />;
};

export default ProtectedRoute;