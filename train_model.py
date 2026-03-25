import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import DistilBertTokenizerFast, AdamW
from model import NeuroTalkModel
from labels import ID_TO_LABEL, EMOTIONS
import os
import numpy as np

# --------------------------------------------------------------------------------
# 1. Dataset Class
# --------------------------------------------------------------------------------
class EmotionsDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]
        encoding = self.tokenizer.encode_plus(
            text,
            add_special_tokens=True,
            max_length=self.max_len,
            return_token_type_ids=False,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt',
        )
        return {
            'text': text,
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.float)
        }

# --------------------------------------------------------------------------------
# 2. Main Building / Training logic
# --------------------------------------------------------------------------------
def build_and_train():
    # File paths (adjust as needed)
    files = ['GoEmotions (1).csv'] # Can expand to more
    
    print("Loading data...")
    dfs = [pd.read_csv(f) for f in files if os.path.exists(f)]
    if not dfs:
        print("Error: GoEmotions (1).csv not found in the directory.")
        return
        
    df = pd.concat(dfs).dropna()
    emotion_cols = df.columns[9:]
    num_labels = len(emotion_cols)
    print(f"Detected {num_labels} labels.")

    # Parameters
    MAX_LEN = 128
    BATCH_SIZE = 16
    EPOCHS = 3
    LEARNING_RATE = 2e-5

    tokenizer = DistilBertTokenizerFast.from_pretrained('distilbert-base-uncased')
    
    # Split
    train_df = df.sample(frac=0.8, random_state=42)
    val_df = df.drop(train_df.index)

    train_dataset = EmotionsDataset(
        texts=train_df.text.to_numpy(),
        labels=train_df[emotion_cols].to_numpy(),
        tokenizer=tokenizer,
        max_len=MAX_LEN
    )

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    model = NeuroTalkModel(num_labels=num_labels).to(device)
    optimizer = AdamW(model.parameters(), lr=LEARNING_RATE)
    criterion = torch.nn.BCEWithLogitsLoss()

    print("Starting training loop (building model weights)...")
    model.train()
    for epoch in range(EPOCHS):
        total_loss = 0
        for batch in train_loader:
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['labels'].to(device)

            optimizer.zero_grad()
            outputs = model(input_ids, attention_mask)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        
        print(f"Epoch {epoch+1}/{EPOCHS}, Loss: {total_loss/len(train_loader):.4f}")

    # Save
    model_dir = "neurotalk_model"
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
    
    torch.save(model.state_dict(), os.path.join(model_dir, "pytorch_model.bin"))
    tokenizer.save_pretrained(model_dir)
    print(f"Model and tokenizer saved to {model_dir}")

    # Step 6: Simple prediction function test
    print("\n--- Testing Model Prediction ---")
    test_sentence = "I feel really happy today"
    prediction = analyze_text(test_sentence, model, tokenizer, deviceInRange=device)
    print(f"Text: '{test_sentence}' -> Predicted Emotion: {prediction}")

def analyze_text(text, model, tokenizer, deviceInRange):
    model.eval()
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128).to(deviceInRange)
    with torch.no_grad():
        outputs = model(inputs['input_ids'], inputs['attention_mask'])
    
    # For multi-label, we might take the top one or all above threshold
    # Since the user asked for argmax logic in Step 3/5:
    probs = torch.sigmoid(outputs)
    prediction_idx = torch.argmax(probs, dim=1).item()
    return ID_TO_LABEL[prediction_idx]

if __name__ == "__main__":
    build_and_train()
