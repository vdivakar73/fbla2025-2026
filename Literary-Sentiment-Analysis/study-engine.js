/* ===================== STATE ===================== */
let decks = JSON.parse(localStorage.getItem('decks') || '{}');
let currentDeck = null;
let cardIndex = 0;
let flipped = false;
let quizIndex = 0;
let score = 0;

/* ===================== INIT ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const homeText = localStorage.getItem('lastText');
  if (homeText) document.getElementById('textInput').value = homeText;
  renderDecks();
});

/* ===================== DECKS ===================== */
function createDeck() {
  const name = prompt('Deck name?');
  if (!name) return;

  decks[name] = { cards: [], questions: [] };
  saveDecks();
  renderDecks();
}

function renderDecks() {
  const el = document.getElementById('deckList');
  el.innerHTML = '';

  Object.keys(decks).forEach(name => {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.onclick = () => loadDeck(name);
    el.appendChild(btn);
  });
}

function loadDeck(name) {
  currentDeck = decks[name];
  cardIndex = 0;
  quizIndex = 0;
  showFlashcards();
}

/* ===================== BUILD ===================== */
function buildFromText() {
  if (!currentDeck) {
    alert('Create or select a deck first');
    return;
  }

  const text = document.getElementById('textInput').value.trim();
  if (!text) return;

  const sentences = text.match(/[^\.\!\?]+[\.\!\?]*/g) || [];
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.length > 60);

  currentDeck.cards = [];
  currentDeck.questions = [];

  paragraphs.forEach(p => {
    currentDeck.cards.push({
      front: 'What happens in this part of the text?',
      back: p.trim()
    });

    currentDeck.questions.push({
      q: 'Explain the cause-and-effect relationship in this passage.',
      a: p.trim()
    });
  });

  sentences.slice(0, 10).forEach(s => {
    currentDeck.cards.push({
      front: 'Why is this sentence important?',
      back: s.trim()
    });

    currentDeck.questions.push({
      q: 'Interpret the meaning of this sentence in context.',
      a: s.trim()
    });
  });

  saveDecks();
  showFlashcards();
}

/* ===================== FLASHCARDS ===================== */
function showFlashcards() {
  document.getElementById('flashcardPanel').classList.remove('hidden');
  document.getElementById('quizPanel').classList.add('hidden');
  renderCard();
}

function renderCard() {
  const card = currentDeck.cards[cardIndex];
  if (!card) return;

  document.getElementById('cardFront').textContent = card.front;
  document.getElementById('cardBack').textContent = card.back;
  document.getElementById('cardFront').classList.toggle('hidden', flipped);
  document.getElementById('cardBack').classList.toggle('hidden', !flipped);
  document.getElementById('cardProgress').textContent =
    `Card ${cardIndex + 1} / ${currentDeck.cards.length}`;
}

function flipCard() {
  flipped = !flipped;
  renderCard();
}

function nextCard() {
  cardIndex = (cardIndex + 1) % currentDeck.cards.length;
  flipped = false;
  renderCard();
}

function prevCard() {
  cardIndex = (cardIndex - 1 + currentDeck.cards.length) % currentDeck.cards.length;
  flipped = false;
  renderCard();
}

function editCard() {
  const card = currentDeck.cards[cardIndex];
  const front = prompt('Edit front:', card.front);
  const back = prompt('Edit back:', card.back);
  if (front !== null) card.front = front;
  if (back !== null) card.back = back;
  saveDecks();
  renderCard();
}

function shuffleCards() {
  currentDeck.cards.sort(() => Math.random() - 0.5);
  cardIndex = 0;
  renderCard();
}

/* ===================== QUIZ ===================== */
function startQuiz() {
  quizIndex = 0;
  score = 0;
  document.getElementById('quizPanel').classList.remove('hidden');
  document.getElementById('flashcardPanel').classList.add('hidden');
  renderQuiz();
}

function renderQuiz() {
  const q = currentDeck.questions[quizIndex];
  if (!q) return;

  document.getElementById('quizQuestion').textContent = q.q;
  document.getElementById('quizAnswer').value = '';
  document.getElementById('quizFeedback').textContent = '';
}

function submitAnswer() {
  const user = document.getElementById('quizAnswer').value.trim();
  const correct = currentDeck.questions[quizIndex].a;

  if (user.length > 20) score++;

  document.getElementById('quizFeedback').textContent =
    `Sample answer: ${correct}`;
}

function nextQuiz() {
  quizIndex++;
  if (quizIndex >= currentDeck.questions.length) {
    alert(`Quiz complete. Score: ${score}`);
    showFlashcards();
  } else {
    renderQuiz();
  }
}

/* ===================== STORAGE ===================== */
function saveDecks() {
  localStorage.setItem('decks', JSON.stringify(decks));
}
