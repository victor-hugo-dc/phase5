import { Container } from '@mui/material';
import React from 'react';
import { TailSpin } from 'react-loader-spinner';

const Fallback = () => {
    return (
        <Container
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
            }}
        >
            <TailSpin
                visible={true}
                height="80"
                width="80"
                color="#cce08b"
                ariaLabel="tail-spin-loading"
                radius="1"
            />
        </Container>
    );
};

export default Fallback;