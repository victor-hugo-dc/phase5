import React, { useContext, useEffect } from 'react';
import { Box } from '@mui/material';
import { PropertiesContext } from '../contexts/PropertiesContext';
import PropertyCard from '../components/PropertyCard';

const Home = () => {
    const { properties, loadMore } = useContext(PropertiesContext);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
                loadMore();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadMore]);

    // Auto-fetch more properties if the content is not filling the page
    useEffect(() => {
        const checkOverflow = () => {
            if (document.body.scrollHeight <= window.innerHeight) {
                loadMore();
            }
        };

        checkOverflow();
    }, [properties]);

    return (
        <Box>
            <Box sx={{ marginTop: 4, px: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                ))}
            </Box>
        </Box>
    );
};

export default Home;
