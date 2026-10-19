/* ECS renderers — build 20260427 */
console.log("[ECS] renderers.js build 20260427 loaded — " + new Date().toISOString());
/* =============================================================
   renderers.js — render data-driven content from JSON files
   Functions defined under window.ECSRender:
     team, projects, researchAreas, news, supervision, leadership,
     stats, memberDetail, projectDetail, areaDetail
   Each renderer accepts (containerSel, opts) and resolves with the
   rendered data so callers can chain.
   ============================================================= */
(function () {
  'use strict';

  var ESC = (window.ECS && window.ECS.escapeHtml) || function (s) { return String(s == null ? '' : s); };
  var $   = function (sel, root) { return (root || document).querySelector(sel); };

  function bold(node) { if (window.ECS && window.ECS.boldLeaders) window.ECS.boldLeaders(node); }

  /* If a fetch fails, show a visible error in the container instead of a
     silent empty block. Linked to diagnose.html so the user can see what's
     happening. */
  function showError(sel, file, err) {
    var el = document.querySelector(sel);
    if (!el) return;
    el.innerHTML =
      '<p class="pub-empty" style="border-left:3px solid #c53030;padding-left:12px;color:#c53030">' +
      '<strong>No se pudo cargar <code>' + file + '</code>.</strong><br/>' +
      (err && err.message ? '<small>' + err.message + '</small><br/>' : '') +
      'Abre <a href="diagnose.html">diagnose.html</a> para ver qué está fallando, ' +
      'o revisa que el servidor esté corriendo en la carpeta <code>site/</code>.' +
      '</p>';
    if (window.console) console.error('[ECS] Failed to load', file, err);
  }

  /* Image fallback: if a <img class="..."> fails to load, swap it for a
     monogram <div>. Set on every avatar/leader/profile photo. The onerror
     attribute calls the global ECS.imgFail() helper so we don't have to
     build messy escaped HTML strings. */
  function initialsOf(name) {
    return (name || '?').trim().split(/\s+/).slice(0, 2)
      .map(function (s) { return s[0]; }).join('').toUpperCase();
  }
  // Expose a tiny helper used from inline onerror=
  window.ECS = window.ECS || {};
  window.ECS.imgFail = function (img, cls) {
    var div = document.createElement('div');
    div.className = (cls || img.className) + ' ' + (cls || img.className).split(' ')[0] + '-fallback';
    div.setAttribute('aria-hidden', 'true');
    div.textContent = initialsOf(img.alt);
    img.parentNode.replaceChild(div, img);
  };

  function avatar(name, photoSrc) {
    var initials = initialsOf(name);
    if (photoSrc) {
      return '<img class="member-photo" src="' + ESC(photoSrc) + '" alt="' + ESC(name) +
             '" loading="lazy" onerror="ECS.imgFail(this, \'member-photo\')" />';
    }
    return '<div class="member-photo member-photo-fallback" aria-hidden="true">' + ESC(initials) + '</div>';
  }
  function profilePhoto(name, photoSrc) {
    var initials = initialsOf(name);
    if (photoSrc) {
      return '<img class="profile-photo" src="' + ESC(photoSrc) + '" alt="' + ESC(name) +
             '" onerror="ECS.imgFail(this, \'profile-photo\')" />';
    }
    return '<div class="profile-photo profile-photo-fallback">' + ESC(initials) + '</div>';
  }
  function leaderPhoto(m) {
    var initials = initialsOf(m.name);
    if (m.photo) {
      return '<img class="leader-photo" src="' + ESC(m.photo) + '" alt="' + ESC(m.name) +
             '" onerror="ECS.imgFail(this, \'leader-photo\')" />';
    }
    return '<div class="leader-photo leader-photo-fallback" aria-hidden="true">' + ESC(initials) + '</div>';
  }

  /* ============================================================
     Stats strip
     ============================================================ */
  function renderStats(sel) {
    return window.ECS.fetchJSON('data/lab.json').then(function (lab) {
      var el = $(sel);
      if (!el || !lab.stats) return lab;
      el.innerHTML = lab.stats.map(function (s) {
        return '<div class="stat"><div class="stat-value">' + ESC(s.value) + '</div>' +
               '<div class="stat-label">' + ESC(s.label) + '</div></div>';
      }).join('');
      return lab;
    }).catch(function (err) { showError(sel, 'data/lab.json', err); });
  }

  /* ============================================================
     Leadership block (Director + Co-Director)
     ============================================================ */
  function renderLeadership(sel) {
    return window.ECS.fetchJSON('data/team.json').then(function (data) {
      var el = $(sel); if (!el) return;
      var leaders = (data.members || []).filter(function (m) {
        return m.role === 'Director' || m.role === 'Co-Director';
      });
      el.innerHTML = leaders.map(function (m) {
        return '<article class="leader">' +
                  leaderPhoto(m) +
                  '<div>' +
                    '<p class="leader-role">' + ESC(m.role) + '</p>' +
                    '<h3 class="leader-name">' + ESC(m.name) +
                      (m.credentials ? ', <span class="soft">' + ESC(m.credentials) + '</span>' : '') +
                    '</h3>' +
                    '<p class="leader-title">' + ESC(m.title || m.affiliation || '') + '</p>' +
                    '<p class="leader-bio">' + ESC(m.bio_short || '') + '</p>' +
                    '<a class="readmore" href="member.html?id=' + encodeURIComponent(m.id) + '">View full profile</a>' +
                  '</div>' +
                '</article>';
      }).join('');
      bold(el);
    }).catch(function (err) { showError(sel, 'data/team.json', err); });
  }

  /* ============================================================
     Research areas
     ============================================================ */
  function renderResearchAreas(sel, limit) {
    return window.ECS.fetchJSON('data/research-areas.json').then(function (data) {
      var el = $(sel); if (!el) return;
      var areas = (data.areas || []).slice(0, limit || 99);
      el.innerHTML = areas.map(function (a) {
        // Clean card: title + tagline + short description preview only.
        // (Paper count and methods are shown on the detail page.)
        var descPreview = a.description
          ? '<p class="area-desc">' + ESC(truncate(a.description, 220)) + '</p>'
          : '';
        return '<a class="card area-card" href="research-area.html?id=' + encodeURIComponent(a.id) + '">' +
                 '<h4>' + ESC(a.title) + '</h4>' +
                 '<p class="area-tagline">' + ESC(a.tagline || '') + '</p>' +
                 descPreview +
                 '<div class="card-foot"><span class="readmore">Explore area</span></div>' +
               '</a>';
      }).join('');
    }).catch(function (err) { showError(sel, 'data/research-areas.json', err); });
  }

  /* ============================================================
     Projects
     ============================================================ */
  var PROJECTS_STATE = { items: [], filter: 'active' };
  function renderProjects(sel, opts) {
    opts = opts || {};
    return window.ECS.fetchJSON('data/projects.json').then(function (data) {
      var el = $(sel); if (!el) return data;
      PROJECTS_STATE.items = (data.projects || []).slice();
      PROJECTS_STATE.items.sort(function (a, b) {
        return startYear(b.period) - startYear(a.period);
      });
      if (opts.featured) {
        var featured = PROJECTS_STATE.items.filter(function (p) { return p.status === 'active'; }).slice(0, opts.featured);
        renderProjectGrid(el, featured);
      } else {
        renderProjectGrid(el, filterProjects(PROJECTS_STATE.filter));
      }
      document.querySelectorAll('.tab[data-projfilter]').forEach(function (tab) {
        tab.addEventListener('click', function () {
          PROJECTS_STATE.filter = tab.dataset.projfilter;
          document.querySelectorAll('.tab[data-projfilter]').forEach(function (t) {
            var on = t === tab;
            t.classList.toggle('is-active', on);
            t.setAttribute('aria-selected', String(on));
          });
          renderProjectGrid(el, filterProjects(PROJECTS_STATE.filter));
        });
      });
      return data;
    }).catch(function (err) { showError(sel, 'data/projects.json', err); });
  }
  function startYear(period) {
    if (!period) return 0;
    var m = String(period).match(/\d{4}/); return m ? parseInt(m[0], 10) : 0;
  }
  function filterProjects(f) {
    return PROJECTS_STATE.items.filter(function (p) { return f === 'all' ? true : p.status === f; });
  }
  function renderProjectGrid(el, items) {
    if (!items.length) { el.innerHTML = '<p class="pub-empty">No projects in this view.</p>'; return; }
    el.innerHTML = items.map(function (p) {
      var statusPill =
        p.status === 'active'    ? '<span class="status status-active">Active</span>' :
        p.status === 'completed' ? '<span class="status status-done">Completed</span>' :
        p.status === 'review'    ? '<span class="status status-review">Under review</span>' : '';
      // Concise abstract = tagline. Expanded preview = first ~220 chars of
      // abstract, so the card already shows substance before clicking through.
      var abstractPreview = p.abstract
        ? '<p class="card-abstract">' + ESC(truncate(p.abstract, 240)) + '</p>'
        : '';
      var keywordChips = (p.keywords && p.keywords.length)
        ? '<div class="pub-keywords" style="margin-top:10px">' +
            p.keywords.slice(0, 4).map(function (k) { return '<span class="kw">' + ESC(k) + '</span>'; }).join('') +
          '</div>'
        : '';
      var teamCount = (p.team || []).length;
      var teamSummary = teamCount
        ? '<p class="card-team-count"><strong>' + teamCount + '</strong> ' + (teamCount === 1 ? 'participant' : 'participants') + '</p>'
        : '';
      return '<a class="card project-card" href="project.html?id=' + encodeURIComponent(p.id) + '">' +
             '  <div class="card-head-top">' +
             '    <div class="card-meta">' +
             '      <span class="tag">' + ESC(p.period || '') + '</span>' +
             (p.scope ? ' <span class="tag tag-neutral">' + ESC(p.scope) + '</span>' : '') +
             '    </div>' + statusPill +
             '  </div>' +
             '  <h4>' + ESC(p.title) + '</h4>' +
             '  <p class="card-src">' + ESC(p.source || '') + (p.role ? ' · ' + ESC(p.role) : '') + '</p>' +
             '  <p class="card-tagline">' + ESC(p.tagline || '') + '</p>' +
                abstractPreview +
                keywordChips +
                teamSummary +
             '  <div class="card-foot"><span class="readmore">View full project</span></div>' +
             '</a>';
    }).join('');
    bold(el);
  }
  function truncate(str, n) {
    if (!str) return '';
    if (str.length <= n) return str;
    var cut = str.slice(0, n);
    var last = cut.lastIndexOf(' ');
    return (last > n * 0.6 ? cut.slice(0, last) : cut) + '…';
  }

  /* ============================================================
     Team
     ============================================================ */
  var ROLE_ORDER = [
    'Director', 'Co-Director', 'Researcher', 'Postdoctoral Researcher',
    'PhD Student', "Master's Student", 'Undergraduate Student',
    'Visiting Scholar', 'Alumni', 'Former Postdoc'
  ];

  function renderTeam(sel) {
    return window.ECS.fetchJSON('data/team.json').then(function (data) {
      var el = $(sel); if (!el) return data;
      var members = data.members || [];
      var groups = {};
      members.forEach(function (m) {
        var key = m.role || 'Other';
        if (!groups[key]) groups[key] = [];
        groups[key].push(m);
      });
      var html = '';
      // Director + Co-Director get the rich leadership card (same as home).
      var leaders = (groups['Director'] || []).concat(groups['Co-Director'] || []);
      if (leaders.length) {
        html += '<section class="team-section">' +
                  '<h3 class="sub-title">Leadership</h3>' +
                  '<div class="leadership">' +
                    leaders.map(function (m) {
                      return '<article class="leader">' +
                                leaderPhoto(m) +
                                '<div>' +
                                  '<p class="leader-role">' + ESC(m.role) + '</p>' +
                                  '<h3 class="leader-name">' + ESC(m.name) +
                                    (m.credentials ? ', <span class="soft">' + ESC(m.credentials) + '</span>' : '') +
                                  '</h3>' +
                                  '<p class="leader-title">' + ESC(m.title || m.affiliation || '') + '</p>' +
                                  '<p class="leader-bio">' + ESC(m.bio_short || '') + '</p>' +
                                  '<a class="readmore" href="member.html?id=' + encodeURIComponent(m.id) + '">View full profile</a>' +
                                '</div>' +
                              '</article>';
                    }).join('') +
                  '</div>' +
                '</section>';
      }
      // Then everyone else with the regular grid.
      ROLE_ORDER.forEach(function (role) {
        if (role === 'Director' || role === 'Co-Director') return; // handled above
        if (!groups[role] || !groups[role].length) return;
        if (role === 'Researcher') {
          html += teamSection('National Collaborators',
                              groups[role].filter(function (m) { return m.group === 'national'; }));
          html += teamSection('International Collaborators',
                              groups[role].filter(function (m) { return m.group === 'international'; }));
          html += teamSection('Researchers',
                              groups[role].filter(function (m) { return !m.group; }));
        } else if (role === 'Alumni') {
          var phd = groups[role].filter(function (m) { return /PhD/i.test(m.subrole || ''); });
          var msc = groups[role].filter(function (m) { return /Master/i.test(m.subrole || ''); });
          html += teamSection('PhD Alumni', phd);
          html += teamSection("Master's Alumni", msc);
        } else if (role === 'Postdoctoral Researcher') {
          html += teamSection('Postdocs', groups[role]);
        } else if (role === 'Former Postdoc') {
          html += teamSection('Former Postdocs', groups[role]);
        } else {
          var label = role;
          if (/Student/.test(role)) label = role + 's';
          html += teamSection(label, groups[role]);
        }
      });
      el.innerHTML = html;
      bold(el);
      return data;
    }).catch(function (err) { showError(sel, 'data/team.json', err); });
  }
  function teamSection(title, members) {
    if (!members || !members.length) return '';
    return '<section class="team-section">' +
             '<h3 class="sub-title">' + ESC(title) + '</h3>' +
             '<div class="cards">' +
                members.map(memberCard).join('') +
             '</div>' +
           '</section>';
  }
  function memberCard(m) {
    // For students and alumni, surface the thesis topic + supervisor on the
    // card so visitors get useful info before clicking through.
    var isStudentOrAlum = /Student|Alumni/i.test(m.role || '');
    var thesisLine = '';
    if (isStudentOrAlum && m.thesis) {
      thesisLine = '<p class="member-thesis"><strong>Thesis:</strong> ' + ESC(truncate(m.thesis, 110)) + '</p>';
    }
    var positionLine = '';
    if (m.role === 'Alumni' && m.current_position && !/^TODO/i.test(m.current_position)) {
      positionLine = '<p class="member-now"><strong>Now:</strong> ' + ESC(m.current_position) + '</p>';
    }
    var topicsLine = '';
    if (!isStudentOrAlum && m.research_topics && m.research_topics.length) {
      topicsLine = '<p class="member-topics">' + ESC(m.research_topics.slice(0, 2).join(' · ')) + '</p>';
    }
    return '<a class="card member-card" href="member.html?id=' + encodeURIComponent(m.id) + '">' +
              avatar(m.name, m.photo) +
              '<h4>' + ESC(m.name) + '</h4>' +
              '<p class="member-role">' + ESC(m.subrole || m.title || m.role) + '</p>' +
              (m.affiliation ? '<p class="member-affil">' + ESC(m.affiliation) + '</p>' : '') +
              thesisLine +
              positionLine +
              topicsLine +
              '<div class="card-foot"><span class="readmore">View profile</span></div>' +
           '</a>';
  }

  /* ============================================================
     News
     ============================================================ */
  function renderNews(sel, limit) {
    return window.ECS.fetchJSON('data/news.json').then(function (data) {
      var el = $(sel); if (!el) return data;
      var items = (data.items || []).slice().sort(function (a, b) {
        return String(b.date || '').localeCompare(String(a.date || ''));
      });
      if (limit) items = items.slice(0, limit);
      if (!items.length) { el.innerHTML = '<p class="pub-empty">No news yet.</p>'; return; }
      el.innerHTML = items.map(function (n) {
        var date = n.date ? formatNewsDate(n.date) : '';
        var kindBadge = n.kind ? '<span class="tag tag-neutral">' + ESC(n.kind) + '</span>' : '';
        return '<article class="news-item">' +
                 '<div class="news-date">' + ESC(date) + '<br/>' + kindBadge + '</div>' +
                 '<div>' +
                   '<h4 class="news-title">' + ESC(n.title) + '</h4>' +
                   '<p class="news-summary">' + ESC(n.summary || '') + '</p>' +
                   (n.link ? '<a class="readmore" href="' + ESC(n.link) + '" target="_blank" rel="noopener">Read more</a>' : '') +
                 '</div>' +
               '</article>';
      }).join('');
      bold(el);
    }).catch(function (err) { showError(sel, 'data/news.json', err); });
  }
  function formatNewsDate(d) {
    var m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(d);
    if (!m) return d;
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var y = m[1], mo = m[2] ? months[parseInt(m[2], 10) - 1] : '';
    return (mo ? mo + ' ' : '') + y;
  }

  /* ============================================================
     Supervision (thesis topic ideas)
     ============================================================ */
  var SUP_STATE = { items: [], filter: 'all' };
  function renderSupervision(sel) {
    return window.ECS.fetchJSON('data/supervision.json').then(function (data) {
      var el = $(sel); if (!el) return data;
      SUP_STATE.items = []
        .concat((data.phd    || []).map(function (x) { return Object.assign({}, x, { level: 'PhD' }); }))
        .concat((data.master || []).map(function (x) { return Object.assign({}, x, { level: 'Master' }); }));
      drawSup(el);
      document.querySelectorAll('.tab[data-supfilter]').forEach(function (tab) {
        tab.addEventListener('click', function () {
          SUP_STATE.filter = tab.dataset.supfilter;
          document.querySelectorAll('.tab[data-supfilter]').forEach(function (t) {
            var on = t === tab; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', String(on));
          });
          drawSup(el);
        });
      });
    }).catch(function (err) { showError(sel, 'data/supervision.json', err); });
  }
  function drawSup(el) {
    var f = SUP_STATE.filter;
    var list = SUP_STATE.items.filter(function (t) {
      if (f === 'all')    return true;
      if (f === 'phd')    return /PhD/i.test(t.level);
      if (f === 'master') return /Master/i.test(t.level);
      return true;
    });
    if (!list.length) { el.innerHTML = '<p class="pub-empty">No topics in this view.</p>'; return; }
    el.innerHTML = list.map(function (t) {
      var levelPill = /PhD/i.test(t.level)
        ? '<span class="pill deg-phd">PhD</span>'
        : '<span class="pill deg-msc">Master’s</span>';
      var statusPill = '';
      if (t.status === 'open')    statusPill = '<span class="status status-active">Open</span>';
      else if (t.status === 'taken')   statusPill = '<span class="status status-done">Taken</span>';
      else if (t.status === 'example') statusPill = '<span class="status status-example">Example</span>';
      // Each topic card is now a link to its dedicated topic.html?id= page.
      return '<a class="card" href="topic.html?id=' + encodeURIComponent(t.id) + '">' +
                 '<div class="card-head-top">' +
                   '<div class="card-meta">' + levelPill + (t.area ? ' <span class="tag">' + ESC(t.area) + '</span>' : '') + '</div>' +
                    statusPill +
                 '</div>' +
                 '<h4>' + ESC(t.title) + '</h4>' +
                 '<p>' + ESC(t.summary || '') + '</p>' +
                 (t.supervisor ? '<p class="card-src"><strong>Supervisor:</strong> ' + ESC(t.supervisor) + '</p>' : '') +
                 '<div class="card-foot"><span class="readmore">View topic</span></div>' +
               '</a>';
    }).join('');
    bold(el);
  }

  /* ============================================================
     Featured publications (home / about)
     ============================================================ */
  function renderSelectedPapers(sel) {
    return window.ECS.fetchText('publications.bib').then(function (txt) {
      var el = $(sel); if (!el) return;
      var entries = [];
      var rxSelected = /selected\s*=\s*\{?yes\}?/i;
      var startRx = /@\w+\{/g, m;
      while ((m = startRx.exec(txt)) !== null) {
        var bodyStart = m.index;
        var depth = 0;
        for (var i = bodyStart; i < txt.length; i++) {
          if (txt[i] === '{') depth++;
          else if (txt[i] === '}') {
            depth--;
            if (depth === 0) {
              var slice = txt.slice(bodyStart, i + 1);
              if (rxSelected.test(slice)) entries.push(slice);
              startRx.lastIndex = i + 1;
              break;
            }
          }
        }
      }
      if (!entries.length) {
        el.innerHTML = '<p class="pub-empty">Mark a few entries with <code>selected = {yes}</code> in <code>publications.bib</code> to feature them here.</p>';
        return;
      }
      el.innerHTML = '<ol class="bullets">' + entries.slice(0, 6).map(function (e) {
        var title  = (e.match(/title\s*=\s*\{([\s\S]*?)\}\s*,/) || [])[1] || '';
        var author = (e.match(/author\s*=\s*\{([\s\S]*?)\}\s*,/) || [])[1] || '';
        var year   = (e.match(/year\s*=\s*\{?(\d{4})/) || [])[1] || '';
        var venue  = (e.match(/journal\s*=\s*\{([\s\S]*?)\}\s*,/) || [])[1] || (e.match(/booktitle\s*=\s*\{([\s\S]*?)\}\s*,/) || [])[1] || '';
        var doi    = (e.match(/doi\s*=\s*\{([\s\S]*?)\}\s*[,}\n]/) || [])[1] || '';
        author = author.replace(/[{}]/g, '').replace(/\s+and\s+/g, ', ');
        return '<li><strong>' + ESC(title.replace(/[{}]/g,'')) + '</strong>' +
               '<br/><span style="font-size:0.9em;color:var(--ink-soft)">' + ESC(author) + ' · <em>' + ESC(venue) + '</em>' + (year ? ', ' + ESC(year) : '') + '</span>' +
               (doi ? ' · <a href="https://doi.org/' + ESC(doi) + '" target="_blank" rel="noopener">doi:' + ESC(doi) + '</a>' : '') +
               '</li>';
      }).join('') + '</ol>';
      bold(el);
    }).catch(function () {
      var el = $(sel); if (el) el.innerHTML = '<p class="pub-empty">Selected papers will appear here when <code>publications.bib</code> can be loaded.</p>';
    });
  }

  /* ============================================================
     Member detail page (member.html?id=...)
     Pulls the member from team.json and cross-references:
       - projects:        any project where team[].member_id == m.id
                          OR any project listed in m.projects[]
       - publications:    BibTeX entries matching m.bibtex_name
                          (default: regex on the member's name)
                          — uses the same parser/renderer as
                            publications.html via window.ECSPubs.
     ============================================================ */
  function renderMemberDetail(rootSel) {
    var id = window.ECS.qsParam('id');
    if (!id) return;
    return window.ECS.fetchJSON('data/team.json').then(function (data) {
      var m = (data.members || []).find(function (x) { return x.id === id; });
      var root = $(rootSel); if (!root) return;
      if (!m) { root.innerHTML = '<section class="section"><div class="container"><p class="pub-empty">Team member not found. <a href="team.html">← Back to team</a></p></div></section>'; return; }

      return Promise.all([
        window.ECS.fetchJSON('data/projects.json').catch(function () { return { projects: [] }; }),
        window.ECS.fetchJSON('data/supervision.json').catch(function () { return { phd: [], master: [] }; })
      ]).then(function (results) {
        var allProjects = results[0].projects || [];
        var allTopics = []
          .concat((results[1].phd    || []).map(function (x) { return Object.assign({}, x, { level: 'PhD' }); }))
          .concat((results[1].master || []).map(function (x) { return Object.assign({}, x, { level: 'Master' }); }));
        // Opportunities where this person supervises (by name or by id)
        var nameRx = new RegExp((m.name || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        var memberOpportunities = allTopics.filter(function (t) {
          return (t.supervisor && nameRx.test(t.supervisor)) ||
                 (t.co_supervisor && nameRx.test(t.co_supervisor));
        });
        // A project belongs to this member if:
        //   - their id is listed in project.team[].member_id, OR
        //   - their id is in m.projects (manual override array, optional)
        var memberProjectIds = (m.projects || []).slice();
        var projects = allProjects.filter(function (p) {
          if (memberProjectIds.indexOf(p.id) >= 0) return true;
          return (p.team || []).some(function (t) { return t.member_id === m.id; });
        });

        document.title = m.name + ' — SCALE';

        var statusBadge = '';
        if (m.role === 'Alumni')                      statusBadge = '<span class="tag tag-neutral">' + ESC(m.subrole || 'Alumni') + '</span>';
        else if (/Student/i.test(m.role || ''))       statusBadge = '<span class="status status-active">Current ' + ESC(m.role) + '</span>';

        var supervisorsHtml = '';
        if (m.supervisors && m.supervisors.length) {
          var supNames = m.supervisors.map(function (sid) {
            var sup = (data.members || []).find(function (x) { return x.id === sid; });
            return sup ? '<a href="member.html?id=' + sup.id + '">' + ESC(sup.name) + '</a>' : ESC(sid);
          }).join(', ');
          supervisorsHtml = '<div class="aside-block"><h4>Supervisors</h4><p>' + supNames + '</p></div>';
        }
        var emailHtml = m.email ? '<div class="aside-block"><h4>Email</h4><p><a href="mailto:' + ESC(m.email) + '">' + ESC(m.email) + '</a></p></div>' : '';

        // Profile / external links — the JSON 'links' object can contain any
        // of: scholar, orcid, github, linkedin, website, anid, cv, twitter.
        var linksHtml = '';
        if (m.links && Object.keys(m.links).length) {
          var labels = {
            scholar: 'Google Scholar', anid: 'ANID profile', github: 'GitHub',
            cv: 'CV (PDF)', orcid: 'ORCID', linkedin: 'LinkedIn',
            website: 'Personal website', twitter: 'Twitter / X'
          };
          var lis = Object.keys(m.links).map(function (k) {
            var url = m.links[k]; if (!url) return '';
            var external = !/^assets\//.test(url);
            return '<li><a href="' + ESC(url) + '"' + (external ? ' target="_blank" rel="noopener"' : '') + '>' + ESC(labels[k] || k) + '</a></li>';
          }).filter(Boolean).join('');
          if (lis) linksHtml = '<div class="aside-block"><h4>Profiles</h4><ul>' + lis + '</ul></div>';
        }

        var educationHtml = (m.education && m.education.length)
          ? '<h3>Education</h3><ul class="bullets">' + m.education.map(function (e) { return '<li>' + ESC(e) + '</li>'; }).join('') + '</ul>'
          : '';
        var topicsHtml = (m.research_topics && m.research_topics.length)
          ? '<h3>Research topics</h3><ul class="bullets">' + m.research_topics.map(function (t) { return '<li>' + ESC(t) + '</li>'; }).join('') + '</ul>'
          : '';
        var keywordsHtml = (m.keywords && m.keywords.length)
          ? '<div class="pub-keywords" style="margin-top:8px">' + m.keywords.map(function (k) { return '<span class="kw">' + ESC(k) + '</span>'; }).join('') + '</div>'
          : '';
        var thesisHtml = m.thesis
          ? '<h3>Thesis</h3>' +
            '<p><strong>' + ESC(m.thesis) + '</strong></p>' +
            (m.thesis_summary ? '<p>' + ESC(m.thesis_summary) + '</p>' : '') +
            (m.degree ? '<p style="color:var(--ink-muted)">' + ESC(m.degree) + (m.year ? ' · ' + ESC(m.year) : '') + '</p>' : '')
          : '';
        var bioHtml = (m.bio_long || m.bio_short)
          ? '<h3>Biography</h3><p>' + ESC(m.bio_long || m.bio_short) + '</p>'
          : '';
        var positionHtml = m.current_position
          ? '<div class="aside-block"><h4>Current position</h4><p>' + ESC(m.current_position) + (m.year ? '<br/><span style="color:var(--ink-muted)">Graduated ' + ESC(m.year) + '</span>' : '') + '</p></div>'
          : '';

        // Projects
        var projectsHtml = projects.length
          ? '<h3>Projects</h3><div class="cards cols-2">' + projects.map(function (p) {
              var role = (p.team || []).find(function (t) { return t.member_id === m.id; });
              return '<a class="card project-card" href="project.html?id=' + encodeURIComponent(p.id) + '">' +
                     '<div class="card-head-top"><span class="tag">' + ESC(p.period || '') + '</span>' +
                     (p.status === 'active' ? '<span class="status status-active">Active</span>' : '<span class="status status-done">Completed</span>') + '</div>' +
                     '<h4>' + ESC(p.title) + '</h4>' +
                     (role && role.role ? '<p class="card-src"><strong>Role:</strong> ' + ESC(role.role) + '</p>' : '') +
                     '<p>' + ESC(p.tagline || '') + '</p>' +
                     '<div class="card-foot"><span class="readmore">View project</span></div></a>';
            }).join('') + '</div>'
          : '';

        // Opportunities supervised by this person
        var opportunitiesHtml = memberOpportunities.length
          ? '<h3>Opportunities &amp; supervised topics</h3><div class="cards cols-2">' + memberOpportunities.map(function (t) {
              var levelPill = /PhD/i.test(t.level) ? '<span class="pill deg-phd">PhD</span>' : '<span class="pill deg-msc">Master’s</span>';
              return '<a class="card" href="topic.html?id=' + encodeURIComponent(t.id) + '">' +
                     '<div class="card-head-top"><div class="card-meta">' + levelPill +
                     (t.area ? ' <span class="tag">' + ESC(t.area) + '</span>' : '') + '</div></div>' +
                     '<h4>' + ESC(t.title) + '</h4><p>' + ESC(t.summary || '') + '</p>' +
                     '<div class="card-foot"><span class="readmore">View topic</span></div></a>';
            }).join('') + '</div>'
          : '';

        // Render the page shell
        root.innerHTML =
          '<section class="detail-hero"><div class="container">' +
            '<p class="breadcrumb"><a href="team.html">← All team</a></p>' +
            '<div class="profile-grid">' +
              profilePhoto(m.name, m.photo) +
              '<div>' +
                '<p class="profile-eyebrow">' + ESC(m.role || '') + (m.subrole ? ' · ' + ESC(m.subrole) : '') + '</p>' +
                '<h1 class="profile-name">' + ESC(m.name) + '</h1>' +
                '<p class="profile-title">' + ESC(m.title || m.affiliation || '') + '</p>' +
                '<div class="profile-meta">' +
                  (m.affiliation && m.title !== m.affiliation ? '<span><strong>Affiliation:</strong> ' + ESC(m.affiliation) + '</span>' : '') +
                  (m.email ? '<span><strong>Email:</strong> <a href="mailto:' + ESC(m.email) + '">' + ESC(m.email) + '</a></span>' : '') +
                  (statusBadge ? '<span>' + statusBadge + '</span>' : '') +
                '</div>' +
                (m.bio_short ? '<p>' + ESC(m.bio_short) + '</p>' : '') +
              '</div>' +
            '</div>' +
          '</div></section>' +

          '<section class="section"><div class="container">' +
            '<div class="detail-body">' +
              '<div>' +
                bioHtml +
                topicsHtml + keywordsHtml +
                thesisHtml +
                educationHtml +
                projectsHtml +
                opportunitiesHtml +

                /* Publications block — populated below by ECSPubs.init() if
                   the member has a bibtex_name defined. */
                (m.bibtex_name ? (
                  '<h3 id="member-pubs">Publications</h3>' +
                  '<p class="section-sub" style="margin-bottom:14px">' +
                    'Publications where <strong>' + ESC(m.name) + '</strong> appears as an author, ' +
                    'pulled automatically from <code>publications.bib</code> and <code>reports.bib</code>.' +
                  '</p>' +
                  '<div class="pub-filters" role="region" aria-label="Filters">' +
                  '  <input type="search" id="pub-search" placeholder="Search title, venue, keyword…" />' +
                  '  <select id="pub-year"><option value="all">All years</option></select>' +
                  '  <span class="pub-count" id="pub-count" aria-live="polite"></span>' +
                  '</div>' +
                  '<div class="pub-subsection" id="pub-subsection-journals">' +
                  '  <h4 class="sub-title" style="margin-top:8px">Peer-reviewed</h4>' +
                  '  <div id="pub-list-journals" class="pub-list"><p class="loading">Loading…</p></div>' +
                  '</div>' +
                  '<div class="pub-subsection" id="pub-subsection-reports">' +
                  '  <h4 class="sub-title">Reports &amp; technical documents</h4>' +
                  '  <div id="pub-list-reports" class="pub-list"></div>' +
                  '</div>'
                ) : '') +
              '</div>' +
              '<aside>' +
                emailHtml + supervisorsHtml + positionHtml + linksHtml +
              '</aside>' +
            '</div>' +
          '</div></section>';
        bold(root);

        // If this member has publications, kick off the publications engine
        // pre-filtered to entries where they appear as an author.
        if (m.bibtex_name && window.ECSPubs && window.ECSPubs.init) {
          window.ECSPubs.init({
            initialType: 'all',
            authorFilter: m.bibtex_name,
            highlightAuthors: ['Felipe Feijoo', 'Monica Castañeda', m.bibtex_name]
          });
        }
      });
    });
  }

  /* ============================================================
     Project detail page (project.html?id=...)
     ============================================================ */
  function renderProjectDetail(rootSel) {
    var id = window.ECS.qsParam('id');
    if (!id) return;
    return Promise.all([
      window.ECS.fetchJSON('data/projects.json'),
      window.ECS.fetchJSON('data/team.json'),
      window.ECS.fetchJSON('data/research-areas.json').catch(function () { return { areas: [] }; })
    ]).then(function (res) {
      var p = (res[0].projects || []).find(function (x) { return x.id === id; });
      var members = res[1].members || [];
      var areas   = res[2].areas   || [];
      var root = $(rootSel); if (!root) return;
      if (!p) { root.innerHTML = '<section class="section"><div class="container"><p class="pub-empty">Project not found. <a href="projects.html">← Back to projects</a></p></div></section>'; return; }
      document.title = p.title + ' — SCALE';
      function memberLink(mid, fallbackName) {
        var mm = members.find(function (x) { return x.id === mid; });
        if (mm) return '<a href="member.html?id=' + mm.id + '">' + ESC(mm.name) + '</a>';
        return ESC(fallbackName || mid);
      }
      var teamHtml = (p.team || []).map(function (t) {
        return '<li>' + memberLink(t.member_id, t.name) + (t.role ? ' · <span style="color:var(--ink-muted)">' + ESC(t.role) + '</span>' : '') + '</li>';
      }).join('') || '<li><em>Team to be announced.</em></li>';

      var areaTags = (p.research_areas || []).map(function (aid) {
        var a = areas.find(function (x) { return x.id === aid; });
        return a ? '<a class="tag" href="research-area.html?id=' + a.id + '">' + ESC(a.title) + '</a>' : '';
      }).join(' ');
      var statusPill = p.status === 'active'
        ? '<span class="status status-active">Active</span>'
        : (p.status === 'completed' ? '<span class="status status-done">Completed</span>' : '');

      var objectivesHtml = (p.objectives && p.objectives.length)
        ? '<h3>Objectives</h3><ul class="bullets">' + p.objectives.map(function (o) { return '<li>' + ESC(o) + '</li>'; }).join('') + '</ul>'
        : '';
      var methodologyHtml = p.methodology ? '<h3>Methodology</h3><p>' + ESC(p.methodology) + '</p>' : '';
      var resultsHtml     = p.results     ? '<h3>Results</h3><p>' + ESC(p.results) + '</p>'     : '';
      var keywordsHtml = (p.keywords && p.keywords.length)
        ? '<div class="pub-keywords" style="margin-top:18px">' + p.keywords.map(function (k) { return '<span class="kw">' + ESC(k) + '</span>'; }).join('') + '</div>'
        : '';

      // Publications block — only added if project has keywords AND
      // the bibtex engine is loaded.
      var pubsBlock = '';
      if (p.keywords && p.keywords.length && window.ECSPubs && window.ECSPubs.init) {
        pubsBlock =
          '<h3 id="publications">Related publications</h3>' +
          '<p class="section-sub" style="margin-bottom:14px">Publications matching this project\'s topics, pulled from <code>publications.bib</code> and <code>reports.bib</code>.</p>' +
          '<div class="pub-filters" role="region"><input type="search" id="pub-search" placeholder="Filter…"/><select id="pub-year"><option value="all">All years</option></select><span class="pub-count" id="pub-count"></span></div>' +
          '<div class="pub-subsection" id="pub-subsection-journals"><div id="pub-list-journals" class="pub-list"><p class="loading">Loading…</p></div></div>' +
          '<div class="pub-subsection" id="pub-subsection-reports"><div id="pub-list-reports" class="pub-list"></div></div>';
      }

      root.innerHTML =
        '<section class="detail-hero"><div class="container">' +
          '<p class="breadcrumb"><a href="projects.html">← All projects</a></p>' +
          '<div class="card-meta" style="margin-bottom:14px">' + (p.period ? '<span class="tag">' + ESC(p.period) + '</span> ' : '') + (areaTags || '') + ' ' + statusPill + '</div>' +
          '<h1 class="profile-name">' + ESC(p.title) + '</h1>' +
          '<p class="profile-title">' + ESC(p.tagline || '') + '</p>' +
        '</div></section>' +
        '<section class="section"><div class="container"><div class="detail-body">' +
          '<div>' +
            (p.abstract ? '<h3>Abstract</h3><p>' + ESC(p.abstract) + '</p>' : '') +
            objectivesHtml + methodologyHtml + resultsHtml + keywordsHtml +
            pubsBlock +
          '</div>' +
          '<aside>' +
            '<div class="aside-block"><h4>Funding</h4><p>' + ESC(p.source || '—') + '</p>' +
            (p.funding_institution ? '<p style="font-size:0.85rem;color:var(--ink-muted);margin-top:6px">' + ESC(p.funding_institution) + '</p>' : '') +
            (p.amount ? '<p style="margin-top:6px"><strong>Amount:</strong> ' + ESC(p.amount) + '</p>' : '') +
            (p.role ? '<p style="margin-top:6px"><strong>Role:</strong> ' + ESC(p.role) + '</p>' : '') +
            '</div>' +
            '<div class="aside-block" id="team"><h4>Team · ' + (p.team || []).length + ' participants</h4><ul>' + teamHtml + '</ul></div>' +
          '</aside>' +
        '</div></div></section>';
      bold(root);

      // Kick off publications engine scoped to project keywords
      if (p.keywords && p.keywords.length && window.ECSPubs && window.ECSPubs.init) {
        window.ECSPubs.init({
          initialType: 'all',
          keywordFilter: p.keywords
        });
      }
    });
  }

  /* ============================================================
     Research area detail page (research-area.html?id=...)
     ============================================================ */
  function renderAreaDetail(rootSel) {
    var id = window.ECS.qsParam('id');
    if (!id) return;
    return Promise.all([
      window.ECS.fetchJSON('data/research-areas.json'),
      window.ECS.fetchJSON('data/projects.json').catch(function () { return { projects: [] }; }),
      window.ECS.fetchJSON('data/team.json').catch(function () { return { members: [] }; })
    ]).then(function (res) {
      var a = (res[0].areas || []).find(function (x) { return x.id === id; });
      var allProjects = res[1].projects || [];
      var allMembers  = res[2].members  || [];
      var root = $(rootSel); if (!root) return;
      if (!a) { root.innerHTML = '<section class="section"><div class="container"><p class="pub-empty">Research area not found. <a href="research.html">← Back</a></p></div></section>'; return; }
      document.title = a.title + ' — SCALE';

      var areaProjects = allProjects.filter(function (p) {
        return (p.research_areas || []).indexOf(a.id) >= 0 || (a.projects || []).indexOf(p.id) >= 0;
      });
      var areaPeople = (a.people || []).map(function (pid) {
        return allMembers.find(function (m) { return m.id === pid; });
      }).filter(Boolean);

      var methodsHtml = (a.methods || []).map(function (m) { return '<span class="kw">' + ESC(m) + '</span>'; }).join('');
      var keywordsHtml = (a.keywords || []).map(function (k) { return '<span class="kw">' + ESC(k) + '</span>'; }).join('');

      var projectsHtml = areaProjects.length
        ? '<div class="cards">' + areaProjects.map(function (p) {
            return '<a class="card project-card" href="project.html?id=' + encodeURIComponent(p.id) + '">' +
                   '<div class="card-head-top"><span class="tag">' + ESC(p.period || '') + '</span>' +
                   (p.status === 'active' ? '<span class="status status-active">Active</span>' : '<span class="status status-done">Completed</span>') + '</div>' +
                   '<h4>' + ESC(p.title) + '</h4><p>' + ESC(p.tagline || '') + '</p>' +
                   '<div class="card-foot"><span class="readmore">View project</span></div></a>';
          }).join('') + '</div>'
        : '<p class="pub-empty">No projects linked yet.</p>';

      var peopleHtml = areaPeople.length
        ? '<div class="cards">' + areaPeople.map(memberCard).join('') + '</div>'
        : '<p class="pub-empty">No team members linked yet.</p>';

      root.innerHTML =
        '<section class="detail-hero"><div class="container">' +
          '<p class="breadcrumb"><a href="research.html">← All research areas</a></p>' +
          '<p class="profile-eyebrow">Research area</p>' +
          '<h1 class="profile-name">' + ESC(a.title) + '</h1>' +
          '<p class="profile-title">' + ESC(a.tagline || '') + '</p>' +
        '</div></section>' +
        '<section class="section"><div class="container"><div class="detail-body">' +
          '<div>' +
            '<h3>About this area</h3><p>' + ESC(a.description || '') + '</p>' +
            (methodsHtml ? '<h3>Methodologies, tools &amp; models</h3><div class="pub-keywords">' + methodsHtml + '</div>' : '') +
            '<h3>Related projects</h3>' + projectsHtml +
            '<h3>Team working on this area</h3>' + peopleHtml +
            // Publications block (uses the BibTeX engine, scoped to area keywords)
            (a.keywords && a.keywords.length && window.ECSPubs ? (
              '<h3 id="publications">Related publications</h3>' +
              '<p class="section-sub" style="margin-bottom:14px">Publications matching this area\'s topics, pulled from <code>publications.bib</code> and <code>reports.bib</code>.</p>' +
              '<div class="pub-filters" role="region"><input type="search" id="pub-search" placeholder="Filter…"/><select id="pub-year"><option value="all">All years</option></select><span class="pub-count" id="pub-count"></span></div>' +
              '<div class="pub-subsection" id="pub-subsection-journals"><div id="pub-list-journals" class="pub-list"><p class="loading">Loading…</p></div></div>' +
              '<div class="pub-subsection" id="pub-subsection-reports"><div id="pub-list-reports" class="pub-list"></div></div>'
            ) : '') +
          '</div>' +
          '<aside>' +
            (keywordsHtml ? '<div class="aside-block"><h4>Keywords</h4><div class="pub-keywords">' + keywordsHtml + '</div></div>' : '') +
            '<div class="aside-block"><h4>Browse</h4><p>See <a href="opportunities.html">open thesis topics</a> connected to this research area, or browse all <a href="publications.html">publications</a>.</p></div>' +
          '</aside>' +
        '</div></div></section>';
      bold(root);
      // Kick off publications scoped to area keywords
      if (a.keywords && a.keywords.length && window.ECSPubs && window.ECSPubs.init) {
        window.ECSPubs.init({
          initialType: 'all',
          keywordFilter: a.keywords
        });
      }
    });
  }

  /* ============================================================
     Suggested research topic detail (topic.html?id=...)
     ============================================================ */
  function renderTopicDetail(rootSel) {
    var id = window.ECS.qsParam('id');
    if (!id) return;
    return Promise.all([
      window.ECS.fetchJSON('data/supervision.json'),
      window.ECS.fetchJSON('data/team.json').catch(function () { return { members: [] }; })
    ]).then(function (res) {
      var data = res[0], members = res[1].members || [];
      var allTopics = []
        .concat((data.phd    || []).map(function (x) { return Object.assign({}, x, { level: 'PhD' }); }))
        .concat((data.master || []).map(function (x) { return Object.assign({}, x, { level: 'Master' }); }));
      var t = allTopics.find(function (x) { return x.id === id; });
      var root = $(rootSel); if (!root) return;
      if (!t) { root.innerHTML = '<section class="section"><div class="container"><p class="pub-empty">Topic not found. <a href="opportunities.html">← Back</a></p></div></section>'; return; }
      document.title = t.title + ' — SCALE';

      var levelPill = /PhD/i.test(t.level)
        ? '<span class="pill deg-phd">PhD</span>'
        : '<span class="pill deg-msc">Master’s</span>';
      var statusPill = '';
      if (t.status === 'open')         statusPill = '<span class="status status-active">Open for students</span>';
      else if (t.status === 'taken')   statusPill = '<span class="status status-done">Currently taken</span>';
      else if (t.status === 'example') statusPill = '<span class="status status-example">Example topic</span>';

      var objectivesHtml = (t.objectives && t.objectives.length)
        ? '<h3>Objectives</h3><ul class="bullets">' + t.objectives.map(function (o) { return '<li>' + ESC(o) + '</li>'; }).join('') + '</ul>'
        : '';
      var methodsHtml = (t.methods && t.methods.length)
        ? '<h3>Suggested methodology</h3><div class="pub-keywords">' + t.methods.map(function (m) { return '<span class="kw">' + ESC(m) + '</span>'; }).join('') + '</div>'
        : '';
      var motivationHtml = t.motivation
        ? '<h3>Motivation &amp; research problem</h3><p>' + ESC(t.motivation) + '</p>'
        : '';
      var outputsHtml = t.outputs ? '<h3>Expected outcomes</h3><p>' + ESC(t.outputs) + '</p>' : '';
      var profileHtml = t.profile ? '<div class="aside-block"><h4>Recommended profile</h4><p>' + ESC(t.profile) + '</p></div>' : '';
      var levelBlock = '<div class="aside-block"><h4>Student level</h4><p>' + (/PhD/i.test(t.level) ? 'PhD' : "Master's") + (t.level_extra ? ' · ' + ESC(t.level_extra) : '') + '</p></div>';
      var supBlock = (t.supervisor || t.co_supervisor)
        ? '<div class="aside-block"><h4>Supervision</h4>' +
          (t.supervisor    ? '<p><strong>Supervisor:</strong> ' + ESC(t.supervisor) + '</p>' : '') +
          (t.co_supervisor ? '<p style="margin-top:6px"><strong>Co-supervisor:</strong> ' + ESC(t.co_supervisor) + '</p>' : '') +
          '</div>'
        : '';
      var areaBlock = t.area
        ? '<div class="aside-block"><h4>Research area</h4><p>' + ESC(t.area) + '</p></div>'
        : '';
      // Apply to the topic's supervisors; fall back to the lab director.
      var emails = [t.supervisor, t.co_supervisor].map(function (name) {
        var m = name && members.find(function (x) { return x.name === name; });
        return m && m.email;
      }).filter(Boolean);
      if (!emails.length) {
        var dir = members.find(function (x) { return x.role === 'Director'; });
        if (dir && dir.email) emails.push(dir.email);
      }
      var contactBlock = '<div class="aside-block"><h4>Apply</h4><p>If interested, write to ' +
        emails.map(function (e) { return '<a href="mailto:' + ESC(e) + '">' + ESC(e) + '</a>'; }).join(' and ') +
        ' with a brief CV and research statement.</p></div>';

      root.innerHTML =
        '<section class="detail-hero"><div class="container">' +
          '<p class="breadcrumb"><a href="opportunities.html">← All topics</a></p>' +
          '<div class="card-meta" style="margin-bottom:14px">' + levelPill + ' ' +
            (t.area ? '<span class="tag">' + ESC(t.area) + '</span> ' : '') + statusPill + '</div>' +
          '<h1 class="profile-name">' + ESC(t.title) + '</h1>' +
          '<p class="profile-title">' + ESC(t.summary || '') + '</p>' +
        '</div></section>' +
        '<section class="section"><div class="container"><div class="detail-body">' +
          '<div>' +
            (t.description ? '<h3>Extended description</h3><p>' + ESC(t.description) + '</p>' : '') +
            motivationHtml +
            objectivesHtml +
            methodsHtml +
            outputsHtml +
          '</div>' +
          '<aside>' +
            levelBlock + supBlock + areaBlock + profileHtml + contactBlock +
          '</aside>' +
        '</div></div></section>';
      bold(root);
    }).catch(function (err) { showError(rootSel, 'data/supervision.json', err); });
  }

  /* Make supervision cards link to topic.html */
  // (Override drawSup output by extending rendering below — handled inline in
  // the section above. We re-wire the card to be a link-card.)

  // Export
  window.ECSRender = {
    stats: renderStats,
    leadership: renderLeadership,
    researchAreas: renderResearchAreas,
    projects: renderProjects,
    team: renderTeam,
    news: renderNews,
    supervision: renderSupervision,
    selectedPapers: renderSelectedPapers,
    memberDetail: renderMemberDetail,
    projectDetail: renderProjectDetail,
    areaDetail: renderAreaDetail,
    topicDetail: renderTopicDetail
  };
})();
