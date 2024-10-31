import React from 'react';
import {useState} from "react";
import {Sidebar as ProSidebar, Menu, MenuItem} from "react-pro-sidebar";
import {Box, IconButton, Typography, useTheme} from "@mui/material";
import {Link} from "react-router-dom";
import {tokens} from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import PeopleOutlinedIcon from "@mui/icons-material/People";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import Groups2Icon from '@mui/icons-material/Groups2';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import {IntegrationInstructions} from "@mui/icons-material";
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FolderIcon from '@mui/icons-material/Folder';
import FunctionsIcon from '@mui/icons-material/Functions';

const Item = ({title, to, icon, selected, setSelected}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <MenuItem active={selected === title}
                  style={{color: colors.grey[100]}}
                  onClick={() => setSelected(title)}
                  icon={icon}
                  component={<Link to={to} />}>

            <Typography>{title}</Typography>
        </MenuItem>
    )
}

const InnerSidebar = ({isCollapsed, selected, setSelected}) => {
    return (
        <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
                title="Проекты"
                to="/projects"
                icon={<FolderIcon />}
                selected={selected}
                setSelected={setSelected}
            />

            <Item
                title="Методы"
                to="/methods"
                icon={<FunctionsIcon />}
                selected={selected}
                setSelected={setSelected}
            />

            <Item
                title="Моки"
                to="/mocks"
                icon={<IntegrationInstructions />}
                selected={selected}
                setSelected={setSelected}
            />

            <Item
                title="Маппинги"
                to="/mappings"
                icon={<AccountTreeIcon />}
                selected={selected}
                setSelected={setSelected}
            />
        </Box>
    )
}

const Sidebar = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selected, setSelected] = useState("Заведение");

    let role = localStorage.getItem("rl");


    return (

        <Box>

            <ProSidebar style={{height: "100vh"}} collapsed={isCollapsed} backgroundColor={colors.primary[400]}>

                <Menu menuItemStyles={{
                    button: ({level, active, disabled}) => {
                        if (level === 0) {
                            return {
                                margin: "10px 0 20px 0",
                                "&:hover": {
                                    backgroundColor: colors.primary[300],
                                    color: "white !important",
                                    borderRadius: "5px !important",
                                },
                            };
                        }
                    },
                }}>
                    {/*    LOGO AND MENU ICON*/}
                    <MenuItem
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        icon={isCollapsed ? <MenuOutlinedIcon/> : undefined}>

                        {!isCollapsed && (
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                ml="15px">

                                <Typography variant="h3" color={colors.grey[100]}>
                                    SmartMock
                                </Typography>
                                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                                    <MenuOutlinedIcon/>
                                </IconButton>
                            </Box>
                        )}
                    </MenuItem>


                    {/*MENU ITEMS*/}

                    <InnerSidebar isCollapsed = {isCollapsed} selected = {selected} setSelected = {setSelected} />

                </Menu>

            </ProSidebar>

        </Box>

    );
};

export default Sidebar;