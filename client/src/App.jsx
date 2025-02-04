import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import Router from './routes';
import { PropertiesProvider } from './contexts/PropertiesContext';

function App() {
    return (
        <PropertiesProvider>
            <AuthProvider>
                <ProfileProvider>
                    <Router />
                </ProfileProvider>
            </AuthProvider>
        </PropertiesProvider>
    );
}

export default App;
