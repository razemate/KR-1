import { useState, useCallback } from "react";

export async function sendLLMRequest(
  provider: string,
  model: string,
  prompt: string,
  apiKey: string
): Promise<string> {
  try {
    let url = "";
    let headers: Record<string, string> = { "Content-Type": "application/json" };
    let body: Record<string, any> = {};

    // OpenAI, Groq, DeepSeek
    if (["openai", "groq", "deepseek"].includes(provider)) {
      url = "https://api.openai.com/v1/chat/completions";
      headers["Authorization"] = `Bearer ${apiKey}`;
      body = { model, messages: [{ role: "user", content: prompt }] };
    }
    // Claude
    else if (provider === "anthropic" || provider === "claude") {
      url = "https://api.anthropic.com/v1/messages";
      headers = {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      };
      body = { model, max_tokens: 1000, messages: [{ role: "user", content: prompt }] };
    }
    // Gemini
    else if (provider === "gemini") {
      url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
      body = { contents: [{ parts: [{ text: prompt }] }] };
    }
    // Qwen
    else if (provider === "qwen") {
      url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
      headers["Authorization"] = `Bearer ${apiKey}`;
      body = { model, input: { prompt } };
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("API Error:", res.status, data);
      return `[ERROR ${res.status}] ${data?.error?.message || JSON.stringify(data)}`;
    }

    // Response parsing per provider
    if (provider === "gemini") return data.candidates[0].content.parts[0].text;
    if (provider === "qwen") return data.output.text;
    if (provider === "anthropic" || provider === "claude") return data.content[0].text;
    return data.choices[0].message.content;
  } catch (err: any) {
    console.error("LLM Exception:", err);
    return `[EXCEPTION] ${err.message || String(err)}`;
  }
}

export const useLLM = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callLLM = useCallback(async (
    provider: string,
    model: string,
    prompt: string,
    apiKey: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sendLLMRequest(provider, model, prompt, apiKey);
      setLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return `[HOOK ERROR] ${err.message}`;
    }
  }, []);

  return { callLLM, loading, error };
};