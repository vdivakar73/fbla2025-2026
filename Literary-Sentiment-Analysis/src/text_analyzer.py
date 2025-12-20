"""
Complete text analyzer combining sentiment and emotion analysis
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.preprocessing import TextPreprocessor, analyze_poetic_structure
from src.sentiment_model import LiterarySentimentAnalyzer
from src.emotion_detector import EmotionDetector
import json
from datetime import datetime


class LiteraryTextAnalyzer:
    def __init__(self):
        self.preprocessor = TextPreprocessor(remove_stopwords=False, lemmatize=True)
        self.sentiment_analyzer = LiterarySentimentAnalyzer()
        self.emotion_detector = EmotionDetector()
        
    def analyze_complete(self, text, text_type='general'):
        """
        Perform complete analysis on a literary text
        text_type: 'poem', 'book', 'story', 'essay', 'general'
        """
        print(f"Analyzing {text_type}...")
        
        results = {
            'metadata': {
                'analyzed_at': datetime.now().isoformat(),
                'text_type': text_type,
                'text_length': len(text)
            }
        }
        
        # Basic preprocessing
        print("  • Preprocessing text...")
        results['features'] = self.preprocessor.extract_features(text)
        
        # Poetic structure (if applicable)
        if text_type == 'poem':
            print("  • Analyzing poetic structure...")
            results['poetic_structure'] = analyze_poetic_structure(text)
        
        # Sentiment analysis
        print("  • Analyzing sentiment...")
        results['sentiment'] = self.sentiment_analyzer.get_overall_sentiment(text)
        
        # Emotion detection
        print("  • Detecting emotions...")
        emotion_result = self.emotion_detector.predict_emotion(text)
        results['emotions'] = {
            'primary_emotion': emotion_result['primary_emotion'],
            'confidence': emotion_result['confidence'],
            'all_emotions': emotion_result['all_emotions'],
            'top_emotions': self.emotion_detector.get_dominant_emotions(text, top_n=3)
        }
        
        # Subjectivity analysis
        print("  • Analyzing subjectivity...")
        results['subjectivity'] = self.emotion_detector.analyze_subjectivity(text)
        
        # Emotional arc (for longer texts)
        if results['features']['word_count'] > 200:
            print("  • Tracking emotional arc...")
            results['emotional_arc'] = self.emotion_detector.analyze_emotional_arc(text)
        
        print("✓ Analysis complete!")
        return results
    
    def generate_summary(self, analysis_results):
        """
        Generate a human-readable summary of the analysis
        """
        results = analysis_results
        
        summary = []
        summary.append("=" * 60)
        summary.append("LITERARY TEXT ANALYSIS SUMMARY")
        summary.append("=" * 60)
        
        # Text statistics
        summary.append("\n📊 TEXT STATISTICS:")
        features = results['features']
        summary.append(f"  • Word count: {features['word_count']}")
        summary.append(f"  • Sentence count: {features['sentence_count']}")
        summary.append(f"  • Average sentence length: {features['avg_sentence_length']:.1f} words")
        summary.append(f"  • Lexical diversity: {features['lexical_diversity']:.2%}")
        
        # Poetic structure (if available)
        if 'poetic_structure' in results:
            summary.append("\n📝 POETIC STRUCTURE:")
            ps = results['poetic_structure']
            summary.append(f"  • Lines: {ps['line_count']}")
            summary.append(f"  • Stanzas: {ps['stanza_count']}")
            summary.append(f"  • Average lines per stanza: {ps['avg_lines_per_stanza']:.1f}")
        
        # Sentiment
        summary.append("\n💭 SENTIMENT ANALYSIS:")
        sentiment = results['sentiment']
        summary.append(f"  • Overall sentiment: {sentiment['overall_sentiment'].upper()}")
        summary.append(f"  • Distribution:")
        for sent_type, score in sentiment['distribution'].items():
            summary.append(f"      - {sent_type.capitalize()}: {score:.1%}")
        
        # Emotions
        summary.append("\n😊 EMOTION ANALYSIS:")
        emotions = results['emotions']
        summary.append(f"  • Primary emotion: {emotions['primary_emotion'].upper()}")
        summary.append(f"  • Confidence: {emotions['confidence']:.1%}")
        summary.append(f"  • Top 3 emotions:")
        for emotion, score in emotions['top_emotions']:
            if score > 0:
                summary.append(f"      - {emotion.capitalize()}: {score:.1%}")
        
        # Subjectivity
        summary.append("\n🎭 SUBJECTIVITY:")
        subj = results['subjectivity']
        summary.append(f"  • Score: {subj['subjectivity']:.2f}")
        summary.append(f"  • Assessment: {subj['assessment']}")
        summary.append(f"  • Polarity: {subj['polarity']:.2f} (emotional tone)")
        
        # Emotional arc (if available)
        if 'emotional_arc' in results:
            summary.append("\n📈 EMOTIONAL JOURNEY:")
            arc = results['emotional_arc']
            summary.append(f"  • Beginning: {arc[0]['primary_emotion']}")
            summary.append(f"  • Middle: {arc[len(arc)//2]['primary_emotion']}")
            summary.append(f"  • End: {arc[-1]['primary_emotion']}")
        
        summary.append("\n" + "=" * 60)
        
        return "\n".join(summary)
    
    def analyze_file(self, filepath, output_format='text'):
        """
        Analyze a text file
        output_format: 'text', 'json', or 'both'
        """
        # Detect file type from extension
        ext = os.path.splitext(filepath)[1].lower()
        text_type_map = {
            '.poem': 'poem',
            '.txt': 'general',
            '.md': 'general'
        }
        text_type = text_type_map.get(ext, 'general')
        
        # Read file
        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # Analyze
        results = self.analyze_complete(text, text_type=text_type)
        
        # Generate output
        if output_format in ['text', 'both']:
            summary = self.generate_summary(results)
            print(summary)
            
            # Save to file
            output_path = filepath.replace(ext, '_analysis.txt')
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(summary)
            print(f"\n✓ Analysis saved to: {output_path}")
        
        if output_format in ['json', 'both']:
            json_path = filepath.replace(ext, '_analysis.json')
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2)
            print(f"✓ JSON results saved to: {json_path}")
        
        return results
    
    def compare_texts(self, texts, labels=None):
        """
        Compare sentiment and emotions across multiple texts
        """
        if labels is None:
            labels = [f"Text {i+1}" for i in range(len(texts))]
        
        comparisons = []
        
        for text, label in zip(texts, labels):
            result = {
                'label': label,
                'sentiment': self.sentiment_analyzer.predict_sentiment(text),
                'emotion': self.emotion_detector.predict_emotion(text),
                'features': self.preprocessor.extract_features(text)
            }
            comparisons.append(result)
        
        return comparisons


if __name__ == "__main__":
    # Example usage
    analyzer = LiteraryTextAnalyzer()
    
    # Sample poem
    poem = """
    Shall I compare thee to a summer's day?
    Thou art more lovely and more temperate:
    Rough winds do shake the darling buds of May,
    And summer's lease hath all too short a date
    """
    
    print("Analyzing Shakespeare's Sonnet 18 (excerpt)...\n")
    results = analyzer.analyze_complete(poem, text_type='poem')
    summary = analyzer.generate_summary(results)
    print(summary)
