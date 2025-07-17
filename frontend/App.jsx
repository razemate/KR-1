
import React from 'react';
import Chat from './Chat';
import Settings from './Settings';

const App = () => (
  <div className="app">
    <header className="header">KR-One Assistant</header>
    <main className="main">
      <Chat />
    </main>
    <Settings />
  </div>
);

export default App;
