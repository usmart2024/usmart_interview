FROM python:3.10.12-slim

RUN apt-get update \
    && apt-get install -y ffmpeg \
    && apt-get install -y portaudio19-dev build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

# Define o volume
VOLUME ["/app/data"]

CMD ["python", "app.py"]