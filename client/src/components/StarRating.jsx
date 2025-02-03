import React from 'react';
import { Stack } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const StarRating = ({ rating }) => {
    return (
        <Stack direction="row" spacing={0.5}>
            {[...Array(5)].map((_, index) => (
                index < rating ?
                    <StarIcon key={index} sx={{ color: '#FFC107' }} /> :
                    <StarBorderIcon key={index} sx={{ color: '#FFC107' }} />
            ))}
        </Stack>
    );
};

export default StarRating;
