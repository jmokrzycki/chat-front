import React, { useState } from 'react';
import { Box, TextField, InputAdornment, IconButton } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import StopIcon from '@mui/icons-material/Stop';

interface ChatInputProps {
    isLoading: boolean;
    onSendMessage: (prompt: string) => void;
    onStopMessage: () => void;
}

export function ChatInput({ isLoading, onSendMessage, onStopMessage }: ChatInputProps) {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;
        onSendMessage(prompt);
        setPrompt('');
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center'
            }}
        >
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Zadaj pytanie..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        pr: 1.5,
                        pl: 2
                    }
                }}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                {isLoading ? (
                                    <IconButton
                                        onClick={onStopMessage}
                                        title="Zatrzymaj generowanie"
                                        sx={{
                                            bgcolor: 'grey.200',
                                            color: 'common.black',
                                            width: 36,
                                            height: 36,
                                            '&:hover': { bgcolor: 'grey.300' }
                                        }}
                                    >
                                        <StopIcon fontSize="small" />
                                    </IconButton>
                                ) : (
                                    <IconButton
                                        type="submit"
                                        disabled={!prompt.trim()}
                                        title="Wyślij wiadomość"
                                        sx={{
                                            bgcolor: 'grey.900',
                                            color: 'common.white',
                                            width: 36,
                                            height: 36,
                                            '&:hover': { bgcolor: 'grey.800' },
                                            '&.Mui-disabled': {
                                                bgcolor: 'grey.200',
                                                color: 'grey.400'
                                            }
                                        }}
                                    >
                                        <ArrowUpwardIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </InputAdornment>
                        ),
                    }
                }}
            />
        </Box>
    );
}