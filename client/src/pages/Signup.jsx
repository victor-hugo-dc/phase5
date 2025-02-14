import React, { useState, useEffect, useRef } from 'react';
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
    const [watchBearImgs, setWatchBearImgs] = useState([]);
    const [hideBearImgs, setHideBearImgs] = useState([]);
    const [currentBearImg, setCurrentBearImg] = useState(null);
    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    useEffect(() => {
        const loadImages = (glob, setState) => {
            setState(
                Object.values(glob)
                    .map(asset => asset.default)
                    .sort((a, b) =>
                        (parseInt(a.match(/(\d+)-.*\.png$/)?.[1] || "0") - parseInt(b.match(/(\d+)-.*\.png$/)?.[1] || "0"))
                    )
            );
        };

        loadImages(import.meta.glob("../assets/img/watch_bear_*.png", { eager: true }), setWatchBearImgs);
        loadImages(import.meta.glob("../assets/img/hide_bear_*.png", { eager: true }), setHideBearImgs);
    }, []);

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
                navigate('/');
            } else {
                setSignupError('Login failed! Please check your credentials.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            setSignupError('Signup failed: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    return (
        <Container maxWidth="sm"
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
            }}
        >
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
                {({ values, handleChange, handleBlur, touched, errors, isSubmitting }) => {
                    useEffect(() => {
                        if (values.name.length > 0) {
                            const index = Math.min(Math.floor(((values.name.length * 4) / 400) * watchBearImgs.length - 1), watchBearImgs.length - 1)
                            setCurrentBearImg(watchBearImgs[index] || watchBearImgs[0]);
                        }
                    }, [values.email, watchBearImgs]);

                    useEffect(() => {
                        if (values.email.length > 0) {
                            const index = Math.min(Math.floor(((values.email.length * 4) / 400) * watchBearImgs.length - 1), watchBearImgs.length - 1)
                            setCurrentBearImg(watchBearImgs[index] || watchBearImgs[0]);
                        }
                    }, [values.email, watchBearImgs]);
                    return (
                        <Form>
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <img src={currentBearImg ?? watchBearImgs[0]} className="rounded-full" width={130} height={130} tabIndex={-1} alt="Bear Reaction" />
                            </Box>
                            <Box sx={{ mb: 3 }}>
                                <Field
                                    name="name"
                                    as={TextField}
                                    label="Name"
                                    variant="outlined"
                                    fullWidth
                                    inputRef={nameRef}
                                    value={values.name}
                                    onChange={(e) => {
                                        handleChange(e);
                                        const index = Math.min(Math.floor(((e.target.value.length * 8) / 400) * watchBearImgs.length), watchBearImgs.length - 1);
                                        setCurrentBearImg(watchBearImgs[index] || watchBearImgs[0]);
                                    }}
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
                                    inputRef={emailRef}
                                    value={values.email}
                                    onChange={(e) => {
                                        handleChange(e);
                                        const index = Math.min(Math.floor(((e.target.value.length * 8) / 400) * watchBearImgs.length), watchBearImgs.length - 1);
                                        setCurrentBearImg(watchBearImgs[index] || watchBearImgs[0]);
                                    }}
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
                                    inputRef={passwordRef}
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onFocus={() => {
                                        hideBearImgs.forEach((img, index) =>
                                            setTimeout(() => setCurrentBearImg(img), index * 50)
                                        );
                                    }}
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
                                        backgroundColor: '#cce08b',
                                        padding: '12px',
                                        fontSize: '16px',
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: '#cce08b'
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
                    )
                }}
            </Formik>
        </Container>
    );
};

export default Signup;
