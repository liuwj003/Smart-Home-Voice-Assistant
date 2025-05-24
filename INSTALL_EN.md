# Smart Home Voice Assistant Installation Guide

This guide provides step-by-step instructions for setting up the Smart Home Voice Assistant on your local machine for development and testing purposes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Java JDK 17+** - Required for the backend server
- **Maven** - For Java dependency management
- **Node.js (14+) and npm** - For the frontend React application
- **Python 3.9** - For the NLP service
- **Microsoft Visual C++ Build Tools**:
  - MSVC v143 - VS 2022 C++ x64/x86 build tools
  - Windows 10 SDK
  - C++ CMake tools for Windows
- **Git** - For version control

## Setup Options

You can install this project using either the traditional method or using Docker. Choose the option that best suits your needs.

### Option 1: Traditional Installation

#### Step 1: Clone the Repository

```bash
git clone https://github.com/your-repo/SmartHomeVoiceAssistant.git
cd SmartHomeVoiceAssistant
```

#### Step 2: Set Up Python Environment

Create a Python virtual environment and install dependencies:

```bash
# Create and activate a Conda environment (recommended)
conda create -n voice-app python=3.9
conda activate voice-app
conda install -c conda-forge ffmpeg

# Install Python dependencies
pip install -U openai-whisper dataoceanai-dolphin huggingface_hub
pip install -r requirements.txt
```

> **Note**: If not using Conda, make sure ffmpeg is installed and added to your system PATH.

#### Step 3: Set Up Backend

Navigate to the backend directory and build with Maven:

```bash
cd backend
mvn clean install
```

#### Step 4: Set Up Frontend

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

#### Step 5: Start the Application

You can start all components using the provided batch file:

```bash
# From the project root directory
run.bat
```

This will launch:
- The NLP service on port 8010
- The Java backend on port 8080
- The React frontend on port 3000

### Option 2: Docker Installation

#### Prerequisites

Ensure Docker and Docker Compose are installed on your machine.

#### Step 1: Clone the Repository

```bash
git clone https://github.com/your-repo/SmartHomeVoiceAssistant.git
cd SmartHomeVoiceAssistant
```

#### Step 2: Start with Docker Compose

```bash
docker-compose up -d
```

This will build and start all necessary containers:
- nlp-service - NLP processing on port 8010
- backend - Java Spring Boot backend on port 8080
- frontend - React frontend on port 3000

## Configuration

### NLP Service Configuration

Configuration for the NLP service can be found in:
- `nlp_service/src/config.py`

### Backend Configuration

The backend server can be configured in:
- `backend/src/main/resources/application.yml`

### Frontend Configuration

The frontend configuration is located in:
- `frontend/.env`

## Verification

To verify your installation is working:

1. Visit `http://localhost:3000` in your browser to access the frontend interface
2. Test the backend API at `http://localhost:8080/api`
3. Check the NLP service health at `http://localhost:8010/health`

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 8010, and 8080 are not being used by other applications.

2. **Python dependencies**: If you encounter issues with Python dependencies, try:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt --ignore-installed
   ```

3. **ffmpeg issues**: Ensure ffmpeg is correctly installed and available in your PATH.

4. **Java version**: Make sure you're using Java 17 or higher. Check with:
   ```bash
   java -version
   ```

5. **Memory issues**: For large models, you may need to allocate more memory:
   ```bash
   # For Java backend
   export JAVA_OPTS="-Xmx4g"
   ```

### Getting Help

If you encounter issues not covered here, please:
1. Check the project documentation in the `docs/` directory
2. Review existing issues in the project repository
3. Contact the project maintainers for assistance

## Additional Resources

- Full documentation is available in the `docs/` directory
- API documentation can be accessed at `http://localhost:8080/api/docs` after starting the backend
- Test examples are available in the `tests/` directory 