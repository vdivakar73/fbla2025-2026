"""
Flask web application for literary sentiment analysis
"""
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.text_analyzer import LiteraryTextAnalyzer

app = Flask(__name__)
CORS(app)

# Initialize analyzer
analyzer = LiteraryTextAnalyzer()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Analyze text submitted via POST request
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        text_type = data.get('type', 'general')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Perform analysis
        results = analyzer.analyze_complete(text, text_type=text_type)
        summary = analyzer.generate_summary(results)
        
        return jsonify({
            'success': True,
            'results': results,
            'summary': summary
        })
    
    except Exception as e:
        """
        Flask server removed.

        This repository is now a static website. Open `sentiment-analyzer.html` in your browser.

        The original Flask server has been intentionally disabled/removed per project configuration.
        """
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    print("Starting Literary Sentiment Analysis Web Server...")
    print("Open your browser to: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
