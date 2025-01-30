import React, { createContext, useState, useContext } from 'react';

// Create the context
export const AuthContext = createContext();

// AuthProvider component to wrap the app and provide auth state
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState(null);

    // Function to log in
    const login = (newToken, newUserId) => {
        setToken(newToken); // Store token in state
        setUserId(newUserId);
    };

    // Function to log out
    const logout = () => {
        setToken(null); // Clear the token from state
        setUserId(null);
    };

    return (
        <AuthContext.Provider value={{ token, userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    return useContext(AuthContext);
};
