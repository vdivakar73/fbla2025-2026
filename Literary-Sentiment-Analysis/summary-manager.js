// Summary & Annotation Management System
// This module handles annotations, exports, sharing, and summary-related features
// Requires: currentText, currentAnalysisData, latestAnalysisData, userAnnotations (global variables)

// Lightweight notification helpers — prefer page `showToast` if available
function notify(message, opts = {}) {
    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
        window.showToast(message, opts.delay || 3000);
    } else if (typeof console !== 'undefined') {
        console.warn('notify:', message);
    }
}

function askConfirm(message, onConfirm) {
    if (typeof window !== 'undefined' && typeof window.showConfirm === 'function') {
        // Optional: a non-blocking confirm API if the page provides it
        window.showConfirm(message, onConfirm);
    } else {
        if (typeof window !== 'undefined' && typeof window.showConfirm === 'function') {
            window.showConfirm(message, onConfirm);
        } else if (typeof confirm === 'function' && confirm(message)) {
            onConfirm();
        }
    }
}

// ==================== ANNOTATION SYSTEM ====================

function generateSmartAnnotations(data) {
    console.log('generateSmartAnnotations called with data:', data);
    const annotations = [];

    // prefer explicit data, otherwise fall back to latestAnalysisData
    const src = data || window.latestAnalysisData || {};

    // Dominant emotion
    const emotionMap = src.emotionPercentages || src.emotions || {};
    const topEmotionEntry = Object.entries(emotionMap).sort((a,b)=>b[1]-a[1])[0];
    if (topEmotionEntry) {
        const [emo, val] = topEmotionEntry;
        annotations.push({ id: Date.now()+1, title: `Dominant Emotion: ${emo.charAt(0).toUpperCase()+emo.slice(1)}`, content: `This passage is dominated by ${emo} (${(val||0).toFixed? (val.toFixed(1)+'%') : val}). Notice how this feeling shapes imagery and diction throughout the text.`, editable:true, editing:false });
    }

    // Themes
    const themes = src.themes || [];
    if (themes.length) {
        const themeNames = themes.map(t => typeof t === 'object' ? t.theme : t).slice(0,4);
        annotations.push({ id: Date.now()+2, title: 'Key Themes', content: `Top themes: ${themeNames.join(', ')}. These themes recur in imagery, motifs, and repeated phrasing. Consider linking specific lines to each theme for evidence.`, editable:true, editing:false });
    }

    // Style & readability
    const avgSent = src.avgSentenceLength || (src.words && src.sentences ? src.words/src.sentences : null);
    const reading = src.readingLevel || (avgSent && avgSent>18 ? 'complex' : avgSent && avgSent<10 ? 'simple' : 'moderate');
    annotations.push({ id: Date.now()+3, title: 'Style & Complexity', content: `The writing style is ${reading}. Average sentence length: ${avgSent? avgSent.toFixed(1): 'N/A'}. Note sentence rhythm and paragraph breaks — they affect pacing and emphasis.`, editable:true, editing:false });

    // Literary devices
    const devices = src.literaryDevices || {};
    const deviceCount = Object.values(devices).reduce((a,b)=>a+b,0);
    if (deviceCount>0) {
        const topDevices = Object.entries(devices).filter(([_,c])=>c>0).sort((a,b)=>b[1]-a[1]).slice(0,4).map(d=>d[0]);
        annotations.push({ id: Date.now()+4, title: 'Literary Devices', content: `Detected devices (${deviceCount}): ${topDevices.join(', ')}. Highlight lines where these devices concentrate to deepen analysis.`, editable:true, editing:false });
    }

    // Sentiment & impact
    const sentScore = typeof src.sentimentScore !== 'undefined' ? src.sentimentScore : (src.sentiment && src.sentiment === 'positive' ? 1 : src.sentiment === 'negative' ? -1 : 0);
    annotations.push({ id: Date.now()+5, title: 'Overall Sentiment', content: `Overall sentiment: ${src.sentiment||'neutral'} (score: ${sentScore}). Consider how emotional intensity rises and falls across the text.`, editable:true, editing:false });

    // Generate key quote suggestions
    const quotes = extractKeyQuotes(src.text || '');
    if (quotes.length) {
        annotations.push({ id: Date.now()+6, title: 'Key Quotes', content: `Suggested key quotes to analyze: ${quotes.slice(0,3).map(q=>`"${q}"`).join('; ')}`, editable:true, editing:false });
    }

    // Ensure every suggestion has required fields for the annotation engine
    const normalized = annotations.map((a, idx) => ({
        id: a.id || (Date.now() + idx),
        title: a.title || (a.text ? (a.text.substring(0,40) + (a.text.length>40? '...':'')) : ('AI Suggestion ' + (idx+1))),
        content: (a.content && a.content.trim()) ? a.content : (a.note || a.text || 'AI suggestion (no further content)'),
        confidence: (typeof a.confidence === 'number') ? a.confidence : (typeof a.score === 'number' ? a.score : 60),
        editable: typeof a.editable === 'boolean' ? a.editable : true,
        editing: false
    }));
    // If no structured suggestions, provide a fallback set
    if (!normalized || normalized.length === 0) {
        const fb = generateFallbackAnnotations(src);
        console.log('Falling back to suggestions:', fb);
        return fb;
    }
    console.log('Generated annotations:', normalized);
    return normalized;
}

// Fallback smarter suggestions when analysis lacks themes/emotions
function generateFallbackAnnotations(data) {
    const text = (data && data.text) || '';
    const suggestions = [];
    if (!text || text.length < 20) return suggestions;
    // look for emotion keywords
    const emoWords = { love: 'Love/affection', fear: 'Fear/anxiety', joy: 'Joy/celebration', sadness: 'Sadness/melancholy', anger: 'Anger/frustration', hope: 'Hope/optimism' };
    for (const k of Object.keys(emoWords)) {
        if (text.toLowerCase().includes(k)) {
            suggestions.push({ id: Date.now() + Math.random(), title: `Emotion: ${emoWords[k]}`, content: `The text contains language associated with ${emoWords[k]}. Consider exploring where this appears and how it shapes tone.`, confidence: 65, editable: true, editing: false });
        }
    }
    // theme heuristics
    const themeHints = ['nature','love','time','death','journey','memory','identity'];
    const found = themeHints.filter(t => text.toLowerCase().includes(t));
    if (found.length) {
        suggestions.push({ id: Date.now()+2, title: 'Detected Themes', content: `Possible themes: ${found.slice(0,4).join(', ')}. Link lines to these themes for evidence.`, confidence: 60, editable:true, editing:false });
    }
    // if still empty, add a generic prompt
    if (suggestions.length === 0) {
        suggestions.push({ id: Date.now()+3, title: 'AI Suggestion', content: 'Highlight any lines that seem important and add a short note explaining why.', confidence: 50, editable:true, editing:false });
    }
    return suggestions;
}

function extractKeyQuotes(text) {
    if (!text) return [];
    const sentences = text.match(/[^\.\!\?]+[\.\!\?]?/g) || [];
    const emotionWords = ['love','hate','hope','fear','joy','sad','death','time','nature','journey','heart'];
    const scored = sentences.map(s => {
        const score = emotionWords.reduce((acc,w)=> acc + (s.toLowerCase().includes(w)?1:0), 0) + Math.min(1, s.length/100);
        return { s: s.trim(), score };
    }).sort((a,b)=>b.score-a.score);
    return scored.filter(x=>x.score>0).map(x=>x.s).slice(0,5);
}

function renderAnnotations() {
    const container = document.getElementById('annotations-container');
    console.log('renderAnnotations called. Container:', container, 'Annotations:', userAnnotations);
    if (!container) {
        console.error('annotations-container not found!');
        return;
    }
    
    if (userAnnotations.length === 0) {
        container.innerHTML = '<p style="color: #999; font-style: italic;">No annotations generated yet. Analyze text to see AI annotations.</p>';
        return;
    }
    
    console.log('Rendering', userAnnotations.length, 'annotations');
    container.innerHTML = userAnnotations.map((ann, index) => `
        <div class="annotation-item" style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <h4 style="margin: 0; color: #667eea; font-size: 1.1rem;" contenteditable="${ann.editing ? 'true' : 'false'}" 
                    id="ann-title-${ann.id}" onblur="saveAnnotationTitle(${ann.id})">${ann.title}</h4>
                <div>
                    <button onclick="toggleEditAnnotation(${ann.id})" class="btn-secondary" style="padding: 5px 12px; margin-right: 5px;">
                        ${ann.editing ? '💾 Save' : '✏️ Edit'}
                    </button>
                    <button onclick="deleteAnnotation(${ann.id})" class="btn-secondary" style="padding: 5px 12px; background: #dc3545;">
                        🗑️
                    </button>
                </div>
            </div>
            <p style="margin: 0; line-height: 1.6; color: #333;" contenteditable="${ann.editing ? 'true' : 'false'}"
               id="ann-content-${ann.id}" onblur="saveAnnotationContent(${ann.id})">${ann.content}</p>
        </div>
    `).join('');
    console.log('Annotations rendered successfully');
}

function addNewAnnotation() {
    const newAnn = {
        id: Date.now(),
        title: 'New Annotation',
        content: 'Click edit to add your insights about this text...',
        editable: true,
        editing: true
    };
    userAnnotations.push(newAnn);
    renderAnnotations();
}

function toggleEditAnnotation(id) {
    const ann = userAnnotations.find(a => a.id === id);
    if (ann) {
        ann.editing = !ann.editing;
        if (!ann.editing) {
            saveAnnotationTitle(id);
            saveAnnotationContent(id);
        }
        renderAnnotations();
    }
}

function saveAnnotationTitle(id) {
    const titleEl = document.getElementById(`ann-title-${id}`);
    const ann = userAnnotations.find(a => a.id === id);
    if (ann && titleEl) {
        ann.title = titleEl.textContent.trim() || 'Untitled';
    }
}

function saveAnnotationContent(id) {
    const contentEl = document.getElementById(`ann-content-${id}`);
    const ann = userAnnotations.find(a => a.id === id);
    if (ann && contentEl) {
        ann.content = contentEl.textContent.trim() || 'No content';
    }
}

function deleteAnnotation(id) {
    askConfirm('Are you sure you want to delete this annotation?', () => {
        userAnnotations = userAnnotations.filter(a => a.id !== id);
        renderAnnotations();
    });
}

// ==================== COMPARISON ANNOTATIONS ====================

function renderCompareAnnotations(panelNum) {
    const container = document.getElementById(`compare-annotations-${panelNum}`);
    console.log('renderCompareAnnotations called for panel', panelNum, 'Container:', container);
    if (!container) {
        console.error('Annotations container not found for panel', panelNum);
        return;
    }
    
    const annotations = window[`compareAnnotations${panelNum}`] || [];
    console.log('Annotations for panel', panelNum, ':', annotations);
    
    if (annotations.length === 0) {
        container.innerHTML = '<p style="color: #999; font-style: italic; font-size: 0.9rem;">No annotations yet. Click "Add Annotation" to create one!</p>';
        return;
    }
    
    container.innerHTML = annotations.map(ann => {
        const borderColor = ann.isComparison ? '#764ba2' : '#667eea';
        const bgColor = ann.isComparison ? '#f3e8ff' : '#f8f9fa';
        const compareLabel = ann.isComparison ? '<span style="background: #764ba2; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; margin-left: 8px;">🔄 Comparison</span>' : '';
        
        return `
        <div class="annotation-item" style="background: ${bgColor}; border-left: 3px solid ${borderColor}; padding: 12px; margin-bottom: 12px; border-radius: 6px; font-size: 0.9rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <h5 style="margin: 0; color: ${borderColor}; font-size: 1rem;" contenteditable="${ann.editing ? 'true' : 'false'}" 
                    id="comp-ann-title-${panelNum}-${ann.id}" onblur="saveCompareAnnotationTitle(${panelNum}, ${ann.id})">${ann.title}${compareLabel}</h5>
                <div>
                    <button onclick="toggleEditCompareAnnotation(${panelNum}, ${ann.id})" class="btn-secondary" style="padding: 3px 8px; margin-right: 3px; font-size: 0.8rem;">
                        ${ann.editing ? '💾' : '✏️'}
                    </button>
                    <button onclick="deleteCompareAnnotation(${panelNum}, ${ann.id})" class="btn-secondary" style="padding: 3px 8px; background: #dc3545; font-size: 0.8rem;">
                        🗑️
                    </button>
                </div>
            </div>
            <p style="margin: 0; line-height: 1.5; color: #333; font-size: 0.85rem;" contenteditable="${ann.editing ? 'true' : 'false'}"
               id="comp-ann-content-${panelNum}-${ann.id}" onblur="saveCompareAnnotationContent(${panelNum}, ${ann.id})">${ann.content}</p>
        </div>
    `;
    }).join('');
    console.log('Annotations rendered for panel', panelNum);
}

function addCompareAnnotation(panelNum) {
    if (!window[`compareAnnotations${panelNum}`]) {
        window[`compareAnnotations${panelNum}`] = [];
    }
    
    const newAnn = {
        id: Date.now(),
        title: 'New Annotation',
        content: 'Click edit to add your insights...',
        editable: true,
        editing: true,
        isComparison: false
    };
    window[`compareAnnotations${panelNum}`].push(newAnn);
    renderCompareAnnotations(panelNum);
}

function addComparisonAnnotation(panelNum) {
    if (!window[`compareAnnotations${panelNum}`]) {
        window[`compareAnnotations${panelNum}`] = [];
    }
    
    const otherPanel = panelNum === 1 ? 2 : 1;
    const thisText = document.getElementById(`compareText${panelNum}`).value.trim();
    const otherText = document.getElementById(`compareText${otherPanel}`).value.trim();
    
    if (!thisText || !otherText) {
        notify('Please analyze both texts before creating a comparison annotation!', { delay: 3500 });
        return;
    }
    
    // Get basic comparison insights
    const thisWords = thisText.split(/\s+/).length;
    const otherWords = otherText.split(/\s+/).length;
    const wordDiff = thisWords - otherWords;
    const wordDiffPercent = ((Math.abs(wordDiff) / otherWords) * 100).toFixed(1);
    
    const comparisonContent = `Compared to Text ${otherPanel}: This text is ${wordDiff > 0 ? 'longer' : wordDiff < 0 ? 'shorter' : 'similar in length'} (${Math.abs(wordDiff)} words ${wordDiff > 0 ? 'more' : wordDiff < 0 ? 'fewer' : 'difference'}, ${wordDiffPercent}% difference). Edit this annotation to add your own comparative insights about themes, style, tone, or emotional impact.`;
    
    const newAnn = {
        id: Date.now(),
        title: `Comparison with Text ${otherPanel}`,
        content: comparisonContent,
        editable: true,
        editing: false,
        isComparison: true
    };
    window[`compareAnnotations${panelNum}`].push(newAnn);
    renderCompareAnnotations(panelNum);
}

function toggleEditCompareAnnotation(panelNum, id) {
    const annotations = window[`compareAnnotations${panelNum}`];
    const ann = annotations?.find(a => a.id === id);
    if (ann) {
        ann.editing = !ann.editing;
        if (!ann.editing) {
            saveCompareAnnotationTitle(panelNum, id);
            saveCompareAnnotationContent(panelNum, id);
        }
        renderCompareAnnotations(panelNum);
    }
}

function saveCompareAnnotationTitle(panelNum, id) {
    const titleEl = document.getElementById(`comp-ann-title-${panelNum}-${id}`);
    const annotations = window[`compareAnnotations${panelNum}`];
    const ann = annotations?.find(a => a.id === id);
    if (ann && titleEl) {
        ann.title = titleEl.textContent.trim() || 'Untitled';
    }
}

function saveCompareAnnotationContent(panelNum, id) {
    const contentEl = document.getElementById(`comp-ann-content-${panelNum}-${id}`);
    const annotations = window[`compareAnnotations${panelNum}`];
    const ann = annotations?.find(a => a.id === id);
    if (ann && contentEl) {
        ann.content = contentEl.textContent.trim() || 'No content';
    }
}

function deleteCompareAnnotation(panelNum, id) {
    askConfirm('Delete this annotation?', () => {
        window[`compareAnnotations${panelNum}`] = window[`compareAnnotations${panelNum}`].filter(a => a.id !== id);
        renderCompareAnnotations(panelNum);
    });
}

// ==================== EXPORT FUNCTIONS ====================

function downloadResults() {
    if (!currentAnalysisData) {
        notify('Please analyze some text first!', { delay: 3000 });
        return;
    }

    const data = {
        timestamp: new Date().toISOString(),
        text: currentText,
        analysis: currentAnalysisData,
        annotations: annotations
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `literary-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportToPDF() {
    if (!latestAnalysisData) {
        notify('Please analyze text first!', { delay: 3000 });
        return;
    }

    if (typeof jspdf === 'undefined') {
        notify('PDF library not loaded. Please try again.', { delay: 3500 });
        return;
    }
    
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Literary Sentiment Analysis Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Word Count: ${latestAnalysisData.wordCount}`, 20, 38);
    doc.text(`Sentiment: ${latestAnalysisData.sentiment}`, 20, 46);
    
    doc.text('Analysis Summary:', 20, 60);
    const splitText = doc.splitTextToSize(currentText.substring(0, 500), 170);
    doc.text(splitText, 20, 70);
    
    doc.save('literary-analysis.pdf');
    notify('PDF exported successfully!', { delay: 2500 });
}

function exportToHTML() {
    if (!latestAnalysisData) {
        notify('Please analyze text first!', { delay: 3000 });
        return;
    }
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Literary Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1 { color: #667eea; }
        .stat { background: #f0f0f0; padding: 15px; margin: 10px 0; border-radius: 8px; }
    </style>
</head>
<body>
    <h1>Literary Sentiment Analysis Report</h1>
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    <div class="stat">
        <strong>Word Count:</strong> ${latestAnalysisData.wordCount}<br>
        <strong>Sentiment:</strong> ${latestAnalysisData.sentiment}<br>
        <strong>Confidence:</strong> ${latestAnalysisData.sentimentConfidence}%
    </div>
    <h2>Original Text</h2>
    <p>${currentText}</p>
</body>
</html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'literary-analysis.html';
    a.click();
    notify('HTML exported successfully!', { delay: 2000 });
}

function exportToCSV() {
    if (!latestAnalysisData) {
        notify('Please analyze text first!', { delay: 3000 });
        return;
    }
    
    let csv = 'Metric,Value\n';
    csv += `Word Count,${latestAnalysisData.wordCount}\n`;
    csv += `Sentence Count,${latestAnalysisData.sentenceCount}\n`;
    csv += `Sentiment,${latestAnalysisData.sentiment}\n`;
    csv += `Confidence,${latestAnalysisData.sentimentConfidence}%\n`;
    
    if (latestAnalysisData.emotionPercentages) {
        Object.entries(latestAnalysisData.emotionPercentages).forEach(([emotion, percent]) => {
            csv += `${emotion},${percent}%\n`;
        });
    }
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'literary-analysis.csv';
    a.click();
    notify('CSV exported successfully!', { delay: 2000 });
}

function exportToJSON() {
    if (!latestAnalysisData) {
        notify('Please analyze text first!', { delay: 3000 });
        return;
    }
    
    const jsonData = {
        timestamp: new Date().toISOString(),
        text: currentText,
        analysis: latestAnalysisData
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'literary-analysis.json';
    a.click();
    notify('JSON exported successfully!', { delay: 2000 });
}

function exportAnnotations() {
    if (annotations.length === 0) {
        notify('No annotations to export!', { delay: 2500 });
        return;
    }

    let text = '📝 ANNOTATIONS\n\n';
    annotations.forEach((ann, idx) => {
        text += `${idx + 1}. "${ann.text}"\n   Note: ${ann.note}\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotations-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportResults() {
    if (!currentAnalysisData) {
        notify('Please analyze some text first!', { delay: 3000 });
        return;
    }
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Literary Analysis Report</title>');
    printWindow.document.write('<style>body{font-family:Arial,sans-serif;padding:20px;}h1{color:#667eea;}h2{color:#764ba2;margin-top:20px;}.stat{margin:10px 0;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>📚 Literary Sentiment Analysis Report</h1>');
    printWindow.document.write(document.getElementById('results').innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// ==================== RELATED FUNCTIONS ====================

function toggleAnnotations() {
    const section = document.getElementById('annotationsSection');
    if (section.style.display === 'none' || !section.style.display) {
        section.style.display = 'block';
        // Initialize the advanced annotation engine
        if (window.initializeAnnotationEngine) {
            window.initializeAnnotationEngine();
        }
        // Render existing annotations
        if (window.renderAllAnnotations) {
            window.renderAllAnnotations();
        }
        section.scrollIntoView({ behavior: 'smooth' });
    } else {
        section.style.display = 'none';
    }
}

function updateAnnotations() {
    // Update annotated text
    let annotatedHTML = currentText;
    annotations.forEach((ann, idx) => {
        const escaped = ann.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        annotatedHTML = annotatedHTML.replace(regex, 
            `<span class="annotation-highlight">$1<span class="annotation-note">${ann.note}</span></span>`);
    });
    document.getElementById('annotatedText').innerHTML = annotatedHTML;

    // Update annotations list
    const list = document.getElementById('annotationsList');
    if (annotations.length === 0) {
        list.innerHTML = '<p style="color: #999; font-style: italic;">No annotations yet</p>';
    } else {
        list.innerHTML = annotations.map((ann, idx) => `
            <div class="annotation-item">
                <div class="annotation-item-text">"${ann.text}"</div>
                <div class="annotation-item-note">${ann.note}</div>
                <button class="btn-secondary" style="margin-top: 5px; padding: 5px 10px; font-size: 0.8rem;" onclick="deleteAnnotationByIndex(${idx})">🗑️ Delete</button>
            </div>
        `).join('');
    }
}

function deleteAnnotationByIndex(idx) {
    annotations.splice(idx, 1);
    updateAnnotations();
}

function clearAnnotations() {
    askConfirm('Clear all annotations?', () => {
        annotations = [];
        updateAnnotations();
    });
}

function addAnnotation() {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '') {
        notify('Please select some text first!', { delay: 3000 });
        return;
    }

    selectedText = selection.toString().trim();
    selectedRange = selection.getRangeAt(0);
    
    document.getElementById('selectedTextDisplay').textContent = selectedText;
    document.getElementById('annotationNoteInput').value = '';
    document.getElementById('annotationForm').style.display = 'block';
}

function saveAnnotation() {
    const note = document.getElementById('annotationNoteInput').value.trim();
    if (!note) {
        notify('Please enter a note!', { delay: 3000 });
        return;
    }

    annotations.push({
        text: selectedText,
        note: note,
        timestamp: new Date().toISOString()
    });

    updateAnnotations();
    closeAnnotationForm();
}

function closeAnnotationForm() {
    document.getElementById('annotationForm').style.display = 'none';
    selectedText = '';
    selectedRange = null;
}

function copyToClipboard() {
    const resultsText = document.getElementById('results').innerText;
    navigator.clipboard.writeText(resultsText).then(() => {
        notify('✅ Analysis copied to clipboard!', { delay: 2000 });
    });
}

function copyLink() {
    const encodedText = encodeURIComponent(currentText);
    const url = window.location.href.split('?')[0] + '?text=' + encodedText;
    navigator.clipboard.writeText(url).then(() => {
        notify('✅ Link copied to clipboard!', { delay: 2000 });
    });
}

function shareResults() {
    if (!currentAnalysisData) {
        notify('Please analyze some text first!', { delay: 3000 });
        return;
    }
    document.getElementById('shareModal').style.display = 'block';
}
