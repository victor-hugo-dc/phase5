import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    TextField,
    IconButton,
    Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import { DatePicker } from '@mui/x-date-pickers';

const Navbar = () => {
    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);

    return (
        <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', padding: 1 }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                {/* Left Section */}
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                    Phase5
                </Typography>

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
                    <TextField
                        placeholder="Search destinations"
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        fullWidth
                        sx={{ fontSize: '14px' }}
                    />
                    <Divider orientation="vertical" flexItem />
                    <DatePicker
                        value={checkIn}
                        onChange={setCheckIn}
                        minDate={new Date()}
                        label="Check-in"
                    />
                    <Divider orientation="vertical" flexItem />
                    <DatePicker
                        label="Check-out"
                        value={checkOut}
                        onChange={(newValue) => setCheckOut(newValue)}
                        minDate={new Date()} // Restrict past dates
                    />
                    <IconButton sx={{ backgroundColor: '#FF385C', color: 'white', borderRadius: '50%', marginLeft: 2 }}>
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
    )
}

export default Navbar;