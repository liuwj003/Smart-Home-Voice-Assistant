# model
* 采用微调的BERT来进行意图识别
* `dataset`下是用来 fine tune 的数据集
* `train`下是训练预训练模型的代码，训练好后推送到hugging face上。
* `fine_tuned_nlu_bert`下是微调后的模型配置
* 对中文，目前用的BERT是`hfl/chinese-bert-wwm-ext`

```bash
{'loss': 0.0054, 'grad_norm': 0.09399592876434326, 'learning_rate': 4.111111111111111e-06, 'epoch': 13.2}                               
{'loss': 0.0091, 'grad_norm': 0.04980149492621422, 'learning_rate': 3.6666666666666666e-06, 'epoch': 13.4}                              
{'loss': 0.0055, 'grad_norm': 0.1250232607126236, 'learning_rate': 3.2222222222222222e-06, 'epoch': 13.6}                               
{'loss': 0.008, 'grad_norm': 0.35049769282341003, 'learning_rate': 2.7777777777777775e-06, 'epoch': 13.8}                               
{'loss': 0.0067, 'grad_norm': 0.041799649596214294, 'learning_rate': 2.3333333333333336e-06, 'epoch': 14.0}                             
{'eval_loss': 0.3506454527378082, 'eval_precision': 0.7862068965517242, 'eval_recall': 0.8321167883211679, 'eval_f1': 0.8085106382978724, 'eval_runtime': 0.1238, 'eval_samples_per_second': 315.016, 'eval_steps_per_second': 40.387, 'epoch': 14.0}                           
{'loss': 0.0069, 'grad_norm': 0.03091876022517681, 'learning_rate': 1.8888888888888888e-06, 'epoch': 14.2}                              
{'loss': 0.0056, 'grad_norm': 0.12456212937831879, 'learning_rate': 1.4444444444444445e-06, 'epoch': 14.4}                              
{'loss': 0.0049, 'grad_norm': 0.03175785765051842, 'learning_rate': 1e-06, 'epoch': 14.6}                                               
{'loss': 0.0064, 'grad_norm': 0.09498338401317596, 'learning_rate': 5.555555555555555e-07, 'epoch': 14.8}                               
{'loss': 0.0051, 'grad_norm': 0.22209662199020386, 'learning_rate': 1.1111111111111112e-07, 'epoch': 15.0}                              
{'eval_loss': 0.3493916690349579, 'eval_precision': 0.7808219178082192, 'eval_recall': 0.8321167883211679, 'eval_f1': 0.8056537102473498, 'eval_runtime': 0.1243, 'eval_samples_per_second': 313.777, 'eval_steps_per_second': 40.228, 'epoch': 15.0}                           
{'train_runtime': 50.7543, 'train_samples_per_second': 45.218, 'train_steps_per_second': 5.911, 'train_loss': 0.2838590065079431, 'epoch': 15.0}                                                                                                
2025-05-20 01:57:52,391 - __main__ - INFO - 模型训练完成。
2025-05-20 01:57:52,391 - __main__ - INFO - 将最终模型保存到 /root/autodl-tmp/nlu/model/fine_tuned_nlu_bert...
2025-05-20 01:57:52,959 - __main__ - INFO - 模型和分词器已成功保存到 /root/autodl-tmp/nlu/model/fine_tuned_nlu_bert。
2025-05-20 01:57:52,959 - __main__ - INFO - 在评估集上进行最终评估...

2025-05-20 01:57:53,105 - __main__ - INFO - 最终评估结果: {'eval_loss': 0.28036466240882874, 'eval_precision': 0.8263888888888888, 'eval_recall': 0.8686131386861314, 'eval_f1': 0.8469750889679716, 'eval_runtime': 0.1438, 'eval_samples_per_second': 271.29, 'eval_steps_per_second': 34.781, 'epoch': 15.0}
2025-05-20 01:57:53,106 - __main__ - INFO - ***** Eval results *****
2025-05-20 01:57:53,106 - __main__ - INFO -   epoch = 15.0
2025-05-20 01:57:53,106 - __main__ - INFO -   eval_f1 = 0.8469750889679716
2025-05-20 01:57:53,106 - __main__ - INFO -   eval_loss = 0.28036466240882874
2025-05-20 01:57:53,106 - __main__ - INFO -   eval_precision = 0.8263888888888888
2025-05-20 01:57:53,106 - __main__ - INFO -   eval_recall = 0.8686131386861314
2025-05-20 01:57:53,106 - __main__ - INFO -   eval_runtime = 0.1438
2025-05-20 01:57:53,106 - __main__ - INFO -   eval_samples_per_second = 271.29
2025-05-20 01:57:53,106 - __main__ - INFO -   eval_steps_per_second = 34.781
2025-05-20 01:57:53,106 - __main__ - INFO - 脚本执行完毕。
```