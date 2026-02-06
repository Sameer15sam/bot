"""
LLM Service for Pragna-1 A
Uses Groq API for fast, multilingual chat responses
"""
import logging
import requests
import config

logger = logging.getLogger(__name__)


class LLMService:
    """LLM Service using Groq API"""
    
    def __init__(self):
        self.api_key = config.GROQ_API_KEY
        self.model = config.GROQ_MODEL
        self.timeout = config.GROQ_TIMEOUT
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        
        # Conversation history per user
        self.conversation_history = {}
        self.max_history = config.CONVERSATION_HISTORY_SIZE
        
        if not self.api_key:
            logger.warning("⚠️ GROQ_API_KEY not set - LLM service will not work")
        else:
            logger.info(f"✅ LLM Service initialized with model: {self.model}")
    
    def _get_system_prompt(self, language: str) -> str:
        """Generate system prompt based on language"""
        lang_name = config.SUPPORTED_LANGUAGES.get(language, 'English')
        
        return f"""You are a helpful, friendly AI assistant that can communicate in multiple languages.
The user is communicating in {lang_name}. 
Please respond in {lang_name} to match the user's language.
Be concise, helpful, and natural in your responses.
If the user asks something you don't know, be honest about it.
For factual questions, provide accurate information."""
    
    def _get_history(self, user_id: str) -> list:
        """Get conversation history for a user"""
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = []
        return self.conversation_history[user_id]
    
    def _add_to_history(self, user_id: str, role: str, content: str):
        """Add a message to conversation history"""
        history = self._get_history(user_id)
        history.append({"role": role, "content": content})
        
        # Trim history if too long (keep last N messages)
        if len(history) > self.max_history * 2:
            self.conversation_history[user_id] = history[-self.max_history * 2:]
    
    def clear_history(self, user_id: str):
        """Clear conversation history for a user"""
        if user_id in self.conversation_history:
            del self.conversation_history[user_id]
            logger.info(f"Cleared history for user: {user_id}")
    
    def get_response(self, message: str, language: str = 'en', user_id: str = 'default') -> str:
        """
        Get AI response for a user message
        
        Args:
            message: User's message
            language: Language code (en, hi, kn, etc.)
            user_id: User identifier for conversation history
            
        Returns:
            AI response string
        """
        if not self.api_key:
            return "Sorry, the AI service is not configured. Please set GROQ_API_KEY."
        
        try:
            # Build messages with history
            system_prompt = self._get_system_prompt(language)
            messages = [{"role": "system", "content": system_prompt}]
            
            # Add conversation history
            history = self._get_history(user_id)
            messages.extend(history[-10:])  # Last 5 exchanges (10 messages)
            
            # Add current message
            messages.append({"role": "user", "content": message})
            
            # Make API request
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 1024,
                "top_p": 0.9
            }
            
            logger.info(f"Sending request to Groq API with model: {self.model}")
            
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=self.timeout
            )
            
            response.raise_for_status()
            result = response.json()
            
            # Extract response text
            ai_response = result['choices'][0]['message']['content'].strip()
            
            # Update conversation history
            self._add_to_history(user_id, "user", message)
            self._add_to_history(user_id, "assistant", ai_response)
            
            logger.info(f"Got response: {ai_response[:100]}...")
            return ai_response
            
        except requests.exceptions.Timeout:
            logger.error("Groq API request timed out")
            return "Sorry, the request timed out. Please try again."
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Groq API error: {e}")
            return "Sorry, I encountered an error. Please try again later."
            
        except Exception as e:
            logger.error(f"Unexpected error in get_response: {e}", exc_info=True)
            return "Sorry, something went wrong. Please try again."
