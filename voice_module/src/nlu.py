from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List, Tuple, Union
import json
import re
from dataclasses import dataclass
import langdetect
from langdetect import DetectorFactory
import jieba
import jieba.posseg as pseg
from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
import torch
from .base import NLUProcessor
from .config import (
    Intent, DEVICE_NAME_TO_ID_MAP, ACTION_KEYWORDS,
    PARAMETER_KEYWORDS, WEATHER_KEYWORDS, ADJUSTMENT_KEYWORDS
)
from .utils import (
    normalize_text, extract_device_info, extract_parameter_info,
    extract_number, extract_mode, extract_fan_speed,
    extract_city, extract_adjustment_direction,
    validate_command
)

# 设置语言检测的种子以确保结果一致性
DetectorFactory.seed = 0

@dataclass
class Intent:
    """意图数据类"""
    name: str
    confidence: float
    language: str
    entities: Dict[str, Any]
    raw_text: str

class LanguageDetector:
    """语言检测器"""
    
    def __init__(self, supported_languages: List[str] = None):
        """
        初始化语言检测器
        
        Args:
            supported_languages: 支持的语言列表，如果为None则使用所有支持的语言
        """
        self.supported_languages = supported_languages or ['zh-cn', 'zh-tw', 'en', 'ja', 'ko']
    
    def detect(self, text: str) -> str:
        """
        检测文本语言
        
        Args:
            text: 输入文本
            
        Returns:
            str: 检测到的语言代码
        """
        try:
            lang = langdetect.detect(text)
            # 将检测结果映射到支持的语言
            if lang.startswith('zh'):
                # 使用简单的启发式方法区分简体中文和繁体中文
                if any(char in text for char in '臺灣國'):
                    return 'zh-tw'
                return 'zh-cn'
            return lang
        except:
            return 'zh-cn'  # 默认返回简体中文

class BaseNLU(ABC):
    """自然语言理解的抽象基类"""
    
    def __init__(self, language: str = 'zh-cn'):
        """
        初始化NLU引擎
        
        Args:
            language: 默认语言
        """
        self.language = language
        self.language_detector = LanguageDetector()
    
    @abstractmethod
    def understand(self, text: str, **kwargs) -> Intent:
        """
        理解输入文本
        
        Args:
            text: 输入文本
            **kwargs: 其他参数
            
        Returns:
            Intent: 识别出的意图
        """
        pass
    
    def detect_language(self, text: str) -> str:
        """
        检测文本语言
        
        Args:
            text: 输入文本
            
        Returns:
            str: 检测到的语言代码
        """
        return self.language_detector.detect(text)

class RuleBasedNLU(BaseNLU):
    """基于规则的NLU实现"""
    
    def __init__(self, language: str = 'zh-cn', rules_file: str = None):
        """
        初始化基于规则的NLU
        
        Args:
            language: 默认语言
            rules_file: 规则文件路径
        """
        super().__init__(language)
        self.rules = self._load_rules(rules_file) if rules_file else {}
        self._load_language_specific_rules()
    
    def _load_rules(self, rules_file: str) -> Dict:
        """加载规则文件"""
        try:
            with open(rules_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    
    def _load_language_specific_rules(self):
        """加载语言特定的规则"""
        # 为不同语言加载特定的分词器和规则
        if self.language.startswith('zh'):
            # 加载中文特定的词典
            jieba.load_userdict('voice_module/data/dict/zh_dict.txt')
        # 可以在这里添加其他语言的支持
    
    def understand(self, text: str, **kwargs) -> Intent:
        """理解输入文本"""
        # 检测语言
        detected_lang = self.detect_language(text)
        
        # 获取对应语言的规则
        lang_rules = self.rules.get(detected_lang, {})
        
        # 对文本进行预处理
        processed_text = self._preprocess_text(text, detected_lang)
        
        # 匹配意图
        intent_name, confidence, entities = self._match_intent(processed_text, lang_rules)
        
        return Intent(
            name=intent_name,
            confidence=confidence,
            language=detected_lang,
            entities=entities,
            raw_text=text
        )
    
    def _preprocess_text(self, text: str, language: str) -> str:
        """预处理文本"""
        if language.startswith('zh'):
            # 中文分词
            words = jieba.cut(text)
            return ' '.join(words)
        return text.lower()
    
    def _match_intent(self, text: str, rules: Dict) -> Tuple[str, float, Dict]:
        """匹配意图"""
        best_match = None
        best_confidence = 0.0
        best_entities = {}
        
        for intent, patterns in rules.items():
            for pattern in patterns:
                match = re.search(pattern['regex'], text)
                if match:
                    confidence = pattern.get('confidence', 0.8)
                    if confidence > best_confidence:
                        best_match = intent
                        best_confidence = confidence
                        best_entities = self._extract_entities(text, pattern.get('entities', {}))
        
        return best_match or 'unknown', best_confidence, best_entities
    
    def _extract_entities(self, text: str, entity_patterns: Dict) -> Dict:
        """提取实体"""
        entities = {}
        for entity_name, pattern in entity_patterns.items():
            match = re.search(pattern, text)
            if match:
                entities[entity_name] = match.group(1)
        return entities

class TransformerNLU(BaseNLU):
    """基于Transformer的NLU实现"""
    
    def __init__(self, language: str = 'zh-cn', model_name: str = None):
        """
        初始化基于Transformer的NLU
        
        Args:
            language: 默认语言
            model_name: 模型名称，如果为None则使用默认模型
        """
        super().__init__(language)
        self.model_name = model_name or self._get_default_model(language)
        self._load_model()
    
    def _get_default_model(self, language: str) -> str:
        """获取默认模型名称"""
        models = {
            'zh-cn': 'bert-base-chinese',
            'zh-tw': 'bert-base-chinese',
            'en': 'bert-base-uncased',
            'ja': 'cl-tohoku/bert-base-japanese',
            'ko': 'klue/bert-base'
        }
        return models.get(language, 'bert-base-multilingual-cased')
    
    def _load_model(self):
        """加载模型"""
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
            self.classifier = pipeline(
                "text-classification",
                model=self.model,
                tokenizer=self.tokenizer
            )
        except Exception as e:
            print(f"Error loading model: {e}")
            # 如果模型加载失败，回退到基于规则的实现
            self.classifier = None
    
    def understand(self, text: str, **kwargs) -> Intent:
        """理解输入文本"""
        # 检测语言
        detected_lang = self.detect_language(text)
        
        if self.classifier is None:
            # 如果模型未加载，使用基于规则的实现
            rule_based = RuleBasedNLU(detected_lang)
            return rule_based.understand(text)
        
        # 使用Transformer模型进行分类
        try:
            result = self.classifier(text)[0]
            intent_name = result['label']
            confidence = result['score']
            
            # 提取实体（这里可以集成NER模型）
            entities = self._extract_entities(text)
            
            return Intent(
                name=intent_name,
                confidence=confidence,
                language=detected_lang,
                entities=entities,
                raw_text=text
            )
        except Exception as e:
            print(f"Error in transformer-based understanding: {e}")
            # 发生错误时回退到基于规则的实现
            rule_based = RuleBasedNLU(detected_lang)
            return rule_based.understand(text)
    
    def _extract_entities(self, text: str) -> Dict:
        """提取实体（可以集成NER模型）"""
        # 这里可以添加实体识别逻辑
        return {}

def create_nlu_engine(engine_type: str = "rule", **kwargs) -> BaseNLU:
    """
    工厂函数，创建NLU引擎
    
    Args:
        engine_type: 引擎类型，可选值："rule", "transformer"
        **kwargs: 传递给具体实现的参数
        
    Returns:
        BaseNLU: NLU引擎实例
    """
    if engine_type == "rule":
        return RuleBasedNLU(**kwargs)
    elif engine_type == "transformer":
        return TransformerNLU(**kwargs)
    else:
        raise ValueError(f"Unsupported NLU engine type: {engine_type}") 