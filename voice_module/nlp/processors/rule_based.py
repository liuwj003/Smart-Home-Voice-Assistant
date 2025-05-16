from voice_module.interfaces.nlp_interface import NaturalLanguageProcessor
from typing import Dict, Any
import re

class RuleBasedProcessor(NaturalLanguageProcessor):
    """
    A simple rule-based natural language processor for home automation commands.
    This is a basic implementation for testing purposes.
    """
    
    def __init__(self, config: dict = None):
        """
        Initialize the processor with optional configuration.
        
        Args:
            config (dict, optional): Configuration parameters
        """
        super().__init__(config)
        self.language = config.get('language', 'zh') if config else 'zh'
        
        # Define command patterns based on language
        self.patterns = self._get_patterns_for_language(self.language)
    
    def _get_patterns_for_language(self, language: str) -> Dict[str, Dict[str, Any]]:
        """
        Get command patterns for the specified language.
        
        Args:
            language (str): Language code (e.g., 'zh', 'en')
            
        Returns:
            Dict: Dictionary of patterns for different commands
        """
        if language == 'zh':
            return {
                'turn_on': {
                    'pattern': r'\u6253\u5f00(.*?)(?:\u7684)?(\u706f|\u7535\u89c6|\u7a7a\u8c03|\u98ce\u6247|\u52a0\u6e7f\u5668)?',
                    'intent': 'turn_on',
                    'extract_groups': [1, 2]
                },
                'turn_off': {
                    'pattern': r'\u5173\u95ed(.*?)(?:\u7684)?(\u706f|\u7535\u89c6|\u7a7a\u8c03|\u98ce\u6247|\u52a0\u6e7f\u5668)?',
                    'intent': 'turn_off',
                    'extract_groups': [1, 2]
                },
                'set_temperature': {
                    'pattern': r'\u628a(.*?)(?:\u7684)?\u6e29\u5ea6\u8c03\u5230(\d+)\u5ea6',
                    'intent': 'set_temperature',
                    'extract_groups': [1, 2]
                },
                'set_brightness': {
                    'pattern': r'\u628a(.*?)(?:\u7684)?\u4eae\u5ea6\u8c03\u5230(\d+)(?:\u767e\u5206\u4e4b)?',
                    'intent': 'set_brightness',
                    'extract_groups': [1, 2]
                },
                'query_status': {
                    'pattern': r'(.*?)(?:\u7684)?\u72b6\u6001\u662f\u4ec0\u4e48',
                    'intent': 'query_status',
                    'extract_groups': [1]
                }
            }
        elif language == 'en':
            return {
                'turn_on': {
                    'pattern': r'turn on(?: the)? (.*?)(?:\s+(light|tv|ac|fan|humidifier))?',
                    'intent': 'turn_on',
                    'extract_groups': [1, 2]
                },
                'turn_off': {
                    'pattern': r'turn off(?: the)? (.*?)(?:\s+(light|tv|ac|fan|humidifier))?',
                    'intent': 'turn_off',
                    'extract_groups': [1, 2]
                },
                'set_temperature': {
                    'pattern': r'set(?: the)? (.*?) temperature to (\d+)(?:\s+degrees)?',
                    'intent': 'set_temperature',
                    'extract_groups': [1, 2]
                },
                'set_brightness': {
                    'pattern': r'set(?: the)? (.*?) brightness to (\d+)(?:\s+percent)?',
                    'intent': 'set_brightness',
                    'extract_groups': [1, 2]
                },
                'query_status': {
                    'pattern': r"what(?:\s+is|'s) the status of(?: the)? (.*)",
                    'intent': 'query_status',
                    'extract_groups': [1]
                }
            }
        else:
            # Default to English patterns if language not supported
            return self._get_patterns_for_language('en')
    
    def process(self, text: str) -> Dict[str, Any]:
        """
        Process the input text to extract intents and entities.
        
        Args:
            text (str): The input text to process
            
        Returns:
            Dict[str, Any]: The extracted intent and entities
        """
        # Initialize response with default values
        result = {
            'intent': 'unknown',
            'entities': {},
            'confidence': 0.0,
            'text': text
        }
        
        # Check the text against each pattern
        for intent_name, intent_data in self.patterns.items():
            pattern = intent_data['pattern']
            match = re.search(pattern, text, re.IGNORECASE)
            
            if match:
                # Extract entity information
                entities = {}
                extract_groups = intent_data.get('extract_groups', [])
                
                # First group is usually the location/device name
                if len(extract_groups) > 0 and extract_groups[0] <= len(match.groups()):
                    location_or_device = match.group(extract_groups[0]).strip()
                    if location_or_device:
                        entities['location'] = location_or_device
                
                # Second group might be device type or value
                if len(extract_groups) > 1 and extract_groups[1] <= len(match.groups()):
                    value = match.group(extract_groups[1])
                    if value:
                        if intent_name in ['set_temperature', 'set_brightness']:
                            entities['value'] = int(value)
                        else:
                            entities['device_type'] = value
                
                # Update the result
                result['intent'] = intent_data['intent']
                result['entities'] = entities
                result['confidence'] = 0.9  # Simple rule-based matching has high confidence when matched
                break
        
        return result
    
    def available(self) -> bool:
        """
        Check if the processor is available.
        
        Returns:
            bool: Always True for rule-based processor as it has no external dependencies
        """
        return True 