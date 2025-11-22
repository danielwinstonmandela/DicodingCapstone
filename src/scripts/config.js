const CONFIG = {
  BASE_URL: 'https://story-api.dicoding.dev/v1',
  // Groq API key - completely FREE! Get one at https://console.groq.com/keys
  GROQ_API_KEY: process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE',
  GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions',
  GROQ_MODEL: 'llama-3.1-8b-instant', // Fast, free, and supported model
};

export default CONFIG;
