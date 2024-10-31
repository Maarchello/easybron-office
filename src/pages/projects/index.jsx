import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Fab,
    FormControl,
    FormLabel,
    IconButton,
    Modal,
    Snackbar,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import Header from "../../components/header";
import AddIcon from "@mui/icons-material/Add";
import {tokens} from "../../theme";
import {DataGrid} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import {baseUrl, deleteProject} from "../../Constants";
import DeleteIcon from "@mui/icons-material/Delete";

const Project = () => {

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

    const [projects, setProjects] = useState([]);
    const [reloadTrigger, setReloadTrigger] = useState(new Date());
    const fireTrigger = () => setReloadTrigger(new Date());

    const [openEditForm, setOpenEditForm] = useState(false);
    const [selectedProject, setSelectedProject] = useState({});
    const handleEditClose = () => setOpenEditForm(false);
    const handleEditOpen = (project) => {
        setSelectedProject(project);
        setOpenEditForm(true);
    };


    const columns = [
        {field: 'id', headerName: 'ID'},
        {field: 'name', headerName: 'Название', flex: 1},
        {field: 'description', headerName: 'Описание', flex: 1},
        {
            headerName: 'Действия', flex: 1, renderCell: ({row}) => {

                return (
                    <Box>
                        <IconButton onClick={() => handleEditOpen(row)}>
                            <EditIcon/>
                        </IconButton>

                        <IconButton onClick={() => {
                            if (window.confirm("Действительно удалить?") === true) {
                                deleteProject(row.id,
                                    () => showToast(`Проект успешно удалён`, true),
                                    (err) => showToast(`Удалить проект не вышло`, false));
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
        fetch(`${baseUrl}/api/v1/projects?sort=id,desc`)
            .then(response => response.json())
            .then(json => setProjects(json.content))
    }, [reloadTrigger])

    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Проекты" subtitle="Проект - это внешняя система, для которой нужно будет делать моки" />
            </Box>

            <Box m="10px">
                <Fab color={colors.grey[100]} aria-label="add" onClick={() => handleEditOpen({})}>
                    <AddIcon/>
                </Fab>
            </Box>

            <DataGrid rows={projects} columns={columns}
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
                                   value={selectedProject.name}
                                   onChange={(v) => setSelectedProject((previous) => ({
                                       ...previous,
                                       name: v.target.value
                                   }))}
                        ></TextField>

                        <FormLabel id="mock-description-label">Описание</FormLabel>
                        <TextField id="mock-description-input" labelId="mock-description-label"
                                   value={selectedProject.description}
                                   onChange={(v) => setSelectedProject((previous) => ({
                                       ...previous,
                                       description: v.target.value
                                   }))}
                        ></TextField>

                        <Button style={{color: colors.grey[100]}} onClick={() => {

                            const isCreate = selectedProject.id === undefined;

                            const requestOptions = {
                                method: isCreate ? 'POST' : 'PATCH',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(selectedProject)
                            };

                            const url = isCreate ? `${baseUrl}/api/v1/projects`
                                : `${baseUrl}/api/v1/projects/` + selectedProject.id;

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

export default Project;