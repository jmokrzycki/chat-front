import { useEffect, useRef } from 'react';
import { useRagState } from './useRagState';
import { useRagActions } from './useRagActions';

interface UseRagManagerProps {
    onStatusChange: (msg: string) => void;
    isBusy: boolean;
    setBusy: (state: boolean) => void;
}

export function useRagManager({ onStatusChange, setBusy }: UseRagManagerProps) {
    const state = useRagState();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const actions = useRagActions(state, onStatusChange, setBusy, fileInputRef);

    useEffect(() => {
        actions.fetchData();
        state.clearSelections();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            actions.handleFileUpload(e.dataTransfer.files);
        }
    };

    return {
        ...state,
        ...actions,
        handleDrop,
        fileInputRef
    };
}