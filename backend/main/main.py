import os
import ffmpeg
from resnet50.load_resnet50 import load_resnet50_model
from tsm.load_tsm import load_TSM
from pipeline.pipeline import pipeline
import subprocess
import json

video_path1 = r"C:\Users\hoang\Downloads\Vid 11m.mp4"
video_path2 = video_path1

print("Video info loaded!")

# Load models
print("Models loaded. Starting processing...")

# Run pipeline
result1 = pipeline(video_path1)
print("Pipeline results:", result1)

result2 = pipeline(video_path2)
print("Pipeline results:", result2)