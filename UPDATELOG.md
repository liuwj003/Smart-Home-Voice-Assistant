# UPDATELOG

## 6.18 (Version 1)
* 添加deepseek，更智能的服务。

* 实时分工调整在`docs/member_summary.md`下记录
* 可以把整个项目克隆下来，然后`run.bat`试试效果。

## 5.25 (Version 0)
* 完善了nlp_service的README文档，添加了简单可用的测试界面
* 使用zhconv解决whisper会识别成繁体中文的问题，把繁体中文转换成简体中文。
* 添加、修改了前后端目前框架的README
* 前端能播放语音反馈
* 测试了dolphin引擎，在中文方言上效果比whisper更好。
* 但dolphin会比whisper慢一点。dolphin会在本地目录nlp_service/data/models把stt模型下载下来，有1G+

## 5.20 (Version 0)

* Apple-Style

<img src="imgs/Apple-Style-v0.png" alt="alt text" width="100%"/>
<img src="imgs/Apple-Style-v0.1.png" alt="alt text" width="100%"/>

## 5.18 （Version 0）

* 目前已完成的：
### 便于理解的版本
* **如果想尝试当前效果，按照readme里的说明，然后run.bat，就可以文本输入，或者说话，就可以看见对你的语音或文字的理解效果，nlp_service的命令窗口有更详细的调试信息**。
<img src="imgs/v0_1.png" alt="alt text" width="100%"/>
<img src="imgs/rag_test_v0.png" alt="alt text" width="90%"/>
<img src="imgs/v0.png" alt="alt text" width="90%"/>

* 有一个还不错的前端界面，包括网页，和“手机端”，能调节设置
* 后端只有框架，设备的绑定、能被用户调整正在施工。
* 语音服务：目前能实现“客厅太冷了”或者“客厅空调调高2度”都被返回`{空调、0、客厅、modify、2}`给后端的效果，以供后端施加效果到设备上。
* 用户想文字输入还是语音输入都可以
* 用户想不想要语音反馈都可以
* dolphin引擎会带来奇怪的环境冲突，但目前好像没带来什么后续问题，因为需要安装espnet=202402，但这个要求的`importlib-metadata<5.0`，会与`opentelemetry-api 1.33.1`的`importlib-metadata>=6.0,<7.0`冲突。

* 会返回语音反馈音频文件，但还没有实现音频的播放

### 尝试TO DO：
* 用docker部署试试
* 云服务器
* 部署到一个.io网站上

### 从更深层次解释
#### NLP服务
* **STT**（speech_to_text）：能接受语音输入，使用whisper引擎进行 **语音转文本** 的功能，**还不错，后续考虑指定转录语言，或者用opencc库将识别结果转成简体中文**，需要添加一些音频文件来测试
* 暂时打算：
  - 建议中文用户用dolphin引擎（考虑到更多的中文方言支持）
* **NLU**（natural_language_understanding）：能**接受文本输入**，然后用一个被100多条**家居场景数据**微调过后的中文BERT模型进行意图识别，然后返回**识别出来的五个字段**（家居类型，家居编号（用户说的，比如客厅里的第2个灯的"2"），地点，动作，动作参数）
  - **用户可选**：用户认为自己说的话比较标准，能说出“客厅空调调高2度”这种，就用用fine-tuned-bert-processor就好
  - 用户想更智能，用nlu_orchestrator。
* **5.18新增**：
  - 为了能实现“我太冷了”这样不带任何动作、家居的语句都被映射成实际操作的效果，加入**RAG知识库检索**，RAG知识库见`nlp_service/nlu/model/dataset/rag_knowledge.jsonl`，**正在构建中**（要比微调数据集更规范一点）。
  - 实现逻辑是，如果直接用**微调BERT+后处理**仍然未能提取用户的任何**动作**或者任何**家居类型**（只要少一个，就认为没有理解到），就去RAG知识库检索，这个时候，“我太冷了”会检索出和它最像的语句“空调调高2度”
  - 用来微调的数据集（在`nlp_service/nlu/model/dataset/`）还行，可以改后几十条；微调模型的代码在`nlp_service/nlu/model/train/`目录下
  - 这个微调好的模型参数（放在`nlp_service/nlu/model/fine_tuned_nlu_bert/`目录下）由于有几百MB，**放在hugging face上LIUWJ/fine-tuned-home-bert**，这样用户第一次使用时就能从hugging face上下载这个模型，代码里写好了这部分的下载逻辑。

* **TTS**（text_to_speech）：能接受文本输入，返回语音（女声男声可选），用pyttsx3。
* 除了NLU模块是必要的，STT和TTS模块都是可选的，**用户可以选择不使用这两个模块（直接文本输入，不需要语音转文本的STT模块；不需要语音播报反馈，就不需要TTS模块）**

#### 前端
* 目前有一个大的网页界面，网页界面里可以看到手机端视图
<img src="imgs/frontend_v1.png" alt="alt text" width="90%"/>
<img src="imgs/phonepage_v0.1.png" alt="alt text" width="90%"/>

* 但是，手机端只有这1个界面，还缺乏：
  - 手机端的设置界面
  - 适合老年人的大字设计界面
  - ...
* 大的网页界面也只有一些基本的组件，还需要后续设计与完善

## 5.19 (Version 0.1)
* 能保证设置的修改被保存，并及时更改后台 语音服务处理的引擎。

<img src="imgs/frontend_v0.1.png" alt="alt text" width="100%"/>
<img src="imgs/frontend_v0.1_1.png" alt="alt text" width="100%"/>
<img src="imgs/frontend_v0.1_2.png" alt="alt text" width="100%"/>

## 5.14-5.16 
* 重新梳理了语音服务逻辑，修改为nlp_service模块，tts与stt都应是可选的 
目前的效果：
<img src="imgs/image_10.png" alt="alt text" width="50%"/>
<img src="imgs/image_11.png" alt="alt text" width="50%"/>
能成功保存设置了：
<img src="imgs/image_save_setting.png" alt="alt text" width="50%"/>
进一步确认了前后端的服务调用、连接，确保能调用提供的nlp_service：
<img src="imgs/main_page_test.png" alt="alt text" width="80%"/>
<img src="imgs/phone_page_text_test.png" alt="alt text" width="80%"/>
<img src="imgs/phone_page_voice_test.png" alt="alt text" width="80%"/>
微调了一个BERT-chinese，然后用微调好的模型实现了基本的NLU：
<img src="imgs/bert_zh_v1.png" alt="alt text" width="90%"/>

---

## 5.13
把后端重构成了spring-boot框架，实现正常的前后端连接，有了一个手机端视图，更好看了一点。

![alt text](imgs/image_3.png)
* 点击 移动视图，可以看到暂时的APP结果：
<img src="imgs/image_4.png" alt="alt text" width="50%"/>
<img src="imgs/image_5.png" alt="alt text" width="50%"/>

---
## 5.12
* 实现了基本的前后端连接、语音输入 
<img src="imgs/image_1.png" alt="alt text" width="50%"/>
<img src="imgs/image_2.png" alt="alt text" width="50%"/>
```


