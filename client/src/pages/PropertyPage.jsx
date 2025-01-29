import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { PropertiesContext } from '../contexts/PropertiesContext';
import { Box, Typography, Card, CardMedia, CardContent, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const PropertyPage = () => {
    const { properties } = useContext(PropertiesContext);
    const { id } = useParams();
    const property = properties.find((p) => p.id.toString() === id);

    if (!property) {
        return <Typography variant="h4">Property not found</Typography>;
    }

    return (
        <Box sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Card sx={{ maxWidth: 800 }}>
                <CardMedia component="img" height="400" image={property.image_url} alt={property.title} />
                <CardContent>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {property.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ marginTop: 1 }}>
                        {property.location_name}
                    </Typography>
                    <Typography variant="h6" sx={{ marginTop: 2 }}>
                        Hosted by:{' '}
                        <Link to={`/host/${property.owner?.id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                            {property.owner?.name}
                        </Link>
                    </Typography>
                    <Typography variant="body2" sx={{ marginTop: 1 }}>
                        {property.description}
                    </Typography>
                    <Typography variant="h5" sx={{ marginTop: 2, fontWeight: 'bold' }}>
                        ${property.price_per_night.toFixed(2)} / night
                    </Typography>
                    <Button variant="contained" color="primary" sx={{ marginTop: 2 }}>
                        Book Now
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
};

export default PropertyPage;
