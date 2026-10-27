import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, Outlet } from "react-router-dom";

const API = "http://localhost:8000";

function ProtectedRoute({ requiredRole }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        let active = true;

        const checkAuthentication = async () => {
            try {
                const response = await axios.get(
                    `${API}/api/dashboard`,
                    {
                        withCredentials: true
                    }
                );

                if (active) {
                    setIsAuthenticated(response.data.status === true);
                    setUser(response.data.user);
                }
            } catch {
                if (active) {
                    setIsAuthenticated(false);
                }
            }
        };

        checkAuthentication();

        return () => {
            active = false;
        };
    }, []);

    if (isAuthenticated === null) {
        return <h2>Checking authentication...</h2>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;