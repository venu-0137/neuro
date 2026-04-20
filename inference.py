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
    def __init__(self, model_path="neurotalk_model_updated", num_labels=28):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        
        self.model = AutoModelForSequenceClassification.from_pretrained(
            model_path, 
            num_labels=num_labels,
            problem_type="multi_label_classification"
        )
        self.model.to(self.device)
        self.model.eval()

    def analyze(self, text):
        # Step 1: Emoji lookup fallback for emoji-only input
        if is_emoji_only(text):
            emoji_result = lookup_emoji_emotion(text)
            if emoji_result:
                return emoji_result, 0.95 # Confident lookup

        # Step 2: Neural network prediction for text or unknown emoji
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128).to(self.device)
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
        
        probs = torch.sigmoid(logits).squeeze()
        
        # Use threshold-based prediction: pick top emotion above 0.3
        above_threshold = (probs > 0.3).nonzero(as_tuple=True)[0]
        if len(above_threshold) > 0:
            # Among those above threshold, pick the highest
            best_idx = above_threshold[torch.argmax(probs[above_threshold])].item()
        else:
            # Fallback to argmax if nothing above threshold
            best_idx = torch.argmax(probs).item()
        
        score = probs[best_idx].item()
        return ID_TO_LABEL[best_idx], score

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
