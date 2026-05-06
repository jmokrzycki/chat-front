import { useState } from 'react';
import { Typography, Button, Snackbar, Alert, Stack, Box } from '@mui/material';
import { api, type Settings } from '../../services/api';
import { RagManager } from './../RagManager/RagManager';
import { MemorySettings } from './../MemorySettings/MemorySettings';
import { SystemPrompt } from './../SystemPrompt/SystemPrompt';

interface SidebarProps {
    settings: Settings;
    defaultSettings: Settings | null;
    setSettings: (settings: Settings) => void;
    isChatLoading: boolean;
}

export function Sidebar({ settings, defaultSettings, setSettings, isChatLoading }: SidebarProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [isRagBusy, setIsRagBusy] = useState(false);

    const [status, setStatus] = useState<{ open: boolean, message: string, severity: 'success' | 'error' | 'info' }>({
        open: false,
        message: '',
        severity: 'info'
    });

    const showStatus = (msg: string, severity: 'success' | 'error' | 'info' = 'info') => {
        setStatus({ open: true, message: msg, severity });
    };

    const handleCloseStatus = () => {
        setStatus(prev => ({ ...prev, open: false }));
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        showStatus('Zapisywanie ustawień...', 'info');
        try {
            await api.saveSettings(settings);
            showStatus('Ustawienia zostały zapisane!', 'success');
        } catch (err) {
            showStatus(`Błąd: ${err instanceof Error ? err.message : String(err)}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const createResetHandler = (key: keyof Settings, successMsg: string) => async () => {
        if (!defaultSettings) return;
        if (!window.confirm("Czy na pewno chcesz przywrócić domyślne ustawienie?")) return;

        setIsSaving(true);
        showStatus('Przywracanie ustawień...', 'info');
        try {
            const updatedSettings = { ...settings, [key]: defaultSettings[key] };
            setSettings(updatedSettings);
            await api.saveSettings(updatedSettings);
            showStatus(successMsg, 'success');
        } catch (err) {
            showStatus(`Błąd przywracania: ${err instanceof Error ? err.message : String(err)}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetPrompt = createResetHandler('template', 'Przywrócono i zapisano domyślny prompt!');
    const handleResetRephrasePrompt = createResetHandler('rephrase_template', 'Przywrócono i zapisano domyślny prompt re-phrasingu!');
    const handleResetHistoryLimit = createResetHandler('history_limit', 'Przywrócono i zapisano domyślny limit!');
    const handleResetMemoryToggle = createResetHandler('memory_enabled', 'Przywrócono i zapisano ustawienie pamięci!');

    const isBusy = isChatLoading || isSaving || isRagBusy;

    return (
        <Stack
            component="aside"
            sx={{
                flex: { lg: '0 0 550px' },
                bgcolor: 'grey.50',
                borderRight: { lg: '1px solid' },
                borderBottom: { xs: '1px solid', lg: 'none' },
                borderColor: 'divider',
                p: 2,
                maxHeight: { xs: '60vh', lg: 'none' },
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Baza Dokumentów i Ustawienia
            </Typography>

            <RagManager
                onStatusChange={(msg) => showStatus(msg, 'info')}
                isBusy={isBusy}
                setBusy={setIsRagBusy}
            />

            <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
                <Stack spacing={3}>
                    <MemorySettings
                        settings={settings}
                        defaultSettings={defaultSettings}
                        setSettings={setSettings}
                        disabled={isBusy}
                        onResetRephrase={handleResetRephrasePrompt}
                        onResetHistoryLimit={handleResetHistoryLimit}
                        onResetMemoryToggle={handleResetMemoryToggle}
                    />
                    <SystemPrompt
                        template={settings.template}
                        defaultTemplate={defaultSettings?.template}
                        onChange={(val) => setSettings({ ...settings, template: val })}
                        onReset={handleResetPrompt}
                        disabled={isBusy}
                    />
                </Stack>
            </Box>

            <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSaveSettings}
                disabled={isBusy || settings.template.trim() === '' || settings.rephrase_template.trim() === ''}
                sx={{ mt: 2, fontWeight: 'bold' }}
            >
                {isSaving ? 'Zapisywanie...' : 'Zapisz Ustawienia'}
            </Button>

            <Snackbar
                open={status.open}
                autoHideDuration={4000}
                onClose={handleCloseStatus}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseStatus}
                    severity={status.severity}
                    variant="filled"
                    sx={{ width: '100%', boxShadow: 3 }}
                >
                    {status.message}
                </Alert>
            </Snackbar>
        </Stack>
    );
}
