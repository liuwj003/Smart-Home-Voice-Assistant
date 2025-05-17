# model
* 采用微调的BERT来进行意图识别
* `dataset`下是用来 fine tune 的数据集
* `train`下是训练预训练模型的代码，训练好后推送到hugging face上。
* `fine_tuned_nlu_bert`下是微调后的模型配置
* 对中文，目前用的BERT是`hfl/chinese-bert-wwm-ext`