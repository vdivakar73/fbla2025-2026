# 📚 Literary Sentiment Analyzer - Features Guide

## 🌟 Version 2.2 Features (Latest - December 2025)

### 🧭 Multi-Page Navigation System
**6 Specialized Pages for Complete Analysis:**

1. **🔍 Main Analysis** - Your starting point
   - Sentiment & emotion detection
   - Theme identification
   - Literary device analysis
   - Basic text statistics

2. **📊 Advanced Metrics** - In-depth text analysis
   - Reading level calculations (Flesch-Kincaid, SMOG)
   - Vocabulary richness (Type-Token Ratio)
   - Tone & style analysis (formality, passive voice)
   - Structural analysis (paragraphs, dialogue, variety)
   - Content extraction (characters, locations, quotes)

3. **📈 Visualizations** - Visual analytics
   - Interactive word cloud (top 50 words)
   - Emotion distribution pie chart
   - Theme intensity bar chart
   - Literary devices polar chart
   - Sentiment timeline (sentence-by-sentence)

4. **⚖️ Compare Texts** - Side-by-side comparison
   - Dual text input panels
   - Independent analysis for each
   - Compare different versions, authors, or translations

5. **🕒 History** - Analysis management
   - Last 20 analyses auto-saved
   - Timestamp tracking
   - One-click reload
   - Individual or bulk delete

6. **💾 Export** - Advanced download options
   - PDF export (formatted professional report)
   - HTML export (standalone webpage)
   - CSV export (spreadsheet data)
   - JSON export (complete data structure)

### 📊 Reading Level Analysis (Advanced Metrics)

**Flesch Reading Ease Score (0-100):**
- 90-100: Very Easy (5th grade)
- 80-89: Easy (6th grade)
- 70-79: Fairly Easy (7th grade)
- 60-69: Standard (8th-9th grade)
- 50-59: Fairly Difficult (10th-12th grade)
- 30-49: Difficult (College)
- 0-29: Very Difficult (Graduate)

**Flesch-Kincaid Grade Level:**
- Direct grade level estimate
- Based on sentence length and syllable count
- Accurate for grades 1-16+

**SMOG Index:**
- Simple Measure of Gobbledygook
- Years of education needed
- Best for texts with 30+ sentences

**Output Example:**
```
Grade Level: High School (9-12)
Flesch Ease: 68.5 (Fairly Easy)
SMOG Index: 10.2
```

### 💎 Vocabulary Richness Analysis (Advanced Metrics)

**Type-Token Ratio (TTR):**
- Measures vocabulary diversity
- Formula: (Unique Words / Total Words) × 100
- Ratings:
  - 70%+: Exceptional
  - 60-70%: High
  - 50-60%: Good
  - 40-50%: Average
  - <40%: Limited

**Sophisticated Vocabulary Percentage:**
- Words with 6+ letters
- Indicates formal/academic language
- Higher % = more complex vocabulary

**Average Word Length:**
- Mean letters per word
- Complexity indicator
- Typical range: 4-7 letters

**Most Frequent Words:**
- Top 20 words with counts
- Stop words excluded
- Visual size representation

### 🎭 Tone & Style Analysis (Advanced Metrics)

**Formality Detection:**
- Formal indicators: "therefore," "however," "furthermore," "moreover"
- Informal indicators: "gonna," "wanna," "yeah," "cool," "hey"
- Classification: Formal / Informal / Neutral
- Percentage score

**Voice Analysis:**
- Passive voice detection
- Passive construction percentage
- Active voice preference indicator

**Sentence Complexity:**
- Simple: <15 words/sentence
- Moderate: 15-20 words/sentence
- Complex: 20+ words/sentence
- Based on average sentence length

**Emotional Intensity:**
- High: 3+ exclamation marks
- Moderate: 1-2 exclamation marks
- Low: 0 exclamation marks
- Question mark count

### 🏗️ Structural Analysis (Advanced Metrics)

**Paragraph Analysis:**
- Total paragraph count
- Average paragraph length (words)
- Length distribution patterns

**Dialogue Detection:**
- Percentage of quoted text
- Useful for narrative analysis
- Dialogue vs narration ratio

**Sentence Variety Score (0-100):**
- Measures variation in sentence length
- Higher score = more variety
- Based on statistical variance
- 70+: Excellent variety
- 50-70: Good variety
- 30-50: Moderate variety
- <30: Limited variety

**Sentence Length Range:**
- Longest sentence (word count)
- Shortest sentence (word count)
- Shows writing rhythm and pacing

### 🔍 Content Extraction (Advanced Metrics)

**Character/Name Detection:**
- Identifies capitalized words appearing 2+ times
- Filters common words (The, And, etc.)
- Frequency ranking
- Top 10 characters/names

**Location & Setting Detection:**
- Geographic locations
- Environmental settings
- Keywords: forest, city, castle, mountain, river, etc.
- Scene identification

**Key Quotes Extraction:**
- Sentences with quotation marks
- Important passages (40+ characters)
- Top 5 most significant quotes
- Formatted display blocks

**Proper Noun Identification:**
- Capitalized words (non-sentence-start)
- Names, places, titles
- Top 15 proper nouns
- Entity recognition

### 📈 Visual Analytics (Visualizations Page)

**☁️ Interactive Word Cloud:**
- Top 50 most frequent words
- Size represents frequency
- Color-coded for visual appeal
- Stop words excluded
- Hover effects

**🎭 Emotion Distribution Pie Chart:**
- 7 emotions visualized
- Joy, Sadness, Love, Fear, Anger, Hope, Mystery
- Percentage breakdown
- Color-coded segments
- Interactive tooltips

**📚 Theme Analysis Bar Chart:**
- Horizontal bar layout
- Top 4-13 themes (text-dependent)
- Ranked by intensity
- Color-coded bars
- Hover for descriptions

**✍️ Literary Devices Polar Chart:**
- Radial/spider web layout
- All detected devices
- Size indicates frequency
- Multi-color coded
- Interactive legend

**📊 Sentiment Timeline:**
- Line graph
- Sentence-by-sentence sentiment
- Positive/negative flow
- Emotional arc visualization
- Identify turning points

### 🕒 Analysis History System

**Automatic Saving:**
- Saves after each analysis
- Stores last 20 entries
- Browser localStorage
- Persists across sessions

**Stored Information:**
- Complete analysis data
- Original text (preview)
- Timestamp (date & time)
- Sentiment classification
- Word count

**History Interface:**
- Card-based layout
- Click to reload analysis
- Color-coded sentiment badges
- Individual delete buttons
- Clear all option

### 💾 Advanced Export Options

**📄 PDF Export:**
- Professional formatted report
- Title, date, statistics
- Text preview (500 chars)
- Ready to print/share
- File: `literary-analysis.pdf`

**🌐 HTML Export:**
- Standalone webpage
- Embedded CSS styling
- Complete statistics
- Original text included
- Opens in any browser
- File: `literary-analysis.html`

**📊 CSV Export:**
- Spreadsheet compatible
- Metric rows format
- Percentage data
- Emotion breakdown
- Excel/Sheets ready
- File: `literary-analysis.csv`

**📋 JSON Export:**
- Complete data structure
- Machine-readable format
- Timestamp included
- Full analysis object
- Developer friendly
- File: `literary-analysis.json`

---

## ⭐ Version 2.1 Features

### 1. ⚖️ Side-by-Side Comparison Mode
**What it does:** Compare two texts simultaneously in a split-screen view.

**How to use:**
1. Click "⚖️ Compare" button
2. Screen splits into two panels
3. Enter Text 1 (left) and Text 2 (right)
4. Click "Analyze" on each panel
5. View comparison metrics side-by-side

**What gets compared:**
- Word count, sentence count, lexical diversity
- Sentiment (Positive/Negative/Neutral with confidence)
- Primary emotion and theme
- Literary device count
- Detected language

### 2. ❓ Built-in Help System
**What it does:** Complete documentation accessible within the app.

**How to access:**
1. Click "?" button at bottom-right
2. Browse 7 help tabs:
   - 🚀 Quick Start
   - ✨ Features
   - 📝 Annotations
   - 🌍 Languages
   - ⚖️ Comparison
   - 💾 Export
   - ❓ FAQ

### 3. 💬 Feedback & Rating System
**What it does:** Share your experience and help improve the tool.

**How to use:**
1. Click "💬 Feedback" button at bottom-right
2. Rate with stars (1-5)
3. Add comments (optional)
4. Submit feedback
5. All stored locally in your browser

---

## 🆕 Version 2.0 Features

### 1. 📝 Annotations System
**What it does:** Add personal notes and comments to specific passages in your text.

**How to use:**
1. Click "Annotations" button after analyzing text
2. Select any text passage you want to annotate
3. Click "Add Note to Selection"
4. Enter your comment/note in the popup
5. Click "Save" - the text will be highlighted in yellow
6. Hover over highlighted text to see your note
7. Export annotations as a .txt file

**Features:**
- Visual highlighting of annotated passages
- Hover tooltips to view notes
- Export all annotations
- Delete individual annotations
- Persistent storage during session

---

### 2. 🌍 Multi-Language Support
**What it does:** Automatically detects and analyzes text in 8+ languages with language-specific sentiment analysis.

**Supported Languages:**
- 🇬🇧 English
- 🇪🇸 Spanish (Español)
- 🇫🇷 French (Français)
- 🇩🇪 German (Deutsch)
- 🇮🇹 Italian (Italiano)
- 🇵🇹 Portuguese (Português)
- 🇳🇱 Dutch (Nederlands)
- 🇷🇺 Russian (Русский)

**How to use:**
1. Select language from dropdown (or use "Auto-Detect")
2. Paste text in your chosen language
3. Click "Analyze Text"
4. If auto-detect is on, detected language shows as a badge
5. Sentiment analysis uses language-specific word dictionaries

**Features:**
- Automatic language detection based on common words
- Language-specific positive/negative sentiment dictionaries
- 250+ sentiment words per language
- Visual language badge showing detected language

---

### 3. 🎭 Enhanced Literary Device Detection
**What it does:** Detects 12+ literary devices with specific examples and explanations.

**Devices Detected:**
1. **Repetition** - Shows repeated words and frequency
2. **Rhyme Scheme** - Detects end rhyme patterns
3. **Alliteration** - Finds repeated initial consonant sounds with examples
4. **Metaphor** - Identifies implicit comparisons
5. **Simile** - Counts "like" and "as" comparisons
6. **Personification** - Human qualities given to non-human subjects
7. **Symbolism** - Symbolic objects and concepts
8. **Vivid Imagery** - Sensory descriptive words (visual, tactile, auditory, gustatory)
9. **Hyperbole** - Exaggeration for effect
10. **Rhetorical Questions** - Counts questions used rhetorically
11. **Anaphora** - Repetition at the beginning of lines/sentences
12. **Enjambment** - Lines without end punctuation (poetry)

**Example Output:**
- "Alliteration ('while I pondered, weak and weary...')"
- "Repetition (nevermore appears 5 times)"
- "Vivid Imagery (8 sensory words)"
- "Simile (3 comparisons using 'like' or 'as')"

---

### 4. 💾 Download Results
**What it does:** Download complete analysis as a JSON file for archival or further processing.

**How to use:**
1. Analyze text
2. Click "Download" button
3. File saves as `literary-analysis-[timestamp].json`

**What's included:**
- Original text
- All analysis metrics
- Emotion percentages
- Theme analysis
- Literary devices
- Your annotations
- Timestamp

**Use cases:**
- Archive analyses for future reference
- Import into other tools
- Academic research data collection
- Comparison across time

---

### 5. ⚖️ Comparison Mode (Future Enhancement)
**What it does:** Toggle to prepare for comparing two texts side-by-side.

**How to use:**
1. Click "Compare" button
2. Analyze first text and save
3. Analyze second text
4. View saved analyses to compare

---

### 6. 📄 Enhanced Export PDF
**What it does:** Print current analysis to PDF with formatted report.

**Includes:**
- All sentiment scores
- Emotion breakdown
- Content summary
- Literary devices
- Theme analysis
- Readability metrics
- Word cloud
- Charts

---

## 🎨 Existing Features (Already Available)

### Core Analysis
- ✅ Sentiment Analysis (Positive/Negative/Neutral)
- ✅ Emotion Detection (7 emotions: joy, sadness, love, fear, anger, hope, mystery)
- ✅ Theme Detection (13 themes)
- ✅ Tone Analysis (formality, intensity, pacing)
- ✅ Genre Classification
- ✅ Readability Metrics (Flesch Reading Ease, Grade Level)

### Visualizations
- ✅ Emotional Arc (line chart showing sentiment flow)
- ✅ Emotion Pie Chart (distribution of emotions)
- ✅ Emotion Bar Chart (intensity comparison)
- ✅ Word Cloud (frequency-based visual)

### Interactive Features
- ✅ Text Highlighting by Emotion
- ✅ Help Tooltips
- ✅ Dark Mode
- ✅ Reading Time Estimate
- ✅ Save/Load Analysis History
- ✅ Share Results (copy text or URL)

### Content Analysis
- ✅ Deep Content Summary
- ✅ Key Quotes Extraction
- ✅ Sentence-by-Sentence Breakdown
- ✅ Important Sentence Identification
- ✅ Top Word Frequency

---

## 🚀 Quick Start Guide

1. **Basic Analysis:**
   - Paste text → Click "Analyze" → View results

2. **With Annotations:**
   - Analyze → Click "Annotations" → Select text → Add notes → Export

3. **Multi-Language:**
   - Select language (or auto-detect) → Paste text → Analyze

4. **Save for Later:**
   - Analyze → "Save Analysis" → View in "History" anytime

5. **Share:**
   - Analyze → "Share" → Copy link or text

---

## 💡 Pro Tips

1. **Best Results:** Text with 50+ words works best for accurate emotion detection
2. **Poetry Analysis:** Line breaks are preserved for rhyme and enjambment detection
3. **Annotations:** Great for students analyzing literature or writers reviewing drafts
4. **Multi-Language:** Works best with 100+ word texts for accurate detection
5. **Comparison:** Save multiple analyses to compare different texts or versions
6. **Export:** Download JSON for data analysis in Excel/Python

---

## 🔧 Technical Details

- **Frontend Only:** Pure HTML/CSS/JavaScript - no server required
- **Chart.js 4.4.0:** For data visualization
- **LocalStorage:** Browser-based storage for history (up to 20 analyses)
- **Responsive:** Works on desktop, tablet, and mobile
- **Offline Capable:** Works without internet after initial load

---

## 📊 Analysis Algorithms

### Sentiment Detection
- Dictionary-based matching with 250+ words per language
- Confidence scoring based on word frequency
- Contextual analysis for intensifiers and negations

### Emotion Analysis
- 7-emotion weighted scoring system
- Direct + contextual word matching
- Theme reinforcement
- Negation handling

### Literary Devices
- Pattern matching (alliteration, rhyme)
- Structural analysis (anaphora, enjambment)
- Semantic detection (metaphor, personification)
- Frequency-based (repetition, hyperbole)

---

## 📈 Future Enhancements (Planned)

- [ ] Side-by-side text comparison visualization
- [ ] Custom sentiment word dictionaries
- [ ] Batch analysis (multiple texts)
- [ ] Voice input (speech-to-text)
- [ ] More chart types (radar, heatmap)
- [ ] AI-powered summaries (GPT integration)
- [ ] Collaborative annotations (shared comments)

---

**Version:** 2.0.0  
**Last Updated:** December 14, 2025  
**License:** Open Source  
**Author:** FBLA 2025-2026 Project
