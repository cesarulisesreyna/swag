import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RoleRoute = ({ roles, children }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="screen-center">
                <div className="loading-spinner" aria-label="Cargando" />
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (roles && !roles.includes(user?.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default RoleRoute;
