import { Card, CardContent, CardMedia, Typography } from "@mui/material";

export const PropertyCard = ({ property, onClick }) => (
    <Card key={property.id} sx={{ height: 350, minWidth: 300, objectFit: 'cover', cursor: 'pointer' }} onClick={onClick}>
        <CardMedia
            component="img"
            image={`http://localhost:5000/images/${property.images[0]?.image_path}`}
            alt={property.title}
            sx={{ height: 200, objectFit: 'cover' }}
        />
        <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{property.title}</Typography>
            <Typography variant="body2" color="text.secondary">{property.location_name}</Typography>
            <Typography variant="body2" color="text.secondary">Hosted by: {property.owner?.name}</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>${property.price_per_night.toFixed(2)} per night</Typography>
        </CardContent>
    </Card>
);