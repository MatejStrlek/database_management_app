import axios from "axios";

const API_URL = 'http://localhost:3000/auth';

export const register = async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
};

export const login = async (credentials) => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    const { access_token } = response.data;

    if (access_token) {
        const tokenPayload = JSON.parse(atob(access_token.split('.')[1]));
        const userData = {
            email: tokenPayload.email,
            name: tokenPayload.email.split('@')[0],
            id: tokenPayload.email
        };

        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));

        return { ...response.data, user: userData };
    }

    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const getAuthToken = () => {
    return localStorage.getItem('token');
};