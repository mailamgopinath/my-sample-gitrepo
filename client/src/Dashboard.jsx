import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await axios.get(
                    `${API}/api/dashboard`,
                    {
                        withCredentials: true
                    }
                );

                setUser(response.data.user);
            } catch (error) {
                setMessage(
                    error.response?.data?.message ||
                    "Unable to load Dashboard"
                );

                if (error.response?.status === 401) {
                    navigate("/", {
                        replace: true
                    });
                }
            }
        };

        fetchDashboard();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await axios.post(
                `${API}/logout`,
                {},
                {
                    withCredentials: true
                }
            );

            navigate("/", {
                replace: true
            });
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Logout failed. Please try again."
            );
        }
    };

    if (!user) {
        return <h2>{message || "Loading Dashboard..."}</h2>;
    }

    return (
        <div>
            <h1>Dashboard</h1>

            <h2>Welcome, {user.name}</h2>

            <p>User ID: {user.id}</p>

            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>

            {user.role === "faculty" && (
                <p>
                    <Link to="/student">Manage students</Link>
                </p>
            )}

            <button onClick={handleLogout}>
                Logout
            </button>

            {message && <p>{message}</p>}
        </div>
    );
}

export default Dashboard;