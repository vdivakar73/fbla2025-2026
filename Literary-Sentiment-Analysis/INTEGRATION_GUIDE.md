# UI-to-Modules Integration Guide

## Overview
The Literary Sentiment Analyzer has a fully integrated architecture where the HTML UI connects to external JavaScript modules through well-defined interfaces.

## Module Structure

### 1. **sentiment-analyzer.html** (Main UI)
The main interface that orchestrates everything. 

**Key UI Components:**
- ✅ AI Q&A Tab: `tab-qa` with input `aiQuestion` and output `aiAnswer`
- ✅ Annotations Tab: `tab-annotations` with container `annotationsContainer`
- ✅ Results Display: Multiple charts and analysis tabs
- ✅ Global State Object: `state` manages current text and analysis

**Key Functions:**
- `analyzeText()` - Triggers sentiment analysis
- `askAI()` - Connects to AI module
- `openAnnotations()` - Opens annotation interface
- `saveAnnotation()` - Saves user annotations
- `exportAnnotations()` - Exports annotations to JSON

---

### 2. **ai-qa.js** (Artificial Intelligence Module)
Provides intelligent question-answering about analyzed text.

**Exported Functions:**
```javascript
window.askAI(question, analysis)        // Answers single questions
window.askQuestion(question, text, analysis) // Deeper context analysis
```

**Key Features:**
- Pattern matching for different question types
- Emotional arc analysis
- Literary device identification
- Character & narrative analysis
- Reading level assessment
- Thematic exploration

**Example Q&A Patterns Recognized:**
- Sentiment questions: "What's the sentiment?" → Returns sentiment analysis
- Meaning questions: "What does this symbolize?" → Returns symbolic interpretation
- Style questions: "What's the writing style?" → Returns style breakdown
- Comparison: "Compare emotions..." → Returns emotion balance analysis

---

### 3. **annotations-engine.js** (Annotation Management Module)
Manages user annotations with smart tagging and categorization.

**Global State:**
```javascript
window.annotationState = {
    allAnnotations: [],        // Stores all annotations
    selectedText: '',
    highlightedSpans: Map(),
    annotationCategories: [...]
}
```

**Exported Functions:**
```javascript
window.getAllAnnotations()                    // Get all annotations
window.createAnnotation(annotationData)       // Create new annotation
window.deleteAnnotation(annotationId)         // Delete annotation
window.updateAnnotation(annotationId, data)   // Update annotation
window.getAnnotationsByCategory(category)     // Filter by category
window.getAnnotationsByTag(tag)                // Filter by tag
window.exportAnnotationsJSON()                 // Export as JSON
```

**Supported Categories:**
- insight
- question
- vocabulary
- technique
- theme
- character
- symbolism
- custom

**Storage:**
- Persists to localStorage as `advancedAnnotations`
- Maintains edit history
- Tracks sentiment of annotated text

---

### 4. **summary-manager.js** (Summary & Export Module)
Generates comprehensive summaries and manages data export.

**Key Functions:**
- `generateSmartAnnotations(data)` - Auto-generates annotations from analysis
- `generateComprehensiveSummary(data)` - Creates detailed summary
- `exportAsJSON()` - Exports analysis as JSON
- `exportAsHTML()` - Exports as standalone HTML
- `printReport()` - Prints formatted report
- `shareAsLink()` - Creates shareable link

---

## Integration Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  sentiment-analyzer.html                     │
│                      (Main UI & State)                       │
└──────────┬───────────┬──────────────────┬────────────────────┘
           │           │                  │
           ▼           ▼                  ▼
    ┌──────────┐  ┌──────────┐    ┌──────────────┐
    │  ai-qa   │  │annotation │    │summary-      │
    │  .js     │  │ engine.js │    │ manager.js   │
    └──────────┘  └──────────┘    └──────────────┘
         │             │                  │
         ▼             ▼                  ▼
    ┌─────────────────────────────────────────────┐
    │          window global namespace             │
    │                                              │
    │  Functions accessible from HTML:             │
    │  - window.askQuestion()                      │
    │  - window.getAllAnnotations()                │
    │  - window.createAnnotation()                 │
    │  - window.exportAnnotationsJSON()            │
    └─────────────────────────────────────────────┘
```

---

## How UI Functions Connect to Modules

### Example 1: Ask AI Question
```javascript
// User clicks "Send" button in AI Q&A tab
function askAI() {
    const question = document.getElementById('aiQuestion').value.trim();
    
    // Try to call ai-qa.js exported function
    if (typeof window.askQuestion === 'function') {
        let answer = window.askQuestion(question, state.currentText, state.currentAnalysis);
    } else if (typeof window.askAI === 'function') {
        let answer = window.askAI(question, state.currentAnalysis);
    }
    
    // Display result in HTML
    document.getElementById('aiAnswer').innerHTML = answer;
}
```

**Flow:**
1. HTML function calls `askAI()`
2. Checks if `window.askQuestion` exists (from ai-qa.js)
3. Passes question, text, and analysis data
4. Receives formatted HTML response
5. Displays in `aiAnswer` div

---

### Example 2: Create Annotation
```javascript
// User fills annotation form and clicks "Save"
function saveAnnotation() {
    const text = document.getElementById('annotationText').value;
    const category = document.getElementById('annotationCategory').value;
    
    // Call annotations-engine.js exported function
    if (typeof window.createAnnotation === 'function') {
        window.createAnnotation({
            text: text,
            category: category,
            originalText: state.currentText.substring(0, 100),
            sentiment: state.currentAnalysis.sentiment,
            timestamp: new Date().toISOString()
        });
        
        // Refresh annotation display
        openAnnotations();
    }
}
```

**Flow:**
1. User submits annotation form
2. HTML function calls `window.createAnnotation()`
3. annotations-engine.js stores annotation in `window.annotationState.allAnnotations`
4. Saves to localStorage automatically
5. UI refreshes to show new annotation

---

### Example 3: Export Annotations
```javascript
// User clicks "Export" button
function exportAnnotations() {
    // Try annotations-engine.js export function
    if (typeof window.exportAnnotationsJSON === 'function') {
        window.exportAnnotationsJSON();
    } else if (typeof window.getAllAnnotations === 'function') {
        // Fallback: manual export
        const annotations = window.getAllAnnotations();
        const dataStr = JSON.stringify(annotations, null, 2);
        // Download as file...
    }
}
```

**Flow:**
1. User clicks export button
2. HTML checks for `window.exportAnnotationsJSON()`
3. annotations-engine.js generates JSON download
4. Browser saves `annotations_YYYY-MM-DD.json`

---

## Data Flow During Analysis

```
1. User enters text → analyzeText()
   ↓
2. Text analyzed by main sentiment algorithm
   ↓
3. Analysis data stored in state.currentAnalysis
   ↓
4. Results displayed in Charts & Analysis tabs
   ↓
5. User can now:
   a) Ask AI questions → window.askQuestion()
   b) Create annotations → window.createAnnotation()
   c) Generate summaries → summary-manager functions
   d) Export results → window.exportAnnotationsJSON()
```

---

## Initialization Sequence

### On Page Load:
1. **HTML loads** → sentiment-analyzer.html parsed
2. **Chart.js CDN loaded** → for visualizations
3. **ai-qa.js loads** → exports `window.askQuestion`, `window.askAI`
4. **annotations-engine.js loads** → initializes annotation system, exports functions
5. **summary-manager.js loads** → registers export functions
6. **DOM Ready** → annotation engine initializes

### When Text is Analyzed:
1. `analyzeText()` runs sentiment analysis
2. Results stored in `state.currentAnalysis`
3. Tabs become interactive
4. User can now use AI, annotations, and exports

---

## Checking Module Status

To verify all modules are properly connected, check the browser console:

```javascript
// Check if modules are loaded
console.log('AI Q&A Module:', typeof window.askQuestion);       // function
console.log('Annotations Module:', typeof window.getAllAnnotations); // function
console.log('Annotation State:', window.annotationState);        // object

// Test a simple call
window.askQuestion("What's the sentiment?", "Hello world", {sentiment: "positive"});
```

---

## Troubleshooting

### Issue: "AI module not loaded"
- **Check:** Browser console for errors
- **Verify:** ai-qa.js file exists and loads without errors
- **Solution:** Clear browser cache, reload page

### Issue: Annotations not saving
- **Check:** localStorage is enabled
- **Verify:** `window.annotationState` exists
- **Solution:** Check browser console for errors in annotations-engine.js

### Issue: Export button doesn't work
- **Check:** `window.exportAnnotationsJSON` exists
- **Verify:** annotations-engine.js fully loaded
- **Solution:** Try manual export using console: `window.getAllAnnotations()`

---

## Summary

✅ **All UI functions are properly integrated with external modules**
✅ **Data flows seamlessly between components**
✅ **Modules are independent but share global state**
✅ **Error handling and fallbacks in place**
✅ **LocalStorage persistence for annotations**

The architecture allows:
- 🎯 **Modular Development**: Each module can be updated independently
- 🔄 **Easy Testing**: Functions accessible via console and debugger
- 📦 **Extensibility**: New modules can be added following the same pattern
- 💾 **Persistence**: Annotations saved locally
- 📤 **Export**: Multiple export formats available
