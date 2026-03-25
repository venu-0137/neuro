import subprocess
import os
import sys

def run_command(command, description):
    """Utility to run a command and handle errors."""
    print(f"\n[NeuroTalk] {description}...")
    try:
        subprocess.check_call(command)
    except subprocess.CalledProcessError as e:
        print(f"\n[Error] Failed during {description}: {e}")
        sys.exit(1)

def main():
    print("==========================================")
    print("      NeuroTalk AI: Setup & Run          ")
    print("==========================================\n")
    
    # 1. Install dependencies
    if os.path.exists("requirements.txt"):
        run_command([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], "Step 1: Installing dependencies")
    else:
        print("[Warning] requirements.txt not found. Skipping dependency installation.")
    
    # 2. Check for model and train if missing
    model_dir = "neurotalk_model"
    if not os.path.exists(model_dir):
        print(f"\n[Info] Model directory '{model_dir}' not found. Training is required.")
        run_command([sys.executable, "train_model.py"], "Step 2: Training the model (this will take a few minutes)")
    else:
        print(f"\n[Info] Model already exists in '{model_dir}'. skipping training.")

    # 3. Run the API
    print("\n[NeuroTalk] Step 3: Starting the AI API...")
    print("------------------------------------------")
    print("API URL: http://localhost:8000")
    print("UI URL:  Open 'frontend/index.html' in your browser")
    print("------------------------------------------")
    print("To stop the server, press Ctrl+C\n")
    
    try:
        # Run api.py and keep it running
        subprocess.run([sys.executable, "api.py"])
    except KeyboardInterrupt:
        print("\n\n[NeuroTalk] API Server stopped by user.")
    except Exception as e:
        print(f"\n[Error] Could not start API: {e}")

if __name__ == "__main__":
    main()
