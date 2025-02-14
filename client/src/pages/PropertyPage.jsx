import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format, addDays, isBefore, parseISO } from 'date-fns';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import ImageGrid from '../components/ImageGrid';
import StarRating from '../components/StarRating';
import { useProfile } from '../contexts/ProfileContext';

const PropertyPage = () => {
    const { properties } = useContext(PropertiesContext);
    const { token, userId } = useAuth();
    const { id } = useParams();
    const { addBooking, editProperty, deleteProperty } = useProfile();

    const [property, setProperty] = useState(properties.find((p) => p.id.toString() === id) || null);
    const [loading, setLoading] = useState(!property);
    const [bookedDates, setBookedDates] = useState([]);
    const [defaultDates, setDefaultDates] = useState({ checkInDate: '', checkOutDate: '' });

    // Fetch property if not found in context
    useEffect(() => {
        if (!property) {
            axios.get(`http://localhost:5000/properties/${id}`)
                .then((res) => {
                    setProperty(res.data);
                    console.log(res.data.owner.id);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [id, property]);

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
        let consecutiveCount = 0;
        let availableStart = null;

        // Find the first 5 contiguous available days
        while (consecutiveCount <= 5) {
            if (!booked.includes(format(start, 'yyyy-MM-dd'))) {
                if (consecutiveCount === 0) availableStart = start;  // Mark the start of the available dates
                consecutiveCount++;
            } else {
                consecutiveCount = 0;  // Reset counter if a booked day is found
            }
            start = addDays(start, 1);
        }

        setDefaultDates({
            checkInDate: format(availableStart, 'yyyy-MM-dd'),
            checkOutDate: format(addDays(availableStart.setHours(0, 0, 0), 5), 'yyyy-MM-dd'),
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

    if (loading) return <Typography variant="h4">Loading...</Typography>;
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
                    </Stack>

                    <Divider sx={{ marginTop: 3 }} />

                    {parseInt(userId, 10) === property.owner.id ? (
                        <OwnerView property={property} editProperty={editProperty} setProperty={setProperty} deleteProperty={deleteProperty}/>
                    ) : (
                        <GuestBookingForm
                            property={property}
                            userId={userId}
                            token={token}
                            defaultDates={defaultDates}
                            shouldDisableDate={shouldDisableDate}
                            validationSchema={validationSchema}
                            addBooking={addBooking}
                        />
                    )}

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

const GuestBookingForm = ({ property, userId, token, defaultDates, shouldDisableDate, validationSchema, addBooking }) => {
    const [numberOfNights, setNumberOfNights] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [cleaningFee, setCleaningFee] = useState(0);
    const [bookingFee, setBookingFee] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);

    const calculatePrices = (checkInDate, checkOutDate) => {
        const checkIn = parseISO(checkInDate);
        const checkOut = parseISO(checkOutDate);
        const nights = Math.floor((checkOut - checkIn) / (1000 * 60 * 60 * 24)); // Calculate the number of nights

        setNumberOfNights(nights);

        const priceForStay = parseFloat(property.price_per_night) * nights;
        const cleaning = priceForStay * 0.03;
        const booking = priceForStay * 0.02;
        const total = priceForStay + cleaning + booking;

        setTotalPrice(priceForStay);
        setCleaningFee(cleaning);
        setBookingFee(booking);
        setGrandTotal(total);
    };

    const navigate = useNavigate();
    return (
        <Formik
            enableReinitialize
            initialValues={defaultDates}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                const booking = await addBooking(property.id, values.checkInDate, values.checkOutDate);
                navigate(`/booking/${booking.id}`);
            }}
        >
            {({ values, setFieldValue }) => {
                // Call calculatePrices when dates change
                useEffect(() => {
                    if (values.checkInDate && values.checkOutDate) {
                        calculatePrices(values.checkInDate, values.checkOutDate);
                    }
                }, [values.checkInDate, values.checkOutDate]);

                return (
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

                        {/* Display pricing details */}
                        <TableContainer component={Paper} sx={{ marginTop: 3 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Item</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Total Price ({numberOfNights} night{numberOfNights > 1 ? 's' : ''})</TableCell>
                                        <TableCell align="right">${totalPrice.toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Cleaning Fee (3%)</TableCell>
                                        <TableCell align="right">${cleaningFee.toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Booking Fee (2%)</TableCell>
                                        <TableCell align="right">${bookingFee.toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>Total</strong></TableCell>
                                        <TableCell align="right"><strong>${grandTotal.toFixed(2)}</strong></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button variant="contained" color="primary" sx={{ marginTop: 2 }} type="submit" disabled={!token}>Book Now</Button>
                    </Form>
                );
            }}
        </Formik>
    );
};


// Component for property owners managing bookings
const OwnerView = ({ property, editProperty, setProperty, deleteProperty }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: property.title,
        location_name: property.location_name,
        description: property.description,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const prop = await editProperty(property.id, formData);
            setProperty(prop);
            setIsEditing(false);
            alert("Property updated successfully");
        } catch {
            alert("Error updating property");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteProperty(property.id);
            alert("Property deleted successfully");
            navigate("/"); // Redirect after deletion
        } catch {
            alert("Error deleting property");
        }
    };

    return (
        <Box sx={{ marginTop: 3 }}>
            <Typography variant="h6">Manage Property</Typography>
            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        sx={{ marginBottom: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Location"
                        name="location_name"
                        value={formData.location_name}
                        onChange={handleInputChange}
                        sx={{ marginBottom: 2 }}
                        disabled={true}
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        multiline
                        rows={4}
                        sx={{ marginBottom: 2 }}
                    />
                    <Button type="submit" variant="contained" color="primary">
                        Save Changes
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outlined" sx={{ marginLeft: 2 }}>
                        Cancel
                    </Button>
                </form>
            ) : (
                <Button variant="contained" color="warning" onClick={() => setIsEditing(true)}>
                    Edit Property Listing
                </Button>
            )}
            <Box sx={{ marginTop: 2 }}>
                <Button variant="contained" color="error" onClick={handleDelete}>
                    Delete Property
                </Button>
            </Box>
        </Box>
    );
};

export default PropertyPage;
