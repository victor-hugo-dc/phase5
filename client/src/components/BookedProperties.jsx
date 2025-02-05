import React from 'react';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';
import { HorizontalScrollList } from './HorizontalScrollList';
import { useNavigate } from 'react-router-dom';

const BookedProperties = ({ userData }) => {
    const navigate = useNavigate();

    const bookedItems = userData.booked_properties.length > 0
        ? userData.booked_properties.reverse().flatMap((property) =>
            property.bookings.map((booking, index) => ({
                property,
                booking,
                key: `${property.id}-${index}`
            }))
        )
        : [];

    const renderBookedProperty = ({ property, booking, key }) => (
        <Card key={key} sx={{ height: 350, minWidth: 300, objectFit: 'cover', cursor: 'pointer' }} onClick={() => navigate(`/booking/${booking.id}`)}>
            <CardMedia
                component="img"
                image={`http://localhost:5000/images/${property.images[0].image_path}`}
                alt={property.title}
                sx={{ height: 200, minWidth: 300, objectFit: 'cover' }}
            />
            <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{property.title}</Typography>
                <Typography variant="body2" color="text.secondary">{property.location_name}</Typography>
                <Typography>
                    {(new Date(...booking.start_date.split('-').map((val, i) => i === 1 ? parseInt(val, 10) - 1 : val))).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {(new Date(...booking.end_date.split('-').map((val, i) => i === 1 ? parseInt(val, 10) - 1 : val))).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Typography>
            </CardContent>
        </Card>
    );

    return <HorizontalScrollList title="Booked Properties" items={bookedItems} renderItem={renderBookedProperty} />;
};

export default BookedProperties;
