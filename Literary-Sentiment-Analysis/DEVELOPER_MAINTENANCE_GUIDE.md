# Developer's Integration Maintenance Guide

## Integration Overview

The Literary Sentiment Analyzer uses a modular architecture where external JavaScript modules (ai-qa.js, annotations-engine.js, summary-manager.js) are connected to the main UI (sentiment-analyzer.html) through well-defined function interfaces exposed on the `window` object.

---

## Module Connection Architecture

### Connection Pattern

```
HTML UI Function → window.moduleFunction() → Module Processing → Return Result
```

### Principle
- **Loose Coupling:** Modules don't depend on HTML, only the window namespace
- **Easy Testing:** Each module can be tested independently via console
- **Modular Updates:** Modules can be updated without modifying HTML
- **Graceful Fallbacks:** UI checks if functions exist before calling

---

## Each Module's Responsibility

### 1. **ai-qa.js** (AI Question & Answer Module)

#### Exports to window:
- `window.askQuestion(question, text, analysis)` ⭐ PRIMARY
- `window.askAI(question, analysis)` (fallback)

#### What it does:
- Analyzes user questions about the text
- Uses pattern matching to categorize questions
- Returns formatted HTML response

#### Connected to HTML:
- Function: `askAI()` in sentiment-analyzer.html (line 335)
- UI Element: Ask AI tab with input/output areas

#### Maintenance:
- If adding new question types: Update pattern matching in ai-qa.js
- If changing return format: Update `askAI()` display logic
- If changing parameter structure: Update all callers

---

### 2. **annotations-engine.js** (Annotations Management Module)

#### Exports to window:
- `window.getAllAnnotations()` - Get all annotations
- `window.createAnnotation(data)` - Create new annotation ⭐ PRIMARY
- `window.deleteAnnotation(id)` - Delete annotation
- `window.updateAnnotation(id, updates)` - Modify annotation
- `window.getAnnotationsByCategory(category)` - Filter annotations
- `window.getAnnotationsByTag(tag)` - Search by tag
- `window.exportAnnotationsJSON()` - Export to file ⭐ PRIMARY

#### Global State:
- `window.annotationState` - Maintains all annotation data
- Storage: localStorage key `advancedAnnotations`

#### Connected to HTML:
- Functions: `openAnnotations()`, `saveAnnotation()`, `exportAnnotations()`
- UI Elements: Annotations tab with form and display

#### Maintenance:
- **To add new categories:** Update `annotationState.annotationCategories`
- **To change storage:** Modify localStorage key handling
- **To add new exports:** Create new `window.export*()` functions
- **To persist new fields:** Update localStorage save/load logic

---

### 3. **summary-manager.js** (Summary & Export Module)

#### Exports to window:
- Various export and summary functions
- Integration with annotation system
- Report generation

#### Connected to HTML:
- Called by other modules (ai-qa.js, annotations-engine.js)
- Enhances existing functionality

#### Maintenance:
- Ensure compatibility with annotation state
- Test export formats remain valid
- Verify report HTML/PDF generation

---

## Update Checklist

When modifying any module, ensure:

### Before Making Changes
- [ ] Back up original file
- [ ] Review all callers of the function
- [ ] Check what data the callers provide
- [ ] Check what callers expect in return
- [ ] Test in browser console first

### After Making Changes
- [ ] Module exports still work: `typeof window.functionName === 'function'`
- [ ] HTML function still works with new signature
- [ ] Browser console shows no red errors
- [ ] All tests pass (see below)
- [ ] Update related documentation

### Testing Changes
```javascript
// Test ai-qa.js changes
window.askQuestion("test q", "test text", {sentiment: "positive"})

// Test annotations changes
window.createAnnotation({text: "test", category: "general"})
window.getAllAnnotations()
window.exportAnnotationsJSON()

// Test UI integration
// 1. Analyze text
// 2. Use new/modified features
// 3. Check browser console for errors
```

---

## Common Modifications

### Add New AI Question Type

**File:** ai-qa.js

```javascript
// In the askAI() or askQuestion() function, add pattern:

// NEAR LINE 50, add to trainingPatterns:
trainingPatterns.yourNewType = ['keyword1', 'keyword2', 'keyword3']

// IN MAIN LOGIC, add condition:
else if (bestMatch[0] === 'yourNewType' && bestMatch[1] >= 2) {
    answer = "Your response about the new question type"
}
```

### Add New Annotation Category

**File:** annotations-engine.js

```javascript
// NEAR LINE 20, update:
annotationCategories: ['existing', 'categories', 'newCategory']

// NEAR LINE 22, update color scheme:
colorScheme: {
    'newCategory': '#FFB4D4'  // Pick a color
}
```

### Change Export Format

**File:** annotations-engine.js (exportAnnotationsJSON function)

```javascript
// Around line 700+, modify the export logic:
window.exportAnnotationsJSON = function() {
    const annotations = window.getAllAnnotations();
    // Modify format here
    const dataStr = JSON.stringify(annotations, null, 2);
    // Then download as file
}
```

---

## Debugging Guide

### Check Module Loading
```javascript
// Console commands to verify:
console.log('AI module:', typeof window.askQuestion)
console.log('Annotations:', typeof window.getAllAnnotations)
console.log('Export:', typeof window.exportAnnotationsJSON)
// All should return 'function'
```

### Test Module Functions
```javascript
// Test AI
window.askQuestion("What's the sentiment?", "Hello world", {
    sentiment: "positive",
    emotions: {joy: 0.8}
})

// Test Annotations
window.createAnnotation({text: "test", category: "general"})
window.getAllAnnotations()

// Test Export
console.log(window.annotationState)
```

### Check State
```javascript
// Check HTML state
console.log(state)
console.log(state.currentText)
console.log(state.currentAnalysis)

// Check annotation state
console.log(window.annotationState)
console.log(window.annotationState.allAnnotations)
```

### Monitor Errors
```javascript
// In browser DevTools:
// 1. F12 to open DevTools
// 2. Click Console tab
// 3. Look for red error messages
// 4. Expand errors to see full details
```

---

## Integration Points Reference

### Point 1: AI Q&A
```
HTML Location: sentiment-analyzer.html:335
Function: askAI()
Calls: window.askQuestion() or window.askAI()
Module: ai-qa.js
UI: #aiQuestion (input), #aiAnswer (output)
```

### Point 2: Get Annotations
```
HTML Location: sentiment-analyzer.html:347
Function: openAnnotations()
Calls: window.getAllAnnotations()
Module: annotations-engine.js
UI: #annotationsContainer (display)
```

### Point 3: Save Annotation
```
HTML Location: sentiment-analyzer.html:377
Function: saveAnnotation()
Calls: window.createAnnotation()
Module: annotations-engine.js
UI: #annotationText, #annotationCategory (form)
```

### Point 4: Export Annotations
```
HTML Location: sentiment-analyzer.html:394
Function: exportAnnotations()
Calls: window.exportAnnotationsJSON()
Module: annotations-engine.js
Result: File download (annotations_YYYY-MM-DD.json)
```

---

## Important Notes

### ⚠️ Critical Rules

1. **Always check function existence before calling:**
   ```javascript
   if (typeof window.functionName === 'function') {
       window.functionName()
   }
   ```

2. **Maintain backward compatibility:**
   - If changing function signature, update HTML callers
   - Provide fallback functions if possible
   - Document breaking changes

3. **Preserve state structure:**
   - Don't delete fields from window.state objects
   - Add new fields cautiously
   - Update storage serialization if needed

4. **Test thoroughly:**
   - Console tests before deployment
   - User acceptance testing
   - Cross-browser testing (Chrome, Firefox, Safari, Edge)

### 📝 Documentation Rules

When modifying modules:
- Update relevant .md files
- Add comments to code
- Document parameter/return types
- Note breaking changes
- Add examples to guides

---

## Version History

### Current Version: 3.0
- ✅ AI Q&A Module: Fully integrated
- ✅ Annotations Engine: Fully integrated
- ✅ Summary Manager: Fully integrated
- ✅ Modular architecture: Complete
- ✅ Error handling: In place
- ✅ LocalStorage persistence: Working

### Future Enhancements
- [ ] Cloud sync for annotations
- [ ] Collaborative features
- [ ] Advanced AI (API integration)
- [ ] PDF export
- [ ] Mobile app version

---

## Quick Reference Table

| What to Do | Where to Look | What to Modify |
|---|---|---|
| Add AI question type | ai-qa.js | trainingPatterns, askAI logic |
| Add annotation category | annotations-engine.js | annotationCategories, colorScheme |
| Change export format | annotations-engine.js | exportAnnotationsJSON function |
| Add new module | sentiment-analyzer.html | Script tag + new window functions |
| Fix AI response | ai-qa.js | Response templates, patterns |
| Fix annotation save | annotations-engine.js | createAnnotation, localStorage |
| Change UI display | sentiment-analyzer.html | CSS, HTML structure |

---

## Testing Scenarios

### Scenario 1: Full Flow
1. Load page
2. Enter text
3. Click Analyze
4. Ask AI question
5. Create annotation
6. Export annotations
✓ Expected: All steps work without errors

### Scenario 2: Module Independence
1. Test each module in console
2. Verify functions exist
3. Call with test data
4. Verify return values
✓ Expected: Each module works independently

### Scenario 3: Edge Cases
1. Try with empty text
2. Try with very long text
3. Try with special characters
4. Try with multiple annotations
✓ Expected: Graceful error handling

### Scenario 4: Persistence
1. Create annotations
2. Refresh page
3. Check annotations still exist
4. Export and verify data
✓ Expected: Data persists across sessions

---

## Support Resources

- **Technical Docs:** See INTEGRATION_GUIDE.md
- **Status Report:** See INTEGRATION_STATUS.md
- **Quick Ref:** See UI_MODULES_QUICK_REFERENCE.md
- **Verification:** Run MODULE_VERIFICATION.js in console

---

## Conclusion

The UI-to-modules integration is:
- ✅ Complete and functional
- ✅ Modular and maintainable
- ✅ Well-documented
- ✅ Ready for development

Follow these guidelines when making changes to preserve the architecture and ensure reliability.

**Happy Coding!** 🚀
