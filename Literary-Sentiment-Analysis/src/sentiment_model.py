"""
Sentiment analysis model using TensorFlow and Scikit-learn
"""
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Embedding, LSTM, Dense, Dropout, Bidirectional
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.model_selection import train_test_split
from nltk.sentiment import SentimentIntensityAnalyzer
import pickle
import os


class LiterarySentimentAnalyzer:
    def __init__(self, max_words=10000, max_len=200):
        self.max_words = max_words
        self.max_len = max_len
        self.tokenizer = Tokenizer(num_words=max_words)
        self.model = None
        self.vader = SentimentIntensityAnalyzer()
        
    def build_model(self, embedding_dim=128):
        """
        Build LSTM model for deep sentiment analysis
        """
        model = Sequential([
            Embedding(self.max_words, embedding_dim, input_length=self.max_len),
            Bidirectional(LSTM(64, return_sequences=True)),
            Dropout(0.5),
            Bidirectional(LSTM(32)),
            Dropout(0.5),
            Dense(64, activation='relu'),
            Dropout(0.3),
            Dense(3, activation='softmax')  # positive, negative, neutral
        ])
        
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        self.model = model
        return model
    
    def prepare_data(self, texts, labels):
        """
        Prepare text data for training
        """
        # Fit tokenizer on texts
        self.tokenizer.fit_on_texts(texts)
        
        # Convert texts to sequences
        sequences = self.tokenizer.texts_to_sequences(texts)
        
        # Pad sequences
        X = pad_sequences(sequences, maxlen=self.max_len, padding='post')
        
        # Convert labels to categorical
        y = tf.keras.utils.to_categorical(labels, num_classes=3)
        
        return X, y
    
    def train(self, texts, labels, epochs=10, batch_size=32, validation_split=0.2):
        """
        Train the sentiment model
        """
        # Prepare data
        X, y = self.prepare_data(texts, labels)
        
        # Split data
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=validation_split, random_state=42
        )
        
        # Build model if not exists
        if self.model is None:
            self.build_model()
        
        # Train model
        history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_data=(X_val, y_val),
            verbose=1
        )
        
        return history
    
    def predict_sentiment(self, text):
        """
        Predict sentiment of a single text
        Returns: sentiment label and confidence scores
        """
        # Tokenize and pad
        sequence = self.tokenizer.texts_to_sequences([text])
        padded = pad_sequences(sequence, maxlen=self.max_len, padding='post')
        
        # Predict
        if self.model:
            prediction = self.model.predict(padded, verbose=0)[0]
            sentiment_map = {0: 'negative', 1: 'neutral', 2: 'positive'}
            predicted_label = sentiment_map[np.argmax(prediction)]
            confidence = float(np.max(prediction))
        else:
            # Fallback to VADER if model not trained
            scores = self.vader.polarity_scores(text)
            compound = scores['compound']
            if compound >= 0.05:
                predicted_label = 'positive'
                confidence = abs(compound)
            elif compound <= -0.05:
                predicted_label = 'negative'
                confidence = abs(compound)
            else:
                predicted_label = 'neutral'
                confidence = 1.0 - abs(compound)
            
            prediction = [scores['neg'], scores['neu'], scores['pos']]
        
        return {
            'sentiment': predicted_label,
            'confidence': confidence,
            'scores': {
                'negative': float(prediction[0]),
                'neutral': float(prediction[1]),
                'positive': float(prediction[2])
            }
        }
    
    def analyze_by_sentences(self, text):
        """
        Analyze sentiment for each sentence in the text
        """
        from nltk.tokenize import sent_tokenize
        
        sentences = sent_tokenize(text)
        results = []
        
        for sentence in sentences:
            sentiment = self.predict_sentiment(sentence)
            results.append({
                'sentence': sentence,
                'sentiment': sentiment['sentiment'],
                'confidence': sentiment['confidence']
            })
        
        return results
    
    def get_overall_sentiment(self, text, method='weighted'):
        """
        Get overall sentiment of a long text
        method: 'weighted' (by confidence) or 'majority' (most common)
        """
        sentence_results = self.analyze_by_sentences(text)
        
        if method == 'weighted':
            # Weighted average by confidence
            sentiment_scores = {'positive': 0, 'negative': 0, 'neutral': 0}
            total_confidence = 0
            
            for result in sentence_results:
                sentiment = result['sentiment']
                confidence = result['confidence']
                sentiment_scores[sentiment] += confidence
                total_confidence += confidence
            
            # Normalize
            if total_confidence > 0:
                for key in sentiment_scores:
                    sentiment_scores[key] /= total_confidence
            
            overall_sentiment = max(sentiment_scores, key=sentiment_scores.get)
            
        else:  # majority
            sentiments = [r['sentiment'] for r in sentence_results]
            overall_sentiment = max(set(sentiments), key=sentiments.count)
            sentiment_scores = {
                'positive': sentiments.count('positive') / len(sentiments),
                'negative': sentiments.count('negative') / len(sentiments),
                'neutral': sentiments.count('neutral') / len(sentiments)
            }
        
        return {
            'overall_sentiment': overall_sentiment,
            'distribution': sentiment_scores,
            'sentence_count': len(sentence_results),
            'sentences': sentence_results
        }
    
    def save_model(self, model_path='models/sentiment_model.h5', 
                   tokenizer_path='models/tokenizer.pkl'):
        """
        Save trained model and tokenizer
        """
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        if self.model:
            self.model.save(model_path)
        
        with open(tokenizer_path, 'wb') as f:
            pickle.dump(self.tokenizer, f)
        
        print(f"Model saved to {model_path}")
        print(f"Tokenizer saved to {tokenizer_path}")
    
    def load_model(self, model_path='models/sentiment_model.h5',
                   tokenizer_path='models/tokenizer.pkl'):
        """
        Load pre-trained model and tokenizer
        """
        if os.path.exists(model_path):
            self.model = load_model(model_path)
            print(f"Model loaded from {model_path}")
        
        if os.path.exists(tokenizer_path):
            with open(tokenizer_path, 'rb') as f:
                self.tokenizer = pickle.load(f)
            print(f"Tokenizer loaded from {tokenizer_path}")


if __name__ == "__main__":
    # Example usage
    analyzer = LiterarySentimentAnalyzer()
    
    # Test with a poem excerpt
    poem = """
    I wandered lonely as a cloud
    That floats on high o'er vales and hills,
    When all at once I saw a crowd,
    A host, of golden daffodils;
    """
    
    print("Analyzing poem sentiment...")
    result = analyzer.predict_sentiment(poem)
    print(f"\nSentiment: {result['sentiment']}")
    print(f"Confidence: {result['confidence']:.2%}")
    print(f"Scores: {result['scores']}")
    
    print("\n\nSentence-by-sentence analysis:")
    overall = analyzer.get_overall_sentiment(poem)
    print(f"Overall sentiment: {overall['overall_sentiment']}")
    print(f"Distribution: {overall['distribution']}")
