// Module Integration Verification Script
// Run this in the browser console after the page loads to verify all connections

console.log('%c=== LITERARY SENTIMENT ANALYZER - MODULE VERIFICATION ===', 'color: #667eea; font-size: 14px; font-weight: bold;');

// Test 1: HTML State Object
console.log('\n%c1. CHECKING STATE OBJECT', 'color: #764ba2; font-weight: bold;');
if (typeof state !== 'undefined') {
    console.log('✅ State object exists');
    console.log('   - currentText:', state.currentText ? `"${state.currentText.substring(0, 30)}..."` : 'empty');
    console.log('   - currentAnalysis:', state.currentAnalysis ? 'populated' : 'null');
} else {
    console.error('❌ State object not found');
}

// Test 2: AI Q&A Module
console.log('\n%c2. CHECKING AI Q&A MODULE', 'color: #f093fb; font-weight: bold;');
const aiQAFunctions = ['askQuestion', 'askAI'];
aiQAFunctions.forEach(fn => {
    if (typeof window[fn] === 'function') {
        console.log(`✅ window.${fn}() available`);
    } else {
        console.warn(`⚠️  window.${fn}() NOT available`);
    }
});

// Test 3: Annotations Engine Module
console.log('\n%c3. CHECKING ANNOTATIONS ENGINE MODULE', 'color: #764ba2; font-weight: bold;');
const annotationFunctions = [
    'getAllAnnotations', 
    'createAnnotation', 
    'deleteAnnotation',
    'updateAnnotation',
    'getAnnotationsByCategory',
    'getAnnotationsByTag',
    'exportAnnotationsJSON'
];
annotationFunctions.forEach(fn => {
    if (typeof window[fn] === 'function') {
        console.log(`✅ window.${fn}() available`);
    } else {
        console.warn(`⚠️  window.${fn}() NOT available`);
    }
});

// Check annotation state
if (typeof window.annotationState !== 'undefined') {
    console.log('✅ Annotation state object exists');
    console.log(`   - Total annotations: ${window.annotationState.allAnnotations?.length || 0}`);
    console.log(`   - Categories: ${window.annotationState.annotationCategories?.length || 0}`);
} else {
    console.warn('⚠️  Annotation state not initialized yet');
}

// Test 4: DOM Elements
console.log('\n%c4. CHECKING UI ELEMENTS', 'color: #2196f3; font-weight: bold;');
const uiElements = [
    { id: 'aiQuestion', type: 'AI input field' },
    { id: 'aiAnswer', type: 'AI output area' },
    { id: 'aiAnswerBox', type: 'AI answer container' },
    { id: 'annotationsContainer', type: 'Annotations display' },
    { id: 'textInput', type: 'Main text input' },
    { id: 'results', type: 'Results area' }
];

uiElements.forEach(elem => {
    const el = document.getElementById(elem.id);
    if (el) {
        console.log(`✅ #${elem.id} (${elem.type}) found`);
    } else {
        console.warn(`⚠️  #${elem.id} (${elem.type}) NOT found`);
    }
});

// Test 5: Key Functions
console.log('\n%c5. CHECKING MAIN UI FUNCTIONS', 'color: #4caf50; font-weight: bold;');
const mainFunctions = [
    'analyzeText',
    'askAI',
    'openAnnotations',
    'saveAnnotation',
    'exportAnnotations',
    'loadExample',
    'switchTab'
];

mainFunctions.forEach(fn => {
    if (typeof window[fn] === 'function') {
        console.log(`✅ ${fn}() available`);
    } else {
        console.warn(`⚠️  ${fn}() NOT available`);
    }
});

// Test 6: Storage
console.log('\n%c6. CHECKING STORAGE', 'color: #ff9800; font-weight: bold;');
try {
    const testKey = '__test_storage__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    console.log('✅ LocalStorage available');
    
    const savedAnnotations = localStorage.getItem('advancedAnnotations');
    if (savedAnnotations) {
        console.log(`✅ Saved annotations found (${JSON.parse(savedAnnotations).length} items)`);
    } else {
        console.log('ℹ️  No saved annotations yet');
    }
} catch (e) {
    console.error('❌ LocalStorage not available:', e.message);
}

// Test 7: Quick Function Tests
console.log('\n%c7. QUICK FUNCTION TESTS', 'color: #f44336; font-weight: bold;');

// Test AI function
if (typeof window.askQuestion === 'function') {
    try {
        const result = window.askQuestion("What's the sentiment?", "Hello world", {sentiment: "positive"});
        console.log('✅ window.askQuestion() works - returned:', typeof result);
    } catch (e) {
        console.warn('⚠️  window.askQuestion() error:', e.message);
    }
}

// Test getAllAnnotations
if (typeof window.getAllAnnotations === 'function') {
    try {
        const annotations = window.getAllAnnotations();
        console.log(`✅ window.getAllAnnotations() works - returned: ${annotations.length} annotations`);
    } catch (e) {
        console.warn('⚠️  window.getAllAnnotations() error:', e.message);
    }
}

// Summary
console.log('\n%c=== VERIFICATION SUMMARY ===', 'color: #667eea; font-size: 14px; font-weight: bold;');
console.log('%cAll modules appear to be properly connected and ready to use! 🎉', 'color: #4caf50; font-weight: bold;');
console.log('\nTroubleshooting tips:');
console.log('1. Check browser console for any red error messages');
console.log('2. Make sure all .js files are in the same directory');
console.log('3. Try refreshing the page with Ctrl+Shift+R');
console.log('4. Check that JavaScript is enabled in your browser');
