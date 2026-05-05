import { type Settings } from '../../services/api';
import { ResetButton } from '../ResetButton/ResetButton';
import './MemorySettings.css';

interface MemorySettingsProps {
    settings: Settings;
    setSettings: (settings: Settings) => void;
    disabled: boolean;
    onResetRephrase: () => void;
    onResetHistoryLimit: () => void;
    onResetMemoryToggle: () => void;
}

export function MemorySettings({
                                   settings,
                                   setSettings,
                                   disabled,
                                   onResetRephrase,
                                   onResetHistoryLimit,
                                   onResetMemoryToggle
                               }: MemorySettingsProps) {
    return (
        <div className={`memory-group ${!settings.memory_enabled ? 'disabled-group' : ''}`}>
            <div className="memory-header">
                <div className="memory-header-left">
                    <input
                        type="checkbox"
                        id="memoryToggle"
                        checked={settings.memory_enabled}
                        onChange={(e) => setSettings({ ...settings, memory_enabled: e.target.checked })}
                        disabled={disabled}
                    />
                    <label htmlFor="memoryToggle">Pamięć historii czatu</label>
                </div>
                <ResetButton
                    onClick={onResetMemoryToggle}
                    disabled={disabled}
                    title="Przywróć domyślne zachowanie pamięci"
                />
            </div>

            <div className="memory-section">
                <div className="setting-header">
                    <label>Limit zapamiętanych wiadomości</label>
                    <ResetButton
                        onClick={onResetHistoryLimit}
                        disabled={disabled || !settings.memory_enabled}
                        title="Przywróć domyślny limit historii"
                    />
                </div>
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
                <div className="setting-header">
                    <label>Re-phrasing Prompt (Zrozumienie kontekstu)</label>
                    <ResetButton
                        onClick={onResetRephrase}
                        disabled={disabled || !settings.memory_enabled}
                        title="Przywróć domyślny prompt re-phrasingu"
                    />
                </div>
                <p className="hint">Opisz instrukcję wyciągania kontekstu z historii (Historia i pytanie dodadzą się w tle).</p>
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
