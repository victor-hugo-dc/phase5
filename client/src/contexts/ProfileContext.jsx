import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useProperties } from './PropertiesContext';

const ProfileContext = createContext();
export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const { token, userId } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { setProperties } = useProperties();

    useEffect(() => {
        if (!token || !userId) {
            setUserData(null);
            setLoading(false);
            return;
        }
    
        setLoading(true);
        axios.get(`http://localhost:5000/users/${userId}`)
            .then(response => {
                setUserData(response.data);
            })
            .catch(err => {
                setError('Failed to fetch user data');
            })
            .finally(() => {
                setLoading(false);
            });
    
    }, [token, userId]);

    const addBooking = async (propertyId, startDate, endDate) => {
        try {
            const response = await axios.post(
                `http://localhost:5000/bookings`,
                { user_id: userId, property_id: propertyId, start_date: startDate, end_date: endDate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // check if there is already a booking in that property
            console.log(response.data.property);
            setUserData(prev => ({
                ...prev,
                booked_properties: [...prev.booked_properties, response.data.property]
            }));
            setProperties(prev => 
                prev.map(property =>
                    property.id === propertyId
                        ? { ...property, bookings: [...(property.bookings || []), response.data.booking] }
                        : property
                )
            );
        } catch (err) {
            console.error('Error adding booking:', err);
        }
    };

    const editBooking = async (bookingId, startDate, endDate) => {
        try {
            await axios.put(
                `http://localhost:5000/bookings/${bookingId}`,
                { start_date: startDate, end_date: endDate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUserData(prev => ({
                ...prev,
                booked_properties: prev.booked_properties.map(bp =>
                    bp.id === bookingId ? { ...bp, start_date: startDate, end_date: endDate } : bp
                )
            }));
        } catch (err) {
            console.error('Error editing booking:', err);
        }
    };

    const deleteBooking = async (bookingId) => {
        try {
            await axios.delete(
                `http://localhost:5000/bookings/${bookingId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            setUserData(prev => ({
                ...prev,
                booked_properties: prev.booked_properties.filter(bp => bp.id !== bookingId)
            }));
        } catch (err) {
            console.error('Error deleting booking:', err);
        }
    };

    const addProperty = async (propertyData) => {
        try {
            const response = await axios.post(
                `http://localhost:5000/properties`,
                propertyData,
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data'  } }
            );
            setUserData(prev => ({
                ...prev,
                owned_properties: [...prev.owned_properties, response.data.property]
            }));
            setProperties(prev => [...prev, response.data.property]);
            console.log(response.data.property);
            return response.data.property.id;
        } catch (err) {
            console.error('Error adding property:', err);
        }
    };

    const editProperty = async (propertyId, updatedData) => {
        try {
            await axios.put(
                `http://localhost:5000/properties/${propertyId}`,
                updatedData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUserData(prev => ({
                ...prev,
                owned_properties: prev.owned_properties.map(op =>
                    op.id === propertyId ? { ...op, ...updatedData } : op
                )
            }));
        } catch (err) {
            console.error('Error editing property:', err);
        }
    };

    const deleteProperty = async (propertyId) => {
        try {
            await axios.delete(
                `http://localhost:5000/properties/${propertyId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUserData(prev => ({
                ...prev,
                owned_properties: prev.owned_properties.filter(op => op.id !== propertyId)
            }));
        } catch (err) {
            console.error('Error deleting property:', err);
        }
    };

    return (
        <ProfileContext.Provider
            value={{ userData, loading, error, setUserData, addBooking, editBooking, deleteBooking, addProperty, editProperty, deleteProperty }}
        >
            {children}
        </ProfileContext.Provider>
    );
};
