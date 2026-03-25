import torch
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
from safetensors.torch import load_file
import os
import torch

EMOTIONS = [
    "admiration", "amusement", "anger", "annoyance", "approval", "caring", 
    "confusion", "curiosity", "desire", "disappointment", "disapproval", 
    "disgust", "embarrassment", "excitement", "fear", "gratitude", "grief", 
    "joy", "love", "nervousness", "optimism", "pride", "realization", 
    "relief", "remorse", "sadness", "surprise", "neutral"
]
ID_TO_LABEL = {i: label for i, label in enumerate(EMOTIONS)}

class NeuroTalkInference:
    def __init__(self, model_path="neurotalk_model", num_labels=28):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = DistilBertTokenizerFast.from_pretrained(model_path)
        
        # Load model using the transformers library's head
        self.model = DistilBertForSequenceClassification.from_pretrained(
            model_path, 
            num_labels=num_labels,
            problem_type="multi_label_classification"
        )
        
        # Check for safetensors vs bin
        safetensors_path = os.path.join(model_path, "model.safetensors")
        bin_path = os.path.join(model_path, "pytorch_model.bin")
        
        if os.path.exists(safetensors_path):
            state_dict = load_file(safetensors_path)
        elif os.path.exists(bin_path):
            state_dict = torch.load(bin_path, map_location=self.device)
        else:
            state_dict = None

        if state_dict:
            # Fix beta/gamma vs weight/bias mismatch
            new_state_dict = {}
            for key, value in state_dict.items():
                new_key = key
                if key.endswith(".LayerNorm.beta"):
                    new_key = key.replace(".LayerNorm.beta", ".LayerNorm.bias")
                elif key.endswith(".LayerNorm.gamma"):
                    new_key = key.replace(".LayerNorm.gamma", ".LayerNorm.weight")
                new_state_dict[new_key] = value
            
            self.model.load_state_dict(new_state_dict)
        
        self.model.to(self.device)
        self.model.eval()

    def analyze(self, text):
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128).to(self.device)
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
        
        probs = torch.sigmoid(logits)
        prediction_idx = torch.argmax(probs, dim=1).item()
        return ID_TO_LABEL[prediction_idx]

if __name__ == "__main__":
    # Test script
    engine = NeuroTalkInference()
    samples = [
        "I feel very anxious about tomorrow's exam",
        "I am so happy to see you!",
        "This is a bit disappointing."
    ]
    
    for s in samples:
        print(f"'{s}' -> {engine.analyze(s)}")
