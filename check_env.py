import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
import pandas as pd
import os

print("--- Environment Check ---")
print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")

print("\n--- Data Check ---")
dataset_path = "GoEmotions (1).csv"
if os.path.exists(dataset_path):
    df = pd.read_csv(dataset_path, nrows=5)
    print(f"Dataset found. Sample columns: {df.columns.tolist()}")
else:
    print(f"Error: {dataset_path} not found.")

print("\n--- Model Check ---")
try:
    tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
    model = DistilBertForSequenceClassification.from_pretrained(
        "distilbert-base-uncased",
        num_labels=28,
        problem_type="multi_label_classification"
    )
    print("Model and tokenizer initialized successfully.")
except Exception as e:
    print(f"Error initializing model: {e}")
