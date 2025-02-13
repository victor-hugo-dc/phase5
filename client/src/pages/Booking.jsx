import { useParams } from "react-router-dom";
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
import { format, isBefore, isAfter, parseISO } from "date-fns";
import * as Yup from "yup";
import ImageGrid from "../components/ImageGrid";
import { useProfile } from "../contexts/ProfileContext";

const BookingPage = () => {
    const { id } = useParams();
    const { userData, deleteBooking, editBooking } = useProfile();
    const [booking, setBooking] = useState(null);
    const [property, setProperty] = useState(null);
    const today = new Date();

    useEffect(() => {
        if (userData?.booked_properties) {
            for (const prop of userData.booked_properties) {
                const foundBooking = prop.bookings.find((b) => b.id === parseInt(id, 10));
                if (foundBooking) {
                    setProperty(prop);
                    setBooking(foundBooking);
                    break;
                }
            }
        }
    }, [userData, id]);

    if (!booking) return <Typography>Loading booking details...</Typography>;

    const startDate = parseISO(booking.start_date);
    const endDate = parseISO(booking.end_date);
    const isPastEndDate = isAfter(today, endDate);
    const isOngoing = isAfter(today, startDate) && !isPastEndDate;
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
                    <Stack direction="row">
                        <Box sx={{ width: "50%" }}>
                            <Typography variant="h4" sx={{ fontWeight: "bold" }}>{property.title}</Typography>
                            <Typography variant="body1" color="text.secondary">{property.location_name}</Typography>
                            <Typography variant="body1" color="text.secondary">{property.owner.name}</Typography>
                        </Box>
                    </Stack>
                    <Divider sx={{ marginTop: 3 }} />

                    <Typography variant="h6" sx={{ marginTop: 2 }}>Edit Booking Dates</Typography>
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

                    <Divider sx={{ marginTop: 3 }} />
                    <Typography variant="h6" sx={{ marginTop: 2 }}>Cancel Booking</Typography>
                    <Button variant="outlined" color="error" onClick={() => deleteBooking(id)} sx={{ marginTop: 2 }} disabled={isPastStartDate}>
                        Delete Booking
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
};

export default BookingPage;
