"""
Text preprocessing utilities for literary analysis
"""
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import WordNetLemmatizer
import string

class TextPreprocessor:
    def __init__(self, remove_stopwords=False, lemmatize=True):
        self.remove_stopwords = remove_stopwords
        self.lemmatize = lemmatize
        self.lemmatizer = WordNetLemmatizer() if lemmatize else None
        self.stop_words = set(stopwords.words('english')) if remove_stopwords else set()
    
    def clean_text(self, text):
        """
        Clean and normalize text while preserving literary structure
        """
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Normalize quotes
        text = text.replace('"', '"').replace('"', '"')
        text = text.replace(''', "'").replace(''', "'")
        
        # Remove special characters but keep punctuation for sentiment
        text = re.sub(r'[^\w\s\.,!?;:\'-]', '', text)
        
        return text.strip()
    
    def tokenize_sentences(self, text):
        """
        Split text into sentences
        """
        return sent_tokenize(text)
    
    def tokenize_words(self, text):
        """
        Tokenize text into words
        """
        return word_tokenize(text)
    
    def preprocess(self, text, preserve_case=False):
        """
        Full preprocessing pipeline
        """
        # Clean text
        text = self.clean_text(text)
        
        # Convert to lowercase (optional for literary analysis)
        if not preserve_case:
            text = text.lower()
        
        # Tokenize
        tokens = self.tokenize_words(text)
        
        # Remove stopwords (optional - may lose meaning in poetry)
        if self.remove_stopwords:
            tokens = [word for word in tokens if word.lower() not in self.stop_words]
        
        # Lemmatize
        if self.lemmatize:
            tokens = [self.lemmatizer.lemmatize(word) for word in tokens]
        
        return tokens
    
    def extract_features(self, text):
        """
        Extract features for ML models
        """
        sentences = self.tokenize_sentences(text)
        words = self.tokenize_words(text)
        
        features = {
            'word_count': len(words),
            'sentence_count': len(sentences),
            'avg_word_length': sum(len(word) for word in words) / len(words) if words else 0,
            'avg_sentence_length': len(words) / len(sentences) if sentences else 0,
            'punctuation_count': sum(1 for char in text if char in string.punctuation),
            'exclamation_count': text.count('!'),
            'question_count': text.count('?'),
            'unique_words': len(set(words)),
            'lexical_diversity': len(set(words)) / len(words) if words else 0,
        }
        
        return features
    
    def split_into_chunks(self, text, chunk_size=500):
        """
        Split long texts into manageable chunks for analysis
        """
        words = self.tokenize_words(text)
        chunks = []
        
        for i in range(0, len(words), chunk_size):
            chunk = ' '.join(words[i:i + chunk_size])
            chunks.append(chunk)
        
        return chunks


def analyze_poetic_structure(text):
    """
    Analyze poetic elements like line breaks, stanzas, and rhyme
    """
    lines = text.split('\n')
    lines = [line.strip() for line in lines if line.strip()]
    
    # Detect stanzas (separated by blank lines)
    stanzas = []
    current_stanza = []
    
    for line in text.split('\n'):
        if line.strip():
            current_stanza.append(line.strip())
        elif current_stanza:
            stanzas.append(current_stanza)
            current_stanza = []
    
    if current_stanza:
        stanzas.append(current_stanza)
    
    structure = {
        'line_count': len(lines),
        'stanza_count': len(stanzas),
        'avg_lines_per_stanza': len(lines) / len(stanzas) if stanzas else 0,
        'total_words': len(word_tokenize(text)),
        'avg_words_per_line': len(word_tokenize(text)) / len(lines) if lines else 0,
    }
    
    return structure


if __name__ == "__main__":
    # Example usage
    sample_text = """
    The woods are lovely, dark and deep,
    But I have promises to keep,
    And miles to go before I sleep,
    And miles to go before I sleep.
    """
    
    preprocessor = TextPreprocessor(remove_stopwords=False, lemmatize=True)
    
    print("Original text:")
    print(sample_text)
    print("\nCleaned text:")
    print(preprocessor.clean_text(sample_text))
    print("\nTokens:")
    print(preprocessor.preprocess(sample_text))
    print("\nFeatures:")
    print(preprocessor.extract_features(sample_text))
    print("\nPoetic structure:")
    print(analyze_poetic_structure(sample_text))
