import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PropertiesContext } from '../contexts/PropertiesContext';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Card, CardMedia, CardContent, Button, Divider, FormControl, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format, addDays, isBefore, parseISO } from 'date-fns';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const PropertyPage = () => {
    const { properties } = useContext(PropertiesContext);
    const { token, userId } = useAuth();
    const { id } = useParams();
    const property = properties.find((p) => p.id.toString() === id);
    const [bookedDates, setBookedDates] = useState([]);
    const [defaultDates, setDefaultDates] = useState({ checkInDate: '', checkOutDate: '' });

    useEffect(() => {
        if (property) {
            const bookings = property.bookings || [];
            let booked = [];
            bookings.forEach(({ start_date, end_date }) => {
                let currentDate = parseISO(start_date);
                while (!isBefore(parseISO(end_date), currentDate)) {
                    booked.push(format(currentDate, 'yyyy-MM-dd'));
                    currentDate = addDays(currentDate, 1);
                }
            });
            setBookedDates(booked);
            findNextAvailableDates(booked);
        }
    }, [property]);

    const findNextAvailableDates = (booked) => {
        let start = new Date();
        while (booked.includes(format(start, 'yyyy-MM-dd'))) {
            start = addDays(start, 1);
        }
        let end = addDays(start, 5);
        setDefaultDates({
            checkInDate: format(start, 'yyyy-MM-dd'),
            checkOutDate: format(end, 'yyyy-MM-dd'),
        });
    };

    const calculateAverageRating = () => {
        if (!property.reviews || property.reviews.length === 0) return 0.0;
        const total = property.reviews.reduce((sum, review) => sum + review.rating, 0);
        return (total / property.reviews.length).toFixed(1);
    };

    const shouldDisableDate = (date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        return bookedDates.includes(formattedDate) || isBefore(date, new Date().setHours(0, 0, 0, 0));
    };

    const validationSchema = Yup.object().shape({
        checkInDate: Yup.string().required('Required'),
        checkOutDate: Yup.string()
            .required('Required')
            .test('after-start', 'Check-out must be after check-in', function (value) {
                return isBefore(parseISO(this.parent.checkInDate), parseISO(value));
            })
    });

    if (!property) return <Typography variant="h4">Property not found</Typography>;

    return (
        <Box sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Card sx={{ maxWidth: 800, width: '100%' }}>
                <Card sx={{ maxWidth: 1200, width: '100%', display: 'flex' }}>
                    {/* Main Image on the Left */}
                    <CardMedia
                        component="img"
                        sx={{ width: '60%', height: 400, objectFit: 'cover' }}
                        image={property.images[0].image_path}
                        alt={property.title}
                    />
                    {/* Additional Images Grid on the Right */}
                    <Box sx={{ width: '40%', padding: 2 }}>
                        <Grid container spacing={2}>
                            {property.images.slice(1, 5).map((image, index) => (
                                <Grid item xs={6} key={index}>
                                    <Card sx={{ width: '100%', height: 180 }}>
                                        <CardMedia
                                            component="img"
                                            height="100%"
                                            image={image.image_path}
                                            alt={`Property Image ${index + 1}`}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Card>
                <CardContent>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{property.title}</Typography>
                    <Typography variant="body1" color="text.secondary">{property.location_name}</Typography>
                    <Typography variant="body1" color="text.secondary">{property.owner.name}</Typography>
                    <Divider sx={{ marginTop: 3 }} />
                    <Formik
                        enableReinitialize
                        initialValues={defaultDates}
                        validationSchema={validationSchema}
                        onSubmit={async (values) => {
                            try {
                                await axios.post('http://localhost:5000/bookings', {
                                    property_id: property.id,
                                    start_date: values.checkInDate,
                                    end_date: values.checkOutDate,
                                    user_id: userId,
                                }, {
                                    headers: { Authorization: `Bearer ${token}` },
                                });
                                alert('Booking created successfully');
                            } catch {
                                alert('Error creating booking. Please try again.');
                            }
                        }}
                    >
                        {({ values, setFieldValue }) => {
                            const totalDays = (parseISO(values.checkOutDate) - parseISO(values.checkInDate)) / (1000 * 3600 * 24);
                            const basePrice = property.price_per_night * totalDays;
                            const cleaningFee = basePrice * 0.02;
                            const serviceFee = basePrice * 0.03;
                            const totalPrice = (basePrice + cleaningFee + serviceFee).toFixed(2);

                            return (
                                <Form>
                                    <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                                        <FormControl fullWidth>
                                            <DatePicker
                                                label="Check-In"
                                                value={parseISO(values.checkInDate)}
                                                onChange={(newValue) => setFieldValue('checkInDate', format(newValue, 'yyyy-MM-dd'))}
                                                shouldDisableDate={shouldDisableDate}
                                            />
                                        </FormControl>
                                        <FormControl fullWidth>
                                            <DatePicker
                                                label="Check-Out"
                                                value={parseISO(values.checkOutDate)}
                                                onChange={(newValue) => setFieldValue('checkOutDate', format(newValue, 'yyyy-MM-dd'))}
                                                shouldDisableDate={shouldDisableDate}
                                            />
                                        </FormControl>
                                    </Box>
                                    <Box sx={{ marginTop: 2 }}>
                                        <Typography>Price Breakdown:</Typography>
                                        <Typography>{totalDays} {totalDays === 1 ? 'night' : 'nights'}: ${basePrice.toFixed(2)}</Typography>
                                        <Typography>Cleaning Fee (2%): ${cleaningFee.toFixed(2)}</Typography>
                                        <Typography>Service Fee (3%): ${serviceFee.toFixed(2)}</Typography>
                                        <Typography>Total Price: ${totalPrice}</Typography>
                                    </Box>
                                    <Button variant="contained" color="primary" sx={{ marginTop: 2 }} type="submit" disabled={!token}>Book Now</Button>
                                </Form>
                            );
                        }}
                    </Formik>
                    <Divider sx={{ marginTop: 3 }} />
                    <Typography variant="h6" sx={{ marginTop: 2 }}>Reviews {calculateAverageRating()}</Typography>
                    {property.reviews.length > 0 ? (
                        property.reviews.map((review) => (
                            <Box key={review.id} sx={{ marginTop: 2, padding: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>User {review.user_id}</Typography>
                                <Typography variant="body2">Rating: {review.rating} / 5</Typography>
                                <Typography variant="body2">{review.comment}</Typography>
                            </Box>
                        ))
                    ) : (
                        <Typography variant="body2" sx={{ marginTop: 2 }}>No reviews yet.</Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default PropertyPage;
