import React, { useRef, useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    InputAdornment,
    Stack,
    IconButton
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import StopIcon from '@mui/icons-material/Stop';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';

import type { Message } from '../../types';

interface ChatAreaProps {
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (prompt: string) => void;
    onStopMessage: () => void;
    onClearChat: () => void;
}

export function ChatArea({ messages, isLoading, onSendMessage, onStopMessage, onClearChat }: ChatAreaProps) {
    const [prompt, setPrompt] = useState('');
    const chatBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages.length, messages]);

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;
        onSendMessage(prompt);
        setPrompt('');
    };

    return (
        <Stack sx={{ flexGrow: 1, minWidth: 0, bgcolor: 'background.paper' }}>
            <Stack
                direction="row"
                sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50'
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Czat z asystentem
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<ChatBubbleOutlineOutlinedIcon />}
                    onClick={onClearChat}
                    disabled={isLoading || messages.length === 0}
                    title="Rozpocznij nową konwersację (usuwa historię z pamięci)"
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                    Nowa rozmowa
                </Button>
            </Stack>
            <Box
                ref={chatBoxRef}
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                {messages.length === 0 && (
                    <Stack sx={{ alignItems: 'center', m: 'auto', textAlign: 'center', maxWidth: 400 }}>
                        <Typography variant="h5" gutterBottom>
                            Witaj!
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Dodaj dokumenty po lewej stronie, włącz pamięć czatu, ustaw prompt i rozpocznij rozmowę z modelem.
                        </Typography>
                    </Stack>
                )}

                {messages.map((msg, idx) => {
                    const isUser = msg.sender === 'user';
                    return (
                        <Box
                            key={idx}
                            sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    py: 1.5,
                                    px: 2.5,
                                    maxWidth: '80%',
                                    borderRadius: 4,
                                    borderBottomRightRadius: isUser ? 4 : 16,
                                    borderBottomLeftRadius: isUser ? 16 : 4,
                                    bgcolor: isUser ? 'primary.main' : 'grey.100',
                                    color: isUser ? 'primary.contrastText' : undefined,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    lineHeight: 1.6
                                }}
                            >
                                <Typography variant="body1" component="span">
                                    {msg.text}
                                    {isLoading && idx === messages.length - 1 && (
                                        <Box
                                            component="span"
                                            sx={{
                                                animation: 'blink 1s step-end infinite',
                                                '@keyframes blink': {
                                                    '0%, 100%': { opacity: 1 },
                                                    '50%': { opacity: 0 }
                                                }
                                            }}
                                        >
                                            ▋
                                        </Box>
                                    )}
                                </Typography>
                            </Paper>
                        </Box>
                    );
                })}
            </Box>
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
                    placeholder="Zadaj pytanie na podstawie dokumentów..."
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
        </Stack>
    );
}