// Authentication Functions
function checkAuth() {
  const user = localStorage.getItem('currentUser');
  if (!user) {
    alert('Please login to access this page');
    window.location.href = 'login.html';
  }
}

function updateAuthButton() {
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const btn = document.getElementById('auth-button');
  const msg = document.getElementById('welcome-message');
  
  if (user) {
    btn.textContent = 'Logout';
    btn.classList.add('logout-button');
    if (msg) msg.textContent = `Welcome back, ${user.name}! 👋`;
  } else {
    btn.textContent = 'Login';
    btn.classList.remove('logout-button');
    if (msg) msg.textContent = '';
  }
}

function handleAuth(e) {
  e.preventDefault();
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  
  if (user) {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('currentUser');
      updateAuthButton();
    }
  } else {
    window.location.href = 'login.html';
  }
}

// Login/Signup Functions
function switchTab(tab) {
  const tabs = document.querySelectorAll('.tab-button');
  const forms = document.querySelectorAll('.form-container');
  
  tabs.forEach((t, i) => {
    if ((tab === 'login' && i === 0) || (tab === 'signup' && i === 1)) {
      t.classList.add('active');
      forms[i].classList.add('active');
    } else {
      t.classList.remove('active');
      forms[i].classList.remove('active');
    }
  });
}

function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const remember = document.getElementById('remember-login').checked;
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email);
  
  if (!user) {
    showError('login-email-error', 'No account found with this email');
    return;
  }
  
  if (user.password !== password) {
    showError('login-password-error', 'Incorrect password');
    return;
  }
  
  localStorage.setItem('currentUser', JSON.stringify({
    name: user.name,
    email: user.email,
    rememberMe: remember,
    loginTime: new Date().toISOString()
  }));
  
  showSuccess(`Welcome back, ${user.name}! Redirecting...`);
  setTimeout(() => window.location.href = 'Homepage.html', 1000);
}

function handleSignup(e) {
  e.preventDefault();
  
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  const remember = document.getElementById('remember-signup').checked;
  
  // Validate
  if (name.length < 2) {
    showError('signup-name-error', 'Name must be at least 2 characters');
    return;
  }
  
  if (password.length < 6) {
    showError('signup-password-error', 'Password must be at least 6 characters');
    return;
  }
  
  if (password !== confirm) {
    showError('signup-confirm-error', 'Passwords do not match');
    return;
  }
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  if (users.find(u => u.email === email)) {
    showError('signup-email-error', 'An account with this email already exists');
    return;
  }
  
  users.push({ name, email, password, createdAt: new Date().toISOString() });
  localStorage.setItem('users', JSON.stringify(users));
  
  localStorage.setItem('currentUser', JSON.stringify({
    name, email, rememberMe: remember, loginTime: new Date().toISOString()
  }));
  
  showSuccess(`Account created! Welcome, ${name}! Redirecting...`);
  setTimeout(() => window.location.href = 'Homepage.html', 1500);
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.add('show');
  el.previousElementSibling.classList.add('error');
}

function showSuccess(msg) {
  const el = document.getElementById('success-message');
  el.textContent = msg;
  el.classList.add('show');
}

// FAQ Toggle
function toggleFaq(element) {
  const answer = element.nextElementSibling;
  const isActive = answer.classList.contains('active');
  
  // Close all other FAQs
  document.querySelectorAll('.faq-answer').forEach(ans => {
    ans.classList.remove('active');
  });
  document.querySelectorAll('.faq-question').forEach(q => {
    q.classList.remove('active');
  });
  
  // Toggle current FAQ
  if (!isActive) {
    answer.classList.add('active');
    element.classList.add('active');
  }
}

// Stats Update
function updateStats() {
  const items = JSON.parse(localStorage.getItem('lostItems') || '[]');
  const pickups = JSON.parse(localStorage.getItem('pickupRequests') || '[]');
  
  const total = items.length;
  const reunited = pickups.length;
  const pending = total - reunited;
  const rate = total > 0 ? Math.round((reunited / total) * 100) : 0;
  
  document.getElementById('totalReports').textContent = total;
  document.getElementById('reunited').textContent = reunited;
  document.getElementById('pending').textContent = pending;
  document.getElementById('successRate').textContent = rate + '%';
}
