import React, { useRef } from 'react';
import { Box, Typography, IconButton, Divider } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

export const HorizontalScrollList = ({ title, items, renderItem }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
            scrollRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <>
            <Typography variant="h5" sx={{ mb: 2 }}>{title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <IconButton onClick={() => scroll('left')}><ArrowBackIos /></IconButton>
                <Box ref={scrollRef} sx={{ display: 'flex', overflowX: 'hidden', gap: 2, flexGrow: 1, py: 2 }}>
                    {items.length > 0 ? items.map(renderItem) : <Typography>No {title.toLowerCase()} found.</Typography>}
                </Box>
                <IconButton onClick={() => scroll('right')}><ArrowForwardIos /></IconButton>
            </Box>
            <Divider sx={{ my: 3 }} />
        </>
    );
};