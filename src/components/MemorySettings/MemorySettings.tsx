import { type Settings } from '../../services/api';
import './MemorySettings.css';

interface MemorySettingsProps {
    settings: Settings;
    setSettings: (settings: Settings) => void;
    disabled: boolean;
}

export function MemorySettings({ settings, setSettings, disabled }: MemorySettingsProps) {
    return (
        <div className={`memory-group ${!settings.memory_enabled ? 'disabled-group' : ''}`}>
            <div className="memory-header">
                <input
                    type="checkbox"
                    id="memoryToggle"
                    checked={settings.memory_enabled}
                    onChange={(e) => setSettings({ ...settings, memory_enabled: e.target.checked })}
                    disabled={disabled}
                />
                <label htmlFor="memoryToggle">Pamięć historii czatu</label>
            </div>

            <div className="memory-section">
                <label>Limit zapamiętanych wiadomości</label>
                <p className="hint">Ile ostatnich wiadomości brać pod uwagę przy dopytywaniu.</p>
                <input
                    type="number"
                    min="0"
                    max="20"
                    className="limit-input"
                    value={settings.history_limit}
                    onChange={(e) => setSettings({ ...settings, history_limit: parseInt(e.target.value) || 0 })}
                    disabled={disabled || !settings.memory_enabled}
                />
            </div>

            <div className="memory-section">
                <label>Re-phrasing Prompt (Zrozumienie kontekstu)</label>
                <p className="hint">Użyj <code>{'{chat_history}'}</code> i <code>{'{question}'}</code></p>
                <textarea
                    className="rephrase-textarea"
                    value={settings.rephrase_template}
                    onChange={(e) => setSettings({ ...settings, rephrase_template: e.target.value })}
                    disabled={disabled || !settings.memory_enabled}
                    placeholder="Wpisz prompt re-phrasingu..."
                />
            </div>
        </div>
    );
}