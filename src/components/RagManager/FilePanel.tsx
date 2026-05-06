import React from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    Checkbox,
    FormControlLabel,
    Stack
} from '@mui/material';

export interface FilePanelProps {
    title: string;
    files: string[];
    selected: string[];
    onSelect: (file: string) => void;
    isBusy: boolean;
    emptyText: string;
    children?: (file: string) => React.ReactNode;
}

export const FilePanel: React.FC<FilePanelProps> = ({ title, files, selected, onSelect, isBusy, emptyText, children }) => (
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
