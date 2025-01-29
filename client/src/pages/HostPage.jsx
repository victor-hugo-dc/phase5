import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { PropertiesContext } from '../contexts/PropertiesContext';
import { Box, Typography, Avatar, Card, CardContent } from '@mui/material';

const HostPage = () => {
    const { properties } = useContext(PropertiesContext);
    const { id } = useParams();

    const hostProperties = properties.filter((p) => p.owner?.id.toString() === id);
    const host = hostProperties.length > 0 ? hostProperties[0].owner : null;

    if (!host) {
        return <Typography variant="h4">Host not found</Typography>;
    }

    return (
        <Box sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar src={host.profile_image} sx={{ width: 100, height: 100, marginBottom: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {host.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ marginTop: 1 }}>
                {host.bio || "This host has not added a bio yet."}
            </Typography>

            <Typography variant="h5" sx={{ marginTop: 4, fontWeight: 'bold' }}>
                Properties hosted by {host.name}
            </Typography>

            <Box sx={{ marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                {hostProperties.map((property) => (
                    <Card key={property.id} sx={{ width: 300 }}>
                        <CardContent>
                            <Typography variant="h6">
                                <a href={`/property/${property.id}`} style={{ textDecoration: 'none', color: '#000' }}>
                                    {property.title}
                                </a>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {property.location_name}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};

export default HostPage;
