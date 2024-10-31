import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box, Button,
    Fab,
    FormControl,
    FormLabel,
    IconButton, MenuItem,
    Modal,
    Select, Snackbar,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import {tokens} from "../../theme";
import EditIcon from "@mui/icons-material/Edit";
import {baseUrl, deleteMapping, getMocksByType} from "../../Constants";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {DataGrid} from "@mui/x-data-grid";

const MappingsMainTab = ({mappingModel}) => {

    let initState;
    if (mappingModel === null) {
        initState = {};
    } else {
        initState = mappingModel;
    }
    const [mapping, setMapping] = useState(initState);
    const [requestMocks, setRequestMocks] = useState([]);
    const [responseMocks, setResponseMocks] = useState([]);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

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

    useEffect(() => {
        getMocksByType('REQUEST', (json) => setRequestMocks(json));
        fetch(`${baseUrl}/api/v1/mocks?type=REQUEST&sort=id,desc`)
            .then(response => response.json())
            .then(json => setRequestMocks(json.content))
            .finally(() => {

            })
    }, []);


    useEffect(() => {
        fetch(`${baseUrl}/api/v1/mocks?type=RESPONSE&sort=id,desc`)
            .then(response => response.json())
            .then(json => setResponseMocks(json.content))
            .finally(() => {

            })
    }, [])

    return (
        <div>

            <Box>
                <FormControl fullWidth={true}>
                    <FormLabel id="mock-name-label">Название</FormLabel>
                    <TextField id="mock-name-input" labelId="mock-name-label"
                               value={mapping.name}
                               onChange={(v) => setMapping((previous) => ({
                                   ...previous,
                                   name: v.target.value
                               }))}
                    ></TextField>

                    <FormLabel id="mock-description-label">Описание</FormLabel>
                    <TextField id="mock-description-input" labelId="mock-description-label"
                               value={mapping.description}
                               onChange={(v) => setMapping((previous) => ({
                                   ...previous,
                                   description: v.target.value
                               }))}
                    ></TextField>

                    <FormLabel id="mock-url-label">URL</FormLabel>
                    <TextField id="mock-url-input" labelId="mock-url-label"
                               value={mapping.url}
                               onChange={(v) => setMapping((previous) => ({
                                   ...previous,
                                   url: v.target.value
                               }))}
                    ></TextField>

                    <FormLabel id="select-http-method-label">HTTP метод</FormLabel>
                    <Select
                        onChange={(v) => setMapping((previous) => ({
                            ...previous,
                            httpMethod: v.target.value
                        }))}
                        style={{color: colors.grey[100]}}
                        labelId="select-http-method-label"
                        id="select-http-method-type"
                        value={mapping.httpMethod}
                        label="http метод">

                        <MenuItem value={'GET'}>GET</MenuItem>
                        <MenuItem value={'POST'}>POST</MenuItem>
                        <MenuItem value={'PUT'}>PUT</MenuItem>
                        <MenuItem value={'PATCH'}>PATCH</MenuItem>
                        <MenuItem value={'DELETE'}>DELETE</MenuItem>
                    </Select>

                    <FormLabel id="select-req-mock-label">Мок запроса</FormLabel>
                    <Select
                        onChange={(v) => setMapping((previous) => ({
                            ...previous,
                            requestMockId: v.target.value
                        }))}
                        style={{color: colors.grey[100]}}
                        labelId="select-req-mock-label"
                        id="select-req-mock-type"
                        value={mapping.requestMockId}
                        label="req">

                        {requestMocks?.map((mock) => {
                            return <MenuItem value={mock.id}>{mock.name}</MenuItem>
                        })}
                    </Select>

                    <FormLabel id="select-res-mock-label">Мок ответа</FormLabel>
                    <Select
                        onChange={(v) => setMapping((previous) => ({
                            ...previous,
                            responseMockId: v.target.value
                        }))}
                        style={{color: colors.grey[100]}}
                        labelId="select-res-mock-label"
                        id="select-res-mock-type"
                        value={mapping.responseMockId}
                        label="res">

                        {responseMocks?.map((mock) => {
                            return <MenuItem value={mock.id}>{mock.name}</MenuItem>
                        })}
                    </Select>

                    <Button style={{color: colors.grey[100]}} onClick={() => {

                        const isCreate = mapping.id === undefined;

                        const requestOptions = {
                            method: isCreate ? 'POST' : 'PATCH',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(mapping)
                        };

                        const url = isCreate ? `${baseUrl}/api/v1/mappings`
                            : `${baseUrl}/api/v1/mappings/` + mapping.id;

                        fetch(url, requestOptions)
                            .finally(() => {
                                // handleEditClose();
                                showToast("Данные успешно сохраненны", true);
                                // fireTrigger();
                            })
                    }}>Сохранить</Button>
                </FormControl>
            </Box>


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
        </div>
    );
};

export default MappingsMainTab;