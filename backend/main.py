import os
import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from llm_handler import call_llm
from api_integrations import get_woocommerce_data, get_merchantguy_data
from exporter import export_to_file
import chromadb
from chromadb.utils import embedding_functions
import PyPDF2
import openpyxl
import pandas as pd

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

chroma_client = chromadb.Client()
collection = chroma_client.create_collection(name='rag_collection')
embedding_function = embedding_functions.DefaultEmbeddingFunction()

@app.post('/chat')
async def chat(query: str, llm_provider: str):
    # RAG logic
    results = collection.query(query_texts=[query], n_results=5)
    context = '\n'.join([res['text'] for res in results['documents'][0]])
    response = call_llm(llm_provider, query, context)
    return {'response': response}

@app.post('/upload')
async def upload_file(file: UploadFile = File(...)):
    file_extension = os.path.splitext(file.filename)[1]
    if file_extension == '.pdf':
        reader = PyPDF2.PdfReader(file.file)
        text = ''
        for page in reader.pages:
            text += page.extract_text()
    elif file_extension == '.xlsx':
        wb = openpyxl.load_workbook(file.file)
        sheet = wb.active
        data = pd.DataFrame(sheet.values)
        text = data.to_string()
    else:
        text = await file.read().decode('utf-8')
    embedding = embedding_function([text])[0]
    collection.add(documents=[text], embeddings=[embedding], ids=[file.filename])
    return {'message': 'File uploaded and embedded'}

@app.post('/integrate')
async def integrate(app: str, action: str):
    if app == 'woocommerce':
        data = get_woocommerce_data(action)
    elif app == 'merchantguy':
        data = get_merchantguy_data(action)
    # Add other integrations
    else:
        raise HTTPException(status_code=400, detail='Unsupported app')
    return {'data': data}

@app.post('/export')
async def export(format: str, data: dict):
    file_path = export_to_file(format, data)
    return {'file_path': file_path}

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)