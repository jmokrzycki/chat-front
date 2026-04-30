import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatArea } from './components/Chat/ChatArea';
import { api, type Settings } from './services/api';
import { useChat } from './hooks/useChat';
import './App.css';

function App() {
  const [settings, setSettings] = useState<Settings>({
    template: 'Ładowanie...',
    rephrase_template: 'Ładowanie...',
    history_limit: 4,
    memory_enabled: true
  });

  const { messages, isLoading, sendMessage, stopGenerating, clearChat } = useChat(settings);

  useEffect(() => {
    api.getSettings()
        .then((data) => setSettings(data))
        .catch((err) => console.error('Nie udało się pobrać ustawień:', err));
  }, []);

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
            onSendMessage={sendMessage}
            onStopMessage={stopGenerating}
            onClearChat={clearChat}
        />
      </div>
  );
}

export default App;
