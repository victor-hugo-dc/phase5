import React, { useEffect, useRef, useState } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { useAuth } from '../contexts/AuthContext';
import { Container, Typography, Box, Button, Divider, Paper, IconButton, CardMedia, Card, CardContent, TextField } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { userData, loading, error } = useProfile();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const ownedScrollRef = useRef(null);
    const bookedScrollRef = useRef(null);
    const [editing, setEditing] = useState(false);

    const scroll = (ref, direction) => {
        if (ref.current) {
            const { scrollLeft, clientWidth } = ref.current;
            const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
            ref.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: 'smooth' });
        }
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!userData) return <Typography>No user data available.</Typography>;

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h3" fontWeight="bold">About {userData.name}</Typography>
                {editing ? (
                    <Formik
                        initialValues={{ name: userData.name }}
                        onSubmit={async (values) => {
                            // await updateUser(userData.id, values);
                            setEditing(false);
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <Field as={TextField} name="name" variant="outlined" fullWidth sx={{ mt: 2 }} />
                                <Button type="submit" variant="contained" sx={{ mt: 1 }} disabled={isSubmitting}>Save</Button>
                                <Button onClick={() => setEditing(false)} sx={{ mt: 1, ml: 1 }}>Cancel</Button>
                            </Form>
                        )}
                    </Formik>
                ) : (
                    <Button variant="contained" sx={{ mt: 1 }} onClick={() => setEditing(true)}>Edit Profile</Button>
                )}
                <Divider sx={{ my: 3 }} />

                <Typography variant="h5">Owned Properties</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <IconButton onClick={() => scroll(ownedScrollRef, 'left')}><ArrowBackIos /></IconButton>
                    <Box ref={ownedScrollRef} sx={{ display: 'flex', overflowX: 'auto', scrollBehavior: 'smooth', gap: 2, flexGrow: 1, py: 2 }}>
                        {userData.owned_properties.length > 0 ? (
                            userData.owned_properties.map((property) => (
                                <Card key={property.id} onClick={() => navigate(`/property/${property.id}`)} sx={{ cursor: 'pointer' }}>
                                    <CardMedia
                                        component="img"
                                        image={`http://localhost:5000/images/${property.images[0].image_path}`}
                                        alt={property.title}
                                        sx={{ height: 200, minWidth: 300, objectFit: 'cover' }}
                                    />
                                    <CardContent>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{property.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">{property.location_name}</Typography>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Typography>No owned properties found.</Typography>
                        )}
                    </Box>
                    <IconButton onClick={() => scroll(ownedScrollRef, 'right')}><ArrowForwardIos /></IconButton>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h5">Booked Properties</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <IconButton onClick={() => scroll(bookedScrollRef, 'left')}><ArrowBackIos /></IconButton>
                    <Box ref={bookedScrollRef} sx={{ display: 'flex', overflowX: 'auto', scrollBehavior: 'smooth', gap: 2, flexGrow: 1, py: 2 }}>
                        {userData.booked_properties.length > 0 ? (
                            userData.booked_properties.flatMap((property) => (
                                property.bookings.map((booking, index) => (
                                    <Card key={`${property.id}-${index}`} sx={{ height: 350, minWidth: 300, objectFit: 'cover' }}>
                                        <CardMedia
                                            component="img"
                                            image={`http://localhost:5000/images/${property.images[0].image_path}`}
                                            alt={property.title}
                                            sx={{ height: 200, minWidth: 300, objectFit: 'cover' }}
                                        />
                                        <CardContent>
                                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{property.title}</Typography>
                                            <Typography variant="body2" color="text.secondary">{property.location_name}</Typography>
                                            <Typography>{booking.start_date} to {booking.end_date}</Typography>
                                        </CardContent>
                                    </Card>
                                ))
                            ))
                        ) : (
                            <Typography>No booked properties found.</Typography>
                        )}
                    </Box>
                    <IconButton onClick={() => scroll(bookedScrollRef, 'right')}><ArrowForwardIos /></IconButton>
                </Box>

                <Box mt={4}>
                    <Button variant="outlined" color="error" onClick={logout}>Logout</Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Profile;
