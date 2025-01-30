import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    TextField,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { token, userId } = useAuth(); // Use AuthContext to get token/userId
    const [anchorEl, setAnchorEl] = useState(null); // State for managing menu
    const navigate = useNavigate();

    const validationSchema = Yup.object({
        location: Yup.string().required('Location is required'),
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
        // Handle logout functionality (clear token, userId, etc.)
        handleMenuClose();
        navigate('/auth/login');
    };

    return (
        <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', padding: 1 }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                {/* Left Section */}
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                        Phase5
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
                    }}
                >
                    <Formik
                        initialValues={{ location: '', startDate: '', endDate: '' }}
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            console.log('Form Submitted:', values);
                            navigate(
                                `/search?location=${values.location}&start=${values.startDate}&end=${values.endDate}`
                            );
                        }}
                    >
                        {({ values, errors, touched }) => (
                            <Form style={{ display: 'flex', gap: '16px', width: '100%' }}>
                                <Field
                                    as={TextField}
                                    name="location"
                                    label="Location"
                                    variant="outlined"
                                    fullWidth
                                    error={touched.location && !!errors.location}
                                    helperText={touched.location && errors.location}
                                />

                                <Field
                                    as={TextField}
                                    name="startDate"
                                    type="date"
                                    variant="outlined"
                                    fullWidth
                                    error={touched.startDate && !!errors.startDate}
                                    helperText={touched.startDate && errors.startDate}
                                    InputLabelProps={{ shrink: true }}
                                />

                                <Field
                                    as={TextField}
                                    name="endDate"
                                    type="date"
                                    variant="outlined"
                                    fullWidth
                                    error={touched.endDate && !!errors.endDate}
                                    helperText={touched.endDate && errors.endDate}
                                    InputLabelProps={{ shrink: true }}
                                />

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
                    <Avatar
                        alt="Profile"
                        src={token ? '/profile.jpg' : '/grey-circle.jpg'} // Display grey circle if not logged in
                    />
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        {token ? (
                            <>
                                <MenuItem onClick={() => navigate('/')}>Trips</MenuItem>
                                <MenuItem onClick={() => navigate('/')}>Host Your Home</MenuItem>
                                <MenuItem onClick={() => navigate('/me')}>Account</MenuItem>
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
