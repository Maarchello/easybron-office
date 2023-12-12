import React from 'react';
import Header from "../../components/header";
import {Box} from "@mui/material";

const Dashboard = () => {
    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Заведение Мама тата" subtitle="Основная информация о заведении" />
            </Box>
        </Box>
    );
};

export default Dashboard;