import os
import pandas as pd
import numpy as np
import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, Trainer, TrainingArguments
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

# --------------------------------------------------------------------------------
# 1. Configuration & Data Loading
# --------------------------------------------------------------------------------
dataset_path = "GoEmotions (1).csv"
model_dir = "neurotalk_model"

if not os.path.exists(dataset_path):
    print(f"Error: {dataset_path} not found.")
    exit(1)

df = pd.read_csv(dataset_path, engine="python")
print(f"Dataset loaded. Shape: {df.shape}")

emotion_labels = [
    'admiration','amusement','anger','annoyance','approval','caring','confusion',
    'curiosity','desire','disappointment','disapproval','disgust','embarrassment',
    'excitement','fear','gratitude','grief','joy','love','nervousness','optimism',
    'pride','realization','relief','remorse','sadness','surprise','neutral'
]

df = df[['text'] + emotion_labels]
df = df.dropna()
print("Cleaned dataset size:", df.shape)

labels = df[emotion_labels].values
texts = df['text'].tolist()

# --------------------------------------------------------------------------------
# 2. Preprocessing
# --------------------------------------------------------------------------------
train_texts, test_texts, train_labels, test_labels = train_test_split(
    texts,
    labels,
    test_size=0.2,
    random_state=42
)

tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")

train_encodings = tokenizer(
    train_texts,
    truncation=True,
    padding=True,
    max_length=128
)

test_encodings = tokenizer(
    test_texts,
    truncation=True,
    padding=True,
    max_length=128
)

class GoEmotionsDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx]).float()
        return item

    def __len__(self):
        return len(self.labels)

train_dataset = GoEmotionsDataset(train_encodings, train_labels)
test_dataset = GoEmotionsDataset(test_encodings, test_labels)

# --------------------------------------------------------------------------------
# 3. Model & Training
# --------------------------------------------------------------------------------
model = DistilBertForSequenceClassification.from_pretrained(
    "distilbert-base-uncased",
    num_labels=28,
    problem_type="multi_label_classification"
)

def compute_metrics(pred):
    logits, labels = pred
    preds = (logits > 0).astype(int)
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, preds, average='micro'
    )
    acc = accuracy_score(labels, preds)
    return {
        "accuracy": acc,
        "f1": f1,
        "precision": precision,
        "recall": recall
    }

training_args = TrainingArguments(
    output_dir="./results",
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=3,
    weight_decay=0.01,
    logging_dir="./logs",
    logging_steps=100,
    save_steps=500,
    report_to="none" # Disable wandb etc.
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
    compute_metrics=compute_metrics
)

print("Starting training...")
trainer.train()

print("Evaluating model...")
metrics = trainer.evaluate()
print(f"Evaluation metrics: {metrics}")

# --------------------------------------------------------------------------------
# 4. Save Model
# --------------------------------------------------------------------------------
if not os.path.exists(model_dir):
    os.makedirs(model_dir)

model.save_pretrained(model_dir)
tokenizer.save_pretrained(model_dir)
print(f"Model and tokenizer saved to {model_dir}")

