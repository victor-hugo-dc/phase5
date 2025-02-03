import React, { useContext, useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { PropertiesContext } from '../contexts/PropertiesContext';
import { Box, Typography, Paper, Container, IconButton, Divider, Card, CardMedia, CardContent } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import StarRating from '../components/StarRating';

const HostPage = () => {
    const { userId } = useAuth();
    const { properties } = useContext(PropertiesContext);
    const { id } = useParams();
    const [userData, setUserData] = useState({});
    const [loading, setLoading] = useState(true);
    const scrollRefs = {
        properties: useRef(null),
        bookings: useRef(null),
        reviews: useRef(null),
    };

    const scroll = (ref, direction) => {
        if (ref.current) {
            const { scrollLeft, clientWidth } = ref.current;
            const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
            ref.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/users/${id}`);
                setUserData(response.data);
            } catch (err) {
                console.error('Error fetching user data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [id]);

    if (loading) return <Typography>Loading...</Typography>;
    if (!userData.name) return <Typography variant="h4">Host not found</Typography>;

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h3" fontWeight="bold">About {userData.name}</Typography>
                <Divider sx={{ my: 3 }} />
                {/* Reviews */}
                <Typography variant="h5">{userData.name}'s Reviews</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <IconButton onClick={() => scroll(scrollRefs.reviews, 'left')}><ArrowBackIos /></IconButton>
                    <Box ref={scrollRefs.reviews} sx={{ display: 'flex', overflowX: 'hidden', gap: 2, flexGrow: 1, py: 2 }}>
                        {userData.owned_properties.flatMap(p => p.reviews).length > 0 ? (
                            userData.owned_properties.flatMap(p => p.reviews).map((review) => (
                                <Paper key={review.id} sx={{ minWidth: 300, padding: 2 }}>
                                    <StarRating rating={review.rating} />
                                    <Typography>{review.comment}</Typography>
                                </Paper>
                            ))
                        ) : (
                            <Typography>No reviews found.</Typography>
                        )}
                    </Box>
                    <IconButton onClick={() => scroll(scrollRefs.reviews, 'right')}><ArrowForwardIos /></IconButton>
                </Box>
                <Divider sx={{ my: 3 }} />

                {/* Owned Properties */}
                <Typography variant="h5">Owned Properties</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <IconButton onClick={() => scroll(scrollRefs.properties, 'left')}><ArrowBackIos /></IconButton>
                    <Box ref={scrollRefs.properties} sx={{ display: 'flex', overflowX: 'hidden', gap: 2, flexGrow: 1, py: 2 }}>
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
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Hosted by: {property.owner?.name}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mt: 2 }}>
                                            ${property.price_per_night.toFixed(2)} per night
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Typography>No owned properties found.</Typography>
                        )}
                    </Box>
                    <IconButton onClick={() => scroll(scrollRefs.properties, 'right')}><ArrowForwardIos /></IconButton>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Reviews */}
                <Typography variant="h5">Previous Stays</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <IconButton onClick={() => scroll(scrollRefs.bookings, 'left')}><ArrowBackIos /></IconButton>
                    <Box ref={scrollRefs.bookings} sx={{ display: 'flex', overflowX: 'hidden', gap: 2, flexGrow: 1, py: 2 }}>
                        {userData.booked_properties.length > 0 ? (
                            userData.booked_properties.map((property) => (
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
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Hosted by: {property.owner?.name}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mt: 2 }}>
                                            ${property.price_per_night.toFixed(2)} per night
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Typography>No Previous Stays found.</Typography>
                        )}
                    </Box>
                    <IconButton onClick={() => scroll(scrollRefs.bookings, 'right')}><ArrowForwardIos /></IconButton>
                </Box>
            </Box>
        </Container>
    );
};

export default HostPage;
