"""
Command-line interface for analyzing literary texts
"""
import argparse
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.text_analyzer import LiteraryTextAnalyzer


def main():
    parser = argparse.ArgumentParser(
        description='Analyze sentiment and emotions in literary texts',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python analyze_text.py --file poem.txt
  python analyze_text.py --file story.txt --type story --output json
  python analyze_text.py --text "The woods are lovely, dark and deep"
        """
    )
    
    parser.add_argument(
        '--file', '-f',
        help='Path to text file to analyze'
    )
    
    parser.add_argument(
        '--text', '-t',
        help='Direct text input to analyze'
    )
    
    parser.add_argument(
        '--type',
        choices=['poem', 'book', 'story', 'essay', 'general'],
        default='general',
        help='Type of literary text (default: general)'
    )
    
    parser.add_argument(
        '--output', '-o',
        choices=['text', 'json', 'both'],
        default='text',
        help='Output format (default: text)'
    )
    
    args = parser.parse_args()
    
    # Validate input
    if not args.file and not args.text:
        parser.error("Either --file or --text must be provided")
    
    # Initialize analyzer
    print("Initializing Literary Text Analyzer...")
    print("Loading models and dependencies...\n")
    analyzer = LiteraryTextAnalyzer()
    
    # Analyze
    if args.file:
        if not os.path.exists(args.file):
            print(f"Error: File '{args.file}' not found")
            sys.exit(1)
        
        print(f"Analyzing file: {args.file}\n")
        analyzer.analyze_file(args.file, output_format=args.output)
    
    elif args.text:
        print("Analyzing provided text...\n")
        results = analyzer.analyze_complete(args.text, text_type=args.type)
        
        if args.output in ['text', 'both']:
            summary = analyzer.generate_summary(results)
            print(summary)
        
        if args.output in ['json', 'both']:
            import json
            print("\nJSON Results:")
            print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
