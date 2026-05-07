import { Typography, Stack, Button, IconButton, Chip } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { FilePanel } from './FilePanel';
import { PanelActionBar } from './PanelActionBar';

interface StagePanelProps {
    files: string[];
    selectedFiles: string[];
    cachedFiles: string[];
    isBusy: boolean;
    onSelect: (file: string) => void;
    onMoveToQueued: () => void;
    onDelete: () => void;
}

export function StagePanel({ files, selectedFiles, cachedFiles, isBusy, onSelect, onMoveToQueued, onDelete }: StagePanelProps) {
    const bottomActions = selectedFiles.length > 0 ? (
        <PanelActionBar>
            <Button
                variant="contained" color="primary" size="small" onClick={onMoveToQueued} disabled={isBusy}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 6, boxShadow: 'none', px: 2 }}
            >
                Przenieś do obszaru roboczego
            </Button>
            <IconButton
                size="small" onClick={onDelete} disabled={isBusy} title="Usuń zaznaczone pliki ze Stage"
                sx={{ borderRadius: 6, bgcolor: 'grey.100', color: 'text.secondary', '&:hover': { bgcolor: 'error.light', color: 'error.main' } }}
            >
                <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
        </PanelActionBar>
    ) : undefined;

    return (
        <FilePanel
            title="📂 Stage"
            files={files}
            selected={selectedFiles}
            onSelect={onSelect}
            isBusy={isBusy}
            emptyText="Brak plików"
            bottomActions={bottomActions}
        >
            {(file: string) => (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                    <Typography variant="body2" noWrap>📄 {file}</Typography>
                    {cachedFiles.includes(file) && (
                        <Chip
                            label="W cache" size="small" icon={<Inventory2OutlinedIcon style={{ fontSize: '12px' }}/>}
                            sx={{
                                ml: 'auto', fontSize: '10px', height: '20px', border: 'none',
                                bgcolor: selectedFiles.includes(file) ? 'rgba(255, 255, 255, 0.2)' : 'grey.200',
                                color: selectedFiles.includes(file) ? 'info.contrastText' : 'text.secondary'
                            }}
                        />
                    )}
                </Stack>
            )}
        </FilePanel>
    );
}
