const API_BASE = 'http://localhost:8000/api';

export const api = {
    uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Błąd wgrywania pliku');
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

    chatStream: async (prompt: string, template: string) => {
        const res = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, template }),
        });
        if (!res.ok || !res.body) throw new Error('Problem z siecią lub brak strumienia');
        return res;
    }
};
