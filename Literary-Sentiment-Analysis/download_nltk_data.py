"""
Download required NLTK data packages for sentiment analysis
"""
import nltk

print("Downloading NLTK data packages...")

# Download required packages
packages = [
    'punkt',           # Tokenizer
    'stopwords',       # Stop words
    'vader_lexicon',   # Sentiment analysis
    'averaged_perceptron_tagger',  # POS tagging
    'wordnet',         # WordNet
    'omw-1.4',        # Open Multilingual Wordnet
    'movie_reviews',   # Movie reviews corpus for training
    'subjectivity',    # Subjectivity dataset
]

for package in packages:
    try:
        nltk.download(package)
        print(f"✓ Downloaded {package}")
    except Exception as e:
        print(f"✗ Error downloading {package}: {e}")

print("\nAll NLTK data packages downloaded successfully!")
