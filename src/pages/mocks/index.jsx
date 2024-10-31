import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button, Fab,
    FormControl,
    FormLabel,
    IconButton,
    MenuItem,
    Modal,
    Select,
    Snackbar, TextareaAutosize,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import Header from "../../components/header";
import {DataGrid} from '@mui/x-data-grid';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {tokens} from "../../theme";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {baseUrl, deleteMock} from "../../Constants";

// Стили для модального окна
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1500,
    bgcolor: 'background.paper',
    boxShadow: 24,
    overflow: 'scroll',
    p: 4,
    display: 'block',
    height: '100%'
};

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

const Mocks = () => {
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

    const [mocks, setMocks] = useState([]);
    const [loading, setLoading] = useState(false)

    const [open, setOpen] = useState(false);
    const [selectedData, setSelectedData] = useState({});

    const [openEdit, setOpenEdit] = useState(false);
    const [selectedEditMock, setSelectedEditMock] = useState({});

    const [projectMethods, setProjectMethods] = useState([]);
    const [selectedProjectMethod, setSelectedProjectMethod] = useState(null);

    const handleProjectMethodSelect = (pmId) => {
        let projectMethod = projectMethods.find((v) => v.id === pmId);

        setSelectedProjectMethod(projectMethod);

        if ('REQUEST' === selectedEditMock.type) {
            setSelectedEditMock((prev) => ({
                ...prev,
                data: atob(projectMethod.requestDataTemplate),
                projectMethodId: pmId
            }))
        } else if ('RESPONSE' === selectedEditMock.type) {
            setSelectedEditMock((prev) => ({
                ...prev,
                data: atob(projectMethod.responseDataTemplate),
                projectMethodId: pmId
            }))
        }
    }

    const [reloadTrigger, setReloadTrigger] = useState(new Date());
    const fireTrigger = () => {
        setReloadTrigger(new Date());
    }


    const handleEditClose = () => {
        setOpenEdit(false);
        setSelectedProjectMethod(null);
    }
    const handleOpenEdit = (mock) => {
        setSelectedEditMock(mock);
        setOpenEdit(true);
    };

    const handleOpen = (mock) => {
        setSelectedData(mock);
        setOpen(true);
    };
    const handleClose = () => setOpen(false); // Закрытие модального окна

    const handleCopy = () => {
        navigator.clipboard.writeText(safeDecode(selectedData.data)).then(() => {
            setSnackbarMessage('Данные скопированы в буфер обмена');
            // setSnackbarSeverity('success');
            setOpenSnackbar(true); // Открываем уведомление
        }, () => {
            setSnackbarMessage('Ошибка при копировании данных');
            // setSnackbarSeverity('error');
            setOpenSnackbar(true); // Открываем уведомление с ошибкой
        });
    };

    const showToast = (message, success) => {
        setSnackbarMessage(message);
        setOpenSnackbar(true);
        if (success) {
            setSeverity('success');
        } else {
            setSeverity('warning');
        }
    }

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [severity, setSeverity] = useState('success');

    const [paginationModel, setPaginationModel] = useState({
        pageSize: 5,
        page: 0,
    });

// Функция для форматирования данных
    const formatData = (data) => {
        if (data == null) {
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

    const columns = [
        {field: 'id', headerName: 'ID'},
        {field: 'name', headerName: 'Имя', flex: 1},
        {field: 'dataType', headerName: 'Тип данных', flex: 1},
        {field: 'type', headerName: 'Тип мока', flex: 1},
        {
            field: 'data', headerName: 'Данные', flex: 1, renderCell: ({row}) => {
                return (
                    <Box onClick={() => handleOpen(row)} style={{cursor: 'pointer'}}>
                        {row.data === null ? '-' : safeDecode(row.data).slice(0, 30)}
                    </Box>
                )
            }
        },
        {
            headerName: 'Действия', flex: 1, renderCell: ({row}) => {

                return (
                    <Box>
                        <IconButton onClick={() => handleOpenEdit(row)}>
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
        setLoading(true)
        fetch(`${baseUrl}/api/v1/mocks?sort=id,desc`)
            .then(response => response.json())
            .then(json => setMocks(json.content))
            .finally(() => {
                setLoading(false)
            })
    }, [reloadTrigger])

    useEffect(() => {
        setLoading(true)
        fetch(`${baseUrl}/api/v1/project-methods?sort=id,desc`)
            .then(response => response.json())
            .then(json => setProjectMethods(json.content))
            .finally(() => {
                setLoading(false)
            })
    }, [])


    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Моки" subtitle="Моки запросов и ответов внешних систем"/>
            </Box>


            <Box m="10px">
                <Fab color={colors.grey[100]} aria-label="add" onClick={() => handleOpenEdit({})}>
                    <AddIcon/>
                </Fab>
            </Box>

            <DataGrid rows={mocks} columns={columns}
                      paginationModel={paginationModel}
                      onPaginationModelChange={setPaginationModel}/>


            {/* Модальное окно просмотра mock.data */}
            <Modal open={open} onClose={handleClose}>
                <Box sx={modalStyle}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" component="h2">
                            Декодированные данные
                        </Typography>
                        {/* Кнопка копирования */}
                        <IconButton onClick={handleCopy}>
                            <ContentCopyIcon/>
                        </IconButton>
                    </Box>
                    {/*<TextareaAutosize value={formatData(selectedData.data)}></TextareaAutosize>*/}
                    <Box mt={2}>
                        {formatData(selectedData.data)} {/* Форматируем и отображаем данные */}
                    </Box>
                </Box>
            </Modal>


            <Modal open={openEdit} onClose={handleEditClose}>
                <Box sx={modalEditStyle}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" component="h2">
                            Редактирование
                        </Typography>
                    </Box>
                    <FormControl fullWidth={true}>
                        <FormLabel id="mock-name-label">Название</FormLabel>
                        <TextField id="mock-name-input" labelId="mock-name-label"
                                   value={selectedEditMock.name}
                                   onChange={(v) => setSelectedEditMock((previous) => ({
                                       ...previous,
                                       name: v.target.value
                                   }))}
                        ></TextField>

                        <FormLabel id="select-data-type-label">Тип данных</FormLabel>
                        <Select
                            onChange={(v) => setSelectedEditMock((previous) => ({
                                ...previous,
                                dataType: v.target.value
                            }))}
                            style={{color: colors.grey[100]}}
                            labelId="select-data-type-label"
                            id="select-data-type"
                            value={selectedEditMock.dataType}
                            label="Тип данных">

                            <MenuItem value={'XML'}>XML</MenuItem>
                            <MenuItem value={'JSON'}>JSON</MenuItem>
                        </Select>

                        <FormLabel id="select-mock-type-label">Тип мока</FormLabel>
                        <Select
                            onChange={(v) => {
                                setSelectedEditMock((previous) => ({...previous, type: v.target.value}));
                                console.log('----------------here-----------')
                                console.log(selectedProjectMethod);
                                if (selectedProjectMethod !== null && selectedProjectMethod !== undefined) {
                                    if ('REQUEST' === v.target.value) {
                                        setSelectedEditMock((prev) => ({
                                            ...prev,
                                            data: atob(selectedProjectMethod?.requestDataTemplate)
                                        }))
                                    } else if ('RESPONSE' === v.target.value) {
                                        setSelectedEditMock((prev) => ({
                                            ...prev,
                                            data: atob(selectedProjectMethod?.responseDataTemplate)
                                        }))
                                    }
                                }
                            }}
                            style={{color: colors.grey[100]}}
                            labelId="select-mock-type-label"
                            id="select-mock-type"
                            value={selectedEditMock.type}
                            label="Тип данных">

                            <MenuItem value={'REQUEST'}>REQUEST</MenuItem>
                            <MenuItem value={'RESPONSE'}>RESPONSE</MenuItem>
                        </Select>

                        <FormLabel id="select-project-method-label">Выберите метод</FormLabel>
                        <Select
                            onChange={(v) => handleProjectMethodSelect(v.target.value)}
                            style={{color: colors.grey[100]}}
                            labelId="select-project-method-label"
                            id="select-project-method-type"
                            value={selectedEditMock.projectMethodId}
                            label="Метод">

                            {projectMethods?.map((pm) => {
                                return <MenuItem value={pm.id}>{pm.name}</MenuItem>
                            })}
                        </Select>

                        <FormLabel id="mock-data-label">Данные</FormLabel>
                        <TextareaAutosize minRows={3} id="mock-data-input" labelId="mock-data-label"
                                          value={safeDecode(selectedEditMock.data)}
                                          onChange={(v) => setSelectedEditMock((previous) => ({
                                              ...previous,
                                              data: btoa(v.target.value)
                                          }))}
                        ></TextareaAutosize>

                        <Button style={{color: colors.grey[100]}} onClick={() => {

                            const isCreate = selectedEditMock.id === undefined;

                            // const requestOptions = {
                            //     method: isCreate ? 'POST' : 'PATCH',
                            //     headers: {'Content-Type': 'application/json'},
                            //     body: JSON.stringify(selectedEditMock)
                            // };

                            const url = isCreate ? `${baseUrl}/api/v1/mocks`
                                : `${baseUrl}/api/v1/mocks/` + selectedEditMock.id;

                            fetch(`${baseUrl}/api/v1/encode`, {
                                method: 'POST',
                                body: safeDecode(selectedEditMock.data)
                            }).then(response => response.json())
                                .then(json => setSelectedEditMock((previous) => ({
                                    ...previous,
                                    data: json.content
                                })));

                            const requestOptions = {
                                method: isCreate ? 'POST' : 'PATCH',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(selectedEditMock)
                            };

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

export default Mocks;