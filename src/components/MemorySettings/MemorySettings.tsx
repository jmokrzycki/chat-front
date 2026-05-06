import { Typography, TextField, Paper, Checkbox, FormControlLabel, Stack } from '@mui/material';
import { type Settings } from '../../services/api';
import { ResetButton } from '../ResetButton/ResetButton';

interface MemorySettingsProps {
    settings: Settings;
    defaultSettings: Settings | null;
    setSettings: (settings: Settings) => void;
    disabled: boolean;
    onResetRephrase: () => void;
    onResetHistoryLimit: () => void;
    onResetMemoryToggle: () => void;
}

export function MemorySettings({
                                   settings,
                                   defaultSettings,
                                   setSettings,
                                   disabled,
                                   onResetRephrase,
                                   onResetHistoryLimit,
                                   onResetMemoryToggle
                               }: MemorySettingsProps) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                bgcolor: 'grey.50',
                transition: 'opacity 0.2s',
                opacity: settings.memory_enabled ? 1 : 0.6,
            }}
        >
            <Stack spacing={2}>
                <Stack
                    direction="row"
                    sx={{ justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: 1, borderColor: 'divider', minHeight: '36px' }}
                >
                    <FormControlLabel
                        control={
                            <Checkbox
                                id="memoryToggle"
                                checked={settings.memory_enabled}
                                onChange={(e) => setSettings({ ...settings, memory_enabled: e.target.checked })}
                                disabled={disabled}
                            />
                        }
                        label={
                            <Typography sx={{ fontWeight: 'bold' }}>Pamięć historii czatu</Typography>
                        }
                    />
                    {defaultSettings && settings.memory_enabled !== defaultSettings.memory_enabled && (
                        <ResetButton
                            onClick={onResetMemoryToggle}
                            disabled={disabled}
                            title="Przywróć domyślne zachowanie pamięci"
                        />
                    )}
                </Stack>

                <Stack spacing={0.5}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', minHeight: '30px' }}>
                        <Typography component="label" variant="body1" sx={{ fontWeight: 'bold' }}>
                            Limit zapamiętanych wiadomości
                        </Typography>
                        {defaultSettings && settings.history_limit !== defaultSettings.history_limit && (
                            <ResetButton
                                onClick={onResetHistoryLimit}
                                disabled={disabled || !settings.memory_enabled}
                                title="Przywróć domyślny limit historii"
                            />
                        )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Ile ostatnich wiadomości brać pod uwagę przy dopytywaniu.
                    </Typography>
                    <TextField
                        type="number"
                        size="small"
                        slotProps={{
                            htmlInput: { min: 0, max: 20 }
                        }}
                        value={settings.history_limit}
                        onChange={(e) => setSettings({ ...settings, history_limit: parseInt(e.target.value) || 0 })}
                        disabled={disabled || !settings.memory_enabled}
                        sx={{ width: 80, bgcolor: 'background.paper' }}
                    />
                </Stack>

                <Stack spacing={0.5}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', minHeight: '30px' }}>
                        <Typography component="label" variant="body1" sx={{ fontWeight: 'bold' }}>
                            Re-phrasing Prompt (Kontekst)
                        </Typography>
                        {defaultSettings && settings.rephrase_template !== defaultSettings.rephrase_template && (
                            <ResetButton
                                onClick={onResetRephrase}
                                disabled={disabled || !settings.memory_enabled}
                                title="Przywróć domyślny prompt re-phrasingu"
                            />
                        )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Instrukcja wyciągania kontekstu z historii dla RAG.
                    </Typography>
                    <TextField
                        multiline
                        minRows={6}
                        fullWidth
                        value={settings.rephrase_template}
                        onChange={(e) => setSettings({ ...settings, rephrase_template: e.target.value })}
                        disabled={disabled || !settings.memory_enabled}
                        placeholder="Wpisz prompt re-phrasingu..."
                        sx={{
                            '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: '13px' },
                            bgcolor: 'background.paper'
                        }}
                    />
                </Stack>
            </Stack>
        </Paper>
    );
}