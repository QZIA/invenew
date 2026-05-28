/* ============================================================
   INVENEW — Sponsors / Partner inquiry form handler
   ============================================================
   SETUP: Replace the fetch URL below with your form endpoint.
   Options: Formspree (https://formspree.io), Netlify Forms,
   or any backend endpoint that accepts JSON POST.

   Formspree setup:
   1. Sign up at formspree.io
   2. Create a form and copy the endpoint URL
   3. Replace FORMSPREE_ENDPOINT below
   ============================================================ */

(function () {
  'use strict';

  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

  function showStatus(msg, isError) {
    var el = document.getElementById('form-status');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    el.style.color = isError ? '#b03030' : 'var(--color-text-muted)';
  }

  function setSubmitting(isSubmitting) {
    var btn = document.getElementById('sponsor-submit');
    if (!btn) return;
    btn.disabled = isSubmitting;
    btn.textContent = isSubmitting ? 'Sending…' : 'Send inquiry';
  }

  function initForm() {
    var form = document.getElementById('sponsor-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot check
      var hp = form.querySelector('[name="hp"]');
      if (hp && hp.value) return;

      var name    = (form.querySelector('[name="name"]')     || {}).value || '';
      var email   = (form.querySelector('[name="email"]')    || {}).value || '';
      var company = (form.querySelector('[name="company"]')  || {}).value || '';
      var interest= (form.querySelector('[name="interest"]') || {}).value || '';
      var message = (form.querySelector('[name="message"]')  || {}).value || '';

      if (!name.trim() || !email.trim()) {
        showStatus('Please provide your name and email.', true);
        return;
      }

      if (FORMSPREE_ENDPOINT.indexOf('YOUR_FORM_ID') !== -1) {
        // Dev mode — show a success simulation
        setSubmitting(true);
        setTimeout(function () {
          setSubmitting(false);
          showStatus('Form endpoint not yet configured. Set up Formspree and update FORMSPREE_ENDPOINT in assets/js/sponsors.js.', true);
        }, 800);
        return;
      }

      setSubmitting(true);
      showStatus('', false);

      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name: name, email: email, company: company, interest: interest, message: message })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          setSubmitting(false);
          if (data.ok || data.success) {
            form.reset();
            showStatus('Thanks — we\'ll follow up within 2 business days.', false);
          } else {
            showStatus('Something went wrong. Please email us directly.', true);
          }
        })
        .catch(function () {
          setSubmitting(false);
          showStatus('Could not send. Please try again or email us directly.', true);
        });
    });
  }

  document.addEventListener('DOMContentLoaded', initForm);

})();
