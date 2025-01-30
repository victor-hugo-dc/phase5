import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Router from './routes';

function App() {
    return (
        <AuthProvider>
            <Router />
        </AuthProvider>
    );
}

export default App;
