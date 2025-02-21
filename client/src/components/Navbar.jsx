import React, { useContext, useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    TextField,
    IconButton,
    Menu,
    MenuItem,
    FormControl,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { format, isBefore, parseISO } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers';
import api from '../utils/axios';
import { PropertiesContext } from '../contexts/PropertiesContext';

const Navbar = () => {
    const { token, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const [location, setLocation] = useState('');
    const [placeId, setPlaceId] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const { setProperties } = useContext(PropertiesContext);
    const navigate = useNavigate();

    const validationSchema = Yup.object({
        location: Yup.string(),
        startDate: Yup.date().required('Start date is required').typeError('Invalid date'),
        endDate: Yup.date()
            .required('End date is required')
            .typeError('Invalid date')
            .min(Yup.ref('startDate'), 'End date must be after start date'),
    });

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate('/auth/login');
    };

    const shouldDisableDate = (date) => {
        return isBefore(date, new Date().setHours(0, 0, 0, 0));
    };

    const handleLocationChange = async (e) => {
        const value = e.target.value;
        setLocation(value);

        if (value) {
            try {
                const response = await api.post('/autocomplete', { location: value });
                setSuggestions(response.data.suggestions || []);
            } catch (error) {
                console.error("Error fetching autocomplete data", error);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionSelect = (suggestion) => {
        setLocation(suggestion.description); // Set the selected location in the input
        setPlaceId(suggestion.place_id); // Store the place_id
        setSuggestions([]); // Clear suggestions
    };

    return (
        <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', padding: 1 }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                {/* Left Section */}
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                        CampusNest
                    </Typography>
                </Link>

                {/* Search Section */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        border: '1px solid #E5E5E5',
                        borderRadius: '12px',
                        padding: '8px 16px',
                        flex: 1,
                        maxWidth: '800px',
                        mx: 4,
                        position: 'relative', // To position the suggestion list relative to the input
                    }}
                >
                    <Formik
                        initialValues={{ location: '', startDate: '', endDate: '' }}
                        validationSchema={validationSchema}
                        onSubmit={async (values) => {
                            try {
                                const requestData = {
                                    place_id: placeId, // place_id from the selected suggestion
                                    start_date: values.startDate,
                                    end_date: values.endDate,
                                };
            
                                const response = await api.post('/search', requestData);
            
                                setProperties(response.data.available_properties);
            
                            } catch (error) {
                                console.error('Error posting to search:', error);
                            }
                        }}
                    >
                        {({ values, errors, touched, setFieldValue }) => (
                            <Form style={{ display: 'flex', gap: '16px', width: '100%' }}>
                                <Field
                                    as={TextField}
                                    name="location"
                                    label="Location"
                                    variant="outlined"
                                    fullWidth
                                    value={location}
                                    onChange={handleLocationChange}
                                    error={touched.location && !!errors.location}
                                    helperText={touched.location && errors.location}
                                />

                                {/* Display location suggestions */}
                                {suggestions.length > 0 && (
                                    <Box sx={{
                                        position: 'absolute',
                                        top: '100%', // Position the list below the input
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

                                <FormControl fullWidth>
                                    <DatePicker
                                        label="Check-In"
                                        value={values.startDate ? parseISO(values.startDate) : null}
                                        onChange={(newValue) => setFieldValue('startDate', format(newValue, 'yyyy-MM-dd'))}
                                        shouldDisableDate={shouldDisableDate}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                error={touched.startDate && !!errors.startDate}
                                                helperText={touched.startDate && errors.startDate}
                                            />
                                        )}
                                    />
                                </FormControl>

                                <FormControl fullWidth>
                                    <DatePicker
                                        label="Check-Out"
                                        value={values.endDate ? parseISO(values.endDate) : null}
                                        onChange={(newValue) => setFieldValue('endDate', format(newValue, 'yyyy-MM-dd'))}
                                        shouldDisableDate={shouldDisableDate}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                error={touched.endDate && !!errors.endDate}
                                                helperText={touched.endDate && errors.endDate}
                                            />
                                        )}
                                    />
                                </FormControl>

                                <IconButton type="submit">
                                    <SearchIcon />
                                </IconButton>
                            </Form>
                        )}
                    </Formik>
                </Box>

                {/* Right Section */}
                <Box display="flex" alignItems="center" gap={2}>
                    <IconButton onClick={handleMenuClick}>
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        {token ? (
                            <>
                                <MenuItem onClick={() => navigate('/host-home')}>Host Your Home</MenuItem>
                                <MenuItem onClick={() => navigate('/profile')}>Account</MenuItem>
                                <MenuItem onClick={handleLogout}>Log Out</MenuItem>
                            </>
                        ) : (
                            <>
                                <MenuItem onClick={() => navigate('/auth/register')}>Sign Up</MenuItem>
                                <MenuItem onClick={() => navigate('/auth/login')}>Log In</MenuItem>
                            </>
                        )}
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
