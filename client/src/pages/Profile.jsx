import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
    const { token, userId, logout } = useAuth();

    // Ensure we check the token and userId values
    useEffect(() => {
        if (!token || !userId) {
            alert('You are not logged in!');
        }
    }, [token, userId]);

    return (
        <div>
            <h1>Profile</h1>
            <p><strong>Token:</strong> {token || 'No token available'}</p>
            <p><strong>User ID:</strong> {userId || 'No user ID available'}</p>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default Profile;
