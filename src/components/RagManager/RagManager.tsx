import React from 'react';
import { Button, IconButton, Stack } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

import { useRagManager } from './hooks/useRagManager';
import { StagePanel } from './components/StagePanel';
import { VectorDbPanel } from './components/VectorDbPanel';
import { UploadDropzone } from './components/UploadDropzone';

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
        if (trainedFiles.includes(file)) toggleSelection(setSelectedTrained)(file);
        else toggleSelection(setSelectedRight)(file);
    };

    const handleRightSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedTrained([...trainedFiles]);
            setSelectedRight([...queuedFiles]);
        } else {
            setSelectedTrained([]);
            setSelectedRight([]);
        }
    };

    const handleMoveRight = () => {
        setQueuedFiles(p => [...p, ...selectedLeft]);
        setSelectedLeft([]);
    };

    const handleMoveLeft = () => {
        setQueuedFiles(p => p.filter(f => !selectedRight.includes(f)));
        setSelectedRight([]);
    };

    return (
        <Stack spacing={2} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'stretch', height: 300 }}>
                <StagePanel
                    files={availableStageFiles}
                    selectedFiles={selectedLeft}
                    cachedFiles={cachedFiles}
                    isBusy={isBusy}
                    onSelect={toggleSelection(setSelectedLeft)}
                    onMoveToQueued={handleMoveRight}
                    onDelete={handleDeleteFromStage}
                />

                <Stack spacing={1} sx={{ justifyContent: 'center' }}>
                    <IconButton onClick={handleMoveRight} disabled={selectedLeft.length === 0 || isBusy}>
                        <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={handleMoveLeft} disabled={selectedRight.length === 0 || isBusy}>
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                </Stack>

                <VectorDbPanel
                    trainedFiles={trainedFiles}
                    queuedFiles={queuedFiles}
                    selectedTrained={selectedTrained}
                    selectedRight={selectedRight}
                    isBusy={isBusy}
                    onSelect={handleRightPanelSelect}
                    onSelectAll={handleRightSelectAll}
                    onDeselectAll={() => { setSelectedTrained([]); setSelectedRight([]); }}
                    onDeleteTrained={handleDeleteTrained}
                />
            </Stack>

            <Stack direction="row" spacing={2}>
                <UploadDropzone
                    fileInputRef={fileInputRef}
                    isBusy={isBusy}
                    onDrop={handleDrop}
                    onFilesSelected={handleFileUpload}
                />

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
