import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the Context
export const PropertiesContext = createContext();

export const PropertiesProvider = ({ children }) => {
    const [properties, setProperties] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchProperties = async () => {
            if (loading || !hasMore) return;

            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/properties?page=${page}&limit=12`);
                const newProperties = response.data;

                if (newProperties.length === 0) {
                    setHasMore(false); // No more properties to fetch
                } else {
                    setProperties(prevProperties => {
                        const existingIds = new Set(prevProperties.map(p => p.id));
                        const filteredNewProperties = newProperties.filter(p => !existingIds.has(p.id));

                        return [...prevProperties, ...filteredNewProperties];
                    });
                }
            } catch (error) {
                console.error('Error fetching properties:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [page]);

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    return (
        <PropertiesContext.Provider value={{ properties, loadMore, setProperties }}>
            {children}
        </PropertiesContext.Provider>
    );
};
