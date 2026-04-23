import { useState } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatArea } from './components/Chat/ChatArea';
import { api } from './services/api';
import type { Message } from './types';
import './App.css';

const DEFAULT_TEMPLATE = `Jesteś inteligentnym i pomocnym asystentem AI.
Został Ci dostarczony poniższy KONTEKST w postaci fragmentów dokumentów.
Odpowiedz na pytanie bazując na tym kontekście.
Jeśli nie potrafisz znaleźć odpowiedzi w kontekście, powiedz o tym, a następnie odpowiedz zgodnie z własną wiedzą.

KONTEKST:
{context}

PYTANIE UŻYTKOWNIKA:
{question}`;

function App() {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
          if (line.trim() !== '') {
            try {
              const parsed = JSON.parse(line);
              if (parsed.response) newTextChunk += parsed.response;
            } catch (err) {
              console.warn('Otrzymano nieprawidłowy fragment JSON ze strumienia:', line, err);
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
