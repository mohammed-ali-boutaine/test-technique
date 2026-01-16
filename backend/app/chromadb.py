import chromadb
import os

chroma_data_path = os.path.join(os.path.dirname(__file__), "..", "chroma_data")
os.makedirs(chroma_data_path, exist_ok=True)

chroma_client = chromadb.PersistentClient(path="chroma_data")

collection = chroma_client.get_or_create_collection(
        name="test",
        metadata={"hnsw:space": "cosine"}
    )


def get_collection():
    return chroma_client.get_collection(name="test")

