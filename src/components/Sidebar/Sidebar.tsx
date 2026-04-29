import { useState } from 'react';
import { api } from '../../services/api';
import { DocumentManager } from './DocumentManager';
import './Sidebar.css';

interface SidebarProps {
    template: string;
    setTemplate: (val: string) => void;
    isChatLoading: boolean;
}

export function Sidebar({ template, setTemplate, isChatLoading }: SidebarProps) {
    const [isResetting, setIsResetting] = useState(false);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
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

    const handleSaveTemplate = async () => {
        setIsSavingTemplate(true);
        showStatus('Zapisywanie...');
        try {
            await api.saveTemplate(template);
            showStatus('Szablon został zapisany!');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            showStatus(`Błąd: ${errorMessage}`);
        } finally {
            setIsSavingTemplate(false);
        }
    };

    const isBusy = isResetting || isChatLoading || isSavingTemplate || isDocManagerBusy;

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

            <div className="sidebar-section prompt-section">
                <label>Systemowy Prompt</label>
                <p className="hint">Użyj <code>{'{context}'}</code> i <code>{'{question}'}</code></p>
                <textarea
                    className="template-textarea"
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    disabled={isSavingTemplate}
                    placeholder="Wpisz systemowy prompt..."
                />
                <button
                    className="save-btn"
                    onClick={handleSaveTemplate}
                    disabled={isSavingTemplate || template.trim() === ''}
                    style={{ marginTop: '10px' }}
                >
                    {isSavingTemplate ? 'Zapisywanie...' : 'Zapisz prompt'}
                </button>
            </div>
        </aside>
    );
}