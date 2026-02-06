"""
Configuration module for Pragna-1 A
Loads settings from .env file
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Flask Configuration
HOST = os.getenv('FLASK_HOST', '0.0.0.0')
PORT = int(os.getenv('FLASK_PORT', 5000))
DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'

# Groq Configuration (Primary LLM)
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
GROQ_MODEL = os.getenv('GROQ_MODEL', 'llama-3.1-8b-instant')
GROQ_TIMEOUT = int(os.getenv('GROQ_TIMEOUT', 60))

# OpenAI Configuration (Fallback/Alternative)
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o')
OPENAI_TTS_MODEL = os.getenv('OPENAI_TTS_MODEL', 'tts-1')
OPENAI_TTS_VOICE = os.getenv('OPENAI_TTS_VOICE', 'alloy')
OPENAI_TIMEOUT = int(os.getenv('OPENAI_TIMEOUT', 60))

# Serper API Configuration (Google Search)
SERPER_API_KEY = os.getenv('SERPER_API_KEY', '')
SERPER_ENABLED = os.getenv('SERPER_ENABLED', 'True').lower() == 'true'
SERPER_TIMEOUT = int(os.getenv('SERPER_TIMEOUT', 10))

# Whisper Configuration for STT
WHISPER_MODEL_SIZE = os.getenv('WHISPER_MODEL_SIZE', 'base')

# Audio Configuration
AUDIO_SAMPLE_RATE = int(os.getenv('AUDIO_SAMPLE_RATE', 16000))

# Logging Configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# Conversation History
CONVERSATION_HISTORY_SIZE = int(os.getenv('CONVERSATION_HISTORY_SIZE', 100))

# Supported Languages
SUPPORTED_LANGUAGES = {
    'en': 'English',
    'hi': 'Hindi',
    'kn': 'Kannada',
    'te': 'Telugu',
    'ta': 'Tamil',
    'ml': 'Malayalam',
    'mr': 'Marathi',
    'bn': 'Bengali',
    'gu': 'Gujarati',
    'pa': 'Punjabi'
}

# Language to Whisper code mapping
LANGUAGE_CODES = {
    'en': 'english',
    'hi': 'hindi',
    'kn': 'kannada',
    'te': 'telugu',
    'ta': 'tamil',
    'ml': 'malayalam',
    'mr': 'marathi',
    'bn': 'bengali',
    'gu': 'gujarati',
    'pa': 'punjabi'
}
