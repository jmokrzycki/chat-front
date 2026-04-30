import { useRagManager } from './useRagManager';
import './RagManager.css';

interface RagManagerProps {
    onStatusChange: (msg: string) => void;
    isBusy: boolean;
    setBusy: (state: boolean) => void;
}

export function RagManager(props: RagManagerProps) {
    const {
        trainedFiles,
        queuedFiles,
        setQueuedFiles,
        selectedLeft,
        setSelectedLeft,
        selectedRight,
        setSelectedRight,
        selectedTrained,
        setSelectedTrained,
        fileInputRef,
        availableStageFiles,
        handleFileUpload,
        handleDrop,
        handleDeleteFromStage,
        handleTrainRag,
        handleDeleteTrained,
        handleResetDatabase
    } = useRagManager(props);

    const { isBusy } = props;

    return (
        <div className="rag-manager">
            <div className="rm-panels-container">
                <div className="rm-panel">
                    <div className="rm-header">📂 Stage</div>
                    <div className="rm-content">
                        {availableStageFiles.length === 0 ? <div className="rm-empty">Brak plików</div> :
                            availableStageFiles.map(file => (
                                <label key={`left-${file}`} className="rm-file-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedLeft.includes(file)}
                                        onChange={() => setSelectedLeft(p => p.includes(file) ? p.filter(f => f !== file) : [...p, file])}
                                        disabled={isBusy}
                                    />
                                    <span>📄</span> {file}
                                </label>
                            ))}
                    </div>
                </div>

                <div className="rm-arrows">
                    <button onClick={() => { setQueuedFiles(p => [...p, ...selectedLeft]); setSelectedLeft([]); }} disabled={selectedLeft.length === 0 || isBusy}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <button onClick={() => { setQueuedFiles(p => p.filter(f => !selectedRight.includes(f))); setSelectedRight([]); }} disabled={selectedRight.length === 0 || isBusy}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    </button>
                </div>

                <div className="rm-panel">
                    <div className="rm-header">Baza wektorowa</div>
                    <div className="rm-content">
                        {trainedFiles.length === 0 && queuedFiles.length === 0 && <div className="rm-empty">Brak dokumentów</div>}
                        {trainedFiles.map(file => (
                            <label key={`trained-${file}`} className="rm-file-item trained-item">
                                <input
                                    type="checkbox"
                                    checked={selectedTrained.includes(file)}
                                    onChange={() => setSelectedTrained(p => p.includes(file) ? p.filter(f => f !== file) : [...p, file])}
                                    disabled={isBusy}
                                />
                                <span>✅</span> {file} <span className="status-badge badge-trained">W bazie</span>
                            </label>
                        ))}
                        {queuedFiles.map(file => (
                            <label key={`queued-${file}`} className="rm-file-item">
                                <input
                                    type="checkbox"
                                    checked={selectedRight.includes(file)}
                                    onChange={() => setSelectedRight(p => p.includes(file) ? p.filter(f => f !== file) : [...p, file])}
                                    disabled={isBusy}
                                />
                                <span>📄</span> {file} <span className="status-badge badge-pending">Oczekuje</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="rm-actions-row">
                <div className="rm-left-actions">
                    <div
                        className={`rm-dropzone ${isBusy ? 'disabled' : ''}`}
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => !isBusy && fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            multiple
                            accept=".txt,.pdf"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        />
                        <svg className="rm-dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 13v8" />
                            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                            <path d="m8 17 4-4 4 4" />
                        </svg>
                        <p className="rm-dropzone-title">Kliknij, aby przesłać lub przeciągnij i upuść</p>
                        <p className="rm-dropzone-subtitle">obsługuje pliki PDF oraz TXT</p>
                    </div>
                    {selectedLeft.length > 0 && <button className="rm-delete-btn" onClick={handleDeleteFromStage} disabled={isBusy}>Usuń zaznaczone ze Stage</button>}
                </div>

                <div className="rm-right-actions">
                    <button className="rm-train-btn" onClick={handleTrainRag} disabled={queuedFiles.length === 0 || isBusy}>
                        Trenuj RAG ({queuedFiles.length})
                    </button>
                    {selectedTrained.length > 0 && <button className="rm-delete-trained-btn" onClick={handleDeleteTrained} disabled={isBusy}>Zapomnij zaznaczone ({selectedTrained.length})</button>}
                </div>
            </div>

            <button className="reset-btn" onClick={handleResetDatabase} disabled={isBusy}>
                Wyczyść całą bazę wiedzy (RAG)
            </button>
        </div>
    );
}