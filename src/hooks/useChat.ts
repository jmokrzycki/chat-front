import { useState, useRef } from 'react';
import { api, type Settings } from '../services/api';
import type { Message } from '../types';

export function useChat(settings: Settings) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendMessage = async (prompt: string) => {
        const historyToSend = (settings.memory_enabled && settings.history_limit > 0)
            ? messages.slice(-settings.history_limit)
            : [];

        setMessages((prev) => [...prev, { text: prompt, sender: 'user' }, { text: '', sender: 'assistant' }]);
        setIsLoading(true);

        abortControllerRef.current = new AbortController();

        try {
            const res = await api.chatStream(
                prompt,
                settings.template,
                settings.rephrase_template,
                historyToSend,
                abortControllerRef.current.signal
            );

            const reader = res.body!.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                let newTextChunk = '';
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine !== '') {
                        try {
                            const parsed = JSON.parse(trimmedLine);
                            if (parsed.response) newTextChunk += parsed.response;
                        } catch (err) {
                            console.error('Niepoprawny format danych:', trimmedLine, err);
                        }
                    }
                }

                if (newTextChunk) {
                    setMessages((prev) => {
                        const updated = [...prev];
                        const lastIndex = updated.length - 1;
                        let currentText = updated[lastIndex].text;

                        if (currentText.trim() === '') {
                            currentText = '';
                            newTextChunk = newTextChunk.trimStart();
                        }

                        updated[lastIndex] = {
                            ...updated[lastIndex],
                            text: currentText + newTextChunk
                        };
                        return updated;
                    });
                }
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                console.log('Zatrzymano generowanie.');
            } else {
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1].text = 'Wystąpił błąd podczas komunikacji z serwerem.';
                    return updated;
                });
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const stopGenerating = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const clearChat = () => {
        if (messages.length === 0) return;
        if (window.confirm('Czy na pewno chcesz rozpocząć nową rozmowę? Aktualna historia czatu zostanie usunięta.')) {
            setMessages([]);
        }
    };

    return {
        messages,
        isLoading,
        sendMessage,
        stopGenerating,
        clearChat
    };
}
