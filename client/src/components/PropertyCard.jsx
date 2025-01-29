import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PropertyCard = ({ property }) => {
    const navigate = useNavigate();
    const { id, title, location_name, owner, price_per_night } = property;

    const handleCardClick = () => navigate(`/property/${id}`);
    const handleHostClick = (e) => {
        e.stopPropagation();
        navigate(`/host/${owner?.id}`);
    };

    const styles = {
        card: {
            width: 'calc(25% - 16px)',
            boxShadow: 3,
            borderRadius: 2,
            cursor: 'pointer',
            textDecoration: 'none',
        },
        hostText: {
            cursor: 'pointer',
            textDecoration: 'underline',
        },
    };

    return (
        <Card sx={styles.card} onClick={handleCardClick}>
            <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {location_name}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={styles.hostText}
                    onClick={handleHostClick}
                >
                    Hosted by: {owner?.name}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                    ${price_per_night.toFixed(2)} / night
                </Typography>
            </CardContent>
        </Card>
    );
};

export default PropertyCard;
