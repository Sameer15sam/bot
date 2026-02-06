"""
Clean Multilingual Chatbot Backend
Simple Flask API with Groq integration
"""
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from llm_service import LLMService
import config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, static_folder='static')
CORS(app)

# Initialize LLM service
llm = LLMService()

logger.info("✅ Chatbot server starting...")
logger.info(f"✅ Using Groq model: {config.GROQ_MODEL}")
logger.info(f"✅ Supported languages: {list(config.SUPPORTED_LANGUAGES.keys())}")


@app.route('/')
def index():
    """Serve the frontend"""
    return send_from_directory('static', 'index.html')


@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint
    Expects JSON: {"message": "user message", "language": "en", "user_id": "optional"}
    Returns JSON: {"response": "ai response"}
    """
    try:
        data = request.json
        
        # Validate input
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data.get('message', '').strip()
        language = data.get('language', 'en')
        user_id = data.get('user_id', 'default')
        
        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        if language not in config.SUPPORTED_LANGUAGES:
            language = 'en'
        
        logger.info(f"Received message: {user_message[:50]}... (language: {language})")
        
        # Get AI response
        ai_response = llm.get_response(user_message, language, user_id)
        
        return jsonify({
            'response': ai_response,
            'language': language
        })
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/clear_history', methods=['POST'])
def clear_history():
    """Clear conversation history for a user"""
    try:
        data = request.json or {}
        user_id = data.get('user_id', 'default')
        
        llm.clear_history(user_id)
        
        return jsonify({'message': 'History cleared'})
        
    except Exception as e:
        logger.error(f"Error clearing history: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/status', methods=['GET'])
def status():
    """Compatibility endpoint for frontend health check"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': True,
        'model': config.GROQ_MODEL
    })

@app.route('/api/process_text', methods=['POST'])
def process_text():
    """Compatibility endpoint for text chat"""
    try:
        data = request.json
        user_message = data.get('text', '').strip()
        language = data.get('language', 'en')  # Get language from frontend
        user_id = data.get('user_id', 'default')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Validate language
        if language not in config.SUPPORTED_LANGUAGES:
            language = 'en'

        logger.info(f"Received text request: {user_message[:50]}... (language: {language})")
        
        # Get AI response with correct language
        ai_response = llm.get_response(user_message, language, user_id)
        # Generate TTS audio using gTTS
        from gtts import gTTS
        import base64
        import io
        try:
            # Map language codes
            lang_map = {'en': 'en', 'hi': 'hi', 'kn': 'kn', 'te': 'te', 'ta': 'ta', 
                        'ml': 'ml', 'mr': 'mr', 'bn': 'bn', 'gu': 'gu', 'pa': 'hi'}
            tts_lang = lang_map.get(language, 'en')
            
            # Generate TTS
            tts = gTTS(text=ai_response, lang=tts_lang, slow=False, timeout=5)
            audio_fp = io.BytesIO()
            tts.write_to_fp(audio_fp)
            audio_fp.seek(0)
            audio_base64 = base64.b64encode(audio_fp.read()).decode('utf-8')
            audio_mime = 'audio/mpeg'
        except Exception as e:
            logger.error(f"TTS generation failed: {e}")
            audio_base64 = None
            audio_mime = None
        # Return format expected by frontend
        return jsonify({
            'response_text': ai_response,
            'detected_language': language,
            'user_language': language,
            'audio_response': audio_base64,
            'audio_mime': audio_mime,
            'web_search_sources': []
        })
                
    except Exception as e:
        logger.error(f"Error in process_text: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/process_audio', methods=['POST'])
def process_audio():
    """Process audio input - transcribe and chat (multilingual)"""
    try:
        # Check if audio file is present
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        
        if audio_file.filename == '':
            return jsonify({'error': 'Empty audio file'}), 400
        
        logger.info(f"Received audio file: {audio_file.filename}")
        
        # Import STT service
        from stt_service import STTService
        stt = STTService()
        
        # Get language hint from request
        language_hint = request.form.get('language')
        if language_hint == '':
            language_hint = None
            
        logger.info(f"Processing audio with language hint: {language_hint}")
        
        # Transcribe audio
        transcribed_text, detected_language = stt.transcribe(audio_file, language=language_hint)
        
        if not transcribed_text:
            return jsonify({'error': 'Could not transcribe audio'}), 400
        
        logger.info(f"Transcribed ({detected_language}): {transcribed_text}")
        
        # Get AI response in the detected language
        user_id = request.form.get('user_id', 'default')
        ai_response = llm.get_response(transcribed_text, detected_language, user_id)
        
        # Return both transcription and response
        # Generate TTS audio for the response
        from gtts import gTTS
        import base64
        import io
        try:
            lang_map = {'en': 'en', 'hi': 'hi', 'kn': 'kn', 'te': 'te', 'ta': 'ta',
                        'ml': 'ml', 'mr': 'mr', 'bn': 'bn', 'gu': 'gu', 'pa': 'hi'}
            tts_lang = lang_map.get(detected_language, 'en')
            
            tts = gTTS(text=ai_response, lang=tts_lang, slow=False, timeout=5)
            audio_fp = io.BytesIO()
            tts.write_to_fp(audio_fp)
            audio_fp.seek(0)
            audio_base64 = base64.b64encode(audio_fp.read()).decode('utf-8')
            audio_mime = 'audio/mpeg'
        except Exception as e:
            logger.error(f"TTS generation failed: {e}")
            audio_base64 = None
            audio_mime = None
        return jsonify({
            'response_text': ai_response,
            'detected_language': detected_language,
            'user_language': detected_language,
            'audio_response': audio_base64,
            'audio_mime': audio_mime,
            'web_search_sources': []
        })
        
    except Exception as e:
        logger.error(f"Error in process_audio: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/api/tts_only', methods=['POST'])
def tts_only():
    """Generate TTS audio for any text (multilingual)"""
    try:
        data = request.json
        text = data.get('text', '').strip()
        language = data.get('language', 'en')
        speed = data.get('speed', 1.0)
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        logger.info(f"TTS request: {text[:50]}... (lang: {language}, speed: {speed})")
        
        # Use gTTS for multilingual support
        from gtts import gTTS
        import base64
        import io
        
        # Map language codes to gTTS supported codes
        lang_map = {
            'en': 'en',
            'hi': 'hi',
            'kn': 'kn',  # Kannada
            'te': 'te',  # Telugu
            'ta': 'ta',  # Tamil
            'ml': 'ml',  # Malayalam
            'mr': 'mr',  # Marathi
            'bn': 'bn',  # Bengali
            'gu': 'gu',  # Gujarati
            'pa': 'pa',  # Punjabi (not supported by gTTS, fallback to Hindi)
        }

        tts_lang = lang_map.get(language, 'en')
        if language == 'pa':  # Punjabi not supported, use Hindi
            tts_lang = 'hi'
            logger.warning(f"Punjabi TTS not supported, using Hindi")

        # Generate TTS
        tts = gTTS(text=text, lang=tts_lang, slow=False, timeout=5)
        
        # Save to BytesIO
        audio_fp = io.BytesIO()
        tts.write_to_fp(audio_fp)
        audio_fp.seek(0)
        
        # Encode to base64
        audio_base64 = base64.b64encode(audio_fp.read()).decode('utf-8')
        
        return jsonify({
            'audio_response': audio_base64,
            'audio_mime': 'audio/mpeg'
        })
        
    except Exception as e:
        logger.error(f"TTS error: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info(f"🚀 Starting server on http://localhost:{config.PORT}")
    logger.info("✨ Clean chatbot ready!")
    app.run(host='0.0.0.0', port=config.PORT, debug=config.DEBUG)
