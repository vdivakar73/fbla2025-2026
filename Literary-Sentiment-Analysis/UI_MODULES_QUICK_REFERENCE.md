# UI-to-Modules Connection Quick Reference

## Quick Navigation

### 📍 AI Q&A Integration
- **HTML File:** [sentiment-analyzer.html](sentiment-analyzer.html#L335)
- **UI Function:** `askAI()` (line 335)
- **Module File:** [ai-qa.js](ai-qa.js)
- **Module Function:** `window.askQuestion()` or `window.askAI()`
- **HTML Elements:**
  - Input: `#aiQuestion`
  - Output: `#aiAnswer`
  - Container: `#aiAnswerBox`

**How It Works:**
```
User types question → Clicks Send → askAI() → window.askQuestion() → Display result
```

---

### 📍 Annotations Integration
- **HTML File:** [sentiment-analyzer.html](sentiment-analyzer.html#L347)
- **UI Functions:**
  - `openAnnotations()` (line 347) - Display annotations
  - `saveAnnotation()` (line 377) - Save new annotation
  - `exportAnnotations()` (line 394) - Export as JSON
- **Module File:** [annotations-engine.js](annotations-engine.js)
- **Module Functions:**
  - `window.getAllAnnotations()` - Get all annotations
  - `window.createAnnotation()` - Create annotation
  - `window.exportAnnotationsJSON()` - Export to file
- **HTML Elements:**
  - Container: `#annotationsContainer`
  - Buttons: "Manage Annotations", "Export"

**How It Works:**
```
Click button → openAnnotations() → window.getAllAnnotations() → Display list
Fill form → saveAnnotation() → window.createAnnotation() → Refresh display
Click Export → exportAnnotations() → window.exportAnnotationsJSON() → Download file
```

---

## Function Call Map

| HTML Function | Called Module | Module Function | What It Does |
|---|---|---|---|
| `askAI()` | ai-qa.js | `window.askQuestion()` | Answer questions about text |
| `openAnnotations()` | annotations-engine.js | `window.getAllAnnotations()` | Display saved annotations |
| `saveAnnotation()` | annotations-engine.js | `window.createAnnotation()` | Save user's annotation |
| `exportAnnotations()` | annotations-engine.js | `window.exportAnnotationsJSON()` | Download annotations as JSON |

---

## Data Flow Diagram

```
┌─────────────────────────────────┐
│   User interacts with UI        │
│  (clicks buttons, types text)   │
└────────────┬────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │  HTML Function     │
    │  - askAI()         │
    │  - saveAnnotation()│
    │  - etc.            │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Calls window.*     │
    │ from modules       │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Module processes   │
    │ - ai-qa.js         │
    │ - annotations...   │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Returns result     │
    │ (HTML, data, etc)  │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ HTML function      │
    │ displays result    │
    │ Updates DOM        │
    └────────────────────┘
```

---

## Key Connections Summary

### ✅ AI Q&A Connection
- **Input:** Question from user in `#aiQuestion`
- **Processing:** Pattern matching in ai-qa.js
- **Output:** Formatted HTML response
- **Display:** Shows in `#aiAnswer`
- **Status:** ✓ Working

### ✅ Annotations Connection
- **Input:** Annotation text from form
- **Processing:** Stored in `window.annotationState`
- **Output:** Saved to localStorage
- **Display:** Shows in `#annotationsContainer`
- **Export:** Downloads as JSON file
- **Status:** ✓ Working

### ✅ Module Integration
- **ai-qa.js:** Exports `window.askQuestion()` ✓
- **annotations-engine.js:** Exports 7 functions ✓
- **summary-manager.js:** Handles exports ✓
- **All modules loaded:** Line 237-239 ✓

---

## Testing Checklist

Quick tests to verify everything is connected:

### Test AI Module
```javascript
// Open browser console (F12)
// Type this and press Enter:
typeof window.askQuestion === 'function'
// Should show: true

// Test the function:
window.askQuestion("What sentiment?", "Hello world", {sentiment: "positive"})
// Should return HTML response
```

### Test Annotations Module
```javascript
// Check state exists:
window.annotationState
// Should show annotation object

// Get all annotations:
window.getAllAnnotations()
// Should return array

// Create test annotation:
window.createAnnotation({text: "Test", category: "general"})
// Should add to state
```

### Test UI Integration
1. ✓ Enter text in main input area
2. ✓ Click "Analyze Text" button
3. ✓ Click "Ask AI" tab
4. ✓ Type question
5. ✓ Click "Send"
6. ✓ See answer appear
7. ✓ Click "Notes" tab
8. ✓ Click "Manage Annotations"
9. ✓ Add annotation
10. ✓ Click "Export"
11. ✓ File downloads

---

## File Locations

### Main UI
📄 [sentiment-analyzer.html](sentiment-analyzer.html)
- Contains all UI functions
- Includes script tags for modules
- Manages state and DOM

### Modules
📄 [ai-qa.js](ai-qa.js)
- AI question answering
- Exports: `window.askQuestion()`, `window.askAI()`

📄 [annotations-engine.js](annotations-engine.js)
- Annotation management
- Exports: 7 annotation functions
- State: `window.annotationState`
- Storage: localStorage key `advancedAnnotations`

📄 [summary-manager.js](summary-manager.js)
- Summary and export functions
- Integrates with annotations
- Generates reports

---

## Common Issues & Solutions

### ❌ "AI module not loaded"
**Check:**
- F12 → Console for red errors
- ai-qa.js exists in directory
- Script tag in HTML (line 237)

**Fix:**
- Clear cache: Ctrl+Shift+Delete
- Refresh: F5
- Check file permissions

### ❌ Annotations not saving
**Check:**
- localStorage enabled in browser
- DevTools → Application → LocalStorage
- No red errors in console

**Fix:**
- Try manual test: `window.createAnnotation({text: "test", category: "general"})`
- Check browser privacy settings
- Try incognito mode

### ❌ Export button not working
**Check:**
- Popup blockers disabled
- `window.exportAnnotationsJSON` exists
- No errors in console

**Fix:**
- Disable popup blocker
- Try: `window.getAllAnnotations()` to check data exists
- Try different browser

---

## Next Steps

1. ✅ **Verify Integration** - Run tests above
2. ✅ **Test Features** - Use all tabs and functions
3. ✅ **Check Console** - Should see ✓ messages
4. ✅ **Review Docs** - Read INTEGRATION_GUIDE.md
5. ✅ **Report Issues** - Check troubleshooting above

---

## Documentation Files

📚 Related guides in this directory:
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Detailed architecture
- [INTEGRATION_STATUS.md](INTEGRATION_STATUS.md) - Complete status report
- [MODULE_VERIFICATION.js](MODULE_VERIFICATION.js) - Verification script
- [ai-qa.js](ai-qa.js) - AI module source
- [annotations-engine.js](annotations-engine.js) - Annotations module source

---

## Summary

✅ **UI and Modules are FULLY CONNECTED**

- AI Q&A: Working via window.askQuestion()
- Annotations: Working via window.getAllAnnotations(), window.createAnnotation()
- Export: Working via window.exportAnnotationsJSON()
- Data Persistence: Working via localStorage
- Error Handling: In place with fallbacks

**Ready to Use!** 🚀
