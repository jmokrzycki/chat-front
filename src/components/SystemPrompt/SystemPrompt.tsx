import { ResetButton } from '../ResetButton/ResetButton';
import './SystemPrompt.css';

interface SystemPromptProps {
    template: string;
    onChange: (val: string) => void;
    onReset: () => void;
    disabled: boolean;
}

export function SystemPrompt({ template, onChange, onReset, disabled }: SystemPromptProps) {
    return (
        <div className="system-prompt-section">
            <div className="system-prompt-header">
                <label>Systemowy Prompt (Instrukcja główna)</label>
                <ResetButton
                    onClick={onReset}
                    disabled={disabled}
                    title="Przywróć domyślny, fabryczny prompt"
                />
            </div>

            <p className="hint">
                Opisz rolę asystenta i zasady odpowiedzi. Historia i kontekst dodadzą się automatycznie w tle.
            </p>
            <textarea
                className="template-textarea"
                value={template}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder="Wpisz instrukcję systemową..."
            />
        </div>
    );
}