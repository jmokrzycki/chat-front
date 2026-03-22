import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

function App() {
  const [prompt, setPrompt] = useState('');

  const [messages, setMessages] = useState<Message[]>([]);
  const[isLoading, setIsLoading] = useState(false);

  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage: Message = { text: prompt, sender: 'user' };
    const emptyBotMessage: Message = { text: '', sender: 'bot' };

    setMessages((prev) =>[...prev, userMessage, emptyBotMessage]);
    setPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!response.ok) {
        throw new Error('Wystąpił problem z siecią');
      }

      if (!response.body) {
        throw new Error('Brak strumienia danych');
      }

      const reader = response.body.getReader();
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
          if (line.trim() !== '') {
            try {
              const parsed = JSON.parse(line);

              if (parsed.response) {
                newTextChunk += parsed.response;
              }
            } catch (err) {
              console.error("Błąd parsowania:", err);
            }
          }
        }

        if (newTextChunk) {
          setMessages((prev) => {
            const updatedMessages = [...prev];
            const lastIndex = updatedMessages.length - 1;
            updatedMessages[lastIndex] = {
              ...updatedMessages[lastIndex],
              text: updatedMessages[lastIndex].text + newTextChunk,
            };
            return updatedMessages;
          });
        }
      }
    } catch (error) {
      console.error('Błąd:', error);
      setMessages((prev) =>[
        ...prev,
        { text: 'Wystąpił błąd podczas komunikacji z serwerem.', sender: 'bot' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="chat-container">
        <div className="chat-box" ref={chatBoxRef}>
          {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                <p>{message.text || (isLoading && index === messages.length - 1 ? '...' : '')}</p>
              </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="chat-form">
          <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Wpisz swoje pytanie..."
              disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            Wyślij
          </button>
        </form>
      </div>
  );
}

export default App;