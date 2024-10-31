import React, {useState} from 'react';
import {Box, Tab, Tabs, Typography, useTheme} from "@mui/material";
import MappingsMainTab from "./mappingsMainTab";
import MappingsTriggerTab from "./mappingsTriggerTab";
import Header from "../../components/header";
import {tokens} from "../../theme";
import {useLocation} from "react-router-dom";

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 0 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}
const MappingForm = () => {

    const location = useLocation();
    let mappingModel = location.state;
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [tabIdx, setTabIdx] = useState(1);

    const handleTabChange = (event, newValue) => {
        setTabIdx(newValue);
    };

    return (
        <Box m="20px">
            <Box>
                <Tabs textColor={colors.grey[800]} value={tabIdx} onChange={handleTabChange} aria-label="basic tabs example" variant="scrollable">

                    <Tab label='Основная информация' value={1} />
                    <Tab label='Триггеры' value={2} />

                </Tabs>
            </Box>

            <CustomTabPanel value={tabIdx} index={1}>
                <MappingsMainTab mappingModel={mappingModel} />
            </CustomTabPanel>

            <CustomTabPanel value={tabIdx} index={2}>
                <MappingsTriggerTab mappingId={mappingModel.id} />
            </CustomTabPanel>

        </Box>
    );
};

export default MappingForm;