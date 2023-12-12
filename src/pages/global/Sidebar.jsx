import React from 'react';
import {useState} from "react";
import {Sidebar as ProSidebar, Menu, MenuItem} from "react-pro-sidebar";
import {Box, IconButton, Typography, useTheme} from "@mui/material";
import {Link} from "react-router-dom";
import {tokens} from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/People";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import Groups2Icon from '@mui/icons-material/Groups2';
import MenuBookIcon from '@mui/icons-material/MenuBook';

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

const AdminSidebar = ({isCollapsed, selected, setSelected}) => {
    return (
        <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
                title="Список заведений"
                to="/restaurants"
                icon={<HomeOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
            />
        </Box>
    )
}

const UserSidebar = ({isCollapsed, selected, setSelected}) => {
    return (
        <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
                title="Заведение"
                to="/"
                icon={<HomeOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
            />

            <Item
                title="Меню"
                to="/menu"
                icon={<RestaurantMenuIcon />}
                selected={selected}
                setSelected={setSelected}
            />

            <Item
                title="Сотрудники"
                to="/employees"
                icon={<Groups2Icon />}
                selected={selected}
                setSelected={setSelected}
            />

            <Item
                title="Брованирования"
                to="/bookings"
                icon={<MenuBookIcon />}
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
                                    EasyBron
                                </Typography>
                                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                                    <MenuOutlinedIcon/>
                                </IconButton>
                            </Box>
                        )}
                    </MenuItem>


                    {/*MENU ITEMS*/}

                    {role === 'admin' ? <AdminSidebar isCollapsed = {isCollapsed} selected = {selected} setSelected = {setSelected} />
                        : <UserSidebar isCollapsed = {isCollapsed} selected = {selected} setSelected = {setSelected} /> }


                </Menu>

            </ProSidebar>

        </Box>

    );
};

export default Sidebar;