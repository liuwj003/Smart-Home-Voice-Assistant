from voice_module.interfaces.nlp_interface import NaturalLanguageProcessor
from typing import Dict, Any, List, Optional
import torch
import numpy as np

class BertProcessor(NaturalLanguageProcessor):
    """
    A BERT-based natural language processor for home automation commands.
    
    This processor uses a pre-trained BERT model for intent classification 
    and entity extraction from voice commands.
    """
    
    def __init__(self, config: dict = None):
        """
        Initialize the BERT processor with optional configuration.
        
        Args:
            config (dict, optional): Configuration parameters
        """
        super().__init__(config)
        self.config = config or {}
        self.language = self.config.get('language', 'zh')
        self.model_path = self.config.get('model_path', 'models/bert_intent')
        self.device = self.config.get('device', 'cpu')
        
        # Lazily load the model only when needed
        self._model = None
        self._tokenizer = None
        self._intent_labels = None
        self._entity_labels = None
    
    def _load_model(self) -> bool:
        """
        Load the BERT model and tokenizer.
        
        Returns:
            bool: True if loaded successfully, False otherwise
        """
        try:
            # Import here to avoid dependency issues if not using this processor
            from transformers import BertTokenizer, BertForSequenceClassification
            
            # Load tokenizer and model
            self._tokenizer = BertTokenizer.from_pretrained(self.model_path)
            self._model = BertForSequenceClassification.from_pretrained(self.model_path)
            self._model.to(self.device)
            self._model.eval()  # Set to evaluation mode
            
            # Load intent and entity labels (should be stored alongside the model)
            try:
                import json
                import os
                
                with open(os.path.join(self.model_path, 'intent_labels.json'), 'r') as f:
                    self._intent_labels = json.load(f)
                
                with open(os.path.join(self.model_path, 'entity_labels.json'), 'r') as f:
                    self._entity_labels = json.load(f)
            except Exception as e:
                print(f"Error loading labels: {e}")
                # Default labels if files not found
                self._intent_labels = ["unknown", "turn_on", "turn_off", "set_temperature", "set_brightness", "query_status"]
                self._entity_labels = ["O", "B-location", "I-location", "B-device", "I-device", "B-value", "I-value"]
            
            return True
        except Exception as e:
            print(f"Error loading BERT model: {e}")
            return False
    
    def _extract_entities(self, text: str, intent: str) -> Dict[str, Any]:
        """
        Simple rule-based entity extraction as a fallback when NER model is not available.
        
        Args:
            text (str): Input text
            intent (str): Detected intent
            
        Returns:
            Dict: Extracted entities
        """
        # For demo purposes, this is a simplified version
        # In a real implementation, we would use a dedicated NER model or more sophisticated rules
        entities = {}
        
        if intent in ["turn_on", "turn_off"]:
            # Simple pattern matching for device names
            device_keywords = {
                "\u706f": "light",  # 灯
                "\u7535\u89c6": "tv",  # 电视
                "\u7a7a\u8c03": "ac",  # 空调
                "\u98ce\u6247": "fan",  # 风扇
                "\u52a0\u6e7f\u5668": "humidifier"  # 加湿器
            }
            
            for keyword, device_type in device_keywords.items():
                if keyword in text:
                    entities["device_type"] = device_type
                    # Try to extract location
                    parts = text.split(keyword)
                    if parts[0].strip():
                        entities["location"] = parts[0].replace("\u6253\u5f00", "").replace("\u5173\u95ed", "").strip()
                    break
        
        elif intent == "set_temperature":
            # Extract temperature value
            import re
            match = re.search(r"(\d+)\u5ea6", text)  # look for numbers followed by 度
            if match:
                entities["value"] = int(match.group(1))
        
        elif intent == "set_brightness":
            # Extract brightness value
            import re
            match = re.search(r"(\d+)(?:\u767e\u5206\u4e4b)?", text)  # look for numbers optionally followed by 百分之
            if match:
                entities["value"] = int(match.group(1))
        
        return entities
    
    def process(self, text: str) -> Dict[str, Any]:
        """
        Process the input text to extract intents and entities using BERT.
        
        Args:
            text (str): The input text to process
            
        Returns:
            Dict[str, Any]: The extracted intent and entities
        """
        # Initialize with default values
        result = {
            'intent': 'unknown',
            'entities': {},
            'confidence': 0.0,
            'text': text
        }
        
        # Check if model is loaded, try to load if not
        if self._model is None:
            if not self._load_model():
                # If model loading fails, fall back to rule-based extraction
                from voice_module.nlp.processors.rule_based import RuleBasedProcessor
                fallback = RuleBasedProcessor({"language": self.language})
                return fallback.process(text)
        
        try:
            # Tokenize the input text
            inputs = self._tokenizer(text, return_tensors="pt", padding=True, truncation=True).to(self.device)
            
            # Get intent prediction
            with torch.no_grad():
                outputs = self._model(**inputs)
                logits = outputs.logits
                probabilities = torch.nn.functional.softmax(logits, dim=1)
                confidence, predicted_class = torch.max(probabilities, dim=1)
                
                intent_idx = predicted_class.item()
                intent = self._intent_labels[intent_idx] if intent_idx < len(self._intent_labels) else "unknown"
                confidence_val = confidence.item()
            
            # Extract entities (simplified approach for demo)
            entities = self._extract_entities(text, intent)
            
            # Update result
            result['intent'] = intent
            result['entities'] = entities
            result['confidence'] = confidence_val
        
        except Exception as e:
            print(f"Error in BERT processing: {e}")
            # Fall back to rule-based processing on error
            from voice_module.nlp.processors.rule_based import RuleBasedProcessor
            fallback = RuleBasedProcessor({"language": self.language})
            return fallback.process(text)
        
        return result
    
    def available(self) -> bool:
        """
        Check if the BERT processor is available by testing if dependencies are installed.
        
        Returns:
            bool: True if available, False otherwise
        """
        try:
            import torch
            import transformers
            return True
        except ImportError:
            return False 