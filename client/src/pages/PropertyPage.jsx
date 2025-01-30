import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PropertiesContext } from '../contexts/PropertiesContext';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Card, CardMedia, CardContent, Button, Divider, FormControl } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format, addDays, isBefore, parseISO, isSameDay } from 'date-fns';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const PropertyPage = () => {
    const { properties } = useContext(PropertiesContext);
    const { token } = useAuth();
    const { id } = useParams();
    const property = properties.find((p) => p.id.toString() === id);

    const today = format(new Date(), 'yyyy-MM-dd');
    const [bookedDates, setBookedDates] = useState([]);

    useEffect(() => {
        if (property) {
            const bookings = property.bookings || [];
            const booked = bookings.flatMap(({ start_date, end_date }) => {
                let dates = [];
                let currentDate = parseISO(start_date);
                const lastDate = parseISO(end_date);
                while (!isBefore(lastDate, currentDate)) {
                    dates.push(format(currentDate, 'yyyy-MM-dd'));
                    currentDate = addDays(currentDate, 1);
                }
                return dates;
            });
            setBookedDates(booked);
        }
    }, [property]);

    const validationSchema = Yup.object().shape({
        checkInDate: Yup.string()
            .required('Required')
            .test('valid-start', 'Date is unavailable', (value) => !bookedDates.includes(value))
            .test('not-past', 'Cannot book past dates', (value) => {
                const date = parseISO(value);
                return isSameDay(date, new Date()) || !isBefore(date, new Date());
            }),
        checkOutDate: Yup.string()
            .required('Required')
            .test('valid-end', 'Date is unavailable', (value) => !bookedDates.includes(value))
            .test('after-start', 'Check-out must be after check-in', function (value) {
                return isBefore(parseISO(this.parent.checkInDate), parseISO(value));
            })
    });

    if (!property) {
        return <Typography variant="h4">Property not found</Typography>;
    }

    return (
        <Box sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Card sx={{ maxWidth: 800, width: '100%' }}>
                <CardMedia component="img" height="400" image={property.image_url} alt={property.title} />
                <CardContent>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{property.title}</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ marginTop: 1 }}>{property.location_name}</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ marginTop: 1 }}>{property.owner.name}</Typography>
                    <Divider sx={{ marginTop: 3 }} />
                    <Formik
                        initialValues={{
                            checkInDate: today,
                            checkOutDate: format(addDays(new Date(), 5), 'yyyy-MM-dd')
                        }}
                        validationSchema={validationSchema}
                        onSubmit={async (values) => {
                            const totalDays = (parseISO(values.checkOutDate) - parseISO(values.checkInDate)) / (1000 * 3600 * 24);
                            const basePrice = property.price_per_night * totalDays;
                            const cleaningFee = basePrice * 0.05;
                            const serviceFee = basePrice * 0.03;
                            const totalPrice = (basePrice + cleaningFee + serviceFee).toFixed(2);
                            try {
                                await axios.post('/bookings', {
                                    property_id: property.id,
                                    check_in: values.checkInDate,
                                    check_out: values.checkOutDate,
                                    total_price: totalPrice,
                                }, {
                                    headers: { Authorization: `Bearer ${token}` },
                                });
                                alert('Booking created successfully');
                            } catch {
                                alert('Error creating booking. Please try again.');
                            }
                        }}
                    >
                        {({ errors, touched, values, setFieldValue }) => (
                            <Form>
                                <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                                    <FormControl fullWidth>
                                        <DatePicker
                                            label="Check-In"
                                            value={values.checkInDate}
                                            onChange={(newValue) => setFieldValue('checkInDate', format(newValue, 'yyyy-MM-dd'))}
                                        />
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <DatePicker
                                            label="Check-Out"
                                            value={values.checkOutDate}
                                            onChange={(newValue) => setFieldValue('checkOutDate', format(newValue, 'yyyy-MM-dd'))}
                                        />
                                    </FormControl>
                                </Box>
                                <Button variant="contained" color="primary" sx={{ marginTop: 2 }} type="submit" disabled={!token}>Book Now</Button>
                            </Form>
                        )}
                    </Formik>
                    <Divider sx={{ marginTop: 3 }} />
                    <Typography variant="h6" sx={{ marginTop: 2 }}>Reviews</Typography>
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