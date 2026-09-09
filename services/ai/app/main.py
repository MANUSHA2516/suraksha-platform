import os
import hmac
from dataclasses import asdict
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field
from typing import Literal
from .model import DevelopmentAnalyzer

app = FastAPI(title='Suraksha harassment analysis', version='0.1.0')
model = DevelopmentAnalyzer()

class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10000)
    language: Literal['auto', 'en', 'si', 'ta'] = 'auto'

@app.get('/health')
def health():
    return {'status': 'ok', 'provider': 'development', 'validated': False}

@app.post('/analyze')
def analyze(body: AnalyzeRequest, authorization: str = Header(default='')):
    expected = os.environ.get('AI_SERVICE_TOKEN')
    if not expected or not hmac.compare_digest(authorization, 'Bearer ' + expected):
        raise HTTPException(status_code=401, detail='Service authentication required')
    if not body.text.strip():
        raise HTTPException(status_code=422, detail='Text is required')
    return asdict(model.analyze(body.text, body.language))
