import pandas as pd
import numpy as np
import torch
from datasets import Dataset, DatasetDict
from transformers import (
    AutoTokenizer,
    AutoModelForTokenClassification,
    TrainingArguments,
    Trainer,
    DataCollatorForTokenClassification
)
from seqeval.metrics import f1_score, precision_score, recall_score
import logging
from pathlib import Path

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- 1. 定义常量和配置 ---
MODEL_NAME = "hfl/chinese-bert-wwm-ext"  # 预训练BERT模型
MAX_SEQ_LENGTH = 128                     # 最大序列长度

# --- 路径配置 ---
# SCRIPT_PATH 指向当前脚本 (train_nlu_model.py)
SCRIPT_PATH = Path(__file__).resolve()
# TRAIN_DIR 指向 .../nlu/model/train/
TRAIN_DIR = SCRIPT_PATH.parent
# MODEL_DIR 指向 .../nlu/model/
MODEL_DIR = TRAIN_DIR.parent
# DATASET_DIR 指向 .../nlu/model/dataset/
DATASET_DIR = MODEL_DIR / "dataset"
# DATA_FILE_PATH 指向 .../nlu/model/dataset/data.jsonl
DATA_FILE_PATH = DATASET_DIR / "data.jsonl"
# OUTPUT_MODEL_DIR 指向 .../nlu/model/fine_tuned_nlu_bert/
OUTPUT_MODEL_DIR = MODEL_DIR / "fine_tuned_nlu_bert"


# 定义词槽标签列表 (必须与数据标注时一致)
slot_labels_list = [
    "O", "B-DEVICE_TYPE", "I-DEVICE_TYPE", "B-DEVICE_ID", "I-DEVICE_ID",
    "B-LOCATION", "I-LOCATION", "B-ACTION", "I-ACTION",
    "B-PARAMETER", "I-PARAMETER",
]
slot2id = {label: i for i, label in enumerate(slot_labels_list)}
id2slot = {i: label for i, label in enumerate(slot_labels_list)}
NUM_SLOTS = len(slot_labels_list)

# --- 2. 加载和预处理数据 ---
logger.info(f"尝试从 {DATA_FILE_PATH} 加载数据...")
if not DATA_FILE_PATH.exists():
    logger.error(f"数据文件 {DATA_FILE_PATH} 未找到！请确保它存在于 'nlu/model/dataset/' 目录下并且名为 'data.jsonl' (或修改脚本中的文件名)。")
    exit()

try:
    df = pd.read_json(DATA_FILE_PATH, lines=True)
    if 'text' not in df.columns or 'labels' not in df.columns:
        raise ValueError("数据文件必须包含 'text' 和 'labels' 列。'labels' 列应包含每个文本对应的字级别BIO标签列表。")
    
    # 检查 'labels' 列是否都是列表类型，并且其长度与对应'text'的字数一致
    valid_data = []
    for index, row in df.iterrows():
        text = str(row['text']) # 确保是字符串
        labels = row['labels']
        if not isinstance(labels, list):
            logger.warning(f"第 {index+1} 行的 'labels' 不是列表类型，已跳过: {labels}")
            continue
        if len(text) != len(labels):
            logger.warning(f"第 {index+1} 行的文本长度 ({len(text)}) 与标签数量 ({len(labels)}) 不匹配，已跳过。文本: '{text}', 标签: {labels}")
            continue
        valid_data.append({'text': text, 'labels': labels})
    
    if not valid_data:
        logger.error("没有有效的标注数据可供处理。请检查data.jsonl文件中的格式和标签长度。")
        exit()

    df_cleaned = pd.DataFrame(valid_data)
    raw_dataset = Dataset.from_pandas(df_cleaned[['text', 'labels']])
    
    if len(raw_dataset) == 0:
        logger.error("数据文件已加载，但经过校验后内容为空。请检查数据文件。") # 理论上不会到这里，因为上面已经检查了valid_data
        exit()

    logger.info(f"成功加载并校验了 {len(raw_dataset)} 条有效数据。")

    if len(raw_dataset) < 10 : 
        logger.warning("数据量非常小 (<10 条)，无法有效划分验证集。将所有数据用于训练，不进行评估。")
        datasets_dict = DatasetDict({'train': raw_dataset})
    else:
        train_test_split = raw_dataset.train_test_split(test_size=0.2, seed=42, shuffle=True) # 添加shuffle
        datasets_dict = DatasetDict({
            'train': train_test_split['train'],
            'eval': train_test_split['test']
        })
    logger.info(f"训练集大小: {len(datasets_dict['train'])}")
    if 'eval' in datasets_dict and datasets_dict['eval']:
        logger.info(f"验证集大小: {len(datasets_dict['eval'])}")
    else:
        logger.warning("未创建验证集 (可能是因为总数据量太小)。")


except FileNotFoundError:
    logger.error(f"数据文件 {DATA_FILE_PATH} 再次确认未找到。")
    exit()
except ValueError as e:
    logger.error(f"数据加载或处理错误: {e}")
    exit()
except Exception as e:
    logger.error(f"加载数据时发生未知错误: {e}", exc_info=True)
    exit()


logger.info(f"加载tokenizer: {MODEL_NAME}...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

def tokenize_and_align_labels(examples):
    tokenized_inputs = tokenizer(
        examples["text"],
        truncation=True,
        padding="max_length", 
        max_length=MAX_SEQ_LENGTH,
        is_split_into_words=False 
    )
    
    aligned_labels_batch = []
    for i, char_labels_for_text in enumerate(examples["labels"]):
        word_ids = tokenized_inputs.word_ids(batch_index=i)
        previous_word_idx = None
        label_ids_for_tokens = []
        for token_idx, word_idx in enumerate(word_ids):
            if word_idx is None:
                label_ids_for_tokens.append(-100)
            elif word_idx != previous_word_idx:
                if word_idx < len(char_labels_for_text): # 确保不越界
                     label_ids_for_tokens.append(slot2id.get(char_labels_for_text[word_idx], slot2id["O"]))
                else: 
                    logger.error(f"标签对齐错误：word_idx ({word_idx}) 超出 char_labels_for_text 长度 ({len(char_labels_for_text)})。文本: '{examples['text'][i]}'")
                    label_ids_for_tokens.append(slot2id["O"]) # 或抛出错误
            else:
                label_ids_for_tokens.append(-100) # 只在每个原始字的第一个token上标注
            previous_word_idx = word_idx
        aligned_labels_batch.append(label_ids_for_tokens)
    
    tokenized_inputs["labels"] = aligned_labels_batch
    return tokenized_inputs

logger.info("对数据集进行Tokenization和标签对齐...")
try:
    if not datasets_dict.get("train"):
        logger.error("训练数据集为空，无法进行tokenization。")
        exit()
        
    tokenized_datasets = datasets_dict.map(
        tokenize_and_align_labels,
        batched=True,
        remove_columns=['text', 'labels']  # 移除原始列
    )
except Exception as e:
    logger.error(f"Tokenization或标签对齐失败: {e}", exc_info=True)
    exit()
    
# --- 3. 定义模型 ---
logger.info(f"加载预训练模型: {MODEL_NAME} for Token Classification...")
try:
    model = AutoModelForTokenClassification.from_pretrained(
        MODEL_NAME,
        num_labels=NUM_SLOTS,
        id2label=id2slot, # 保存映射到模型配置
        label2id=slot2id  # 保存映射到模型配置
    )
except Exception as e:
    logger.error(f"加载预训练模型失败: {e}. 请确保 '{MODEL_NAME}' 是一个有效的模型标识符，并且你有网络连接（如果是第一次加载）。", exc_info=True)
    exit()


data_collator = DataCollatorForTokenClassification(tokenizer=tokenizer)

# --- 4. 定义评估指标 ---
def compute_metrics(eval_prediction):
    predictions, actual_labels = eval_prediction
    predictions = np.argmax(predictions, axis=2)

    true_predictions_str = [
        [id2slot.get(p_id, "O") for (p_id, l_id) in zip(prediction_row, label_row) if l_id != -100]
        for prediction_row, label_row in zip(predictions, actual_labels)
    ]
    true_labels_str = [
        [id2slot.get(l_id, "O") for (p_id, l_id) in zip(prediction_row, label_row) if l_id != -100]
        for prediction_row, label_row in zip(predictions, actual_labels)
    ]
    
    # 过滤掉可能是由于padding或错误对齐产生的空列表
    true_predictions_filtered = [p for p in true_predictions_str if p]
    true_labels_filtered = [l for l in true_labels_str if l]

    if not true_labels_filtered or not true_predictions_filtered or len(true_labels_filtered) != len(true_predictions_filtered):
        logger.warning("评估时真实标签或预测结果为空，或长度不匹配，无法计算指标。")
        return {"precision": 0.0, "recall": 0.0, "f1": 0.0}
        
    precision = precision_score(true_labels_filtered, true_predictions_filtered, zero_division=0)
    recall = recall_score(true_labels_filtered, true_predictions_filtered, zero_division=0)
    f1 = f1_score(true_labels_filtered, true_predictions_filtered, zero_division=0)
    return {
        "precision": precision,
        "recall": recall,
        "f1": f1,
    }

# --- 5. 定义训练参数 ---
# 检查是否有可用的评估集
do_eval = tokenized_datasets.get('eval') is not None and len(tokenized_datasets['eval']) > 0

num_train_samples = len(tokenized_datasets['train']) if tokenized_datasets.get('train') else 0
batch_size_train = 8 # 可根据GPU显存调整
num_epochs = 15 if num_train_samples < 200 else (10 if num_train_samples < 1000 else 5) # 小数据集多跑几轮
warmup_ratio = 0.1
# 确保 total_train_steps > 0 
if num_train_samples > 0 and batch_size_train > 0 and num_epochs > 0 :
    steps_per_epoch = (num_train_samples // batch_size_train) + (1 if num_train_samples % batch_size_train > 0 else 0)
    total_train_steps = steps_per_epoch * num_epochs
else:
    total_train_steps = 1 # 避免除以零或负数

logging_steps_val = max(1, int(steps_per_epoch * 0.2)) if num_train_samples > 0 and batch_size_train > 0 else 10 # 每轮大约记录5次

training_args = TrainingArguments(
    output_dir=str(OUTPUT_MODEL_DIR), 
    num_train_epochs=num_epochs,
    per_device_train_batch_size=batch_size_train,
    per_device_eval_batch_size=batch_size_train if do_eval else 1,
    learning_rate=3e-5, 
    warmup_steps=max(1, int(total_train_steps * warmup_ratio)),
    weight_decay=0.01, 
    logging_dir=str(OUTPUT_MODEL_DIR / "logs"), 
    logging_steps=logging_steps_val,
    eval_strategy="epoch" if do_eval else "no",
    save_strategy="epoch" if do_eval else "no", 
    load_best_model_at_end=True if do_eval else False, 
    metric_for_best_model="f1" if do_eval else None,
    greater_is_better=True if do_eval else None,
    report_to="none", 
    # optim="adamw_torch_fused" # For PyTorch >= 2.0, can provide speedup
    # fp16=torch.cuda.is_available(), # 如果有GPU且支持，可以开启FP16加速训练，但可能需要调整其他参数
)

# --- 6. 初始化Trainer并开始训练 ---
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"] if tokenized_datasets.get("train") else None,
    eval_dataset=tokenized_datasets["eval"] if do_eval else None,
    tokenizer=tokenizer, 
    data_collator=data_collator,
    compute_metrics=compute_metrics if do_eval else None,
)

if tokenized_datasets.get("train") and len(tokenized_datasets['train']) > 0:
    logger.info(f"开始模型训练... 输出到: {OUTPUT_MODEL_DIR}")
    try:
        trainer.train()
        logger.info("模型训练完成。")

        logger.info(f"将最终模型保存到 {OUTPUT_MODEL_DIR}...")
        trainer.save_model(str(OUTPUT_MODEL_DIR)) 
        tokenizer.save_pretrained(str(OUTPUT_MODEL_DIR))
        logger.info(f"模型和分词器已成功保存到 {OUTPUT_MODEL_DIR}。")

        if do_eval:
            logger.info("在评估集上进行最终评估...")
            eval_results = trainer.evaluate()
            logger.info(f"最终评估结果: {eval_results}")
            # 将评估结果写入文件
            with open(OUTPUT_MODEL_DIR / "eval_results.txt", "w") as writer:
                logger.info(f"***** Eval results *****")
                for key, value in sorted(eval_results.items()):
                    logger.info(f"  {key} = {value}")
                    writer.write(f"{key} = {value}\n")


    except Exception as e:
        logger.error(f"训练过程中发生错误: {e}", exc_info=True)
else:
    logger.error("没有可用的训练数据或训练集为空，无法开始训练。")

logger.info(f"脚本执行完毕。")