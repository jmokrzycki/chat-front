import './ResetButton.css';

interface ResetButtonProps {
    onClick: () => void;
    disabled?: boolean;
    title?: string;
}

export function ResetButton({ onClick, disabled = false, title = "Resetuj do ustawień domyślnych" }: ResetButtonProps) {
    return (
        <button
            type="button"
            className="reset-inline-btn"
            onClick={onClick}
            disabled={disabled}
            title={title}
        >
            ⟲ Resetuj
        </button>
    );
}