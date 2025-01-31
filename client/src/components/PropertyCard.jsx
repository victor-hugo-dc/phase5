import React from 'react';
import { Typography, Card, CardContent, CardMedia } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PropertyCard = ({ property }) => {
    const navigate = useNavigate();
    const { id, title, location_name, owner, price_per_night, images } = property;

    const handleCardClick = () => navigate(`/property/${id}`);
    const handleHostClick = (e) => {
        e.stopPropagation();
        navigate(`/host/${owner?.id}`);
    };

    const firstImage = images?.length > 0 ? images[0].image_path : 'https://via.placeholder.com/300'; // Default placeholder if no images

    const styles = {
        card: {
            width: 'calc(16.66667% - 16px)',
            boxShadow: 3,
            borderRadius: 2,
            cursor: 'pointer',
            textDecoration: 'none',
        },
        media: {
            height: 200,
            objectFit: 'cover',
        },
        hostText: {
            cursor: 'pointer',
            textDecoration: 'underline',
        },
    };

    return (
        <Card sx={styles.card} onClick={handleCardClick}>
            <CardMedia
                component="img"
                image={firstImage}
                alt={title}
                sx={styles.media}
            />
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
                    ${price_per_night.toFixed(2)} per night
                </Typography>
            </CardContent>
        </Card>
    );
};

export default PropertyCard;
