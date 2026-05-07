import React from 'react';
import {
    Typography,
    Paper,
    Button,
    IconButton,
    Chip,
    Stack
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useRagManager } from './useRagManager';
import { FilePanel } from './FilePanel';

interface RagManagerProps {
    onStatusChange: (msg: string) => void;
    isBusy: boolean;
    setBusy: (state: boolean) => void;
}

export function RagManager(props: RagManagerProps) {
    const {
        trainedFiles, cachedFiles, queuedFiles, setQueuedFiles,
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

    const rightPanelFiles = [...trainedFiles, ...queuedFiles];
    const rightPanelSelected = [...selectedTrained, ...selectedRight];
    const isAllRightSelected = rightPanelFiles.length > 0 && rightPanelSelected.length === rightPanelFiles.length;
    const isRightIndeterminate = rightPanelSelected.length > 0 && rightPanelSelected.length < rightPanelFiles.length;

    const handleRightSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedTrained([...trainedFiles]);
            setSelectedRight([...queuedFiles]);
        } else {
            setSelectedTrained([]);
            setSelectedRight([]);
        }
    };

    const handleDeselectAllRight = () => {
        setSelectedTrained([]);
        setSelectedRight([]);
    };

    const stageBottomActions = selectedLeft.length > 0 ? (
        <Stack direction="row" spacing={1} sx={{ bgcolor: 'background.paper', boxShadow: '0px 4px 20px rgba(0,0,0,0.15)', borderRadius: 8, p: 0.75, border: '1px solid', borderColor: 'divider', alignItems: 'center' }}>
            <Button
                variant="contained" color="primary" size="small" onClick={() => { setQueuedFiles(p => [...p, ...selectedLeft]); setSelectedLeft([]); }} disabled={isBusy}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 6, boxShadow: 'none', px: 2 }}
            >
                Przenieś do obszaru roboczego
            </Button>
            <IconButton
                size="small" onClick={handleDeleteFromStage} disabled={isBusy} title="Usuń zaznaczone pliki ze Stage"
                sx={{ borderRadius: 6, bgcolor: 'grey.100', color: 'text.secondary', '&:hover': { bgcolor: 'error.light', color: 'error.main' } }}
            >
                <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
        </Stack>
    ) : undefined;

    const rightBottomActions = rightPanelSelected.length > 0 ? (
        <Stack direction="row" spacing={1} sx={{ bgcolor: 'background.paper', boxShadow: '0px 4px 20px rgba(0,0,0,0.15)', borderRadius: 8, p: 0.75, border: '1px solid', borderColor: 'divider', alignItems: 'center' }}>
            <Button
                variant="contained" color="primary" size="small" onClick={handleDeselectAllRight} disabled={isBusy}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 6, boxShadow: 'none', px: 2 }}
            >
                Odznacz wszystko
            </Button>
            {selectedTrained.length > 0 && (
                <IconButton
                    size="small" onClick={handleDeleteTrained} disabled={isBusy} title="Zapomnij zaznaczone (odłóż do cache)"
                    sx={{ borderRadius: 6, bgcolor: 'grey.100', color: 'text.secondary', '&:hover': { bgcolor: 'error.light', color: 'error.main' } }}
                >
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
            )}
        </Stack>
    ) : undefined;

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
                    bottomActions={stageBottomActions}
                >
                    {(file: string) => (
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2" noWrap>📄 {file}</Typography>
                            {cachedFiles.includes(file) && (
                                <Chip
                                    label="W cache" size="small" icon={<Inventory2OutlinedIcon style={{ fontSize: '12px' }}/>}
                                    sx={{ ml: 'auto', fontSize: '10px', height: '20px', bgcolor: selectedLeft.includes(file) ? 'rgba(255, 255, 255, 0.2)' : 'grey.200', color: selectedLeft.includes(file) ? 'info.contrastText' : 'text.secondary', border: 'none' }}
                                />
                            )}
                        </Stack>
                    )}
                </FilePanel>

                <Stack spacing={1} sx={{ justifyContent: 'center' }}>
                    <IconButton onClick={() => { setQueuedFiles(p => [...p, ...selectedLeft]); setSelectedLeft([]); }} disabled={selectedLeft.length === 0 || isBusy}>
                        <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => { setQueuedFiles(p => p.filter(f => !selectedRight.includes(f))); setSelectedRight([]); }} disabled={selectedRight.length === 0 || isBusy}>
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                </Stack>

                <FilePanel
                    title="🧠 Baza wektorowa"
                    files={rightPanelFiles}
                    selected={rightPanelSelected}
                    onSelect={handleRightPanelSelect}
                    isBusy={isBusy}
                    emptyText="Brak dokumentów"
                    bottomActions={rightBottomActions}
                    onSelectAll={handleRightSelectAll}
                    isAllSelected={isAllRightSelected}
                    indeterminate={isRightIndeterminate}
                >
                    {(file: string) => (
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2" noWrap>
                                {trainedFiles.includes(file) ? '✅' : '📄'} {file}
                            </Typography>
                            {trainedFiles.includes(file) ?
                                <Chip label="W bazie" size="small" icon={<CheckCircleIcon />} sx={{ ml: 'auto', fontSize: '10px', height: '20px', bgcolor: rightPanelSelected.includes(file) ? 'info.main' : 'success.light', color: 'success.contrastText' }} /> :
                                <Chip label="Oczekuje" size="small" icon={<PendingIcon />} sx={{ ml: 'auto', fontSize: '10px', height: '20px', bgcolor: rightPanelSelected.includes(file) ? 'info.main' : 'warning.light', color: 'warning.contrastText' }} />
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
                            borderStyle: 'dashed', borderWidth: 2, borderColor: 'grey.400', p: 2, textAlign: 'center', cursor: isBusy ? 'not-allowed' : 'pointer', bgcolor: 'info.50', opacity: isBusy ? 0.6 : 1, transition: 'all 0.2s',
                            '&:hover': { borderColor: isBusy ? 'grey.400' : 'primary.main', bgcolor: isBusy ? 'info.50' : 'info.100' }
                        }}
                    >
                        <input type="file" multiple accept=".txt,.pdf" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => e.target.files && handleFileUpload(e.target.files)} />
                        <CloudUploadIcon color="action" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography sx={{ fontWeight: 500 }}>Kliknij, aby przesłać lub przeciągnij</Typography>
                        <Typography variant="caption" color="text.secondary">Obsługuje PDF oraz TXT</Typography>
                    </Paper>
                </Stack>

                <Stack spacing={1} sx={{ flex: 1, justifyContent: 'flex-start' }}>
                    <Button
                        variant="contained" color="success" onClick={handleTrainRag} disabled={queuedFiles.length === 0 || isBusy} sx={{ py: 1.5, fontWeight: 'bold' }}
                    >
                        Trenuj RAG ({queuedFiles.length})
                    </Button>
                </Stack>
            </Stack>

            <Button
                variant="contained" color="error" onClick={handleResetDatabase} disabled={isBusy} sx={{ mt: 1, fontWeight: 'bold' }}
            >
                Wyczyść całą bazę wiedzy i jej Cache
            </Button>
        </Stack>
    );
}