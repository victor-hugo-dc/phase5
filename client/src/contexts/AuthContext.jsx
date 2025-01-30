import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [userId, setUserId] = useState(localStorage.getItem('userId') || null);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:5000/login', { email, password });
            const { access_token, user_id } = response.data;

            setToken(access_token);
            setUserId(user_id);

            localStorage.setItem('token', access_token);
            localStorage.setItem('userId', user_id);

            return true;
        } catch (error) {
            console.error('Error during login:', error);
            return false;
        }
    };

    // Logout function
    const logout = () => {
        setToken(null);
        setUserId(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
    };

    return (
        <AuthContext.Provider value={{ token, userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return React.useContext(AuthContext);
};
