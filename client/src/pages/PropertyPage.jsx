import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PropertiesContext } from '../contexts/PropertiesContext';
import { useAuth } from '../contexts/AuthContext';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Divider,
    FormControl,
    Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format, addDays, isBefore, parseISO } from 'date-fns';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import ImageGrid from '../components/ImageGrid';
import StarRating from '../components/StarRating';

const PropertyPage = () => {
    const { properties } = useContext(PropertiesContext);
    const { token, userId } = useAuth();
    const { id } = useParams();
    const property = properties.find((p) => p.id.toString() === id);

    if (!property) return <Typography variant="h4">Property not found</Typography>;

    const [bookedDates, setBookedDates] = useState([]);
    const [defaultDates, setDefaultDates] = useState({ checkInDate: '', checkOutDate: '' });

    useEffect(() => {
        if (property) {
            const bookings = property.bookings || [];
            const booked = bookings.flatMap(({ start_date, end_date }) => {
                let dates = [];
                let currentDate = parseISO(start_date);
                while (!isBefore(parseISO(end_date), currentDate)) {
                    dates.push(format(currentDate, 'yyyy-MM-dd'));
                    currentDate = addDays(currentDate, 1);
                }
                return dates;
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
        setDefaultDates({
            checkInDate: format(start, 'yyyy-MM-dd'),
            checkOutDate: format(addDays(start, 5), 'yyyy-MM-dd'),
        });
    };

    const shouldDisableDate = (date) =>
        bookedDates.includes(format(date, 'yyyy-MM-dd')) || isBefore(date, new Date().setHours(0, 0, 0, 0));

    const validationSchema = Yup.object({
        checkInDate: Yup.string().required('Required'),
        checkOutDate: Yup.string().required('Required').test(
            'after-start',
            'Check-out must be after check-in',
            function (value) {
                return isBefore(parseISO(this.parent.checkInDate), parseISO(value));
            }
        ),
    });

    if (!property) return <Typography variant="h4">Property not found</Typography>;

    return (
        <Box sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Card sx={{ maxWidth: 800, width: '100%' }}>
                <ImageGrid images={property.images} />
                <CardContent>
                    <Stack direction="row">
                        <Box sx={{ width: "50%" }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{property.title}</Typography>
                            <Typography variant="body1" color="text.secondary">{property.location_name}</Typography>
                            <Typography variant="body1" color="text.secondary">{property.owner.name}</Typography>
                        </Box>
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
                                    }, { headers: { Authorization: `Bearer ${token}` } });
                                    alert('Booking created successfully');
                                } catch {
                                    alert('Error creating booking. Please try again.');
                                }
                            }}
                        >
                            {({ values, setFieldValue }) => (
                                <Form>
                                    <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                                        {['Check-In', 'Check-Out'].map((label, index) => (
                                            <FormControl fullWidth key={label}>
                                                <DatePicker
                                                    label={label}
                                                    value={parseISO(values[index === 0 ? 'checkInDate' : 'checkOutDate'])}
                                                    onChange={(newValue) =>
                                                        setFieldValue(index === 0 ? 'checkInDate' : 'checkOutDate', format(newValue, 'yyyy-MM-dd'))
                                                    }
                                                    shouldDisableDate={shouldDisableDate}
                                                />
                                            </FormControl>
                                        ))}
                                    </Box>
                                    <Button variant="contained" color="primary" sx={{ marginTop: 2 }} type="submit" disabled={!token}>Book Now</Button>
                                </Form>
                            )}
                        </Formik>
                    </Stack>
                    <Divider sx={{ marginTop: 3 }} />
                    <Typography variant="h6" sx={{ marginTop: 2 }}>Reviews</Typography>
                    {property.reviews.length > 0 ? (
                        property.reviews.map((review) => (
                            <Box key={review.id} sx={{ marginTop: 2, padding: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                                <StarRating rating={review.rating} />
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
