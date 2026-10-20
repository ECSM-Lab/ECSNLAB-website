/* =============================================================
   main.js - site-wide chrome (header, footer, nav, scroll, year)
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

  /* ----- Light / dark theme toggle -----
     The initial theme is set by an inline script in each page's <head>
     (saved choice, else system preference). A manual choice is saved in
     localStorage; without one, the site keeps following the system. */
  var THEME_KEY = 'scale-theme';
  var root = document.documentElement;
  function currentTheme() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var btn = $('#theme-toggle');
    if (btn) {
      var label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    }
  }
  var nav = $('.nav');
  if (nav) {
    var themeBtn = document.createElement('button');
    themeBtn.type = 'button';
    themeBtn.className = 'theme-toggle';
    themeBtn.id = 'theme-toggle';
    themeBtn.innerHTML =
      '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
      '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 1.5v2.5M12 20v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M1.5 12H4M20 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/></svg>';
    nav.insertBefore(themeBtn, $('#nav-toggle') || null);
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      applyTheme(next);
    });
  }
  applyTheme(currentTheme());
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onSystemChange = function (e) {
      var saved; try { saved = localStorage.getItem(THEME_KEY); } catch (err) {}
      if (saved !== 'light' && saved !== 'dark') applyTheme(e.matches ? 'dark' : 'light');
    };
    if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
    else if (mq.addListener) mq.addListener(onSystemChange);
  }

  /* ----- Mark active nav link based on URL ----- */
  var last = location.pathname.split('/').pop();
  var path = /\.html$/.test(last) ? last : 'index.html';  // site root (.../SCALE/) is the home page
  // Detail pages count as their parent section.
  var page = {
    'member.html':        'team.html',
    'project.html':       'projects.html',
    'research-area.html': 'research.html',
    'topic.html':         'opportunities.html',
    'reports.html':       'publications.html'
  }[path] || path;
  var view = new URLSearchParams(location.search).get('view');
  $$('#nav-menu > li').forEach(function (li) {
    var top = $('a', li);
    var topHref = top && (top.getAttribute('href') === './' ? 'index.html' : top.getAttribute('href'));
    var active = topHref === page;
    $$('.nav-sub a', li).forEach(function (a) {
      var q = (a.getAttribute('href') || '').split('?');
      if (q[0] !== page) return;
      active = true;
      if (new URLSearchParams(q[1] || '').get('view') === view) a.classList.add('is-active');
    });
    if (active && top) top.classList.add('is-active');
  });

  /* ----- Social links (header, mobile menu, footer) -----
     TODO: the URLs below are placeholders; replace them with the lab's
     real accounts. Set a URL to '' to hide that network. */
  var SOCIAL = [
    { name: 'LinkedIn',  url: 'https://www.linkedin.com/company/scale-lab-pucv',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>' },
    { name: 'X',         url: 'https://x.com/scale_pucv',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.49l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.48 3.24H4.3l13.31 17.41z"/></svg>' },
    { name: 'Instagram', url: 'https://www.instagram.com/scale.pucv',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none"/></svg>' }
  ].filter(function (s) { return s.url; });
  function socialLinks(cls) {
    var wrap = document.createElement('div');
    wrap.className = cls;
    wrap.innerHTML = SOCIAL.map(function (s) {
      var label = 'SCALE on ' + s.name;
      return '<a href="' + s.url + '" target="_blank" rel="noopener" aria-label="' + label + '" title="' + label + '">' + s.icon + '</a>';
    }).join('');
    return wrap;
  }
  if (SOCIAL.length) {
    if (nav) nav.insertBefore(socialLinks('nav-social'), $('#theme-toggle') || null);
    if (menu) {
      var li = document.createElement('li');
      li.className = 'nav-social-item';
      li.appendChild(socialLinks('nav-social-mobile'));
      menu.appendChild(li);
    }
    var footBrand = $('.footer-brand > div');
    if (footBrand) footBrand.appendChild(socialLinks('footer-social'));
  }

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
  // In Spanish (see i18n.js), any "<field>_es" value in the JSON data
  // replaces "<field>"; fields without a translation stay in English.
  function localize(o) {
    if (Array.isArray(o)) { o.forEach(localize); return o; }
    if (o && typeof o === 'object') {
      Object.keys(o).forEach(function (k) {
        var v = o[k];
        if (/_es$/.test(k)) {
          if (v != null && v !== '' && !(Array.isArray(v) && !v.length)) o[k.slice(0, -3)] = v;
        } else {
          localize(v);
        }
      });
    }
    return o;
  }
  window.ECS.fetchJSON = function (url) {
    return fetch(url, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status + ' on ' + url); return r.json(); })
      .then(function (data) { return document.documentElement.lang === 'es' ? localize(data) : data; });
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
