import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Container, Typography, Box, Button, Grid, Paper, Divider } from '@mui/material';

const Profile = () => {
    const { token, userId, logout } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Ensure we check the token and userId values
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

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h4" gutterBottom>
                    Profile - {userData.name}
                </Typography>

                <Paper sx={{ padding: 3 }}>
                    <Typography variant="h6">User Information</Typography>
                    <Divider sx={{ marginY: 2 }} />
                    <Typography><strong>Name:</strong> {userData.name}</Typography>
                    <Typography><strong>Email:</strong> {userData.email}</Typography>

                    <Typography variant="h6" sx={{ marginTop: 3 }}>
                        Booked Properties
                    </Typography>
                    {userData.booked_properties.length > 0 ? (
                        userData.booked_properties.map((property) => (
                            <Box key={property.id} sx={{ marginY: 2 }}>
                                <Paper sx={{ padding: 2 }}>
                                    <Typography variant="h6">{property.title}</Typography>
                                    <Typography>{property.description}</Typography>
                                    <Typography>
                                        <strong>Location:</strong> {property.location_name}
                                    </Typography>
                                    <Typography>
                                        <strong>Price per night:</strong> ${property.price_per_night.toFixed(2)}
                                    </Typography>
                                    <Typography>
                                        <strong>Booking Dates:</strong> {property.bookings[0].start_date} to {property.bookings[0].end_date}
                                    </Typography>
                                </Paper>
                            </Box>
                        ))
                    ) : (
                        <Typography>No booked properties found.</Typography>
                    )}

                    <Typography variant="h6" sx={{ marginTop: 3 }}>
                        Owned Properties
                    </Typography>
                    {userData.owned_properties.length > 0 ? (
                        userData.owned_properties.map((property) => (
                            <Box key={property.id} sx={{ marginY: 2 }}>
                                <Paper sx={{ padding: 2 }}>
                                    <Typography variant="h6">{property.title}</Typography>
                                    <Typography>{property.description}</Typography>
                                    <Typography>
                                        <strong>Location:</strong> {property.location_name}
                                    </Typography>
                                    <Typography>
                                        <strong>Price per night:</strong> ${property.price_per_night.toFixed(2)}
                                    </Typography>
                                </Paper>
                            </Box>
                        ))
                    ) : (
                        <Typography>No owned properties found.</Typography>
                    )}
                </Paper>

                <Box mt={4}>
                    <Button variant="outlined" color="error" onClick={logout}>
                        Logout
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Profile;
