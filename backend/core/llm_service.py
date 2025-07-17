import os
import requests
import json
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

class LLMService:
    """Centralized LLM service supporting multiple providers"""
    
    def __init__(self):
        self.providers = {
            'openai': self._call_openai,
            'claude': self._call_claude,
            'gemini': self._call_gemini,
            'groq': self._call_groq,
            'deepseek': self._call_deepseek,
            'qwen': self._call_qwen
        }
    
    async def send_request(self, provider: str, model: str, prompt: str, api_key: str, context: str = '') -> str:
        """Send request to specified LLM provider"""
        try:
            if provider not in self.providers:
                return f"[ERROR] Unsupported provider: {provider}"
            
            # Enhance prompt with context if provided
            enhanced_prompt = f"Context: {context}\n\nQuery: {prompt}" if context else prompt
            
            return await self.providers[provider](model, enhanced_prompt, api_key)
            
        except Exception as e:
            return f"[EXCEPTION] {str(e)}"
    
    async def _call_openai(self, model: str, prompt: str, api_key: str) -> str:
        """Call OpenAI API"""
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 1000
        }
        
        response = requests.post(url, headers=headers, json=data)
        if response.status_code != 200:
            return f"[ERROR {response.status_code}] {response.text}"
        
        result = response.json()
        return result['choices'][0]['message']['content']
    
    async def _call_claude(self, model: str, prompt: str, api_key: str) -> str:
        """Call Claude API"""
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "max_tokens": 1000,
            "messages": [{"role": "user", "content": prompt}]
        }
        
        response = requests.post(url, headers=headers, json=data)
        if response.status_code != 200:
            return f"[ERROR {response.status_code}] {response.text}"
        
        result = response.json()
        return result['content'][0]['text']
    
    async def _call_gemini(self, model: str, prompt: str, api_key: str) -> str:
        """Call Gemini API"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        data = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        
        response = requests.post(url, headers=headers, json=data)
        if response.status_code != 200:
            return f"[ERROR {response.status_code}] {response.text}"
        
        result = response.json()
        return result['candidates'][0]['content']['parts'][0]['text']
    
    async def _call_groq(self, model: str, prompt: str, api_key: str) -> str:
        """Call Groq API (OpenAI compatible)"""
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 1000
        }
        
        response = requests.post(url, headers=headers, json=data)
        if response.status_code != 200:
            return f"[ERROR {response.status_code}] {response.text}"
        
        result = response.json()
        return result['choices'][0]['message']['content']
    
    async def _call_deepseek(self, model: str, prompt: str, api_key: str) -> str:
        """Call DeepSeek API (OpenAI compatible)"""
        url = "https://api.deepseek.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 1000
        }
        
        response = requests.post(url, headers=headers, json=data)
        if response.status_code != 200:
            return f"[ERROR {response.status_code}] {response.text}"
        
        result = response.json()
        return result['choices'][0]['message']['content']
    
    async def _call_qwen(self, model: str, prompt: str, api_key: str) -> str:
        """Call Qwen API"""
        url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "input": {"prompt": prompt},
            "parameters": {"max_tokens": 1000}
        }
        
        response = requests.post(url, headers=headers, json=data)
        if response.status_code != 200:
            return f"[ERROR {response.status_code}] {response.text}"
        
        result = response.json()
        return result['output']['text']
    
    def validate_api_key(self, provider: str, api_key: str) -> bool:
        """Validate API key for a provider"""
        try:
            # Simple validation by making a minimal request
            test_prompt = "Hello"
            if provider == 'openai':
                response = requests.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": test_prompt}], "max_tokens": 5}
                )
            elif provider == 'claude':
                response = requests.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={"x-api-key": api_key, "anthropic-version": "2023-06-01", "Content-Type": "application/json"},
                    json={"model": "claude-3-sonnet-20240229", "max_tokens": 5, "messages": [{"role": "user", "content": test_prompt}]}
                )
            elif provider == 'gemini':
                response = requests.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}",
                    headers={"Content-Type": "application/json"},
                    json={"contents": [{"parts": [{"text": test_prompt}]}]}
                )
            elif provider == 'groq':
                response = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={"model": "mixtral-8x7b-32768", "messages": [{"role": "user", "content": test_prompt}], "max_tokens": 5}
                )
            elif provider == 'deepseek':
                response = requests.post(
                    "https://api.deepseek.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={"model": "deepseek-chat", "messages": [{"role": "user", "content": test_prompt}], "max_tokens": 5}
                )
            elif provider == 'qwen':
                response = requests.post(
                    "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={"model": "qwen-turbo", "input": {"prompt": test_prompt}, "parameters": {"max_tokens": 5}}
                )
            else:
                return False
            
            return response.status_code == 200
        except:
            return False

# Global instance
llm_service = LLMService()