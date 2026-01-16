from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session
from pydantic import BaseModel
from . import models, database
from .chromadb import get_collection
import os


default_data = [
    {
        "client_name": "Client A",
        "key_value": "tenantA_key",
        "tenant_folder": "tenantA"
    },
    {
        "client_name": "Client B",
        "key_value": "tenantB_key",
        "tenant_folder": "tenantB"
    }
]




@asynccontextmanager
async def lifespan(app: FastAPI):
    models.Base.metadata.create_all(bind=database.engine)

    # insert default data
    try:
        db = next(database.get_db())
        collection = get_collection()
        
        for client_data in default_data:
            client = db.query(models.Client).filter_by(name=client_data["client_name"]).first()
            if not client:
                client = models.Client(name=client_data["client_name"])
                db.add(client)
                db.commit()
                db.refresh(client)
                
                key = models.Key(key=client_data["key_value"], client_id=client.id)
                db.add(key)
                db.commit()
                                
  
                app_dir = os.path.dirname(os.path.abspath(__file__))
                folder_path = os.path.join(app_dir, "..", "..", "data", client_data["tenant_folder"])
                folder_path = os.path.normpath(folder_path)
                                
                if os.path.exists(folder_path) and os.path.isdir(folder_path):
                    doc_count = 0
                    for file_name in os.listdir(folder_path):
                        file_path = os.path.join(folder_path, file_name)
                        if os.path.isfile(file_path):
                            with open(file_path, "r", encoding="utf-8") as f:
                                content = f.read()
                                # store embedding with client id
                                doc_id = f"client_{client.id}_{file_name}"
                                collection.add(
                                    documents=[content],
                                    metadatas=[{"client_id": str(client.id), "file_name": file_name}],
                                    ids=[doc_id]
                                )
                                doc_count += 1
                else:
                    print(f"Folder not found: {folder_path}")
        
        db.commit()
    except Exception as e:
        print(f"db error: {e}")
        db.rollback()
    finally:
        db.close()
    yield



app = FastAPI(lifespan=lifespan)


# cors middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


class QuestionRequest(BaseModel):
    question: str



@app.get("/")
async def health_check():
    return {"status": "healthy", "message": "Server is running"}


@app.post("/ask-question")
async def ask_question(
    request: QuestionRequest,
    api_key: str = Security(api_key_header),
    db: Session = Depends(database.get_db)
):
    
    if not api_key:
        raise HTTPException(status_code=403, detail="X-API-Key header missing")
    
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    try:
        key = db.query(models.Key).filter(models.Key.key == api_key).first()
        
        if not key:
            raise HTTPException(status_code=403, detail="Invalid API Key")
        
        client = key.client
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        collection = get_collection()
        
        results = collection.query(
            query_texts=[request.question],
            n_results=10,
            where={"client_id": str(client.id)}
        )
        
        if not results or not results['documents'] or len(results['documents'][0]) == 0:
            return {
                "question": request.question,
                "results": [],
                "message": "No relevant documents found"
            }
        
        # format result
        formatted_results = []
        for i in range(len(results['documents'][0])):
            formatted_results.append({
                "content": results['documents'][0][i],
                "source": results['metadatas'][0][i].get('file_name', 'Unknown'),
                "relevance_score": round(1 - results['distances'][0][i], 3) if 'distances' in results and results['distances'][0][i] is not None else None
            })
        
        return {
            "question": request.question,
            "results": formatted_results,
            "total_results": len(formatted_results)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying ChromaDB: {str(e)}")
