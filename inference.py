import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os
import re

from labels import ID_TO_LABEL, EMOTIONS

# Direct emoji-to-emotion lookup table for guaranteed accuracy on known emojis
EMOJI_EMOTION_MAP = {
    # Joy
    "😀": "joy", "😃": "joy", "😄": "joy", "😁": "joy", "😊": "joy",
    "🥳": "joy", "🎉": "joy", "🌟": "joy", "⭐": "joy",
    # Amusement
    "😆": "amusement", "😂": "amusement", "🤣": "amusement", "💀": "amusement",
    "🤭": "amusement", "💩": "amusement", "🤠": "amusement",
    # Love
    "😍": "love", "🥰": "love", "😘": "love", "❤️": "love", "💕": "love",
    "🤗": "love", "🫶": "love", "🫠": "love", "❤": "love",
    # Sadness
    "😢": "sadness", "😭": "sadness", "😞": "sadness", "😔": "sadness",
    "💔": "sadness", "🥺": "sadness", "😩": "sadness", "🤒": "sadness",
    "🤕": "sadness", "🤧": "sadness", "🫥": "sadness",
    # Anger
    "😡": "anger", "🤬": "anger", "😠": "anger", "😤": "anger",
    "👎": "anger", "👿": "anger",
    # Fear
    "😨": "fear", "😱": "fear", "😰": "fear", "😷": "fear",
    "🥶": "fear", "👻": "fear",
    # Surprise
    "😮": "surprise", "😲": "surprise", "😯": "surprise", "🤯": "surprise",
    # Curiosity
    "🤔": "curiosity",
    # Neutral
    "😐": "neutral", "😶": "neutral", "🤫": "neutral",
    # Excitement
    "🤩": "excitement", "🔥": "excitement", "😈": "excitement",
    "✨": "excitement", "🥵": "excitement",
    # Confidence / Pride
    "😎": "pride", "👍": "pride", "😏": "pride", "💪": "pride",
    "💯": "pride", "🫡": "pride",
    # Annoyance
    "🙄": "annoyance", "🤥": "annoyance", "🤢": "annoyance", "🤮": "annoyance",
    # Nervousness
    "😬": "nervousness", "🫣": "nervousness",
    # Confusion
    "😵": "confusion", "🥴": "confusion", "😵‍💫": "confusion",
    # Relief / Calm
    "😇": "relief", "😌": "relief", "🙏": "relief",
    # Fatigue -> mapped to neutral (closest in GoEmotions)
    "😴": "neutral", "😪": "neutral", "😫": "neutral", "🥱": "neutral",
}

# Regex to detect if text is only emoji characters (no letters/digits)
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map symbols
    "\U0001F1E0-\U0001F1FF"  # flags
    "\U00002702-\U000027B0"  # dingbats
    "\U000024C2-\U0001F251"  # enclosed characters
    "\U0001FA00-\U0001FA6F"  # chess symbols & extended-A
    "\U0001FA70-\U0001FAFF"  # symbols extended-A
    "\U00002600-\U000026FF"  # misc symbols
    "\U0001F900-\U0001F9FF"  # supplemental symbols (🤔🤣🤗 etc.)
    "\U0000FE00-\U0000FE0F"  # variation selectors
    "\U0000200D"             # zero width joiner
    "\U00000020"             # space
    "]+$",
    re.UNICODE
)

def is_emoji_only(text):
    """Check if the input text consists only of emoji characters."""
    stripped = text.strip()
    if not stripped:
        return False
    return bool(EMOJI_PATTERN.match(stripped))

def lookup_emoji_emotion(text):
    """Try to find the emotion for a single or multi-emoji input via direct lookup."""
    stripped = text.strip()
    # Try the full string first (handles multi-char emojis like 😵‍💫)
    if stripped in EMOJI_EMOTION_MAP:
        return EMOJI_EMOTION_MAP[stripped]
    # For multi-emoji input, find the first recognized emoji
    for emoji, emotion in EMOJI_EMOTION_MAP.items():
        if emoji in stripped:
            return emotion
    return None


class NeuroTalkInference:
    def __init__(self, model_path="neurotalk_model_master", num_labels=28):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Check if local model weights exist
        weights_exist = any(os.path.exists(os.path.join(model_path, f)) for f in ["pytorch_model.bin", "model.safetensors"])
        
        if weights_exist:
            print(f"Loading Master Multi-Label model from: {model_path}")
            load_path = model_path
        else:
            # Fallback to previously updated model if master is not trained yet
            fallback_path = "neurotalk_model_updated"
            weights_exist_fallback = any(os.path.exists(os.path.join(fallback_path, f)) for f in ["pytorch_model.bin", "model.safetensors"])
            
            if weights_exist_fallback:
                print(f"Loading updated model from: {fallback_path}")
                load_path = fallback_path
            else:
                fallback_model = "monologg/bert-base-cased-goemotions"
                print(f"Warning: Local weights missing. Falling back to public model: {fallback_model}")
                load_path = fallback_model

        self.tokenizer = AutoTokenizer.from_pretrained(load_path)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            load_path, 
            num_labels=num_labels,
            problem_type="multi_label_classification"
        )
        self.model.to(self.device)
        self.model.eval()

    def detect_pattern(self, emotions):
        # Higher-level cognitive pattern interpretation
        sad = emotions.get("sadness", 0)
        joy = emotions.get("joy", 0)
        fear = emotions.get("fear", 0)
        nervous = emotions.get("nervousness", 0)
        anger = emotions.get("anger", 0)
        annoyance = emotions.get("annoyance", 0)
        disgust = emotions.get("disgust", 0)
        love = emotions.get("love", 0)
        optimism = emotions.get("optimism", 0)

        if sad > 0.4 and joy > 0.4:
            return "Mixed Emotional State (Bittersweet)"
        elif fear > 0.4 and nervous > 0.4:
            return "Anxiety Pattern (High Alert)"
        elif anger > 0.4 or annoyance > 0.4 or disgust > 0.4:
            return "Frustration / Anger Cluster"
        elif joy > 0.5 or love > 0.5 or optimism > 0.5:
            return "Positive / High-Wellbeing State"
        elif sad > 0.5:
            return "Deep Reflective / Sad State"
        else:
            return "Stable / Neutral State"

    def analyze(self, text):
        # Step 1: Emoji lookup fallback
        if is_emoji_only(text):
            emoji_result = lookup_emoji_emotion(text)
            if emoji_result:
                # Return compatible dict for multi-label format
                res = {label: 0.0 for label in EMOTIONS}
                res[emoji_result] = 0.95
                return res, "Direct Emotional Response"

        # Step 2: Neural network prediction
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128).to(self.device)
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
        
        # Apply temperature scaling to make it more multi-label friendly
        # temperature > 1 makes the distribution smoother
        temperature = 1.5
        probs = torch.sigmoid(logits / temperature).squeeze().cpu().numpy()
        
        # Construct emotion distribution
        results = {
            ID_TO_LABEL[i]: float(probs[i])
            for i in range(len(ID_TO_LABEL))
        }

        # Sort by highest probability
        sorted_results = dict(sorted(results.items(), key=lambda x: x[1], reverse=True))
        
        # Detect pattern
        pattern = self.detect_pattern(sorted_results)
        
        return sorted_results, pattern

if __name__ == "__main__":
    # Test script with emojis and text
    engine = NeuroTalkInference()
    samples = [
        ("😡", "anger"),
        ("😭", "sadness"),
        ("😊", "joy"),
        ("😍", "love"),
        ("😱", "fear"),
        ("😮", "surprise"),
        ("🤔", "curiosity"),
        ("🔥", "excitement"),
        ("💔", "sadness"),
        ("I am very happy 😊", "joy"),
        ("I feel broken 💔", "sadness"),
        ("This is so annoying 😡", "anger"),
        ("I love this 😍🔥", "love"),
    ]
    
    print("=== Emoji Emotion Detection Test ===")
    for text, expected in samples:
        result = engine.analyze(text)
        status = "✓" if result == expected else "✗"
        print(f"  {status} '{text}' -> {result} (expected: {expected})")
