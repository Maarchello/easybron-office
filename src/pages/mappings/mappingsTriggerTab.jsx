import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box, Button,
    Fab,
    FormControl,
    FormLabel,
    IconButton, MenuItem,
    Modal,
    Select, Snackbar, TextareaAutosize,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import {tokens} from "../../theme";
import EditIcon from "@mui/icons-material/Edit";
import {baseUrl, deleteMapping, deleteMock} from "../../Constants";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {DataGrid} from "@mui/x-data-grid";

function safeDecode(val) {
    if (val === null || val === undefined) {
        return "";
    }

    try {
        return atob(val);
    } catch (e) {
        return val;
    }
}
const MappingsTriggerTab = ({mappingId}) => {

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
        alignItems: 'center',
        overflow: 'scroll',
        display: 'block',
        height: '100%'
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

    const [triggers, setTriggers] = useState([]);
    const [targetTrigger, setTargetTrigger] = useState();
    const [openDataViewer, setOpenDataViewer] = useState(false);
    const [allMocks, setAllMocks] = useState([]);

    const handleOpenDataViewer = (trigger) => {
        setTargetTrigger(trigger);
        setOpenDataViewer(true);
    };
    const handleCloseDataViewer = () => setOpenDataViewer(false);

    const [reloadTrigger, setReloadTrigger] = useState(new Date());
    const fireTrigger = () => {
        setReloadTrigger(new Date());
    }

    const [editFormOpen, setEditFormOpen] = useState(false);

    const handleEditFormOpen = (obj) => {
        setTargetTrigger(obj);
        setEditFormOpen(true);
    };

    const handleEditFormClose = () => {
        setEditFormOpen(false);
    }

    const columns = [
        {field: 'id', headerName: 'ID'},
        {field: 'mockIdToChange', headerName: 'Мок на изменение', flex: 1},
        {
            field: 'newDataValue', headerName: 'Новые данные мока', flex: 1, renderCell: ({row}) => {
                return (
                    <Box onClick={() => handleOpenDataViewer(row)} style={{cursor: 'pointer'}}>
                        {row.newDataValue === null ? '-' : safeDecode(row.newDataValue).slice(0, 30)}
                    </Box>
                )
            }
        },
        {
            headerName: 'Действия', flex: 1, renderCell: ({row}) => {

                return (
                    <Box>
                        <IconButton onClick={() => handleEditFormOpen(row)}>
                            <EditIcon/>
                        </IconButton>

                        <IconButton onClick={() => {
                            if (window.confirm("Действительно удалить?") === true) {
                                deleteMock(row.id,
                                    () => showToast(`Мок успешно удалён`, true),
                                    (err) => showToast(`Удалить мок не вышло`, false));
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
        fetch(`${baseUrl}/api/v1/mocks?size=1000&sort=id,desc`)
            .then(response => response.json())
            .then(json => setAllMocks(json.content))
            .finally(() => {

            })
    }, []);


    useEffect(() => {
        fetch(`${baseUrl}/api/v1/mapping-triggers?mappingId=${mappingId}&sort=id,desc`)
            .then(response => response.json())
            .then(json => setTriggers(json.content))
            .finally(() => {

            })
    }, [reloadTrigger]);

    return (
        <Box m="20px">

            <Box m="10px">
                <Fab color={colors.grey[100]} aria-label="add" onClick={() => handleEditFormOpen({})}>
                    <AddIcon/>
                </Fab>
            </Box>

            <DataGrid rows={triggers} columns={columns}
                      paginationModel={paginationModel}
                      onPaginationModelChange={setPaginationModel}/>


            <Modal open={editFormOpen} onClose={handleEditFormClose}>
                <Box sx={modalEditStyle}>


                    <FormControl fullWidth={true}>

                        <FormLabel id="select-mocks-label">Какой мок изменить?</FormLabel>
                        <Select
                            onChange={(v) => setTargetTrigger((previous) => ({
                                ...previous,
                                mockIdToChange: v.target.value
                            }))}
                            style={{color: colors.grey[100]}}
                            labelId="select-mocks-label"
                            id="select-mocks-type"
                            value={targetTrigger?.mockIdToChange}
                            label="req">

                            {allMocks?.map((mock) => {
                                return <MenuItem value={mock.id}>{mock.name}</MenuItem>
                            })}
                        </Select>


                        <FormLabel id="mock-data-label">Данные</FormLabel>
                        <TextareaAutosize minRows={3} id="mock-data-input" labelId="mock-data-label"
                                          value={safeDecode(targetTrigger?.newDataValue)}
                                          onChange={(v) => setTargetTrigger((previous) => ({
                                              ...previous,
                                              newDataValue: btoa(v.target.value)
                                          }))}
                        ></TextareaAutosize>

                        <Button style={{color: colors.grey[100]}} onClick={() => {

                            const isCreate = targetTrigger?.id === undefined;

                            const url = isCreate ? `${baseUrl}/api/v1/mapping-triggers`
                                : `${baseUrl}/api/v1/mapping-triggers/` + targetTrigger?.id;

                            fetch(`${baseUrl}/api/v1/encode`, {
                                method: 'POST',
                                body: safeDecode(targetTrigger?.newDataValue)
                            }).then(response => response.json())
                                .then(json => setTargetTrigger((previous) => ({
                                    ...previous,
                                    data: json.content
                                })));

                            targetTrigger.mappingId = mappingId;
                            const requestOptions = {
                                method: isCreate ? 'POST' : 'PATCH',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(targetTrigger)
                            };

                            fetch(url, requestOptions)
                                .finally(() => {
                                    handleEditFormClose();
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

export default MappingsTriggerTab;