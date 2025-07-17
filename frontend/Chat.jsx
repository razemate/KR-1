
import React, { useState, useEffect } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [llmProvider, setLlmProvider] = useState('openai');
  const [isListening, setIsListening] = useState(false);
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.onresult = (event) => {
    setQuery(event.results[0][0].transcript);
  };
  const startListening = () => {
    setIsListening(true);
    recognition.start();
  };
  const sendQuery = async () => {
    const res = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, llm_provider: llmProvider })
    });
    const { response } = await res.json();
    setMessages([...messages, { type: 'user', text: query }, { type: 'bot', text: response }]);
    setQuery('');
  };
  const uploadFile = async (e) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    await fetch('http://localhost:8000/upload', { method: 'POST', body: formData });
  };
  return (
    <div className="chat-window">
      {messages.map((msg, i) => (
        <div key={i} className={msg.type}>{msg.text}</div>
      ))}
      <select value={llmProvider} onChange={(e) => setLlmProvider(e.target.value)}>
        <option value="openai">OpenAI</option>
        <option value="claude">Claude</option>
        <option value="gemini">Gemini</option>
        <option value="groq">Groq</option>
        <option value="qwen">Qwen</option>
        <option value="deepseek">DeepSeek</option>
      </select>
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask something..." />
      <button onClick={sendQuery}>Send</button>
      <button onClick={startListening}>{isListening ? 'Listening...' : 'Voice Input'}</button>
      <input type="file" onChange={uploadFile} />
    </div>
  );
};

export default Chat;
