/**
 * DROP-IN REPLACEMENT for the contact form handler in victor_portfolio.html
 *
 * Find the existing form submit handler in the <script> block:
 *
 *   document.getElementById('contactForm').addEventListener('submit', function(e) { ... });
 *
 * Replace the ENTIRE addEventListener block with the code below.
 *
 * Also set your backend URL:
 *   - Development:  http://localhost:5000
 *   - Production:   https://your-deployed-api.com  (e.g. on Railway or Render)
 */

const API_URL = 'http://localhost:5000'; // ← change to your deployed URL in production

document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const btn    = this.querySelector('.form-submit');
  const form   = this;

  // Gather form values
  const firstName   = form.querySelector('input[placeholder="Jane"]').value.trim();
  const lastName    = form.querySelector('input[placeholder="Doe"]').value.trim();
  const email       = form.querySelector('input[type="email"]').value.trim();
  const enquiryType = form.querySelector('select').value;
  const message     = form.querySelector('textarea').value.trim();

  // Basic client-side guard (backend validates too)
  if (!firstName || !lastName || !email || !enquiryType || !message) {
    showFormStatus(btn, '⚠ Please fill in all fields.', '#c0392b', false);
    return;
  }

  // Loading state
  btn.disabled    = true;
  btn.textContent = 'Sending…';
  btn.style.background = '#58584f';

  try {
    const response = await fetch(`${API_URL}/api/contact`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ firstName, lastName, email, enquiryType, message }),
    });

    const data = await response.json();

    if (data.success) {
      // Success
      showFormStatus(btn, 'Message Sent ✓', '#b8952a', true);
      form.reset();
    } else {
      // Server returned validation errors or other failure
      const errorMsg = data.errors
        ? data.errors.map(er => er.message).join(', ')
        : (data.message || 'Something went wrong. Please try again.');
      showFormStatus(btn, `⚠ ${errorMsg}`, '#c0392b', false);
    }

  } catch (err) {
    // Network error
    console.error('Form submission error:', err);
    showFormStatus(btn, '⚠ Could not connect. Please email directly.', '#c0392b', false);
  }
});

function showFormStatus(btn, text, color, reset) {
  btn.textContent       = text;
  btn.style.background  = color;
  btn.disabled          = false;
  if (reset) {
    setTimeout(() => {
      btn.textContent      = 'Send Message →';
      btn.style.background = '';
    }, 4000);
  } else {
    // Re-enable after 3s so user can try again
    setTimeout(() => {
      btn.textContent      = 'Send Message →';
      btn.style.background = '';
    }, 3000);
  }
}
