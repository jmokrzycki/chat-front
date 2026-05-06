import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Paper } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatArea } from './components/Chat/ChatArea';
import { api, type Settings } from './services/api';
import { useChat } from './hooks/useChat';

const theme = createTheme({
    palette: {
        background: {
            default: grey[100],
        },
        primary: {
            main: '#007bff',
        },
    },
    typography: {
        fontFamily: 'sans-serif',
    },
});

function App() {
    const [settings, setSettings] = useState<Settings>({
        template: 'Ładowanie...',
        rephrase_template: 'Ładowanie...',
        history_limit: 4,
        memory_enabled: true,
    });
    const [defaultSettings, setDefaultSettings] = useState<Settings | null>(null);

    const { messages, isLoading, sendMessage, stopGenerating, clearChat } = useChat(settings);

    useEffect(() => {
        Promise.all([api.getSettings(), api.getDefaultSettings()])
            .then(([current, defaults]) => {
                setSettings(current);
                setDefaultSettings(defaults);
            })
            .catch((err) => console.error('Nie udało się pobrać ustawień:', err));
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    height: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: { xs: 0, md: 3 },
                }}
            >
                <Paper
                    elevation={4}
                    sx={{
                        display: 'flex',
                        width: '100%',
                        maxWidth: 1500,
                        height: { xs: '100vh', md: '90vh' },
                        flexDirection: { xs: 'column', lg: 'row' },
                        overflow: 'hidden',
                        borderRadius: { xs: 0, md: 3 },
                    }}
                >
                    <Sidebar
                        settings={settings}
                        defaultSettings={defaultSettings}
                        setSettings={setSettings}
                        isChatLoading={isLoading}
                    />
                    <ChatArea
                        messages={messages}
                        isLoading={isLoading}
                        onSendMessage={sendMessage}
                        onStopMessage={stopGenerating}
                        onClearChat={clearChat}
                    />
                </Paper>
            </Box>
        </ThemeProvider>
    );
}

export default App;