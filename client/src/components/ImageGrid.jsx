import React, { useState } from 'react';
import { Grid, Box, Modal, IconButton, Container } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ImageGrid = ({ images }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const getImageGrid = () => {
        if (images.length === 1) {
            return (
                <Grid container>
                    <Grid item xs={12}>
                        <img
                            src={`http://localhost:5000/images/${images[0].image_path}`}
                            alt="Property"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                cursor: 'pointer',
                                margin: 0, // Remove margin
                            }}
                            onClick={() => handleOpen()}
                        />
                    </Grid>
                </Grid>
            );
        }

        if (images.length <= 4) {
            return (
                <Grid container spacing={0}>
                    {images.slice(0, 2).map((image, index) => (
                        <Grid item xs={6} key={index} sx={{ padding: 0 }}>
                            <img
                                src={`http://localhost:5000/images/${image.image_path}`}
                                alt={`Property ${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    cursor: 'pointer',
                                    margin: 0, // Remove margin
                                }}
                                onClick={() => handleOpen()}
                            />
                        </Grid>
                    ))}
                </Grid>
            );
        }

        return (
            <Grid container spacing={0}>
                <Grid item xs={6} sx={{ padding: 0 }}>
                    <img
                        src={`http://localhost:5000/images/${images[0].image_path}`}
                        alt="Property"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            margin: 0, // Remove margin
                        }}
                        onClick={() => handleOpen()}
                    />
                </Grid>
                <Grid item xs={6} container spacing={0}>
                    {images.slice(1, 5).map((image, index) => (
                        <Grid item xs={6} key={index} sx={{ padding: 0 }}>
                            <img
                                src={`http://localhost:5000/images/${image.image_path}`}
                                alt={`Property ${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: 250,
                                    objectFit: 'cover',
                                    cursor: 'pointer',
                                    margin: 0, // Remove margin
                                    padding: 0,
                                }}
                                onClick={() => handleOpen()}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        );
    };

    return (
        <>
            {getImageGrid()}

            <Modal open={open} onClose={handleClose}>
                <Container>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100vh',
                            bgcolor: 'white',
                            position: 'relative',
                            padding: 2,
                            overflowY: 'auto',
                        }}
                    >
                        <IconButton
                            onClick={handleClose}
                            sx={{
                                position: 'absolute',
                                top: 20,
                                right: 20,
                                color: 'black',
                                zIndex: 2,
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                            {images.map((image, index) => (
                                <img
                                    key={index}
                                    src={`http://localhost:5000/images/${image.image_path}`}
                                    alt={`Property ${index + 1}`}
                                    style={{
                                        maxWidth: 500,
                                        maxHeight: '90vh',
                                        objectFit: 'contain',
                                        margin: 10,
                                        cursor: 'pointer',
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                </Container>
            </Modal>
        </>
    );
};

export default ImageGrid;