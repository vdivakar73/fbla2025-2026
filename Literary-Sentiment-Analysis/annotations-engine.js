// ===================================================================
// ADVANCED ANNOTATIONS ENGINE (FIXED + STABLE)
// Engine-only: storage, logic, exports, rendering helpers
// ===================================================================

(function () {
    if (window.__ANNOTATION_ENGINE_INITIALIZED__) return;
    window.__ANNOTATION_ENGINE_INITIALIZED__ = true;

    // ---------------- STATE ----------------
    window.annotationState = {
        allAnnotations: [],
        annotationCategories: [
            'insight', 'question', 'vocabulary',
            'technique', 'theme', 'character',
            'symbolism', 'custom'
        ],
        colorScheme: {
            insight: '#FFE5B4',
            question: '#B4E5FF',
            vocabulary: '#D4B4FF',
            technique: '#B4FFD4',
            theme: '#FFB4B4',
            character: '#FFFFB4',
            symbolism: '#FFB4D4',
            custom: '#E8E8E8'
        }
    };

    // ---------------- HELPERS ----------------
    function notify(msg, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(msg, type);
        } else {
            console.log(`[${type}]`, msg);
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text ?? '';
        return div.innerHTML;
    }

    function save() {
        localStorage.setItem(
            'advancedAnnotations',
            JSON.stringify(window.annotationState.allAnnotations)
        );
    }

    function load() {
        try {
            const saved = localStorage.getItem('advancedAnnotations');
            if (saved) {
                window.annotationState.allAnnotations = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Annotation load failed', e);
        }
    }

    // ---------------- CORE API ----------------
    function createAnnotation({ text, category = 'custom', title = '', content = '' }) {
        if (!text) return null;

        const ann = {
            id: crypto.randomUUID(),
            text,
            category,
            title: title || text.slice(0, 40),
            content: content || '',
            timestamp: new Date().toISOString(),
            tags: [],
            relevance: Math.min(1, text.length / 200),
            sentiment: 'neutral',
            editHistory: [],
            color: window.annotationState.colorScheme[category] || '#ddd'
        };

        window.annotationState.allAnnotations.push(ann);
        save();
        renderAllAnnotations();
        return ann;
    }

    function updateAnnotation(id, updates) {
        const ann = window.annotationState.allAnnotations.find(a => a.id === id);
        if (!ann) return null;

        ann.editHistory.push({
            timestamp: ann.timestamp,
            title: ann.title,
            content: ann.content
        });

        Object.assign(ann, updates, {
            timestamp: new Date().toISOString()
        });

        save();
        renderAllAnnotations();
        return ann;
    }

    function deleteAnnotation(id) {
        window.annotationState.allAnnotations =
            window.annotationState.allAnnotations.filter(a => a.id !== id);
        save();
        renderAllAnnotations();
    }

    function getAllAnnotations() {
        return [...window.annotationState.allAnnotations];
    }

    // ---------------- RENDERING ----------------
    function renderAllAnnotations() {
        const container =
            document.getElementById('annotations-container') ||
            document.getElementById('annotationsList');

        if (!container) return;

        if (!window.annotationState.allAnnotations.length) {
            container.innerHTML = `
                <div style="padding:30px;text-align:center;color:#888">
                    No annotations yet
                </div>`;
            return;
        }

        container.innerHTML = window.annotationState.allAnnotations
            .map(renderAnnotationCard)
            .join('');
    }

    function renderAnnotationCard(a) {
        return `
        <div class="annotation-card"
             data-id="${a.id}"
             style="border-left:4px solid ${a.color};
                    padding:12px;
                    margin-bottom:12px;
                    background:#fff;">
            <strong>${escapeHtml(a.title)}</strong>
            <div style="font-size:0.85rem;color:#666">
                ${escapeHtml(a.text)}
            </div>
            <p>${escapeHtml(a.content)}</p>
            <div style="display:flex;gap:6px;">
                <button data-action="edit" data-id="${a.id}">Edit</button>
                <button data-action="delete" data-id="${a.id}">Delete</button>
            </div>
        </div>`;
    }

    // ---------------- EXPORT ----------------
    function exportAnnotationsJSON() {
        const blob = new Blob(
            [JSON.stringify(window.annotationState.allAnnotations, null, 2)],
            { type: 'application/json' }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `annotations-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ---------------- EVENTS ----------------
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const id = btn.dataset.id;
        if (btn.dataset.action === 'delete') {
            deleteAnnotation(id);
        }
    });

    // ---------------- INIT ----------------
    load();
    document.addEventListener('DOMContentLoaded', renderAllAnnotations);

    // ---------------- GLOBAL API ----------------
    window.createAnnotation = createAnnotation;
    window.updateAnnotation = updateAnnotation;
    window.deleteAnnotation = deleteAnnotation;
    window.getAllAnnotations = getAllAnnotations;
    window.exportAnnotationsJSON = exportAnnotationsJSON;
})();
