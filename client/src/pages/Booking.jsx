import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
    Button,
    TextField,
    Typography,
    Box,
    Card,
    FormControl,
    CardContent,
    Stack,
    Divider,
} from "@mui/material";
import { Formik, Form } from "formik";
import { DatePicker } from "@mui/x-date-pickers";
import { format, isBefore, isAfter, parseISO, isWithinInterval, startOfDay } from "date-fns";
import * as Yup from "yup";
import ImageGrid from "../components/ImageGrid";
import { useProfile } from "../contexts/ProfileContext";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/axios";
import { useProperties } from "../contexts/PropertiesContext";

const PropertyDescription = ({ property }) => (
    <Stack direction="row">
        <Box sx={{ width: "50%" }}>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>{property.title}</Typography>
            <Typography variant="body1" color="text.secondary">{property.location_name}</Typography>
            <Typography variant="body1" color="text.secondary">{property.owner.name}</Typography>
        </Box>
    </Stack>
);

const BookingDatesForm = ({ booking, bookedDates, handleUpdateBookingDates }) => {
    const today = startOfDay(new Date());
    const startDate = parseISO(booking.start_date);
    const endDate = parseISO(booking.end_date);
    const isPastEndDate = isAfter(today, endDate);
    const isOngoing = isAfter(today, startDate) && !isPastEndDate;

    const isDateDisabled = (date) => {
        return isBefore(date, today) ||
            bookedDates.some(({ start, end }) =>
                isWithinInterval(date, { start, end })
            );
    };

    return (
        <Formik
            enableReinitialize
            initialValues={{ startDate: booking.start_date, endDate: booking.end_date }}
            validationSchema={Yup.object({
                startDate: Yup.string().required("Required"),
                endDate: Yup.string()
                    .required("Required")
                    .test("after-start", "Check-out must be after check-in", function (value) {
                        return isBefore(parseISO(this.parent.startDate), parseISO(value));
                    }),
            })}
            onSubmit={(values, { setSubmitting }) => {
                handleUpdateBookingDates(values.startDate, values.endDate);
                setSubmitting(false);
            }}
        >
            {({ values, setFieldValue, errors, touched, isValid, setFieldTouched }) => (
                <Form>
                    <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
                        <FormControl fullWidth>
                            <DatePicker
                                label="Check-In"
                                value={parseISO(values.startDate)}
                                onChange={(newValue) => {
                                    setFieldValue("startDate", format(newValue, "yyyy-MM-dd"));
                                    setFieldTouched("startDate", true);  // Ensure field is touched for validation
                                }}
                                disabled={isOngoing || isPastEndDate}
                                shouldDisableDate={isDateDisabled}
                                renderInput={(params) => (
                                    <TextField {...params} error={touched.startDate && Boolean(errors.startDate)} helperText={touched.startDate && errors.startDate} />
                                )}
                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <DatePicker
                                label="Check-Out"
                                value={parseISO(values.endDate)}
                                onChange={(newValue) => {
                                    setFieldValue("endDate", format(newValue, "yyyy-MM-dd"));
                                    setFieldTouched("endDate", true);  // Ensure field is touched for validation
                                }}
                                disabled={isPastEndDate}
                                shouldDisableDate={isDateDisabled}
                                renderInput={(params) => (
                                    <TextField {...params} error={touched.endDate && Boolean(errors.endDate)} helperText={touched.endDate && errors.endDate} />
                                )}
                            />
                        </FormControl>
                    </Box>
                    <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }} disabled={isPastEndDate || !isValid}>
                        Update Booking
                    </Button>
                </Form>
            )}
        </Formik>
    );
}

const ReviewForm = ({ token, property, addReview }) => {
    return (
        <>
            <Divider sx={{ marginTop: 3 }} />
            <Typography variant="h6" sx={{ marginTop: 2 }}>Leave a Review</Typography>
            <Formik
                initialValues={{
                    rating: "",
                    comment: "",
                }}
                validationSchema={Yup.object({
                    rating: Yup.number()
                        .required("Required")
                        .min(1, "Minimum rating is 1")
                        .max(5, "Maximum rating is 5"),
                    comment: Yup.string().required("Required"),
                })}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                    try {
                        const { data } = await api.post(
                            "/reviews",
                            {
                                property_id: property.id,
                                rating: values.rating,
                                comment: values.comment,
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );
                        addReview(property.id, data.review);
                        alert("Review submitted successfully!");
                        resetForm()
                    } catch (error) {
                        console.error("Error submitting review:", error);
                        alert(error.message);
                    }
                    setSubmitting(false);
                }}
            >
                {({ values, handleChange, handleBlur, errors, touched, isSubmitting }) => (
                    <Form>
                        <Stack spacing={2} sx={{ marginTop: 2 }}>
                            <TextField
                                label="Rating (1-5)"
                                name="rating"
                                type="number"
                                value={values.rating}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.rating && Boolean(errors.rating)}
                                helperText={touched.rating && errors.rating}
                                inputProps={{ min: 1, max: 5 }}
                                fullWidth
                            />
                            <TextField
                                label="Comment"
                                name="comment"
                                multiline
                                rows={3}
                                value={values.comment}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.comment && Boolean(errors.comment)}
                                helperText={touched.comment && errors.comment}
                                fullWidth
                            />
                            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                                Submit Review
                            </Button>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </>
    );
}

const BookingPage = () => {
    const { id } = useParams();
    const { token, userId } = useAuth();
    const { userData, deleteBooking, editBooking } = useProfile();
    const [booking, setBooking] = useState(null);
    const [property, setProperty] = useState(null);
    const [bookedDates, setBookedDates] = useState([]);
    const today = startOfDay(new Date());
    const navigate = useNavigate();
    const { properties, addReview } = useProperties();
    const [hasReviewed, setHasReviewed] = useState(false);

    useEffect(() => {
        if (userData?.booked_properties) {
            for (const prop of userData.booked_properties) {
                const foundBooking = prop.bookings.find((b) => b.id === parseInt(id, 10));
                if (foundBooking) {
                    setProperty(prop);
                    setBooking(foundBooking);
                    setHasReviewed(prop.reviews?.some(review => review.user_id === parseInt(userId, 10)))
                    break;
                }
            }
        }
    }, [userData, id]);

    useEffect(() => {
        if (property && property.bookings.length) {
            setBookedDates(
                property.bookings
                    .filter(booking => booking.id !== parseInt(id, 10))
                    .map(({ start_date, end_date }) => ({
                        start: parseISO(start_date),
                        end: parseISO(end_date),
                    }))
            );
        }
    }, [property]);

    useEffect(() => {
        const found = properties.find((prop) => property && prop.id === property.id);
        if (found) {
            setHasReviewed(found.reviews?.some(review => review.user_id === parseInt(userId, 10)))
        }
    }, [properties])

    if (!booking) return <Typography>Loading booking details...</Typography>;

    const startDate = parseISO(booking.start_date);
    const endDate = parseISO(booking.end_date);
    const isPastStartDate = isAfter(today, startDate);

    const handleUpdateBookingDates = (newStartDate, newEndDate) => {
        if (isBefore(parseISO(newStartDate), parseISO(newEndDate))) {
            editBooking(id, newStartDate, newEndDate);
        }
    };

    return (
        <Box sx={{ padding: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Card sx={{ maxWidth: 800, width: "100%" }}>
                <ImageGrid images={property.images} />
                <CardContent>
                    <PropertyDescription property={property} />
                    <Divider sx={{ marginTop: 3 }} />

                    <Typography variant="h6" sx={{ marginTop: 2 }}>Edit Booking Dates</Typography>
                    <BookingDatesForm booking={booking} bookedDates={bookedDates} handleUpdateBookingDates={handleUpdateBookingDates} />

                    {isAfter(today, endDate) && !hasReviewed && (
                        <ReviewForm token={token} property={property} addReview={addReview} />
                    )}

                    <Divider sx={{ marginTop: 3 }} />
                    <Typography variant="h6" sx={{ marginTop: 2 }}>Cancel Booking</Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                            deleteBooking(id);
                            navigate('/profile');
                        }}
                        sx={{ marginTop: 2 }}
                        disabled={isPastStartDate}
                    >
                        Delete Booking
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
};

export default BookingPage;
