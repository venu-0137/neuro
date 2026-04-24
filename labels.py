EMOTIONS = [
    "admiration", "amusement", "anger", "annoyance", "approval", "caring", 
    "confusion", "curiosity", "desire", "disappointment", "disapproval", 
    "disgust", "embarrassment", "excitement", "fear", "gratitude", "grief", 
    "joy", "love", "nervousness", "optimism", "pride", "realization", 
    "relief", "remorse", "sadness", "surprise", "neutral"
]

ID_TO_LABEL = {i: label for i, label in enumerate(EMOTIONS)}
LABEL_TO_ID = {label: i for i, label in enumerate(EMOTIONS)}
