from voice_module.interfaces.nlp_interface import NaturalLanguageProcessor
from typing import Dict, Any

# Import processors 
from voice_module.nlp.processors.rule_based import RuleBasedProcessor
from voice_module.nlp.processors.bert_processor import BertProcessor

# Registry of NLP processors
NLP_PROCESSOR_REGISTRY = {
    "rule_based": RuleBasedProcessor,
    "bert": BertProcessor
}

def create_nlp_processor(processor_type: str, config: dict = None) -> NaturalLanguageProcessor:
    """
    Factory function to create a Natural Language Processor.
    
    Args:
        processor_type (str): Type of NLP processor to create ("rule_based", "bert", etc.)
        config (dict): Configuration for the processor
        
    Returns:
        NaturalLanguageProcessor: An instance of the requested NLP processor
        
    Raises:
        ValueError: If the processor type is not found or cannot be created
    """
    if processor_type not in NLP_PROCESSOR_REGISTRY:
        raise ValueError(f"Unknown NLP processor type: {processor_type}")
    
    try:
        # Get processor-specific config if available
        processor_config = config.get("nlp_processors", {}).get(processor_type, {}) if config else {}
        # Merge with base config
        merged_config = {**config, **processor_config} if config else processor_config
        
        # Create the processor instance
        processor_class = NLP_PROCESSOR_REGISTRY[processor_type]
        return processor_class(merged_config)
    except Exception as e:
        raise ValueError(f"Failed to create NLP processor of type {processor_type}: {str(e)}")
