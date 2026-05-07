import axios from 'axios';
import type { Message } from "../types";

const API_BASE = 'http://localhost:8000/api';

export interface Settings {
    template: string;
    rephrase_template: string;
    history_limit: number;
    memory_enabled: boolean;
}

const apiClient = axios.create({
    baseURL: API_BASE,
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.detail || error.message || 'Wystąpił nieznany błąd serwera';

        return Promise.reject(new Error(message));
    }
);

export const api = {
    getFiles: async () => {
        const res = await apiClient.get('/files');
        return res.data;
    },

    getTrainedFiles: async () => {
        const res = await apiClient.get('/trained');
        return res.data;
    },

    getCachedFiles: async () => {
        const res = await apiClient.get('/cache');
        return res.data;
    },

    deleteTrainedFile: async (filename: string) => {
        const res = await apiClient.delete(`/trained/${encodeURIComponent(filename)}`);
        return res.data;
    },

    uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await apiClient.post('/files', formData);
        return res.data;
    },

    deleteFile: async (filename: string) => {
        const res = await apiClient.delete(`/files/${encodeURIComponent(filename)}`);
        return res.data;
    },

    trainRag: async (filenames: string[]) => {
        const res = await apiClient.post('/train', { filenames });
        return res.data;
    },

    resetDatabase: async () => {
        const res = await apiClient.post('/reset');
        return res.data;
    },

    getSettings: async (): Promise<Settings> => {
        const res = await apiClient.get<Settings>('/settings');
        return res.data;
    },

    getDefaultSettings: async (): Promise<Settings> => {
        const res = await apiClient.get<Settings>('/settings/defaults');
        return res.data;
    },

    saveSettings: async (settings: Settings) => {
        const res = await apiClient.post('/settings', settings);
        return res.data;
    },

    chatStream: async (prompt: string, template: string, rephrase_template: string, history: Message[], signal?: AbortSignal) => {
        const res = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, template, rephrase_template, history }),
            signal,
        });

        if (!res.ok || !res.body) {
            let errorMsg = 'Problem z siecią lub serwer nie zwrócił strumienia danych';
            try {
                const errData = await res.json();
                if (errData.detail) errorMsg = errData.detail;
                // eslint-disable-next-line no-empty
            } catch {}
            throw new Error(errorMsg);
        }

        return res;
    }
};
