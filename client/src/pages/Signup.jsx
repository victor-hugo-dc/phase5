import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box, Typography, Link, Alert, Container } from '@mui/material';

const Signup = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [signupError, setSignupError] = useState('');

    // Validation Schema using Yup
    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        email: Yup.string().email('Invalid email address').required('Email is required'),
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('Password is required')
    });

    const handleSignup = async (values) => {
        try {
            const { name, email, password } = values;
            await axios.post('http://localhost:5000/signup', { name, email, password });

            const isLoginSuccessful = await login(email, password);

            if (isLoginSuccessful) {
                navigate('/profile');
            } else {
                setSignupError('Login failed! Please check your credentials.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            setSignupError('Signup failed: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    return (
        <Container maxWidth="sm" sx={{ padding: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Sign Up
                </Typography>
            </Box>

            {/* Error Message */}
            {signupError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {signupError}
                </Alert>
            )}

            {/* Formik Form */}
            <Formik
                initialValues={{ name: '', email: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSignup}
            >
                {({ values, handleChange, handleBlur, touched, errors, isSubmitting }) => (
                    <Form>
                        <Box sx={{ mb: 3 }}>
                            <Field
                                name="name"
                                as={TextField}
                                label="Name"
                                variant="outlined"
                                fullWidth
                                value={values.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.name && !!errors.name}
                                helperText={touched.name && errors.name}
                            />
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Field
                                name="email"
                                as={TextField}
                                label="Email"
                                variant="outlined"
                                fullWidth
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.email && !!errors.email}
                                helperText={touched.email && errors.email}
                            />
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Field
                                name="password"
                                as={TextField}
                                label="Password"
                                type="password"
                                variant="outlined"
                                fullWidth
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.password && !!errors.password}
                                helperText={touched.password && errors.password}
                            />
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                fullWidth 
                                disabled={isSubmitting}
                                sx={{
                                    padding: '12px',
                                    fontSize: '16px',
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: '#263FBB'
                                    }
                                }}
                            >
                                Sign Up
                            </Button>
                        </Box>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2">
                                Already have an account?{' '}
                                <Link href="/auth/login" sx={{ textDecoration: 'none', fontWeight: '600' }}>
                                    Log In
                                </Link>
                            </Typography>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Container>
    );
};

export default Signup;
