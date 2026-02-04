from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='web', static_url_path='', template_folder='web')
CORS(app)

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
    """Send a message to the AI"""
    try:
        data = request.json
        user_message = data.get('message', '')
        
        # Here you would process the message through Pipcat
        # For now, return a mock response
        response = {
            'status': 'success',
            'reply': 'This is a demo response from Pipcat AI'
        }
        
        return jsonify(response)
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True') == 'True'
    app.run(host='0.0.0.0', port=port, debug=debug)
