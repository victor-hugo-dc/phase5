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
        api.get(`/checksession`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(response => {
                setUserData(response.data);
            })
            .catch(err => {
                setError('Failed to fetch user data', err);
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

            setUserData(prev => {
                const existingPropertyIndex = prev.booked_properties.findIndex(
                    property => property.id === response.data.property.id
                );

                if (existingPropertyIndex !== -1) {
                    return {
                        ...prev,
                        booked_properties: prev.booked_properties.map((property, index) =>
                            index === existingPropertyIndex
                                ? { ...property, bookings: [...property.bookings, response.data.booking] }
                                : property
                        )
                    };
                } else {
                    return {
                        ...prev,
                        booked_properties: [...prev.booked_properties, response.data.property]
                    };
                }
            });
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

            setUserData(prevUserData => {
                const updatedBookedProperties = prevUserData.booked_properties.map(property => {
                    const bookingIndex = property.bookings.findIndex(b => b.id === parseInt(bookingId, 10));

                    if (bookingIndex === -1) return property;

                    const updatedBookings = [...property.bookings];
                    updatedBookings[bookingIndex] = {
                        ...updatedBookings[bookingIndex],
                        start_date: startDate,
                        end_date: endDate
                    };

                    return {
                        ...property,
                        bookings: updatedBookings
                    };
                });

                return {
                    ...prevUserData,
                    booked_properties: updatedBookedProperties
                };
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

            setUserData(prevUserData => ({
                ...prevUserData,
                booked_properties: prevUserData.booked_properties.map(property => ({
                    ...property,
                    bookings: property.bookings.filter(booking => booking.id !== parseInt(bookingId, 10))
                }))
            }));

            setProperties(prev =>
                prev.map(property => ({
                    ...property,
                    bookings: property.bookings
                        ? property.bookings.filter(booking => booking.id !== parseInt(bookingId, 10))
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
            return response.data.property;
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
