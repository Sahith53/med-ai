from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import pandas as pd
from sentence_transformers import SentenceTransformer, util
from deep_translator import GoogleTranslator
import os

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)  # Enable CORS for frontend communication

# Load your data
df = pd.read_csv('dataset - Sheet1.csv')

# Initialize the SentenceTransformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Define medical keywords for fallback
medical_keywords = {
    "fever": "It sounds like you may have a fever. Stay hydrated and consider seeing a doctor if symptoms persist.",
    "cough": "A persistent cough might be due to an infection or allergy. Try warm fluids and rest.",
    "headache": "Headaches can have many causes, including stress and dehydration. Consider resting and drinking water.",
    "cold": "Common colds usually go away on their own. Stay warm, drink fluids, and get rest.",
}

# List of health tips categorized by keywords
health_tips = {
    "sleep": [
        "Try to get at least 7-8 hours of sleep each night.",
        "Establish a regular sleep routine to improve sleep quality.",
        "Avoid screens before bed to help your mind relax.",
    ],
    "energy": [
        "Make sure you're eating a balanced diet to maintain energy.",
        "Exercise regularly to boost your energy levels.",
        "Stay hydrated throughout the day to avoid fatigue.",
    ],
    "stress": [
        "Take short breaks throughout the day to reduce stress.",
        "Practice mindfulness or meditation to help manage stress.",
        "Engage in physical activity to reduce anxiety and stress.",
    ],
    "general": [
        "Drink plenty of water throughout the day.",
        "Get at least 30 minutes of exercise every day.",
        "Eat a balanced diet rich in fruits and vegetables.",
    ],
}

# Language codes (compatible with deep-translator)
language_codes = {
    "English": "en",
    "Hindi": "hi",
    "Gujarati": "gu",
    "Korean": "ko",
    "Turkish": "tr",
    "German": "de",
    "French": "fr",
    "Arabic": "ar",
    "Urdu": "ur",
    "Tamil": "ta",
    "Telugu": "te",
    "Chinese": "zh",  # deep-translator uses 'zh' instead of 'zh-CN'
    "Japanese": "ja",
}

def get_personalized_health_tip(user_input):
    """Get personalized health tip based on user input"""
    user_input_lower = user_input.lower()
    
    if "tired" in user_input_lower or "fatigue" in user_input_lower:
        return random.choice(health_tips["energy"])
    elif "sleep" in user_input_lower or "rest" in user_input_lower:
        return random.choice(health_tips["sleep"])
    elif "stress" in user_input_lower or "anxious" in user_input_lower:
        return random.choice(health_tips["stress"])
    else:
        return random.choice(health_tips["general"])

def find_best_cure(user_input):
    """Find the best cure based on similarity"""
    user_input_embedding = model.encode(user_input, convert_to_tensor=True)
    disease_embeddings = model.encode(df['disease'].tolist(), convert_to_tensor=True)
    
    similarities = util.pytorch_cos_sim(user_input_embedding, disease_embeddings)[0]
    best_match_idx = similarities.argmax().item()
    best_match_score = similarities[best_match_idx].item()
    
    SIMILARITY_THRESHOLD = 0.5
    
    if best_match_score < SIMILARITY_THRESHOLD:
        for keyword, response in medical_keywords.items():
            if keyword in user_input.lower():
                return response
        return "I'm sorry, I don't have enough information on this. Please consult a healthcare professional."
    
    return df.iloc[best_match_idx]['cure']

def translate_text(text, dest_language='en'):
    """Translate text to target language"""
    try:
        if dest_language == 'en':
            return text  # Already in English
        translator = GoogleTranslator(source='en', target=dest_language)
        return translator.translate(text)
    except Exception as e:
        print(f"Translation error: {e}")
        return text  # Return original text if translation fails

@app.route('/')
def index():
    """Serve the frontend"""
    return app.send_static_file('index.html')

@app.route('/style.css')
def style():
    """Serve CSS"""
    return app.send_static_file('style.css')

@app.route('/script.js')
def script():
    """Serve JavaScript"""
    return app.send_static_file('script.js')

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat requests"""
    try:
        data = request.json
        user_input = data.get('message', '')
        language = data.get('language', 'English')
        request_type = data.get('type', 'response')  # 'response' or 'tip'
        
        if not user_input:
            return jsonify({'error': 'Message is required'}), 400
        
        # Get response based on type
        if request_type == 'tip':
            response = get_personalized_health_tip(user_input)
            response_type = 'Health Tip'
        else:
            response = find_best_cure(user_input)
            response_type = 'Suggestion'
        
        # Translate response
        lang_code = language_codes.get(language, 'en')
        translated_response = translate_text(response, dest_language=lang_code)
        
        return jsonify({
            'response': translated_response,
            'type': response_type,
            'language': language
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/languages', methods=['GET'])
def get_languages():
    """Get list of supported languages"""
    return jsonify({'languages': list(language_codes.keys())})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

