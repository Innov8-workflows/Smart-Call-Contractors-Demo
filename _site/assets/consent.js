
(function () {
  'use strict';
  var GA4_ID = '';
  if (!/^G-[A-Z0-9]+$/.test(GA4_ID)) return;
  var KEY = 'smartcall-consent';
  var banner = null;

  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadGa() {
    if (window.__scGa) return;
    window.__scGa = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(s);
  }

  function clearGaCookies() {
    var host = location.hostname.replace(/^www\./, '');
    var domains = ['', location.hostname, '.' + host];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!/^_ga/.test(name)) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  function choose(v) {
    setChoice(v);
    if (banner) banner.hidden = true;
    if (v === 'granted') { loadGa(); return; }
    window['ga-disable-' + GA4_ID] = true;
    clearGaCookies();
    if (window.__scGa) location.reload();
  }

  function showBanner() {
    if (!banner) {
      var css = document.createElement('style');
      css.textContent =
        '.cookie-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:760px;margin:0 auto;' +
        'display:flex;align-items:center;gap:18px;padding:16px 18px;background:#131313;color:#e9e9e9;border:1px solid #2c2c2c;' +
        'border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.35);font:400 .9rem/1.5 var(--sans,system-ui),system-ui,sans-serif}' +
        '.cookie-banner[hidden]{display:none}' +
        '.cookie-banner p{margin:0;flex:1}' +
        '.cookie-banner a{color:#fff;text-decoration:underline}' +
        '.cookie-actions{display:flex;gap:10px;flex-shrink:0}' +
        '.cookie-btn{min-width:104px;padding:10px 16px;border-radius:8px;font:600 .9rem/1 var(--sans,system-ui),system-ui,sans-serif;cursor:pointer;' +
        'border:1px solid #fff;background:transparent;color:#fff}' +
        '.cookie-btn[data-choice="granted"]{background:#fff;color:#131313}' +
        '@media (max-width:600px){.cookie-banner{flex-direction:column;align-items:stretch;gap:12px;left:10px;right:10px;bottom:10px}' +
        '.cookie-actions .cookie-btn{flex:1;min-width:0}}';
      document.head.appendChild(css);
      banner = document.createElement('div');
      banner.className = 'cookie-banner';
      banner.setAttribute('role', 'region');
      banner.setAttribute('aria-label', 'Cookie choice');
      banner.innerHTML =
        '<p>We would like to use Google Analytics cookies to see how people find and use this site. ' +
        'They are only set if you accept. <a href="/privacy-policy">Privacy policy</a></p>' +
        '<div class="cookie-actions">' +
        '<button type="button" class="cookie-btn" data-choice="denied">Decline</button>' +
        '<button type="button" class="cookie-btn" data-choice="granted">Accept</button>' +
        '</div>';
      banner.addEventListener('click', function (e) {
        var b = e.target.closest('[data-choice]');
        if (b) choose(b.getAttribute('data-choice'));
      });
      document.body.appendChild(banner);
    }
    banner.hidden = false;
  }

  if (getChoice() === 'granted') loadGa();
  else if (getChoice() === 'denied') clearGaCookies();

  
  document.addEventListener('click', function (e) {
    if (!window.__scGa || !window.gtag) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var h = a.getAttribute('href') || '';
    var name = h.indexOf('tel:') === 0 ? 'contact_call' : /^https:\/\/wa\.me\//.test(h) ? 'contact_whatsapp' : h.indexOf('mailto:') === 0 ? 'contact_email' : '';
    if (name) window.gtag('event', name, { link_url: h, page_path: location.pathname });
  }, true);

  
  function formLead(f, how) {
    if (!window.__scGa || !window.gtag || !f) return;
    var v = function (k) { return (f.elements[k] && f.elements[k].value || '').trim(); };
    if (!v('name') || !v('phone')) return;
    window.gtag('event', 'generate_lead', { form_name: 'quote form', method: how, service: v('service'), page_path: location.pathname });
  }
  document.addEventListener('submit', function (e) {
    if (e.target && e.target.id === 'quoteForm') formLead(e.target, 'whatsapp');
  }, true);
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('#cf-send-email') : null;
    if (b && !b.disabled) formLead(b.form || document.getElementById('quoteForm'), 'email');
  }, true);

  function init() {
    if (!getChoice()) showBanner();
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-cookie-settings]');
      if (!t) return;
      e.preventDefault();
      showBanner();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
