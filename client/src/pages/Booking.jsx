import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button, TextField, Typography, Box } from "@mui/material";
import { useProfile } from "../contexts/ProfileContext";

const BookingPage = () => {
    const { id } = useParams();
    const { userData } = useProfile();
    const [booking, setBooking] = useState(null);
    const [newEndDate, setNewEndDate] = useState("");

    useEffect(() => {
        if (userData && userData.booked_properties) {
            for (const property of userData.booked_properties) {
                const foundBooking = property.bookings.find(b => b.id === parseInt(id));
                if (foundBooking) {
                    setBooking({ ...foundBooking, propertyTitle: property.title });
                    break;
                }
            }
        }
    }, [userData, id]);

    if (!booking) return <Typography>Loading booking details...</Typography>;

    const today = new Date();
    const startDate = new Date(booking.start_date);
    const endDate = new Date(booking.end_date);

    const handleUpdateEndDate = () => {
        if (new Date(newEndDate) > today) {
            console.log("Updated end date to:", newEndDate);
        }
    };

    const handleCancelBooking = () => {
        console.log("Booking cancelled:", id);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4">Booking Details</Typography>
            <Typography>ID: {booking.id}</Typography>
            <Typography>Start Date: {booking.start_date}</Typography>
            <Typography>End Date: {booking.end_date}</Typography>

            {today < endDate && (
                <Box>
                    <TextField
                        label="New End Date"
                        type="date"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <Button onClick={handleUpdateEndDate} variant="contained" sx={{ ml: 2 }}>
                        Update End Date
                    </Button>
                </Box>
            )}

            {today < startDate && (
                <Button onClick={handleCancelBooking} variant="contained" color="error" sx={{ mt: 2 }}>
                    Cancel Booking
                </Button>
            )}
        </Box>
    );
};

export default BookingPage;