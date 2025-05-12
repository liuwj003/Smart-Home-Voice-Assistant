import re
from typing import Optional, Tuple, List, Dict, Any
from .config import (
    NUMBER_PATTERNS, SPECIAL_VALUES,
    MODE_VALUES, FAN_SPEED_VALUES,
    SUPPORTED_CITIES
)

def extract_number(text: str) -> Optional[int]:
    """
    从文本中提取数字
    
    Args:
        text: 输入文本
        
    Returns:
        Optional[int]: 提取到的数字，如果没有找到则返回None
    """
    # 检查特殊值
    for special_value, number in SPECIAL_VALUES.items():
        if special_value in text:
            return number
    
    # 使用正则表达式匹配数字
    for pattern in NUMBER_PATTERNS:
        match = re.search(pattern, text)
        if match:
            try:
                return int(match.group(1))
            except (IndexError, ValueError):
                continue
    
    return None

def extract_mode(text: str) -> Optional[str]:
    """
    从文本中提取模式值
    
    Args:
        text: 输入文本
        
    Returns:
        Optional[str]: 提取到的模式值，如果没有找到则返回None
    """
    for mode, keywords in MODE_VALUES.items():
        if any(keyword in text for keyword in keywords):
            return mode
    return None

def extract_fan_speed(text: str) -> Optional[str]:
    """
    从文本中提取风速值
    
    Args:
        text: 输入文本
        
    Returns:
        Optional[str]: 提取到的风速值，如果没有找到则返回None
    """
    for speed, keywords in FAN_SPEED_VALUES.items():
        if any(keyword in text for keyword in keywords):
            return speed
    return None

def extract_city(text: str) -> Optional[str]:
    """
    从文本中提取城市名称
    
    Args:
        text: 输入文本
        
    Returns:
        Optional[str]: 提取到的城市名称，如果没有找到则返回None
    """
    for city in SUPPORTED_CITIES:
        if city in text:
            return city
    return None

def normalize_text(text: str) -> str:
    """
    标准化文本，去除多余空格，统一标点符号等
    
    Args:
        text: 输入文本
        
    Returns:
        str: 标准化后的文本
    """
    # 去除首尾空格
    text = text.strip()
    
    # 统一标点符号
    text = text.replace('，', ',').replace('。', '.')
    
    # 去除多余空格
    text = re.sub(r'\s+', ' ', text)
    
    return text

def extract_device_info(text: str, device_map: Dict[str, str]) -> Tuple[Optional[str], Optional[str]]:
    """
    从文本中提取设备信息
    
    Args:
        text: 输入文本
        device_map: 设备名称到ID的映射
        
    Returns:
        Tuple[Optional[str], Optional[str]]: (设备ID, 设备名称)
    """
    for device_name, device_id in device_map.items():
        if device_name in text:
            return device_id, device_name
    return None, None

def extract_parameter_info(text: str, parameter_keywords: Dict[str, List[str]]) -> Optional[str]:
    """
    从文本中提取参数信息
    
    Args:
        text: 输入文本
        parameter_keywords: 参数关键词映射
        
    Returns:
        Optional[str]: 提取到的参数名，如果没有找到则返回None
    """
    for param, keywords in parameter_keywords.items():
        if any(keyword in text for keyword in keywords):
            return param
    return None

def extract_adjustment_direction(text: str, adjustment_keywords: Dict[str, List[str]]) -> Optional[str]:
    """
    从文本中提取调节方向
    
    Args:
        text: 输入文本
        adjustment_keywords: 调节方向关键词映射
        
    Returns:
        Optional[str]: 提取到的调节方向（"UP"或"DOWN"），如果没有找到则返回None
    """
    for direction, keywords in adjustment_keywords.items():
        if any(keyword in text for keyword in keywords):
            return direction
    return None

def validate_command(command: Dict[str, Any]) -> bool:
    """
    验证命令的完整性和有效性
    
    Args:
        command: 命令字典
        
    Returns:
        bool: 命令是否有效
    """
    required_fields = {'intent', 'entities'}
    if not all(field in command for field in required_fields):
        return False
    
    intent = command['intent']
    entities = command['entities']
    
    # 根据意图验证必要的实体
    if intent == 'DEVICE_CONTROL':
        return 'device_id' in entities and 'action' in entities
    elif intent == 'SET_PARAMETER':
        return all(key in entities for key in ['device_id', 'parameter', 'value'])
    elif intent == 'ADJUST_PARAMETER':
        return all(key in entities for key in ['device_id', 'parameter', 'direction'])
    elif intent == 'QUERY_WEATHER':
        return True  # 城市是可选的
    elif intent == 'UNKNOWN':
        return True
    
    return False 