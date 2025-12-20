"""
Emotion detection using machine learning
Detects emotions like joy, sadness, anger, fear, surprise
"""
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import pickle
import os
from textblob import TextBlob


class EmotionDetector:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 3))
        self.classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        self.emotion_keywords = self._load_emotion_keywords()
        
    def _load_emotion_keywords(self):
        """
        Define emotion keywords for literary analysis
        """
        return {
            'joy': ['happy', 'joyful', 'cheerful', 'delighted', 'pleased', 'glad',
                   'merry', 'jubilant', 'ecstatic', 'blissful', 'content', 'smile',
                   'laugh', 'bright', 'sunshine', 'celebration', 'love', 'peace'],
            
            'sadness': ['sad', 'unhappy', 'sorrowful', 'melancholy', 'gloomy', 'depressed',
                       'miserable', 'tearful', 'grief', 'mourn', 'despair', 'heartbroken',
                       'lonely', 'dark', 'tears', 'cry', 'weep', 'sorrow', 'loss'],
            
            'anger': ['angry', 'furious', 'mad', 'enraged', 'irritated', 'annoyed',
                     'frustrated', 'hostile', 'rage', 'wrath', 'fury', 'outrage',
                     'hate', 'bitter', 'resentment', 'storm', 'fire', 'violent'],
            
            'fear': ['afraid', 'scared', 'fearful', 'terrified', 'frightened', 'anxious',
                    'worried', 'nervous', 'panic', 'dread', 'horror', 'terror',
                    'nightmare', 'shadow', 'darkness', 'threat', 'danger', 'tremble'],
            
            'surprise': ['surprised', 'amazed', 'astonished', 'shocked', 'stunned',
                        'startled', 'unexpected', 'sudden', 'wonder', 'awe',
                        'marvel', 'bewildered', 'extraordinary', 'remarkable'],
            
            'love': ['love', 'affection', 'adore', 'cherish', 'devotion', 'passion',
                    'romance', 'tender', 'heart', 'dear', 'beloved', 'kiss',
                    'embrace', 'warmth', 'gentle', 'care', 'sweet'],
            
            'hope': ['hope', 'optimism', 'faith', 'trust', 'believe', 'dream',
                    'aspire', 'wish', 'future', 'light', 'dawn', 'promise',
                    'courage', 'strength', 'persevere', 'possibility']
        }
    
    def train(self, texts, labels):
        """
        Train the emotion classifier
        texts: list of text samples
        labels: list of emotion labels
        """
        # Vectorize texts
        X = self.vectorizer.fit_transform(texts)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, labels, test_size=0.2, random_state=42
        )
        
        # Train classifier
        self.classifier.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.classifier.predict(X_test)
        print("Emotion Detection Model Performance:")
        print(classification_report(y_test, y_pred))
        
        return self.classifier.score(X_test, y_test)
    
    def predict_emotion(self, text):
        """
        Predict emotion from text using keyword matching and ML
        """
        # Keyword-based emotion scores
        keyword_scores = {}
        text_lower = text.lower()
        
        for emotion, keywords in self.emotion_keywords.items():
            score = sum(text_lower.count(keyword) for keyword in keywords)
            keyword_scores[emotion] = score
        
        # Normalize scores
        total_score = sum(keyword_scores.values())
        if total_score > 0:
            keyword_probs = {k: v/total_score for k, v in keyword_scores.items()}
        else:
            keyword_probs = {k: 0 for k in keyword_scores.keys()}
        
        # Get primary emotion
        primary_emotion = max(keyword_probs, key=keyword_probs.get)
        confidence = keyword_probs[primary_emotion]
        
        # Get secondary emotions (those with score > 0)
        secondary_emotions = {k: v for k, v in keyword_probs.items() 
                            if v > 0 and k != primary_emotion}
        
        return {
            'primary_emotion': primary_emotion,
            'confidence': confidence,
            'all_emotions': keyword_probs,
            'secondary_emotions': secondary_emotions
        }
    
    def analyze_emotional_arc(self, text, chunk_size=100):
        """
        Analyze how emotions change throughout the text
        Useful for tracking emotional journey in stories and poems
        """
        from nltk.tokenize import word_tokenize
        
        words = word_tokenize(text)
        chunks = []
        
        # Split into chunks
        for i in range(0, len(words), chunk_size):
            chunk = ' '.join(words[i:i + chunk_size])
            chunks.append(chunk)
        
        # Analyze each chunk
        emotional_arc = []
        for i, chunk in enumerate(chunks):
            emotion_data = self.predict_emotion(chunk)
            emotional_arc.append({
                'position': i / len(chunks),  # Normalized position (0 to 1)
                'chunk_number': i + 1,
                'primary_emotion': emotion_data['primary_emotion'],
                'emotions': emotion_data['all_emotions']
            })
        
        return emotional_arc
    
    def get_dominant_emotions(self, text, top_n=3):
        """
        Get the top N dominant emotions in the text
        """
        result = self.predict_emotion(text)
        sorted_emotions = sorted(
            result['all_emotions'].items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return sorted_emotions[:top_n]
    
    def analyze_subjectivity(self, text):
        """
        Analyze subjectivity and polarity using TextBlob
        """
        blob = TextBlob(text)
        
        return {
            'subjectivity': blob.sentiment.subjectivity,  # 0 = objective, 1 = subjective
            'polarity': blob.sentiment.polarity,  # -1 = negative, 1 = positive
            'assessment': self._assess_subjectivity(blob.sentiment.subjectivity)
        }
    
    def _assess_subjectivity(self, score):
        """
        Provide interpretation of subjectivity score
        """
        if score < 0.3:
            return "Highly objective (factual, analytical)"
        elif score < 0.5:
            return "Somewhat objective (balanced perspective)"
        elif score < 0.7:
            return "Somewhat subjective (personal opinions present)"
        else:
            return "Highly subjective (emotional, opinionated)"
    
    def save_model(self, model_path='models/emotion_model.pkl',
                   vectorizer_path='models/emotion_vectorizer.pkl'):
        """
        Save trained model and vectorizer
        """
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        with open(model_path, 'wb') as f:
            pickle.dump(self.classifier, f)
        
        with open(vectorizer_path, 'wb') as f:
            pickle.dump(self.vectorizer, f)
        
        print(f"Emotion model saved to {model_path}")
    
    def load_model(self, model_path='models/emotion_model.pkl',
                   vectorizer_path='models/emotion_vectorizer.pkl'):
        """
        Load pre-trained model and vectorizer
        """
        if os.path.exists(model_path):
            with open(model_path, 'rb') as f:
                self.classifier = pickle.load(f)
            print(f"Emotion model loaded from {model_path}")
        
        if os.path.exists(vectorizer_path):
            with open(vectorizer_path, 'rb') as f:
                self.vectorizer = pickle.load(f)
            print(f"Vectorizer loaded from {vectorizer_path}")


if __name__ == "__main__":
    # Example usage
    detector = EmotionDetector()
    
    # Test with a poem
    poem = """
    The woods are lovely, dark and deep,
    But I have promises to keep,
    And miles to go before I sleep,
    And miles to go before I sleep.
    """
    
    print("Analyzing emotions in poem...")
    result = detector.predict_emotion(poem)
    print(f"\nPrimary emotion: {result['primary_emotion']}")
    print(f"Confidence: {result['confidence']:.2%}")
    print(f"\nAll emotions detected:")
    for emotion, score in result['all_emotions'].items():
        if score > 0:
            print(f"  {emotion}: {score:.2%}")
    
    print("\n\nSubjectivity analysis:")
    subjectivity = detector.analyze_subjectivity(poem)
    print(f"Subjectivity: {subjectivity['subjectivity']:.2f}")
    print(f"Assessment: {subjectivity['assessment']}")
