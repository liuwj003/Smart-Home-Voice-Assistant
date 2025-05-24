FROM python:3.9-slim

WORKDIR /app

# Install system dependencies including ffmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    build-essential \
    portaudio19-dev \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -U openai-whisper dataoceanai-dolphin huggingface_hub
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY nlp_service/ ./nlp_service/

# 添加健康检查端点
RUN echo 'from fastapi import FastAPI\nimport uvicorn\nfrom fastapi.middleware.cors import CORSMiddleware\napp = FastAPI()\napp.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])\n@app.get("/health")\ndef health_check():\n    return {"status": "healthy"}' > ./nlp_service/health_check.py

# Set environment variables
ENV NLP_SERVICE_HOST=0.0.0.0
ENV NLP_SERVICE_PORT=8010
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8010

# Run the application
WORKDIR /app/nlp_service
CMD ["python", "start_service.py"] 