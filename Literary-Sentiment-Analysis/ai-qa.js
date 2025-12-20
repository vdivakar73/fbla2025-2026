// AI Q&A System for Sentiment Analyzer
// This module handles intelligent question answering about analyzed text
// Requires: latestAnalysisData (global variable from main file)

function askAI() {
    console.log('Ask AI function called');
    
    try {
        const questionInput = document.getElementById('ai-question-input');
        const aiResponse = document.getElementById('ai-response');
        const aiAnswer = document.getElementById('ai-answer');
        
        if (!questionInput || !aiResponse || !aiAnswer) {
            console.error('AI elements not found');
            if (typeof showToast === 'function') showToast('AI interface error. Please analyze text first.', 'error'); else console.error('AI interface error');
            return;
        }
        
        const question = questionInput.value.trim();
        const questionLower = question.toLowerCase();
        
        console.log('Question:', question);
        
        if (!question) {
            if (typeof showToast === 'function') showToast('Please enter a question', 'error');
            return;
        }

        if (!latestAnalysisData) {
            if (typeof showToast === 'function') showToast('Please analyze some text first', 'error');
            return;
        }
    
    const data = latestAnalysisData;
    let answer = '';
    
    // AI TRAINING DATA - Enhanced pattern matching with literary knowledge base
    const trainingPatterns = {
        emotionalChange: ['how does', 'emotion', 'change', 'evolve', 'shift', 'transform', 'progress'],
        meaning: ['what does', 'mean', 'symbolize', 'represent', 'signify', 'convey'],
        style: ['style', 'write', 'writing', 'technique', 'craft', 'approach'],
        comparison: ['compare', 'contrast', 'difference', 'similar', 'versus', 'vs'],
        effectiveness: ['effective', 'powerful', 'impact', 'successful', 'work'],
        audience: ['who', 'audience', 'reader', 'for whom'],
        purpose: ['why', 'purpose', 'intent', 'goal', 'reason'],
        structure: ['structure', 'organize', 'arrange', 'flow', 'sequence']
    };
    
    // Enhanced pattern matching with scoring
    function matchPattern(keywords) {
        return keywords.reduce((score, word) => score + (questionLower.includes(word) ? 1 : 0), 0);
    }
    
    const patternScores = {
        emotionalChange: matchPattern(trainingPatterns.emotionalChange),
        meaning: matchPattern(trainingPatterns.meaning),
        style: matchPattern(trainingPatterns.style),
        comparison: matchPattern(trainingPatterns.comparison),
        effectiveness: matchPattern(trainingPatterns.effectiveness),
        audience: matchPattern(trainingPatterns.audience),
        purpose: matchPattern(trainingPatterns.purpose),
        structure: matchPattern(trainingPatterns.structure)
    };
    
    const bestMatch = Object.entries(patternScores).sort((a, b) => b[1] - a[1])[0];
    
    // COMPLEX MULTI-PART ANALYSIS QUESTIONS
    if (bestMatch[0] === 'emotionalChange' && bestMatch[1] >= 2) {
        const arc = data.emotionalArc || [];
        if (arc.length > 0) {
            const start = arc[0];
            const middle = arc[Math.floor(arc.length / 2)];
            const end = arc[arc.length - 1];
            const variance = arc.reduce((sum, point, i) => {
                if (i === 0) return 0;
                return sum + Math.abs(point.score - arc[i-1].score);
            }, 0) / arc.length;
            
            const startFeeling = start.score > 0 ? 'positive' : start.score < 0 ? 'negative' : 'neutral';
            const dramaticShift = Math.abs(end.score - start.score) > 1;
            const startTone = start.score > 0 ? 'positive' : 'negative';
            const endTone = end.score > 0 ? 'positive' : 'negative';
            
            let shiftText = dramaticShift 
                ? "What's particularly striking is the dramatic shift from " + startTone + " emotions to " + endTone + " feelings by the end, suggesting the characters or narrator undergo real transformation."
                : 'The emotional tone remains fairly consistent throughout, which creates a sense of thematic unity and focus.';
            
            let varianceText = variance > 0.5 
                ? 'Throughout the piece, the emotions shift quite volatilely, creating dramatic tension and keeping readers engaged.'
                : variance > 0.2 
                    ? "There's a moderate amount of emotional variation that adds depth without overwhelming the narrative."
                    : 'The emotional progression is quite stable and measured, allowing readers to settle into the mood.';
            
            let pacingText = arc.length > 7
                ? 'The extended emotional progression shows sophisticated pacing, giving readers time to experience gradual psychological development.'
                : 'The compact emotional structure creates intensity and immediate impact, perfect for shorter pieces.';
            
            answer = "The emotional journey of this text is quite interesting. It begins with " + start.label + ", which feels " + startFeeling + ", then moves through " + middle.label + " in the middle section, and ultimately ends with " + end.label + ". " + shiftText + " " + varianceText + " " + pacingText;
        } else {
            answer = 'The text is too short to track emotional changes. Try analyzing longer passages (100+ words) for meaningful emotional progression analysis.';
        }
    }
    // INTERPRETATION & MEANING QUESTIONS
    else if (bestMatch[0] === 'meaning' && bestMatch[1] >= 2) {
        const themes = data.themes || [];
        const themeNames = themes.map(t => typeof t === 'object' ? t.theme : t);
        const topEmotion = Object.entries(data.emotionPercentages || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
        const sentiment = data.sentiment || 'neutral';
        answer = `At its core, this text explores ${themeNames.join(', ') || 'universal human experiences'}, approaching these ideas through a ${sentiment} emotional lens. The dominant feeling throughout is ${topEmotion}, which really shapes how readers experience the themes. ${sentiment === 'positive' ? 'The positive tone invites us to celebrate and affirm these ideas, creating an uplifting interpretation.' : sentiment === 'negative' ? 'The critical or darker tone pushes us to question and reflect deeply on these themes, prompting important introspection.' : 'The balanced tone allows us to contemplate these themes thoughtfully without being pushed toward any particular emotional conclusion.'} This combination of theme and emotion creates the text's deeper meaning.`;
    }
    // WRITING STYLE & AUTHOR'S CHOICES
    else if (questionLower.includes('style') || questionLower.includes('author') && (questionLower.includes('write') || questionLower.includes('choice'))) {
        const readingLevel = data.readingLevel || 'moderate';
        const avgWordLength = data.avgWordLength || 0;
        const avgSentenceLength = data.avgSentenceLength || 0;
        const devices = data.literaryDevices || {};
        const deviceCount = Object.values(devices).reduce((a, b) => a + b, 0);
        
        const styleDesc = readingLevel === 'complex' ? 'quite sophisticated and complex' : readingLevel === 'simple' ? 'clear and accessible' : 'moderately sophisticated';
        const sentenceDesc = avgSentenceLength > 15 ? 'flowing, complex sentences that build intricate ideas' : 'concise, direct sentences that get straight to the point';
        const vocabDesc = avgWordLength > 5 ? 'longer, more sophisticated words' : 'shorter, more accessible language';
        const deviceDesc = deviceCount > 5 ? 'The writing is rich with literary devices, creating highly poetic and layered prose.' : deviceCount > 2 ? "There's a moderate use of literary techniques, balancing artistry with clarity." : 'The prose is fairly straightforward, prioritizing clear communication over ornate language.';
        const formalityDesc = data.toneAnalysis?.formality === 'formal' ? 'formal, elevated language' : data.toneAnalysis?.formality === 'casual' ? 'casual, conversational language' : 'a balanced level of formality';
        
        answer = "The author's writing style is " + styleDesc + ", using " + sentenceDesc + ". The vocabulary tends toward " + vocabDesc + ", with words averaging about " + avgWordLength.toFixed(1) + " characters. " + deviceDesc + " The overall tone is " + (data.sentiment || 'neutral') + " with " + formalityDesc + ". Sentences average around " + avgSentenceLength.toFixed(1) + " words each.";
    }
    // COMPARISON QUESTIONS
    else if (questionLower.includes('compare') || questionLower.includes('difference') || questionLower.includes('similar')) {
        const emotions = Object.entries(data.emotionPercentages || {}).sort((a, b) => b[1] - a[1]);
        if (emotions.length >= 2) {
            answer = `The emotional landscape here is interesting because it balances multiple feelings. ${emotions[0][0].charAt(0).toUpperCase() + emotions[0][0].slice(1)} is the dominant emotion, making up about ${emotions[0][1].toFixed(1)}% of the emotional content${emotions[0][1] > 30 ? ', which is quite strong' : ''}. ${emotions[1][0].charAt(0).toUpperCase() + emotions[1][0].slice(1)} serves as a secondary emotion at ${emotions[1][1].toFixed(1)}%. ${Math.abs(emotions[0][1] - emotions[1][1]) < 10 ? 'These two are actually quite close in strength, creating tension and complexity as conflicting emotions compete for dominance.' : 'The secondary emotion provides supporting context without challenging the primary feeling.'} ${emotions[0][1] > emotions[1][1] * 2 ? 'Overall, the dominant emotion really controls the mood of the piece.' : 'The interplay between these different emotions creates interesting emotional complexity and depth.'}`;
        } else {
            answer = 'This text shows a single dominant emotional quality without strong contrasts.';
        }
    }
    // GENRE & CLASSIFICATION
    else if (questionLower.includes('genre') || questionLower.includes('type of') && questionLower.includes('text')) {
        const genre = data.genre || 'general';
        const themes = data.themes || [];
        const themeNames = themes.map(t => typeof t === 'object' ? t.theme : t);
        answer = `This appears to be ${genre === 'poetry' ? 'poetry, characterized by lyrical expression, emotional depth, and condensed language that packs meaning into every word' : genre === 'narrative' ? 'narrative writing, featuring story progression, character development, and clear plot structure' : genre === 'descriptive' ? 'descriptive writing, rich with vivid imagery, sensory details, and observational focus' : 'reflective prose that contemplates ideas thoughtfully'}. The text deals with themes like ${themeNames.join(', ') || 'universal human experiences'}, which is typical for this type of writing. Based on analyzing the ${data.sentences} sentences, the structural patterns, vocabulary choices, and narrative techniques all point toward this classification.`;
    }
    // AUDIENCE & PURPOSE
    else if (questionLower.includes('audience') || questionLower.includes('who') && questionLower.includes('for') || questionLower.includes('purpose')) {
        const readingLevel = data.readingLevel || 'moderate';
        const themes = data.themes || [];
        const themeNames = themes.map(t => typeof t === 'object' ? t.theme : t);
        answer = `This text seems to be written for ${readingLevel === 'complex' ? 'advanced readers, scholars, and literary enthusiasts who appreciate sophisticated language and complex ideas' : readingLevel === 'simple' ? 'a general audience, including younger readers and those who value accessibility and clarity' : 'educated general readers who can handle moderately sophisticated content'}. The author's purpose appears to be ${data.sentiment === 'positive' ? 'inspiring, uplifting, or celebrating something meaningful' : data.sentiment === 'negative' ? 'critiquing, warning about, or provoking deep thought on difficult subjects' : 'informing, reflecting on, or analyzing ideas in a balanced way'}. The subject matter focuses on ${themeNames.join(', ') || 'universal human experiences'}. Given the ${readingLevel} complexity level and ${data.sentiment} emotional tone, this writing ${readingLevel === 'complex' ? 'aims to deepen understanding of complex ideas through layered analysis' : 'prioritizes broad accessibility and emotional engagement over complexity'}.`;
    }
    // WHY QUESTIONS (Author's Intent)
    else if (questionLower.startsWith('why') && (questionLower.includes('author') || questionLower.includes('writer'))) {
        const sentiment = data.sentiment || 'neutral';
        const topEmotion = Object.entries(data.emotionPercentages || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
        answer = `Considering the ${sentiment} sentiment and the strong presence of ${topEmotion} throughout the piece, the author likely wants to ${topEmotion === 'joy' ? 'celebrate something wonderful or share genuine happiness with readers' : topEmotion === 'sadness' ? 'evoke empathy and help us process grief or loss together' : topEmotion === 'love' ? 'express deep affection or explore meaningful connections between people' : topEmotion === 'fear' ? 'explore anxiety and tension, perhaps to help us confront our own fears' : topEmotion === 'anger' ? 'challenge injustice or give voice to important frustrations' : topEmotion === 'hope' ? 'inspire optimism and encourage us to persevere through difficulties' : 'create an atmosphere of mystery and intrigue that keeps readers engaged'}. ${data.keyQuotes?.[0] ? `You can really see this intent in the phrase "${data.keyQuotes[0]}", which resonates emotionally with that purpose.` : 'This purpose comes through consistently in the overall tone and word choices.'} Writers often choose specific emotional tones deliberately to create particular effects on their readers.`;
    }
    // SENTIMENT-RELATED QUESTIONS
    else if (questionLower.includes('sentiment') || questionLower.includes('tone') || questionLower.includes('overall feeling')) {
        answer = `The overall feeling of this text is ${data.sentiment}, with a sentiment score of ${data.sentimentScore.toFixed(2)}${data.sentimentScore > 1 ? ', which is strongly positive' : data.sentimentScore < -1 ? ', which is strongly negative' : ', which shows pretty good balance'}. ${Math.abs(data.sentimentScore) > 1.5 ? 'The emotional direction is very clear and consistent - you can really feel the strong mood throughout.' : Math.abs(data.sentimentScore) > 0.5 ? 'The tone is moderate but noticeable, giving the text a discernible emotional character.' : 'The emotions are quite balanced or neutral, avoiding strong pushes in either direction.'} What this means practically is that the text creates a ${data.sentiment} emotional atmosphere that ${Math.abs(data.sentimentScore) > 1 ? 'strongly shapes how readers experience and interpret everything' : 'subtly influences our interpretation without overwhelming the content'}.`;
    }
    // THEME-RELATED QUESTIONS
    else if (questionLower.includes('theme') || questionLower.includes('about') && !questionLower.includes('what can') || questionLower.includes('topic') || questionLower.includes('subject')) {
        const themes = data.themes && data.themes.length > 0 ? data.themes : [{theme: 'universal human experiences'}];
        const themeNames = themes.map(t => typeof t === 'object' ? t.theme : t);
        answer = `This text deals with several important themes. The main ones are ${themeNames.slice(0, 3).join(', ')}. I detected ${themes.length} distinct thematic elements overall. ${themeNames.length > 0 ? `Let me break down the top themes: ${themeNames.slice(0, 3).map((t, i) => `${t.charAt(0).toUpperCase() + t.slice(1)} ${t === 'nature' ? 'explores our relationship with the natural world and environment' : t === 'love' ? 'examines romantic, familial, or universal forms of affection and connection' : t === 'death' ? 'contemplates mortality, endings, and the cycle of life' : t === 'time' ? 'reflects on how we experience temporal passage and change' : t === 'journey' ? 'represents physical travel or metaphorical personal growth' : 'serves as a central element in the narrative'}`).join('. ')}.` : ''} These themes ${themes.length > 3 ? 'interweave to create a rich, multi-layered narrative with lots of depth' : 'work together to create a focused thematic exploration that stays on message'}.`;
    }
    // EMOTION-RELATED QUESTIONS
    else if (questionLower.includes('emotion') || questionLower.includes('feeling') || questionLower.includes('mood')) {
        const emotions = Object.entries(data.emotionPercentages || {}).sort((a, b) => b[1] - a[1]);
        const topEmotions = emotions.slice(0, 3);
        
        const emotionParts = topEmotions.map(([emotion, percent], i) => {
            if (i === 0) return emotion.charAt(0).toUpperCase() + emotion.slice(1) + ' is the dominant feeling, making up ' + percent.toFixed(1) + '% of the emotional content';
            if (i === 1) return emotion + ' is secondary at ' + percent.toFixed(1) + '%';
            return 'and ' + emotion + ' provides supporting emotion at ' + percent.toFixed(1) + '%';
        }).join(', ');
        
        const balanceDesc = topEmotions[0][1] > 40 ? 'The text is quite emotionally focused - that single dominant emotion really controls the mood and creates a unified feeling throughout.' : topEmotions[0][1] > 25 ? "There's a moderate balance here, with a clear primary emotion but good support from secondary feelings, creating emotional depth." : 'This is emotionally complex, with multiple emotions competing for attention, which makes the mood nuanced and layered.';
        
        const explanation = data.emotionExplanations?.[topEmotions[0][0]] || "These different emotional threads weave together to create the text's unique emotional signature and character.";
        
        answer = "The emotional makeup of this text is interesting. " + emotionParts + ". Overall, I detected " + emotions.length + " distinct emotional qualities. " + balanceDesc + " " + explanation;
    }
    // QUOTE-RELATED QUESTIONS
    else if (questionLower.includes('quote') || questionLower.includes('important') && questionLower.includes('line') || questionLower.includes('key') || questionLower.includes('memorable') || questionLower.includes('best part')) {
        const quotes = data.keyQuotes && data.keyQuotes.length > 0 ? data.keyQuotes : [];
        if (quotes.length > 0) {
            answer = `💎 **Key Quotes & Their Significance:**<br><br>${quotes.map((q, i) => `**${i + 1}.** "${q}"<br>→ ${i === 0 ? 'Most impactful - combines emotional resonance, imagery, and thematic clarity' : i === 1 ? 'Strong literary value - showcases writing technique and depth' : 'Memorable expression - captures essence of the text'}`).join('<br><br>')}<br><br>These quotes were selected for their emotional weight, literary quality, and thematic importance.`;
        } else {
            answer = 'No standout quotes were identified, though the text maintains consistent quality throughout.';
        }
    }
    // COMPLEXITY & READING LEVEL QUESTIONS
    else if (questionLower.includes('complex') || questionLower.includes('difficult') || questionLower.includes('reading level') || questionLower.includes('hard to read')) {
        const readingLevel = data.readingLevel || 'moderate';
        const avgWordLength = data.avgWordLength || 0;
        const avgSentenceLength = data.avgSentenceLength || 0;
        const vocabularyRichness = data.vocabularyRichness || 0;
        answer = `📖 **Readability Analysis:**<br><br>**Reading Level:** ${readingLevel.toUpperCase()}<br>**Average Word Length:** ${avgWordLength.toFixed(1)} characters ${avgWordLength > 5 ? '(sophisticated vocabulary)' : avgWordLength > 4 ? '(moderate vocabulary)' : '(accessible vocabulary)'}<br>**Average Sentence Length:** ${avgSentenceLength.toFixed(1)} words ${avgSentenceLength > 20 ? '(complex sentences)' : avgSentenceLength > 12 ? '(moderate sentences)' : '(simple sentences)'}<br>**Vocabulary Richness:** ${(vocabularyRichness * 100).toFixed(1)}% unique words<br><br>${readingLevel === 'complex' ? '🎓 This text requires advanced reading skills, featuring sophisticated vocabulary and intricate sentence structures. Best suited for experienced readers.' : readingLevel === 'simple' ? '✅ This text is highly accessible with straightforward language and clear sentence structures. Suitable for most readers.' : '📚 This text balances accessibility with literary quality, using moderately sophisticated language appropriate for educated general readers.'}`;
    }
    // LENGTH & STATISTICS QUESTIONS
    else if (questionLower.includes('long') || questionLower.includes('length') || questionLower.includes('word count') || questionLower.includes('how many') || questionLower.includes('statistics')) {
        const readingTime = Math.ceil(data.words / 200);
        answer = `📊 **Text Statistics:**<br><br>**Word Count:** ${data.words} words<br>**Sentence Count:** ${data.sentences} sentences<br>**Average Sentence Length:** ${(data.words / data.sentences).toFixed(1)} words<br>**Estimated Reading Time:** ${readingTime} minute${readingTime !== 1 ? 's' : ''} (at 200 wpm)<br>**Text Classification:** ${data.words < 50 ? '📝 Short form - flash fiction, poem, or excerpt' : data.words < 200 ? '📄 Medium length - short story or essay segment' : data.words < 500 ? '📖 Extended piece - full short story or chapter' : '📚 Long form - substantial literary work'}<br><br>The ${data.sentences > data.words / 10 ? 'high sentence count relative to words suggests concise, punchy writing' : 'lower sentence density indicates flowing, descriptive prose'}.`;
    }
    // LITERARY DEVICE QUESTIONS
    else if (questionLower.includes('literary') || questionLower.includes('device') || questionLower.includes('technique') || questionLower.includes('poetic')) {
        const devices = data.literaryDevices || {};
        const deviceEntries = Object.entries(devices).filter(([_, count]) => count > 0);
        if (deviceEntries.length > 0) {
            answer = `🎭 **Literary Devices Detected:**<br><br>${deviceEntries.map(([device, count]) => `**${device}** (${count}×) - ${device === 'repetition' ? 'Emphasizes key ideas through repeated words or phrases' : device === 'rhyme' ? 'Creates musicality and memorability' : device === 'alliteration' ? 'Produces pleasing sound patterns' : device === 'metaphor' ? 'Makes implicit comparisons for deeper meaning' : device === 'simile' ? 'Uses explicit comparisons (like/as)' : device === 'personification' ? 'Gives human qualities to non-human things' : device === 'imagery' ? 'Evokes sensory experiences' : device === 'symbolism' ? 'Represents abstract ideas through concrete objects' : 'Enhances literary quality'}`).join('<br><br>')}<br><br>**Literary Richness Score:** ${deviceEntries.length > 5 ? 'HIGH - Highly sophisticated literary technique' : deviceEntries.length > 2 ? 'MODERATE - Balanced use of literary devices' : 'MINIMAL - Straightforward prose with few ornamental techniques'}`;
        } else {
            answer = '📝 **Literary Analysis:** This text uses primarily straightforward prose without prominent literary devices, focusing on direct communication rather than ornamental technique.';
        }
    }
    // CHARACTER & NARRATIVE QUESTIONS
    else if (questionLower.includes('character') || questionLower.includes('who') || questionLower.includes('person') || questionLower.includes('people')) {
        const text = data.text || '';
        const pronouns = (text.match(/\b(he|she|they|him|her|them|his|hers|their)\b/gi) || []).length;
        const names = (text.match(/\b[A-Z][a-z]+\b/g) || []).filter(word => word.length > 2).length;
        answer = `👥 **Character & Subject Analysis:**<br><br>**Pronoun Usage:** ${pronouns} personal pronouns detected<br>**Proper Nouns:** ${names} capitalized words (potential names/places)<br>**Narrative Focus:** ${pronouns > 10 ? '📖 Character-driven - Strong focus on people and relationships' : pronouns > 3 ? '⚖️ Balanced - Mix of character focus and description' : '🌍 Setting/Concept-driven - Emphasis on ideas or environment over characters'}<br><br>${pronouns > 0 ? `The ${pronouns > 20 ? 'extensive' : pronouns > 10 ? 'moderate' : 'limited'} use of personal pronouns suggests ${pronouns > 20 ? 'intimate character development and interpersonal dynamics' : pronouns > 10 ? 'characters play a meaningful role in the narrative' : 'characters are present but not the primary focus'}.` : 'This text appears abstract or conceptual, focusing on ideas rather than specific individuals.'}`;
    }
    // SUMMARY & MAIN IDEA QUESTIONS
    else if (questionLower.includes('summary') || questionLower.includes('summarize') || questionLower.includes('main idea') || questionLower.includes('gist') || questionLower.includes('overall')) {
        const sentiment = data.sentiment || 'neutral';
        const topEmotion = Object.entries(data.emotionPercentages || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
        const themes = data.themes && data.themes.length > 0 ? data.themes : ['various topics'];
        const genre = data.genre || 'prose';
        answer = `📋 **Comprehensive Summary:**<br><br>**Genre:** ${genre.toUpperCase()}<br>**Length:** ${data.words} words, ${data.sentences} sentences<br>**Themes:** ${themes.slice(0, 3).join(', ')}<br>**Sentiment:** ${sentiment.toUpperCase()}<br>**Dominant Emotion:** ${topEmotion.toUpperCase()}<br><br>**Synopsis:** This ${data.words < 100 ? 'concise' : data.words < 300 ? 'medium-length' : 'substantial'} ${genre} piece explores **${themes[0]}** ${themes.length > 1 ? `and **${themes[1]}**` : ''} through a **${sentiment}** lens. The text conveys **${topEmotion}** while maintaining ${data.readingLevel || 'moderate'} complexity. ${data.keyQuotes?.[0] ? `A defining moment appears in the line: "${data.keyQuotes[0]}"` : 'The consistent tone reinforces its thematic focus.'}<br><br>**Reader Impact:** ${sentiment === 'positive' ? 'Uplifting and inspiring' : sentiment === 'negative' ? 'Thought-provoking and sobering' : 'Balanced and reflective'}`;
    }
    // WHAT CAN I LEARN QUESTIONS
    else if (questionLower.includes('what can i learn') || questionLower.includes('lesson') || questionLower.includes('takeaway') || questionLower.includes('message')) {
        const themes = data.themes || [];
        const sentiment = data.sentiment || 'neutral';
        answer = `💡 **Key Takeaways & Lessons:**<br><br>**Central Message:** Through its exploration of **${themes.join(', ') || 'universal experiences'}**, this text ${sentiment === 'positive' ? 'encourages optimism and appreciation' : sentiment === 'negative' ? 'prompts reflection on challenges and growth' : 'offers balanced perspective on complex issues'}.<br><br>**What You Can Learn:**<br>→ ${themes.includes('love') ? 'The nature and importance of emotional connections' : themes.includes('death') ? 'Perspectives on mortality and meaning' : themes.includes('time') ? 'How temporal awareness shapes human experience' : themes.includes('nature') ? 'Our relationship with the natural world' : 'Insights into human nature and experience'}<br>→ ${data.readingLevel === 'complex' ? 'Appreciation for sophisticated language and nuanced expression' : 'The power of clear, direct communication'}<br>→ ${Object.values(data.literaryDevices || {}).reduce((a, b) => a + b, 0) > 5 ? 'How literary techniques enhance meaning and emotional impact' : 'The effectiveness of straightforward storytelling'}<br><br>${data.keyQuotes?.[0] ? `The line "${data.keyQuotes[0]}" encapsulates this wisdom.` : 'The cumulative effect reveals these insights.'}`;
    }
// DEFAULT RESPONSE - ADVANCED SEMANTIC ANALYSIS FOR SIMPLE QUESTIONS
            else {
                // Advanced semantic analysis for unmatched questions
                const sentiment = data.sentiment || 'neutral';
                const sentimentScore = data.sentimentScore || 0;
                const topEmotion = Object.entries(data.emotionPercentages || {}).sort((a, b) => b[1] - a[1])[0];
                const themes = data.themes && data.themes.length > 0 ? data.themes.map(t => typeof t === 'object' ? t.theme : t) : [];
                const genres = data.genre || 'literary prose';
                const readingLevel = data.readingLevel || 'moderate';
                
                // Advanced semantic matching for common question patterns
                const semanticPatterns = {
                    goodBad: /good|bad|positive|negative|happy|sad|uplifting|depressing/i,
                    understanding: /understand|comprehend|figure out|grasp|follow|know|get|see/i,
                    quality: /quality|well.?written|good.?writing|effective|powerful|strong/i,
                    recommendation: /recommend|suggest|should i|worth|good|like/i,
                    general: /what|tell|explain|describe|say|talk/i
                };
                
                // Analyze question semantics
                const isAboutQuality = semanticPatterns.quality.test(question);
                const isAboutSentiment = semanticPatterns.goodBad.test(question);
                const isRecommendation = semanticPatterns.recommendation.test(question);
                const isAboutUnderstanding = semanticPatterns.understanding.test(question);
                
                // Generate contextual response based on semantic analysis
                if (isAboutQuality) {
                    const deviceCount = Object.values(data.literaryDevices || {}).reduce((a, b) => a + b, 0);
                    const vocabRichness = data.vocabularyRichness || 0;
                    const avgSentenceLength = data.avgSentenceLength || 0;
                    const qualityScore = (deviceCount * 15) + (vocabRichness * 30) + (Math.min(avgSentenceLength / 25, 1) * 10);
                    
                    answer = `📈 **Writing Quality Assessment:**<br><br>The writing demonstrates ${readingLevel === 'complex' ? 'sophisticated' : readingLevel === 'simple' ? 'accessible' : 'moderate'} quality with several indicators:<br><br>**Craftsmanship Score:** ${qualityScore.toFixed(0)}/100<br>• Literary techniques: ${deviceCount > 5 ? '✨ Highly ornate and artistic' : deviceCount > 2 ? '✓ Well-crafted with meaningful devices' : '○ Straightforward and functional'}<br>• Vocabulary sophistication: ${vocabRichness > 0.7 ? '✨ Extremely rich and varied' : vocabRichness > 0.5 ? '✓ Good variety and depth' : '○ Repetitive but effective'}<br>• Sentence complexity: ${avgSentenceLength > 20 ? '✨ Complex, intricate structures' : avgSentenceLength > 12 ? '✓ Balanced and well-paced' : '○ Concise and direct'}<br><br>${sentimentScore > 1 ? '💫 The emotional depth elevates the writing quality significantly.' : sentimentScore < -1 ? '⚡ The intensity of the emotional tone demonstrates strong authorial control.' : '📝 The measured approach shows writing discipline and clarity.'}`;
                } else if (isAboutSentiment) {
                    const emotionsList = Object.entries(data.emotionPercentages || {}).sort((a, b) => b[1] - a[1]).slice(0, 3);
                    const emotionIntensity = Math.abs(sentimentScore);
                    
                    answer = `🎭 **Emotional Tone & Sentiment:**<br><br>**Overall Sentiment:** ${sentiment.toUpperCase()} (Score: ${sentimentScore.toFixed(2)})<br>**Intensity Level:** ${emotionIntensity > 2 ? '🔥 Extremely intense' : emotionIntensity > 1.5 ? '⚡ Very strong' : emotionIntensity > 0.7 ? '💪 Moderately strong' : '🌊 Subtle and nuanced'}<br><br>**Emotional Breakdown:**<br>${emotionsList.map(([emotion, pct]) => `• ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}: ${pct.toFixed(1)}%`).join('<br>')}<br><br>**Interpretation:** This text carries a ${sentiment} emotional weight that ${emotionIntensity > 1 ? 'dominates the reading experience' : 'gently influences interpretation'}. The emotional journey ${topEmotion && topEmotion[0] === 'joy' ? 'brings readers toward optimism and celebration' : topEmotion && topEmotion[0] === 'sadness' ? 'creates introspective, melancholic contemplation' : topEmotion && topEmotion[0] === 'anger' ? 'provokes critical thinking and passionate engagement' : 'guides readers through nuanced emotional landscape'}.`;
                } else if (isRecommendation) {
                    const wordCount = data.words || 0;
                    const wordCountRating = wordCount < 100 ? 'Perfect for quick reads' : wordCount < 300 ? 'Great for focused engagement' : wordCount < 500 ? 'Ideal for immersive reading sessions' : 'Perfect for deep, sustained study';
                    const targetAudience = readingLevel === 'complex' ? 'scholars, advanced readers' : readingLevel === 'simple' ? 'general audiences, younger readers' : 'educated general audience';
                    
                    answer = `⭐ **Recommendation & Suitability:**<br><br>**Best For:** ${targetAudience}<br>**Time Investment:** ${wordCountRating}<br>**Complexity Level:** ${readingLevel.toUpperCase()}<br><br>**Should You Read?** Yes! This text offers:<br>→ ${sentimentScore > 0 ? '✨ Uplifting and rewarding' : sentimentScore < 0 ? '🤔 Thought-provoking and challenging' : '⚖️ Balanced and reflective'} emotional experience<br>→ ${themes.length > 0 ? `Exploration of ${themes.slice(0, 2).join(' and ')}` : 'Exploration of compelling themes'}<br>→ ${Object.values(data.literaryDevices || {}).reduce((a, b) => a + b, 0) > 5 ? 'Rich literary artistry and technique' : 'Clear, engaging prose'}<br><br>**Reading Experience:** Expect a ${sentiment} journey through ${genres} that will ${sentimentScore > 0 ? 'uplift and inspire you' : sentimentScore < 0 ? 'challenge your perspectives' : 'deepen your understanding'}.`;
                } else if (isAboutUnderstanding) {
                    const keyQuotes = data.keyQuotes && data.keyQuotes.length > 0 ? data.keyQuotes : [];
                    const centralTheme = themes.length > 0 ? themes[0] : 'universal human experience';
                    
                    answer = `💡 **Understanding This Text:**<br><br>**Core Idea:** At its heart, this text explores ${centralTheme} through a ${sentiment} lens, emphasizing ${topEmotion ? topEmotion[0] : 'emotional depth'}.<br><br>**Key Components to Understand:**<br>1. **Theme:** ${themes.slice(0, 2).join(', ') || 'multifaceted concepts'}<br>2. **Tone:** ${sentiment} with ${readingLevel} complexity<br>3. **Style:** ${data.avgSentenceLength && data.avgSentenceLength > 15 ? 'flowing, intricate prose' : 'clear, direct language'}<br><br>${keyQuotes.length > 0 ? `**Pivotal Moment:** "${keyQuotes[0]}"<br>This encapsulates the text's central meaning and emotional core.<br><br>` : ''}**How to Approach:** Read actively by noting where emotions shift, identifying the author's choices about word selection and structure, and reflecting on how the themes connect to broader human experience.`;
                } else {
                    // Ultra-smart fallback for any remaining queries
                    const analysisDepth = Object.keys(data).length;
                    const hasMeaningfulData = analysisDepth > 15;
                    
                    answer = `🧠 **AI Deep Analysis:**<br><br>This text presents a fascinating study in ${hasMeaningfulData ? 'literary' : ''} expression:<br><br>**Sentiment Profile:** ${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} (${Math.abs(sentimentScore) > 1 ? 'strongly' : 'moderately'} expressed)<br>**Primary Emotion:** ${topEmotion ? topEmotion[0].charAt(0).toUpperCase() + topEmotion[0].slice(1) + ' (' + topEmotion[1].toFixed(1) + '%)' : 'balanced'}<br>**Genre Characteristics:** ${genres}<br>**Target Reader:** ${readingLevel} complexity suitable for ${readingLevel === 'complex' ? 'experienced' : readingLevel === 'simple' ? 'broad' : 'educated'} audiences<br><br>**What Makes This Special:**<br>${data.literaryDevices && Object.values(data.literaryDevices).reduce((a,b)=>a+b,0) > 3 ? '✓ Rich use of literary techniques<br>' : ''}${data.vocabularyRichness > 0.6 ? '✓ Sophisticated vocabulary choices<br>' : ''}${themes.length > 2 ? '✓ Multiple interwoven themes<br>' : ''}${Math.abs(sentimentScore) > 0.8 ? '✓ Clear emotional direction<br>' : ''}${data.words > 200 ? '✓ Substantial length allowing for development<br>' : ''}<br>The text successfully creates a ${sentiment} reading experience that engages readers through ${themes.length > 0 ? 'thematic depth' : 'emotional resonance'}.`;
                }
    }
    
    // Display the answer
    console.log('Displaying answer');
    aiAnswer.innerHTML = `<div style="margin-bottom: 15px; padding: 10px; background: rgba(102, 126, 234, 0.1); border-left: 3px solid #667eea; border-radius: 5px;"><strong>Q:</strong> ${question}</div><div style="line-height: 1.8;">${answer}</div>`;
    aiResponse.style.display = 'block';
    
    // Scroll to response
    aiResponse.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Clear input
    questionInput.value = '';
    console.log('AI response complete');
    
    } catch (error) {
        console.error('Ask AI Error:', error);
        if (typeof showToast === 'function') showToast('An error occurred: ' + (error.message||error), 'error');
    }
}

// Lightweight programmatic QA API for other modules: returns an HTML string
// Programmatic QA API (async-friendly)
window.askQuestion = async function(question, text, analysis) {
    try {
        if (!question) return '<em>Please enter a question.</em>';
        const q = String(question).trim();
        const data = analysis || window.latestAnalysisData || {};

        const sentiment = data.sentiment || 'neutral';
        const words = data.words || data.wordCount || 0;
        const sentences = data.sentences || data.sentenceCount || 0;
        const themes = (data.themes || []).slice(0,3).map(t => typeof t === 'object' ? t.theme : t);
        const emotions = data.emotionPercentages || data.emotions || {};
        const topEmotions = Object.entries(emotions).sort((a,b)=>b[1]-a[1]).slice(0,3);
        const quotes = data.keyQuotes || [];

        let answer = `<strong>Answer:</strong><br>`;
        answer += `<em>Sentiment:</em> ${sentiment} • <em>Words:</em> ${words} • <em>Sentences:</em> ${sentences}<br>`;
        if (themes.length) answer += `<em>Themes:</em> ${themes.join(', ')}<br>`;
        if (topEmotions.length) answer += `<em>Top Emotions:</em> ${topEmotions.map(e=>e[0]+': '+(e[1].toFixed?e[1].toFixed(1):e[1])+'%').join(', ')}<br>`;
        if (quotes.length) answer += `<em>Key Quote:</em> "${quotes[0]}"<br>`;

        const ql = q.toLowerCase();
        if (ql.includes('summary') || ql.includes('summarize') || ql.includes('main idea')) {
            answer += `<p>This text (approx ${words} words) explores ${themes.length?themes[0]:'several themes'} and carries a ${sentiment} tone. Key line: ${quotes[0]||'n/a'}.</p>`;
        } else if (ql.includes('emotion') || ql.includes('feeling') || ql.includes('mood')) {
            answer += `<p>The emotional profile emphasizes ${topEmotions[0] ? topEmotions[0][0] : 'no dominant emotion'}, with supporting emotions: ${topEmotions.slice(1).map(e=>e[0]).join(', ') || 'none'}.</p>`;
        } else if (ql.includes('style') || ql.includes('writing') || ql.includes('technique')) {
            answer += `<p>Writing style appears ${data.readingLevel||'moderate'}, with ${Object.keys(data.literaryDevices||{}).length} device types detected.</p>`;
        } else {
            answer += `<p>Here's a brief analysis based on available data. For more targeted answers, ask about 'summary', 'emotion', or 'style'.</p>`;
        }

        // ensure non-empty content
        return answer || '<em>No answer available from analysis.</em>';
    } catch (e) {
        console.error('askQuestion error', e);
        return '<em>AI error: </em>' + (e.message || e);
    }
};

// alias (async)
window.askAI = async function(question, analysis) { return await window.askQuestion(question, null, analysis); };
