import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Divider,
    Button,
    Alert,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-mui';
import * as Yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

// Validation schema for the booking form
const BookingSchema = Yup.object().shape({
    startDate: Yup.date().required('Start date is required'),
    endDate: Yup.date()
        .required('End date is required')
        .min(Yup.ref('startDate'), 'End date must be after start date'),
});

const PropertyPage = () => {
    const { id } = useParams(); // Get the property ID from the URL
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/properties/${id}`);
                setProperty(response.data);

                // Extract unavailable dates from bookings
                const dates = response.data.bookings.flatMap((booking) => {
                    const start = dayjs(booking.start_date);
                    const end = dayjs(booking.end_date);
                    const days = [];
                    for (let d = start; d.isBefore(end) || d.isSame(end); d = d.add(1, 'day')) {
                        days.push(d.toDate());
                    }
                    return days;
                });
                setUnavailableDates(dates);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching property:', error);
                setError('Failed to load property details.');
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id]);

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!property) {
        return <Typography>Property not found</Typography>;
    }

    const { title, description, price_per_night, location, owner, reviews } = property;

    // Calculate average rating
    const averageRating =
        reviews && reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : null;

    const handleBookingSubmit = async (values, { setSubmitting }) => {
        try {
            await axios.post(`http://localhost:5000/properties/${id}`, values);
            alert('Booking successful!');
        } catch (error) {
            console.error('Error creating booking:', error);
            alert('Failed to create booking. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, margin: 'auto', padding: 4 }}>
            <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                    {title}
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: 2 }}>
                    {description}
                </Typography>
                <Typography variant="h6" sx={{ marginBottom: 2 }}>
                    Location: {location}
                </Typography>
                <Typography variant="h6" sx={{ marginBottom: 2 }}>
                    Price per Night: ${price_per_night}
                </Typography>
                <Divider sx={{ marginY: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Owner Details:
                </Typography>
                <Typography variant="body1">Name: {owner.name}</Typography>
                <Typography variant="body1">Email: {owner.email}</Typography>
            </Paper>

            <Card sx={{ padding: 4, marginBottom: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                    Make a Booking
                </Typography>
                <Formik
                    initialValues={{
                        startDate: null,
                        endDate: null,
                    }}
                    validationSchema={BookingSchema}
                    onSubmit={handleBookingSubmit}
                >
                    {({ values, setFieldValue, errors, touched, isSubmitting }) => (
                        <Form>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Field
                                            component={DatePicker}
                                            name="startDate"
                                            label="Start Date"
                                            value={values.startDate}
                                            onChange={(value) => setFieldValue('startDate', value)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    error={touched.startDate && !!errors.startDate}
                                                    helperText={touched.startDate && errors.startDate}
                                                    fullWidth
                                                />
                                            )}
                                            shouldDisableDate={(date) =>
                                                unavailableDates.some(
                                                    (unavailable) =>
                                                        dayjs(unavailable).isSame(date, 'day')
                                                )
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Field
                                            component={DatePicker}
                                            name="endDate"
                                            label="End Date"
                                            value={values.endDate}
                                            onChange={(value) => setFieldValue('endDate', value)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    error={touched.endDate && !!errors.endDate}
                                                    helperText={touched.endDate && errors.endDate}
                                                    fullWidth
                                                />
                                            )}
                                            shouldDisableDate={(date) =>
                                                unavailableDates.some(
                                                    (unavailable) =>
                                                        dayjs(unavailable).isSame(date, 'day')
                                                )
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            disabled={isSubmitting}
                                            fullWidth
                                        >
                                            Book Now
                                        </Button>
                                    </Grid>
                                </Grid>
                            </LocalizationProvider>
                        </Form>
                    )}
                </Formik>
            </Card>

            {averageRating !== null && (
                <Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 2 }}>
                    Average Rating: {averageRating.toFixed(1)} / 5
                </Typography>
            )}

            <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
                Reviews
            </Typography>
            {reviews && reviews.length > 0 ? (
                reviews.map((review, index) => (
                    <Paper key={index} sx={{ padding: 2, marginBottom: 2 }}>
                        <Typography variant="body1">{review.text}</Typography>
                        <Typography variant="caption">Rating: {review.rating}/5</Typography>
                        <Typography variant="caption">{review.comment}</Typography>
                    </Paper>
                ))
            ) : (
                <Typography>No reviews yet.</Typography>
            )}
        </Box>
    );
};

export default PropertyPage;
