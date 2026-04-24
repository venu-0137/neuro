from inference import NeuroTalkInference
import json

engine = NeuroTalkInference()
text = "I am feeling very happy but also a bit nervous 😊"
emotions, pattern = engine.analyze(text)

print("Emotions Keys Type:", type(list(emotions.keys())[0]))
print("First Emotion Key:", list(emotions.keys())[0])
print("Pattern:", pattern)
print("Full Emotions JSON:", json.dumps(emotions, indent=2))
