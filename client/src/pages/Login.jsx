import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup'; 
import { TextField, Button, Box, Typography, Alert, Container, Link } from '@mui/material';

const Login = () => {
    const { login } = useAuth(); 
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState('');

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email address').required('Email is required'),
        password: Yup.string().required('Password is required')
    });

    const handleLogin = async (values) => {
        const { email, password } = values;

        try {
            const isLoginSuccessful = await login(email, password);
            if (isLoginSuccessful) {
                navigate('/profile');
            } else {
                setLoginError('Invalid email or password.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setLoginError('Login failed: Please check your credentials.');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ padding: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Login
                </Typography>
            </Box>

            {/* Error Message */}
            {loginError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {loginError}
                </Alert>
            )}

            {/* Formik Form */}
            <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleLogin}
            >
                {({ values, handleChange, handleBlur, touched, errors, isSubmitting }) => (
                    <Form>
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
                                Login
                            </Button>
                        </Box>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2">
                                Don't have an account?{' '}
                                <Link href="/auth/register" sx={{ textDecoration: 'none', fontWeight: '600' }}>
                                    Sign Up
                                </Link>
                            </Typography>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Container>
    );
};

export default Login;
