import { Typography, TextField, Stack } from '@mui/material';
import { ResetButton } from '../ResetButton/ResetButton';

interface SystemPromptProps {
    template: string;
    onChange: (val: string) => void;
    onReset: () => void;
    disabled: boolean;
}

export function SystemPrompt({ template, onChange, onReset, disabled }: SystemPromptProps) {
    return (
        <Stack spacing={1}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography component="label" variant="body1" sx={{ fontWeight: 'bold' }}>
                    Systemowy Prompt (Instrukcja główna)
                </Typography>
                <ResetButton
                    onClick={onReset}
                    disabled={disabled}
                    title="Przywróć domyślny, fabryczny prompt"
                />
            </Stack>

            <Typography variant="body2" color="text.secondary">
                Opisz rolę asystenta i zasady odpowiedzi. Historia i kontekst dodadzą się automatycznie w tle.
            </Typography>

            <TextField
                multiline
                minRows={6}
                fullWidth
                value={template}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder="Wpisz instrukcję systemową..."
                sx={{
                    '& .MuiInputBase-input': {
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        lineHeight: 1.5,
                    },
                    bgcolor: 'background.paper'
                }}
            />
        </Stack>
    );
}