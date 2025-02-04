import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, List, ListItem, ListItemText, Container, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone'; // Import react-dropzone

const HostHome = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [placeId, setPlaceId] = useState('');
    const { token } = useAuth();
    const { addProperty } = useProfile();
    const navigate = useNavigate();
    const [imagePreviews, setImagePreviews] = useState([]); // Track image previews

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

            const id = await addProperty(formData);
            navigate(`/property/${id}`);
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

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => {
            // Limit to 10 images and update preview state
            if (acceptedFiles.length + formik.values.images.length <= 10) {
                formik.setFieldValue('images', [...formik.values.images, ...acceptedFiles]);
                setImagePreviews([
                    ...imagePreviews,
                    ...acceptedFiles.map((file) => URL.createObjectURL(file))
                ]);
            } else {
                alert("You can upload up to 10 images only.");
            }
        },
        multiple: true,
        accept: 'image/*',
    });

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

                {/* Drag and Drop for Images */}
                <Box
                    {...getRootProps()}
                    sx={{
                        border: '2px dashed #7d8cd6',
                        borderRadius: '8px',
                        padding: '20px',
                        textAlign: 'center',
                        backgroundColor: '#f4f5f7',
                        cursor: 'pointer',
                    }}
                >
                    <input {...getInputProps()} />
                    <Typography variant="body1" color="textSecondary">
                        Drag & Drop Images Here, or Click to Select Files
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        (Max 10 images)
                    </Typography>
                </Box>

                {/* Preview Uploaded Images */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                    {imagePreviews.map((preview, index) => (
                        <Box key={index} sx={{ width: '100px', height: '100px', position: 'relative' }}>
                            <img
                                src={preview}
                                alt={`preview-${index}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                            />
                        </Box>
                    ))}
                </Box>

                <Button type="submit" variant="contained">Host Home</Button>
            </Box>
        </Container>
    );
};

export default HostHome;