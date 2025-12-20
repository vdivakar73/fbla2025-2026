// ===================================================================
// ADVANCED ANNOTATIONS ENGINE
// Comprehensive annotation system with AI-powered features
// Handles: text highlighting, smart tagging, contextual analysis,
// collaboration-ready storage, export, and advanced queries
// ===================================================================

// Global annotation state
window.annotationState = {
    allAnnotations: [],
    selectedText: '',
    selectedRange: null,
    highlightedSpans: new Map(),
    lastSelection: null,
    annotationCategories: ['insight', 'question', 'vocabulary', 'technique', 'theme', 'character', 'symbolism', 'custom'],
    colorScheme: {
        'insight': '#FFE5B4',
        'question': '#B4E5FF',
        'vocabulary': '#D4B4FF',
        'technique': '#B4FFD4',
        'theme': '#FFB4B4',
        'character': '#FFFFB4',
        'symbolism': '#FFB4D4',
        'custom': '#E8E8E8'
    }
};

// Lightweight notification helper (uses showToast if available)
function notify(message, type = 'info', duration = 3000) {
    try {
        if (typeof showToast === 'function') return showToast(message, type, duration);
    } catch (e) {}
    // fallback
    if (type === 'error') console.error(message); else console.log(message);
}

// Lightweight confirm helper — will use global askConfirm if present
function askConfirmLocal(message, onConfirm) {
    try {
        if (typeof window !== 'undefined' && typeof window.askConfirm === 'function') {
            return window.askConfirm(message, onConfirm);
        }
        if (typeof window !== 'undefined' && typeof window.showConfirm === 'function') {
            return window.showConfirm(message, onConfirm);
        }
    } catch (e) {}
    if (typeof confirm === 'function' && confirm(message)) onConfirm();
}

// ==================== CORE ANNOTATION MANAGEMENT ====================

function initializeAnnotationEngine() {
    console.log('🔍 Initializing Advanced Annotations Engine');
    
    // Load saved annotations from localStorage
    const saved = localStorage.getItem('advancedAnnotations');
    if (saved) {
        try {
            window.annotationState.allAnnotations = JSON.parse(saved);
            console.log(`✅ Loaded ${window.annotationState.allAnnotations.length} saved annotations`);
        } catch (e) {
            console.error('Failed to load annotations:', e);
        }
    }
    
    // Set up text selection listener for highlighting
    document.addEventListener('mouseup', handleTextSelection);
    
    // Set up double-click to highlight words
    document.addEventListener('dblclick', handleDoubleClick);
}

function handleTextSelection() {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '') {
        return;
    }
    
    window.annotationState.lastSelection = {
        text: selection.toString().trim(),
        range: selection.getRangeAt(0),
        timestamp: Date.now()
    };
    
    // Show quick annotation menu if text is selected in the result area
    const resultsContainer = document.getElementById('results') || document.getElementById('annotatedText');
    if (resultsContainer && resultsContainer.contains(selection.anchorNode?.parentElement)) {
        showQuickAnnotationMenu(window.annotationState.lastSelection);
    }
}

function handleDoubleClick(e) {
    // Allow double-clicking a word to quickly annotate it
    if (e.target.classList.contains('annotation-highlight')) {
        const annotationId = e.target.dataset.annotationId;
        if (annotationId) {
            editAnnotation(annotationId);
        }
    }
}

function createAnnotation(selectedText, category = 'insight', title = '', content = '') {
    const annotation = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        text: selectedText,
        category: category,
        title: title || generateDefaultTitle(selectedText, category),
        content: content || generateDefaultContent(selectedText, category),
        timestamp: new Date().toISOString(),
        lineNumber: estimateLineNumber(selectedText),
        sentiment: analyzeSentiment(selectedText),
        relevance: calculateRelevance(selectedText),
        tags: extractTags(selectedText),
        editHistory: [],
        color: window.annotationState.colorScheme[category] || window.annotationState.colorScheme['custom']
    };
    
    window.annotationState.allAnnotations.push(annotation);
    saveAnnotationsToStorage();
    console.log('✅ Created annotation:', annotation.id, '- Category:', category);
    
    return annotation;
}

function editAnnotation(annotationId) {
    const annotation = window.annotationState.allAnnotations.find(a => a.id === annotationId);
    if (!annotation) return;
    
    // Record edit history before making changes
    annotation.editHistory.push({
        timestamp: annotation.timestamp,
        title: annotation.title,
        content: annotation.content
    });
    
    // Show edit form with current values
    showAnnotationEditForm(annotation);
}

function updateAnnotation(annotationId, updates) {
    const annotation = window.annotationState.allAnnotations.find(a => a.id === annotationId);
    if (!annotation) return;
    
    // Track change
    annotation.editHistory.push({
        timestamp: annotation.timestamp,
        title: annotation.title,
        content: annotation.content,
        category: annotation.category
    });
    
    // Apply updates
    Object.assign(annotation, {
        ...updates,
        timestamp: new Date().toISOString()
    });
    
    saveAnnotationsToStorage();
    renderAllAnnotations();
    console.log('✅ Updated annotation:', annotationId);
}

function deleteAnnotation(annotationId) {
    askConfirmLocal('Delete this annotation permanently?', () => {
        window.annotationState.allAnnotations = window.annotationState.allAnnotations.filter(a => a.id !== annotationId);
        saveAnnotationsToStorage();
        renderAllAnnotations();
        console.log('🗑️ Deleted annotation:', annotationId);
    });
}

function saveAnnotationsToStorage() {
    try {
        localStorage.setItem('advancedAnnotations', 
            JSON.stringify(window.annotationState.allAnnotations));
    } catch (e) {
        console.error('Failed to save annotations:', e);
    }
}

// ==================== UI RENDERING ====================

function renderAllAnnotations() {
    const container = document.getElementById('annotations-container') || 
                      document.getElementById('annotationsList');
    
    if (!container) {
        console.error('❌ Annotations container not found');
        return;
    }
    
    if (window.annotationState.allAnnotations.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <p style="font-size: 1.2rem; margin-bottom: 10px;">📝 No annotations yet</p>
                <p style="font-size: 0.9rem;">Select text and create an annotation to get started</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = window.annotationState.allAnnotations
        .map(ann => renderAnnotationCard(ann))
        .join('');
    
    console.log(`✅ Rendered ${window.annotationState.allAnnotations.length} annotations`);
}

function renderAnnotationCard(annotation) {
    const categoryBadge = `<span class="annotation-badge" style="background: ${annotation.color}; color: #333; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">${annotation.category.toUpperCase()}</span>`;
    
    const relevanceBar = `<div style="display: flex; gap: 5px; margin-top: 8px;">
        <span style="font-size: 0.75rem; color: #666;">Relevance:</span>
        <div style="flex: 1; background: #eee; height: 6px; border-radius: 3px; overflow: hidden;">
            <div style="background: linear-gradient(to right, #667eea, #764ba2); width: ${annotation.relevance * 100}%; height: 100%;"></div>
        </div>
    </div>`;
    
    const tagsDisplay = annotation.tags.length > 0 ? 
        `<div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 5px;">
            ${annotation.tags.map(tag => 
                `<span style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 0.75rem;">#${tag}</span>`
            ).join('')}
        </div>` : '';
    const commentsDisplay = (annotation.comments && annotation.comments.length) ?
        `<div style="margin-top:10px; background:#fff; padding:8px; border-radius:6px; border:1px solid #eee;">
            <strong style="font-size:0.9rem;">Comments</strong>
            ${annotation.comments.map(c=>`<div style="font-size:0.85rem; color:#444; margin-top:6px;">${escapeHtml(c.text)} <span style="color:#888; font-size:0.75rem;">• ${new Date(c.ts).toLocaleString()}</span></div>`).join('')}
        </div>` : '';
    
    const editHistoryLink = annotation.editHistory.length > 0 ?
        `<button class="annotation-action-btn" onclick="showEditHistory('${annotation.id}')" style="font-size: 0.75rem; padding: 3px 6px;">📋 History (${annotation.editHistory.length})</button>` : '';
    
    return `
        <div class="annotation-card" data-category="${annotation.category}" data-confidence="${annotation.confidence||0}" style="background: ${annotation.color}22; border-left: 4px solid ${annotation.color}; padding: 15px; margin-bottom: 15px; border-radius: 8px; break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0; color: #333; font-size: 1.05rem;">${escapeHtml(annotation.title)}</h4>
                    <div style="font-size: 0.85rem; color: #666;">
                        <span class="annotation-text-snippet">"${escapeHtml(annotation.text.substring(0, 50))}${annotation.text.length > 50 ? '...' : ''}"</span>
                        <span style="margin: 0 5px;">•</span>
                        <span>${new Date(annotation.timestamp).toLocaleDateString()}</span>
                    </div>
                </div>
                <div style="display: flex; gap: 5px; flex-shrink: 0;">
                    ${categoryBadge}
                </div>
            </div>
            
            <p style="margin: 10px 0; line-height: 1.5; color: #555;">${escapeHtml(annotation.content)}</p>
            
            ${relevanceBar}
            ${tagsDisplay}
            
            <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="annotation-action-btn" onclick="editAnnotation('${annotation.id}')" style="padding: 5px 10px;">✏️ Edit</button>
                <button class="annotation-action-btn" onclick="duplicateAnnotation('${annotation.id}')" style="padding: 5px 10px;">📋 Duplicate</button>
                <button class="annotation-action-btn" onclick="copyToClipboard('${escapeHtml(annotation.content)}')" style="padding: 5px 10px;">📋 Copy</button>
                <button class="annotation-action-btn" onclick="deleteAnnotation('${annotation.id}')" style="padding: 5px 10px; background: #ffcccc;">🗑️ Delete</button>
                <div style="margin-left:auto; font-size:0.85rem; color:#444; align-self:center;">Confidence: ${Math.round((annotation.confidence||0))}%</div>
                ${editHistoryLink}
            </div>
            ${commentsDisplay}
        </div>
    `;
}

    function addTagToAnnotation(annotationId, tag) {
        const ann = window.annotationState.allAnnotations.find(a => a.id === annotationId);
        if (!ann) return;
        ann.tags = ann.tags || [];
        if (!ann.tags.includes(tag)) ann.tags.push(tag);
        saveAnnotationsToStorage();
        renderAllAnnotations();
    }

    function addCommentToAnnotation(annotationId, comment) {
        const ann = window.annotationState.allAnnotations.find(a => a.id === annotationId);
        if (!ann) return;
        ann.comments = ann.comments || [];
        ann.comments.push({ text: comment, ts: Date.now() });
        saveAnnotationsToStorage();
        renderAllAnnotations();
    }

// Filter annotations displayed by category list and minimum confidence
function applyAnnotationFilters(categories = [], minConfidence = 0) {
    try {
        const container = document.getElementById('annotations-container') || document.getElementById('annotationsList');
        if (!container) return;
        const cards = container.querySelectorAll('.annotation-card');
        cards.forEach(card => {
            const cat = card.getAttribute('data-category') || '';
            const conf = parseFloat(card.getAttribute('data-confidence') || '0');
            const catMatch = categories.length === 0 || categories.includes(cat);
            const confMatch = conf >= (minConfidence || 0);
            card.style.display = (catMatch && confMatch) ? '' : 'none';
        });
    } catch (e) { console.warn('applyAnnotationFilters', e); }
}

function showQuickAnnotationMenu(selection) {
    const menu = document.createElement('div');
    menu.className = 'quick-annotation-menu';
    menu.style.cssText = `
        position: fixed;
        background: white;
        border: 2px solid #667eea;
        border-radius: 8px;
        padding: 10px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
        max-width: 300px;
    `;
    
    // Show category quick-add buttons
    window.annotationState.annotationCategories.slice(0, 5).forEach(category => {
        const btn = document.createElement('button');
        btn.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        btn.style.cssText = `
            background: ${window.annotationState.colorScheme[category]};
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8rem;
            font-weight: bold;
        `;
        btn.onclick = () => {
            createAnnotation(selection.text, category);
            renderAllAnnotations();
            menu.remove();
        };
        menu.appendChild(btn);
    });
    
    // Position near cursor
    const rect = selection.range.getBoundingClientRect();
    menu.style.left = rect.left + 'px';
    menu.style.top = (rect.bottom + 10) + 'px';
    
    document.body.appendChild(menu);
    
    // Remove menu after 5 seconds if not used
    setTimeout(() => menu.remove(), 5000);
}

function showAnnotationEditForm(annotation) {
    const modal = document.createElement('div');
    modal.className = 'annotation-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
    `;
    
    const categoryOptions = window.annotationState.annotationCategories
        .map(cat => `<option value="${cat}" ${cat === annotation.category ? 'selected' : ''}>${cat}</option>`)
        .join('');
    
    modal.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 12px; width: 90%; max-width: 600px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);">
            <h3 style="margin-top: 0; color: #333;">Edit Annotation</h3>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #555;">Original Text:</label>
                <div style="background: #f5f5f5; padding: 10px; border-radius: 6px; font-style: italic; color: #666;">
                    "${escapeHtml(annotation.text)}"
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #555;">Category:</label>
                <select id="ann-category" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
                    ${categoryOptions}
                </select>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #555;">Title:</label>
                <input id="ann-title" type="text" value="${escapeHtml(annotation.title)}" 
                    style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #555;">Content:</label>
                <textarea id="ann-content" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; min-height: 120px; font-family: Arial, sans-serif; box-sizing: border-box; font-size: 0.95rem;">${escapeHtml(annotation.content)}</textarea>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="saveAnnotationEdit('${annotation.id}')" class="btn-primary" style="flex: 1; padding: 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">💾 Save</button>
                <button onclick="this.closest('.annotation-modal').remove()" class="btn-secondary" style="flex: 1; padding: 12px; background: #ddd; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// ==================== ADVANCED ANALYSIS FUNCTIONS ====================

function generateDefaultTitle(text, category) {
    const textPreview = text.substring(0, 40);
    const titleMap = {
        'insight': `Insight: "${textPreview}"`,
        'question': `Question about "${textPreview}"`,
        'vocabulary': `Vocabulary: ${text.split(' ')[0]}`,
        'technique': `Literary Technique`,
        'theme': `Thematic Connection`,
        'character': `Character Analysis`,
        'symbolism': `Symbolic Meaning`,
        'custom': `Annotation: "${textPreview}"`
    };
    return titleMap[category] || titleMap['custom'];
}

function generateDefaultContent(text, category) {
    const contentMap = {
        'insight': `This passage reveals important insights about... [Add your analysis]`,
        'question': `Why does the author use this phrasing? Consider: [Your thoughts]`,
        'vocabulary': `"${text}" is used to convey... [Define impact]`,
        'technique': `This is an example of [technique]. It creates... [Analyze effect]`,
        'theme': `This connects to the theme of... [Explain connection]`,
        'character': `This reveals [character] is... [Describe traits]`,
        'symbolism': `The symbol represents... [Interpret meaning]`,
        'custom': `[Add your notes here]`
    };
    return contentMap[category] || contentMap['custom'];
}

function analyzeSentiment(text) {
    // Return an object with label and score for better downstream use
    const positiveWords = ['good', 'great', 'excellent', 'beautiful', 'wonderful', 'amazing', 'love', 'happy', 'joy', 'delight', 'hope'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'sad', 'angry', 'fear', 'death', 'despair', 'gloom'];
    const textLower = (text || '').toLowerCase();
    const words = textLower.split(/\W+/).filter(Boolean);
    const positiveCount = words.filter(w => positiveWords.includes(w)).length;
    const negativeCount = words.filter(w => negativeWords.includes(w)).length;
    const rawScore = positiveCount - negativeCount;
    const norm = words.length ? rawScore / Math.sqrt(words.length) : 0;
    const label = norm > 0.15 ? 'positive' : norm < -0.15 ? 'negative' : 'neutral';
    return { label, score: parseFloat(norm.toFixed(3)), positiveCount, negativeCount };
}

function calculateRelevance(text) {
    // Simple relevance calculation based on text length and word variety
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    
    // Longer, more varied text is more relevant
    let score = Math.min(1, (uniqueWords.size / words.length) * 0.5 + (words.length / 100) * 0.5);
    return Math.round(score * 100) / 100;
}

function extractTags(text) {
    // Extract tags by frequency excluding stopwords, prefer multi-word quoted phrases and proper nouns
    if (!text) return [];
    const stop = new Set(['the','and','a','an','of','to','in','on','for','with','by','that','is','are','it','as','this','be','or','from','at','was','which']);
    const tags = new Map();

    // quoted phrases
    const quoteMatches = Array.from(text.matchAll(/"([^\"]{3,80})"/g)).map(m => m[1].trim());
    quoteMatches.forEach(q => tags.set(q.toLowerCase(), (tags.get(q.toLowerCase())||0)+2));

    // words
    const words = text.split(/\W+/).filter(Boolean);
    words.forEach(w => {
        const lw = w.toLowerCase();
        if (stop.has(lw) || lw.length < 3) return;
        tags.set(lw, (tags.get(lw) || 0) + 1);
    });

    // proper nouns heuristics
    const proper = Array.from(text.matchAll(/\b([A-Z][a-z]{2,})\b/g)).map(m => m[1]);
    proper.forEach(p => tags.set(p.toLowerCase(), (tags.get(p.toLowerCase())||0)+2));

    // sort by score and return top 6
    return Array.from(tags.entries()).sort((a,b)=>b[1]-a[1]).slice(0,6).map(t=>t[0]);
}

function estimateLineNumber(text) {
    // Try to estimate which line this text appears on
    const resultsDiv = document.getElementById('results') || document.getElementById('annotatedText');
    if (!resultsDiv) return 0;
    
    const fullText = resultsDiv.innerText;
    const position = fullText.indexOf(text);
    if (position === -1) return 0;
    
    return fullText.substring(0, position).split('\n').length;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== ADVANCED FEATURES ====================

function duplicateAnnotation(annotationId) {
    const original = window.annotationState.allAnnotations.find(a => a.id === annotationId);
    if (!original) return;
    
    const duplicate = {
        ...original,
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        title: original.title + ' (Copy)',
        editHistory: []
    };
    
    window.annotationState.allAnnotations.push(duplicate);
    saveAnnotationsToStorage();
    renderAllAnnotations();
    console.log('✅ Duplicated annotation:', duplicate.id);
}

function showEditHistory(annotationId) {
    const annotation = window.annotationState.allAnnotations.find(a => a.id === annotationId);
    if (!annotation || annotation.editHistory.length === 0) {
        notify('No edit history for this annotation', 'info');
        return;
    }
    
    const history = annotation.editHistory.map((edit, idx) => `
        <div style="background: #f9f9f9; padding: 10px; margin-bottom: 10px; border-radius: 6px; border-left: 3px solid #667eea;">
            <strong>Version ${idx + 1}</strong> - ${new Date(edit.timestamp).toLocaleString()}
            <p><strong>Title:</strong> ${escapeHtml(edit.title)}</p>
            <p><strong>Content:</strong> ${escapeHtml(edit.content)}</p>
        </div>
    `).join('');
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10002;
    `;
    modal.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 12px; width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto;">
            <h3>📋 Edit History</h3>
            ${history}
            <button onclick="removeTopFixedOverlay()" class="btn-secondary" style="width: 100%; padding: 10px; background: #ddd; border: none; border-radius: 6px; cursor: pointer;">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function saveAnnotationEdit(annotationId) {
    const title = document.getElementById('ann-title').value.trim();
    const content = document.getElementById('ann-content').value.trim();
    const category = document.getElementById('ann-category').value;
    
    if (!title || !content) {
        notify('Title and content are required', 'error');
        return;
    }
    
    updateAnnotation(annotationId, { title, content, category });
    document.querySelector('.annotation-modal').remove();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        notify('Copied to clipboard', 'info');
    }).catch(() => {
        notify('Failed to copy to clipboard', 'error');
    });
}

// ==================== EXPORT FUNCTIONS ====================

function exportAnnotationsJSON() {
    const json = JSON.stringify(window.annotationState.allAnnotations, null, 2);
    downloadFile(json, `annotations-${Date.now()}.json`, 'application/json');
}

function exportAnnotationsCSV() {
    const headers = ['ID', 'Category', 'Title', 'Text', 'Content', 'Timestamp', 'Tags', 'Sentiment'];
    const rows = window.annotationState.allAnnotations.map(a => [
        a.id,
        a.category,
        a.title,
        a.text,
        a.content,
        a.timestamp,
        a.tags.join('; '),
        a.sentiment
    ]);
    
    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
    
    downloadFile(csv, `annotations-${Date.now()}.csv`, 'text/csv');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function clearAllAnnotations() {
    askConfirmLocal('🚨 Clear ALL annotations? This cannot be undone.', () => {
        window.annotationState.allAnnotations = [];
        saveAnnotationsToStorage();
        renderAllAnnotations();
    });
}

// ==================== SEARCH & FILTER ====================

function searchAnnotations(query) {
    const results = window.annotationState.allAnnotations.filter(ann => 
        ann.title.toLowerCase().includes(query.toLowerCase()) ||
        ann.content.toLowerCase().includes(query.toLowerCase()) ||
        ann.text.toLowerCase().includes(query.toLowerCase()) ||
        ann.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    console.log(`Found ${results.length} annotations matching "${query}"`);
    return results;
}

function filterAnnotationsByCategory(category) {
    return window.annotationState.allAnnotations.filter(a => a.category === category);
}

function getAnnotationStats() {
    const stats = {
        total: window.annotationState.allAnnotations.length,
        byCategory: {},
        bySentiment: {},
        averageRelevance: 0
    };
    
    window.annotationState.allAnnotations.forEach(ann => {
        stats.byCategory[ann.category] = (stats.byCategory[ann.category] || 0) + 1;
        stats.bySentiment[ann.sentiment] = (stats.bySentiment[ann.sentiment] || 0) + 1;
    });
    
    if (stats.total > 0) {
        stats.averageRelevance = (
            window.annotationState.allAnnotations.reduce((sum, a) => sum + a.relevance, 0) / stats.total
        ).toFixed(2);
    }
    
    return stats;
}

function displayAnnotationStats() {
    const stats = getAnnotationStats();
    const statsDiv = document.getElementById('annotationStats');
    const statsContent = document.getElementById('statsContent');
    
    if (!statsDiv || !statsContent) return;
    
    if (stats.total === 0) {
        statsDiv.style.display = 'none';
        return;
    }
    
    statsDiv.style.display = 'block';
    
    const categoryHtml = Object.entries(stats.byCategory)
        .map(([cat, count]) => `
            <span style="background: ${window.annotationState.colorScheme[cat] || '#ddd'}; padding: 4px 8px; border-radius: 4px; margin-right: 8px; font-size: 0.85rem; font-weight: bold;">
                ${cat}: ${count}
            </span>
        `).join('');
    
    const sentimentHtml = Object.entries(stats.bySentiment)
        .map(([sentiment, count]) => {
            const colors = { positive: '#4caf50', neutral: '#2196f3', negative: '#f44336' };
            return `<span style="background: ${colors[sentiment] || '#ddd'}; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px; font-size: 0.85rem; font-weight: bold;">${sentiment}: ${count}</span>`;
        }).join('');
    
    statsContent.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong>Total Annotations:</strong> ${stats.total}
        </div>
        <div style="margin-bottom: 10px;">
            <strong>By Category:</strong><br>
            ${categoryHtml || 'None'}
        </div>
        <div style="margin-bottom: 10px;">
            <strong>By Sentiment:</strong><br>
            ${sentimentHtml || 'None'}
        </div>
        <div>
            <strong>Average Relevance Score:</strong> ${stats.averageRelevance}
        </div>
    `;
}

function enableAnnotationSearch() {
    const searchInput = document.getElementById('annotationSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        if (query === '') {
            renderAllAnnotations();
            displayAnnotationStats();
            return;
        }
        
        const results = searchAnnotations(query);
        const container = document.getElementById('annotations-container');
        
        if (results.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 30px; color: #999;">
                    <p>❌ No annotations found matching "${escapeHtml(query)}"</p>
                </div>
            `;
        } else {
            container.innerHTML = results
                .map(ann => renderAnnotationCard(ann))
                .join('');
            
            const statsDiv = document.getElementById('annotationStats');
            if (statsDiv) {
                statsDiv.style.display = 'block';
                const statsContent = document.getElementById('statsContent');
                statsContent.innerHTML = `<p style="margin: 0; color: #666;">🔍 Found <strong>${results.length}</strong> of <strong>${window.annotationState.allAnnotations.length}</strong> annotations</p>`;
            }
        }
    });
}

// ==================== WINDOW EXPORTS FOR EXTERNAL ACCESS ====================
// These global functions allow other modules to interact with the annotation system

window.getAllAnnotations = function() {
    return window.annotationState?.allAnnotations || [];
};

window.createAnnotation = function(annotationData) {
    if (typeof annotationData === 'string') {
        return createAnnotation(annotationData, 'general');
    } else if (typeof annotationData === 'object') {
        const { text, category, title, content, sentiment, lineNumber } = annotationData;
        const ann = createAnnotation(text || '', category || 'general', title || '', content || '');
        if (sentiment) ann.sentiment = sentiment;
        if (lineNumber) ann.lineNumber = lineNumber;
        return ann;
    }
};

window.deleteAnnotation = function(annotationId) {
    window.annotationState.allAnnotations = window.annotationState.allAnnotations.filter(a => a.id !== annotationId);
    saveAnnotationsToStorage();
    return true;
};

window.updateAnnotation = function(annotationId, updates) {
    const annotation = window.annotationState.allAnnotations.find(a => a.id === annotationId);
    if (annotation) {
        Object.assign(annotation, updates);
        saveAnnotationsToStorage();
        return annotation;
    }
    return null;
};

window.getAnnotationsByCategory = function(category) {
    return window.annotationState.allAnnotations.filter(a => a.category === category);
};

window.getAnnotationsByTag = function(tag) {
    return window.annotationState.allAnnotations.filter(a => a.tags && a.tags.includes(tag));
};

window.exportAnnotationsJSON = function() {
    const annotations = window.getAllAnnotations();
    const dataStr = JSON.stringify(annotations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'annotations_' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
};

console.log('✓ Annotation System Export Functions Initialized');

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeAnnotationEngine();
        enableAnnotationSearch();
        displayAnnotationStats();
    });
} else {
    initializeAnnotationEngine();
    enableAnnotationSearch();
    displayAnnotationStats();
}
