import os
from openai import OpenAI
import anthropic
import google.generativeai as genai
from groq import Groq

# Assuming Qwen and DeepSeek use OpenAI-compatible clients or similar
def call_llm(provider, query, context=''):
    prompt = f"Context: {context}\n\nQuery: {query}"
    if provider == 'openai':
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        response = client.chat.completions.create(model='gpt-4o', messages=[{'role': 'user', 'content': prompt}])
        return response.choices[0].message.content
    elif provider == 'claude':
        client = anthropic.Anthropic(api_key=os.getenv('CLAUDE_API_KEY'))
        response = client.messages.create(model='claude-3-5-sonnet-20240620', max_tokens=1000, messages=[{'role': 'user', 'content': prompt}])
        return response.content[0].text
    elif provider == 'gemini':
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        return response.text
    elif provider == 'groq':
        client = Groq(api_key=os.getenv('GROQ_API_KEY'))
        response = client.chat.completions.create(model='mixtral-8x7b-32768', messages=[{'role': 'user', 'content': prompt}])
        return response.choices[0].message.content
    elif provider == 'qwen':
        # Assuming OpenAI compatible
        client = OpenAI(api_key=os.getenv('QWEN_API_KEY'), base_url='https://dashscope.aliyuncs.com/compatible-mode/v1')
        response = client.chat.completions.create(model='qwen-turbo', messages=[{'role': 'user', 'content': prompt}])
        return response.choices[0].message.content
    elif provider == 'deepseek':
        client = OpenAI(api_key=os.getenv('DEEPSEEK_API_KEY'), base_url='https://api.deepseek.com')
        response = client.chat.completions.create(model='deepseek-chat', messages=[{'role': 'user', 'content': prompt}])
        return response.choices[0].message.content
    else:
        raise ValueError(f'Unsupported LLM provider: {provider}')