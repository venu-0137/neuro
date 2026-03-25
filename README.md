# NeuroTalk AI 🧠

Analyze emotional patterns in text using DistilBERT transformers. This project provides a full-stack solution including a multi-label classification model, a FastAPI backend, and a premium glassmorphism frontend.

## 📁 Project Structure

```
NeuroTalkAI/
├── neurotalk_model/       # Saved model weights & tokenizer
├── frontend/              # HTML/CSS/JS files
├── api.py                 # FastAPI REST API
├── model.py               # Model architecture (DistilBERT)
├── train_model.py         # Training pipeline
├── labels.py              # Emotion label mappings
├── inference.py           # Standalone prediction engine
└── requirements.txt       # Python dependencies
```

## 🚀 Getting Started

### 1. Setup Environment
```bash
pip install -r requirements.txt
```

### 2. Train the Model
You can train locally if you have the GoEmotions CSV files:
```bash
python train_model.py
```
*Alternatively, use the provided Google Colab workflow for GPU acceleration.*

### 3. Run the Backend
```bash
python api.py
```

### 4. Open the Frontend
Launch `frontend/index.html` in your favorite browser and start analyzing text!

## 🧪 Testing the API
```bash
curl -X POST "http://localhost:8000/analyze" -H "Content-Type: application/json" -d "{\"text\": \"I'm feeling very excited about this project!\"}"
```

## 🛡️ License
MIT License
