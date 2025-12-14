---
title: FastAPI 튜토리얼
date: 2024-02-10
description: Python FastAPI 프레임워크를 사용하여 빠른 백엔드 API를 만드는 방법을 알아봅니다.
category: backend
subcategory: fastapi
tags: [FastAPI, Python, 백엔드, API]
---

# FastAPI 튜토리얼

FastAPI는 현대적이고 빠른 Python 웹 프레임워크입니다.

## 설치

```bash
pip install fastapi uvicorn
```

## 기본 애플리케이션

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id}
```

## 실행

```bash
uvicorn main:app --reload
```

## 요청/응답 모델

```python
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float
    description: str | None = None

@app.post("/items/")
def create_item(item: Item):
    return item
```

## 비동기 지원

```python
import asyncio

@app.get("/async")
async def read_async():
    await asyncio.sleep(1)
    return {"message": "Async response"}
```

## 자동 API 문서

FastAPI는 자동으로 Swagger UI와 ReDoc 문서를 생성합니다:
- `/docs` - Swagger UI
- `/redoc` - ReDoc

## 마무리

FastAPI는 빠르고 현대적인 Python 백엔드 개발을 위한 훌륭한 선택입니다.

