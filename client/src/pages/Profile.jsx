import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
    const { token, userId, logout } = useAuth();
    
    return (
        <div>
            <h1>{userId}</h1>
        </div>
    );
};

export default Profile;
