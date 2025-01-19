import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Card,
    CardContent,
    Grid2,
    TextField,
    IconButton,
    Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import axios from 'axios';
import { DatePicker } from '@mui/x-date-pickers';

const Home = () => {
    const [properties, setProperties] = useState([]);
    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await axios.get('http://localhost:5000/properties');
                setProperties(response.data);
            } catch (error) {
                console.error('Error fetching properties:', error);
            }
        };

        fetchProperties();
    }, []);

    return (
        <Box>
            {/* Navbar */}
            <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', padding: 1 }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    {/* Left Section */}
                    <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                            Phase5
                        </Typography>
                    </Box>

                    {/* Search Section */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            border: '1px solid #E5E5E5',
                            borderRadius: '50px',
                            padding: '8px 16px',
                            flex: 1,
                            maxWidth: '800px',
                            mx: 4,
                        }}
                    >
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#717171' }}>
                                Where
                            </Typography>
                            <TextField
                                placeholder="Search destinations"
                                variant="standard"
                                InputProps={{ disableUnderline: true }}
                                fullWidth
                                sx={{ fontSize: '14px' }}
                            />
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#717171' }}>
                                Check in
                            </Typography>
                            <DatePicker
                                value={checkIn}
                                onChange={(newValue) => setCheckIn(newValue)}
                                minDate={new Date()} // Restrict past dates
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="standard"
                                        placeholder="Add Dates" // Set placeholder
                                        fullWidth
                                        InputProps={{ disableUnderline: true }}
                                    />
                                )}
                            />
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#717171' }}>
                                Check out
                            </Typography>
                            <DatePicker
                                value={checkOut}
                                onChange={(newValue) => setCheckOut(newValue)}
                                minDate={new Date()} // Restrict past dates
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="standard"
                                        placeholder="Add Dates" // Set placeholder
                                        fullWidth
                                        InputProps={{ disableUnderline: true }}
                                    />
                                )}
                            />
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#717171' }}>
                                Who
                            </Typography>
                            <TextField
                                placeholder="Add guests"
                                variant="standard"
                                InputProps={{ disableUnderline: true }}
                                fullWidth
                                sx={{ fontSize: '14px' }}
                            />
                        </Box>
                        <IconButton
                            sx={{
                                backgroundColor: '#FF385C',
                                color: 'white',
                                borderRadius: '50%',
                                marginLeft: 2,
                            }}
                        >
                            <SearchIcon />
                        </IconButton>
                    </Box>

                    {/* Right Section */}
                    <Box display="flex" alignItems="center" gap={2}>
                        <IconButton>
                            <MenuIcon />
                        </IconButton>
                        <Avatar alt="Profile" src="/profile.jpg" />
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Property Cards */}
            <Box sx={{ marginTop: 4, px: 2 }}>
                <Grid2 container spacing={2}>
                    {properties.map((property) => (
                        <Grid2 item xs={12} sm={6} md={4} lg={3} key={property.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    boxShadow: 3,
                                    borderRadius: 2,
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                                        {property.name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ marginTop: 1 }}
                                    >
                                        {property.location}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{ marginTop: 2, fontWeight: 'bold' }}
                                    >
                                        ${property.price_per_night} / night
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid2>
                    ))}
                </Grid2>
            </Box>
        </Box>
    );
};

export default Home;
