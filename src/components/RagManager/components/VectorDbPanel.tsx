import { Typography, Stack, Button, IconButton, Chip } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { FilePanel } from './FilePanel';
import { PanelActionBar } from './PanelActionBar';

interface VectorDbPanelProps {
    trainedFiles: string[];
    queuedFiles: string[];
    selectedTrained: string[];
    selectedRight: string[];
    isBusy: boolean;
    onSelect: (file: string) => void;
    onSelectAll: (checked: boolean) => void;
    onDeselectAll: () => void;
    onDeleteTrained: () => void;
}

export function VectorDbPanel({
                                  trainedFiles, queuedFiles, selectedTrained, selectedRight,
                                  isBusy, onSelect, onSelectAll, onDeselectAll, onDeleteTrained
                              }: VectorDbPanelProps) {
    const rightPanelFiles = [...trainedFiles, ...queuedFiles];
    const rightPanelSelected = [...selectedTrained, ...selectedRight];
    const isAllRightSelected = rightPanelFiles.length > 0 && rightPanelSelected.length === rightPanelFiles.length;
    const isRightIndeterminate = rightPanelSelected.length > 0 && rightPanelSelected.length < rightPanelFiles.length;

    const bottomActions = rightPanelSelected.length > 0 ? (
        <PanelActionBar>
            <Button
                variant="contained" color="primary" size="small" onClick={onDeselectAll} disabled={isBusy}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 6, boxShadow: 'none', px: 2 }}
            >
                Odznacz wszystko
            </Button>
            {selectedTrained.length > 0 && (
                <IconButton
                    size="small" onClick={onDeleteTrained} disabled={isBusy} title="Zapomnij zaznaczone (odłóż do cache)"
                    sx={{ borderRadius: 6, bgcolor: 'grey.100', color: 'text.secondary', '&:hover': { bgcolor: 'error.light', color: 'error.main' } }}
                >
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
            )}
        </PanelActionBar>
    ) : undefined;

    return (
        <FilePanel
            title="🧠 Baza wektorowa"
            files={rightPanelFiles}
            selected={rightPanelSelected}
            onSelect={onSelect}
            isBusy={isBusy}
            emptyText="Brak dokumentów"
            bottomActions={bottomActions}
            onSelectAll={onSelectAll}
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
    );
}