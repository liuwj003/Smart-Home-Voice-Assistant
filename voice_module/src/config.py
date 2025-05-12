from typing import Dict, List, Set

# 意图类型
class Intent:
    DEVICE_CONTROL = "DEVICE_CONTROL"
    SET_PARAMETER = "SET_PARAMETER"
    ADJUST_PARAMETER = "ADJUST_PARAMETER"
    QUERY_WEATHER = "QUERY_WEATHER"
    UNKNOWN = "UNKNOWN"

# 设备ID映射表
DEVICE_NAME_TO_ID_MAP: Dict[str, str] = {
    # 灯
    "客厅灯": "living_room_light",
    "客厅的灯": "living_room_light",
    "卧室灯": "bedroom_light",
    "卧室的灯": "bedroom_light",
    "厨房灯": "kitchen_light",
    "厨房的灯": "kitchen_light",
    "灯": "living_room_light",  # 默认灯
    
    # 空调
    "客厅空调": "living_room_ac",
    "客厅的空调": "living_room_ac",
    "卧室空调": "bedroom_ac",
    "卧室的空调": "bedroom_ac",
    "空调": "living_room_ac",  # 默认空调
    
    # 电视
    "客厅电视": "living_room_tv",
    "客厅的电视": "living_room_tv",
    "电视": "living_room_tv",  # 默认电视
    
    # 窗帘
    "客厅窗帘": "living_room_curtains",
    "客厅的窗帘": "living_room_curtains",
    "窗帘": "living_room_curtains",  # 默认窗帘
    
    # 空气净化器
    "卧室空气净化器": "bedroom_air_purifier",
    "卧室的空气净化器": "bedroom_air_purifier",
    "空气净化器": "bedroom_air_purifier",  # 默认空气净化器
    
    # 扫地机器人
    "扫地机器人": "robot_vacuum",
    "扫地机": "robot_vacuum",
    "机器人": "robot_vacuum"
}

# 动作关键词映射
ACTION_KEYWORDS: Dict[str, List[str]] = {
    "TURN_ON": ["打开", "开启", "开一下", "启动"],
    "TURN_OFF": ["关闭", "关掉", "关一下", "停止"],
    "TOGGLE": ["切换", "切换开关"],
    "OPEN": ["拉开", "打开", "开启"],
    "CLOSE": ["拉上", "关闭", "关掉"],
    "START_CLEANING": ["开始扫地", "启动清扫", "扫地"],
    "RETURN_TO_DOCK": ["回充", "回去充电", "充电"],
    "PAUSE_CLEANING": ["暂停", "暂停清扫", "停止清扫"],
    "RESUME_CLEANING": ["继续", "继续清扫", "恢复清扫"]
}

# 参数关键词映射
PARAMETER_KEYWORDS: Dict[str, List[str]] = {
    "temperature": ["温度", "度"],
    "brightness": ["亮度", "光"],
    "volume": ["音量", "声音"],
    "channel": ["频道", "台"],
    "mode": ["模式"],
    "fan_speed": ["风速", "风量"],
    "position": ["位置", "开到百分之", "拉到百分之"]
}

# 模式值映射
MODE_VALUES: Dict[str, List[str]] = {
    "cool": ["制冷", "冷气", "制冷模式"],
    "heat": ["制热", "暖气", "制热模式"],
    "fan_only": ["送风", "风扇", "送风模式"],
    "auto": ["自动", "自动模式"],
    "manual": ["手动", "手动模式"],
    "sleep": ["睡眠", "睡眠模式"]
}

# 风速值映射
FAN_SPEED_VALUES: Dict[str, List[str]] = {
    "low": ["低风", "低速", "低档"],
    "medium": ["中风", "中速", "中档"],
    "high": ["高风", "高速", "高档"],
    "auto": ["自动", "自动风速"]
}

# 天气关键词
WEATHER_KEYWORDS: List[str] = [
    "天气", "怎么样", "今天天气", "现在天气",
    "温度", "下雨", "下雪", "阴天", "晴天"
]

# 城市列表
SUPPORTED_CITIES: Set[str] = {
    "北京", "上海", "广州", "深圳",
    "杭州", "南京", "成都", "武汉",
    "西安", "重庆", "天津", "苏州"
}

# 相对调节关键词
ADJUSTMENT_KEYWORDS: Dict[str, List[str]] = {
    "UP": ["大", "高", "增加", "调高", "调大", "升高", "提高"],
    "DOWN": ["小", "低", "减少", "调低", "调小", "降低", "降低"]
}

# 数字提取模式
NUMBER_PATTERNS = [
    r"(\d+)度",  # 温度
    r"(\d+)档",  # 档位
    r"(\d+)级",  # 级别
    r"(\d+)台",  # 频道
    r"(\d+)%",   # 百分比
    r"百分之(\d+)",  # 中文百分比
    r"(\d+)分",  # 分数
    r"(\d+)成",  # 成数
    r"一半",     # 特殊值
    r"(\d+)"     # 纯数字
]

# 特殊值映射
SPECIAL_VALUES = {
    "一半": 50,
    "一成": 10,
    "两成": 20,
    "三成": 30,
    "四成": 40,
    "五成": 50,
    "六成": 60,
    "七成": 70,
    "八成": 80,
    "九成": 90,
    "十成": 100
} 