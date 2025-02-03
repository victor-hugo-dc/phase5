import React, { useRef } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { useAuth } from '../contexts/AuthContext';
import { Container, Typography, Box, Button, Divider, Paper, IconButton, CardMedia, Card, CardContent } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

const Profile = () => {
    const { userData, loading, error } = useProfile();
    const { logout } = useAuth();
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
            scrollRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: 'smooth' });
        }
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!userData) return <Typography>No user data available.</Typography>;

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
                            <Card key={property.id}>
                                <CardMedia
                                    component="img"
                                    image={`http://localhost:5000/images/${property.images[0].image_path}`}
                                    alt={property.title}
                                    sx={{ height: 200, minWidth: 300, objectFit: 'cover' }}
                                />
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        {property.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {property.location_name}
                                    </Typography>
                                </CardContent>
                            </Card>
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
