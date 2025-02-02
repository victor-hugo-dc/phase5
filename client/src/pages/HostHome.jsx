import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, List, ListItem, ListItemText, Container } from '@mui/material';
import { useFormik } from 'formik';
import { useAuth } from '../contexts/AuthContext';

const HostHome = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [placeId, setPlaceId] = useState('');
    const { token } = useAuth();

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            pricePerNight: '',
            location: '',
            images: []
        },
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('description', values.description);
            formData.append('price_per_night', values.pricePerNight);
            formData.append('location', values.location);
            formData.append('place_id', placeId);
            values.images.forEach((image) => formData.append('images', image));

            try {
                const response = await axios.post('http://localhost:5000/properties', formData, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data' 
                    }
                });
                console.log("Home hosted successfully", response.data);
            } catch (error) {
                console.error("Error hosting home", error);
            }
        }
    });

    const handleLocationChange = async (e) => {
        const value = e.target.value;
        formik.setFieldValue('location', value);

        if (value) {
            try {
                const response = await axios.post('http://localhost:5000/autocomplete', { location: value });
                setSuggestions(response.data.suggestions || []);
            } catch (error) {
                console.error("Error fetching autocomplete data", error);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionSelect = async (suggestion) => {
        formik.setFieldValue('location', suggestion.description);
        setPlaceId(suggestion.place_id);
        setSuggestions([]); // Only clear after selection
    };

    const handleImageUpload = (event) => {
        formik.setFieldValue('images', [...event.target.files]);
    };

    return (
        <Container>
            <Box component="form" onSubmit={formik.handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Title" name="title" value={formik.values.title} onChange={formik.handleChange} required />
                <TextField label="Description" name="description" value={formik.values.description} onChange={formik.handleChange} required multiline rows={4} />
                <TextField label="Price per Night" name="pricePerNight" type="number" value={formik.values.pricePerNight} onChange={formik.handleChange} required />
                
                {/* Location Input Wrapper */}
                <Box sx={{ position: 'relative' }}>
                    <TextField label="Location" name="location" value={formik.values.location} onChange={handleLocationChange} required fullWidth />
                    
                    {suggestions.length > 0 && (
                        <Box sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #E5E5E5',
                            borderRadius: '8px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            zIndex: 10, // Ensure it's above other elements
                        }}>
                            <List sx={{ padding: 0 }}>
                                {suggestions.map((suggestion) => (
                                    <ListItem
                                        button
                                        key={suggestion.place_id}
                                        onClick={() => handleSuggestionSelect(suggestion)}
                                        sx={{ padding: '8px 16px', color: 'black' }} // Added padding for each item
                                    >
                                        <ListItemText primary={suggestion.description} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </Box>

                <input type="file" multiple onChange={handleImageUpload} />
                <Button type="submit" variant="contained">Host Home</Button>
            </Box>
        </Container>
    );
};

export default HostHome;
