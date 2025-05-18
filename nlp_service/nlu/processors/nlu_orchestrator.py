# nlu_orchestrator.py
import logging
from typing import Dict, Optional, Any, List # Added List
from pathlib import Path
import sys
import json
import asyncio

# 将项目根目录添加到系统路径
sys.path.append(str(Path(__file__).parent.parent.parent))

from interfaces.nlu_interface import NLUInterface
from nlu.processors.fine_tuned_bert_processor import BertNLUProcessor 
from nlu.processors.retrieval_rag import StandardCommandRetriever 

logger = logging.getLogger(__name__)

class SmartHomeNLUOrchestrator(NLUInterface):
    def __init__(self, 
                 bert_nlu_config: Dict, 
                 rag_data_jsonl_path: Optional[str] = None, 
                 rag_embedding_config: Optional[Dict] = None,
                 # rag_device is now part of rag_embedding_config if needed by SimilarityRetriever
                 rag_similarity_threshold: float = 250): # Chroma L2 distance, lower is better
        
        logger.info("Initializing SmartHomeNLUOrchestrator...")
        self.bert_nlu_processor = BertNLUProcessor(bert_nlu_config)
        
        self.rag_system: Optional[StandardCommandRetriever] = None
        self.rag_similarity_threshold = rag_similarity_threshold

        if rag_data_jsonl_path and Path(rag_data_jsonl_path).exists() and rag_embedding_config:
            try:
                current_rag_module_config = rag_embedding_config.copy()
                # The 'device' for RAG's embedding model should be part of rag_embedding_config
                rag_device_for_retriever = current_rag_module_config.get("device", "cpu")

                self.rag_system = StandardCommandRetriever(
                    knowledge_base_path=rag_data_jsonl_path,
                    config=current_rag_module_config, 
                    device=rag_device_for_retriever 
                )
                if self.rag_system.vector_store is None or self.rag_system.embedding_model is None:
                    logger.warning("RAG system internal initialization failed (vector_store or embedding_model is None), RAG functionality will be unavailable.")
                    self.rag_system = None
                else:
                    logger.info("RAG system initialized successfully (based on data.jsonl standard commands).")
            except Exception as e:
                logger.error(f"Failed to initialize RAG system: {e}", exc_info=True)
                self.rag_system = None
        elif rag_data_jsonl_path and not Path(rag_data_jsonl_path).exists():
            logger.warning(f"RAG knowledge base path '{rag_data_jsonl_path}' does not exist. RAG system not initialized.")
        elif rag_embedding_config and not rag_data_jsonl_path:
             logger.warning(f"RAG config provided, but RAG knowledge base path is missing. RAG system not initialized.")
        else:
            logger.info("RAG knowledge base path or RAG config not provided. RAG system not initialized.")

    def _is_direct_nlu_actionable(self, nlu_result: Dict) -> bool:
        action = nlu_result.get("ACTION")
        device_type = nlu_result.get("DEVICE_TYPE")
        parameter = nlu_result.get("PARAMETER")

        if action and device_type: # e.g., "turn_on" "light"
            return True
        # For add/delete, the device name might be in PARAMETER, and DEVICE_TYPE might be generic like "设备" or None
        if action in ["add", "delete"] and isinstance(parameter, str) and parameter: # Parameter is the device name
            return True
        # If action implies a device type (e.g. "close_curtain")
        if action in ["open_curtain", "close_curtain"]:
            return True
            
        return False

    async def understand(self, text: str) -> Dict[str, Any]: # Signature matches NLUInterface
        logger.info(f"Orchestrator received text: '{text}'")
        
        direct_nlu_output = await self.bert_nlu_processor.understand(text)
        logger.debug(f"Direct (BertNLUProcessor) output: {direct_nlu_output}")

        if self._is_direct_nlu_actionable(direct_nlu_output):
            logger.info("Direct NLU result is considered actionable.")
            return direct_nlu_output
        
        logger.info("Direct NLU result insufficient (missing ACTION or DEVICE_TYPE), attempting RAG...")
        if self.rag_system and self.rag_system.vector_store and self.rag_system.embedding_model:
            # Retrieve top 2 similar standard command texts and their original records
            retrieved_commands_with_scores = self.rag_system.retrieve_similar_commands(text, top_k=2)

            if retrieved_commands_with_scores:
                logger.info("RAG retrieved the following top-2 similar standard commands:")
                for idx, (cmd_text, score, record) in enumerate(retrieved_commands_with_scores):
                    logger.info(f"  Top{idx+1}: '{cmd_text}' (Score: {score:.4f})")
                # 然后再选分数最小的那一个做后续处理
                best_tuple = min(retrieved_commands_with_scores, key=lambda x: x[1])
                best_standard_command_text, rag_score, original_rag_kb_record = best_tuple
                logger.info(f"RAG retrieved most similar standard command: '{best_standard_command_text}' (Score: {rag_score:.4f})")

                if rag_score <= self.rag_similarity_threshold: 
                    logger.info(f"RAG result score {rag_score:.4f} <= threshold {self.rag_similarity_threshold}, attempting NLU on this standard command.")
                    
                    # Option 1: Use predefined NLU output if available in the RAG knowledge base
                    if "predefined_nlu_output" in original_rag_kb_record and \
                       isinstance(original_rag_kb_record["predefined_nlu_output"], dict):
                        logger.info("Using RAG's predefined NLU output.")
                        rag_nlu_output = original_rag_kb_record["predefined_nlu_output"].copy()
                        
                        # Merge potentially useful entities from original direct_nlu_output
                        if direct_nlu_output.get("LOCATION") and not rag_nlu_output.get("LOCATION"):
                            rag_nlu_output["LOCATION"] = direct_nlu_output.get("LOCATION")
                        
                        original_direct_id = direct_nlu_output.get("DEVICE_ID", "0")
                        rag_predefined_id = rag_nlu_output.get("DEVICE_ID", "0")
                        if original_direct_id != "0" and (rag_predefined_id == "0" or not rag_predefined_id) :
                            rag_nlu_output["DEVICE_ID"] = original_direct_id
                        
                        # Ensure all 5 fields are present, defaulting if necessary
                        for key_field in ["DEVICE_TYPE", "DEVICE_ID", "LOCATION", "ACTION", "PARAMETER"]:
                            if key_field not in rag_nlu_output:
                                rag_nlu_output[key_field] = None if key_field != "DEVICE_ID" else "0"
                        if rag_nlu_output.get("ACTION") in ["turn_on", "turn_off"] and rag_nlu_output.get("PARAMETER") is None:
                             rag_nlu_output["PARAMETER"] = 0.0


                        return rag_nlu_output

                    # Option 2: Re-run NLU on the standard command text from RAG
                    logger.info(f"Re-running NLU on RAG standard command: '{best_standard_command_text}'")
                    rag_refined_nlu_output = await self.bert_nlu_processor.understand(best_standard_command_text)
                    logger.debug(f"NLU output for RAG's standard command: {rag_refined_nlu_output}")

                    if self._is_direct_nlu_actionable(rag_refined_nlu_output):
                        logger.info("Using RAG-assisted NLU result.")
                        final_output = rag_refined_nlu_output.copy()
                        
                        # Merge entities from the original fuzzy query if RAG's command didn't capture them
                        if direct_nlu_output.get("LOCATION") and not final_output.get("LOCATION"):
                            final_output["LOCATION"] = direct_nlu_output.get("LOCATION")
                        
                        original_direct_id_for_merge = direct_nlu_output.get("DEVICE_ID", "0")
                        rag_refined_id_for_merge = final_output.get("DEVICE_ID", "0")
                        if original_direct_id_for_merge != "0" and \
                           (rag_refined_id_for_merge == "0" or not rag_refined_id_for_merge) :
                            final_output["DEVICE_ID"] = original_direct_id_for_merge
                        
                        # If RAG's standard command was generic (e.g., "turn on the light")
                        # and the original query had a more specific device type captured by direct NLU,
                        # we might prefer the direct NLU's device type if RAG's is too generic or None.
                        if direct_nlu_output.get("DEVICE_TYPE") and not final_output.get("DEVICE_TYPE"):
                             final_output["DEVICE_TYPE"] = direct_nlu_output.get("DEVICE_TYPE")
                        
                        logger.info(f"Merged final NLU result after RAG: {final_output}")
                        return final_output
                    else:
                        logger.warning("RAG-assisted NLU result still insufficient.")
                        return {"error": "Failed to fully parse command even with RAG.", 
                                "original_nlu": direct_nlu_output, 
                                "rag_attempted_command": best_standard_command}
                else:
                    logger.info(f"RAG retrieved score {rag_score:.4f} > threshold {self.rag_similarity_threshold}. RAG result not adopted.")
                    return {"error": "Direct NLU insufficient, RAG match below threshold.", "original_nlu": direct_nlu_output}
            else:
                logger.info("RAG found no similar standard commands.")
                return {"error": "Direct NLU insufficient, RAG found no matches.", "original_nlu": direct_nlu_output}
        else:
            logger.info("Direct NLU insufficient, and RAG system is unavailable.")
            return {"error": "Direct NLU insufficient, RAG system unavailable.", "original_nlu": direct_nlu_output}

# --- 主程序/测试部分 ---
if __name__ == '__main__':
    if not logger.hasHandlers():
        logging.basicConfig(level=logging.DEBUG,
                            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    _current_file_dir_main = Path(__file__).resolve().parent
    _nlu_dir_main = _current_file_dir_main.parent
    
    _fine_tuned_bert_model_path_main = _nlu_dir_main / "model" / "fine_tuned_nlu_bert"
    bert_nlu_config_test = {
        "local_model_target_dir": str(_fine_tuned_bert_model_path_main),
        "model_hub_id": "LIUWJ/fine-tuned-home-bert",
        "device": "cpu" 
    }
    if not _fine_tuned_bert_model_path_main.exists():
        logger.error(f"ERROR: BertNLUProcessor model path '{_fine_tuned_bert_model_path_main}' does not exist. Orchestrator test will fail for BertNLUProcessor.")
        # For testing purposes, we might allow it to continue to test RAG part if BertNLUProcessor init fails gracefully
        # However, BertNLUProcessor in this version raises FileNotFoundError.

    _rag_kb_file_path_main = _nlu_dir_main / "model" / "dataset" / "rag_knowledge.jsonl" # This should be RAG specific
    if not _rag_kb_file_path_main.exists():
        _rag_kb_file_path_main.parent.mkdir(parents=True, exist_ok=True)
        logger.info(f"WARNING: RAG knowledge base file '{_rag_kb_file_path_main}' not found. Creating a dummy one for testing.")
        with open(_rag_kb_file_path_main, 'w', encoding='utf-8') as f:
            json.dump({"user_utterance": "我感觉特别冷", 
                       "predefined_nlu_output": {"DEVICE_TYPE": "空调", "ACTION": "modify", "PARAMETER": "+2.0", "LOCATION": None, "DEVICE_ID": "0"}}, f)
            f.write('\n')
            json.dump({"user_utterance": "这屋里太黑了", 
                       "standard_command_text": "把客厅的灯打开"}, f)
            f.write('\n')
    
    _rag_embedding_model_local_path = _nlu_dir_main / "model" / "shibing624-text2vec-base-chinese/" # Example local storage
    rag_embedding_config_test = {
        "local_embedding_target_dir": str(_rag_embedding_model_local_path),
        "embedding_model_hub_id": "shibing624/text2vec-base-chinese",
        "force_download_embedding": False,
        "device": "cpu"
    }

    async def main_run():
        # Ensure BertNLUProcessor can be initialized
        if not _fine_tuned_bert_model_path_main.exists():
            logger.error("BertNLUProcessor model path does not exist. Cannot run test.")
            return

        orchestrator = SmartHomeNLUOrchestrator(
            bert_nlu_config=bert_nlu_config_test,
            rag_data_jsonl_path=str(_rag_kb_file_path_main),
            rag_embedding_config=rag_embedding_config_test,
            rag_similarity_threshold=300
        )

        test_utterances = [
            "我感觉特别冷",                 # Expect RAG -> predefined output
            "这屋里太黑了，我在书房",     # Expect RAG -> standard_command -> NLU, merge location
            "打开客厅的灯",              # Expect direct NLU
            "空调温度调到二十五度",     # Expect direct NLU
            "关一下卧室的空调",        # Expect direct NLU
            "肘击微波炉" 
        ]

        for utterance in test_utterances:
            logger.info(f"\n>>> 用户输入: {utterance}")
            result = await orchestrator.understand(utterance)
            print(f"Orchestrator 输出: {result}")
            print("-" * 50)

    asyncio.run(main_run())