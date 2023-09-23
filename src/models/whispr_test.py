from gradio_client import Client
import os

API_URL = "https://sanchit-gandhi-whisper-jax.hf.space/"

client = Client(API_URL)

audio_path = "src/models/stut1.mp3"
text, runtime = client.predict(audio_path, "transcribe",False,api_name="/predict_1")
print(text)
print(runtime)
