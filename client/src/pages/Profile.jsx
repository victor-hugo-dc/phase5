import React, { useEffect } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { useAuth } from '../contexts/AuthContext';
import { Container, Typography, Box, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { HorizontalScrollList } from '../components/HorizontalScrollList';
import { PropertyCard } from '../components/OwnedPropertyCard';
import BookedProperties from '../components/BookedProperties';

const Profile = () => {
    const { userData, loading, error } = useProfile();
    const { logout, token } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!token) {
            navigate('/');
        }
    }, [token, navigate]);

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!userData) return <Typography>Couldn't find user.</Typography>;

    const handleLogout = () => {
        logout();
        navigate('/');
    }

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h3" fontWeight="bold">About {userData.name}</Typography>
                <Divider sx={{ my: 3 }} />
                <HorizontalScrollList
                    title="Owned Properties"
                    items={userData.owned_properties}
                    renderItem={(property) => (
                        <PropertyCard key={property.id} property={property} onClick={() => navigate(`/properties/${property.id}`)} />
                    )}
                />

                <BookedProperties userData={userData} />
                <Box mt={4}>
                    <Button variant="outlined" color="error" onClick={handleLogout}>Logout</Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Profile;
