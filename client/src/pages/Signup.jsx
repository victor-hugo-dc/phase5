import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box } from '@mui/material';

const Signup = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

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
            // Sending the signup request to your Flask API
            const response = await axios.post('http://localhost:5000/signup', {
                name,
                email,
                password
            });

            // On successful signup, log in the user with the response token
            const { access_token, user_id } = response.data;
            login(access_token, user_id);

            // Redirect to the profile page
            navigate('/profile');
        } catch (error) {
            console.error('Signup error:', error);
            alert('Signup failed: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    return (
        <Box sx={{ width: 400, margin: '0 auto', padding: 2 }}>
            <h2>Sign Up</h2>
            <Formik
                initialValues={{ name: '', email: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSignup}
            >
                {({ values, handleChange, handleBlur }) => (
                    <Form>
                        <Box sx={{ mb: 2 }}>
                            <Field
                                name="name"
                                as={TextField}
                                label="Name"
                                variant="outlined"
                                fullWidth
                                value={values.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={!!values.name && values.name.length < 1}
                                helperText={<ErrorMessage name="name" />}
                            />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Field
                                name="email"
                                as={TextField}
                                label="Email"
                                variant="outlined"
                                fullWidth
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={!!values.email && values.email.length < 1}
                                helperText={<ErrorMessage name="email" />}
                            />
                        </Box>

                        <Box sx={{ mb: 2 }}>
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
                                error={!!values.password && values.password.length < 6}
                                helperText={<ErrorMessage name="password" />}
                            />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Button type="submit" variant="contained" fullWidth>
                                Sign Up
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};

export default Signup;
