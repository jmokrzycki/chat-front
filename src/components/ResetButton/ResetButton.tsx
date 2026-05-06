import { Button } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';

interface ResetButtonProps {
    onClick: () => void;
    disabled?: boolean;
    title?: string;
}

export function ResetButton({ onClick, disabled = false, title = "Resetuj do ustawień domyślnych" }: ResetButtonProps) {
    return (
        <Button
            type="button"
            variant="text"
            size="small"
            startIcon={<ReplayIcon />}
            onClick={onClick}
            disabled={disabled}
            title={title}
            sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '12px',
                py: 0.2,
                px: 1,
            }}
        >
            Resetuj
        </Button>
    );
}
