import { useState } from 'react';
import { api, type Settings } from '../../services/api';
import { RagManager } from './../RagManager/RagManager';
import { MemorySettings } from './../MemorySettings/MemorySettings';
import { SystemPrompt } from './../SystemPrompt/SystemPrompt';
import './Sidebar.css';

interface SidebarProps {
    settings: Settings;
    setSettings: (settings: Settings) => void;
    isChatLoading: boolean;
}

export function Sidebar({ settings, setSettings, isChatLoading }: SidebarProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [isRagBusy, setIsRagBusy] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    const showStatus = (msg: string) => {
        setStatusMsg(msg);
        setTimeout(() => setStatusMsg(''), 4000);
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        showStatus('Zapisywanie ustawień...');
        try {
            await api.saveSettings(settings);
            showStatus('Ustawienia zostały zapisane!');
        } catch (err) {
            showStatus(`Błąd: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsSaving(false);
        }
    };

    const isBusy = isChatLoading || isSaving || isRagBusy;

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>Baza Dokumentów i Ustawienia</h2>
                {statusMsg && <div className="status-message">{statusMsg}</div>}
            </div>

            <RagManager
                onStatusChange={showStatus}
                isBusy={isBusy}
                setBusy={setIsRagBusy}
            />

            <div className="settings-scroll-area">
                <MemorySettings
                    settings={settings}
                    setSettings={setSettings}
                    disabled={isBusy}
                />

                <SystemPrompt
                    template={settings.template}
                    onChange={(val) => setSettings({ ...settings, template: val })}
                    disabled={isBusy}
                />
            </div>

            <button
                className="save-btn"
                onClick={handleSaveSettings}
                disabled={isBusy || settings.template.trim() === '' || settings.rephrase_template.trim() === ''}
            >
                {isSaving ? 'Zapisywanie...' : 'Zapisz Ustawienia'}
            </button>
        </aside>
    );
}