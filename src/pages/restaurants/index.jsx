import React from 'react';
import {Box} from "@mui/material";
import Header from "../../components/header";

const Restaurants = () => {
    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Список заведений" subtitle="Управление заведениями" />
            </Box>
        </Box>
    );
};

export default Restaurants;