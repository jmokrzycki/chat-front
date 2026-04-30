import { useState } from 'react';
import { api, type Settings } from '../../services/api';
import { DocumentManager } from './DocumentManager';
import './Sidebar.css';

interface SidebarProps {
    settings: Settings;
    setSettings: (settings: Settings) => void;
    isChatLoading: boolean;
}

export function Sidebar({ settings, setSettings, isChatLoading }: SidebarProps) {
    const [isResetting, setIsResetting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDocManagerBusy, setIsDocManagerBusy] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const showStatus = (msg: string) => {
        setStatusMsg(msg);
        setTimeout(() => setStatusMsg(''), 4000);
    };

    const handleReset = async () => {
        if (!window.confirm('Czy na pewno usunąć całą wiedzę z wytrenowanej bazy wektorowej? (Pliki ze stage pozostaną)')) return;
        setIsResetting(true);
        showStatus('Czyszczenie bazy...');
        try {
            await api.resetDatabase();
            showStatus('Baza wyczyszczona!');
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            showStatus(`Błąd: ${errorMessage}`);
        } finally {
            setIsResetting(false);
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        showStatus('Zapisywanie ustawień...');
        try {
            await api.saveSettings(settings);
            showStatus('Ustawienia zostały zapisane!');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            showStatus(`Błąd: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    const isBusy = isResetting || isChatLoading || isSaving || isDocManagerBusy;

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>Baza Dokumentów i Ustawienia</h2>
                {statusMsg && <div className="status-message">{statusMsg}</div>}
            </div>

            <DocumentManager
                onStatusChange={showStatus}
                isBusy={isDocManagerBusy || isResetting}
                setBusy={setIsDocManagerBusy}
                refreshTrigger={refreshTrigger}
            />

            <div className="sidebar-section">
                <button className="reset-btn" onClick={handleReset} disabled={isBusy}>
                    {isResetting ? 'Usuwanie bazy wektorowej...' : 'Wyczyść bazę wiedzy (RAG)'}
                </button>
            </div>

            <div className="settings-scroll-area">

                <div className={`memory-group ${!settings.memory_enabled ? 'disabled-group' : ''}`}>
                    <div className="memory-header">
                        <input
                            type="checkbox"
                            id="memoryToggle"
                            checked={settings.memory_enabled}
                            onChange={(e) => setSettings({ ...settings, memory_enabled: e.target.checked })}
                            disabled={isSaving}
                        />
                        <label htmlFor="memoryToggle">Pamięć historii czatu</label>
                    </div>

                    <div className="prompt-section">
                        <label>Limit zapamiętanych wiadomości</label>
                        <p className="hint">Ile ostatnich wiadomości brać pod uwagę przy dopytywaniu.</p>
                        <input
                            type="number"
                            min="0"
                            max="20"
                            className="limit-input"
                            value={settings.history_limit}
                            onChange={(e) => setSettings({ ...settings, history_limit: parseInt(e.target.value) || 0 })}
                            disabled={isSaving || !settings.memory_enabled}
                        />
                    </div>

                    <div className="prompt-section">
                        <label>Re-phrasing Prompt (Zrozumienie kontekstu)</label>
                        <p className="hint">Użyj <code>{'{chat_history}'}</code> i <code>{'{question}'}</code></p>
                        <textarea
                            className="template-textarea rephrase-textarea"
                            value={settings.rephrase_template}
                            onChange={(e) => setSettings({ ...settings, rephrase_template: e.target.value })}
                            disabled={isSaving || !settings.memory_enabled}
                            placeholder="Wpisz prompt re-phrasingu..."
                        />
                    </div>
                </div>

                <div className="sidebar-section prompt-section">
                    <label>Systemowy Prompt (Główna odpowiedź)</label>
                    <p className="hint">Użyj <code>{'{context}'}</code>, <code>{'{question}'}</code> i <code>{'{chat_history}'}</code></p>
                    <textarea
                        className="template-textarea"
                        value={settings.template}
                        onChange={(e) => setSettings({ ...settings, template: e.target.value })}
                        disabled={isSaving}
                        placeholder="Wpisz systemowy prompt..."
                    />
                </div>
            </div>

            <button
                className="save-btn"
                onClick={handleSaveSettings}
                disabled={isSaving || settings.template.trim() === '' || settings.rephrase_template.trim() === ''}
                style={{ marginTop: '15px' }}
            >
                {isSaving ? 'Zapisywanie...' : 'Zapisz Ustawienia'}
            </button>
        </aside>
    );
}