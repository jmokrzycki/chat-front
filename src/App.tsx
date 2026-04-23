import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatArea } from './components/Chat/ChatArea';
import { api } from './services/api';
import type { Message } from './types';
import './App.css';

function App() {
  const [template, setTemplate] = useState('Ładowanie szablonu...');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.getTemplate()
        .then((data) => setTemplate(data.template))
        .catch((err) => {
          console.error('Nie udało się pobrać szablonu:', err);
          setTemplate('Wystąpił błąd pobierania szablonu.');
        });
  }, []);

  const handleSendMessage = async (prompt: string) => {
    setMessages((prev) => [...prev, { text: prompt, sender: 'user' }, { text: '', sender: 'assistant' }]);
    setIsLoading(true);

    try {
      const res = await api.chatStream(prompt, template);
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
            updated[updated.length - 1].text += newTextChunk;
            return updated;
          });
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].text = 'Wystąpił błąd podczas komunikacji z serwerem.';
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="app-container">
        <Sidebar
            template={template}
            setTemplate={setTemplate}
            isChatLoading={isLoading}
        />
        <ChatArea
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
        />
      </div>
  );
}

export default App;
