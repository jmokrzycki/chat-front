import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatArea } from './components/Chat/ChatArea';
import { api, type Settings } from './services/api';
import type { Message } from './types';
import './App.css';

function App() {
  const [settings, setSettings] = useState<Settings>({
    template: 'Ładowanie...',
    rephrase_template: 'Ładowanie...',
    history_limit: 4,
    memory_enabled: true
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    api.getSettings()
        .then((data) => setSettings(data))
        .catch((err) => {
          console.error('Nie udało się pobrać ustawień:', err);
        });
  }, []);

  const handleSendMessage = async (prompt: string) => {
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
              console.error('Niepoprawny format danych z serwera:', trimmedLine, err);
            }
          }
        }

        if (newTextChunk) {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = {
              ...updated[lastIndex],
              text: updated[lastIndex].text + newTextChunk
            };
            return updated;
          });
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Zatrzymano generowanie.');
      } else {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            text: 'Wystąpił błąd podczas komunikacji z serwerem.'
          };
          return updated;
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
      <div className="app-container">
        <Sidebar
            settings={settings}
            setSettings={setSettings}
            isChatLoading={isLoading}
        />
        <ChatArea
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onStopMessage={handleStopGenerating}
        />
      </div>
  );
}

export default App;