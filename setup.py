from setuptools import setup, find_packages

setup(
    name="smart-home-voice-assistant",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi==0.95.1",
        "uvicorn==0.22.0",
        "pydantic==1.10.7",
        "python-dotenv==1.0.0",
        "requests==2.30.0",
        "websockets==11.0.3",
        "python-multipart==0.0.6",
        "pytest==7.3.1",
        "httpx==0.24.0",
        "python-jose==3.3.0",
        "passlib==1.7.4",
        "bcrypt==4.0.1",
        "sqlalchemy==2.0.12",
        "aiosqlite==0.19.0",
        "SpeechRecognition==3.10.0"
    ],
    python_requires=">=3.8",
) 