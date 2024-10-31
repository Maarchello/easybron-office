import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box, Button,
    Fab,
    FormControl,
    FormLabel,
    IconButton, MenuItem,
    Modal, Select, Snackbar, Tab, Tabs,
    TextareaAutosize,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import Header from "../../components/header";
import {tokens} from "../../theme";
import EditIcon from "@mui/icons-material/Edit";
import {baseUrl, deleteMapping, deleteProjectMethod} from "../../Constants";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {DataGrid} from "@mui/x-data-grid";
import MappingsMainTab from "./mappingsMainTab";
import MappingsTriggerTab from "./mappingsTriggerTab";
import {Link, useNavigate} from "react-router-dom";
import MappingForm from "./mappingForm";

const Mappings = () => {

    const navigate = useNavigate();

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const modalEditStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 1000,
        bgcolor: colors.grey[800],
        boxShadow: 24,
        p: 4,
        alignItems: 'center'
    };

    const [paginationModel, setPaginationModel] = useState({
        pageSize: 5,
        page: 0,
    });

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    const showToast = (message, success) => {
        setSnackbarMessage(message);
        setOpenSnackbar(true);
        if (success) {
            setSeverity('success');
        } else {
            setSeverity('warning');
        }
    }

    const [objects, setObjects] = useState([]);
    const [reloadTrigger, setReloadTrigger] = useState(new Date());
    const fireTrigger = () => setReloadTrigger(new Date());
    const [openEditForm, setOpenEditForm] = useState(false);
    const [selectedObject, setSelectedObject] = useState({});
    const handleEditClose = () => setOpenEditForm(false);
    const handleEditOpen = (obj) => {

        navigate('/mapping-form', {state: obj});
        // setSelectedObject(obj);
        // setOpenEditForm(true);
    };


    const columns = [
        {field: 'id', headerName: 'ID'},
        {field: 'name', headerName: 'Название', flex: 1},
        {field: 'url', headerName: 'url', flex: 1},
        {field: 'httpMethod', headerName: 'HTTP метод', flex: 1},
        {field: 'requestMockId', headerName: 'Мок запроса', flex: 1},
        {field: 'responseMockId', headerName: 'Мок ответа', flex: 1},

        {
            headerName: 'Действия', flex: 1, renderCell: ({row}) => {

                return (
                    <Box>

                        <IconButton onClick={() => handleEditOpen(row)}>
                            <EditIcon/>
                        </IconButton>

                        <IconButton onClick={() => {
                            if (window.confirm("Действительно удалить?") === true) {
                                deleteMapping(row.id,
                                    () => showToast(`Маппинг успешно удалён`, true),
                                    (err) => showToast(`Удалить Маппинг не вышло`, false));
                                fireTrigger();
                            }
                        }}>
                            <DeleteIcon/>
                        </IconButton>
                    </Box>
                )
            }
        },
    ];

    useEffect(() => {
        fetch(`${baseUrl}/api/v1/mappings?sort=id,desc`)
            .then(response => response.json())
            .then(json => setObjects(json.content))
    }, [reloadTrigger])

    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Маппинги" subtitle="" />
            </Box>

            <Box m="10px">
                <Fab color={colors.grey[100]} aria-label="add" onClick={() => handleEditOpen({})}>
                    <AddIcon/>
                </Fab>
            </Box>


            <DataGrid rows={objects} columns={columns}
                      paginationModel={paginationModel}
                      onPaginationModelChange={setPaginationModel}/>


            <Modal open={openEditForm} onClose={handleEditClose}>
                <Box sx={modalEditStyle}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" component="h2">
                            Редактирование
                        </Typography>
                    </Box>
                    <FormControl fullWidth={true}>
                        <FormLabel id="mock-name-label">Название</FormLabel>
                        <TextField id="mock-name-input" labelId="mock-name-label"
                                   value={selectedObject.name}
                                   onChange={(v) => setSelectedObject((previous) => ({
                                       ...previous,
                                       name: v.target.value
                                   }))}
                        ></TextField>

                        <FormLabel id="mock-description-label">Описание</FormLabel>
                        <TextField id="mock-description-input" labelId="mock-description-label"
                                   value={selectedObject.description}
                                   onChange={(v) => setSelectedObject((previous) => ({
                                       ...previous,
                                       description: v.target.value
                                   }))}
                        ></TextField>

                        <FormLabel id="mock-url-label">URL</FormLabel>
                        <TextField id="mock-url-input" labelId="mock-url-label"
                                   value={selectedObject.url}
                                   onChange={(v) => setSelectedObject((previous) => ({
                                       ...previous,
                                       url: v.target.value
                                   }))}
                        ></TextField>

                        <FormLabel id="select-http-method-label">HTTP метод</FormLabel>
                        <Select
                            onChange={(v) => setSelectedObject((previous) => ({
                                ...previous,
                                httpMethod: v.target.value
                            }))}
                            style={{color: colors.grey[100]}}
                            labelId="select-http-method-label"
                            id="select-http-method-type"
                            value={selectedObject.httpMethod}
                            label="http метод">

                            <MenuItem value={'GET'}>GET</MenuItem>
                            <MenuItem value={'POST'}>POST</MenuItem>
                            <MenuItem value={'PUT'}>PUT</MenuItem>
                            <MenuItem value={'PATCH'}>PATCH</MenuItem>
                            <MenuItem value={'DELETE'}>DELETE</MenuItem>
                        </Select>

                        <FormLabel id="mapping-req-mock-label">Мок запроса</FormLabel>
                        <TextField id="mapping-req-mock-input" labelId="mapping-req-mock-label"
                                   value={selectedObject.requestMockId}
                                   onChange={(v) => setSelectedObject((previous) => ({
                                       ...previous, requestMockId: v.target.value
                                   }))}
                        ></TextField>

                        <FormLabel id="mapping-res-mock-label">Мок ответа</FormLabel>
                        <TextField id="mapping-res-mock-input" labelId="mapping-res-mock-label"
                                   value={selectedObject.responseMockId}
                                   onChange={(v) => setSelectedObject((previous) => ({
                                       ...previous, responseMockId: v.target.value
                                   }))}
                        ></TextField>


                        <Button style={{color: colors.grey[100]}} onClick={() => {

                            const isCreate = selectedObject.id === undefined;

                            const requestOptions = {
                                method: isCreate ? 'POST' : 'PATCH',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(selectedObject)
                            };

                            const url = isCreate ? `${baseUrl}/api/v1/mappings`
                                : `${baseUrl}/api/v1/mappings/` + selectedObject.id;

                            fetch(url, requestOptions)
                                .finally(() => {
                                    handleEditClose();
                                    showToast("Данные успешно сохраненны", true);
                                    fireTrigger();
                                })
                        }}>Сохранить</Button>
                    </FormControl>
                </Box>
            </Modal>


            <Snackbar
                open={openSnackbar}
                autoHideDuration={1500} // Уведомление исчезает через 3 секунды
                onClose={() => setOpenSnackbar(false)} // Закрытие уведомления
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}} // Позиция по центру внизу
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity={severity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Mappings;