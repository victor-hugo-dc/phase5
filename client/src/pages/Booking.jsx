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
import { format, isBefore, parseISO } from "date-fns";
import * as Yup from "yup";
import ImageGrid from "../components/ImageGrid";
import { useProfile } from "../contexts/ProfileContext";

const BookingPage = () => {
    const { id } = useParams();
    const { userData, deleteBooking } = useProfile();
    const [booking, setBooking, editBooking] = useState(null);
    const [property, setProperty] = useState(null);

    useEffect(() => {
        if (userData && userData.booked_properties) {
            for (const prop of userData.booked_properties) {
                const foundBooking = prop.bookings.find(
                    (b) => b.id === parseInt(id, 10)
                );
                if (foundBooking) {
                    setProperty(prop);
                    setBooking(foundBooking);
                    break;
                }
            }
        }
    }, [userData, id]);

    if (!booking) return <Typography>Loading booking details...</Typography>;

    const today = new Date();

    const handleUpdateBookingDates = (newStartDate, newEndDate) => {
        if (isBefore(parseISO(newStartDate), parseISO(newEndDate))) {
            editBooking(id, newStartDate, newEndDate);
            setBooking({
                ...booking,
                start_date: newStartDate,
                end_date: newEndDate,
            });
        } else {
            console.error("Invalid dates: Check-out must be after Check-in.");
        }
    };

    const handleCancelBooking = () => {
        console.log("Booking cancelled:", id);
        deleteBooking(id);
    };

    return (
        <Box
            sx={{
                padding: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <Card sx={{ maxWidth: 800, width: "100%" }}>
                <ImageGrid images={property.images} />
                <CardContent>
                    <Stack direction="row">
                        <Box sx={{ width: "50%" }}>
                            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                                {property.title}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {property.location_name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {property.owner.name}
                            </Typography>
                        </Box>
                    </Stack>

                    <Divider sx={{ marginTop: 3 }} />

                    {/* Form to edit the booking dates */}
                    <Typography variant="h6" sx={{ marginTop: 2 }}>
                        Edit Booking Dates
                    </Typography>
                    <Formik
                        enableReinitialize
                        initialValues={{
                            startDate: booking.start_date,
                            endDate: booking.end_date,
                        }}
                        validationSchema={Yup.object({
                            startDate: Yup.string().required("Required"),
                            endDate: Yup.string()
                                .required("Required")
                                .test(
                                    "after-start",
                                    "Check-out must be after check-in",
                                    function (value) {
                                        return isBefore(
                                            parseISO(this.parent.startDate),
                                            parseISO(value)
                                        );
                                    }
                                ),
                        })}
                        onSubmit={(values, { setSubmitting }) => {
                            handleUpdateBookingDates(values.startDate, values.endDate);
                            setSubmitting(false);
                        }}
                    >
                        {({ values, setFieldValue, errors, touched }) => (
                            <Form>
                                <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
                                    <FormControl fullWidth>
                                        <DatePicker
                                            label="Check-In"
                                            value={parseISO(values.startDate)}
                                            onChange={(newValue) =>
                                                setFieldValue(
                                                    "startDate",
                                                    format(newValue, "yyyy-MM-dd")
                                                )
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    error={touched.startDate && Boolean(errors.startDate)}
                                                    helperText={touched.startDate && errors.startDate}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <DatePicker
                                            label="Check-Out"
                                            value={parseISO(values.endDate)}
                                            onChange={(newValue) =>
                                                setFieldValue("endDate", format(newValue, "yyyy-MM-dd"))
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    error={touched.endDate && Boolean(errors.endDate)}
                                                    helperText={touched.endDate && errors.endDate}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                </Box>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    sx={{ marginTop: 2 }}
                                >
                                    Update Booking
                                </Button>
                            </Form>
                        )}
                    </Formik>

                    <Divider sx={{ marginTop: 3 }} />

                    {/* Section to cancel/delete the booking */}
                    <Typography variant="h6" sx={{ marginTop: 2 }}>
                        Cancel Booking
                    </Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleCancelBooking}
                        sx={{ marginTop: 2 }}
                    >
                        Delete Booking
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
};

export default BookingPage;