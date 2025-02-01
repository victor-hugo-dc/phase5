import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Container, Typography, Box, Button, Divider, Paper, IconButton } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

const Profile = () => {
    const { token, userId, logout } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (!token || !userId) {
            alert('You are not logged in!');
            return;
        }

        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/users/${userId}`);
                setUserData(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch user data');
                setLoading(false);
            }
        };

        fetchUserData();
    }, [token, userId]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
            scrollRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: 'smooth' });
        }
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h3" fontWeight="bold">About {userData.name}</Typography>
                <Button variant="contained" sx={{ mt: 1 }}>Edit Profile</Button>
                <Divider sx={{ my: 3 }} />

                <Typography variant="h5">Owned Properties</Typography>
                <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, py: 2 }}>
                    {userData.owned_properties.length > 0 ? (
                        userData.owned_properties.map((property) => (
                            <Paper key={property.id} sx={{ minWidth: 300, padding: 2 }}>
                                <Typography variant="h6">{property.title}</Typography>
                                <Typography>{property.description}</Typography>
                                <Typography><strong>Location:</strong> {property.location_name}</Typography>
                                <Typography><strong>Price per night:</strong> ${property.price_per_night.toFixed(2)}</Typography>
                            </Paper>
                        ))
                    ) : (
                        <Typography>No owned properties found.</Typography>
                    )}
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h5">Booked Properties</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <IconButton onClick={() => scroll('left')}><ArrowBackIos /></IconButton>
                    <Box ref={scrollRef} sx={{ display: 'flex', overflowX: 'hidden', scrollBehavior: 'smooth', gap: 2, flexGrow: 1, py: 2 }}>
                        {userData.booked_properties.length > 0 ? (
                            userData.booked_properties.map((property) => (
                                <Paper key={property.id} sx={{ width: 400, padding: 2 }}>
                                    <Typography variant="h6">{property.title}</Typography>
                                    <Typography>{property.description}</Typography>
                                    <Typography><strong>Location:</strong> {property.location_name}</Typography>
                                    <Typography><strong>Price per night:</strong> ${property.price_per_night.toFixed(2)}</Typography>
                                    <Typography><strong>Booking Dates:</strong> {property.bookings[0].start_date} to {property.bookings[0].end_date}</Typography>
                                </Paper>
                            ))
                        ) : (
                            <Typography>No booked properties found.</Typography>
                        )}
                    </Box>
                    <IconButton onClick={() => scroll('right')}><ArrowForwardIos /></IconButton>
                </Box>

                <Box mt={4}>
                    <Button variant="outlined" color="error" onClick={logout}>Logout</Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Profile;