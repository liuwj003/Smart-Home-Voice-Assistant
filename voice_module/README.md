# 智能家居语音交互模块

* 语音识别
* 自然语言理解，识别用户意图，提取家居实体信息
* 返回对用户语音的文字识别结果与实际设备控制效果
* 语音播报

## 功能特点

- 支持多种语音识别模型：
  - 基于whisper的RealimeSTT
  - Dolphin多种方言识别的语音大模型
- 支持多种语言：
  - 英文
  - 中文（含各种方言），此时用dolphin模型
- 支持基于规则和基于机器学习的自然语言理解
- 支持设备控制、参数设置、天气查询等多种意图识别
- 模块化设计，易于扩展和集成

## 安装依赖

```bash
pip install -r requirements.txt
pip install -U dataoceanai-dolphin
pip install -U whisper
```
* 可能需要先安装Microsoft C++ Build Tools

## 快速开始

### 基本使用



### 支持的语音命令类型

1. 设备控制
   - 开关设备：打开/关闭 [设备名称]
   - 示例：打开客厅灯、关闭卧室空调

2. 参数设置
   - 设置具体值：把 [设备名称] 的 [参数] 调到 [数值]
   - 示例：把客厅空调的温度调到22度

3. 参数调节
   - 相对调节：[设备名称] [参数] [方向]
   - 示例：电视声音大一点、空调温度调低一点

4. 天气查询
   - 查询天气：今天天气怎么样
   - 查询指定城市天气：[城市]天气怎么样

## 模块结构

```

```

## 主要组件

### 语音识别（STT）


### 自然语言理解


## 开发说明

### 代码结构
* 根据新学到的java知识，重新组织了模块化的代码结构，使用函数工厂来管理。
* 使用函数工厂来管理，可以方便的添加新的语音识别模型、自然语言理解模型、设备映射规则等。
### 添加新的意图类型



### 添加新的设备类型

1. 在 `config.py` 中的 `DEVICE_NAME_TO_ID_MAP` 添加新的设备映射
2. 如果需要，添加设备特定的参数和模式定义

### 添加新的语音识别引擎

1. 创建新的STT类，继承 `SpeechToText` 基类
2. 实现 `transcribe` 方法
3. 在 `create_stt_engine` 工厂函数中添加新引擎的支持

## 测试

运行单元测试：


## 示例

查看 `examples` 目录下的示例代码，了解如何使用语音模块：


## 注意事项

1. 使用Whisper引擎需要安装额外的依赖
2. 确保音频输入格式符合要求
3. 对于生产环境，建议使用基于机器学习的NLU实现

## 贡献

Welcome！

## 许可证

MIT License

## Dolphin模型支持的语言
### Language Code

| Language Code | English Name | Chinese Name |
|---------------|--------------------------|------------------------|
| zh            | Mandarin Chinese        | 中文                   |
| ja            | Japanese                | 日语                   |
| th            | Thai                     | 泰语                   |
| ru            | Russian                  | 俄语                   |
| ko            | Korean                   | 韩语                   |
| id            | Indonesian              | 印度尼西亚语           |
| vi            | Vietnamese              | 越南语                 |
| ct            | Yue Chinese             | 粤语                   |
| hi            | Hindi                   | 印地语                 |
| ur            | Urdu                     | 乌尔都语               |
| ms            | Malay                   | 马来语                 |
| uz            | Uzbek                    | 乌兹别克语             |
| ar            | Arabic                   | 阿拉伯语               |
| fa            | Persian                  | 波斯语                 |
| bn            | Bengali                  | 孟加拉语               |
| ta            | Tamil                    | 泰米尔语               |
| te            | Telugu                   | 泰卢固语               |
| ug            | Uighur                   | 维吾尔语               |
| gu            | Gujarati                 | 古吉拉特语             |
| my            | Burmese                  | 缅甸语                 |
| tl            | Tagalog                  | 塔加洛语               |
| kk            | Kazakh                   | 哈萨克语               |
| or            | Oriya / Odia             | 奥里亚语               |
| ne            | Nepali                   | 尼泊尔语               |
| mn            | Mongolian                | 蒙古语                 |
| km            | Khmer                    | 高棉语                 |
| jv            | Javanese                 | 爪哇语                 |
| lo            | Lao                      | 老挝语                 |
| si            | Sinhala                  | 僧伽罗语               |
| fil           | Filipino                 | 菲律宾语               |
| ps            | Pushto                   | 普什图语               |
| pa            | Panjabi                  | 旁遮普语               |
| kab           | Kabyle                   | 卡拜尔语               |
| ba            | Bashkir                  | 巴什基尔语             |
| ks            | Kashmiri                 | 克什米尔语             |
| tg            | Tajik                    | 塔吉克语               |
| su            | Sundanese                | 巽他语                 |
| mr            | Marathi                  | 马拉地语               |
| ky            | Kirghiz                  | 吉尔吉斯语             |
| az            | Azerbaijani              | 阿塞拜疆语             |

### Language Region Code

| Language Region Code      | English Name                     | Chinese Name          |
|--------------------|----------------------------------|-----------------------|
| zh-CN              | Chinese (Mandarin)               | 中文(普通话)          |
| zh-TW              | Chinese (Taiwan)                  | 中文(台湾)            |
| zh-WU              | Chinese (Wuyu)                   | 中文(吴语)            |
| zh-SICHUAN         | Chinese (Sichuan)                | 中文(四川话)          |
| zh-SHANXI          | Chinese (Shanxi)                 | 中文(山西话)          |
| zh-ANHUI           | Chinese (Anhui)                  | 中文(安徽话)          |
| zh-TIANJIN         | Chinese (Tianjin)                | 中文(天津话)          |
| zh-NINGXIA         | Chinese (Ningxia)                | 中文(宁夏话)          |
| zh-SHAANXI         | Chinese (Shaanxi)                 | 中文(陕西话)          |
| zh-HEBEI           | Chinese (Hebei)                  | 中文(河北话)          |
| zh-SHANDONG        | Chinese (Shandong)               | 中文(山东话)          |
| zh-GUANGDONG       | Chinese (Guangdong)              | 中文(广东话)          |
| zh-SHANGHAI        | Chinese (Shanghai)               | 中文(上海话)          |
| zh-HUBEI           | Chinese (Hubei)                  | 中文(湖北话)          |
| zh-LIAONING        | Chinese (Liaoning)               | 中文(辽宁话)          |
| zh-GANSU           | Chinese (Gansu)                  | 中文(甘肃话)          |
| zh-FUJIAN          | Chinese (Fujian)                 | 中文(福建话)          |
| zh-HUNAN           | Chinese (Hunan)                  | 中文(湖南话)          |
| zh-HENAN           | Chinese (Henan)                  | 中文(河南话)          |
| zh-YUNNAN          | Chinese (Yunnan)                 | 中文(云南话)          |
| zh-MINNAN          | Chinese (Minnan)                 | 中文(闽南语)          |
| zh-WENZHOU         | Chinese (Wenzhou)                | 中文(温州话)          |
| ja-JP              | Japanese                         | 日语                  |
| th-TH              | Thai                             | 泰语                  |
| ru-RU              | Russian                          | 俄语                  |
| ko-KR              | Korean                           | 韩语                  |
| id-ID              | Indonesian                       | 印度尼西亚语          |
| vi-VN              | Vietnamese                       | 越南语                |
| ct-NULL            | Yue (Unknown)                    | 粤语(未知)                  |
| ct-HK              | Yue (Hongkong)                   | 粤语(香港)            |
| ct-GZ              | Yue (Guangdong)                  | 粤语(广东)            |
| hi-IN              | Hindi                            | 印地语                |
| ur-IN              | Urdu                             | 乌尔都语(印度)        |
| ur-PK              | Urdu (Islamic Republic of Pakistan) | 乌尔都语              |
| ms-MY              | Malay                            | 马来语                |
| uz-UZ              | Uzbek                            | 乌兹别克语            |
| ar-MA              | Arabic (Morocco)                 | 阿拉伯语(摩洛哥)      |
| ar-GLA             | Arabic                           | 阿拉伯语              |
| ar-SA              | Arabic (Saudi Arabia)            | 阿拉伯语(沙特)        |
| ar-EG              | Arabic (Egypt)                   | 阿拉伯语(埃及)        |
| ar-KW              | Arabic (Kuwait)                  | 阿拉伯语(科威特)      |
| ar-LY              | Arabic (Libya)                   | 阿拉伯语(利比亚)      |
| ar-JO              | Arabic (Jordan)                  | 阿拉伯语(约旦)        |
| ar-AE              | Arabic (U.A.E.)                  | 阿拉伯语(阿联酋)      |
| ar-LVT             | Arabic (Levant)                  | 阿拉伯语(黎凡特)      |
| fa-IR              | Persian                          | 波斯语                |
| bn-BD              | Bengali                          | 孟加拉语              |
| ta-SG              | Tamil (Singaporean)              | 泰米尔语(新加坡)      |
| ta-LK              | Tamil (Sri Lankan)               | 泰米尔语(斯里兰卡)    |
| ta-IN              | Tamil (India)                    | 泰米尔语(印度)        |
| ta-MY              | Tamil (Malaysia)                 | 泰米尔语(马来西亚)    |
| te-IN              | Telugu                           | 泰卢固语              |
| ug-NULL            | Uighur                           | 维吾尔语              |
| ug-CN              | Uighur                           | 维吾尔语              |
| gu-IN              | Gujarati                         | 古吉拉特语            |
| my-MM              | Burmese                          | 缅甸语                |
| tl-PH              | Tagalog                          | 塔加洛语              |
| kk-KZ              | Kazakh                           | 哈萨克语              |
| or-IN              | Oriya / Odia                     | 奥里亚语              |
| ne-NP              | Nepali                           | 尼泊尔语              |
| mn-MN              | Mongolian                        | 蒙古语                |
| km-KH              | Khmer                            | 高棉语                |
| jv-ID              | Javanese                         | 爪哇语                |
| lo-LA              | Lao                              | 老挝语                |
| si-LK              | Sinhala                          | 僧伽罗语              |
| fil-PH             | Filipino                         | 菲律宾语              |
| ps-AF              | Pushto                           | 普什图语              |
| pa-IN              | Panjabi                          | 旁遮普语              |
| kab-NULL           | Kabyle                           | 卡拜尔语              |
| ba-NULL            | Bashkir                          | 巴什基尔语            |
| ks-IN              | Kashmiri                         | 克什米尔语            |
| tg-TJ              | Tajik                            | 塔吉克语              |
| su-ID              | Sundanese                        | 巽他语                |
| mr-IN              | Marathi                          | 马拉地语              |
| ky-KG              | Kirghiz                          | 吉尔吉斯语            |
| az-AZ              | Azerbaijani                      | 阿塞拜疆语            |
