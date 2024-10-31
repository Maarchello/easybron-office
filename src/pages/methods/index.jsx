import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Fab,
    FormControl,
    FormLabel,
    IconButton, MenuItem,
    Modal, Select, Snackbar, TextareaAutosize,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import Header from "../../components/header";
import {tokens} from "../../theme";
import EditIcon from "@mui/icons-material/Edit";
import {baseUrl, deleteProject, deleteProjectMethod} from "../../Constants";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {DataGrid} from "@mui/x-data-grid";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

function safeDecode(val) {
    if (val === null || val === undefined) {
        return "";
    }

    return atob(val);
}

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1500,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflow: 'scroll',
    display: 'block',
    height: '100%'
};
const ProjectMethod = () => {

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

    const [objects, setObjects] = useState([]);
    const [reloadTrigger, setReloadTrigger] = useState(new Date());
    const fireTrigger = () => setReloadTrigger(new Date());
    const [openEditForm, setOpenEditForm] = useState(false);
    const [selectedObject, setSelectedObject] = useState({});
    const handleEditClose = () => setOpenEditForm(false);
    const handleEditOpen = (obj) => {
        setSelectedObject(obj);
        setOpenEditForm(true);
    };

    const [openTemplateViewer, setOpenTemplateViewer] = useState(false);
    const [encodedData, setEncodedData] = useState("");

    const handleTemplateViewerOpen = (encodedData) => {
        setEncodedData(encodedData);
        setOpenTemplateViewer(true);
    };
    const handleTemplateViewerClose = () => setOpenTemplateViewer(false);


    const [projects, setProjects] = useState([]);

    const handleCopy = () => {
        navigator.clipboard.writeText(atob(encodedData)).then(() => {
            setSnackbarMessage('Данные скопированы в буфер обмена');
            // setSnackbarSeverity('success');
            setOpenSnackbar(true); // Открываем уведомление
        }, () => {
            setSnackbarMessage('Ошибка при копировании данных');
            // setSnackbarSeverity('error');
            setOpenSnackbar(true); // Открываем уведомление с ошибкой
        });
    };

    const columns = [
        {field: 'id', headerName: 'ID'},
        {field: 'name', headerName: 'Название', flex: 1},
        {field: 'project', valueGetter: (params) => params.name, headerName: 'Проект', flex: 1},
        {
            field: 'requestDataTemplate', headerName: 'Шаблон запроса', flex: 1, renderCell: ({row}) => {
                return (
                    <Box onClick={() => handleTemplateViewerOpen(row.requestDataTemplate)} style={{cursor: 'pointer'}}>
                        {row.requestDataTemplate === null ? '-' : safeDecode(row.requestDataTemplate).slice(0, 30)}
                    </Box>
                )
            }
        },
        {
            field: 'responseDataTemplate', headerName: 'Шаблон ответа', flex: 1, renderCell: ({row}) => {
                return (
                    <Box onClick={() => handleTemplateViewerOpen(row.responseDataTemplate)} style={{cursor: 'pointer'}}>
                        {row.responseDataTemplate === null ? '-' : safeDecode(row.responseDataTemplate).slice(0, 30)}
                    </Box>
                )
            }
        },
        {
            headerName: 'Действия', flex: 1, renderCell: ({row}) => {

                return (
                    <Box>
                        <IconButton onClick={() => handleEditOpen(row)}>
                            <EditIcon/>
                        </IconButton>

                        <IconButton onClick={() => {
                            if (window.confirm("Действительно удалить?") === true) {
                                deleteProjectMethod(row.id,
                                    () => showToast(`Метод успешно удалён`, true),
                                    (err) => showToast(`Удалить Метод не вышло`, false));
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

    const formatData = (data) => {
        if (data === null) {
            return "";
        }

        data = safeDecode(data);

        try {
            const jsonData = JSON.parse(data); // Попробуем преобразовать данные в JSON
            return <pre>{JSON.stringify(jsonData, null, 2)}</pre>; // Форматируем JSON красиво
        } catch (e) {
            // Если это не JSON, попробуем считать это как XML
            const parser = new DOMParser();
            const xmlData = parser.parseFromString(data, "application/xml");
            const serializer = new XMLSerializer();
            return <pre>{serializer.serializeToString(xmlData)}</pre>; // Форматируем XML
        }
    };

    useEffect(() => {
        fetch(`${baseUrl}/api/v1/project-methods?sort=id,desc`)
            .then(response => response.json())
            .then(json => setObjects(json.content))
    }, [reloadTrigger])


    useEffect(() => {
        fetch(`${baseUrl}/api/v1/projects?sort=id,desc`)
            .then(response => response.json())
            .then(json => setProjects(json.content))
    }, [])


    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Методы проектов" subtitle="Методы - это конкретные АПИ методы проектов. Для каждого метода можно задать 'шаблон' запрос и ответа и использовать эти шаблоны при создании моков" />
            </Box>


            <Box m="10px">
                <Fab color={colors.grey[100]} aria-label="add" onClick={() => handleEditOpen({})}>
                    <AddIcon/>
                </Fab>
            </Box>


            <DataGrid rows={objects} columns={columns}
                      paginationModel={paginationModel}
                      onPaginationModelChange={setPaginationModel}/>

            <Modal open={openTemplateViewer} onClose={handleTemplateViewerClose}>
                <Box sx={modalStyle}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" component="h2">
                            Декодированные данные
                        </Typography>
                        <IconButton onClick={handleCopy}>
                            <ContentCopyIcon/>
                        </IconButton>
                    </Box>
                    <Box mt={2}>
                        {formatData(encodedData)} {/* Форматируем и отображаем данные */}
                    </Box>
                </Box>
            </Modal>


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

                        <FormLabel id="select-project-label">Проект</FormLabel>
                        <Select
                            onChange={(v) => setSelectedObject((previous) => ({
                                ...previous,
                                projectId: v.target.value
                            }))}
                            style={{color: colors.grey[100]}}
                            labelId="select-project-label"
                            id="select-project-type"
                            value={selectedObject.project?.id}
                            label="http метод">

                            {projects?.map((proj) => {
                                return <MenuItem value={proj.id}>{proj.name}</MenuItem>
                            })}
                        </Select>

                        <FormLabel id="mock-request-tempplate-label">Шаблон запроса</FormLabel>
                        <TextareaAutosize minRows={3} id="mock-request-tempplate-input" labelId="mock-request-tempplate-label"
                                          value={safeDecode(selectedObject.requestDataTemplate)}
                                          onChange={(v) => setSelectedObject((previous) => ({
                                              ...previous,
                                              requestDataTemplate: btoa(v.target.value)
                                          }))}
                        ></TextareaAutosize>

                        <FormLabel id="mock-response-tempplate-label">Шаблон ответа</FormLabel>
                        <TextareaAutosize minRows={3} id="mock-response-tempplate-input" labelId="mock-response-tempplate-label"
                                          value={safeDecode(selectedObject.responseDataTemplate)}
                                          onChange={(v) => setSelectedObject((previous) => ({
                                              ...previous,
                                              responseDataTemplate: btoa(v.target.value)
                                          }))}
                        ></TextareaAutosize>

                        <Button style={{color: colors.grey[100]}} onClick={() => {

                            const isCreate = selectedObject.id === undefined;

                            const requestOptions = {
                                method: isCreate ? 'POST' : 'PATCH',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(selectedObject)
                            };

                            const url = isCreate ? `${baseUrl}/api/v1/project-methods`
                                : `${baseUrl}/api/v1/project-methods/` + selectedObject.id;

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

export default ProjectMethod;