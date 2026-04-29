import React, { useRef, useEffect } from 'react';
import type { Message } from '../../types';
import './ChatArea.css';

interface ChatAreaProps {
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (prompt: string) => void;
    onStopMessage: () => void;
}

export function ChatArea({ messages, isLoading, onSendMessage, onStopMessage }: ChatAreaProps) {
    const [prompt, setPrompt] = React.useState('');
    const chatBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;
        onSendMessage(prompt);
        setPrompt('');
    };

    return (
        <main className="chat-area">
            <div className="chat-box" ref={chatBoxRef}>
                {messages.length === 0 && (
                    <div className="empty-chat">
                        <h2>Witaj!</h2>
                        <p>Dodaj dokumenty po lewej stronie, ustaw prompt i rozpocznij rozmowę z modelem.</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.sender}`}>
                        <p>
                            {msg.text}
                            {isLoading && idx === messages.length - 1 && <span className="blinking-cursor">▋</span>}
                        </p>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="chat-form">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isLoading}
                    placeholder="Zadaj pytanie na podstawie dokumentów..."
                />

                {isLoading ? (
                    <button type="button" onClick={onStopMessage} className="stop-btn">
                        ■ Stop
                    </button>
                ) : (
                    <button type="submit" disabled={!prompt.trim()}>
                        Wyślij
                    </button>
                )}
            </form>
        </main>
    );
}
