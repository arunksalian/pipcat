from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import tempfile

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='web', static_url_path='', template_folder='web')
CORS(app)

# Configure upload settings
UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'webm', 'wav', 'mp3', 'ogg', 'm4a'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

@app.route('/')
def index():
    """Serve the main HTML page"""
    return render_template('index.html')

@app.route('/api/start', methods=['POST'])
def start_conversation():
    """Start a new conversation"""
    try:
        # Here you would initialize the Pipcat pipeline
        # For now, return a success response
        return jsonify({
            'status': 'success',
            'message': 'Conversation started'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/stop', methods=['POST'])
def stop_conversation():
    """Stop the current conversation"""
    try:
        return jsonify({
            'status': 'success',
            'message': 'Conversation stopped'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/message', methods=['POST'])
def send_message():
    """Send a message or audio to the AI"""
    try:
        # Check if this is an audio file upload
        if 'audio' in request.files:
            audio_file = request.files['audio']
            
            if audio_file.filename == '':
                return jsonify({
                    'status': 'error',
                    'message': 'No audio file provided'
                }), 400
            
            # Save the audio file temporarily
            filename = secure_filename(audio_file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            audio_file.save(filepath)
            
            # Get file info
            file_size = os.path.getsize(filepath)
            print(f"Received audio file: {filename} ({file_size} bytes)")
            
            # Here you would:
            # 1. Send audio to STT service (e.g., OpenAI Whisper, Deepgram, etc.)
            # 2. Get transcript
            # 3. Send transcript to LLM
            # 4. Get LLM response
            # 5. Send response to TTS service
            # 6. Return transcript and reply
            
            # For now, return a mock response
            # TODO: Integrate with Pipcat pipeline for real STT/LLM/TTS processing
            response = {
                'status': 'success',
                'transcript': '[Voice message received - STT integration pending]',
                'reply': 'I received your voice message! Audio processing is working. To enable full functionality, integrate with an STT service (like OpenAI Whisper or Deepgram) and your LLM provider.'
            }
            
            # Clean up temporary file
            try:
                os.remove(filepath)
            except:
                pass
            
            return jsonify(response)
        
        # Handle text message (fallback)
        elif request.is_json:
            data = request.json
            user_message = data.get('message', '')
            
            # Here you would process the message through Pipcat
            # For now, return a mock response
            response = {
                'status': 'success',
                'reply': 'This is a demo response from Pipcat AI'
            }
            
            return jsonify(response)
        else:
            return jsonify({
                'status': 'error',
                'message': 'Invalid request format'
            }), 400
            
    except Exception as e:
        print(f"Error processing message: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True') == 'True'
    app.run(host='0.0.0.0', port=port, debug=debug)
