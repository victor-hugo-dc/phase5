import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import Router from './routes';

function App() {
    return (
        <AuthProvider>
            <ProfileProvider>
                <Router />
            </ProfileProvider>
        </AuthProvider>
    );
}

export default App;
