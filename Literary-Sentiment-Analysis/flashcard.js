let flashcards = [];
let currentCard = 0;
let flipped = false;

function generateFlashcards() {
  const raw = localStorage.getItem('study_payload');
  if (!raw) return alert('Analyze text first');

  const data = JSON.parse(raw);
  flashcards = [];

  data.keyStatements.forEach(s => {
    flashcards.push({
      front: 'What is happening here?',
      back: s.trim()
    });
  });

  data.themes.forEach(t => {
    flashcards.push({
      front: `How does the text explore ${t}?`,
      back: `Through events, language, and consequences connected to ${t}.`
    });
  });

  currentCard = 0;
  flipped = false;

  document.getElementById('flashcardStudy').classList.remove('hidden');
  renderCard();
}

function renderCard() {
  if (!flashcards.length) return;

  document.getElementById('flashcardFront').textContent =
    flashcards[currentCard].front;

  document.getElementById('flashcardBack').textContent =
    flashcards[currentCard].back;

  document.getElementById('flashcardFront').style.display = flipped ? 'none' : 'block';
  document.getElementById('flashcardBack').style.display = flipped ? 'block' : 'none';

  document.getElementById('cardProgress').textContent =
    `Card ${currentCard + 1} of ${flashcards.length}`;
}

function flipCard() {
  flipped = !flipped;
  renderCard();
}

function nextCard() {
  currentCard = (currentCard + 1) % flashcards.length;
  flipped = false;
  renderCard();
}

function previousCard() {
  currentCard = (currentCard - 1 + flashcards.length) % flashcards.length;
  flipped = false;
  renderCard();
}

function shuffleCards() {
  flashcards.sort(() => Math.random() - 0.5);
  currentCard = 0;
  flipped = false;
  renderCard();
}
