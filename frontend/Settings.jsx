
import React, { useState } from 'react';

const Settings = () => {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    claude: '',
    gemini: '',
    groq: '',
    qwen: '',
    deepseek: '',
    google_analytics: '',
    // Add others
  });
  const handleChange = (e) => {
    setApiKeys({ ...apiKeys, [e.target.name]: e.target.value });
  };
  const saveSettings = async () => {
    // Save to config.json via backend or localStorage
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
  };
  return (
    <div className="settings">
      <h2>Settings</h2>
      <h3>Language Models</h3>
      <input name="openai" value={apiKeys.openai} onChange={handleChange} placeholder="OpenAI API Key" />
      <input name="claude" value={apiKeys.claude} onChange={handleChange} placeholder="Claude API Key" />
      {/* Add others */}
      <h3>Connected Apps</h3>
      <p>WooCommerce: Connected via .env (read-only)</p>
      <p>MerchantGuy: Connected via .env (read-only)</p>
      <input name="google_analytics" value={apiKeys.google_analytics} onChange={handleChange} placeholder="Google Analytics API Key" />
      {/* Add others */}
      <button onClick={saveSettings}>Save</button>
    </div>
  );
};

export default Settings;
