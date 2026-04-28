/* =============================================================
   bibtex.js — BibTeX parser + publication renderer for ECS Lab
   - Reads publications.bib (peer-reviewed) and reports.bib (technical)
   - Renders into separate journal / report subsections
   - Filters: tab (journals/reports/all), search, year, author,
              research area, type
   - Highlights Feijoo and Castañeda as authors
   ============================================================= */
(function () {
  'use strict';

  var ESC = (window.ECS && window.ECS.escapeHtml) || function (s) { return String(s == null ? '' : s); };

  /* ============================================================
     Parser
     ============================================================ */
  function parseBibTeX(input) {
    var entries = [], i = 0, n = input.length;
    var isSpace = function (c) { return c === ' ' || c === '\t' || c === '\n' || c === '\r'; };
    function skipSpaces() { while (i < n && isSpace(input[i])) i++; }
    function readUntil(pred) { var s = i; while (i < n && !pred(input[i])) i++; return input.slice(s, i); }
    function readBraced() {
      var depth = 0, start = i;
      while (i < n) {
        var c = input[i];
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) { i++; return input.slice(start + 1, i - 1); } }
        i++;
      }
      return input.slice(start + 1);
    }
    function readQuoted() {
      var start = i; i++;
      while (i < n && input[i] !== '"') i++;
      var v = input.slice(start + 1, i);
      if (i < n) i++;
      return v;
    }
    function readValue() {
      skipSpaces();
      if (input[i] === '{') return readBraced();
      if (input[i] === '"') return readQuoted();
      return readUntil(function (c) { return c === ',' || c === '}' || isSpace(c); });
    }
    while (i < n) {
      skipSpaces();
      if (i < n && input[i] === '%') { while (i < n && input[i] !== '\n') i++; continue; }
      if (i >= n) break;
      if (input[i] !== '@') { i++; continue; }
      i++;
      var type = readUntil(function (c) { return c === '{'; }).toLowerCase().trim();
      if (input[i] !== '{') continue;
      i++;
      var key = readUntil(function (c) { return c === ','; }).trim();
      if (input[i] === ',') i++;
      var fields = {}, finished = false;
      while (i < n && !finished) {
        skipSpaces();
        if (input[i] === '}') { i++; finished = true; break; }
        var fname = readUntil(function (c) { return c === '=' || c === '}' || isSpace(c); }).toLowerCase().trim();
        skipSpaces();
        if (input[i] !== '=') { while (i < n && input[i] !== '@') i++; break; }
        i++;
        var raw = readValue();
        fields[fname] = clean(raw);
        skipSpaces();
        if (input[i] === ',') { i++; continue; }
        if (input[i] === '}') { i++; finished = true; break; }
      }
      if (type && key && Object.keys(fields).length) entries.push({ type: type, key: key, fields: fields });
    }
    return entries;
  }
  function clean(str) {
    if (!str) return '';
    var s = str.trim();
    while (s.length > 1 && s[0] === '{' && s[s.length - 1] === '}') s = s.slice(1, -1);
    s = s.replace(/\s+/g, ' ').trim();
    var map = [
      [/\\'\{?a\}?/g, 'á'], [/\\'\{?e\}?/g, 'é'], [/\\'\{?i\}?/g, 'í'],
      [/\\'\{?o\}?/g, 'ó'], [/\\'\{?u\}?/g, 'ú'], [/\\'\{?n\}?/g, 'ń'],
      [/\\`\{?a\}?/g, 'à'], [/\\`\{?e\}?/g, 'è'],
      [/\\~\{?n\}?/g, 'ñ'], [/\\~\{?a\}?/g, 'ã'],
      [/\\"\{?a\}?/g, 'ä'], [/\\"\{?o\}?/g, 'ö'], [/\\"\{?u\}?/g, 'ü'],
      [/\\c\{?c\}?/g, 'ç'], [/\\&/g, '&'], [/\\%/g, '%'],
      [/--/g, '–'], [/~/g, ' ']
    ];
    map.forEach(function (p) { s = s.replace(p[0], p[1]); });
    s = s.replace(/[{}]/g, '');
    return s;
  }
  function parseAuthors(raw) {
    if (!raw) return [];
    return raw.split(/\s+and\s+/i).map(function (a) { return formatAuthor(a.trim()); }).filter(Boolean);
  }
  function formatAuthor(name) {
    if (name.indexOf(',') >= 0) {
      var parts = name.split(',', 2).map(function (s) { return s.trim(); });
      return (parts[1] + ' ' + parts[0]).trim();
    }
    return name;
  }

  /* ============================================================
     State & rendering
     ============================================================ */
  var STATE = {
    all: [], filtered: [],
    searchText: '', year: 'all', author: 'all', area: 'all', type: 'journals',
    /* If set, only entries where the author list matches this regex are kept
       at all (used by the per-member profile page to scope the bibliography
       to one person). */
    authorFilter: null,
    /* If set, only entries whose title/keywords match any of these terms are
       kept (used by project and research-area detail pages). */
    keywordFilter: null,
    /* Names to highlight in author lists. Defaults to the lab leadership;
       a member's profile page passes its own bibtex_name as well. */
    highlightAuthors: ['Felipe Feijoo', 'Monica Castañeda', 'Mónica Castañeda']
  };

  function buildHighlightRegex(names) {
    var escaped = names.map(function (n) { return n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    return new RegExp('(?:' + escaped.join('|') + ')', 'i');
  }

  function isReportType(t) { return /^(techreport|misc|manual|unpublished)$/i.test(t || ''); }

  function normalise(entry) {
    var f = entry.fields;
    var year = parseInt(f.year || '', 10) || null;
    return {
      key: entry.key, type: entry.type,
      title: f.title || '(untitled)',
      authors: parseAuthors(f.author),
      year: year,
      venue: f.journal || f.booktitle || f.publisher || '',
      volume: f.volume || '', number: f.number || '', pages: f.pages || '',
      doi: f.doi || '',
      url: f.url || (f.doi ? 'https://doi.org/' + f.doi : ''),
      abstract: f.abstract || '',
      selected: (f.selected || '').toLowerCase() === 'yes',
      keywords: (f.keywords || '').split(',').map(function (k) { return k.trim(); }).filter(Boolean),
      institution: f.institution || f.school || f.organization || '',
      address: f.address || '',
      reportKind: f.type || '',
      howpublished: f.howpublished || '',
      pdf: f.pdf || '',
      raw: entry
    };
  }
  function sortByYearDesc(a, b) {
    return (b.year || 0) - (a.year || 0) || (a.authors[0] || '').localeCompare(b.authors[0] || '');
  }

  function loadAndRender(opts) {
    opts = opts || {};
    var pubsUrl    = opts.pubs    || 'publications.bib';
    var reportsUrl = opts.reports || 'reports.bib';

    function safeText(url) {
      return fetch(url, { cache: 'no-cache' })
        .then(function (r) { return r.ok ? r.text() : ''; })
        .catch(function () { return ''; });
    }
    Promise.all([safeText(pubsUrl), safeText(reportsUrl)])
      .then(function (texts) {
        var combined = (texts[0] || '') + '\n' + (texts[1] || '');
        var entries = parseBibTeX(combined);
        STATE.all = entries.map(normalise).sort(sortByYearDesc);
        // If scoped to a single author (e.g. a member's profile), drop
        // entries that don't include that author in the author list.
        if (STATE.authorFilter) {
          var authorRx = new RegExp(STATE.authorFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
          STATE.all = STATE.all.filter(function (p) {
            return p.authors.some(function (a) { return authorRx.test(a); });
          });
        }
        if (STATE.keywordFilter && STATE.keywordFilter.length) {
          var kwTerms = STATE.keywordFilter.map(function (k) { return k.toLowerCase(); });
          STATE.all = STATE.all.filter(function (p) {
            var hay = (p.title + ' ' + p.keywords.join(' ') + ' ' + p.abstract).toLowerCase();
            return kwTerms.some(function (k) { return hay.indexOf(k) >= 0; });
          });
        }
        populateFilters();
        applyFilters();
      })
      .catch(function (err) {
        console.error('BibTeX load failed:', err);
        if (window.ECS && window.ECS.loadError) {
          window.ECS.loadError('#pub-list-journals', pubsUrl);
          window.ECS.loadError('#pub-list-reports', reportsUrl);
        }
      });
  }

  function populateFilters() {
    // Year
    var yearSel = document.getElementById('pub-year');
    if (yearSel) {
      var years = Array.from(new Set(STATE.all.map(function (p) { return p.year; }).filter(Boolean)))
        .sort(function (a, b) { return b - a; });
      yearSel.innerHTML = '<option value="all">All years</option>';
      years.forEach(function (y) {
        var o = document.createElement('option'); o.value = String(y); o.textContent = y; yearSel.appendChild(o);
      });
    }
    // Author — anyone who appears in at least 2 publications, plus the leadership
    var authorSel = document.getElementById('pub-author');
    if (authorSel) {
      var counts = {};
      STATE.all.forEach(function (p) { p.authors.forEach(function (a) { counts[a] = (counts[a] || 0) + 1; }); });
      var topAuthors = Object.keys(counts)
        .filter(function (a) { return counts[a] >= 2 || /Feijoo|Casta[ñn]eda/i.test(a); })
        .sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); });
      authorSel.innerHTML = '<option value="all">All authors</option>';
      topAuthors.forEach(function (a) {
        var o = document.createElement('option'); o.value = a; o.textContent = a + ' (' + counts[a] + ')';
        authorSel.appendChild(o);
      });
    }
    // Type — derived from BibTeX entry types
    var typeSel = document.getElementById('pub-type');
    if (typeSel) {
      var types = Array.from(new Set(STATE.all.map(function (p) { return p.type; })));
      var labels = {
        article: 'Journal article', inproceedings: 'Conference paper',
        incollection: 'Book chapter', inbook: 'Book chapter', book: 'Book',
        techreport: 'Technical report', misc: 'Brief / Misc',
        manual: 'Manual', unpublished: 'Unpublished'
      };
      typeSel.innerHTML = '<option value="all">All types</option>';
      types.forEach(function (t) {
        var o = document.createElement('option'); o.value = t; o.textContent = labels[t] || t;
        typeSel.appendChild(o);
      });
    }
    // Area — pulled from research-areas.json keywords (loaded separately if available)
    var areaSel = document.getElementById('pub-area');
    if (areaSel && window.ECS && window.ECS.fetchJSON) {
      window.ECS.fetchJSON('data/research-areas.json').then(function (data) {
        areaSel.innerHTML = '<option value="all">All research areas</option>';
        (data.areas || []).forEach(function (a) {
          var o = document.createElement('option');
          o.value = (a.keywords || []).join('|').toLowerCase(); o.textContent = a.title;
          areaSel.appendChild(o);
        });
      }).catch(function () {});
    }
  }

  function applyFilters() {
    var q = STATE.searchText.toLowerCase();
    STATE.filtered = STATE.all.filter(function (p) {
      if (STATE.year   !== 'all' && String(p.year)  !== STATE.year)   return false;
      if (STATE.author !== 'all' && p.authors.indexOf(STATE.author) < 0) return false;
      if (STATE.type   !== 'all' && STATE.type !== 'journals' && STATE.type !== 'reports' && p.type !== STATE.type) return false;
      if (STATE.area   !== 'all') {
        var areaTerms = STATE.area.split('|');
        var hayArea = (p.title + ' ' + p.keywords.join(' ')).toLowerCase();
        if (!areaTerms.some(function (k) { return hayArea.indexOf(k) >= 0; })) return false;
      }
      if (!q) return true;
      var hay = [p.title, p.authors.join(' '), p.venue, p.keywords.join(' '), String(p.year || '')].join(' ').toLowerCase();
      return hay.indexOf(q) >= 0;
    });
    render();
  }

  function render() {
    var listJournalsEl = document.getElementById('pub-list-journals');
    var listReportsEl  = document.getElementById('pub-list-reports');
    var subJournalsEl  = document.getElementById('pub-subsection-journals');
    var subReportsEl   = document.getElementById('pub-subsection-reports');
    var countEl        = document.getElementById('pub-count');

    var journals = STATE.filtered.filter(function (p) { return !isReportType(p.type); });
    var reports  = STATE.filtered.filter(function (p) { return  isReportType(p.type); });

    if (listJournalsEl) renderIntoList(listJournalsEl, journals, 'No peer-reviewed entries match the current filters.');
    if (listReportsEl)  renderIntoList(listReportsEl,  reports,  'No reports match the current filters.');

    // Tab visibility
    if (subJournalsEl && subReportsEl) {
      if (STATE.type === 'reports')        { subJournalsEl.hidden = true;  subReportsEl.hidden = false; }
      else if (STATE.type === 'journals')  { subJournalsEl.hidden = false; subReportsEl.hidden = true;  }
      else                                  { subJournalsEl.hidden = false; subReportsEl.hidden = false; }
    }

    if (countEl) {
      var total = STATE.all.length;
      var shown = STATE.type === 'journals' ? journals.length : (STATE.type === 'reports' ? reports.length : STATE.filtered.length);
      countEl.textContent = shown + ' of ' + total + ' shown';
    }
  }

  function renderIntoList(containerEl, items, emptyMsg) {
    containerEl.innerHTML = '';
    if (!items.length) { containerEl.innerHTML = '<p class="pub-empty">' + emptyMsg + '</p>'; return; }
    var groups = new Map();
    items.forEach(function (p) {
      var g = p.year || 'Other'; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(p);
    });
    groups.forEach(function (arr, year) {
      var section = document.createElement('div');
      section.className = 'pub-year-group';
      section.innerHTML = '<h3>' + year + '</h3>';
      arr.forEach(function (p) { section.appendChild(renderItem(p)); });
      containerEl.appendChild(section);
    });
    if (window.ECS && window.ECS.boldLeaders) window.ECS.boldLeaders(containerEl);
  }

  function renderItem(p) {
    var el = document.createElement('article');
    el.className = 'pub-item';

    var highlightRx = buildHighlightRegex(STATE.highlightAuthors || []);
    var authorsHtml = p.authors.map(function (a) {
      return highlightRx.test(a) ? '<span class="self">' + a + '</span>' : a;
    }).join(', ');

    var venueParts = [];
    var report = isReportType(p.type);
    if (report) {
      if (p.reportKind)        venueParts.push('<em>' + p.reportKind + '</em>');
      else if (p.howpublished) venueParts.push('<em>' + p.howpublished + '</em>');
      if (p.institution) venueParts.push(p.institution);
      if (p.address)     venueParts.push(p.address);
    } else {
      if (p.venue)  venueParts.push('<em>' + p.venue + '</em>');
      if (p.volume) venueParts.push(p.number ? p.volume + '(' + p.number + ')' : p.volume);
      if (p.pages)  venueParts.push(p.pages);
    }
    var badges = [];
    if (p.type === 'inproceedings')                                  badges.push('<span class="pill">Conference</span>');
    else if (p.type === 'incollection' || p.type === 'book' || p.type === 'inbook') badges.push('<span class="pill">Chapter / Book</span>');
    else if (p.type === 'techreport')                                badges.push('<span class="pill">Technical report</span>');
    else if (p.type === 'misc')                                      badges.push('<span class="pill">Brief</span>');
    else if (p.type === 'manual')                                    badges.push('<span class="pill">Manual</span>');

    var keywordsHtml = p.keywords.length
      ? '<div class="pub-keywords">' + p.keywords.map(function (k) { return '<span class="kw">' + ESC(k) + '</span>'; }).join('') + '</div>'
      : '';
    var abstractHtml = p.abstract
      ? '<p class="pub-abstract"><strong>Abstract.</strong> ' + ESC(p.abstract) + '</p>'
      : '<p class="pub-abstract pub-abstract-missing">Abstract not yet added.</p>';

    var linkList = [];
    if (p.url) linkList.push('<a class="pub-link" href="' + ESC(p.url) + '" target="_blank" rel="noopener">Open paper →</a>');
    if (p.doi) linkList.push('<a class="pub-link" href="https://doi.org/' + ESC(p.doi) + '" target="_blank" rel="noopener">doi:' + ESC(p.doi) + '</a>');
    if (p.pdf) linkList.push('<a class="pub-link" href="' + ESC(p.pdf) + '" target="_blank" rel="noopener">PDF</a>');
    var linksRow = linkList.length ? '<div class="pub-detail-links">' + linkList.join('') + '</div>' : '';

    el.innerHTML =
      '<h4 class="pub-title">' +
      '  <button type="button" class="pub-title-btn" data-action="toggle-detail" aria-expanded="false">' +
      '    <span class="pub-caret" aria-hidden="true">+</span>' +
      '    <span class="pub-title-text">' + ESC(p.title) + '</span>' +
      '  </button>' +
      '</h4>' +
      (badges.length ? '<div class="pub-badges">' + badges.join('') + '</div>' : '') +
      '<p class="pub-authors">' + authorsHtml + '</p>' +
      '<p class="pub-venue">' + venueParts.join(', ') + (p.year ? ', ' + p.year : '') + '</p>' +
      '<div class="pub-detail" hidden>' +
      abstractHtml + keywordsHtml + linksRow +
      '  <div class="pub-links"><button type="button" data-action="toggle-bib">Show BibTeX</button></div>' +
      '  <div class="pub-bibtex"><pre></pre></div>' +
      '</div>';

    var titleBtn = el.querySelector('[data-action="toggle-detail"]');
    var detail   = el.querySelector('.pub-detail');
    var caret    = el.querySelector('.pub-caret');
    titleBtn.addEventListener('click', function () {
      var open = detail.hasAttribute('hidden');
      if (open) { detail.removeAttribute('hidden'); el.classList.add('is-open'); caret.textContent = '−'; titleBtn.setAttribute('aria-expanded', 'true'); }
      else      { detail.setAttribute('hidden', '');     el.classList.remove('is-open'); caret.textContent = '+'; titleBtn.setAttribute('aria-expanded', 'false'); }
    });

    var bibBtn = el.querySelector('[data-action="toggle-bib"]');
    var bibBox = el.querySelector('.pub-bibtex');
    var pre    = bibBox.querySelector('pre');
    bibBtn.addEventListener('click', function () {
      if (!pre.textContent) pre.textContent = formatBib(p.raw);
      var visible = bibBox.classList.toggle('open');
      bibBtn.textContent = visible ? 'Hide BibTeX' : 'Show BibTeX';
    });
    return el;
  }

  function formatBib(entry) {
    var fields = Object.entries(entry.fields)
      .map(function (kv) { return '  ' + kv[0] + ' = {' + kv[1] + '}'; }).join(',\n');
    return '@' + entry.type + '{' + entry.key + ',\n' + fields + '\n}';
  }

  /* ============================================================
     Wiring
     ============================================================ */
  function init(opts) {
    opts = opts || {};
    // Pre-set initial type filter (so /reports.html can default to reports)
    if (opts.initialType)     STATE.type = opts.initialType;
    // Per-author scoping (used by member.html profile pages)
    if (opts.authorFilter)    STATE.authorFilter = opts.authorFilter;
    // Per-keyword scoping (used by project & research-area detail pages)
    if (opts.keywordFilter)   STATE.keywordFilter = opts.keywordFilter;
    // Override the list of highlighted author names
    if (opts.highlightAuthors) STATE.highlightAuthors = opts.highlightAuthors;

    var searchEl  = document.getElementById('pub-search');
    var yearSel   = document.getElementById('pub-year');
    var authorSel = document.getElementById('pub-author');
    var typeSel   = document.getElementById('pub-type');
    var areaSel   = document.getElementById('pub-area');

    if (searchEl)  searchEl.addEventListener('input',   function () { STATE.searchText = searchEl.value.trim(); applyFilters(); });
    if (yearSel)   yearSel.addEventListener('change',   function () { STATE.year   = yearSel.value;   applyFilters(); });
    if (authorSel) authorSel.addEventListener('change', function () { STATE.author = authorSel.value; applyFilters(); });
    if (typeSel)   typeSel.addEventListener('change',   function () { STATE.type   = typeSel.value;   applyFilters(); });
    if (areaSel)   areaSel.addEventListener('change',   function () { STATE.area   = areaSel.value;   applyFilters(); });

    document.querySelectorAll('.tab[data-pubfilter]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        STATE.type = tab.dataset.pubfilter;
        document.querySelectorAll('.tab[data-pubfilter]').forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', String(on));
        });
        if (typeSel) typeSel.value = STATE.type;
        render();
      });
    });

    loadAndRender(opts);
  }

  // Export
  window.ECSPubs = { init: init, isReportType: isReportType };
})();
