import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, TextField, Button } from '@mui/material';

function FilterForm({ onFilter }) {
    const formik = useFormik({
        initialValues: {
            location: '',
            startDate: '',
            endDate: '',
        },
        validationSchema: Yup.object({
            location: Yup.string().required('Location is required'),
            startDate: Yup.date()
                .required('Start date is required')
                .typeError('Invalid date format'),
            endDate: Yup.date()
                .required('End date is required')
                .typeError('Invalid date format')
                .min(
                    Yup.ref('startDate'),
                    'End date must be later than or equal to start date'
                ),
        }),
        onSubmit: (values) => {
            onFilter(values);
        },
    });

    return (
        <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 400 }}
        >
            <TextField
                label="Location"
                name="location"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.location && Boolean(formik.errors.location)}
                helperText={formik.touched.location && formik.errors.location}
                fullWidth
            />
            <TextField
                label="Start Date"
                type="date"
                name="startDate"
                InputLabelProps={{ shrink: true }}
                value={formik.values.startDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                helperText={formik.touched.startDate && formik.errors.startDate}
                fullWidth
            />
            <TextField
                label="End Date"
                type="date"
                name="endDate"
                InputLabelProps={{ shrink: true }}
                value={formik.values.endDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                helperText={formik.touched.endDate && formik.errors.endDate}
                fullWidth
            />
            <Button type="submit" variant="contained" color="primary">
                Filter
            </Button>
        </Box>
    );
}

export default FilterForm;
