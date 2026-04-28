/* =============================================================
   main.js — site-wide chrome (header, footer, nav, scroll, year)
   Loaded by every page.
   ============================================================= */
(function () {
  'use strict';

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.from((root || document).querySelectorAll(sel)); };

  /* ----- Year in footer ----- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- Mobile nav toggle ----- */
  var toggle = $('#nav-toggle');
  var menu   = $('#nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    $$('#nav-menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----- Mark active nav link based on URL ----- */
  var path = location.pathname.replace(/\/+$/, '').split('/').pop() || 'index.html';
  $$('#nav-menu a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href) return;
    if (href === path || (path === 'index.html' && href === './') || (path === '' && href === 'index.html')) {
      a.classList.add('is-active');
    }
    // Group detail pages under their parent section
    var groups = {
      'member.html':         'team.html',
      'project.html':        'projects.html',
      'research-area.html':  'research.html'
    };
    if (groups[path] && groups[path] === href) a.classList.add('is-active');
  });

  /* ----- Back-to-top button ----- */
  var toTop = $('#to-top');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
  }

  /* ----- Reveal sections on scroll ----- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    $$('.section').forEach(function (s) { io.observe(s); });
  } else {
    $$('.section').forEach(function (s) { s.classList.add('in-view'); });
  }

  /* ----- Bold lab leaders' names everywhere ------------------
     Wraps any occurrence of "Felipe Feijoo" or "Monica Castañeda"
     (and the variants without diacritics) in <strong class="lead-name">.
     Runs over text nodes only, never touching attributes / scripts.
     -------------------------------------------------------- */
  var LEADERS_RE = /(Felipe\s+Feijoo|Monica\s+Casta[ñn]eda|M[oó]nica\s+Casta[ñn]eda)/g;
  function boldLeaders(node) {
    if (node.nodeType === 3) {
      var text = node.nodeValue;
      if (!LEADERS_RE.test(text)) return;
      LEADERS_RE.lastIndex = 0;
      var frag = document.createDocumentFragment();
      var lastIdx = 0, m;
      while ((m = LEADERS_RE.exec(text)) !== null) {
        if (m.index > lastIdx) frag.appendChild(document.createTextNode(text.slice(lastIdx, m.index)));
        var strong = document.createElement('strong');
        strong.className = 'lead-name';
        strong.textContent = m[0];
        frag.appendChild(strong);
        lastIdx = m.index + m[0].length;
      }
      if (lastIdx < text.length) frag.appendChild(document.createTextNode(text.slice(lastIdx)));
      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === 1) {
      // Skip script/style/strong itself, and skip nodes that are already lead-name
      var tag = node.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE') return;
      if (node.classList && node.classList.contains('lead-name')) return;
      // Iterate over a static copy of childNodes because we may mutate
      Array.from(node.childNodes).forEach(boldLeaders);
    }
  }
  // Make the helper available globally so dynamic renderers can call it on
  // their freshly-rendered subtrees.
  window.ECS = window.ECS || {};
  window.ECS.boldLeaders = boldLeaders;
  // Initial pass for the static markup of the page
  document.addEventListener('DOMContentLoaded', function () { boldLeaders(document.body); });

  /* ----- Small utilities, exposed on window.ECS ----- */
  window.ECS.escapeHtml = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  };
  window.ECS.qsParam = function (name) {
    var m = location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
    return m ? decodeURIComponent(m[1]) : '';
  };
  window.ECS.fetchJSON = function (url) {
    return fetch(url, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status + ' on ' + url); return r.json(); });
  };
  window.ECS.fetchText = function (url) {
    return fetch(url, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status + ' on ' + url); return r.text(); });
  };
  // Inject a "couldn't load" message that hints at running a local HTTP server.
  window.ECS.loadError = function (containerSel, file) {
    var el = document.querySelector(containerSel);
    if (!el) return;
    el.innerHTML =
      '<p class="pub-empty">Could not load <code>' + file + '</code>. ' +
      'When opening the site locally, run <code>python3 -m http.server</code> ' +
      'in the project folder and visit <code>http://localhost:8000</code>.</p>';
  };
})();
