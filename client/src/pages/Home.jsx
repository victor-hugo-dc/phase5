import React, { useContext } from 'react';
import { Box } from '@mui/material';
import { PropertiesContext } from '../contexts/PropertiesContext';
import PropertyCard from '../components/PropertyCard';

const Home = () => {
    const { properties } = useContext(PropertiesContext);

    return (
        <Box>
            <Box sx={{ marginTop: 4, px: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {properties.map((property) => (
                    <PropertyCard key={property.id} property={property}/>
                ))}
            </Box>
        </Box>
    );
};

export default Home;