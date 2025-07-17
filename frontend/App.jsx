
import { useState } from 'react'
import { MainNav } from './components/main-nav'
import { ChatView } from './components/chat-view'
import { SettingsView } from './components/settings-view'
import { Toaster } from './components/ui/toaster'
import './styles.css'

function App() {
  const [currentView, setCurrentView] = useState('chat')

  const renderView = () => {
    switch (currentView) {
      case 'chat':
        return <ChatView />
      case 'settings':
        return <SettingsView />
      default:
        return <ChatView />
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <MainNav currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-hidden">
        {renderView()}
      </main>
      <Toaster />
    </div>
  )
}

export default App
