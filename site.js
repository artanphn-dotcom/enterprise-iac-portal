// site.js - shared UI helpers

function initTheme() {
  const themeToggleBtn = document.getElementById('btn-theme-toggle');
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  if (!themeToggleBtn || !sunIcon || !moonIcon) return;

  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeUI(savedTheme, sunIcon, moonIcon);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeUI(newTheme, sunIcon, moonIcon);
  });
}

function updateThemeUI(theme, sunIcon, moonIcon) {
  if (theme === 'light') {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  } else {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  }
}

function initSidebarToggle() {
  const menuToggleBtn = document.getElementById('btn-menu-toggle');
  const sidebar = document.getElementById('sidebar');
  if (!menuToggleBtn || !sidebar) return;

  const sync = () => {
    menuToggleBtn.style.display = window.innerWidth <= 1024 ? 'flex' : 'none';
    if (window.innerWidth > 1024) sidebar.classList.remove('mobile-open');
  };

  sync();
  window.addEventListener('resize', sync);
  menuToggleBtn.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
}

function initTopicNavigation() {
  const sidebarMenu = document.querySelector('.sidebar-menu');
  const contentInner = document.querySelector('.content-inner');
  if (!sidebarMenu || !contentInner) return;

  const chapters = Array.from(contentInner.querySelectorAll('h2'));
  if (!chapters.length) return;

  sidebarMenu.innerHTML = '';

  chapters.forEach((heading, index) => {
    if (!heading.id) heading.id = `sec-${index + 1}`;

    const chapterItem = document.createElement('div');
    chapterItem.className = 'menu-chapter-title open';
    chapterItem.innerHTML = `
      <span class="menu-chapter-num">${index + 1}</span>
      <span class="menu-chapter-text">${heading.textContent}</span>
      <span class="menu-chapter-arrow">▸</span>
    `;
    chapterItem.addEventListener('click', () => {
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      chapterItem.classList.add('active');
      chapterItem.classList.add('open');
      sidebarMenu.querySelectorAll('.menu-chapter-title').forEach(item => {
        if (item !== chapterItem) item.classList.remove('active');
      });
    });
    sidebarMenu.appendChild(chapterItem);

    const subHeadings = [];
    let next = heading.nextElementSibling;
    while (next && next.tagName !== 'H2') {
      if (next.tagName === 'H3') subHeadings.push(next);
      next = next.nextElementSibling;
    }

    if (subHeadings.length) {
      const subList = document.createElement('div');
      subList.className = 'menu-sub-list';
      subHeadings.forEach((subHeading, subIndex) => {
        if (!subHeading.id) subHeading.id = `${heading.id}-sub-${subIndex + 1}`;
        const subItem = document.createElement('div');
        subItem.className = 'menu-sub-item';
        subItem.innerHTML = `<span>${subHeading.textContent}</span>`;
        subItem.addEventListener('click', () => subHeading.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        subList.appendChild(subItem);
      });
      sidebarMenu.appendChild(subList);
    }
  });

  const updateActive = () => {
    let current = chapters[0];
    chapters.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      if (rect.top <= 140) current = heading;
    });

    Array.from(sidebarMenu.querySelectorAll('.menu-chapter-title')).forEach((item, idx) => {
      item.classList.toggle('active', chapters[idx] === current);
    });
  };

  document.querySelector('.content-area')?.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
}

function createCodeContainer(title, lang, code, secId) {
  const wrap = document.createElement('div');
  wrap.className = 'code-container';
  wrap.dataset.cmd = secId;
  wrap.innerHTML = `
    <div class="code-header">
      <div class="code-title">${title}</div>
      <span class="code-lang-badge">${lang}</span>
    </div>
    <pre><code>${code}</code></pre>
  `;
  return wrap;
}

function createExampleContainer(title, lang, code, steps, secId) {
  const wrap = document.createElement('div');
  wrap.className = 'callout callout-info topic-example';
  wrap.dataset.example = secId;

  const list = Array.isArray(steps)
    ? steps.map((s) => `<li>${s}</li>`).join('')
    : '';

  wrap.innerHTML = `
    <div class="callout-title" style="display:flex; align-items:center; justify-content:space-between; gap:0.75rem;">
      <span>${title}</span>
      <button type="button" class="btn btn-outline btn-copy-example">Copy Example</button>
    </div>
    <div class="code-container" style="margin-top:0.75rem;">
      <div class="code-header">
        <div class="code-title">Example Configuration</div>
        <span class="code-lang-badge">${lang}</span>
      </div>
      <pre><code>${code}</code></pre>
    </div>
    <div class="callout-content" style="margin-top:0.75rem;">
      <strong>Step-by-step explanation:</strong>
      <ol style="margin-top:0.5rem; padding-left:1.1rem;">
        ${list}
      </ol>
    </div>
  `;

  const copyBtn = wrap.querySelector('.btn-copy-example');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const ok = await copyTextToClipboard(code);
      const original = copyBtn.textContent;
      copyBtn.textContent = ok ? 'Copied' : 'Copy Failed';
      copyBtn.disabled = true;
      setTimeout(() => {
        copyBtn.textContent = original;
        copyBtn.disabled = false;
      }, 1200);
    });
  }

  return wrap;
}

async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) {
    // Fallback below
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return !!ok;
  } catch (_) {
    return false;
  }
}

function createExplanationContainer(title, text, secId) {
  const wrap = document.createElement('div');
  wrap.className = 'callout callout-info topic-explanation';
  wrap.dataset.exp = secId;
  wrap.innerHTML = `
    <div class="callout-title">${title}</div>
    <div class="callout-content">${text}</div>
  `;
  return wrap;
}

function buildSectionExplanation(moduleLabel, secId, sectionTitle, explanations) {
  const genericLead = `Ky seksion ne ${moduleLabel} duhet trajtuar si standard operativ enterprise, jo vetem si teori.`;

  const defaultsBySection = {
    'sec-1': `${genericLead} Filloni me scope te qarte, baseline aktual dhe target-state para cdo ndryshimi.`,
    'sec-2': `${genericLead} Shpjegoni dizajnin logjik/fizik dhe lidhjen me riskun operativ.`,
    'sec-3': `${genericLead} Dokumentoni politikat dhe kontrollat kyce me rregulla auditimi.`,
    'sec-4': `${genericLead} Definoni metrikat, alarmet dhe proceduren e reagimit.`,
    'sec-5': `${genericLead} Testoni resiliency me skenare reale te failover/recovery.`,
    'sec-6': `${genericLead} Standardizoni runbook-un, rollback-un dhe handover-in teknik.`,
    'sec-7': `${genericLead} Labs duhet te jene te matshme me expected outcome te qarte.`,
    'sec-8': `${genericLead} Quiz duhet te testoje vendimmarrje teknike dhe jo vetem memorim.`,
    'sec-9': `${genericLead} Troubleshooting behet me hipoteza, verifikim dhe evidenca.`,
    'sec-10': `${genericLead} Vleresimi final duhet te mat gatishmerine per prodhim.`
  };

  const moduleText = (explanations && typeof explanations === 'object') ? explanations : {};
  return moduleText[secId] || defaultsBySection[secId] || `${genericLead} Seksioni "${sectionTitle}" duhet te kete qellim, procedure, validim dhe rezultat te dokumentuar.`;
}

function getEnhancementConfig() {
  return (window.TOPIC_CONFIG && typeof window.TOPIC_CONFIG === 'object')
    ? window.TOPIC_CONFIG
    : {};
}

function initDeepTopicEnhancements() {
  const path = (window.location.pathname || '').split('/').pop().toLowerCase();
  const config = getEnhancementConfig()[path];
  if (!config) return;
  const moduleLabel = config.label || path.replace('.html', '').toUpperCase();

  const contentInner = document.querySelector('.content-inner');
  if (!contentInner) return;

  const sec1 = document.getElementById('sec-1');
  if (sec1 && !document.getElementById('sec-0')) {
    const h2 = document.createElement('h2');
    h2.id = 'sec-0';
    h2.className = 'sub-title';
    h2.textContent = '0. Topology Diagram';

    const topo = createCodeContainer('Reference Topology', 'Diagram', config.topology, 'sec-0');
    contentInner.insertBefore(topo, sec1);
    contentInner.insertBefore(h2, topo);
  }

  Object.entries(config.commands).forEach(([secId, meta]) => {
    const sec = document.getElementById(secId);
    if (!sec) return;
    if (contentInner.querySelector(`.code-container[data-cmd="${secId}"]`)) return;

    let target = sec.nextElementSibling;
    while (target && target.tagName !== 'P' && target.tagName !== 'H2') {
      target = target.nextElementSibling;
    }

    const block = createCodeContainer(meta.title, meta.lang, meta.code, secId);
    if (target && target.tagName === 'P') {
      target.insertAdjacentElement('afterend', block);
    } else {
      sec.insertAdjacentElement('afterend', block);
    }
  });

  if (config.examples) {
    Object.entries(config.examples).forEach(([secId, meta]) => {
      const sec = document.getElementById(secId);
      if (!sec) return;
      if (contentInner.querySelector(`.topic-example[data-example="${secId}"]`)) return;

      const block = createExampleContainer(meta.title, meta.lang, meta.code, meta.steps, secId);
      const firstExplanation = contentInner.querySelector(`.topic-explanation[data-exp="${secId}"]`);

      if (firstExplanation) {
        firstExplanation.insertAdjacentElement('afterend', block);
      } else {
        sec.insertAdjacentElement('afterend', block);
      }
    });
  }

  const sectionHeadings = Array.from(contentInner.querySelectorAll('h2[id^="sec-"]'));
  sectionHeadings.forEach((heading) => {
    const secId = heading.id;
    if (secId === 'sec-0') return;
    if (contentInner.querySelector(`.topic-explanation[data-exp="${secId}"]`)) return;

    const text = buildSectionExplanation(moduleLabel, secId, heading.textContent.trim(), config.explanations);
    const box = createExplanationContainer(`Shpjegim i Thelluar - ${heading.textContent.trim()}`, text, secId);
    heading.insertAdjacentElement('afterend', box);
  });
}

window.copyToClipboard = typeof copyToClipboard === 'function' ? copyToClipboard : function() {};
window.checkAnswer = window.checkAnswer || function(quizId, optionIndex, isCorrect) {
  const quiz = document.getElementById(quizId);
  if (!quiz) return;

  const options = quiz.querySelectorAll('.quiz-option');
  const feedback = document.getElementById(`${quizId}-feedback`);
  if (!options.length || !feedback) return;

  options.forEach((opt, idx) => {
    opt.classList.remove('selected', 'correct', 'incorrect');
    const radio = opt.querySelector('.quiz-option-radio');
    if (radio) radio.checked = idx === optionIndex;
  });

  const selected = options[optionIndex];
  if (selected) {
    selected.classList.add('selected');
    selected.classList.add(isCorrect ? 'correct' : 'incorrect');
  }

  feedback.style.display = 'block';
  feedback.textContent = isCorrect
    ? 'Sakte. Përgjigjja është e duhur për këtë skenar enterprise.'
    : 'Jo sakte. Rishiko seksionin përkatës dhe provo perseri.';
};

window.gradeExam = window.gradeExam || function(examId, answers) {
  const exam = document.getElementById(examId);
  const feedback = document.getElementById(`${examId}-feedback`);
  if (!exam || !feedback || !Array.isArray(answers)) return;

  let score = 0;
  const total = answers.length;

  answers.forEach((correctValue, idx) => {
    const selected = exam.querySelector(`input[name="${examId}-q${idx + 1}"]:checked`);
    if (selected && selected.value === correctValue) score += 1;
  });

  const pct = Math.round((score / total) * 100);
  feedback.style.display = 'block';

  if (score === total) {
    feedback.textContent = `Shkelqyeshem: ${score}/${total} (${pct}%).`;
  } else if (score >= Math.ceil(total * 0.67)) {
    feedback.textContent = `Mire: ${score}/${total} (${pct}%). Rishiko pikat ku gabove.`;
  } else {
    feedback.textContent = `Duhet permiresim: ${score}/${total} (${pct}%). Lexo perseri seksionet dhe provo serish.`;
  }
};
window.toggleLabCheckbox = window.toggleLabCheckbox || function() {};
window.showNodeDetails = window.showNodeDetails || function() {};
window.navigateTo = window.navigateTo || function() {};
window.renderActivePage = window.renderActivePage || function() {};
window.renderSidebar = window.renderSidebar || function() {};
window.initProgress = window.initProgress || function() {};
window.updateProgressUI = window.updateProgressUI || function() {};
window.initTheme = window.initTheme || function() {};
window.initSidebarToggle = window.initSidebarToggle || function() {};
window.initTopicNavigation = initTopicNavigation;

function initPage() {
  initTheme();
  initSidebarToggle();
  initDeepTopicEnhancements();
  initTopicNavigation();
}

document.addEventListener('DOMContentLoaded', () => {
  const ready = window.TOPIC_CONFIG_READY;
  if (ready && typeof ready.then === 'function') {
    ready.finally(initPage);
    return;
  }
  initPage();
});
