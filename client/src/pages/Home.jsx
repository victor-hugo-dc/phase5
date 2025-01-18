import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Button,
    Container,
    TextField,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const Home = () => {
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);

    // Fetch properties from the correct endpoint
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await axios.get('http://localhost:5000/properties');
                setProperties(response.data);
                setFilteredProperties(response.data); // Display all properties initially
            } catch (error) {
                console.error('Error fetching properties:', error);
            }
        };

        fetchProperties();
    }, []);

    // Form validation schema
    const FilterSchema = Yup.object().shape({
        location: Yup.string().required('Location is required'),
        startDate: Yup.date().required('Start date is required'),
        endDate: Yup.date()
            .required('End date is required')
            .min(Yup.ref('startDate'), 'End date must be after start date'),
    });

    // Filter handler
    const handleFilter = (values) => {
        const { location, startDate, endDate } = values;
        const filtered = properties.filter(
            (property) =>
                property.location.toLowerCase().includes(location.toLowerCase()) &&
                new Date(property.availableFrom) <= new Date(startDate) &&
                new Date(property.availableTo) >= new Date(endDate)
        );
        setFilteredProperties(filtered);
    };

    return (
        <Box>
            {/* Navbar */}
            <AppBar position="static" color="primary" sx={{ marginBottom: 4 }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Property Finder
                    </Typography>
                    <Formik
                        initialValues={{
                            location: '',
                            startDate: '',
                            endDate: '',
                        }}
                        validationSchema={FilterSchema}
                        onSubmit={handleFilter}
                    >
                        {({ errors, touched }) => (
                            <Form style={{ display: 'flex', gap: '16px' }}>
                                <Field
                                    as={TextField}
                                    name="location"
                                    label="Location"
                                    variant="outlined"
                                    size="small"
                                    error={touched.location && Boolean(errors.location)}
                                    helperText={touched.location && errors.location}
                                />
                                <Field
                                    as={TextField}
                                    name="startDate"
                                    type="date"
                                    variant="outlined"
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    error={touched.startDate && Boolean(errors.startDate)}
                                    helperText={touched.startDate && errors.startDate}
                                />
                                <Field
                                    as={TextField}
                                    name="endDate"
                                    type="date"
                                    variant="outlined"
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    error={touched.endDate && Boolean(errors.endDate)}
                                    helperText={touched.endDate && errors.endDate}
                                />
                                <Button type="submit" variant="contained" color="secondary">
                                    Filter
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Toolbar>
            </AppBar>

            {/* Property Cards */}
            <Container>
                <Grid container spacing={4}>
                    {filteredProperties.length > 0 ? (
                        filteredProperties.map((property) => (
                            <Grid item xs={12} sm={6} md={4} key={property.id}>
                                <Card>
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={property.image || '/placeholder.jpg'}
                                        alt={property.name}
                                    />
                                    <CardContent>
                                        <Typography variant="h6" component="div">
                                            {property.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {property.description}
                                        </Typography>
                                        <Typography variant="body1" sx={{ marginTop: 1 }}>
                                            Location: {property.location}
                                        </Typography>
                                        <Typography variant="body1">
                                            Price: ${property.price_per_night} / night
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography variant="h6" align="center" sx={{ width: '100%', marginTop: 4 }}>
                            No properties found. Try adjusting your filters.
                        </Typography>
                    )}
                </Grid>
            </Container>
        </Box>
    );
};

export default Home;
