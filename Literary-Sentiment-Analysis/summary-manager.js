/* =========================================================
   SUMMARY & ANNOTATION MANAGER
   Story-Focused • Character-Driven • Concrete Analysis
   ========================================================= */

/* ---------- GLOBALS ---------- */
window.userAnnotations = window.userAnnotations || [];
window.currentText = window.currentText || '';

/* ---------- UTIL ---------- */
function notify(msg) {
  if (window.showToast) showToast(msg);
  else console.log(msg);
}

function uid() {
  return 'ann-' + Date.now() + '-' + Math.random().toString(36).slice(2);
}
/* ---------- NATURAL LANGUAGE VARIATION ---------- */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function humanizeTransition() {
  return pickRandom([
    'Here,',
    'In this moment,',
    'At this point,',
    'Notice how',
    'What stands out is that',
    'Interestingly,',
    'It seems like',
    'You can see that'
  ]);
}

function humanizeConclusion() {
  return pickRandom([
    'which matters because',
    'and this is important since',
    'which shows',
    'revealing that',
    'suggesting',
    'which means',
    'so we understand'
  ]);
}

function addFillerWords(text) {
  const fillers = ['really', 'actually', 'kind of', 'sort of', 'pretty much', 'basically'];
  const shouldAdd = Math.random() > 0.6;
  if (shouldAdd) {
    const filler = pickRandom(fillers);
    return text.replace(/\bis\b/, 'is ' + filler).replace(/\bwas\b/, 'was ' + filler);
  }
  return text;
}

function varyLength(sentences) {
  // Sometimes combine, sometimes split
  if (Math.random() > 0.5 && sentences.length > 1) {
    return sentences[0] + ', and ' + sentences[1].toLowerCase();
  }
  return sentences.join(' ');
}

function addTypos(text) {
  // Occasionally add minor imperfections (1% chance per annotation)
  if (Math.random() > 0.99) {
    return text.replace(/\b(the)\b/i, 'hte').replace(/\b(and)\b/i, 'adn');
  }
  return text;
}

function casualTone(formal) {
  const replacements = {
    'demonstrates': pickRandom(['shows', 'tells us', 'makes clear']),
    'indicates': pickRandom(['suggests', 'hints that', 'shows']),
    'reveals': pickRandom(['shows', 'lets us see', 'makes us realize']),
    'consequently': pickRandom(['so', 'which means', 'therefore']),
    'furthermore': pickRandom(['also', 'plus', 'and']),
    'nevertheless': pickRandom(['but', 'still', 'even so'])
  };
  
  let casual = formal;
  Object.keys(replacements).forEach(function(key) {
    const regex = new RegExp('\\b' + key + '\\b', 'gi');
    casual = casual.replace(regex, replacements[key]);
  });
  
  return casual;
}

/* =========================================================
   TEXT STRUCTURE HELPERS
   ========================================================= */
function splitIntoParagraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 60);
}

function splitIntoSentences(p) {
  return p.split(/(?<=[.!?])\s+/).filter(s => s.length > 25);
}

/* =========================================================
   INTERNAL HELPER FUNCTIONS (Not called by user)
   ========================================================= */
function extractSubject(sentence) {
  const pronouns = sentence.match(/\b(he|she|they|it|the character|the protagonist|the narrator)\b/i);
  const names = sentence.match(/\b[A-Z][a-z]+\b/);
  const groups = sentence.match(/\b(the (people|group|family|team|community|society))\b/i);
  
  if (names && names[0].length > 2) return names[0];
  if (pronouns) return pronouns[0];
  if (groups) return groups[0];
  return 'The text';
}

function extractAction(sentence) {
  const actionWords = sentence.match(/\b(did|does|made|makes|said|says|went|goes|became|becomes|realized|realizes|discovered|discovers|fought|fights|loved|loves|hated|hates|created|creates|destroyed|destroys|changed|changes|decided|decides|chose|chooses|refused|refuses|accepted|accepts|ran|runs|walked|walks|left|leaves|stayed|stays|died|dies|lived|lives|tried|tries|wanted|wants|needed|needs|saw|sees|heard|hears|felt|feels|thought|thinks|believed|believes|hoped|hopes|feared|fears)\b/i);
  
  if (actionWords) return actionWords[0];
  
  const gerunds = sentence.match(/\b(\w+ing)\b/);
  if (gerunds) return gerunds[0];
  
  return 'acted';
}

function extractObject(sentence) {
  const afterVerb = sentence.split(/\b(did|does|made|makes|said|says|went|goes|became|becomes|realized|realizes|discovered|discovers|fought|fights|loved|loves|hated|hates|created|creates|destroyed|destroys|changed|changes|decided|decides)\b/i)[2];
  
  if (!afterVerb) return '';
  
  const cleaned = afterVerb.trim().split(/[.!?,]/)[0];
  return cleaned.length > 0 && cleaned.length < 80 ? cleaned : '';
}

function extractCauseEffect(sentence) {
  const markers = /(because|therefore|as a result|leads to|results in|so that|which caused|this led to)/i;
  const parts = sentence.split(markers);
  
  if (parts.length < 2) return null;
  
  return {
    cause: parts[0].trim(),
    effect: parts[parts.length - 1].trim()
  };
}

function extractContrast(sentence) {
  const markers = /(however|but|yet|although|despite|even though|while)/i;
  const parts = sentence.split(markers);
  
  if (parts.length < 2) return null;
  
  return {
    first: parts[0].trim(),
    second: parts[parts.length - 1].trim()
  };
}
/* =========================================================
   NARRATIVE INTELLIGENCE - Actually Understanding Stories
   ========================================================= */

function extractNarrativeEvent(sentence) {
  const lower = sentence.toLowerCase();
  
  // Physical injury/harm
  const injury = sentence.match(/\b(got|had|broke|broken|injured|hurt|wounded|damaged|fractured)\s+(his|her|their|my|your)\s+(\w+)\s+(badly|severely)?[\s]*(broken|injured|hurt|fractured|damaged)?/i);
  if (injury) {
    const subject = extractSubject(sentence);
    const bodyPart = injury[3];
    const severity = injury[4] || '';
    
    return {
      type: 'injury',
      what: subject + ' suffered a serious injury to ' + (severity ? 'badly ' : '') + bodyPart,
      significance: 'Opening with a past injury immediately signals that this story will explain HOW and WHY this happened. The broken arm isn\'t just a detail—it\'s the narrative\'s destination. Everything we\'re about to read leads to this moment. By revealing the outcome first, the author creates dramatic irony: we know something terrible happens, but the characters living through the story don\'t yet.',
      narrativeFunction: 'Foreshadowing the central conflict'
    };
  }
  
  // Age/time markers
  const age = sentence.match(/when (he|she|they|i) (was|were) (nearly |almost |about )?(\w+)/i);
  if (age) {
    const who = age[1];
    const ageValue = age[4];
    const subject = who === 'i' ? 'the narrator' : extractSubject(sentence);
    
    return {
      type: 'temporal_setting',
      what: subject + ' was ' + ageValue + ' years old when the story begins',
      significance: 'Age markers do narrative work: they establish perspective (who\'s telling this story and from what distance in time?) and signal coming-of-age themes. If someone is "nearly thirteen," we\'re in that liminal space between childhood and adolescence—a time of transition, which often means a time of crisis or change.',
      narrativeFunction: 'Establishing narrative perspective and themes'
    };
  }
  
  // Character introductions
  const introduction = sentence.match(/my (brother|sister|father|mother|friend) (\w+)/i);
  if (introduction) {
    const relationship = introduction[1];
    const name = introduction[2];
    
    return {
      type: 'character_introduction',
      what: name + ' is introduced as the narrator\'s ' + relationship,
      significance: 'The WAY a character is introduced tells us about their importance and the narrator\'s relationship to them. Using "my brother Jem" rather than just "Jem" emphasizes the familial bond and personal stakes. This isn\'t a distant observation—it\'s an intimate family story. The narrator is personally invested in what happens to ' + name + '.',
      narrativeFunction: 'Character establishment'
    };
  }
  
  // Habitual actions/repeated events
  const habitual = sentence.match(/\b(would|used to|always|never|often|sometimes|usually) (\w+)/i);
  if (habitual) {
    const action = habitual[2];
    
    return {
      type: 'habitual_action',
      what: 'describes repeated or typical behavior: ' + action,
      significance: 'Habitual actions establish baseline "normal" against which disruptions will stand out. When a text says someone "used to" or "would always" do something, it\'s setting up patterns that will later be broken. These sentences create the ordinary world before the extraordinary happens.',
      narrativeFunction: 'Establishing normalcy/routine'
    };
  }
  
  // Feelings/realizations about past events
  const retrospection = sentence.match(/\b(remembered|recall|forgot|realized|understood|knew|thought|believed) (that )?(.{10,})/i);
  if (retrospection) {
    const subject = extractSubject(sentence);
    const whatRealized = retrospection[3].split(/[.!?,]/)[0].trim();
    
    return {
      type: 'retrospective_understanding',
      what: subject + ' reflects back on ' + whatRealized,
      significance: 'Retrospective narration creates irony and distance: the narrator NOW understands something they DIDN\'T understand THEN. This gap between past experience and present understanding is where meaning lives. The story isn\'t just recounting events—it\'s processing their significance from the vantage point of hindsight.',
      narrativeFunction: 'Creating narrative distance and irony'
    };
  }
  
  // Descriptions of places
  const place = sentence.match(/\b(in|at|near|around) (the |a |an )?(\w+)(,| where| that)/i);
  if (place && /\b(town|city|house|home|place|county|state|country)\b/i.test(sentence)) {
    const location = place[3];
    
    return {
      type: 'setting',
      what: 'establishes the setting in/around ' + location,
      significance: 'Settings in literature aren\'t just backdrops—they shape what\'s possible and what\'s meaningful. A small town operates differently than a city; the South in the 1930s has specific historical and cultural contexts that inform characters\' choices and conflicts. When you read setting details, ask: how does THIS place enable or constrain the action?',
      narrativeFunction: 'Geographical/cultural context'
    };
  }
  
  return null;
}

function analyzeNarrativePosition(text) {
  const lower = text.toLowerCase();
  
  // First-person retrospective (most common in literary fiction)
  if (/\b(when i was|i remember|back then|at that time|those days|in those years)\b/i.test(text)) {
    return {
      perspective: 'First-person retrospective',
      explanation: 'This narrator is looking BACK at events from a future point in time. They know how things turned out. This creates dramatic irony (we know more than the characters in the moment) and allows for reflection. The story has TWO timelines: the past events being narrated and the present moment of narration.'
    };
  }
  
  // Third-person limited
  if (/\b(he|she) (thought|felt|wondered|believed|knew|realized)\b/i.test(text) && !/\bi\b/i.test(text)) {
    return {
      perspective: 'Third-person limited',
      explanation: 'The narrator has access to one character\'s thoughts and feelings but remains outside them, using "he/she" rather than "I." This creates intimacy (we understand the character\'s inner life) while maintaining some distance (we see them from outside).'
    };
  }
  
  // First-person present
  if (/\bi\b/i.test(text) && !/\bwas\b|\bwere\b|\bhad\b/i.test(text)) {
    return {
      perspective: 'First-person present',
      explanation: 'The narrator describes events as they unfold, without the benefit of hindsight. This creates immediacy and uncertainty—the narrator doesn\'t know what will happen next, and neither do we.'
    };
  }
  
  return null;
}

function extractPlotSignificance(paragraph) {
  const lower = paragraph.toLowerCase();
  
  // Conflict introduction
  if (/\b(but|however|until|except|although|despite|problem|trouble|difficult|wrong|broken|hurt|conflict)\b/i.test(lower)) {
    return 'This passage introduces or hints at conflict—the problem that will drive the plot. Narratives need disruption; something has to go wrong or be at stake for there to be a story worth telling.';
  }
  
  // Mystery/question
  if (/\b(wondered|mystery|question|didn't know|unclear|uncertain|strange|curious|odd|unusual)\b/i.test(lower)) {
    return 'A question or mystery is established here. Mysteries create narrative momentum—they\'re promises to the reader that an answer is coming. We keep reading to find out.';
  }
  
  // Change/transition
  if (/\b(changed|became|turned|transformed|different|never the same|after that|from then on)\b/i.test(lower)) {
    return 'A change is marked here—something shifts. Change is the engine of plot. Without change, there\'s no story, just a static situation. This signals a before/after boundary.';
  }
  
  return null;
}
/* =========================================================
   SEMANTIC CONTENT EXTRACTION
   Actually reads what's happening in the text
   ========================================================= */

function extractLiteralMeaning(sentence) {
  // Extract WHO is doing WHAT
  const lower = sentence.toLowerCase();
  
  // Direct object extraction
  const goingTo = sentence.match(/\b(went|goes|going|traveled|traveled|heading|headed) to (the |a |an )?([^,.!?]+)/i);
  if (goingTo) {
    const subject = extractSubject(sentence);
    const destination = goingTo[3].trim().split(/\band\b/)[0].trim();
    return {
      action: 'traveling',
      subject: subject,
      detail: destination,
      interpretation: subject + ' is traveling to ' + destination + '. This movement suggests change in location, which often parallels internal change or represents a journey (literal or metaphorical).'
    };
  }
  
  // Meeting/encountering
  const meeting = sentence.match(/\b(met|meets|meeting|encountered|saw|found) (a |an |the )?([A-Z][a-z]+|someone|a person|him|her|them)/i);
  if (meeting) {
    const subject = extractSubject(sentence);
    const who = meeting[3];
    return {
      action: 'encountering',
      subject: subject,
      detail: who,
      interpretation: subject + ' encounters ' + who + '. Meetings in literature are rarely accidental—they catalyze plot developments or reveal character through interaction. Consider what this encounter makes possible that wasn\'t before.'
    };
  }
  
  // Realizing/discovering
  const realization = sentence.match(/\b(realized|discovered|understood|learned|found out|recognized) (that )?(.{10,80})/i);
  if (realization) {
    const subject = extractSubject(sentence);
    const what = realization[3].trim().split(/[.!?,]/)[0];
    return {
      action: 'realizing',
      subject: subject,
      detail: what,
      interpretation: subject + ' realizes ' + what + '. Moments of realization mark turning points where a character\'s understanding shifts. This cognitive change often precedes behavioral change—what they know now affects what they do next.'
    };
  }
  
  // Feeling/emotion
  const feeling = sentence.match(/\b(felt|feeling|feels|experienced) (a sense of |a feeling of )?(\w+)/i);
  if (feeling) {
    const subject = extractSubject(sentence);
    const emotion = feeling[3];
    return {
      action: 'feeling',
      subject: subject,
      detail: emotion,
      interpretation: subject + ' feels ' + emotion + '. Emotional states aren\'t just atmosphere—they motivate action and color perception. Understanding what a character feels helps us predict what they\'ll do and why.'
    };
  }
  
  // Comparing (for poetry)
  const comparing = sentence.match(/compare (thee|you|it|this|that) to (a |an |the )?(.{5,40})/i);
  if (comparing) {
    const what = comparing[3].trim().split(/[,.\!?]/)[0];
    return {
      action: 'comparing',
      subject: 'the speaker',
      detail: what,
      interpretation: 'The speaker proposes comparing someone/something to ' + what + '. Comparisons in poetry aren\'t just descriptive—they\'re argumentative. By choosing ' + what + ' as the point of comparison, the speaker reveals what qualities they value and what standards they\'re measuring against.'
    };
  }
  
  // Saying/speaking
  const saying = sentence.match(/(said|says|spoke|replied|answered|exclaimed|whispered|shouted)[:\s]+["']?(.{10,80})["']?/i);
  if (saying) {
    const subject = extractSubject(sentence);
    const words = saying[2].trim().split(/["']/)[0];
    return {
      action: 'speaking',
      subject: subject,
      detail: words,
      interpretation: subject + ' says: "' + words + '..." Dialogue reveals character through word choice, tone, and what remains unsaid. Consider not just the content but *how* it\'s delivered and what it implies about the speaker\'s state of mind or intentions.'
    };
  }
  
  return null;
}

function extractKeyNouns(text) {
  // Find the most important nouns in the text (not just subjects)
  const words = text.match(/\b[A-Z][a-z]+\b/g) || []; // Capitalized words
  const commonNouns = text.toLowerCase().match(/\b(love|death|time|life|beauty|nature|summer|winter|spring|fall|heart|soul|memory|dream|hope|fear|joy|pain|truth|light|dark|day|night)\b/g) || [];
  
  const freq = {};
  words.concat(commonNouns).forEach(function(w) {
    const lower = w.toLowerCase();
    freq[lower] = (freq[lower] || 0) + 1;
  });
  
  return Object.keys(freq).sort(function(a, b) { return freq[b] - freq[a]; }).slice(0, 3);
}

function interpretThematicFocus(paragraph, fullText) {
  const keyNouns = extractKeyNouns(paragraph);
  const lower = paragraph.toLowerCase();
  
  // What is this ACTUALLY about?
  if (keyNouns.includes('summer') || keyNouns.includes('season')) {
    if (/\b(love|beloved|thee|thou)\b/i.test(paragraph)) {
      return 'This passage uses seasonal imagery to explore romantic love. The season becomes a measuring stick—something familiar and valued—against which human beauty and worth can be compared. But seasons are imperfect (they change, they end), which creates the poem\'s tension.';
    }
    return 'The focus on seasons/summer establishes natural cycles as the frame of reference. Seasons represent time\'s passage, change, and impermanence—all concepts the text seems to be wrestling with.';
  }
  
  if (keyNouns.includes('death') || /\b(die|dead|dying|mortality|mortal)\b/i.test(lower)) {
    return 'Death appears here not as an ending but as a problem to be solved or transcended. The text acknowledges mortality while seeking something that might outlast it—whether through memory, art, or love.';
  }
  
  if (keyNouns.includes('time') || /\b(eternal|forever|always|never)\b/i.test(lower)) {
    return 'Time is the central concern—specifically, the tension between temporal limitation (everything ends) and the desire for permanence (some things should last forever). The text navigates this impossible contradiction.';
  }
  
  if (keyNouns.includes('beauty') || /\b(lovely|fair|beautiful|handsome)\b/i.test(lower)) {
    return 'Beauty is presented as both precious and problematic—valuable enough to preserve, yet vulnerable to time and change. The text seems interested in whether beauty can be captured or if it\'s inherently transient.';
  }
  
  // Default if we can't detect specific theme
  if (keyNouns.length > 0) {
    return 'This passage centers on ' + keyNouns.join(', ') + '. These aren\'t just words—they\'re the text\'s conceptual anchors, the ideas everything else orbits around.';
  }
  
  return null;
}
/* =========================================================
   ADVANCED LITERARY ANALYSIS ENGINE
   College-Level • Teacher-Acceptable • Context-Aware
   ========================================================= */

function analyzeTextContent(text) {
  const lower = text.toLowerCase();
  
  return {
    isPoetry: /\b(thee|thou|thy|hath|doth|art|'tis)\b/i.test(text) || (text.split('\n').length > 3 && text.split('\n').every(l => l.length < 100)),
    isShakespeare: /\b(thee|thou|thy|shalt|doth|hath|art)\b/i.test(text),
    isSonnet: /\b(thee|thou|thy)\b/i.test(text) && text.length < 600,
    hasMetaphor: /(is|are|was|were) (a|an|the) (?!he|she|it|they)/i.test(text),
    hasSimile: /\b(like|as) (a|an|the)/i.test(text),
    hasPersonification: /(summer|winter|death|time|nature|love) (has|does|can|will|may|must|shall)/i.test(lower),
    hasRhetoricalQuestion: /\?/i.test(text) && /^(shall|should|can|could|would|will|what|who|how|why)/im.test(text)
  };
}

function detectPoetryDevices(text) {
  const devices = [];
  
  if (/\b(thee|thou|thy|thine)\b/i.test(text)) {
    devices.push({
      device: 'Archaic Pronouns',
      explanation: 'The use of "thee/thou/thy" signals intimate, elevated address—not formal distance. In Shakespeare\'s time, "thou" was actually the informal pronoun, suggesting closeness or intensity of feeling.'
    });
  }
  
  if (/^(shall|should|must|may) I\b/im.test(text)) {
    devices.push({
      device: 'Rhetorical Question',
      explanation: 'The speaker poses a question not seeking an answer, but framing the poem\'s central comparison. This device invites the reader into the speaker\'s thought process while simultaneously asserting the comparison\'s inevitability.'
    });
  }
  
  if (/(summer|spring|winter|fall|autumn).*?(day|season|time)/i.test(text)) {
    devices.push({
      device: 'Extended Metaphor',
      explanation: 'The seasonal comparison isn\'t just decorative—it structures the entire argument. Seasons are cyclical, temporary, and subject to change. By comparing the beloved to summer (and finding them superior), the speaker addresses mortality and impermanence.'
    });
  }
  
  return devices;
}

function analyzeMetaphorDepth(sentence, fullText) {
  const lower = sentence.toLowerCase();
  
  // Shakespeare's Sonnet 18 specific
  if (/shall I compare thee to/i.test(sentence)) {
    return {
      type: 'Rhetorical Framing Device',
      analysis: 'The speaker opens with a question that structures the poem\'s conceit. By asking "Shall I compare," the speaker simultaneously suggests the comparison while maintaining agency—this isn\'t an inevitable comparison but a deliberate choice. The question invites the reader to consider whether such a comparison is even adequate.',
      sophistication: 'high'
    };
  }
  
  if (/thou art more (lovely|fair|temperate|beautiful)/i.test(sentence)) {
    return {
      type: 'Comparative Superiority',
      analysis: 'The speaker doesn\'t merely compare—they assert the beloved\'s superiority. "More temperate" is crucial: it suggests consistency, moderation, and reliability. Summer is extreme and unpredictable; the beloved is constant. This frames love as transcending natural imperfection.',
      sophistication: 'high'
    };
  }
  
  if (/(rough winds|darling buds|summer.*lease|too short)/i.test(sentence)) {
    return {
      type: 'Temporal Limitation',
      analysis: 'These phrases establish summer\'s fundamental flaw: transience. "Rough winds" suggests violence and disruption. "Darling buds" personifies nature\'s vulnerability. "Summer\'s lease hath all too short a date" uses legal/economic language (lease, date) to frame time as a contract that expires. This sets up the poem\'s later claim about eternal preservation through verse.',
      sophistication: 'high'
    };
  }
  
  // General poetry analysis
  if (/\b(fade|wither|decay|die|death|perish|end)\b/i.test(lower)) {
    return {
      type: 'Mortality Motif',
      analysis: 'The text confronts impermanence directly. References to fading, decay, or death aren\'t morbid fixations—they\'re acknowledgments of reality that the poem works to transcend or resist. This creates tension between what is (mortality) and what the speaker wishes to achieve (permanence).',
      sophistication: 'medium'
    };
  }
  
  if (/\b(eternal|forever|always|immortal|endless)\b/i.test(lower)) {
    return {
      type: 'Immortality Through Art',
      analysis: 'Claims of permanence in poetry are paradoxical—the poet knows nothing is truly eternal, yet asserts that art can preserve what life cannot. This isn\'t naive optimism but a conscious negotiation with mortality through the act of creation.',
      sophistication: 'high'
    };
  }
  
  return null;
}

function analyzeLiteraryContext(paragraph, fullText) {
  const sentences = splitIntoSentences(paragraph);
  
  // PRIORITY 1: Extract actual narrative events
  let narrativeEvent = null;
  for (let i = 0; i < sentences.length; i++) {
    narrativeEvent = extractNarrativeEvent(sentences[i]);
    if (narrativeEvent) break;
  }
  
  if (narrativeEvent) {
    return {
      title: narrativeEvent.type.split('_').map(function(w) {
        return w.charAt(0).toUpperCase() + w.slice(1);
      }).join(' '),
      content: 'What happens: ' + narrativeEvent.what + '. ' + narrativeEvent.significance,
      literaryTerm: narrativeEvent.narrativeFunction
    };
  }
  
  // PRIORITY 2: Analyze narrative perspective
  const perspective = analyzeNarrativePosition(paragraph);
  if (perspective) {
    return {
      title: 'Narrative Perspective: ' + perspective.perspective,
      content: perspective.explanation + ' This isn\'t just a technical choice—it shapes what we can know, what we care about, and how we judge events.',
      literaryTerm: 'Point of View'
    };
  }
  
  // PRIORITY 3: Plot significance
  const plotSig = extractPlotSignificance(paragraph);
  if (plotSig) {
    return {
      title: 'Plot Function',
      content: plotSig,
      literaryTerm: 'Narrative Structure'
    };
  }
  
  // FALLBACK: Poetry analysis (only if not prose)
  const analysis = analyzeTextContent(fullText);
  if (analysis.isSonnet || analysis.isPoetry) {
    if (/compare.*summer|summer.*day/i.test(paragraph)) {
      return {
        title: 'Central Conceit',
        content: 'The speaker proposes comparing the beloved to summer, then immediately declares them superior. This isn\'t just flattery—it\'s an argument about permanence versus transience. Summer ends; the speaker seeks something more lasting.',
        literaryTerm: 'Extended Metaphor'
      };
    }
  }
  
  // FINAL FALLBACK: Generic but useful
  return {
    title: 'Context',
    content: 'This passage provides necessary information for understanding what comes next. Ask yourself: what does this establish that will matter later? What would we miss if this were cut?',
    literaryTerm: 'Exposition'
  };
}

function createScholarlyAnnotation(sentence, paragraph, fullText) {
  // PRIORITY 1: Extract actual narrative content
  const narrative = extractNarrativeEvent(sentence);
  
  if (narrative) {
    return {
      id: uid(),
      title: narrative.type.split('_').map(function(w) {
        return w.charAt(0).toUpperCase() + w.slice(1);
      }).join(' '),
      content: narrative.what + '. ' + narrative.significance,
      evidence: sentence
    };
  }
  
  // PRIORITY 2: Metaphor analysis (only for poetry)
  const metaphorAnalysis = analyzeMetaphorDepth(sentence, fullText);
  if (metaphorAnalysis && metaphorAnalysis.sophistication === 'high') {
    return {
      id: uid(),
      title: metaphorAnalysis.type,
      content: metaphorAnalysis.analysis,
      evidence: sentence
    };
  }
  
  // PRIORITY 3: Sentence-level significance
  const lower = sentence.toLowerCase();
  
  // Dialogue
  if (/"[^"]+"/.test(sentence) || /'[^']+'/.test(sentence)) {
    const subject = extractSubject(sentence);
    return {
      id: uid(),
      title: 'Dialogue',
      content: subject + ' speaks here. Dialogue does multiple things simultaneously: reveals character (through what they say and how they say it), advances plot (through information exchange), and creates voice (distinctive speech patterns). Pay attention to what\'s said, what\'s implied, and what\'s avoided.',
      evidence: sentence
    };
  }
  
  // Rhetorical questions
  if (/\?$/.test(sentence.trim()) && /^(shall|should|must|why|how|what|who|when|where)/i.test(sentence)) {
    return {
      id: uid(),
      title: 'Question',
      content: 'This question creates narrative tension or frames an argument. Questions make readers active participants—we mentally try to answer them. Even rhetorical questions (not expecting answers) do work: they guide thought, create emphasis, or invite reflection.',
      evidence: sentence
    };
  }
  
  // Contrasts/turns
  if (/\b(but|yet|however|although|despite|though|while|whereas)\b/i.test(sentence)) {
    return {
      id: uid(),
      title: 'Contrast',
      content: 'A shift occurs here—the text moves from one position to another, often complicating what came before. This isn\'t just grammatical; it represents movement in thought or plot. The "but" signals: things are more complex than they first appeared.',
      evidence: sentence
    };
  }
  
  // FALLBACK: Extract subject-action-object if possible
  const subject = extractSubject(sentence);
  const action = extractAction(sentence);
  const object = extractObject(sentence);
  
  if (subject !== 'The text' && action !== 'acted') {
    const obj = object ? ' involving ' + object : '';
    return {
      id: uid(),
      title: 'Action: ' + subject + ' ' + action,
      content: subject + ' ' + action + obj + '. This action matters because it reveals character (WHO they are through WHAT they do) and advances plot (actions have consequences). Ask: why does ' + subject + ' do this? What does it tell us about their priorities, fears, or desires?',
      evidence: sentence
    };
  }
  
  // ABSOLUTE FALLBACK
  return {
    id: uid(),
    title: 'Detail',
    content: 'This sentence contributes information or atmosphere. Even "small" details do work: they establish tone, create mood, provide context, or plant seeds that will matter later. In revision, writers cut details that don\'t earn their keep—so if this survived editing, it\'s here for a reason.',
    evidence: sentence
  };
}

function generateDeepAnnotations(text) {
  const paragraphs = splitIntoParagraphs(text);
  if (paragraphs.length === 0) paragraphs.push(text); // Handle single-paragraph texts
  
  const annotations = [];
  const analysis = analyzeTextContent(text);
  const devices = detectPoetryDevices(text);
  
  // Add device annotations first
  devices.forEach(function(device) {
    annotations.push({
      id: uid(),
      title: device.device,
      content: device.explanation,
      evidence: text.slice(0, 150) + '...'
    });
  });
  
  paragraphs.forEach(function(p) {
    const contextAnnotation = analyzeLiteraryContext(p, text);
    if (contextAnnotation) {
      annotations.push({
        id: uid(),
        title: contextAnnotation.title,
        content: contextAnnotation.content + (contextAnnotation.literaryTerm ? ' [Literary Term: ' + contextAnnotation.literaryTerm + ']' : ''),
        evidence: p.slice(0, 200) + (p.length > 200 ? '...' : '')
      });
    }
    
    const sentences = splitIntoSentences(p);
    sentences.forEach(function(s, idx) {
      // Only annotate substantial or opening/closing sentences
      if (s.length > 30 && (idx === 0 || idx === sentences.length - 1 || sentences.length < 4)) {
        const scholarly = createScholarlyAnnotation(s, p, text);
        annotations.push(scholarly);
      }
    });
  });
  
  return annotations.slice(0, 10); // Limit to 10 high-quality annotations
}


function generateAnnotations() {
  const text =
    window.currentText ||
    localStorage.getItem('lastText') ||
    '';
  
  if (!text.trim()) {
    notify('No text available for annotation');
    return;
  }
  
  const anns = generateDeepAnnotations(text);
  
  if (!anns.length) {
    notify('No annotations generated');
    return;
  }
  
  window.userAnnotations = anns;
  localStorage.setItem('advancedAnnotations', JSON.stringify(anns));
  renderAnnotations();
  notify('Generated ' + anns.length + ' scholarly annotations');
}

function getAnnotationsContainer() {
  return (
    document.getElementById('annotations-container-panel') ||
    document.getElementById('annotations-container')
  );
}

function renderAnnotations() {
  const container = getAnnotationsContainer();
  if (!container) return;
  
  if (!userAnnotations.length) {
    container.innerHTML = '<small>No annotations yet.</small>';
    return;
  }
  
  container.innerHTML = userAnnotations.map(function(a) {
    return '<div class="annotation-card" style="border:1px solid var(--border);padding:14px;margin-bottom:14px;border-radius:8px;">' +
      '<strong style="color:var(--primary);font-size:1.05rem;">' + a.title + '</strong>' +
      '<p style="margin-top:8px;line-height:1.6;color:var(--text);">' + a.content + '</p>' +
      '<div style="margin-top:10px;font-size:0.9rem;color:var(--muted);border-left:3px solid var(--primary);padding-left:10px;font-style:italic;">' +
      '"' + a.evidence + '"' +
      '</div></div>';
  }).join('');
}

function loadAnnotationsFromStorage() {
  try {
    const raw = localStorage.getItem('advancedAnnotations');
    if (!raw) return;
    userAnnotations = JSON.parse(raw);
    renderAnnotations();
  } catch (e) {
    console.warn('Failed to load annotations', e);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  window.currentText = localStorage.getItem('lastText') || '';
  loadAnnotationsFromStorage();
});