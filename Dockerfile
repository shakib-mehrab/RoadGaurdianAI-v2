# Use a lightweight official Python runtime
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    HF_HOME=/tmp/hf_cache

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install python dependencies from the backend folder
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy only the backend source folder into the container
COPY backend /app/backend

# Create necessary directories and ensure open permissions for Hugging Face UID 1000
RUN mkdir -p /app/backend/rag/embeddings/cache /app/backend/rag/chroma_db /tmp/hf_cache && \
    chmod -R 777 /app/backend/rag/embeddings/cache /app/backend/rag/chroma_db /tmp/hf_cache

# Pre-download the Hugging Face sentence-transformers model during build
RUN python -c "from langchain_huggingface import HuggingFaceEmbeddings; HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2', cache_folder='/app/backend/rag/embeddings/cache', encode_kwargs={'normalize_embeddings': True})"

# Pre-seed the ChromaDB vector database during build
RUN PYTHONPATH=/app python /app/backend/rag/ingest/seed_rag.py

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Command to run uvicorn server, supporting dynamic port bindings (Render compatibility)
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
