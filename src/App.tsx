import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface Message {
  text: string;
  sender: 'user' | 'assistant';
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadStatus('');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus('Przetwarzanie pliku...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Błąd podczas wgrywania pliku');
      }

      setUploadStatus('Plik dodany do bazy wiedzy!');
      setSelectedFile(null);

      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error: any) {
      console.error('Błąd wgrywania:', error);
      setUploadStatus(`Błąd: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage: Message = { text: prompt, sender: 'user' };
    const emptyAssistantMessage: Message = { text: '', sender: 'assistant' };

    setMessages((prev) => [...prev, userMessage, emptyAssistantMessage]);
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
      setMessages((prev) => {
        const updatedMessages = [...prev];
        const lastIndex = updatedMessages.length - 1;

        updatedMessages[lastIndex] = {
          text: 'Wystąpił błąd podczas komunikacji z serwerem.',
          sender: 'assistant'
        };
        return updatedMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="chat-container">
        {/* SEKCJA UPLOADU DOKUMENTÓW DO RAG */}
        <div className="upload-section">
          <input
              type="file"
              accept=".txt,.pdf"
              onChange={handleFileChange}
              disabled={isUploading}
          />
          <button
              onClick={handleFileUpload}
              disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Ładowanie...' : 'Dodaj dokument'}
          </button>
          {uploadStatus && <span className="upload-status" title={uploadStatus}>{uploadStatus}</span>}
        </div>

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
              placeholder="Wpisz swoje pytanie (asystent użyje wgranej wiedzy)..."
              disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !prompt.trim()}>
            Wyślij
          </button>
        </form>
      </div>
  );
}

export default App;