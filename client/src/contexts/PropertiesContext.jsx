import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const PropertiesContext = createContext();
export const useProperties = () => useContext(PropertiesContext);

export const PropertiesProvider = ({ children }) => {
    const [properties, setProperties] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        if (loading || !hasMore) return;

        setLoading(true);

        axios.get(`http://localhost:5000/properties?page=${page}&limit=12`)
            .then(response => {
                const newProperties = response.data.sort(() => Math.random() - 0.5);

                if (newProperties.length === 0) {
                    setHasMore(false); // No more properties to fetch
                } else {
                    setProperties(prevProperties => {
                        const existingIds = new Set(prevProperties.map(p => p.id));
                        const filteredNewProperties = newProperties.filter(p => !existingIds.has(p.id));

                        return [...prevProperties, ...filteredNewProperties];
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching properties:', error);
            })
            .finally(() => {
                setLoading(false);
            });
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
