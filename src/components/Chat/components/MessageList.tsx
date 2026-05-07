import { useRef, useEffect } from 'react';
import { Box, Stack, Typography, Paper } from '@mui/material';
import type { Message } from '../../../types';

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
    const chatBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages.length, messages]);

    return (
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
    );
}