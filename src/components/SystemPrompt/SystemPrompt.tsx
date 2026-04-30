import './SystemPrompt.css';

interface SystemPromptProps {
    template: string;
    onChange: (val: string) => void;
    disabled: boolean;
}

export function SystemPrompt({ template, onChange, disabled }: SystemPromptProps) {
    return (
        <div className="system-prompt-section">
            <label>Systemowy Prompt (Główna odpowiedź)</label>
            <p className="hint">
                Użyj <code>{'{context}'}</code>, <code>{'{question}'}</code> i <code>{'{chat_history}'}</code>
            </p>
            <textarea
                className="template-textarea"
                value={template}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder="Wpisz systemowy prompt..."
            />
        </div>
    );
}