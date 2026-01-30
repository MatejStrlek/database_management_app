import { createContext, useReducer, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getAuthToken, getCurrentUser, logout as logoutService } from '../services/authService';

const AuthContext = createContext();

export const AUTH_ACTIONS = {
    CHECK_AUTH_START: 'CHECK_AUTH_START',
    CHECK_AUTH_SUCCESS: 'CHECK_AUTH_SUCCESS',
    CHECK_AUTH_FAILURE: 'CHECK_AUTH_FAILURE',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
};

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
};

const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.CHECK_AUTH_START:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case AUTH_ACTIONS.CHECK_AUTH_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                isAuthenticated: action.payload.isAuthenticated,
                loading: false,
                error: null,
            };
        case AUTH_ACTIONS.CHECK_AUTH_FAILURE:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                loading: false,
                error: action.payload,
            };
        case AUTH_ACTIONS.LOGIN:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                loading: false,
                error: null,
            };
        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                loading: false,
                error: null,
            };
        default:
            return state;
    }
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        dispatch({ type: AUTH_ACTIONS.CHECK_AUTH_START });
        
        const token = getAuthToken();
        const currentUser = getCurrentUser();

        if (token && currentUser) {
            dispatch({
                type: AUTH_ACTIONS.CHECK_AUTH_SUCCESS,
                payload: { user: currentUser, isAuthenticated: true },
            });
        } else {
            dispatch({
                type: AUTH_ACTIONS.CHECK_AUTH_FAILURE,
                payload: 'No valid token or user found',
            });
        }
    };

    const login = (userData) => {
        dispatch({
            type: AUTH_ACTIONS.LOGIN,
            payload: userData,
        });
    };

    const logout = () => {
        logoutService();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
    };

    const value = {
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        error: state.error,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};