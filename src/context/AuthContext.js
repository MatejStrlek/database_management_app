import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAuthToken, getCurrentUser, logout as logoutService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const token = getAuthToken();
        const currentUser = getCurrentUser();

        if (token && currentUser) {
            setIsAuthenticated(true);
            setUser(currentUser);
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
        setLoading(false);
    };

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        logoutService();
        setIsAuthenticated(false);
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};