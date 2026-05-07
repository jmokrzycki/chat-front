import { useState } from 'react';

export function useRagState() {
    const [stageFiles, setStageFiles] = useState<string[]>([]);
    const [trainedFiles, setTrainedFiles] = useState<string[]>([]);
    const [cachedFiles, setCachedFiles] = useState<string[]>([]);
    const [queuedFiles, setQueuedFiles] = useState<string[]>([]);

    const [selectedLeft, setSelectedLeft] = useState<string[]>([]);
    const [selectedRight, setSelectedRight] = useState<string[]>([]);
    const [selectedTrained, setSelectedTrained] = useState<string[]>([]);

    const availableStageFiles = stageFiles.filter(
        (f) => !queuedFiles.includes(f) && !trainedFiles.includes(f)
    );

    const clearSelections = () => {
        setSelectedLeft([]);
        setSelectedRight([]);
        setSelectedTrained([]);
    };

    return {
        stageFiles, setStageFiles,
        trainedFiles, setTrainedFiles,
        cachedFiles, setCachedFiles,
        queuedFiles, setQueuedFiles,
        selectedLeft, setSelectedLeft,
        selectedRight, setSelectedRight,
        selectedTrained, setSelectedTrained,
        availableStageFiles,
        clearSelections
    };
}

export type UseRagStateReturn = ReturnType<typeof useRagState>;