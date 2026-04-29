const API_BASE = 'http://localhost:8000/api';

export const api = {
    getFiles: async () => {
        const res = await fetch(`${API_BASE}/files`);
        if (!res.ok) throw new Error('Błąd pobierania listy plików');
        return res.json();
    },

    getTrainedFiles: async () => {
        const res = await fetch(`${API_BASE}/trained`);
        if (!res.ok) throw new Error('Błąd pobierania wytrenowanych plików');
        return res.json();
    },

    deleteTrainedFile: async (filename: string) => {
        const res = await fetch(`${API_BASE}/trained/${encodeURIComponent(filename)}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Błąd usuwania pliku z bazy wiedzy');
        return res.json();
    },

    uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/files`, { method: 'POST', body: formData });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Błąd wgrywania pliku');
        }
        return res.json();
    },

    deleteFile: async (filename: string) => {
        const res = await fetch(`${API_BASE}/files/${filename}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Błąd usuwania pliku');
        return res.json();
    },

    trainRag: async (filenames: string[]) => {
        const res = await fetch(`${API_BASE}/train`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filenames }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Błąd trenowania modelu');
        }
        return res.json();
    },

    resetDatabase: async () => {
        const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Błąd czyszczenia bazy');
        }
        return res.json();
    },

    getTemplate: async () => {
        const res = await fetch(`${API_BASE}/template`);
        if (!res.ok) throw new Error('Błąd pobierania szablonu');
        return res.json();
    },

    saveTemplate: async (template: string) => {
        const res = await fetch(`${API_BASE}/template`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ template }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Błąd zapisu szablonu');
        }
        return res.json();
    },

    chatStream: async (prompt: string, template: string, signal?: AbortSignal) => {
        const res = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, template }),
            signal,
        });
        if (!res.ok || !res.body) {
            throw new Error('Problem z siecią lub serwer nie zwrócił strumienia danych');
        }
        return res;
    }
};