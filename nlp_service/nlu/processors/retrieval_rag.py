# retrieval_rag.py
import json
import logging
from typing import Dict, List, Optional, Tuple, TYPE_CHECKING # TYPE_CHECKING for Document
from pathlib import Path
from huggingface_hub import snapshot_download
from langchain_community.embeddings import HuggingFaceEmbeddings

# --- Optional Library Imports with Fallbacks ---
try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None # type: ignore
    logging.warning("sentence_transformers library not found. RAG functionality will be limited or unavailable if SentenceTransformer is not installed.")

try:
    from langchain_community.vectorstores import Chroma
    if TYPE_CHECKING: # For static type checking
        from langchain_core.documents import Document
    else: # Runtime import
        try:
            from langchain_core.documents import Document
        except ImportError:
            from langchain.schema import Document # Fallback for older langchain
except ImportError:
    Chroma = None # type: ignore
    Document = None # type: ignore
    logging.warning("langchain_community or langchain_core.documents/langchain.schema not found. Chroma vector store functionality will be unavailable.")
# -------------------------------------------------

logger = logging.getLogger(__name__)

class StandardCommandRetriever:
    """
    Retrieves standard command texts from a knowledge base (e.g., data.jsonl)
    that are semantically similar to a given user query.
    It vectorizes the "text" field of the knowledge base entries.
    """
    DEFAULT_EMBEDDING_MODEL_HUB_ID = "shibing624/text2vec-base-chinese" # embedding model

    def __init__(self, 
                 knowledge_base_path: str, 
                 config: Dict, 
                 device: str = "cpu"):
        """
        Initializes the RAG system for retrieving standard commands.

        Args:
            knowledge_base_path (str): Path to the knowledge base JSONL file (e.g., data.jsonl).
                                       Each line should be a JSON object with at least a "text" field.
            config (Dict): Configuration dictionary, expected to contain:
                local_embedding_target_dir (str): Local directory path to store/load the embedding model.
                embedding_model_hub_id (str, optional): Hugging Face Hub ID for the embedding model.
                                                         Uses DEFAULT_EMBEDDING_MODEL_HUB_ID if not provided.
                force_download_embedding (bool, optional): Whether to force re-download of the embedding model. Defaults to False.
            device (str): Device to run the embedding model on ("auto", "cuda" or "cpu").
        """
        
        self.knowledge_base: List[Dict] = [] # Stores original records from knowledge_base_path
        self.documents_for_vectorstore: List[Document] = [] # Stores Langchain Document objects
        self.vector_store: Optional[Chroma] = None
        self.embedding_model: Optional[HuggingFaceEmbeddings] = None
        
        # 处理设备参数
        if device.lower() == "auto":
            import torch
            device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"设置为自动选择设备，将使用: {device}")
        logger.info(f"RAG检索器初始化使用设备: {device}")

        if SentenceTransformer is None or Chroma is None or Document is None:
            logger.error("StandardCommandRetriever initialization failed: Missing essential libraries (sentence_transformers, langchain_community, langchain_core.documents/langchain.schema).")
            return

        # --- Load and Prepare Embedding Model from config ---
        local_emb_target_dir_str = config.get("local_embedding_target_dir")
        if not local_emb_target_dir_str:
            logger.error("RAG config is missing 'local_embedding_target_dir'. This is required for embedding model storage.")
            # Fallback or raise error - for now, we'll let it try loading from Hub ID directly, which uses HF cache.
            # However, the design goal was to download to a specific project dir.
            # raise ValueError("RAG config must provide 'local_embedding_target_dir'.")
            default_hub_id = config.get("embedding_model_hub_id", self.DEFAULT_EMBEDDING_MODEL_HUB_ID)
            logger.warning(f"RAG 'local_embedding_target_dir' not provided. Embedding model '{default_hub_id}' will be loaded using Hugging Face default cache if not found locally by its Hub ID.")
            actual_embedding_model_load_path = default_hub_id # Load directly using Hub ID
        else:
            local_emb_path = Path(local_emb_target_dir_str).resolve()
            local_emb_path.mkdir(parents=True, exist_ok=True)
            actual_embedding_model_load_path = str(local_emb_path)

            embedding_model_hub_id = config.get("embedding_model_hub_id", self.DEFAULT_EMBEDDING_MODEL_HUB_ID)
            force_download_embedding = config.get("force_download_embedding", False)

            # Check if essential SentenceTransformer files exist locally
            # A more robust check would look for specific files like 'pytorch_model.bin', 'config.json', 'modules.json' etc.
            st_config_file = local_emb_path / "config.json" 
            st_modules_file = local_emb_path / "modules.json" # Key file for SentenceTransformers
            # st_pytorch_model_file = local_emb_path / "pytorch_model.bin" # or model.safetensors

            emb_model_seems_complete_locally = st_config_file.exists() and st_modules_file.exists()

            if not emb_model_seems_complete_locally or force_download_embedding:
                if force_download_embedding and emb_model_seems_complete_locally:
                    logger.info(f"Forcing re-download of Embedding model '{embedding_model_hub_id}' to '{local_emb_path}'...")
                elif not emb_model_seems_complete_locally:
                    logger.info(f"Local Embedding model at '{local_emb_path}' seems incomplete or not found. Attempting download from Hub '{embedding_model_hub_id}'...")
                
                try:
                    snapshot_download(
                        repo_id=embedding_model_hub_id,
                        local_dir=actual_embedding_model_load_path,
                        local_dir_use_symlinks=False,
                        ignore_patterns=["*.md", ".gitattributes", "*.png", "*.jpg", "*.git*"]
                    )
                    logger.info(f"Embedding model files successfully downloaded/updated to: {actual_embedding_model_load_path}")
                except Exception as e:
                    logger.error(f"Failed to download Embedding model '{embedding_model_hub_id}' from Hub to '{actual_embedding_model_load_path}': {e}", exc_info=True)
                    if not emb_model_seems_complete_locally:
                        logger.error("Cannot load Embedding model. RAG system may not function correctly.")
                        return # Critical failure
            else:
                logger.info(f"Found existing Embedding model files at local path '{actual_embedding_model_load_path}'. Will use directly.")
        
        logger.info(f"Loading SentenceTransformer model: '{actual_embedding_model_load_path}' to device '{device}'...")
        try:
            self.embedding_model = HuggingFaceEmbeddings(
                model_name=actual_embedding_model_load_path,
                model_kwargs={'device': device}
            )
        except Exception as e:
            logger.error(f"Failed to load SentenceTransformer model from '{actual_embedding_model_load_path}': {e}", exc_info=True)
            self.embedding_model = None # Mark as failed
            return # Critical failure

        # --- Load Knowledge Base ---
        logger.info(f"Loading RAG knowledge base (standard commands) from '{knowledge_base_path}'...")
        kb_path_obj = Path(knowledge_base_path)
        if not kb_path_obj.exists():
            logger.error(f"RAG knowledge base file (e.g., rag_knowledge.jsonl) not found at: {knowledge_base_path}")
            return # Critical failure
        
        try:
            with open(kb_path_obj, 'r', encoding='utf-8') as f:
                for i, line in enumerate(f):
                    try:
                        record = json.loads(line)
                        # RAG knowledge base uses the "text" field (standard commands) for vectorization
                        if "text" in record: 
                            self.knowledge_base.append(record) # Store the full original record
                            doc = Document(page_content=record["text"], metadata={"kb_index": i})
                            self.documents_for_vectorstore.append(doc)
                        else: 
                            logger.warning(f"Skipping record in RAG knowledge base due to missing 'text' field (line {i+1}): {record}")
                    except json.JSONDecodeError: 
                        logger.warning(f"Skipping unparsable JSON line in RAG knowledge base (line {i+1}): {line.strip()}")
        except Exception as e:
            logger.error(f"Failed to load RAG knowledge base file '{knowledge_base_path}': {e}", exc_info=True)
            return # Critical failure

        if not self.documents_for_vectorstore:
            logger.warning("RAG knowledge base is empty or no valid entries found for vectorization.")
            return # Critical failure if no documents to build upon
            
        self._build_vector_space()

    def _build_vector_space(self):
        if not self.documents_for_vectorstore or not self.embedding_model:
            logger.warning("No documents or embedding model available, cannot build RAG vector space.")
            self.vector_store = None
            return

        logger.info(f"Building vector space for {len(self.documents_for_vectorstore)} standard commands...")
        try:
            self.vector_store = Chroma.from_documents(
                documents=self.documents_for_vectorstore,
                embedding=self.embedding_model
            )
            logger.info("RAG vector space built successfully (in-memory Chroma).")
        except Exception as e:
            logger.error(f"Failed to build Chroma vector store: {e}", exc_info=True)
            self.vector_store = None

    def retrieve_similar_commands(self, query: str, top_k: int = 1) -> List[Tuple[str, float, Dict]]:
        """
        Retrieves the top_k standard command texts semantically similar to the query.

        Args:
            query (str): The user's (potentially fuzzy) input query.
            top_k (int): The number of most similar commands to retrieve.

        Returns:
            List[Tuple[str, float, Dict]]: A list of tuples, where each tuple contains:
                - standard_command_text (str): The retrieved standard command text.
                - score (float): The similarity score (distance for Chroma, lower is better).
                - original_record_from_kb (Dict): The full original record from the knowledge base.
        """
        if not self.vector_store:
            logger.debug("RAG vector store not initialized, cannot retrieve.")
            return []
        if not self.knowledge_base: # Should not happen if vector_store is initialized
            logger.debug("RAG knowledge base is empty, cannot retrieve original records.")
            return []

        logger.debug(f"RAG retrieving similar standard commands for query: '{query}', top_k: {top_k}")
        try:
            # similarity_search_with_score returns a list of (Document, score) tuples
            retrieved_docs_with_scores: List[Tuple[Document, float]] = self.vector_store.similarity_search_with_score(query, k=top_k)
            
            results = []
            for doc, score in retrieved_docs_with_scores:
                standard_command_text = doc.page_content
                kb_index = doc.metadata.get("kb_index")
                original_record = {} # Default to empty dict if index is bad
                if kb_index is not None and 0 <= kb_index < len(self.knowledge_base):
                    original_record = self.knowledge_base[kb_index] # Get the full original record
                else:
                    logger.warning(f"Could not find original record for kb_index '{kb_index}' from metadata: {doc.metadata} for command '{standard_command_text}'")
                
                results.append((standard_command_text, score, original_record))
                logger.debug(f"RAG retrieved standard command: text='{standard_command_text}', score={score:.4f}")
            return results
        except Exception as e:
            logger.error(f"Error during RAG retrieval of similar commands: {e}", exc_info=True)
            return []

# --- Example Usage (for testing this file directly) ---
if __name__ == '__main__':
    if not logger.hasHandlers():
        logging.basicConfig(level=logging.DEBUG,
                            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    # --- 路径设置，基于当前 retrieval_rag.py 文件的位置 ---
    # current_script_dir 指向 retrieval_rag.py 所在的目录 (nlu/processors/)
    current_script_dir = Path(__file__).resolve().parent 
    # nlu_dir 指向 nlu/
    nlu_dir = current_script_dir.parent 
    # model_dir 指向 nlu/model/
    model_dir = nlu_dir / "model"

    # 1. RAG 使用的知识库文件
    data_path = model_dir / "dataset" / "rag_knowledge.jsonl" 

    # 2. RAG Embedding 模型配置
    embedding_model_hub_id_for_rag = "shibing624/text2vec-base-chinese" 
    safe_model_name_for_path = embedding_model_hub_id_for_rag.replace("/", "-")
    target_local_embedding_model_dir = model_dir/safe_model_name_for_path

    rag_config_test = {
        "local_embedding_target_dir": str(target_local_embedding_model_dir), # 指定本地目标目录
        "embedding_model_hub_id": embedding_model_hub_id_for_rag,             # Hub模型ID
        "force_download_embedding": False,  
    }

    # 3. 初始化和测试 StandardCommandRetriever
    retriever = None 
    try:
        retriever = StandardCommandRetriever( 
            knowledge_base_path=str(data_path),
            config=rag_config_test, 
            device="auto" 
        )
    except Exception as e:
        logger.error(f"初始化 StandardCommandRetriever 失败: {e}", exc_info=True)


    if retriever and retriever.embedding_model and retriever.vector_store:
        logger.info("StandardCommandRetriever 初始化成功，准备测试。")
        
        queries = ["客厅太暗", "卧室有点热", "晚安", "客厅太冷", "卧室太冷"]
        for q in queries:
            print(f"\nQuerying for: '{q}'")
            similar_commands = retriever.retrieve_similar_commands(q, top_k=2)
            if similar_commands:
                for cmd_text, score, record in similar_commands: # 假设返回 (text, score, original_record)
                    print(f"  Retrieved: '{cmd_text}' (Score: {score:.4f}), Original Record Text: {record.get('text')}")
            else:
                print(f"  No similar commands found for '{q}'.")
    else:
        logger.error("StandardCommandRetriever 未能正确初始化以进行测试。")