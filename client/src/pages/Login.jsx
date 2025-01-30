import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup'; 
import { TextField, Button, Box } from '@mui/material';

const Login = () => {
    const { login } = useAuth(); 
    const navigate = useNavigate();

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email address').required('Email is required'),
        password: Yup.string().required('Password is required')
    });

    const handleLogin = async (values) => {
        const { email, password } = values;

        const isLoginSuccessful = await login(email, password);

        if (isLoginSuccessful) {
            navigate('/profile');
        } else {
            alert('Login failed! Please check your credentials.');
        }
    };

    return (
        <Box sx={{ width: 400, margin: '0 auto', padding: 2 }}>
            <h2>Login</h2>
            <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleLogin}
            >
                {({ values, handleChange, handleBlur }) => (
                    <Form>
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
                                error={!!values.password && values.password.length < 1}
                                helperText={<ErrorMessage name="password" />}
                            />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Button type="submit" variant="contained" fullWidth>
                                Login
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};

export default Login;
