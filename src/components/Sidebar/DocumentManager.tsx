import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import './DocumentManager.css';

interface DocumentManagerProps {
    onStatusChange: (msg: string) => void;
    isBusy: boolean;
    setBusy: (state: boolean) => void;
    refreshTrigger?: number;
}

export function DocumentManager({ onStatusChange, isBusy, setBusy, refreshTrigger }: DocumentManagerProps) {
    const [stageFiles, setStageFiles] = useState<string[]>([]);
    const [trainedFiles, setTrainedFiles] = useState<string[]>([]);
    const [queuedFiles, setQueuedFiles] = useState<string[]>([]);

    const [selectedLeft, setSelectedLeft] = useState<string[]>([]);
    const [selectedRight, setSelectedRight] = useState<string[]>([]);
    const [selectedTrained, setSelectedTrained] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        try {
            try {
                const stageRes = await api.getFiles();
                setStageFiles(Array.isArray(stageRes.files) ? stageRes.files : []);
            } catch (err) {
                console.error("Błąd pobierania plików Stage:", err);
                setStageFiles([]);
            }

            try {
                const trainedRes = await api.getTrainedFiles();
                setTrainedFiles(Array.isArray(trainedRes.files) ? trainedRes.files : []);
            } catch (err) {
                console.error("Błąd pobierania wytrenowanych plików:", err);
                setTrainedFiles([]);
            }
        } catch (err) {
            console.error("Krytyczny błąd pobierania danych:", err);
        }
    };

    useEffect(() => {
        fetchData();
        setSelectedLeft([]);
        setSelectedRight([]);
        setSelectedTrained([]);
    }, [refreshTrigger]);

    const availableStageFiles = stageFiles.filter(f => !queuedFiles.includes(f));

    const handleFileUpload = async (files: FileList) => {
        setBusy(true);
        onStatusChange('Przesyłanie plików...');
        try {
            for (let i = 0; i < files.length; i++) {
                await api.uploadFile(files[i]);
            }
            onStatusChange('Pliki przesłane na Stage.');
            await fetchData();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            onStatusChange(`Błąd: ${errorMessage}`);
        } finally {
            setBusy(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    };

    const handleDeleteFromStage = async () => {
        if (!selectedLeft.length) return;
        if (!window.confirm('Czy na pewno usunąć zaznaczone pliki ze stage?')) return;

        setBusy(true);
        try {
            for (const file of selectedLeft) {
                await api.deleteFile(file);
            }
            setSelectedLeft([]);
            onStatusChange('Usunięto pliki ze Stage.');
            await fetchData();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            onStatusChange(`Błąd usuwania: ${errorMessage}`);
        } finally {
            setBusy(false);
        }
    };

    const handleTrainRag = async () => {
        if (!queuedFiles.length) return;
        setBusy(true);
        onStatusChange('Trenowanie modelu RAG...');
        try {
            await api.trainRag(queuedFiles);
            onStatusChange('Model RAG zaktualizowany!');
            setQueuedFiles([]);
            setSelectedRight([]);
            await fetchData();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            onStatusChange(`Błąd trenowania: ${errorMessage}`);
        } finally {
            setBusy(false);
        }
    };

    const handleDeleteTrained = async () => {
        if (!selectedTrained.length) return;
        if (!window.confirm('Czy na pewno zapomnieć wybrane pliki z bazy wektorowej? Model przestanie z nich korzystać.')) return;

        setBusy(true);
        try {
            for (const file of selectedTrained) {
                await api.deleteTrainedFile(file);
            }
            setSelectedTrained([]);
            onStatusChange('Model zapomniał wybrane dokumenty.');
            await fetchData();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            onStatusChange(`Błąd usuwania z RAG: ${errorMessage}`);
        } finally {
            setBusy(false);
        }
    };

    const moveRight = () => {
        setQueuedFiles(prev => [...prev, ...selectedLeft]);
        setSelectedLeft([]);
    };

    const moveLeft = () => {
        setQueuedFiles(prev => prev.filter(f => !selectedRight.includes(f)));
        setSelectedRight([]);
    };

    const toggleSelectionLeft = (file: string) => {
        setSelectedLeft(prev => prev.includes(file) ? prev.filter(f => f !== file) : [...prev, file]);
    };

    const toggleSelectionRight = (file: string) => {
        setSelectedRight(prev => prev.includes(file) ? prev.filter(f => f !== file) : [...prev, file]);
    };

    const toggleSelectionTrained = (file: string) => {
        setSelectedTrained(prev => prev.includes(file) ? prev.filter(f => f !== file) : [...prev, file]);
    };

    return (
        <div className="doc-manager">
            <div className="dm-panels-container">
                {/* LEWY PANEL (STAGE) */}
                <div className="dm-panel dm-left">
                    <div className="dm-header">
                        <span className="folder-icon">📂 Stage</span>
                    </div>
                    <div className="dm-content">
                        {availableStageFiles.length === 0 ? (
                            <div className="dm-empty">Brak plików na Stage</div>
                        ) : (
                            availableStageFiles.map(file => (
                                <label key={`left-${file}`} className="dm-file-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedLeft.includes(file)}
                                        onChange={() => toggleSelectionLeft(file)}
                                        disabled={isBusy}
                                    />
                                    <span className="file-icon">📄</span> {file}
                                </label>
                            ))
                        )}
                    </div>
                </div>

                {/* ŚRODKOWE STRZAŁKI */}
                <div className="dm-arrows">
                    <button onClick={moveRight} disabled={selectedLeft.length === 0 || isBusy} title="Przenieś do obszaru roboczego">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <button onClick={moveLeft} disabled={selectedRight.length === 0 || isBusy} title="Cofnij do stage">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    </button>
                </div>

                {/* PRAWY PANEL (WORKSPACE) */}
                <div className="dm-panel dm-right">
                    <div className="dm-header">
                        <span>Zarządzanie bazą wektorową</span>
                    </div>
                    <div className="dm-content">
                        {trainedFiles.length === 0 && queuedFiles.length === 0 && (
                            <div className="dm-empty">Brak dokumentów</div>
                        )}

                        {/* WYTRENOWANE PLIKI (Teraz można je zaznaczać!) */}
                        {trainedFiles.map(file => (
                            <label key={`trained-${file}`} className="dm-file-item trained-item">
                                <input
                                    type="checkbox"
                                    checked={selectedTrained.includes(file)}
                                    onChange={() => toggleSelectionTrained(file)}
                                    disabled={isBusy}
                                />
                                <span className="file-icon">✅</span> {file}
                                <span className="status-badge badge-trained">W bazie</span>
                            </label>
                        ))}

                        {/* OCZEKUJĄCE PLIKI */}
                        {queuedFiles.map(file => (
                            <label key={`queued-${file}`} className="dm-file-item">
                                <input
                                    type="checkbox"
                                    checked={selectedRight.includes(file)}
                                    onChange={() => toggleSelectionRight(file)}
                                    disabled={isBusy}
                                />
                                <span className="file-icon">📄</span> {file}
                                <span className="status-badge badge-pending">Oczekuje</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* DOLNA SEKCJA (DRAG&DROP + AKCJE) */}
            <div className="dm-actions-row">
                <div className="dm-left-actions">
                    <div
                        className={`dm-dropzone ${isBusy ? 'disabled' : ''}`}
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
                        <svg className="cloud-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 12v9M12 12l-3 3m3-3l3 3M7 14A5 5 0 1115.9 6h.1a5 5 0 11-1 9.9" />
                        </svg>
                        <p>Kliknij, aby przesłać lub przeciągnij i upuść</p>
                        <small>obsługuje pliki tekstowe i pdf</small>
                    </div>
                    {selectedLeft.length > 0 && (
                        <button className="dm-delete-btn" onClick={handleDeleteFromStage} disabled={isBusy}>
                            Usuń zaznaczone ze Stage
                        </button>
                    )}
                </div>

                <div className="dm-right-actions">
                    <button
                        className="dm-train-btn"
                        onClick={handleTrainRag}
                        disabled={queuedFiles.length === 0 || isBusy}
                    >
                        Trenuj RAG ({queuedFiles.length} nowych)
                    </button>

                    {/* NOWY PRZYCISK: Usuwanie z bazy RAG */}
                    {selectedTrained.length > 0 && (
                        <button className="dm-delete-trained-btn" onClick={handleDeleteTrained} disabled={isBusy}>
                            Zapomnij z bazy RAG ({selectedTrained.length})
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}