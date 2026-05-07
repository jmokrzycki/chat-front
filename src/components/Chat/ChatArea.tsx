import { Stack, Typography, Button } from '@mui/material';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';

import type { Message } from '../../types';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';

interface ChatAreaProps {
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (prompt: string) => void;
    onStopMessage: () => void;
    onClearChat: () => void;
}

export function ChatArea({ messages, isLoading, onSendMessage, onStopMessage, onClearChat }: ChatAreaProps) {
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

            <MessageList
                messages={messages}
                isLoading={isLoading}
            />

            <ChatInput
                isLoading={isLoading}
                onSendMessage={onSendMessage}
                onStopMessage={onStopMessage}
            />
        </Stack>
    );
}