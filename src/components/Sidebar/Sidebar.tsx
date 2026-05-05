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

    const handleResetPrompt = async () => {
        if (!window.confirm("Czy na pewno chcesz przywrócić domyślny prompt systemowy?")) return;

        setIsSaving(true);
        showStatus('Przywracanie domyślnego promptu...');
        try {
            const defaultSettings = await api.getDefaultSettings();
            const updatedSettings = { ...settings, template: defaultSettings.template };

            setSettings(updatedSettings);
            await api.saveSettings(updatedSettings);

            showStatus('Przywrócono i zapisano domyślny prompt!');
        } catch (err) {
            showStatus(`Błąd przywracania: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetRephrasePrompt = async () => {
        if (!window.confirm("Czy na pewno chcesz przywrócić domyślny prompt re-phrasingu?")) return;

        setIsSaving(true);
        showStatus('Przywracanie domyślnego promptu...');
        try {
            const defaultSettings = await api.getDefaultSettings();
            const updatedSettings = { ...settings, rephrase_template: defaultSettings.rephrase_template };

            setSettings(updatedSettings);
            await api.saveSettings(updatedSettings);

            showStatus('Przywrócono i zapisano domyślny prompt!');
        } catch (err) {
            showStatus(`Błąd przywracania: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetHistoryLimit = async () => {
        if (!window.confirm("Czy na pewno chcesz przywrócić domyślny limit zapamiętanych wiadomości?")) return;

        setIsSaving(true);
        showStatus('Przywracanie domyślnego limitu...');
        try {
            const defaultSettings = await api.getDefaultSettings();
            const updatedSettings = { ...settings, history_limit: defaultSettings.history_limit };

            setSettings(updatedSettings);
            await api.saveSettings(updatedSettings);

            showStatus('Przywrócono i zapisano domyślny limit!');
        } catch (err) {
            showStatus(`Błąd przywracania: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetMemoryToggle = async () => {
        if (!window.confirm("Czy na pewno chcesz przywrócić domyślne ustawienie pamięci (włączona/wyłączona)?")) return;

        setIsSaving(true);
        showStatus('Przywracanie domyślnego ustawienia...');
        try {
            const defaultSettings = await api.getDefaultSettings();
            const updatedSettings = { ...settings, memory_enabled: defaultSettings.memory_enabled };

            setSettings(updatedSettings);
            await api.saveSettings(updatedSettings);

            showStatus('Przywrócono i zapisano ustawienie pamięci!');
        } catch (err) {
            showStatus(`Błąd przywracania: ${err instanceof Error ? err.message : String(err)}`);
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
                    onResetRephrase={handleResetRephrasePrompt}
                    onResetHistoryLimit={handleResetHistoryLimit}
                    onResetMemoryToggle={handleResetMemoryToggle}
                />

                <SystemPrompt
                    template={settings.template}
                    onChange={(val) => setSettings({ ...settings, template: val })}
                    onReset={handleResetPrompt}
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