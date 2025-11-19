// Email Validation Functions
function isValidEmail(email) {
  // Strict email validation regex
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function isDisposableEmail(email) {
  // Block common fake/disposable email domains
  const disposableDomains = [
    'tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'maildrop.cc', 'trashmail.com', 'fakeinbox.com',
    'temp-mail.org', 'getnada.com', 'throwawaymail.com', 'yopmail.com',
    'example.com', 'test.com', 'fake.com', 'dummy.com', 'temp.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain);
}

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
  
  // Hide all forms first
  forms.forEach(form => form.classList.remove('active'));
  
  // Show the selected form
  if (tab === 'login') {
    tabs[0]?.classList.add('active');
    tabs[1]?.classList.remove('active');
    document.getElementById('login-form')?.classList.add('active');
  } else if (tab === 'signup') {
    tabs[0]?.classList.remove('active');
    tabs[1]?.classList.add('active');
    document.getElementById('signup-form')?.classList.add('active');
  }
}

function showForgotPassword() {
  document.querySelectorAll('.form-container').forEach(form => form.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.getElementById('forgot-password-form')?.classList.add('active');
}

async function handleForgotPassword(e) {
  e.preventDefault();
  
  const email = document.getElementById('forgot-email').value.trim();
  
  try {
    const user = await DB.getUserByEmail(email);
    
    if (!user) {
      showError('forgot-email-error', 'No account found with this email');
      return;
    }
    
    // Show password in alert (in a real app, you'd send an email)
    alert(`Your password is: ${user.password}\n\nNote: In a production app, this would be sent to your email instead of displayed here.`);
    
    // Switch back to login
    switchTab('login');
  } catch (error) {
    alert('Error retrieving password: ' + error.message);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const remember = document.getElementById('remember-login').checked;
  
  try {
    const user = await DB.getUserByEmail(email);
    
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
    setTimeout(() => window.location.href = 'index.html', 1000);
  } catch (error) {
    alert('Login error: ' + error.message);
  }
}

async function handleSignup(e) {
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
  
  // Validate email format
  if (!isValidEmail(email)) {
    showError('signup-email-error', 'Please enter a valid email address');
    return;
  }
  
  // Block disposable/fake emails
  if (isDisposableEmail(email)) {
    showError('signup-email-error', 'Please use a real email address, not a temporary or fake one');
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
  
  try {
    const existingUser = await DB.getUserByEmail(email);
    
    if (existingUser) {
      showError('signup-email-error', 'An account with this email already exists');
      return;
    }
    
    await DB.addUser({ name, email, password, createdAt: new Date().toISOString() });
    
    localStorage.setItem('currentUser', JSON.stringify({
      name, email, rememberMe: remember, loginTime: new Date().toISOString()
    }));
    
    showSuccess(`Account created! Welcome, ${name}! Redirecting...`);
    setTimeout(() => window.location.href = 'index.html', 1500);
  } catch (error) {
    alert('Signup error: ' + error.message);
  }
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
async function updateStats() {
  try {
    const items = await DB.getLostItems();
    const pickups = await DB.getPickupRequests();
    
    const total = items.length;
    const reunited = pickups.length;
    const pending = total - reunited;
    const rate = total > 0 ? Math.round((reunited / total) * 100) : 0;
    
    document.getElementById('totalReports').textContent = total;
    document.getElementById('reunited').textContent = reunited;
    document.getElementById('pending').textContent = pending;
    document.getElementById('successRate').textContent = rate + '%';
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}
