import { api } from '../../../services/api';
import type { UseRagStateReturn } from './useRagState';

export function useRagActions(
    state: UseRagStateReturn,
    onStatusChange: (msg: string) => void,
    setBusy: (isBusy: boolean) => void,
    fileInputRef: React.RefObject<HTMLInputElement | null>
) {
    const fetchData = async () => {
        try {
            const stageRes = await api.getFiles();
            state.setStageFiles(Array.isArray(stageRes.files) ? stageRes.files : []);

            const trainedRes = await api.getTrainedFiles();
            state.setTrainedFiles(Array.isArray(trainedRes.files) ? trainedRes.files : []);

            const cacheRes = await api.getCachedFiles();
            state.setCachedFiles(Array.isArray(cacheRes.files) ? cacheRes.files : []);
        } catch (err) {
            console.error("Błąd pobierania danych:", err);
        }
    };

    const handleFileUpload = async (files: FileList) => {
        setBusy(true);
        onStatusChange('Przesyłanie plików...');
        try {
            const uploadedNames: string[] = [];
            for (let i = 0; i < files.length; i++) {
                await api.uploadFile(files[i]);
                uploadedNames.push(files[i].name);
            }

            state.setQueuedFiles(prev => prev.filter(f => !uploadedNames.includes(f)));

            onStatusChange('Pliki przesłane na Stage.');
            await fetchData();
        } catch (err) {
            onStatusChange(`Błąd: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setBusy(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteFromStage = async () => {
        if (!state.selectedLeft.length || !window.confirm('Usunąć zaznaczone pliki ze stage i pamięci podręcznej?')) return;
        setBusy(true);
        try {
            for (const file of state.selectedLeft) {
                await api.deleteFile(file);
            }
            state.setSelectedLeft([]);
            onStatusChange('Usunięto pliki ze Stage i wyczyszczono ich cache.');
            await fetchData();
        } catch (err) {
            onStatusChange(`Błąd usuwania: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setBusy(false);
        }
    };

    const handleTrainRag = async () => {
        if (!state.queuedFiles.length) return;
        setBusy(true);
        onStatusChange('Przygotowywanie modelu RAG...');
        try {
            await api.trainRag(state.queuedFiles);
            onStatusChange('Model RAG zaktualizowany!');
            state.setQueuedFiles([]);
            state.setSelectedRight([]);
            await fetchData();
        } catch (err) {
            onStatusChange(`Błąd trenowania: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setBusy(false);
        }
    };

    const handleDeleteTrained = async () => {
        if (!state.selectedTrained.length || !window.confirm('Wyłączyć wybrane pliki z bazy? Zostaną zapamiętane w cache do szybkiego przywrócenia.')) return;
        setBusy(true);
        try {
            for (const file of state.selectedTrained) {
                await api.deleteTrainedFile(file);
            }
            state.setSelectedTrained([]);
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
            state.setSelectedTrained([]);
            state.setQueuedFiles([]);
            await fetchData();
        } catch (err) {
            onStatusChange(`Błąd: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setBusy(false);
        }
    };

    return {
        fetchData,
        handleFileUpload,
        handleDeleteFromStage,
        handleTrainRag,
        handleDeleteTrained,
        handleResetDatabase
    };
}