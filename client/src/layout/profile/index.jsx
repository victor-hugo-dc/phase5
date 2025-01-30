import { Stack } from '@mui/material';
import React from 'react';
import { Outlet } from 'react-router-dom';
import ProfileNavbar from '../../components/ProfileNavbar';

const ProfileLayout = () => {
    return (
        <Stack>
            <ProfileNavbar />
            <Outlet />
        </Stack>
    )
}

export default ProfileLayout;