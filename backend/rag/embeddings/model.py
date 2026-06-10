import os

# Cache directory inside the workspace for offline portability
MODEL_CACHE_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), 
    "cache"
)

os.makedirs(MODEL_CACHE_DIR, exist_ok=True)

_embeddings = None

def get_embedding_model():
    """
    Returns a singleton instance of HuggingFaceEmbeddings running all-MiniLM-L6-v2.
    It caches the model locally inside the workspace to support offline-first operations.
    """
    global _embeddings
    if _embeddings is None:
        from langchain_huggingface import HuggingFaceEmbeddings
        model_name = "sentence-transformers/all-MiniLM-L6-v2"
        encode_kwargs = {'normalize_embeddings': True}
        
        # Initialize standard local embeddings
        _embeddings = HuggingFaceEmbeddings(
            model_name=model_name,
            cache_folder=MODEL_CACHE_DIR,
            encode_kwargs=encode_kwargs
        )
    return _embeddings
