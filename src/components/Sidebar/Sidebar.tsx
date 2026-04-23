import { useState } from 'react';
import { api } from '../../services/api';
import './Sidebar.css';

interface SidebarProps {
    template: string;
    setTemplate: (val: string) => void;
    isChatLoading: boolean;
}

export function Sidebar({ template, setTemplate, isChatLoading }: SidebarProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    const showStatus = (msg: string) => {
        setStatusMsg(msg);
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        setStatusMsg('Przetwarzanie pliku...');
        try {
            await api.uploadFile(selectedFile);
            showStatus('Plik dodany do bazy wiedzy!');
            setSelectedFile(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            showStatus(`Błąd: ${errorMessage}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Czy na pewno usunąć całą wiedzę?')) return;
        setIsResetting(true);
        setStatusMsg('Czyszczenie bazy...');
        try {
            await api.resetDatabase();
            showStatus('Baza wyczyszczona!');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            showStatus(`Błąd: ${errorMessage}`);
        } finally {
            setIsResetting(false);
        }
    };

    const isBusy = isUploading || isResetting || isChatLoading;

    return (
        <aside className="sidebar">
            <h2>Ustawienia RAG</h2>

            <div className="sidebar-section">
                <label>Dodaj dokumenty (.pdf, .txt)</label>
                <input
                    type="file"
                    accept=".txt,.pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    disabled={isBusy}
                />
                <button className="upload-btn" onClick={handleUpload} disabled={!selectedFile || isBusy}>
                    {isUploading ? 'Ładowanie...' : 'Dodaj dokument'}
                </button>
                <button className="reset-btn" onClick={handleReset} disabled={isBusy}>
                    {isResetting ? 'Usuwanie...' : 'Wyczyść bazę wiedzy'}
                </button>
                {statusMsg && <div className="status-message">{statusMsg}</div>}
            </div>

            <div className="sidebar-section prompt-section">
                <label>Systemowy Prompt</label>
                <p className="hint">Użyj <code>{'{context}'}</code> i <code>{'{question}'}</code></p>
                <textarea
                    className="template-textarea"
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    placeholder="Wpisz systemowy prompt..."
                />
            </div>
        </aside>
    );
}
