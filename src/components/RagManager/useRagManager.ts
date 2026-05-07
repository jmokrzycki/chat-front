import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';

interface UseRagManagerProps {
    onStatusChange: (msg: string) => void;
    isBusy: boolean;
    setBusy: (state: boolean) => void;
}

export function useRagManager({ onStatusChange, setBusy }: UseRagManagerProps) {
    const [stageFiles, setStageFiles] = useState<string[]>([]);
    const [trainedFiles, setTrainedFiles] = useState<string[]>([]);
    const [cachedFiles, setCachedFiles] = useState<string[]>([]);
    const [queuedFiles, setQueuedFiles] = useState<string[]>([]);

    const [selectedLeft, setSelectedLeft] = useState<string[]>([]);
    const [selectedRight, setSelectedRight] = useState<string[]>([]);
    const [selectedTrained, setSelectedTrained] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        try {
            const stageRes = await api.getFiles();
            setStageFiles(Array.isArray(stageRes.files) ? stageRes.files : []);

            const trainedRes = await api.getTrainedFiles();
            setTrainedFiles(Array.isArray(trainedRes.files) ? trainedRes.files : []);

            const cacheRes = await api.getCachedFiles();
            setCachedFiles(Array.isArray(cacheRes.files) ? cacheRes.files : []);
        } catch (err) {
            console.error("Błąd pobierania danych:", err);
        }
    };

    useEffect(() => {
        fetchData();
        setSelectedLeft([]);
        setSelectedRight([]);
        setSelectedTrained([]);
    }, []);

    const availableStageFiles = stageFiles.filter(f => !queuedFiles.includes(f) && !trainedFiles.includes(f));

    const handleFileUpload = async (files: FileList) => {
        setBusy(true);
        onStatusChange('Przesyłanie plików...');
        try {
            const uploadedNames: string[] = [];
            for (let i = 0; i < files.length; i++) {
                await api.uploadFile(files[i]);
                uploadedNames.push(files[i].name);
            }

            setQueuedFiles(prev => prev.filter(f => !uploadedNames.includes(f)));

            onStatusChange('Pliki przesłane na Stage.');
            await fetchData();
        } catch (err) {
            onStatusChange(`Błąd: ${err instanceof Error ? err.message : String(err)}`);
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
        if (!selectedLeft.length || !window.confirm('Usunąć zaznaczone pliki ze stage i pamięci podręcznej?')) return;
        setBusy(true);
        try {
            for (const file of selectedLeft) {
                await api.deleteFile(file);
            }
            setSelectedLeft([]);
            onStatusChange('Usunięto pliki ze Stage i wyczyszczono ich cache.');
            await fetchData();
        } catch (err) {
            onStatusChange(`Błąd usuwania: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setBusy(false);
        }
    };

    const handleTrainRag = async () => {
        if (!queuedFiles.length) return;
        setBusy(true);
        onStatusChange('Przygotowywanie modelu RAG...');
        try {
            await api.trainRag(queuedFiles);
            onStatusChange('Model RAG zaktualizowany!');
            setQueuedFiles([]);
            setSelectedRight([]);
            await fetchData();
        } catch (err) {
            onStatusChange(`Błąd trenowania: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setBusy(false);
        }
    };

    const handleDeleteTrained = async () => {
        if (!selectedTrained.length || !window.confirm('Wyłączyć wybrane pliki z bazy? Zostaną zapamiętane w cache do szybkiego przywrócenia.')) return;
        setBusy(true);
        try {
            for (const file of selectedTrained) {
                await api.deleteTrainedFile(file);
            }
            setSelectedTrained([]);
            onStatusChange('Model odłożył wybrane dokumenty do pamięci (Cache).');
            await fetchData();
        } catch (err) {
            onStatusChange(`Błąd usuwania z RAG: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setBusy(false);
        }
    };

    const handleResetDatabase = async () => {
        if (!window.confirm('Czy na pewno usunąć całą wiedzę i cache z wytrenowanej bazy wektorowej? (Pliki na Stage pozostaną nietknięte)')) return;
        setBusy(true);
        onStatusChange('Czyszczenie bazy...');
        try {
            await api.resetDatabase();
            onStatusChange('Baza wektorowa i cache wyczyszczone!');
            setSelectedTrained([]);
            setQueuedFiles([]);
            await fetchData();
        } catch (err) {
            onStatusChange(`Błąd: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setBusy(false);
        }
    };

    return {
        trainedFiles,
        cachedFiles,
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
    };
}
