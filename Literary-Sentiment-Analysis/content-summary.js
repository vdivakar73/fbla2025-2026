async function generateSummary() {
  const text =
    localStorage.getItem('lastText') ||
    localStorage.getItem('pendingExample');

  if (!text) {
    alert('No text found. Go to Home and analyze something first.');
    return;
  }

  const container = document.getElementById('summary-container');
  container.innerHTML = '<small class="muted">Generating summary…</small>';

  try {
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const data = await response.json();

    if (!data.result) {
      throw new Error('Empty response');
    }

    container.innerHTML = `
      <div class="summary-card">
        ${data.result.replace(/\n/g, '<br><br>')}
      </div>
    `;

  } catch (err) {
    console.error(err);
    container.innerHTML =
      '<small class="muted">Failed to generate summary.</small>';
  }
}
