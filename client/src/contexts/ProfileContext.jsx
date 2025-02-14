import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useProperties } from './PropertiesContext';
import api from '../utils/axios';

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
        api.get(`/users/${userId}`)
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
            const response = await api.post(
                `/bookings`,
                { user_id: userId, property_id: propertyId, start_date: startDate, end_date: endDate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // check if there is already a booking in that property
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
            return response.data.booking;
        } catch (err) {
            console.error('Error adding booking:', err);
        }
    };

    const editBooking = async (bookingId, startDate, endDate) => {
        try {
            await api.put(
                `/bookings/${bookingId}`,
                { start_date: startDate, end_date: endDate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // TODO: Replace this bandaid.
            api.get(`/users/${userId}`)
                .then(response => {
                    setUserData(response.data);
                });
        } catch (err) {
            console.error('Error editing booking:', err);
        }
    };

    const deleteBooking = async (bookingId) => {
        try {
            await api.delete(
                `/bookings/${bookingId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            api.get(`/users/${userId}`)
                .then(response => {
                    setUserData(response.data);
                });

            setProperties(prev =>
                prev.map(property => ({
                    ...property,
                    bookings: property.bookings
                        ? property.bookings.filter(booking => booking.id !== bookingId)
                        : []
                }))
            );
        } catch (err) {
            console.error('Error deleting booking:', err);
        }
    };

    const addProperty = async (propertyData) => {
        try {
            const response = await api.post(
                `/properties`,
                propertyData,
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
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
            const response = await api.put(
                `/properties/${propertyId}`,
                updatedData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUserData(prev => ({
                ...prev,
                owned_properties: prev.owned_properties.map(op =>
                    op.id === propertyId ? { ...op, ...updatedData } : op
                )
            }));
            return response.data;
        } catch (err) {
            console.error('Error editing property:', err);
        }
    };

    const deleteProperty = async (propertyId) => {
        try {
            await api.delete(
                `/properties/${propertyId}`,
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
