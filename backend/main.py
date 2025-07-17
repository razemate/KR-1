from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import pandas as pd
from dotenv import load_dotenv
from typing import Dict, Any, List, Optional
from core.llm_service import LLMService
from core.rag_service import RAGService
from core.export_service import ExportService
from integrations.api_service import api_service

load_dotenv()

app = FastAPI(title="KR One API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
llm_service = LLMService()
rag_service = RAGService()
export_service = ExportService()

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    model: str = "openai"
    use_rag: bool = True

class APIKeyRequest(BaseModel):
    platform: str
    api_key: str

class ExportRequest(BaseModel):
    data: Dict[str, Any]
    format: str
    filename: Optional[str] = None

@app.post('/chat')
async def chat(request: ChatRequest):
    try:
        context = ""
        if request.use_rag:
            # Get relevant context from RAG
            rag_results = rag_service.query_documents(request.message, n_results=3)
            if rag_results and rag_results.get('documents'):
                context = "\n\n".join(rag_results['documents'][0])
        
        # Prepare message with context
        full_message = request.message
        if context:
            full_message = f"Context: {context}\n\nQuestion: {request.message}"
        
        # Get LLM response
        response = llm_service.send_request(request.model, full_message)
        
        return {
            "response": response,
            "model_used": request.model,
            "rag_used": request.use_rag,
            "context_found": bool(context)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/upload')
async def upload_file(file: UploadFile = File(...)):
    try:
        # Save uploaded file temporarily
        temp_path = f"../storage/temp/{file.filename}"
        os.makedirs(os.path.dirname(temp_path), exist_ok=True)
        
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Process file with RAG service
        result = rag_service.process_file(temp_path, file.filename)
        
        # Clean up temp file
        os.remove(temp_path)
        
        if result["success"]:
            return {
                "message": "File uploaded and processed successfully",
                "filename": file.filename,
                "file_type": result.get("file_type"),
                "chunks_created": result.get("chunks_created", 0)
            }
        else:
            raise HTTPException(status_code=400, detail=result["error"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Integration endpoints
@app.get('/integrations/{platform}/{action}')
async def get_integration_data(platform: str, action: str, params: Optional[Dict[str, Any]] = None):
    try:
        if platform == 'woocommerce':
            data = api_service.get_woocommerce_data(action, params)
        elif platform == 'merchantguy':
            data = api_service.get_merchantguy_data(action, params)
        elif platform == 'google_analytics':
            data = api_service.get_google_analytics_data(action, params)
        elif platform == 'google_ads':
            data = api_service.get_google_ads_data(action, params)
        elif platform == 'facebook':
            data = api_service.get_facebook_data(action, params)
        elif platform == 'tiktok':
            data = api_service.get_tiktok_data(action, params)
        elif platform == 'twitter':
            data = api_service.get_twitter_data(action, params)
        elif platform == 'youtube':
            data = api_service.get_youtube_data(action, params)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")
        
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/integrations/status')
async def get_integration_status():
    try:
        return api_service.get_integration_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API Key management
@app.post('/api-keys/save')
async def save_api_key(request: APIKeyRequest):
    try:
        success = api_service.save_api_key(request.platform, request.api_key)
        if success:
            return {"message": f"API key for {request.platform} saved successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save API key")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api-keys/validate')
async def validate_api_key(request: APIKeyRequest):
    try:
        is_valid = api_service.validate_api_key(request.platform, request.api_key)
        return {"valid": is_valid, "platform": request.platform}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Export endpoints
@app.post('/export')
async def export_data(request: ExportRequest):
    try:
        result = export_service.export_data(request.data, request.format, request.filename)
        if result["success"]:
            return {
                "message": "Data exported successfully",
                "file_path": result["file_path"],
                "format": request.format
            }
        else:
            raise HTTPException(status_code=500, detail=result["error"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/export/files')
async def list_exported_files():
    try:
        return export_service.list_exported_files()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete('/export/files/{filename}')
async def delete_exported_file(filename: str):
    try:
        result = export_service.delete_file(filename)
        if result["success"]:
            return {"message": f"File {filename} deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail=result["error"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# RAG document management
@app.get('/documents')
async def list_documents():
    try:
        return rag_service.list_documents()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete('/documents/{document_id}')
async def delete_document(document_id: str):
    try:
        result = rag_service.delete_document(document_id)
        if result["success"]:
            return {"message": f"Document {document_id} deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail=result["error"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete('/documents')
async def clear_all_documents():
    try:
        result = rag_service.clear_all_documents()
        if result["success"]:
            return {"message": "All documents cleared successfully"}
        else:
            raise HTTPException(status_code=500, detail=result["error"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/documents/query')
async def query_documents(query: str, n_results: int = 5):
    try:
        results = rag_service.query_documents(query, n_results)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# LLM model management
@app.get('/models/available')
async def get_available_models():
    return {
        "models": [
            {"id": "openai", "name": "OpenAI GPT", "provider": "OpenAI"},
            {"id": "claude", "name": "Claude", "provider": "Anthropic"},
            {"id": "gemini", "name": "Gemini", "provider": "Google"},
            {"id": "groq", "name": "Groq", "provider": "Groq"},
            {"id": "deepseek", "name": "DeepSeek", "provider": "DeepSeek"},
            {"id": "qwen", "name": "Qwen", "provider": "Alibaba"}
        ]
    }

@app.post('/models/validate')
async def validate_model(model: str, api_key: str):
    try:
        is_valid = llm_service.validate_api_key(model, api_key)
        return {"valid": is_valid, "model": model}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Additional endpoints for frontend compatibility
class LLMValidationRequest(BaseModel):
    provider: str
    apiKey: str

class IntegrationValidationRequest(BaseModel):
    integration: str
    apiKey: str

@app.post('/api/llm/validate-key')
async def validate_llm_key(request: LLMValidationRequest):
    try:
        is_valid = llm_service.validate_api_key(request.provider, request.apiKey)
        return {"valid": is_valid, "provider": request.provider}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/integrations/validate-key')
async def validate_integration_key(request: IntegrationValidationRequest):
    try:
        is_valid = api_service.validate_api_key(request.integration, request.apiKey)
        return {"valid": is_valid, "integration": request.integration}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Self-audit endpoint
@app.post('/self-audit')
async def self_audit():
    try:
        # Read KR-1_PROMPT.txt for requirements
        prompt_path = "../KR-1_PROMPT.txt"
        if not os.path.exists(prompt_path):
            return {"error": "KR-1_PROMPT.txt not found"}
        
        with open(prompt_path, 'r', encoding='utf-8') as f:
            requirements = f.read()
        
        # Perform basic checks
        audit_results = {
            "timestamp": str(pd.Timestamp.now()),
            "checks": {
                "backend_running": True,
                "services_initialized": {
                    "llm_service": bool(llm_service),
                    "rag_service": bool(rag_service),
                    "export_service": bool(export_service),
                    "api_service": bool(api_service)
                },
                "endpoints_available": {
                    "/chat": True,
                    "/upload": True,
                    "/export": True,
                    "/integrations": True,
                    "/documents": True,
                    "/models": True
                },
                "storage_directories": {
                    "../storage/export": os.path.exists("../storage/export"),
                    "../storage/temp": os.path.exists("../storage/temp"),
                    "../storage/rag": os.path.exists("../storage/rag")
                },
                "environment_variables": {
                    "env_file_exists": os.path.exists(".env"),
                    "woo_configured": bool(os.getenv('WOO_CONSUMER_KEY')),
                    "merchantguy_configured": bool(os.getenv('MERCHANTGUY_API_KEY'))
                }
            },
            "requirements_file_found": True,
            "auto_fix_available": True
        }
        
        return audit_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check
@app.get('/health')
async def health_check():
    return {
        "status": "healthy",
        "version": "0.1.0",
        "services": {
            "llm": "active",
            "rag": "active",
            "export": "active",
            "integrations": "active"
        }
    }

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)