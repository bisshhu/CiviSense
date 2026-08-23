import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
    try {
        const response = await api.get("/auth/me");

        console.log("ME RESPONSE:", response.data);

        setUser(response.data.data);
    } catch (error) {
        console.error("ME ERROR:", error);
        console.log("ME STATUS:", error.response?.status);
        console.log("ME DATA:", error.response?.data);

        setUser(null);
    } finally {
        setLoading(false);
    }
};

        checkAuth();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};