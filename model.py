import torch.nn as nn
from transformers import DistilBertModel

class NeuroTalkModel(nn.Module):
    def __init__(self, num_labels):
        super(NeuroTalkModel, self).__init__()
        self.distilbert = DistilBertModel.from_pretrained('distilbert-base-uncased')
        self.pre_classifier = nn.Linear(768, 768)
        self.classifier = nn.Linear(768, num_labels)
        self.dropout = nn.Dropout(0.2)
        self.relu = nn.ReLU()

    def forward(self, input_ids, attention_mask):
        distilbert_output = self.distilbert(input_ids=input_ids, attention_mask=attention_mask)
        hidden_state = distilbert_output[0]  # (bs, seq_len, dim)
        pooled_output = hidden_state[:, 0]    # [CLS] token
        pooled_output = self.pre_classifier(pooled_output)
        pooled_output = self.relu(pooled_output)
        pooled_output = self.dropout(pooled_output)
        logits = self.classifier(pooled_output)
        return logits
