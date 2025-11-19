# ==========================
# Dockerfile for FastAPI backend
# ==========================

# 1️⃣ Base image
FROM python:3.10-slim

# 2️⃣ Install ffmpeg + system libs (for OpenCV)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 3️⃣ Set working directory
WORKDIR /app

# 4️⃣ Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5️⃣ Copy all backend source code
COPY . .

# 6️⃣ Expose port (FastAPI default 8000)
EXPOSE 8000

# 7️⃣ Run app
CMD ["uvicorn", "main.server:app", "--host", "0.0.0.0", "--port", "8000"]
