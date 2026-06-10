import os
import json
import shutil
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

# Absolute paths
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(CURRENT_DIR))
DATASET_PATH = os.path.join(BACKEND_DIR, "rag", "datasets", "seed_data.json")
CHROMA_DB_DIR = os.path.join(BACKEND_DIR, "rag", "chroma_db")

# Import our embedding loader
import sys
sys.path.append(BACKEND_DIR)
from rag.embeddings.model import get_embedding_model

def add_contextual_prefix(
    chunk_content: str,
    source_name: str,
    section_name: str,
    chunk_index: int,
    total_chunks: int
) -> str:
    """
    Prepends situational context to each chunk before embedding.
    This is Anthropic-style Contextual RAG.
    """
    context_header = (
        f"Context: This passage is from {source_name}, "
        f"section '{section_name}', "
        f"passage {chunk_index + 1} of {total_chunks}. "
    )
    return context_header + chunk_content


def seed_database():
    """
    Reads from the first aid protocols JSON file, chunks the text,
    generates local HuggingFace embeddings, and indexes them into ChromaDB.
    """
    print("=== STARTING CHROMADB SEEDING PROCESS ===")
    
    # 1. Load dataset
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Seed data file not found at {DATASET_PATH}")
        
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        protocols = json.load(f)
    print(f"Loaded {len(protocols)} emergency protocols from JSON dataset.")
    
    # 2. Convert to LangChain Documents
    documents = []
    for p in protocols:
        doc_content = f"Title: {p['title']}\nSource: {p['source']}\nProtocol: {p['content']}"
        metadata = {
            "title": p["title"],
            "source": p["source"],
            "tags": ", ".join(p["tags"])
        }
        documents.append(Document(page_content=doc_content, metadata=metadata))
    
    # 3. Perform semantic chunking and prepend contextual metadata (Contextual RAG)
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=50,
        length_function=len
    )
    
    chunks = []
    for doc in documents:
        doc_chunks = text_splitter.split_documents([doc])
        total_chunks = len(doc_chunks)
        for i, chunk in enumerate(doc_chunks):
            source_name = doc.metadata.get("source", "Unknown Emergency Protocol")
            section_name = doc.metadata.get("title", "General Emergency Protocols")
            chunk.page_content = add_contextual_prefix(
                chunk_content=chunk.page_content,
                source_name=source_name,
                section_name=section_name,
                chunk_index=i,
                total_chunks=total_chunks
            )
            chunks.append(chunk)
            
    print(f"Split {len(documents)} protocols into {len(chunks)} contextual semantic chunks.")
    
    # 4. Clean existing ChromaDB folder to start fresh
    if os.path.exists(CHROMA_DB_DIR):
        print(f"Cleaning existing ChromaDB directory at {CHROMA_DB_DIR}...")
        try:
            shutil.rmtree(CHROMA_DB_DIR)
        except Exception as e:
            print(f"Warning: Could not remove old database: {e}")
            
    os.makedirs(CHROMA_DB_DIR, exist_ok=True)
    
    # 5. Initialize Embeddings & ChromaDB
    print("Loading HuggingFace embeddings model (sentence-transformers/all-MiniLM-L6-v2)...")
    embeddings = get_embedding_model()
    
    print(f"Generating embeddings and indexing chunks into ChromaDB at {CHROMA_DB_DIR}...")
    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_DB_DIR,
        collection_name="emergency_protocols"
    )
    
    print(f"Successfully indexed database!")
    print(f"Collection count: {vector_store._collection.count()} items.")
    print("=== SEEDING COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    seed_database()
