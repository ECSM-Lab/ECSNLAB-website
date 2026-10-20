/* =============================================================
   i18n.js - English / Spanish toggle
   English is the source language of the site. When the visitor picks
   Spanish (saved in localStorage as "scale-lang"), this script:
     1. swaps every interface string found in DICT below, matching on the
        element's visible English text (static HTML and JS-rendered
        content alike, via a MutationObserver);
     2. lets main.js replace JSON fields with their "<field>_es" version
        (e.g. "bio_short_es") when one exists.
   Anything without a translation simply stays in English.

   To translate a new string: add  "English text": "Texto en español"
   to DICT. Keys are the element's text with whitespace collapsed. If the
   element contains links or bold text, write the value as HTML (it must
   contain a tag) and the whole element is replaced. For an ambiguous
   string in static HTML, put data-es="..." on the element instead.
   Loaded by every page right after main.js.
   ============================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var LANG = root.lang === 'es' ? 'es' : 'en';
  var LANG_KEY = 'scale-lang';

  var DICT = {
    /* ---------- Header, footer, shared ---------- */
    'Home': 'Inicio',
    'About': 'Nosotros',
    'Research': 'Investigación',
    'People': 'Personas',
    'Team': 'Equipo',
    'Collaborators': 'Colaboradores',
    'Visiting': 'Visitantes',
    'Projects': 'Proyectos',
    'Publications': 'Publicaciones',
    'News': 'Noticias',
    'Opportunities': 'Oportunidades',
    'Contact': 'Contacto',
    'Reports': 'Informes',
    'Sections': 'Secciones',
    'Quick links': 'Enlaces rápidos',
    'Institutional': 'Institucional',
    'School of Industrial Engineering': 'Escuela de Ingeniería Industrial',
    'PhD in Industrial Engineering': 'Doctorado en Ingeniería Industrial',
    'Sustainable Climate Analysis & Energy Decision Lab, School of Industrial Engineering, Pontificia Universidad Católica de Valparaíso (PUCV), Valparaíso, Chile.':
      'Sustainable Climate Analysis & Energy Decision Lab, Escuela de Ingeniería Industrial, Pontificia Universidad Católica de Valparaíso (PUCV), Valparaíso, Chile.',
    'Open menu': 'Abrir menú',
    'Back to top': 'Volver arriba',
    'Switch to dark mode': 'Cambiar a modo oscuro',
    'Switch to light mode': 'Cambiar a modo claro',
    'Loading…': 'Cargando…',
    'Other': 'Otros',

    /* ---------- Page titles (browser tab) ---------- */
    'Research areas': 'Áreas de investigación',
    'Research area': 'Área de investigación',
    'Research topic': 'Tema de investigación',
    'Member': 'Integrante',
    'Project': 'Proyecto',
    'Visiting researchers': 'Investigadores visitantes',

    /* ---------- Home ---------- */
    'School of Industrial Engineering · PUCV': 'Escuela de Ingeniería Industrial · PUCV',
    'We combine climate and energy-systems modeling with decision science (optimization, simulation, and system dynamics) to help governments, utilities, and communities make better decisions for a sustainable, low-carbon future.':
      'Combinamos el modelamiento de sistemas climáticos y energéticos con las ciencias de la decisión (optimización, simulación y dinámica de sistemas) para ayudar a gobiernos, empresas de servicios y comunidades a tomar mejores decisiones hacia un futuro sostenible y bajo en carbono.',
    'Our mission': 'Nuestra misión',
    'From climate analysis to energy decisions': 'Del análisis climático a las decisiones energéticas',
    'We build quantitative tools (integrated assessment, mathematical optimization, and system-dynamics simulation) that turn climate and energy analysis into evidence for real-world decisions on decarbonization, energy security, and sustainable development.':
      'Desarrollamos herramientas cuantitativas (evaluación integrada, optimización matemática y simulación con dinámica de sistemas) que convierten el análisis climático y energético en evidencia para decisiones reales sobre descarbonización, seguridad energética y desarrollo sostenible.',
    'What we work on': 'En qué trabajamos',
    'Six interconnected lines of research, anchored in operations research and applied to energy and climate systems.':
      'Seis líneas de investigación interconectadas, basadas en la investigación de operaciones y aplicadas a sistemas energéticos y climáticos.',
    'All research areas': 'Todas las áreas de investigación',
    'In progress': 'En curso',
    'Active projects': 'Proyectos activos',
    'A selection of currently funded research lines.': 'Una selección de líneas de investigación con financiamiento vigente.',
    'All projects': 'Todos los proyectos',
    'Featured': 'Destacadas',
    'Selected publications': 'Publicaciones destacadas',
    "Curated highlights from the lab's bibliography.": 'Una selección de la bibliografía del laboratorio.',
    'All publications': 'Todas las publicaciones',
    'Lab life': 'Vida del laboratorio',
    'News & activities': 'Noticias y actividades',
    'All news': 'Todas las noticias',
    'View full profile': 'Ver perfil completo',
    'Explore area': 'Explorar área',
    'View full project': 'Ver proyecto completo',
    'participant': 'participante',
    'participants': 'participantes',
    'Read more': 'Leer más',
    'No news yet.': 'Aún no hay noticias.',
    'news': 'noticia',
    'event': 'evento',
    'workshop': 'taller',
    'conference': 'congreso',
    'award': 'adjudicación',
    'media': 'prensa',
    'national': 'nacional',
    'international': 'internacional',

    /* ---------- Research areas (titles appear as cards, tags, headings) ---------- */
    'Energy Sustainability & Policy': 'Sostenibilidad y política energética',
    'Power Systems & Energy Markets': 'Sistemas eléctricos y mercados de energía',
    'Global Climate Modeling': 'Modelamiento climático global',
    'Operations Research': 'Investigación de operaciones',
    'AI & Machine Learning': 'IA y aprendizaje automático',
    'Healthcare Systems': 'Sistemas de salud',
    'Energy & Climate Systems': 'Sistemas de energía y clima',

    /* ---------- About ---------- */
    'About the Lab': 'Sobre el laboratorio',
    'Sustainable Climate Analysis & Energy Decision Lab: climate and energy analysis for better decisions, at PUCV.':
      'Sustainable Climate Analysis & Energy Decision Lab: análisis climático y energético para mejores decisiones, en la PUCV.',
    'Mission': 'Misión',
    'Produce rigorous, decision-relevant knowledge on climate and energy systems, combining integrated assessment, mathematical optimization, and system-dynamics simulation to inform policy, planning, and investment for a sustainable and just transition.':
      'Generar conocimiento riguroso y útil para la toma de decisiones sobre sistemas climáticos y energéticos, combinando evaluación integrada, optimización matemática y simulación con dinámica de sistemas para orientar las políticas, la planificación y la inversión hacia una transición sostenible y justa.',
    'Vision': 'Visión',
    'To be a leading Latin American reference in climate and energy analysis for decision-making, training engineers and analysts who design evidence-based, equitable pathways towards a sustainable future.':
      'Ser un referente latinoamericano en análisis climático y energético para la toma de decisiones, formando ingenieros y analistas que diseñen trayectorias equitativas y basadas en evidencia hacia un futuro sostenible.',
    'What sets us apart. SCALE brings together two complementary modeling traditions (optimization and integrated assessment on one side, system dynamics and simulation on the other) and pairs them with direct policy engagement. Our work feeds into the IPCC, APEC, the Ministry of Energy and the Ministry of Environment of Chile, and a wide network of international partners.':
      '<strong>Lo que nos distingue.</strong> SCALE reúne dos tradiciones de modelamiento complementarias (optimización y evaluación integrada por un lado; dinámica de sistemas y simulación por otro) y las combina con una vinculación directa con las políticas públicas. Nuestro trabajo contribuye al IPCC, a APEC, a los Ministerios de Energía y del Medio Ambiente de Chile, y a una amplia red de socios internacionales.',
    'Our leaders': 'Dirección',
    'Lab leadership': 'Dirección del laboratorio',
    'Co-Directors of SCALE.': 'Codirectores de SCALE.',
    'What we do': 'Qué hacemos',
    'SCALE analyzes how climate and energy systems can change at the speed required by the Paris Agreement while remaining technically feasible, economically efficient, secure, and socially just, and translates that analysis into decision support. Our toolkit spans linear and mixed-integer programming, stochastic and bilevel optimization, mixed-complementarity equilibrium models, integrated-assessment models such as GCAM, and system-dynamics simulation of energy markets, policies, and security of supply. We are committed to open science and to training the next generation of energy and climate researchers.':
      'SCALE analiza cómo los sistemas climáticos y energéticos pueden transformarse a la velocidad que exige el Acuerdo de París sin dejar de ser técnicamente factibles, económicamente eficientes, seguros y socialmente justos, y traduce ese análisis en apoyo a la toma de decisiones. Nuestras herramientas abarcan programación lineal y entera mixta, optimización estocástica y binivel, modelos de equilibrio de complementariedad mixta, modelos de evaluación integrada como GCAM y simulación con dinámica de sistemas de mercados energéticos, políticas y seguridad de suministro. Estamos comprometidos con la ciencia abierta y con la formación de la próxima generación de investigadores en energía y clima.',
    'We collaborate closely with national and international institutions including the IPCC, APEC, the U.S. Department of Energy / PNNL, the SDEWES Centre, and a network of universities across the Americas, Europe, and Asia-Pacific.':
      'Colaboramos estrechamente con instituciones nacionales e internacionales, entre ellas el IPCC, APEC, el Departamento de Energía de EE. UU. / PNNL, el SDEWES Centre y una red de universidades de América, Europa y Asia-Pacífico.',
    'Explore our research': 'Conoce nuestra investigación',
    'Meet the team': 'Conoce al equipo',

    /* ---------- Research ---------- */
    'Six interconnected lines spanning energy, climate, optimization, and policy.':
      'Seis líneas interconectadas que abarcan energía, clima, optimización y políticas.',
    'Our research is organized around six core areas. Together they form an integrated program for studying energy and climate systems, from mathematical foundations in operations research to applied policy modeling at national and international scales.':
      'Nuestra investigación se organiza en torno a seis áreas centrales. En conjunto, forman un programa integrado para estudiar los sistemas energéticos y climáticos, desde los fundamentos matemáticos de la investigación de operaciones hasta el modelamiento aplicado de políticas a escala nacional e internacional.',

    /* ---------- People / team ---------- */
    'Our team': 'Nuestro equipo',
    'Co-directors, researchers, students, and alumni.': 'Codirectores, investigadores, estudiantes y alumni.',
    'SCALE brings together faculty, postdoctoral researchers, graduate and undergraduate students, and a network of national and international collaborators.':
      'SCALE reúne a académicos, investigadores postdoctorales, estudiantes de pregrado y posgrado, y una red de colaboradores nacionales e internacionales.',
    'SCALE brings together faculty, postdoctoral researchers, graduate and undergraduate students.':
      'SCALE reúne a académicos, investigadores postdoctorales y estudiantes de pregrado y posgrado.',
    'National and international research partners.': 'Socios de investigación nacionales e internacionales.',
    'SCALE works with a network of national and international collaborators across universities and research centers.':
      'SCALE trabaja con una red de colaboradores nacionales e internacionales en universidades y centros de investigación.',
    'Visiting scholars and exchange students.': 'Académicos visitantes y estudiantes de intercambio.',
    'Researchers and students who have joined SCALE through research stays and exchange programs.':
      'Investigadores y estudiantes que se han sumado a SCALE mediante estancias de investigación y programas de intercambio.',
    'Leadership': 'Dirección',
    'Researchers': 'Investigadores',
    'National Collaborators': 'Colaboradores nacionales',
    'International Collaborators': 'Colaboradores internacionales',
    'Visiting Scholars': 'Académicos visitantes',
    'Postdocs': 'Postdoctorados',
    'Former Postdocs': 'Ex postdoctorados',
    'PhD Students': 'Estudiantes de doctorado',
    "Master's Students": 'Estudiantes de magíster',
    'Undergraduate Students': 'Estudiantes de pregrado',
    'PhD Alumni': 'Alumni de doctorado',
    "Master's Alumni": 'Alumni de magíster',
    'Alumni · PhD Alumni': 'Alumni · Alumni de doctorado',
    "Alumni · Master's Alumni": 'Alumni · Alumni de magíster',
    'Researcher': 'Investigador/a',
    'Postdoctoral Researcher': 'Investigador/a postdoctoral',
    'PhD Student': 'Estudiante de doctorado',
    "Master's Student": 'Estudiante de magíster',
    'Undergraduate Student': 'Estudiante de pregrado',
    'Visiting Scholar': 'Académico/a visitante',
    'Former Postdoc': 'Ex postdoctorado',
    'Exchange Student': 'Estudiante de intercambio',
    'National Collaborator': 'Colaborador/a nacional',
    'International Collaborator': 'Colaborador/a internacional',
    'National Collaborator · PhD Alumni': 'Colaborador/a nacional · Alumni de doctorado',
    'PhD Alumna': 'Egresada de doctorado',
    'PhD Alumnus · Postdoctoral Researcher': 'Egresado de doctorado · Investigador postdoctoral',
    "Master's Alumna": 'Egresada de magíster',
    "Master's Alumnus": 'Egresado de magíster',
    'Former Postdoc · SCALE collaboration': 'Ex postdoctorado · Colaboración con SCALE',
    'Current PhD Student': 'Estudiante actual de doctorado',
    "Current Master's Student": 'Estudiante actual de magíster',
    'Current Undergraduate Student': 'Estudiante actual de pregrado',
    'View profile': 'Ver perfil',
    'Thesis:': 'Tesis:',
    'Now:': 'Actualmente:',

    /* ---------- Member profile ---------- */
    '← All team': '← Todo el equipo',
    'Affiliation:': 'Afiliación:',
    'Email:': 'Correo:',
    'Email': 'Correo electrónico',
    'Biography': 'Biografía',
    'Research topics': 'Temas de investigación',
    'Thesis': 'Tesis',
    'Education': 'Formación académica',
    'Role:': 'Rol:',
    'View project': 'Ver proyecto',
    'Opportunities & supervised topics': 'Oportunidades y temas supervisados',
    'Supervisors': 'Profesores guía',
    'Current position': 'Cargo actual',
    'Profiles': 'Perfiles',
    'ANID profile': 'Perfil ANID',
    'Personal website': 'Sitio web personal',
    'Peer-reviewed': 'Con revisión por pares',
    'Reports & technical documents': 'Informes y documentos técnicos',
    'Search title, venue, keyword…': 'Buscar por título, revista, palabra clave…',
    'Team member not found. ← Back to team': 'Integrante no encontrado. <a href="team.html">← Volver al equipo</a>',

    /* ---------- Projects ---------- */
    'Projects portfolio': 'Portafolio de proyectos',
    'Funded research at national and international scales.': 'Investigación financiada a escala nacional e internacional.',
    'Active': 'Activo',
    'Completed': 'Finalizado',
    'All': 'Todos',
    'Under review': 'En evaluación',
    'No projects in this view.': 'No hay proyectos en esta vista.',
    '← All projects': '← Todos los proyectos',
    'Abstract': 'Resumen',
    'Objectives': 'Objetivos',
    'Methodology': 'Metodología',
    'Results': 'Resultados',
    'Related publications': 'Publicaciones relacionadas',
    "Publications matching this project's topics.": 'Publicaciones relacionadas con los temas de este proyecto.',
    'Funding': 'Financiamiento',
    'Amount:': 'Monto:',
    'Team to be announced.': 'Equipo por confirmar.',
    'Filter…': 'Filtrar…',
    'Principal Investigator': 'Investigador/a principal',
    'Co-Principal Investigator': 'Co-investigador/a principal',
    'Co-Investigator': 'Co-investigador/a',
    'PhD Researcher': 'Investigador/a doctoral',
    'Project not found. ← Back to projects': 'Proyecto no encontrado. <a href="projects.html">← Volver a proyectos</a>',

    /* ---------- Research area detail ---------- */
    '← All research areas': '← Todas las áreas de investigación',
    'About this area': 'Sobre esta área',
    'Methodologies, tools & models': 'Metodologías, herramientas y modelos',
    'Related projects': 'Proyectos relacionados',
    'Team working on this area': 'Equipo que trabaja en esta área',
    "Publications matching this area's topics.": 'Publicaciones relacionadas con los temas de esta área.',
    'Keywords': 'Palabras clave',
    'Browse': 'Explorar',
    'See open thesis topics connected to this research area, or browse all publications.':
      'Revisa los <a href="opportunities.html">temas de tesis abiertos</a> vinculados a esta área de investigación, o explora todas las <a href="publications.html">publicaciones</a>.',
    'No projects linked yet.': 'Aún no hay proyectos vinculados.',
    'No team members linked yet.': 'Aún no hay integrantes vinculados.',
    'Research area not found. ← Back': 'Área de investigación no encontrada. <a href="research.html">← Volver</a>',

    /* ---------- Opportunities & topics ---------- */
    'Student supervision & opportunities': 'Supervisión de estudiantes y oportunidades',
    'Thesis topics, research positions, and how to join the lab.': 'Temas de tesis, cargos de investigación y cómo integrarse al laboratorio.',
    'Why join SCALE?': '¿Por qué unirse a SCALE?',
    'Working with us means contributing to research that shapes national and international energy policy, publishing in high-impact journals, building an international network, and gaining hands-on experience with advanced modeling, programming, and policy analysis.':
      'Trabajar con nosotros significa contribuir a investigación que influye en la política energética nacional e internacional, publicar en revistas de alto impacto, construir una red internacional y adquirir experiencia práctica en modelamiento avanzado, programación y análisis de políticas.',
    'Real-world impact: work on problems that inform IPCC, APEC, and Chilean energy policy.':
      '<strong>Impacto real</strong>: trabaja en problemas que informan al IPCC, a APEC y a la política energética chilena.',
    'International network: exchanges with the University of Zagreb, University of Liège, USF, ISB, and others.':
      '<strong>Red internacional</strong>: intercambios con la Universidad de Zagreb, la Universidad de Lieja, USF, ISB y otras.',
    'High-impact publications: Q1 journals like Energy (IF 9.0); the lab has +100 peer-reviewed publications.':
      '<strong>Publicaciones de alto impacto</strong>: revistas Q1 como <em>Energy</em> (IF 9,0); el laboratorio tiene +100 publicaciones con revisión por pares.',
    'Comprehensive training: advanced modeling (GCAM, PyPSA, MCP, bilevel, system dynamics), programming, and conference presentations.':
      '<strong>Formación integral</strong>: modelamiento avanzado (GCAM, PyPSA, MCP, binivel, dinámica de sistemas), programación y presentaciones en congresos.',
    'Who we are looking for': 'A quién buscamos',
    'Students of Industrial Engineering, Mathematics, or related fields.': 'Estudiantes de Ingeniería Industrial, Matemáticas o áreas afines.',
    'Interest in energy systems, complex systems, or public policy.': 'Interés en sistemas energéticos, sistemas complejos o políticas públicas.',
    'Drive to publish and make an international impact.': 'Motivación por publicar y generar impacto internacional.',
    "Candidates for Master's or PhD programs in Industrial Engineering at PUCV.": 'Postulantes a los programas de Magíster o Doctorado en Ingeniería Industrial de la PUCV.',
    'For inquiries, write to monica.castaneda@pucv.cl or felipe.feijoo@pucv.cl.':
      'Para consultas, escribe a <a href="mailto:monica.castaneda@pucv.cl">monica.castaneda@pucv.cl</a> o <a href="mailto:felipe.feijoo@pucv.cl">felipe.feijoo@pucv.cl</a>.',
    'Thesis topics': 'Temas de tesis',
    'Suggested research topics': 'Temas de investigación sugeridos',
    "A curated list of thesis topics for prospective PhD and Master's students. Each topic includes objectives, methods, expected outputs, and supervisor.":
      'Una selección de temas de tesis para futuros estudiantes de doctorado y magíster. Cada tema incluye objetivos, métodos, resultados esperados y supervisor.',
    'All topics': 'Todos los temas',
    'PhD': 'Doctorado',
    "Master's": 'Magíster',
    'Master’s': 'Magíster',
    'Open': 'Abierto',
    'Taken': 'Asignado',
    'Example': 'Ejemplo',
    'Supervisor:': 'Profesor guía:',
    'Co-supervisor:': 'Profesor co-guía:',
    'View topic': 'Ver tema',
    'No topics in this view.': 'No hay temas en esta vista.',
    '← All topics': '← Todos los temas',
    'Open for students': 'Abierto a estudiantes',
    'Currently taken': 'Actualmente asignado',
    'Example topic': 'Tema de ejemplo',
    'Extended description': 'Descripción extendida',
    'Motivation & research problem': 'Motivación y problema de investigación',
    'Suggested methodology': 'Metodología sugerida',
    'Expected outcomes': 'Resultados esperados',
    'Recommended profile': 'Perfil recomendado',
    'Student level': 'Nivel del estudiante',
    'Supervision': 'Supervisión',
    'Apply': 'Postular',
    'Topic not found. ← Back': 'Tema no encontrado. <a href="opportunities.html">← Volver</a>',

    /* ---------- Contact ---------- */
    'Contact us': 'Contáctanos',
    'Get in touch with SCALE.': 'Ponte en contacto con SCALE.',
    'Address': 'Dirección',
    'Co-Director: Prof. Monica Castañeda, monica.castaneda@pucv.cl Co-Director: Prof. Felipe Feijoo, felipe.feijoo@pucv.cl':
      '<strong>Codirectora:</strong> Prof. Monica Castañeda, <a href="mailto:monica.castaneda@pucv.cl">monica.castaneda@pucv.cl</a><br/>' +
      '<strong>Codirector:</strong> Prof. Felipe Feijoo, <a href="mailto:felipe.feijoo@pucv.cl">felipe.feijoo@pucv.cl</a>',
    'Prospective students': 'Futuros estudiantes',
    "If you are interested in joining the lab as a PhD or Master's student, see our opportunities page for thesis topics and application guidance, then write to the co-directors with a brief CV and research statement.":
      'Si te interesa integrarte al laboratorio como estudiante de doctorado o magíster, revisa nuestra <a href="opportunities.html">página de oportunidades</a> para ver temas de tesis y orientaciones de postulación, y luego escribe a los codirectores con un breve CV y una declaración de intereses de investigación.',
    'Media & collaboration': 'Prensa y colaboración',
    'For media inquiries, collaborations, or invitations to give talks, please email the co-directors.':
      'Para consultas de prensa, colaboraciones o invitaciones a dar charlas, escribe a los codirectores.',
    'Find us on the map': 'Encuéntranos en el mapa',
    'The PUCV School of Industrial Engineering is located in central Valparaíso, Chile. The campus is accessible from the Valparaíso bus and metro stations.':
      'La Escuela de Ingeniería Industrial de la PUCV se ubica en el centro de Valparaíso, Chile. Se puede llegar al campus desde las estaciones de bus y de metro de Valparaíso.',
    'Open in Google Maps': 'Abrir en Google Maps',
    'Institutional links': 'Enlaces institucionales',
    'PUCV main site': 'Sitio web de la PUCV',

    /* ---------- News ---------- */
    'Workshops, conferences, awards, and lab news.': 'Talleres, congresos, reconocimientos y noticias del laboratorio.',

    /* ---------- Publications & reports ---------- */
    'Peer-reviewed journals, conference proceedings, book chapters, and reports.':
      'Revistas con revisión por pares, actas de congresos, capítulos de libros e informes.',
    'Click a title to expand the abstract, copy the BibTeX, and find the DOI. Names of Felipe Feijoo and Monica Castañeda are highlighted automatically.':
      'Haz clic en un título para ver el resumen, copiar el BibTeX y encontrar el DOI. Los nombres de <strong>Felipe Feijoo</strong> y <strong>Monica Castañeda</strong> se destacan automáticamente.',
    'Peer-Reviewed Journals': 'Revistas con revisión por pares',
    'Reports & Technical Documents': 'Informes y documentos técnicos',
    'Reports and Technical Documents': 'Informes y documentos técnicos',
    'Articles, conference proceedings, and book chapters indexed as peer-reviewed academic work.':
      'Artículos, actas de congresos y capítulos de libros indexados como trabajo académico con revisión por pares.',
    'Technical reports, policy briefs, and commissioned work for APEC, the IPCC, ministries, and international panels.':
      'Informes técnicos, minutas de política y trabajos encargados para APEC, el IPCC, ministerios y paneles internacionales.',
    'Policy briefs, technical reports, and commissioned work for ministries, APEC, and the IPCC.':
      'Minutas de política, informes técnicos y trabajos encargados para ministerios, APEC y el IPCC.',
    'Search title, author, venue, keyword…': 'Buscar por título, autor, revista, palabra clave…',
    'Search title, author, institution…': 'Buscar por título, autor, institución…',
    'Search publications': 'Buscar publicaciones',
    'Search reports': 'Buscar informes',
    'Filter by year': 'Filtrar por año',
    'Filter by author': 'Filtrar por autor',
    'Filter by research area': 'Filtrar por área de investigación',
    'Filter by type': 'Filtrar por tipo',
    'All years': 'Todos los años',
    'All authors': 'Todos los autores',
    'All areas': 'Todas las áreas',
    'All types': 'Todos los tipos',
    'Loading publications…': 'Cargando publicaciones…',
    'Loading reports…': 'Cargando informes…',
    'Journal article': 'Artículo de revista',
    'Conference paper': 'Artículo de congreso',
    'Book chapter': 'Capítulo de libro',
    'Book': 'Libro',
    'Technical report': 'Informe técnico',
    'Brief / Misc': 'Minuta / otros',
    'Unpublished': 'No publicado',
    'Conference': 'Congreso',
    'Chapter / Book': 'Capítulo / libro',
    'Brief': 'Minuta',
    'Abstract.': 'Resumen.',
    'Abstract not yet added.': 'Resumen aún no disponible.',
    'Open paper →': 'Abrir artículo →',
    'Show BibTeX': 'Mostrar BibTeX',
    'Hide BibTeX': 'Ocultar BibTeX',
    'No peer-reviewed entries match the current filters.': 'Ninguna publicación con revisión por pares coincide con los filtros.',
    'No reports match the current filters.': 'Ningún informe coincide con los filtros.'
  };

  /* Strings with a variable part, matched on a single text node. */
  var MONTHS = { Jan: 'ene', Feb: 'feb', Mar: 'mar', Apr: 'abr', May: 'may', Jun: 'jun',
                 Jul: 'jul', Aug: 'ago', Sep: 'sept', Oct: 'oct', Nov: 'nov', Dec: 'dic' };
  var PATTERNS = [
    [/^(\d+) of (\d+) shown$/, '$1 de $2 visibles'],
    [/^Team · (\d+) participants?$/, 'Equipo · $1 participantes'],
    [/^Graduated (\d{4})$/, 'Egreso: $1'],
    [/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4})$/, function (m, mo, y) { return MONTHS[mo] + ' ' + y; }]
  ];

  var norm = function (s) { return String(s).replace(/\s+/g, ' ').trim(); };
  var D = {};
  Object.keys(DICT).forEach(function (k) { D[norm(k)] = DICT[k]; });
  var isHtml = function (v) { return /<[a-z]/i.test(v); };

  function lookup(text) {
    var key = norm(text);
    if (!key) return null;
    if (Object.prototype.hasOwnProperty.call(D, key)) return D[key];
    for (var i = 0; i < PATTERNS.length; i++) {
      if (PATTERNS[i][0].test(key)) return key.replace(PATTERNS[i][0], PATTERNS[i][1]);
    }
    return null;
  }

  var SKIP = { SCRIPT: 1, STYLE: 1, CODE: 1, PRE: 1, TEXTAREA: 1, NOSCRIPT: 1 };
  var ATTRS = ['placeholder', 'aria-label', 'title'];

  function translateText(node) {
    var v = lookup(node.nodeValue);
    if (v == null || isHtml(v)) return;
    var m = /^(\s*)[\s\S]*?(\s*)$/.exec(node.nodeValue);
    node.nodeValue = m[1] + v + m[2];
  }

  function translateEl(el) {
    if (SKIP[el.tagName] || el.hasAttribute('data-no-i18n')) return;
    ATTRS.forEach(function (a) {
      if (!el.hasAttribute(a)) return;
      var v = lookup(el.getAttribute(a));
      if (v != null && !isHtml(v)) el.setAttribute(a, v);
    });
    if (el.hasAttribute('data-es')) { el.textContent = el.getAttribute('data-es'); return; }
    if (!el.children.length) {
      var v = lookup(el.textContent);
      if (v != null) { if (isHtml(v)) el.innerHTML = v; else el.textContent = v; return; }
    } else if (el.textContent.length < 1500) {
      // Elements with inline markup are only replaced by an HTML entry.
      var h = D[norm(el.textContent)];
      if (h != null && isHtml(h)) { el.innerHTML = h; return; }
    }
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3) translateText(n);
      else if (n.nodeType === 1) translateEl(n);
    });
  }

  function translateTitle() {
    var parts = document.title.split(' | ');
    var out = parts.map(function (p) { var v = lookup(p); return v != null && !isHtml(v) ? v : p; }).join(' | ');
    if (out !== document.title) document.title = out;
  }

  /* ----- Language toggle button (next to the theme toggle) ----- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang-toggle';
    btn.setAttribute('data-no-i18n', '');
    btn.textContent = LANG === 'es' ? 'EN' : 'ES';
    var label = LANG === 'es' ? 'View in English' : 'Ver en español';
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
    btn.setAttribute('lang', LANG === 'es' ? 'en' : 'es');
    nav.insertBefore(btn, document.getElementById('theme-toggle') || document.getElementById('nav-toggle') || null);
    btn.addEventListener('click', function () {
      try { localStorage.setItem(LANG_KEY, LANG === 'es' ? 'en' : 'es'); } catch (e) {}
      location.reload();
    });
  }

  window.SCALE_I18N = {
    lang: LANG,
    t: function (s) { if (LANG !== 'es') return s; var v = lookup(s); return v == null ? s : v; }
  };

  if (LANG !== 'es') return;

  translateEl(document.body);
  translateTitle();

  // Translate content added later by the renderers (and the title they set).
  var observer = new MutationObserver(function (records) {
    observer.disconnect();
    records.forEach(function (r) {
      if (r.type === 'attributes') {
        var v = lookup(r.target.getAttribute(r.attributeName) || '');
        if (v != null && !isHtml(v)) r.target.setAttribute(r.attributeName, v);
        return;
      }
      Array.prototype.forEach.call(r.addedNodes, function (n) {
        if (n.nodeType === 1) translateEl(n);
        else if (n.nodeType === 3 && n.parentNode) {
          var p = n.parentNode;
          if (p.nodeType === 1 && !p.children.length && !SKIP[p.tagName] && p.tagName !== 'TITLE') translateEl(p);
          else translateText(n);
        }
      });
    });
    translateTitle();
    observe();
  });
  function observe() {
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ATTRS });
  }
  observe();
})();
