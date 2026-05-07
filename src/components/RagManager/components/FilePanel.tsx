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
    bottomActions?: React.ReactNode;

    onSelectAll?: (checked: boolean) => void;
    isAllSelected?: boolean;
    indeterminate?: boolean;
}

export const FilePanel: React.FC<FilePanelProps> = ({
                                                        title, files, selected, onSelect, isBusy, emptyText, children, bottomActions,
                                                        onSelectAll, isAllSelected, indeterminate
                                                    }) => (
    <Stack component={Paper} variant="outlined" sx={{ flex: 1, overflow: 'hidden', bgcolor: 'grey.50', position: 'relative' }}>
        <Box sx={{ px: 1.5, py: 1, bgcolor: 'grey.100', borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            {onSelectAll && (
                <Checkbox
                    size="small"
                    checked={isAllSelected || false}
                    indeterminate={indeterminate || false}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    disabled={isBusy || files.length === 0}
                    sx={{ p: 0.5, mr: 0.5, ml: -0.5 }}
                    title="Zaznacz / Odznacz wszystkie"
                />
            )}
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{title}</Typography>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 1, pb: bottomActions ? 7 : 1 }}>
            {files.length === 0 ? (
                <Stack sx={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">{emptyText}</Typography>
                </Stack>
            ) : (
                <List dense disablePadding>
                    {files.map((file: string) => {
                        const isSelected = selected.includes(file);
                        return (
                            <ListItem
                                key={file}
                                disablePadding
                                sx={{
                                    bgcolor: isSelected ? 'info.main' : 'transparent',
                                    color: isSelected ? 'info.contrastText' : 'inherit',
                                    borderRadius: 1,
                                    mb: 0.5,
                                    transition: 'background-color 0.2s',
                                    '& .MuiTypography-root': {
                                        color: isSelected ? 'info.contrastText' : 'inherit',
                                    },
                                    '& .MuiCheckbox-root': {
                                        color: isSelected ? 'info.contrastText' : 'inherit',
                                    }
                                }}
                            >
                                <FormControlLabel
                                    sx={{ width: '100%', ml: 0, pr: 1.5 }}
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={isSelected}
                                            onChange={() => onSelect(file)}
                                            disabled={isBusy}
                                            sx={{
                                                '&.Mui-checked': {
                                                    color: 'info.contrastText',
                                                }
                                            }}
                                        />
                                    }
                                    label={children ? children(file) : <Typography variant="body2" noWrap>{file}</Typography>}
                                />
                            </ListItem>
                        );
                    })}
                </List>
            )}
        </Box>

        {bottomActions && (
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    zIndex: 10
                }}
            >
                <Box sx={{ pointerEvents: 'auto' }}>
                    {bottomActions}
                </Box>
            </Box>
        )}
    </Stack>
);