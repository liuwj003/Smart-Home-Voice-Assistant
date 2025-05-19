FROM python:3.9-slim

WORKDIR /app

# Install system dependencies including ffmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    build-essential \
    portaudio19-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -U openai-whisper dataoceanai-dolphin huggingface_hub
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY nlp_service/ ./nlp_service/

# Set environment variables
ENV NLP_SERVICE_HOST=0.0.0.0
ENV NLP_SERVICE_PORT=8000

# Expose port
EXPOSE 8000

# Run the application
WORKDIR /app/nlp_service
CMD ["python", "start_service.py"] 