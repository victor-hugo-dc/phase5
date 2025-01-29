import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the Context
export const PropertiesContext = createContext();

export const PropertiesProvider = ({ children }) => {
    const [properties, setProperties] = useState([]);

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
        <PropertiesContext.Provider value={{ properties }}>
            {children}
        </PropertiesContext.Provider>
    );
};