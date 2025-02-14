import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box, Typography, Alert, Container, Link } from '@mui/material';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState('');
    const [watchBearImgs, setWatchBearImgs] = useState([]);
    const [hideBearImgs, setHideBearImgs] = useState([]);
    const [currentBearImg, setCurrentBearImg] = useState(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email address').required('Email is required'),
        password: Yup.string().required('Password is required')
    });

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

            {loginError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {loginError}
                </Alert>
            )}

            <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleLogin}
            >
                {({ values, handleChange, handleBlur, touched, errors }) => {
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
                                    name="email"
                                    as={TextField}
                                    label="Email"
                                    variant="outlined"
                                    fullWidth
                                    inputRef={emailRef}
                                    autoFocus
                                    onFocus={() => setCurrentBearImg(watchBearImgs[0])}
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
                                    onFocus={() => {
                                        hideBearImgs.forEach((img, index) =>
                                            setTimeout(() => setCurrentBearImg(img), index * 50)
                                        );
                                    }}
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
                    );
                }}
            </Formik>
        </Container>
    );
};

export default Login;
