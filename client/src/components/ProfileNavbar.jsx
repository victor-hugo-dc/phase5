import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Menu,
    MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';


const ProfileNavbar = () => {
    const { token, logout } = useAuth(); // Use AuthContext to get token/userId
    const [anchorEl, setAnchorEl] = useState(null); // State for managing menu
    const navigate = useNavigate();

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        // Handle logout functionality (clear token, userId, etc.)
        logout();
        handleMenuClose();
        navigate('/auth/login');
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

export default ProfileNavbar;
