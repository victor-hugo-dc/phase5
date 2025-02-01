import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const { token, userId } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token || !userId) {
            setUserData(null);
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/users/${userId}`);
                setUserData(response.data);
            } catch (err) {
                setError('Failed to fetch user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [token, userId]);

    return (
        <ProfileContext.Provider value={{ userData, loading, error, setUserData }}>
            {children}
        </ProfileContext.Provider>
    );
};
