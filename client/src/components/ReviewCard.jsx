import { Paper, Typography } from "@mui/material";
import StarRating from "./StarRating";

export const ReviewCard = ({ review }) => (
    <Paper key={review.id} sx={{ minWidth: 300, padding: 2 }}>
        <StarRating rating={review.rating} />
        <Typography>{review.comment}</Typography>
    </Paper>
);
