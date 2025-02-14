import React, { useState } from "react";
import { Grid, Box, Modal, IconButton, Container } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ImageGrid = ({ images }) => {
    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);

    return (
        <>
            <Grid container spacing={0}>
                {images.slice(0, Math.min(2, images.length)).map((image, index) => (
                    <Grid item xs={images.length === 1 ? 12 : 6} key={index} sx={{ padding: 0 }}>
                        <img
                            src={`http://localhost:5000/images/${image.image_path}`}
                            alt={`Property ${index + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
                            onClick={() => setOpen(true)}
                        />
                    </Grid>
                ))}
            </Grid>

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