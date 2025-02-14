import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { Box, Typography, Container, Divider } from '@mui/material';
import { ReviewCard } from '../components/ReviewCard'; 
import { HorizontalScrollList } from '../components/HorizontalScrollList';
import { PropertyCard } from '../components/OwnedPropertyCard';

const HostPage = () => {
    const { id } = useParams();
    const { navigate } = useNavigate();
    const [userData, setUserData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/users/${id}`)
            .then((response) => {
                setUserData(response.data);
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Typography>Loading...</Typography>;
    if (!userData.name) return <Typography variant="h4">Host not found</Typography>;

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h3" fontWeight="bold">About {userData.name}</Typography>
                <Divider sx={{ my: 3 }} />

                <HorizontalScrollList
                    title={`${userData.name}'s Reviews`}
                    items={userData.owned_properties.flatMap(p => p.reviews)}
                    renderItem={(review) => <ReviewCard key={review.id} review={review} />}
                />

                <HorizontalScrollList
                    title="Owned Properties"
                    items={userData.owned_properties}
                    renderItem={(property) => (
                        <PropertyCard key={property.id} property={property} onClick={() => navigate(`/property/${property.id}`)} />
                    )}
                />

                <HorizontalScrollList
                    title="Previous Stays"
                    items={userData.booked_properties}
                    renderItem={(property) => (
                        <PropertyCard key={property.id} property={property} onClick={() => navigate(`/property/${property.id}`)} />
                    )}
                />
            </Box>
        </Container>
    );
};

export default HostPage;
