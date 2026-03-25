import os
import shutil

model_dir = "neurotalk_model"
files_to_move = [
    "config.json",
    "tokenizer.json",
    "tokenizer_config.json",
    "model.safetensors"
]

if not os.path.exists(model_dir):
    os.makedirs(model_dir)
    print(f"Created directory: {model_dir}")

for file in files_to_move:
    if os.path.exists(file):
        shutil.move(file, os.path.join(model_dir, file))
        print(f"Moved {file} to {model_dir}")
    else:
        print(f"File {file} not found, skipping.")
