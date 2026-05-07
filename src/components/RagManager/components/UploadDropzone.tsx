import React, { type RefObject } from 'react';
import { Typography, Paper, Stack } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface UploadDropzoneProps {
    fileInputRef: RefObject<HTMLInputElement | null>;
    isBusy: boolean;
    onDrop: (e: React.DragEvent) => void;
    onFilesSelected: (files: FileList) => void;
}

export function UploadDropzone({ fileInputRef, isBusy, onDrop, onFilesSelected }: UploadDropzoneProps) {
    return (
        <Stack spacing={1} sx={{ flex: 1 }}>
            <Paper
                variant="outlined"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
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
                    onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
                />
                <CloudUploadIcon color="action" sx={{ fontSize: 32, mb: 1 }} />
                <Typography sx={{ fontWeight: 500 }}>Kliknij, aby przesłać lub przeciągnij</Typography>
                <Typography variant="caption" color="text.secondary">Obsługuje PDF oraz TXT</Typography>
            </Paper>
        </Stack>
    );
}
