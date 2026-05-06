import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    IconButton,
    List,
    ListItem,
    Checkbox,
    FormControlLabel,
    Chip,
    Stack
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { useRagManager } from './useRagManager';

interface RagManagerProps {
    onStatusChange: (msg: string) => void;
    isBusy: boolean;
    setBusy: (state: boolean) => void;
}

interface FilePanelProps {
    title: string;
    files: string[];
    selected: string[];
    onSelect: (file: string) => void;
    isBusy: boolean;
    emptyText: string;
    children?: (file: string) => React.ReactNode;
}

const FilePanel: React.FC<FilePanelProps> = ({ title, files, selected, onSelect, isBusy, emptyText, children }) => (
    <Stack component={Paper} variant="outlined" sx={{ flex: 1, overflow: 'hidden', bgcolor: 'grey.50' }}>
        <Box sx={{ p: 1.5, bgcolor: 'grey.100', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{title}</Typography>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
            {files.length === 0 ? (
                <Stack sx={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">{emptyText}</Typography>
                </Stack>
            ) : (
                <List dense disablePadding>
                    {files.map((file: string) => (
                        <ListItem key={file} disablePadding>
                            <FormControlLabel
                                sx={{ width: '100%', ml: 0, pr: 1.5 }}
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={selected.includes(file)}
                                        onChange={() => onSelect(file)}
                                        disabled={isBusy}
                                    />
                                }
                                label={children ? children(file) : <Typography variant="body2" noWrap>{file}</Typography>}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    </Stack>
);

export function RagManager(props: RagManagerProps) {
    const {
        trainedFiles, queuedFiles, setQueuedFiles,
        selectedLeft, setSelectedLeft, selectedRight, setSelectedRight, selectedTrained, setSelectedTrained,
        fileInputRef, availableStageFiles, handleFileUpload, handleDrop,
        handleDeleteFromStage, handleTrainRag, handleDeleteTrained, handleResetDatabase
    } = useRagManager(props);

    const { isBusy } = props;

    const toggleSelection = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (file: string) => {
        setter(p => p.includes(file) ? p.filter(f => f !== file) : [...p, file]);
    };

    const handleRightPanelSelect = (file: string) => {
        if (trainedFiles.includes(file)) {
            toggleSelection(setSelectedTrained)(file);
        } else {
            toggleSelection(setSelectedRight)(file);
        }
    };

    return (
        <Stack spacing={2} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'stretch', height: 300 }}>
                <FilePanel
                    title="📂 Stage"
                    files={availableStageFiles}
                    selected={selectedLeft}
                    onSelect={toggleSelection(setSelectedLeft)}
                    isBusy={isBusy}
                    emptyText="Brak plików"
                >
                    {(file: string) => <Typography variant="body2" noWrap>📄 {file}</Typography>}
                </FilePanel>

                <Stack spacing={1} sx={{ justifyContent: 'center' }}>
                    <IconButton
                        onClick={() => { setQueuedFiles(p => [...p, ...selectedLeft]); setSelectedLeft([]); }}
                        disabled={selectedLeft.length === 0 || isBusy}
                    >
                        <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        onClick={() => { setQueuedFiles(p => p.filter(f => !selectedRight.includes(f))); setSelectedRight([]); }}
                        disabled={selectedRight.length === 0 || isBusy}
                    >
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                </Stack>

                <FilePanel
                    title="🧠 Baza wektorowa"
                    files={[...trainedFiles, ...queuedFiles]}
                    selected={[...selectedTrained, ...selectedRight]}
                    onSelect={handleRightPanelSelect}
                    isBusy={isBusy}
                    emptyText="Brak dokumentów"
                >
                    {(file: string) => (
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2" noWrap>
                                {trainedFiles.includes(file) ? '✅' : '📄'} {file}
                            </Typography>
                            {trainedFiles.includes(file) ?
                                <Chip label="W bazie" color="success" size="small" icon={<CheckCircleIcon />} sx={{ ml: 'auto', fontSize: '10px', height: '20px' }} /> :
                                <Chip label="Oczekuje" color="warning" size="small" icon={<PendingIcon />} sx={{ ml: 'auto', fontSize: '10px', height: '20px' }} />
                            }
                        </Stack>
                    )}
                </FilePanel>
            </Stack>

            <Stack direction="row" spacing={2}>
                <Stack spacing={1} sx={{ flex: 1 }}>
                    <Paper
                        variant="outlined"
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => !isBusy && fileInputRef.current?.click()}
                        sx={{
                            borderStyle: 'dashed',
                            borderWidth: 2,
                            borderColor: 'grey.400',
                            p: 2,
                            textAlign: 'center',
                            cursor: isBusy ? 'not-allowed' : 'pointer',
                            bgcolor: 'info.50',
                            opacity: isBusy ? 0.6 : 1,
                            transition: 'all 0.2s',
                            '&:hover': {
                                borderColor: isBusy ? 'grey.400' : 'primary.main',
                                bgcolor: isBusy ? 'info.50' : 'info.100'
                            }
                        }}
                    >
                        <input
                            type="file"
                            multiple
                            accept=".txt,.pdf"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        />
                        <CloudUploadIcon color="action" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography sx={{ fontWeight: 500 }}>
                            Kliknij, aby przesłać lub przeciągnij
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Obsługuje PDF oraz TXT
                        </Typography>
                    </Paper>

                    {selectedLeft.length > 0 && (
                        <Button variant="outlined" color="error" onClick={handleDeleteFromStage} disabled={isBusy}>
                            Usuń zaznaczone ze Stage
                        </Button>
                    )}
                </Stack>

                <Stack spacing={1} sx={{ flex: 1, justifyContent: 'flex-start' }}>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleTrainRag}
                        disabled={queuedFiles.length === 0 || isBusy}
                        sx={{ py: 1.5, fontWeight: 'bold' }}
                    >
                        Trenuj RAG ({queuedFiles.length})
                    </Button>

                    {selectedTrained.length > 0 && (
                        <Button variant="outlined" color="error" onClick={handleDeleteTrained} disabled={isBusy}>
                            Zapomnij zaznaczone ({selectedTrained.length})
                        </Button>
                    )}
                </Stack>
            </Stack>

            <Button
                variant="contained"
                color="error"
                onClick={handleResetDatabase}
                disabled={isBusy}
                sx={{ mt: 1, fontWeight: 'bold' }}
            >
                Wyczyść całą bazę wiedzy (RAG)
            </Button>
        </Stack>
    );
}