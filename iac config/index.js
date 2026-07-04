// index.js - Interactive engine and documentation database for GitHub + Terraform + GCP guide

// Theme Management
const themeToggleBtn = document.getElementById('btn-theme-toggle');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeUI(savedTheme);
}

function updateThemeUI(theme) {
  if (theme === 'light') {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  } else {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  }
}

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeUI(newTheme);
});

// Mobile menu toggle
const menuToggleBtn = document.getElementById('btn-menu-toggle');
const sidebar = document.getElementById('sidebar');

if (window.innerWidth <= 1024) {
  menuToggleBtn.style.display = 'flex';
}

menuToggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('mobile-open');
});

// Detail Drawer Management
const detailDrawer = document.getElementById('detail-drawer');
const drawerTitle = document.getElementById('drawer-title');
const drawerBody = document.getElementById('drawer-body');
const closeDrawerBtn = document.getElementById('btn-close-drawer');

function openDrawer(title, data) {
  drawerTitle.textContent = title;
  
  let propertiesHtml = '';
  if (data.properties) {
    propertiesHtml = data.properties.map(p => `
      <div class="detail-prop-group">
        <div class="detail-prop-label">${p.name}</div>
        <div class="detail-prop-value">${p.value}</div>
      </div>
    `).join('');
  }

  drawerBody.innerHTML = `
    ${propertiesHtml}
    <div class="detail-desc">${data.description}</div>
  `;
  detailDrawer.classList.add('open');
}

closeDrawerBtn.addEventListener('click', () => {
  detailDrawer.classList.remove('open');
});

// Clipboard Utility
function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = button.innerHTML;
    button.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      Kopjuar!
    `;
    button.style.borderColor = 'var(--alert-success-border)';
    button.style.color = 'var(--alert-success-text)';
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.borderColor = '';
      button.style.color = '';
    }, 2000);
  });
}

// Progress Tracking System
let userProgress = {};

function initProgress() {
  const saved = localStorage.getItem('guide_progress');
  if (saved) {
    userProgress = JSON.parse(saved);
  }
  updateProgressUI();
}

function toggleSubChapterProgress(chapterId, subId, checked) {
  if (!userProgress[chapterId]) {
    userProgress[chapterId] = {};
  }
  userProgress[chapterId][subId] = checked;
  localStorage.setItem('guide_progress', JSON.stringify(userProgress));
  updateProgressUI();
}

function updateProgressUI() {
  const checkboxes = document.querySelectorAll('.menu-sub-checkbox');
  let total = checkboxes.length;
  let completed = 0;

  checkboxes.forEach(cb => {
    const chapId = cb.dataset.chapter;
    const subId = cb.dataset.sub;
    if (userProgress[chapId] && userProgress[chapId][subId]) {
      cb.checked = true;
      completed++;
    } else {
      cb.checked = false;
    }
  });

  // Include lab completion status from workspace pages
  const labCheckboxes = document.querySelectorAll('.lab-cb');
  labCheckboxes.forEach(lcb => {
    const labId = lcb.dataset.lab;
    if (userProgress['lab'] && userProgress['lab'][labId]) {
      lcb.checked = true;
      lcb.closest('.lab-checklist-item').classList.add('done');
    } else {
      lcb.checked = false;
      lcb.closest('.lab-checklist-item').classList.remove('done');
    }
  });

  let totalLabs = 10; // We have exactly 10 labs
  let completedLabs = 0;
  if (userProgress['lab']) {
    completedLabs = Object.values(userProgress['lab']).filter(v => v).length;
  }

  // Calculate final percentage
  const totalTasks = total + totalLabs;
  const completedTasks = completed + completedLabs;
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  document.getElementById('progress-percent').textContent = `${pct}%`;
  document.getElementById('progress-bar-fill').style.width = `${pct}%`;
}

document.getElementById('btn-reset-progress').addEventListener('click', () => {
  if (confirm('A jeni të sigurt që dëshironi të fshini të gjithë progresin tuaj?')) {
    userProgress = {};
    localStorage.removeItem('guide_progress');
    initProgress();
    // reload active page to clear checkboxes in the content
    renderActivePage();
  }
});

// Chapters Database
const chapters = [
  {
    id: "welcome",
    title: "Mirëseerdhët",
    html: `
      <div class="welcome-screen">
        <div class="welcome-badge">Mëso IaC Shqip - Versioni Enterprise</div>
        <h1 class="welcome-title">GitHub, Terraform & GCP</h1>
        <p class="welcome-desc">Mirëseerdhët në udhëzuesin interaktiv enterprise për automatizimin e infrastrukturës në Google Cloud duke përdorur Terraform, GitHub Actions dhe HCP Terraform.</p>
        
        <div class="welcome-grid">
          <div class="welcome-card" onclick="navigateTo('ch1')">
            <div class="welcome-card-icon icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h3 class="welcome-card-title">Kapitulli 1-3: Filozofia</h3>
            <p class="welcome-card-desc">Hyrje në Infrastructure as Code (IaC), konceptet e rrjetave GCP dhe bazat e versionimit me Git dhe GitHub.</p>
          </div>
          <div class="welcome-card" onclick="navigateTo('ch4')">
            <div class="welcome-card-icon icon-purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            <h3 class="welcome-card-title">Kapitulli 4-8: Terraform & HCP</h3>
            <p class="welcome-card-desc">Themelet e Terraform, sintaksa HCL, backend remote, modularizimi dhe sinkronizimi me HCP Terraform.</p>
          </div>
          <div class="welcome-card" onclick="navigateTo('ch9')">
            <div class="welcome-card-icon icon-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3 class="welcome-card-title">Kapitulli 9-16: CI/CD & Security</h3>
            <p class="welcome-card-desc">Flukset e aprovimit enterprise, rregullat branch protection, CODEOWNERS, OIDC siguria dhe 10 Laboratore Praktike.</p>
          </div>
        </div>

        <div class="callout callout-info">
          <div class="callout-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Si të përdorni këtë portal:
          </div>
          <div class="callout-content">
            Zgjidhni kapitujt nga paneli i majtë për të lexuar mësimet. Markoni kapitujt dhe laboratoret e përfunduara për të ndjekur progresin tuaj në kohë reale. Ju mund të ndryshoni temën e dritës/errësirës në pjesën e sipërme djathtas.
          </div>
        </div>
      </div>
    `
  },
  {
    id: "ch1",
    title: "1. Hyrje - IaC, Git, CI/CD",
    html: `
      <h1 class="section-title"><span class="menu-chapter-num">1</span> Hyrje - IaC, Git, CI/CD, Përse Automatizimi?</h1>
      <p>Në botën moderne të Cloud, menaxhimi manual i serverave dhe rrjetave nuk është më një opsion i pranueshëm për nivelet Enterprise. Ky kapitull shpjegon filozofinë prapa <strong>Infrastructure as Code (IaC)</strong> dhe pse ajo është shtylla kryesore e inxhinierisë moderne të platformave.</p>

      <h2 class="sub-title" id="sec1_1">1.1 Çfarë është Infrastructure as Code (IaC)?</h2>
      <p>Infrastructure as Code është praktika e menaxhimit dhe provizionimit të burimeve të infrastrukturës (si serverat, rrjetat virtuale, load balancers, dhe bazat e të dhënave) nëpërmjet kodit të shkruar në skedarë konfigurimi, në vend që të klikohet manualisht në konzola ose të përdoren skripta ad-hoc.</p>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Metoda</th>
              <th>Shpejtësia</th>
              <th>Gabimet</th>
              <th>Riprodhueshmëria (Reproducibility)</th>
              <th>Auditimi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Manual (Console/CLI)</strong></td>
              <td>E ngadalshme</td>
              <td>Shumë e lartë</td>
              <td>E pamundur</td>
              <td>Asnjë (pa historik logjik)</td>
            </tr>
            <tr>
              <td><strong>Scripting (Bash/Python)</strong></td>
              <td>E mesme</td>
              <td>Të mundshme</td>
              <td>Pjesërisht</td>
              <td>Minimal</td>
            </tr>
            <tr>
              <td><strong>IaC (Terraform)</strong></td>
              <td>Shumë e shpejtë</td>
              <td>Minimale</td>
              <td>100% Identike</td>
              <td>I plotë (historik në Git)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="callout callout-success">
        <div class="callout-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Shembull Praktik:
        </div>
        <div class="callout-content">
          <strong>Skenari real:</strong> Imagjinoni që duhet të krijoni 20 VPC identike për 20 klientë të ndryshëm. Manualisht, kjo do të merrte orë të tëra klikimesh dhe do të ishte e prirur për gabime shkrimi të IP-ve. Me Terraform, ju vetëm ndryshoni një variabël dhe ekzekutoni <code>terraform apply</code> – gjithçka është gati në më pak se 2 minuta dhe plotësisht identike!
        </div>
      </div>

      <h2 class="sub-title" id="sec1_2">1.2 Manualisht vs Automatikisht</h2>
      <p>Diagrami interaktiv më poshtë ilustron dallimin kritik në hapa dhe kohë midis procesit manual tradicional dhe atij të automatizuar me IaC:</p>

      <div class="svg-diagram-card">
        <svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">
          <!-- Flow manual -->
          <text x="20" y="30" fill="var(--text-primary)" font-weight="bold" font-size="14">Rruga Manuale (E ngadalshme & Gabime)</text>
          
          <g class="svg-interactive-node" onclick="showNodeDetails('manual-ide')">
            <rect x="20" y="50" width="110" height="40" rx="6" fill="#ea4335" />
            <text x="75" y="75" fill="#fff" font-size="11" text-anchor="middle">Mendon Ndryshimin</text>
          </g>
          <line x1="130" y1="70" x2="160" y2="70" stroke="var(--text-secondary)" stroke-width="2" marker-end="url(#arrow-red)" />

          <g class="svg-interactive-node" onclick="showNodeDetails('manual-console')">
            <rect x="160" y="50" width="110" height="40" rx="6" fill="#ea4335" />
            <text x="215" y="75" fill="#fff" font-size="11" text-anchor="middle">Hap GCP Console</text>
          </g>
          <line x1="270" y1="70" x2="300" y2="70" stroke="var(--text-secondary)" stroke-width="2" marker-end="url(#arrow-red)" />

          <g class="svg-interactive-node" onclick="showNodeDetails('manual-click')">
            <rect x="300" y="50" width="110" height="40" rx="6" fill="#ea4335" />
            <text x="355" y="75" fill="#fff" font-size="11" text-anchor="middle">Klikon Manualisht</text>
          </g>
          <line x1="410" y1="70" x2="440" y2="70" stroke="var(--text-secondary)" stroke-width="2" marker-end="url(#arrow-red)" />

          <g class="svg-interactive-node" onclick="showNodeDetails('manual-config')">
            <rect x="440" y="50" width="110" height="40" rx="6" fill="#ea4335" />
            <text x="495" y="75" fill="#fff" font-size="11" text-anchor="middle">Konfiguron Çdo Hap</text>
          </g>
          <line x1="550" y1="70" x2="580" y2="70" stroke="var(--text-secondary)" stroke-width="2" marker-end="url(#arrow-red)" />

          <g class="svg-interactive-node" onclick="showNodeDetails('manual-test')">
            <rect x="580" y="50" width="110" height="40" rx="6" fill="#ea4335" />
            <text x="635" y="75" fill="#fff" font-size="11" text-anchor="middle">Teston Manualisht</text>
          </g>

          <!-- Flow IaC -->
          <text x="20" y="160" fill="var(--text-primary)" font-weight="bold" font-size="14">Rruga IaC (E shpejtë, E sigurt, E audituar)</text>
          
          <g class="svg-interactive-node" onclick="showNodeDetails('iac-code')">
            <rect x="20" y="180" width="110" height="40" rx="6" fill="#1e8e3e" />
            <text x="75" y="205" fill="#fff" font-size="11" text-anchor="middle">Shkruan Terraform</text>
          </g>
          <line x1="130" y1="200" x2="160" y2="200" stroke="var(--text-secondary)" stroke-width="2" marker-end="url(#arrow-green)" />

          <g class="svg-interactive-node" onclick="showNodeDetails('iac-git')">
            <rect x="160" y="180" width="110" height="40" rx="6" fill="#1e8e3e" />
            <text x="215" y="205" fill="#fff" font-size="11" text-anchor="middle">git push</text>
          </g>
          <line x1="270" y1="200" x2="300" y2="200" stroke="var(--text-secondary)" stroke-width="2" marker-end="url(#arrow-green)" />

          <g class="svg-interactive-node" onclick="showNodeDetails('iac-actions')">
            <rect x="300" y="180" width="110" height="40" rx="6" fill="#1a73e8" />
            <text x="355" y="205" fill="#fff" font-size="11" text-anchor="middle">GitHub Actions</text>
          </g>
          <line x1="410" y1="200" x2="440" y2="200" stroke="var(--text-secondary)" stroke-width="2" marker-end="url(#arrow-green)" />

          <g class="svg-interactive-node" onclick="showNodeDetails('iac-plan')">
            <rect x="440" y="180" width="110" height="40" rx="6" fill="#1a73e8" />
            <text x="495" y="205" fill="#fff" font-size="11" text-anchor="middle">Plan (Automatik)</text>
          </g>
          <line x1="550" y1="200" x2="580" y2="200" stroke="var(--text-secondary)" stroke-width="2" marker-end="url(#arrow-green)" />

          <g class="svg-interactive-node" onclick="showNodeDetails('iac-approval')">
            <rect x="580" y="180" width="110" height="40" rx="6" fill="#7b42bc" />
            <text x="635" y="205" fill="#fff" font-size="11" text-anchor="middle">Approval / Aprovim</text>
          </g>
          <line x1="690" y1="200" x2="710" y2="200" stroke="var(--text-secondary)" stroke-width="2" marker-end="url(#arrow-green)" />

          <g class="svg-interactive-node" onclick="showNodeDetails('iac-apply')">
            <rect x="710" y="180" width="80" height="40" rx="6" fill="#1e8e3e" />
            <text x="750" y="205" fill="#fff" font-size="11" text-anchor="middle">Apply (Auto)</text>
          </g>

          <defs>
            <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M0,1 L10,5 L0,9 z" fill="#ea4335" />
            </marker>
            <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M0,1 L10,5 L0,9 z" fill="#1e8e3e" />
            </marker>
          </defs>
        </svg>
        <div class="diagram-caption">Klikoni mbi kutitë për të parë shpjegimet e detajuara.</div>
      </div>

      <h2 class="sub-title" id="sec1_3">1.3 Përse Terraform, Git dhe CI/CD?</h2>
      <p>Secila prej këtyre teknologjive luan një rol kritik në pipeline-in e automatizimit:</p>
      <ul>
        <li><strong>Terraform:</strong> Mjeti kryesor i IaC nga HashiCorp. Përdor HashiCorp Configuration Language (HCL). Mbështet GCP, AWS, Azure dhe mbi 300 provajderë të tjerë.</li>
        <li><strong>Git:</strong> Sistemi i kontrollit të versioneve. Ruan historikun e plotë të çdo ndryshimi, duke lejuar rikthimin (rollback) në gjendje të mëparshme.</li>
        <li><strong>GitHub:</strong> Platforma cloud ku strehohet kodi dhe ku bashkëpunon ekipi përmes Pull Requests (PR).</li>
        <li><strong>GitHub Actions:</strong> Mjeti i integruar i CI/CD për të testuar kodin automatikisht dhe ekzekutuar planet e infrastrukturës.</li>
        <li><strong>HCP Terraform (Terraform Cloud):</strong> SaaS për menaxhimin e state skedarëve në mënyrë të sigurt, aprovimeve manuale dhe detektimit të devijimeve (drift).</li>
      </ul>

      <div class="quiz-widget" id="quiz-ch1">
        <div class="quiz-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Pyetje Vlerësuese: Kapitulli 1
        </div>
        <div class="quiz-question">Cila është vlera kryesore e përdorimit të Terraform në krahasim me skriptat manuale Bash për krijimin e resurseve në Cloud?</div>
        <div class="quiz-options">
          <div class="quiz-option" onclick="checkAnswer('quiz-ch1', 0, false)">
            <input type="radio" name="q1" class="quiz-option-radio">
            <span>A) Skriptat Bash janë më të shpejta për t'u shkruar në çdo rast.</span>
          </div>
          <div class="quiz-option" onclick="checkAnswer('quiz-ch1', 1, true)">
            <input type="radio" name="q1" class="quiz-option-radio">
            <span>B) Terraform ruan gjendjen (state) dhe është deklarativ, duke garantuar riprodhueshmëri 100%.</span>
          </div>
          <div class="quiz-option" onclick="checkAnswer('quiz-ch1', 2, false)">
            <input type="radio" name="q1" class="quiz-option-radio">
            <span>C) Terraform mund të përdoret vetëm në mjedise On-Premise.</span>
          </div>
        </div>
        <div class="quiz-feedback" id="quiz-ch1-feedback"></div>
      </div>
    `
  },
  {
    id: "ch2",
    title: "2. GCP Networking - Udhëzues i Plotë",
    html: `
      <h1 class="section-title"><span class="menu-chapter-num">2</span> GCP Networking - Udhëzues i Plotë</h1>
      <p>Rrjetat në Google Cloud (GCP) kanë disa veçori arkitekturore unike që i dallojnë ato nga provajderët e tjerë si AWS apo Azure. Ky kapitull analizon konceptet kryesore të rrjetave nga fillimi deri tek mjediset komplekse enterprise.</p>

      <h2 class="sub-title" id="sec2_1">2.1 Cloud Computing - Konceptet Bazë</h2>
      <p>Përpara se të kalojmë te rrjetat, le të bëjmë një krahasim midis mjediseve fizike On-Premise dhe Google Cloud:</p>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Karakteristika</th>
              <th>On-Premise (Fizik)</th>
              <th>Google Cloud (GCP)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Kosto fillestare</strong></td>
              <td>Shumë e lartë (blerje e pajisjeve/hardware)</td>
              <td>Zero (paguhet sipas përdorimit - OPEX)</td>
            </tr>
            <tr>
              <td><strong>Koha e konfigurimit</strong></td>
              <td>Javë ose muaj (dërgimi, montimi, kabllimi)</td>
              <td>Minuta (përmes API apo Terraform)</td>
            </tr>
            <tr>
              <td><strong>Skalimi</strong></td>
              <td>I kufizuar dhe kërkon kohë për blerje të reja</td>
              <td>Automatik dhe i menjëhershëm</td>
            </tr>
            <tr>
              <td><strong>Disponueshmëria (SLA)</strong></td>
              <td>Varet krejtësisht nga mirëmbajtja juaj</td>
              <td>Mbi 99.99% SLA të garantuar nga Google</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="sub-sub-title">Modeli IaaS, PaaS, SaaS</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Modeli</th>
              <th>Çfarë menaxhoni ju?</th>
              <th>Çfarë menaxhon GCP?</th>
              <th>Shembull në GCP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>IaaS</strong> (Infrastructure as a Service)</td>
              <td>OS, Aplikacionet, Të dhënat</td>
              <td>Hardware, Virtualizimin, Rrjetën fizike</td>
              <td>Compute Engine (VM)</td>
            </tr>
            <tr>
              <td><strong>PaaS</strong> (Platform as a Service)</td>
              <td>Kodin e Aplikacionit, Konfigurimet</td>
              <td>OS, Runtimes, Sigurinë e hostit</td>
              <td>Cloud Run, App Engine</td>
            </tr>
            <tr>
              <td><strong>SaaS</strong> (Software as a Service)</td>
              <td>Përdorimin e thjeshtë (përdoruesit)</td>
              <td>Gjithë infrastrukturën dhe kodin</td>
              <td>Gmail, Google Workspace</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="sub-title" id="sec2_2">2.2 Virtual Private Cloud (VPC)</h2>
      <p>Në GCP, <strong>VPC (Virtual Private Cloud) është GLOBALE</strong>. Kjo do të thotë që një VPC e vetme mund të ketë subnets në rajone të ndryshme (si Frankfurt, Netherlands, Tokyo) brenda të njëjtit rrjet logjik pa pasur nevojë për peering kompleks.</p>

      <div class="svg-diagram-card">
        <svg viewBox="0 0 800 240" xmlns="http://www.w3.org/2000/svg">
          <!-- VPC Box -->
          <rect x="20" y="20" width="760" height="200" rx="10" fill="none" stroke="var(--color-gcp)" stroke-width="2.5" stroke-dasharray="8 4" />
          <text x="35" y="45" fill="var(--color-gcp)" font-weight="bold" font-size="14">GCP VPC (Global Network)</text>

          <!-- Region Frankfurt -->
          <g class="svg-interactive-node" onclick="showNodeDetails('subnet-frankfurt')">
            <rect x="50" y="70" width="200" height="120" rx="8" fill="var(--bg-card)" stroke="var(--border-color)" stroke-width="1.5" />
            <text x="65" y="95" fill="var(--text-primary)" font-weight="bold" font-size="12">europe-west3 (Frankfurt)</text>
            <rect x="65" y="110" width="170" height="30" rx="4" fill="rgba(26, 115, 232, 0.1)" stroke="var(--color-gcp)" />
            <text x="75" y="128" fill="var(--text-secondary)" font-size="10">Subnet: 10.10.10.0/24</text>
            <text x="75" y="150" fill="var(--text-muted)" font-size="9">VM-1 (Internal IP: 10.10.10.10)</text>
          </g>

          <!-- Region Netherlands -->
          <g class="svg-interactive-node" onclick="showNodeDetails('subnet-netherlands')">
            <rect x="290" y="70" width="220" height="120" rx="8" fill="var(--bg-card)" stroke="var(--border-color)" stroke-width="1.5" />
            <text x="305" y="95" fill="var(--text-primary)" font-weight="bold" font-size="12">europe-west4 (Netherlands)</text>
            <rect x="305" y="110" width="190" height="30" rx="4" fill="rgba(26, 115, 232, 0.1)" stroke="var(--color-gcp)" />
            <text x="315" y="128" fill="var(--text-secondary)" font-size="10">Subnet: 10.20.0.0/24</text>
            <text x="315" y="150" fill="var(--text-muted)" font-size="9">VM-2 (Internal IP: 10.20.0.10)</text>
          </g>

          <!-- Region Oregon -->
          <g class="svg-interactive-node" onclick="showNodeDetails('subnet-oregon')">
            <rect x="540" y="70" width="210" height="120" rx="8" fill="var(--bg-card)" stroke="var(--border-color)" stroke-width="1.5" />
            <text x="555" y="95" fill="var(--text-primary)" font-weight="bold" font-size="12">us-west1 (Oregon)</text>
            <rect x="555" y="110" width="180" height="30" rx="4" fill="rgba(26, 115, 232, 0.1)" stroke="var(--color-gcp)" />
            <text x="565" y="128" fill="var(--text-secondary)" font-size="10">Subnet: 10.30.0.0/24</text>
            <text x="565" y="150" fill="var(--text-muted)" font-size="9">VM-3 (Internal IP: 10.30.0.10)</text>
          </g>
        </svg>
        <div class="diagram-caption">Topologjia e një VPC Globale me subnets në 3 rajone të ndryshme.</div>
      </div>

      <h3 class="sub-sub-title">CIDR dhe Subnets</h3>
      <p>IP adresat menaxhohen përmes notacionit CIDR (Classless Inter-Domain Routing). GCP rezervon <strong>4 adresa IP për çdo subnet</strong> (Network, Gateway, Broadcast, dhe një e rezervuar për përdorim të ardhshëm).</p>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Shembull CIDR</th>
              <th>Adresat e Disponueshme</th>
              <th>Përdorimi Tipik</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>10.10.10.0/24</code></td>
              <td>252 adresa (256 - 4)</td>
              <td>Subnet i vogël për një mjedis specifik</td>
            </tr>
            <tr>
              <td><code>10.10.0.0/22</code></td>
              <td>1020 adresa</td>
              <td>Subnet i mesëm për GKE nodes</td>
            </tr>
            <tr>
              <td><code>10.0.0.0/16</code></td>
              <td>65,532 adresa</td>
              <td>IP Range kryesor për një VPC të tërë</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="sub-title" id="sec2_3">2.3 Routes dhe Firewall Rules</h2>
      <p>Në GCP, rregullat e firewall-it aplikohen në nivelin e instancës (VM), por menaxhohen në nivel VPC. Ingress (trafiku hyrës) dhe Egress (trafiku dalës) kontrollohen përmes prioriteteve (prioriteti më i ulët numerik ka përparësi më të lartë, p.sh. 0-65535).</p>

      <div class="callout callout-info">
        <div class="callout-title">GCP Defaults:</div>
        <div class="callout-content">
          Nga parazgjedhja (default), GCP <strong>bllokon të gjithë trafikun hyrës (Deny Ingress)</strong> dhe <strong>lejon të gjithë trafikun dalës (Allow Egress)</strong>.
        </div>
      </div>

      <h2 class="sub-title" id="sec2_4">2.4 Cloud Router dhe BGP</h2>
      <p>Cloud Router përdor protokollin <strong>BGP (Border Gateway Protocol)</strong> për të shkëmbyer rrugët (routes) dinamikisht mes VPC në GCP dhe rrjetit tuaj lokal (On-Premise). Ai nuk e kalon trafikun e të dhënave vetë, por përdoret vetëm për të vendosur tabelën e rrugëtimit.</p>

      <div class="svg-diagram-card">
        <svg viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
          <!-- VPC GCP -->
          <rect x="30" y="40" width="220" height="120" rx="8" fill="var(--bg-card)" stroke="var(--color-gcp)" stroke-width="2" />
          <text x="140" y="75" fill="var(--text-primary)" font-weight="bold" font-size="12" text-anchor="middle">VPC GCP (Munich)</text>
          <text x="140" y="95" fill="var(--text-secondary)" font-size="10" text-anchor="middle">IP: 10.10.10.0/24</text>
          <rect x="50" y="110" width="180" height="30" rx="4" fill="rgba(26, 115, 232, 0.1)" stroke="var(--color-gcp)" />
          <text x="140" y="128" fill="var(--text-secondary)" font-size="10" text-anchor="middle">Cloud Router (ASN: 64512)</text>

          <!-- BGP Tunnel -->
          <line x1="250" y1="100" x2="550" y2="100" stroke="var(--text-muted)" stroke-width="4" stroke-dasharray="5 5" />
          <rect x="350" y="80" width="100" height="40" rx="6" fill="var(--bg-card)" stroke="var(--color-hashi)" />
          <text x="400" y="105" fill="var(--color-accent)" font-weight="bold" font-size="11" text-anchor="middle">BGP Peer</text>

          <!-- On-Premise -->
          <rect x="550" y="40" width="220" height="120" rx="8" fill="var(--bg-card)" stroke="#ef4444" stroke-width="2" />
          <text x="660" y="75" fill="var(--text-primary)" font-weight="bold" font-size="12" text-anchor="middle">On-Premise (Prishtina)</text>
          <text x="660" y="95" fill="var(--text-secondary)" font-size="10" text-anchor="middle">IP: 192.168.20.0/24</text>
          <rect x="570" y="110" width="180" height="30" rx="4" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" />
          <text x="660" y="128" fill="var(--text-secondary)" font-size="10" text-anchor="middle">Router On-Prem (ASN: 64513)</text>
        </svg>
        <div class="diagram-caption">Sesioni BGP mes Cloud Router dhe Routerit On-Premise për shkëmbimin e rrugëve.</div>
      </div>

      <h2 class="sub-title" id="sec2_5">2.5 HA VPN - Lab Munich-Prishtina</h2>
      <p>HA (High Availability) VPN është zgjidhja standarde per lidhje te sigurta me 99.99% SLA. Ajo perdor dy tunele aktive-aktive ne adresa IP publike te ndryshme.</p>
      
      <div class="callout callout-warning">
        <div class="callout-title">Rregull i Artë i Sigurisë:</div>
        <div class="callout-content">
          Gjatë konfigurimit të HA VPN, çelësat e përbashkët (Shared Secrets) duhet të ruhen gjithmonë si variabla të fshehta (Sensitive) në Terraform ose GitHub Secrets, dhe kurrë të mos bëhen commit në Git!
        </div>
      </div>

      <div class="quiz-widget" id="quiz-ch2">
        <div class="quiz-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Pyetje Vlerësuese: Kapitulli 2
        </div>
        <div class="quiz-question">Çfarë nënkupton deklarata "GCP VPC është GLOBALE"?</div>
        <div class="quiz-options">
          <div class="quiz-option" onclick="checkAnswer('quiz-ch2', 0, false)">
            <input type="radio" name="q2" class="quiz-option-radio">
            <span>A) Trafiku i VPC kalon automatikisht në të gjithë internetin publik.</span>
          </div>
          <div class="quiz-option" onclick="checkAnswer('quiz-ch2', 1, true)">
            <input type="radio" name="q2" class="quiz-option-radio">
            <span>B) Mund të krijojmë subnets në rajone të ndryshme gjeografike brenda të njëjtës VPC pa pasur nevojë për lidhje peering.</span>
          </div>
          <div class="quiz-option" onclick="checkAnswer('quiz-ch2', 2, false)">
            <input type="radio" name="q2" class="quiz-option-radio">
            <span>C) Çdo instancë VM ka një IP adresë publike globale automatikisht.</span>
          </div>
        </div>
        <div class="quiz-feedback" id="quiz-ch2-feedback"></div>
      </div>
    `
  },
  {
    id: "ch3",
    title: "3. Git dhe GitHub nga Fillimi",
    html: `
      <h1 class="section-title"><span class="menu-chapter-num">3</span> Git dhe GitHub nga Fillimi</h1>
      <p>Git është sistemi më i popullarizuar i shpërndarë për kontrollin e versioneve të kodit. Për inxhinierët IaC, Git shërben si burimi i vetëm i të vërtetës (Single Source of Truth) për gjendjen e infrastrukturës.</p>

      <h2 class="sub-title" id="sec3_1">3.1 Konceptet Themelore Git</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Koncepti</th>
              <th>Përshkrimi</th>
              <th>Analogjia me jetën reale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Repository (Repo)</strong></td>
              <td>Dosja e projektit dhe historiku i saj</td>
              <td>Ditari komplet i ndryshimeve të shtëpisë</td>
            </tr>
            <tr>
              <td><strong>Commit</strong></td>
              <td>Një foto (snapshot) e kodit në një kohë të caktuar</td>
              <td>Një foto e shtëpisë pas përfundimit të një faze ndërtimi</td>
            </tr>
            <tr>
              <td><strong>Branch</strong></td>
              <td>Degëzim i pavarur për zhvillim pa ndikuar mjedisin kryesor</td>
              <td>Një vizatim/skicë e re për të testuar dizajnin e dhomës</td>
            </tr>
            <tr>
              <td><strong>Merge</strong></td>
              <td>Bashkimi i ndryshimeve nga një branch te tjetri</td>
              <td>Aplikimi i dizajnit të ri të provuar në muret reale</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="sub-title" id="sec3_2">3.2 Komandot Kryesore Git</h2>
      <p>Këtu janë komandot që çdo DevOps inxhinier duhet t'i zotërojë:</p>

      <div class="code-container">
        <div class="code-header">
          <div class="code-title">Komandat Git</div>
          <span class="code-lang-badge">Bash</span>
          <button class="btn-copy" onclick="copyToClipboard(document.getElementById('code-git-cmd').textContent, this)">Kopjo</button>
        </div>
        <pre><code id="code-git-cmd"><span class="code-comment"># Konfigurimi fillestar</span>
git config --global user.name "Emri Juaj"
git config --global user.email "email@kompania.com"

<span class="code-comment"># Klonimi i një repozitori ekzistues</span>
git clone https://github.com/kompania/terraform-gcp.git
cd terraform-gcp

<span class="code-comment"># Krijimi i një dege (branch) të re për zhvillim</span>
git checkout -b feature/shto-vpc-frankfurt

<span class="code-comment"># Shikimi i ndryshimeve aktuale</span>
git status

<span class="code-comment"># Shtimi i skedarëve dhe ruajtja e commit</span>
git add main.tf variables.tf
git commit -m "feat: shto rrjetin VPC për Frankfurt"

<span class="code-comment"># Dërgimi i kodit në GitHub</span>
git push origin feature/shto-vpc-frankfurt</code></pre>
      </div>

      <h2 class="sub-title" id="sec3_3">3.3 Branching Strategy per Projekte Terraform</h2>
      <p>Për mjedise enterprise rekomandohet strategjia <strong>GitFlow</strong> e përshtatur për Terraform:</p>
      <ul>
        <li><strong>main:</strong> Kodi që është aktualisht i provizionuar në Production. Nuk lejohet kurrë push direkt! Ndryshimet vijnë vetëm përmes PR dhe aprovimeve.</li>
        <li><strong>develop:</strong> Kodi që testohet në mjedisin e integrimit (Staging/NonProd).</li>
        <li><strong>feature/*:</strong> Degë të përkohshme ku zhvilluesit shkruajnë kodin për detyrat specifike.</li>
      </ul>

      <div class="quiz-widget" id="quiz-ch3">
        <div class="quiz-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Pyetje Vlerësuese: Kapitulli 3
        </div>
        <div class="quiz-question">Pse nuk lejohet kurrë commit-imi i skedarëve me prapashtesë <code>.tfstate</code> në Git?</div>
        <div class="quiz-options">
          <div class="quiz-option" onclick="checkAnswer('quiz-ch3', 0, true)">
            <input type="radio" name="q3" class="quiz-option-radio">
            <span>A) Sepse ato përmbajnë të dhëna sensitive dhe fjalëkalime në plain-text, dhe mund të shkaktojnë konflikte të mëdha kur punojnë shumë inxhinierë.</span>
          </div>
          <div class="quiz-option" onclick="checkAnswer('quiz-ch3', 1, false)">
            <input type="radio" name="q3" class="quiz-option-radio">
            <span>B) Sepse Git nuk mbështet skedarët JSON.</span>
          </div>
          <div class="quiz-option" onclick="checkAnswer('quiz-ch3', 2, false)">
            <input type="radio" name="q3" class="quiz-option-radio">
            <span>C) Sepse Terraform i fshin automatikisht nga kompjuteri juaj kur bëni git push.</span>
          </div>
        </div>
        <div class="quiz-feedback" id="quiz-ch3-feedback"></div>
      </div>
    `
  },
  {
    id: "ch4",
    title: "4. Terraform Fundamentals",
    html: `
      <h1 class="section-title"><span class="menu-chapter-num">4</span> Terraform Fundamentals</h1>
      <p>Terraform funksionon duke krahasuar kodin tuaj deklarativ me gjendjen reale të burimeve në Cloud përmes një skedari të quajtur <strong>State File</strong>.</p>

      <h2 class="sub-title" id="sec4_1">4.1 Terraform Workflow - Hapat Kryesore</h2>
      <p>Cikli jetësor i ekzekutimit të Terraform përbëhet nga këto faza kryesore:</p>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Komanda</th>
              <th>Përshkrimi</th>
              <th>Kur ekzekutohet?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>terraform init</code></td>
              <td>Shkarkon provider-at (p.sh. Google) dhe inicializon modulet.</td>
              <td>Hera e parë ose kur shtohet një provider i ri.</td>
            </tr>
            <tr>
              <td><code>terraform validate</code></td>
              <td>Kontrollon nëse kodi ka gabime sintaksore apo logjike.</td>
              <td>Para çdo plani apo commit-i.</td>
            </tr>
            <tr>
              <td><code>terraform fmt</code></td>
              <td>Formaton kodin sipas standardit zyrtar të HashiCorp.</td>
              <td>Para se të dërgohet kodi në Git (formatting check).</td>
            </tr>
            <tr>
              <td><code>terraform plan</code></td>
              <td>Krijon një plan ekzekutimi (tregon çfarë do të shtohet, ndryshohet apo fshihet).</td>
              <td>Në çdo ndryshim kodi. Nuk kryen asnjë modifikim në cloud.</td>
            </tr>
            <tr>
              <td><code>terraform apply</code></td>
              <td>Ekzekuton planin dhe krijon burimet reale në GCP.</td>
              <td>Pas miratimit të planit. Kërkon konfirmim (ose auto-approve).</td>
            </tr>
            <tr>
              <td><code>terraform destroy</code></td>
              <td>Fshin të gjithë strukturën e krijuar nga ky kod.</td>
              <td>Vetëm në mjedise testuese kur dëshirojmë të pastrojmë mjedisin.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="sub-title" id="sec4_2">4.2 State File dhe Remote Backend</h2>
      <p>Skedari <code>terraform.tfstate</code> mban mend marrëdhënien midis kodit dhe resurseve. Për projekte ekipore, ky skedar duhet të ruhet në një <strong>Remote Backend</strong> si Google Cloud Storage (GCS) ose HCP Terraform.</p>

      <div class="code-container">
        <div class="code-header">
          <div class="code-title">backend.tf</div>
          <span class="code-lang-badge">HCL</span>
          <button class="btn-copy" onclick="copyToClipboard(document.getElementById('code-backend-config').textContent, this)">Kopjo</button>
        </div>
        <pre><code id="code-backend-config"><span class="code-comment"># Konfigurimi i backend në Google Cloud Storage (GCS) me versioning të aktivizuar</span>
terraform {
  backend "gcs" {
    bucket = "company-terraform-state-prod"
    prefix = "gcp-networking/production"
  }
}</code></pre>
      </div>

      <h2 class="sub-title" id="sec4_3">4.3 Variables, Outputs, Locals</h2>
      <ul>
        <li><strong>Variables (Variablat):</strong> Parametrat hyrës për të bërë kodin dinamik.</li>
        <li><strong>Outputs (Daljet):</strong> Vlerat që kthehen pas aplikimit të kodit (p.sh. IP-ja publike e krijuar).</li>
        <li><strong>Locals (Lokale):</strong> Variabla të brendshme që shërbejnë për llogaritje apo bashkim stringjesh.</li>
      </ul>

      <div class="quiz-widget" id="quiz-ch4">
        <div class="quiz-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Pyetje Vlerësuese: Kapitulli 4
        </div>
        <div class="quiz-question">Çfarë bën komanda <code>terraform plan</code>?</div>
        <div class="quiz-options">
          <div class="quiz-option" onclick="checkAnswer('quiz-ch4', 0, false)">
            <input type="radio" name="q4" class="quiz-option-radio">
            <span>A) Krijon menjëherë resurset në Cloud pa pyetur.</span>
          </div>
          <div class="quiz-option" onclick="checkAnswer('quiz-ch4', 1, true)">
            <input type="radio" name="q4" class="quiz-option-radio">
            <span>B) Gjeneron një pasqyrë të ndryshimeve të planifikuara pa modifikuar asgjë në cloud.</span>
          </div>
          <div class="quiz-option" onclick="checkAnswer('quiz-ch4', 2, false)">
            <input type="radio" name="q4" class="quiz-option-radio">
            <span>C) Formatson kodin tuaj dhe e dërgon në Git.</span>
          </div>
        </div>
        <div class="quiz-feedback" id="quiz-ch4-feedback"></div>
      </div>
    `
  },
  {
    id: "ch5",
    title: "5. Terraform + GCP - Shembuj Praktikë",
    html: `
      <h1 class="section-title"><span class="menu-chapter-num">5</span> Terraform + GCP - Shembuj Praktikë</h1>
      <p>Ky kapitull ofron një shembull të plotë dhe të gatshëm për prodhim (production-ready) të kodit Terraform për ndërtimin e një rrjeti VPC, Subnet me Flow Logs të aktivizuara, rregulla Firewall, Cloud Router dhe Cloud NAT.</p>

      <div class="callout callout-info">
        <div class="callout-title">Kod Explorer Interaktiv</div>
        <div class="callout-content">
          Kodi i mëposhtëm mund të kopjohet dhe përdoret direkt. Klikoni butonin "Kopjo" për ta përdorur në projektin tuaj lokal.
        </div>
      </div>

      <div class="code-container">
        <div class="code-header">
          <div class="code-title">main.tf - Rrjeti GCP Enterprise</div>
          <span class="code-lang-badge">HCL</span>
          <button class="btn-copy" onclick="copyToClipboard(document.getElementById('code-main-tf').textContent, this)">Kopjo</button>
        </div>
        <pre><code id="code-main-tf">terraform {
  required_version = ">= 1.6"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

<span class="code-comment"># Krijimi i rrjetit Global VPC</span>
resource "google_compute_network" "main" {
  name                    = "\${var.env}-main-vpc"
  auto_create_subnetworks = false
  routing_mode            = "GLOBAL"
  description             = "VPC kryesore per \${var.env}"
}

<span class="code-comment"># Subnet me Flow Logs te aktivizuara per auditim</span>
resource "google_compute_subnetwork" "prod" {
  name                     = "\${var.env}-prod-subnet"
  ip_cidr_range            = "10.10.10.0/24"
  region                   = var.region
  network                  = google_compute_network.main.id
  private_ip_google_access = true <span class="code-comment"># Aksesimi i API-ve te Google pa IP publike</span>

  log_config {
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling        = 0.5 <span class="code-comment"># 50% e paketave per te reduktuar koston e ruajtjes</span>
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

<span class="code-comment"># Firewall: Lejimi i komunikimit te brendshem (Internal)</span>
resource "google_compute_firewall" "allow_internal" {
  name    = "\${var.env}-allow-internal"
  network = google_compute_network.main.id

  allow {
    protocol = "all"
  }

  source_ranges = ["10.0.0.0/8"]
  priority      = 999
}

<span class="code-comment"># Firewall: Lejimi i SSH permes GCP Identity-Aware Proxy (IAP)</span>
resource "google_compute_firewall" "allow_ssh_iap" {
  name    = "\${var.env}-allow-ssh-iap"
  network = google_compute_network.main.id

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["35.235.240.0/20"] <span class="code-comment"># IP range zyrtar i GCP IAP</span>
}

<span class="code-comment"># Cloud Router per NAT</span>
resource "google_compute_router" "main" {
  name    = "\${var.env}-router"
  region  = var.region
  network = google_compute_network.main.id

  bgp {
    asn = 64512
  }
}

<span class="code-comment"># Cloud NAT per t'u dhene VM-ve private qasje ne internet</span>
resource "google_compute_router_nat" "main" {
  name                               = "\${var.env}-nat"
  router                             = google_compute_router.main.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}</code></pre>
      </div>

      <div class="quiz-widget" id="quiz-ch5">
        <div class="quiz-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Pyetje Vlerësuese: Kapitulli 5
        </div>
        <div class="quiz-question">Pse shërben parametri <code>private_ip_google_access = true</code> në konfigurimin e subnetit?</div>
        <div class="quiz-options">
          <div class="quiz-option" onclick="checkAnswer('quiz-ch5', 0, true)">
            <input type="radio" name="q5" class="quiz-option-radio">
            <span>A) Lejon VM-të pa adresa IP publike të komunikojnë me API-të dhe shërbimet e Google Cloud (si GCS) në mënyrë të sigurt nga rrjeti i brendshëm.</span>
          </div>
          <div class="quiz-option" onclick="checkAnswer('quiz-ch5', 1, false)">
            <input type="radio" name="q5" class="quiz-option-radio">
            <span>B) E bën subnetin publik në të gjithë internetin.</span>
          </div>
          <div class="quiz-option" onclick="checkAnswer('quiz-ch5', 2, false)">
            <input type="radio" name="q5" class="quiz-option-radio">
            <span>C) Aktivizon rregullat e SSH automatikisht për çdo VM.</span>
          </div>
        </div>
        <div class="quiz-feedback" id="quiz-ch5-feedback"></div>
      </div>
    `
  },
  {
    id: "ch6",
    title: "6. GitHub + Terraform Workflow Enterprise",
    html: `
      <h1 class="section-title"><span class="menu-chapter-num">6</span> GitHub + Terraform Workflow Enterprise</h1>
      <p>Në mjediset profesionale, inxhinierët nuk ekzekutojnë asnjëherë <code>terraform apply</code> direkt nga kompjuterët e tyre personalë. Çdo gjë kalon përmes një cikli të kontrolluar të CI/CD.</p>

      <h2 class="sub-title" id="sec6_1">6.1 Fluksi i Plotë - Nga Kodi te Provizionimi</h2>
      <p>Fluksi ideal i punës kalon nëpër këto shtatë hapa të kontrolluar:</p>

      <div class="svg-diagram-card">
        <svg viewBox="0 0 850 200" xmlns="http://www.w3.org/2000/svg">
          <!-- Step 1: Dev -->
          <g class="svg-interactive-node" onclick="showNodeDetails('flow-dev')">
            <rect x="10" y="50" width="100" height="80" rx="6" fill="var(--bg-card)" stroke="var(--border-color)" />
            <text x="60" y="85" fill="var(--text-primary)" font-size="11" font-weight="bold" text-anchor="middle">1. Dev PC</text>
            <text x="60" y="105" fill="var(--text-secondary)" font-size="9" text-anchor="middle">Shkruan Kodin</text>
          </g>
          <line x1="110" y1="90" x2="130" y2="90" stroke="var(--text-secondary)" stroke-width="2" marker-end="url(#arrow-blue)" />

          <!-- Step 2: Push -->
          <g class="svg-interactive-node" onclick="showNodeDetails('flow-push')">
            <rect x="130" y="50" width="100" height="80" rx="6" fill="var(--bg-card)" stroke="var(--border-color)" />
            <text x="180" y="85" fill="var(--text-primary)" font-size="11" font-weight="bold" text-anchor="middle">2. git push</text>
            <text x="180" y="105" fill="var(--text-secondary)" font-size="9" text-anchor="middle">Feature Branch</text>
          </g>
          <line x1="230" y1="90" x2="250" y2="90" stroke="var(--text-secondary)" stroke-width="2" marker-end="url(#arrow-blue)" />

          <!-- Step 3: PR -->
          <g class="svg-interactive-node" onclick="showNodeDetails('flow-pr')">
            <rect x="250" y="50" width="100" height="80" rx="6" fill="var(--bg-card)" stroke="var(--border-color)" />
            <text x="300" y="85" fill="var(--text-primary)" font-size="11" font-weight="bold" text-anchor="middle">3. Hap PR</text>
            <text x="300" y="105" fill="var(--text-secondary)" font-size="9" text-anchor="middle">Në GitHub</text>
          </g>
          <line x1="350" y1="90" x2="370" y2="90" stroke="var(--text-secondary)" stroke-width="2" marker-end="url(#arrow-blue)" />

          <!-- Step 4: CI -->
          <g class="svg-interactive-node" onclick="showNodeDetails('flow-ci')">
            <rect x="370" y="50" width="100" height="80" rx="6" fill="#1a73e8" />
            <text x="420" y="85" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">4. GHA CI</text>
            <text x="420" y="105" fill="rgba(255,255,255,0.8)" font-size="9" text-anchor="middle">Fmt, Plan</text>
          </g>
          <line x1="470" y1="90" x2="490" y2="90" stroke="var(--text-secondary)" stroke-width="2" marker-end="url(#arrow-blue)" />

          <!-- Step 5: Review -->
          <g class="svg-interactive-node" onclick="showNodeDetails('flow-review')">
            <rect x="490" y="50" width="100" height="80" rx="6" fill="var(--bg-card)" stroke="var(--border-color)" />
            <text x="540" y="85" fill="var(--text-primary)" font-size="11" font-weight="bold" text-anchor="middle">5. Review</text>
            <text x="540" y="105" fill="var(--text-secondary)" font-size="9" text-anchor="middle">Nga Ekipi</text>
          </g>
          <line x1="590" y1="90" x2="610" y2="90" stroke="var(--text-secondary)" stroke-width="2" marker-end="url(#arrow-blue)" />

          <!-- Step 6: Approval -->
          <g class="svg-interactive-node" onclick="showNodeDetails('flow-approval')">
            <rect x="610" y="50" width="110" height="80" rx="6" fill="#7b42bc" />
            <text x="665" y="85" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">6. Approval</text>
            <text x="665" y="105" fill="rgba(255,255,255,0.8)" font-size="9" text-anchor="middle">Merge në main</text>
          </g>
          <line x1="720" y1="90" x2="740" y2="90" stroke="var(--text-secondary)" stroke-width="2" marker-end="url(#arrow-blue)" />

          <!-- Step 7: Apply -->
          <g class="svg-interactive-node" onclick="showNodeDetails('flow-apply')">
            <rect x="740" y="50" width="100" height="80" rx="6" fill="#1e8e3e" />
            <text x="790" y="85" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">7. Deploy</text>
            <text x="790" y="105" fill="rgba(255,255,255,0.8)" font-size="9" text-anchor="middle">GCP Apply</text>
          </g>
          
          <defs>
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M0,1 L10,5 L0,9 z" fill="#1a73e8" />
            </marker>
          </defs>
        </svg>
        <div class="diagram-caption">Cikli i plotë i zhvillimit dhe provizionimit të kodit (GitOps).</div>
      </div>

      <h2 class="sub-title" id="sec6_2">6.2 Shpjegimi i Detajuar i Hapeve</h2>
      <ol>
        <li><strong>Inxhinieri ndryshon skedarët lokalisht:</strong> Bën ndryshime të vogla dhe ekzekuton formatimin me <code>terraform fmt</code>.</li>
        <li><strong>Krijon degë të re (git push):</strong> Pushon degën e re në repozitorin e GitHub.</li>
        <li><strong>Hapet Pull Request (PR):</strong> Dërgon kërkesën për bashkimin e kodit në degën kryesore <code>main</code>.</li>
        <li><strong>GitHub Actions CI:</strong> Krijon automatikisht planin dhe e vendos si koment te PR për t'u parë nga ekipi.</li>
        <li><strong>Code Review:</strong> Anëtarët e tjerë të ekipit shqyrtojnë kodin dhe rezultatin e <code>terraform plan</code>.</li>
        <li><strong>Merge dhe Approval:</strong> Pasi kodi miratohet, ai bashkohet në degën <code>main</code>.</li>
        <li><strong>Deploy automatik:</strong> Bashkimi i kodit në main nxit ekzekutimin automatik të <code>terraform apply</code> në GCP.</li>
      </ol>
    `
  },
  {
    id: "ch7",
    title: "7. HCP Terraform",
    html: `
      <h1 class="section-title"><span class="menu-chapter-num">7</span> HCP Terraform - HashiCorp Cloud Platform</h1>
      <p>HCP Terraform (i njohur më parë si Terraform Cloud) është një platformë SaaS që lehtëson menaxhimin e shteteve (state) të Terraform, ekzekutimin e sigurt dhe bashkëpunimin në ekip.</p>

      <h2 class="sub-title" id="sec7_1">7.1 Pse të përdorim HCP Terraform?</h2>
      <ul>
        <li><strong>Remote Execution:</strong> Planet dhe aplikimet ekzekutohen në mjedise të kontrolluara nga HashiCorp, jo në makina lokale të inxhinierëve.</li>
        <li><strong>State Storage i Sigurt:</strong> Ruajtja e state skedarit është plotësisht e kriptuar me enkriptim AES-256 dhe versionim automatik.</li>
        <li><strong>Drift Detection:</strong> Platforma kontrollon rregullisht nëse dikush ka bërë ndryshime manuale në GCP jashtë Terraform dhe dërgon njoftime.</li>
      </ul>

      <h2 class="sub-title" id="sec7_2">7.2 Konfigurimi i Mjediseve (Workspaces)</h2>
      <p>Në HCP Terraform, mjediset organizohen në Workspaces të ndara për të garantuar izolim të plotë:</p>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Workspace</th>
              <th>Dega Git (Branch)</th>
              <th>Mënyra e Aplikimit (Auto-Apply)</th>
              <th>Kush duhet të aprovojë?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>gcp-network-dev</code></td>
              <td><code>feature/*</code> ose <code>dev</code></td>
              <td>Aktiv (automatike pas çdo push-i)</td>
              <td>Asnjë (vetëm për zhvillim)</td>
            </tr>
            <tr>
              <td><code>gcp-network-nonprod</code></td>
              <td><code>develop</code></td>
              <td>Aktiv (pas merge në develop)</td>
              <td>Ekipi i inxhinierëve (review standard)</td>
            </tr>
            <tr>
              <td><code>gcp-network-prod</code></td>
              <td><code>main</code></td>
              <td><strong>Jo aktive (Manual Approval)</strong></td>
              <td><strong>Platform/Cloud Team leads (2 aprovime)</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    `
  },
  {
    id: "ch8",
    title: "8. GitHub -> HCP -> GCP Setup",
    html: `
      <h1 class="section-title"><span class="menu-chapter-num">8</span> GitHub → HCP Terraform → GCP Setup i Plotë</h1>
      <p>Ky kapitull shpjegon procesin hap-pas-hapi të lidhjes dhe konfigurimit të mjediseve tona.</p>

      <h2 class="sub-title" id="sec8_1">Pesë Hapat e Integrimit</h2>
      <ol>
        <li><strong>Krijimi i Repozitorit në GitHub:</strong> Krijoni një repo private dhe inicializoni atë me strukturën e duhur të dosjeve:
          <pre><code>├── environments/
│   ├── prod/
│   │   ├── main.tf
│   │   └── variables.tf
│   └── nonprod/
└── modules/</code></pre>
        </li>
        <li><strong>Krijimi i Service Account (SA) në GCP:</strong>
          Krijoni një Service Account me rolet minimale të nevojshme (roles/compute.networkAdmin dhe roles/compute.securityAdmin) dhe shkarkoni çelësin JSON.
        </li>
        <li><strong>Krijimi i Workspace në HCP:</strong>
          Krijoni një workspace të ri në HCP Terraform të lidhur me degën <code>main</code> të repozitorit tuaj të GitHub.
        </li>
        <li><strong>Konfigurimi i Variablave në HCP:</strong>
          Shtoni variablat në HCP. Variabla sensitive <code>GOOGLE_CREDENTIALS</code> duhet të ketë përmbajtjen e plotë të skedarit JSON të Service Account dhe të markohet si <strong>Sensitive</strong>.
        </li>
        <li><strong>Provimi i Deploy-it të Parë:</strong>
          Bëni një ndryshim të vogël (p.sh. shto përshkrim te VPC) dhe dërgoni ndryshimin në GitHub. HCP do të aktivizojë automatikisht një run të ri.
        </li>
      </ol>
    `
  },
  {
    id: "ch9",
    title: "9. GitHub Actions - CI/CD nga Fillimi",
    html: `
      <h1 class="section-title"><span class="menu-chapter-num">9</span> GitHub Actions - CI/CD nga Fillimi</h1>
      <p>Në këtë kapitull do të shkruajmë workflow-in e plotë për GitHub Actions që kontrollon kodin tonë Terraform dhe ekzekuton planin.</p>

      <h2 class="sub-title" id="sec9_1">Konceptet Kryesore</h2>
      <ul>
        <li><strong>Workflow:</strong> Skedari YAML në dosjen <code>.github/workflows/</code> që përshkruan procesin.</li>
        <li><strong>Trigger (on:):</strong> Ngjarjet që fillojnë ekzekutimin (p.sh. push apo pull_request).</li>
        <li><strong>Runner:</strong> Makina virtuale (p.sh. Ubuntu) ku ekzekutohen komandat.</li>
      </ul>

      <h2 class="sub-title" id="sec9_2">Skedari terraform.yml</h2>
      <div class="code-container">
        <div class="code-header">
          <div class="code-title">.github/workflows/terraform.yml</div>
          <span class="code-lang-badge">YAML</span>
          <button class="btn-copy" onclick="copyToClipboard(document.getElementById('code-gha-yaml').textContent, this)">Kopjo</button>
        </div>
        <pre><code id="code-gha-yaml">name: "Terraform CI/CD"

on:
  push:
    branches: ["main", "develop"]
    paths: ["environments/**", "modules/**"]
  pull_request:
    branches: ["main", "develop"]

env:
  TF_VERSION: "1.7.0"
  TF_WORKING_DIR: "environments/prod"

permissions:
  contents: read
  pull-requests: write
  id-token: write <span class="code-comment"># Nevojitet per autentikimin me OIDC</span>

jobs:
  terraform-plan:
    name: "Terraform Plan"
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: \${{ env.TF_WORKING_DIR }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Terraform
        uses: actions/setup-terraform@v3
        with:
          terraform_version: \${{ env.TF_VERSION }}
          cli_config_credentials_token: \${{ secrets.TF_API_TOKEN }}

      - name: Terraform Init
        run: terraform init

      - name: Format Check
        run: terraform fmt -check -recursive

      - name: Terraform Validate
        run: terraform validate

      - name: Terraform Plan
        id: plan
        run: terraform plan -no-color -out=tfplan
        continue-on-error: true

      - name: Post Plan to PR
        uses: actions/github-script@v7
        if: github.event_name == 'pull_request'
        with:
          script: |
            const output = \`#### Terraform Plan Status: \${{ steps.plan.outcome }}
            <details><summary>Trego detajet e planit</summary>
            
            \\\`\\\`\\\`
            \${{ steps.plan.outputs.stdout }}
            \\\`\\\`\\\`
            
            </details>\`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            })</code></pre>
      </div>

      <div class="callout callout-danger">
        <div class="callout-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Mbrojtja e Sekreteve (Security):
        </div>
        <div class="callout-content">
          Gjithmonë përdorni <strong>OIDC (Workload Identity Federation)</strong> për lidhjen mes GitHub Actions dhe GCP në vend të çelësave JSON të Service Account. OIDC lejon marrjen e tokenave të përkohshëm dhe shmang ekspozimin e kredencialeve statike në GitHub Secrets.
        </div>
      </div>
    `
  },
  {
    id: "ch10",
    title: "10. Approval Workflow Enterprise",
    html: `
      <h1 class="section-title"><span class="menu-chapter-num">10</span> Approval Workflow Enterprise</h1>
      <p>Në mjediset e sigurta Enterprise, kodi i cili bëhet merge në degën kryesore <code>main</code> nuk duhet të aplikohet menjëherë pa një kontroll final nga administratorët e rrjetave dhe sigurisë.</p>

      <h2 class="sub-title" id="sec10_1">Konfigurimi i GitHub Environments</h2>
      <p>Për të bllokuar ekzekutimi automatik të hapit <code>terraform apply</code>, ne përdorim <strong>GitHub Environments</strong>:</p>
      
      <div class="callout callout-info">
        <div class="callout-title">Hapat e konfigurimit në GitHub UI:</div>
        <div class="callout-content">
          <ol>
            <li>Shkoni te <strong>Settings</strong> -> <strong>Environments</strong> -> Klikoni <strong>New Environment</strong> me emrin <code>production</code>.</li>
            <li>Aktivizoni opsionin <strong>Required Reviewers</strong> dhe shtoni ekipin apo personat përgjegjës (p.sh. <code>@cloud-admin-team</code>).</li>
            <li>Kufizoni degët që lejohen të bëjnë deploy në këtë mjedis vetëm në degën <code>main</code> (Deployment Branches).</li>
            <li>Aktivizoni opsionin <strong>Prevent Self-Review</strong> në mënyrë që personi që ka hapur Pull Request të mos mund ta aprovojë atë vetë.</li>
          </ol>
        </div>
      </div>
    `
  },
  {
    id: "ch11",
    title: "11. Branch Protection & CODEOWNERS",
    html: `
      <h1 class="section-title"><span class="menu-chapter-num">11</span> Branch Protection & CODEOWNERS</h1>
      <p>Për të mbrojtur degën kryesore nga ndryshimet e paautorizuara, ne vendosim rregullat e mbrojtjes (Branch Protection Rules) dhe përcaktojmë pronësinë e kodit (CODEOWNERS).</p>

      <h2 class="sub-title" id="sec11_1">Shtatë Rregullat e Mbrojtjes për 'main'</h2>
      <ul>
        <li><strong>Require a pull request before merging:</strong> Ndalon ndryshimet direkt në degën kryesore.</li>
        <li><strong>Require approvals:</strong> Kërkon miratimin e të paktën dy inxhinierëve përpara bashkimit të kodit.</li>
        <li><strong>Require status checks to pass:</strong> Çdo PR duhet të kalojë me sukses testet automatike (sintaksën dhe planin) përpara bashkimit.</li>
        <li><strong>Require signed commits:</strong> Çdo commit duhet të jetë i nënshkruar me çelës GPG për të vërtetuar autorin.</li>
      </ul>

      <h2 class="sub-title" id="sec11_2">Skedari CODEOWNERS</h2>
      <p>Ky skedari përcakton se kush është pronari i caktuar për dosje apo skedarë të ndryshëm të kodit tonë:</p>

      <div class="code-container">
        <div class="code-header">
          <div class="code-title">.github/CODEOWNERS</div>
          <span class="code-lang-badge">Codeowners</span>
          <button class="btn-copy" onclick="copyToClipboard(document.getElementById('code-codeowners').textContent, this)">Kopjo</button>
        </div>
        <pre><code id="code-codeowners"><span class="code-comment"># Default - ekipet kryesore per cdo ndryshim ne repo</span>
* @cloud-platform-team

<span class="code-comment"># Ndryshimet ne dosjen e rrjetit kerkojne miratimin e Network Engineering</span>
environments/prod/networking/ @network-team @cloud-admin
modules/vpc/ @network-team

<span class="code-comment"># Ndryshimet e sigurise kerkojne miratimin e ekipit te SecOps</span>
modules/firewall/ @security-team
.github/workflows/ @devops-lead @cloud-platform-team</code></pre>
      </div>
    `
  },
  {
    id: "ch12",
    title: "12. CI/CD Arkitektura Enterprise",
    html: `
      <h1 class="section-title"><span class="menu-chapter-num">12</span> CI/CD Arkitektura Enterprise</h1>
      <p>Në mjediset e mëdha organizative, ne përdorim mjedise të ndara për të garantuar sigurinë e sistemit. Ky kapitull shpjegon arkitekturën e plotë të organizimit të mjediseve tona.</p>

      <h2 class="sub-title" id="sec12_1">Struktura e Repozitorëve</h2>
      <p>Nuk rekomandohet ruajtja e të gjithë infrastrukturës në një repozitor të vetëm. Në vend të kësaj, ne i ndajmë ato sipas fushave të përgjegjësisë:</p>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Repozitori</th>
              <th>Përmbajtja</th>
              <th>Ekipi Përgjegjës</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>terraform-gcp-networking</code></td>
              <td>VPC, subnets, firewall rules, NAT, dhe BGP.</td>
              <td>Network Engineering</td>
            </tr>
            <tr>
              <td><code>terraform-gcp-vpn</code></td>
              <td>Lidhjet VPN dhe sesionet e sigurta.</td>
              <td>Network + Security</td>
            </tr>
            <tr>
              <td><code>terraform-gcp-security</code></td>
              <td>Rolet IAM, politikat e organizatës, çelësat KMS.</td>
              <td>Security Team</td>
            </tr>
            <tr>
              <td><code>terraform-gcp-modules</code></td>
              <td>Modulet e gatshme për përdorim nga ekipet.</td>
              <td>Terraform Admins</td>
            </tr>
          </tbody>
        </table>
      </div>
    `
  },
  {
    id: "ch13",
    title: "13. Terraform Enterprise - Skenar Real",
    html: `
      <h1 class="section-title"><span class="menu-chapter-num">13</span> Terraform Enterprise Workflow - Skenar Real</h1>
      <p>Ky kapitull ilustron se si zgjidhet një kërkesë reale për ndryshimin e infrastrukturës në mjedise Enterprise hap pas hapi përgjatë 2 ditëve pune.</p>

      <h2 class="sub-title" id="sec13_1">Skenari: Ndryshimi i BGP Community në HA VPN</h2>
      <p><strong>Detyra:</strong> Klienti kërkon të ndryshojë vlerën e BGP Community në Cloud Router për të optimizuar trafikun midis dy lokacioneve.</p>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Dita / Koha</th>
              <th>Faza</th>
              <th>Veprimi i Kryer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Dita 1 - 09:00</strong></td>
              <td>Planifikimi</td>
              <td>Inxhinieri lexon kërkesën dhe hap një GitHub Issue për ndryshimin.</td>
            </tr>
            <tr>
              <td><strong>Dita 1 - 11:30</strong></td>
              <td>Zhvillimi Lokal</td>
              <td>Inxhinieri krijon degën <code>feature/bgp-community-update</code> dhe modifikon kodin në <code>router.tf</code>.</td>
            </tr>
            <tr>
              <td><strong>Dita 1 - 14:00</strong></td>
              <td>CI Run</td>
              <td>Bën push kodin. GitHub Actions ekzekuton planin dhe e poston atë si koment në PR.</td>
            </tr>
            <tr>
              <td><strong>Dita 2 - 10:00</strong></td>
              <td>Code Review</td>
              <td>Inxhinieri i rrjetit dhe inxhinieri i sigurisë rishikojnë kodin dhe planin, dhe e aprovojnë atë.</td>
            </tr>
            <tr>
              <td><strong>Dita 2 - 14:30</strong></td>
              <td>Deploy & Approval</td>
              <td>Kodi bëhet merge në main. Pasi administratori klikon "Approve", kodi aplikohet dhe përditësohet në GCP.</td>
            </tr>
          </tbody>
        </table>
      </div>
    `
  },
  {
    id: "ch14",
    title: "14. Laboratore Praktike (10 Labs)",
    html: `
      <h1 class="section-title"><span class="menu-chapter-num">14</span> Laboratore Praktike (10 Labs)</h1>
      <p>Mënyra më e mirë për të zotëruar këto njohuri është përmes punës praktike. Ndiqni dhjetë laboratoret e mëposhtme në mënyrë sekuenciale për të ndërtuar pipeline-in tuaj të parë enterprise:</p>

      <div class="lab-checklist-container">
        <div class="lab-checklist-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          Kontrolli i Laboratoreve
        </div>
        <div class="lab-checklist-item" onclick="toggleLabCheckbox(1)">
          <input type="checkbox" class="lab-cb" data-lab="1" onclick="event.stopPropagation(); toggleLabCheckbox(1)">
          <span><strong>Lab 1:</strong> Krijimi i repozitorit në GitHub me strukturën e duhur të dosjeve.</span>
        </div>
        <div class="lab-checklist-item" onclick="toggleLabCheckbox(2)">
          <input type="checkbox" class="lab-cb" data-lab="2" onclick="event.stopPropagation(); toggleLabCheckbox(2)">
          <span><strong>Lab 2:</strong> Shkrimi i kodit të parë Terraform për krijimin e VPC globale.</span>
        </div>
        <div class="lab-checklist-item" onclick="toggleLabCheckbox(3)">
          <input type="checkbox" class="lab-cb" data-lab="3" onclick="event.stopPropagation(); toggleLabCheckbox(3)">
          <span><strong>Lab 3:</strong> Krijimi dhe konfigurimi i Workspace-it në HCP Terraform.</span>
        </div>
        <div class="lab-checklist-item" onclick="toggleLabCheckbox(4)">
          <input type="checkbox" class="lab-cb" data-lab="4" onclick="event.stopPropagation(); toggleLabCheckbox(4)">
          <span><strong>Lab 4:</strong> Konfigurimi i variablave sensitive të GCP në HCP Terraform.</span>
        </div>
        <div class="lab-checklist-item" onclick="toggleLabCheckbox(5)">
          <input type="checkbox" class="lab-cb" data-lab="5" onclick="event.stopPropagation(); toggleLabCheckbox(5)">
          <span><strong>Lab 5:</strong> Kryerja e deploy-it të parë manual nga HCP Terraform UI.</span>
        </div>
        <div class="lab-checklist-item" onclick="toggleLabCheckbox(6)">
          <input type="checkbox" class="lab-cb" data-lab="6" onclick="event.stopPropagation(); toggleLabCheckbox(6)">
          <span><strong>Lab 6:</strong> Konfigurimi i mjedisit production dhe rregullave të aprovimit në GitHub.</span>
        </div>
        <div class="lab-checklist-item" onclick="toggleLabCheckbox(7)">
          <input type="checkbox" class="lab-cb" data-lab="7" onclick="event.stopPropagation(); toggleLabCheckbox(7)">
          <span><strong>Lab 7:</strong> Mbrojtja e degës main me rregullat e Branch Protection në GitHub.</span>
        </div>
        <div class="lab-checklist-item" onclick="toggleLabCheckbox(8)">
          <input type="checkbox" class="lab-cb" data-lab="8" onclick="event.stopPropagation(); toggleLabCheckbox(8)">
          <span><strong>Lab 8:</strong> Shkrimi i pipeline-it automatik CI/CD me GitHub Actions.</span>
        </div>
        <div class="lab-checklist-item" onclick="toggleLabCheckbox(9)">
          <input type="checkbox" class="lab-cb" data-lab="9" onclick="event.stopPropagation(); toggleLabCheckbox(9)">
          <span><strong>Lab 9:</strong> Provizionimi i një lidhjeje HA VPN mes dy lokacioneve përmes kodit.</span>
        </div>
        <div class="lab-checklist-item" onclick="toggleLabCheckbox(10)">
          <input type="checkbox" class="lab-cb" data-lab="10" onclick="event.stopPropagation(); toggleLabCheckbox(10)">
          <span><strong>Lab 10:</strong> Kryerja e një skenari Rollback pas një konfigurimi të dështuar.</span>
        </div>
      </div>
    `
  },
  {
    id: "ch15",
    title: "15. Siguria - Secrets, IAM, State",
    html: `
      <h1 class="section-title"><span class="menu-chapter-num">15</span> Siguria - Secrets, IAM, State, Audit</h1>
      <p>Siguria duhet të jetë e integruar në çdo hap të procesit të zhvillimit të infrastrukturës (DevSecOps).</p>

      <h2 class="sub-title" id="sec15_1">Menaxhimi i Secrets</h2>
      <p>Rregulli kryesor është që asnjë e dhënë sekrete (si çelësat API, fjalëkalimet, apo çelësat e enkriptimit) të mos shkruhet direkt në kod. Terraform ofron variablat me parametrin <code>sensitive = true</code> për të parandaluar shfaqjen e tyre në log-et e konsolës.</p>

      <h2 class="sub-title" id="sec15_2">Service Account - Least Privilege</h2>
      <p>Service Account i përdorur për automatizim duhet të ketë vetëm rolet minimale të nevojshme për punë. Kurrë mos i jepni një Service Account rolin <code>roles/owner</code> ose <code>roles/editor</code> në nivel projekti!</p>

      <div class="code-container">
        <div class="code-header">
          <div class="code-title">Krijimi i Service Account me role minimale</div>
          <span class="code-lang-badge">Bash</span>
          <button class="btn-copy" onclick="copyToClipboard(document.getElementById('code-sa-creation').textContent, this)">Kopjo</button>
        </div>
        <pre><code id="code-sa-creation"><span class="code-comment"># Krijimi i Service Account</span>
gcloud iam service-accounts create terraform-automation \\
    --display-name="Terraform Automation SA" \\
    --project=sb-example-project

<span class="code-comment"># Lidhja e rolit per menaxhimin e rrjetave</span>
gcloud projects add-iam-policy-binding sb-example-project \\
    --member="serviceAccount:terraform-automation@sb-example-project.iam.gserviceaccount.com" \\
    --role="roles/compute.networkAdmin"

<span class="code-comment"># Lidhja e rolit per menaxhimin e rregullave te firewall-it</span>
gcloud projects add-iam-policy-binding sb-example-project \\
    --member="serviceAccount:terraform-automation@sb-example-project.iam.gserviceaccount.com" \\
    --role="roles/compute.securityAdmin"</code></pre>
      </div>
    `
  },
  {
    id: "ch16",
    title: "16. Shembull Enterprise i Plotë",
    html: `
      <h1 class="section-title"><span class="menu-chapter-num">16</span> Shembull Enterprise i Plotë</h1>
      <p>Në këtë kapitull të fundit do të shohim arkitekturën e plotë të rrjetit në mjedise Enterprise të ndërtuar sipas modelit <strong>Hub and Spoke</strong>.</p>

      <h2 class="sub-title" id="sec16_1">Arkitektura Hub and Spoke</h2>
      <p>Ky model ndan shërbimet e përbashkëta (si DNS, siguria, monitorimi) nga mjediset e zhvillimit dhe prodhimit:</p>
      <ul>
        <li><strong>Hub VPC (Shared Services):</strong> Qendra e rrjetit që përmban Cloud Router, Cloud NAT, dhe lidhjen HA VPN me lokacionin lokal.</li>
        <li><strong>Spoke VPCs (Prod, NonProd, Security):</strong> Rrjeta të izoluara për secilin mjedis të cilat lidhen me Hub-in përmes VPC Peering apo VPN.</li>
      </ul>

      <div class="svg-diagram-card">
        <svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg">
          <!-- Hub VPC -->
          <g class="svg-interactive-node" onclick="showNodeDetails('hub-vpc')">
            <rect x="300" y="20" width="200" height="90" rx="8" fill="var(--bg-card)" stroke="var(--color-hashi)" stroke-width="2.5" />
            <text x="400" y="55" fill="var(--text-primary)" font-weight="bold" font-size="12" text-anchor="middle">Hub VPC (Shared Services)</text>
            <text x="400" y="75" fill="var(--text-secondary)" font-size="9" text-anchor="middle">Cloud Router + NAT + VPN</text>
          </g>

          <!-- Peering Lines -->
          <line x1="200" y1="180" x2="350" y2="110" stroke="var(--color-accent)" stroke-width="2" stroke-dasharray="4 4" />
          <line x1="400" y1="180" x2="400" y2="110" stroke="var(--color-accent)" stroke-width="2" stroke-dasharray="4 4" />
          <line x1="600" y1="180" x2="450" y2="110" stroke="var(--color-accent)" stroke-width="2" stroke-dasharray="4 4" />

          <!-- Spoke 1: Prod -->
          <g class="svg-interactive-node" onclick="showNodeDetails('spoke-prod')">
            <rect x="80" y="180" width="180" height="70" rx="6" fill="var(--bg-card)" stroke="var(--color-gcp)" stroke-width="1.5" />
            <text x="170" y="210" fill="var(--text-primary)" font-weight="bold" font-size="11" text-anchor="middle">Prod VPC Spoke</text>
            <text x="170" y="230" fill="var(--text-secondary)" font-size="9" text-anchor="middle">IP: 10.10.0.0/16</text>
          </g>

          <!-- Spoke 2: NonProd -->
          <g class="svg-interactive-node" onclick="showNodeDetails('spoke-nonprod')">
            <rect x="310" y="180" width="180" height="70" rx="6" fill="var(--bg-card)" stroke="var(--color-gcp)" stroke-width="1.5" />
            <text x="400" y="210" fill="var(--text-primary)" font-weight="bold" font-size="11" text-anchor="middle">Non-Prod VPC Spoke</text>
            <text x="400" y="230" fill="var(--text-secondary)" font-size="9" text-anchor="middle">IP: 10.20.0.0/16</text>
          </g>

          <!-- Spoke 3: Security -->
          <g class="svg-interactive-node" onclick="showNodeDetails('spoke-sec')">
            <rect x="540" y="180" width="180" height="70" rx="6" fill="var(--bg-card)" stroke="var(--color-gcp)" stroke-width="1.5" />
            <text x="630" y="210" fill="var(--text-primary)" font-weight="bold" font-size="11" text-anchor="middle">Security VPC Spoke</text>
            <text x="630" y="230" fill="var(--text-secondary)" font-size="9" text-anchor="middle">IP: 10.30.0.0/16</text>
          </g>
        </svg>
        <div class="diagram-caption">Modeli i Rrjetit Hub and Spoke për organizatat enterprise.</div>
      </div>

      <div class="callout callout-success">
        <div class="callout-title">Urime!</div>
        <div class="callout-content">
          Ju keni përfunduar udhëzuesin e plotë për automatizimin enterprise të rrjeteve në GCP. Tani jeni gati për të dizajnuar, ndërtuar dhe audituar mjedise komplekse IaC. Suksese në karrierën tuaj si DevOps dhe Cloud Engineer!
        </div>
      </div>
    `
  }
];

// Node details database for interactive SVGs
const nodeMetadata = {
  // Ch 1
  'manual-ide': { description: "Kjo është faza e parë ku dikush mendon të bëjë një ndryshim, p.sh. të shtojë një IP apo portë të re. Në rrugën manuale kjo mbetet e padokumentuar." },
  'manual-console': { description: "Inxhinieri logohet në Google Cloud Console përmes browser-it dhe kërkon manualisht vegla e rrjetave." },
  'manual-click': { description: "Kërkohen klikime të shumta nëpër dritare për të gjetur konfigurimin e saktë, gjë që merr kohë dhe rrit lodhjen vizuale." },
  'manual-config': { description: "Shkruhen të dhënat (IP, CIDR, emrat). Nëse gabon qoftë edhe një numër të vetëm, mund të shkaktohet incident." },
  'manual-test': { description: "Verifikimi bëhet manualisht duke ping-uar ose testuar lidhjen. Nuk ka asnjë provë historike nëse diçka prishet pas 2 javësh." },
  
  'iac-code': { description: "Inxhinieri shkruan kodin e deklaruar në Terraform dhe e formaton automatikisht me 'terraform fmt'.", properties: [{name: "Format", value: "HCL Skedar (.tf)"}] },
  'iac-git': { description: "Kodi dërgohet në Git me 'git push' në një feature branch të ri.", properties: [{name: "Sistemi", value: "Git + GitHub"}] },
  'iac-actions': { description: "GitHub Actions fillon punën automatikisht dhe ekzekuton planin e Terraform.", properties: [{name: "CI Pipeline", value: "GHA Runner"}] },
  'iac-plan': { description: "Gjenerohet output-i i planit dhe postohet automatikisht si koment në Pull Request për review.", properties: [{name: "Komanda", value: "terraform plan"}] },
  'iac-approval': { description: "Inxhinierët kryesorë rishikojnë ndryshimin në GitHub dhe klikojnë 'Approve' për ta bërë merge në main." },
  'iac-apply': { description: "Pasi kodi bëhet merge në main, sistemi e aplikon atë automatikisht në GCP pa ndërhyrje manuale.", properties: [{name: "Komanda", value: "terraform apply"}] },

  // Ch 2
  'subnet-frankfurt': { description: "Subneti i vendosur në Frankfurt (europe-west3) me IP 10.10.10.0/24. Përdoret për resurset e mjedisit prod.", properties: [{name: "Region", value: "europe-west3"}, {name: "IP Range", value: "10.10.10.0/24"}] },
  'subnet-netherlands': { description: "Subneti i vendosur në Netherlands (europe-west4) me IP 10.20.0.0/24. Ideale për shërbimet e afërta me përdoruesit në Evropën veriore.", properties: [{name: "Region", value: "europe-west4"}, {name: "IP Range", value: "10.20.0.0/24"}] },
  'subnet-oregon': { description: "Subneti në Amerikë (us-west1 - Oregon) me IP 10.30.0.0/24. Tregon shtrirjen globale të VPC-së.", properties: [{name: "Region", value: "us-west1"}, {name: "IP Range", value: "10.30.0.0/24"}] },

  // Ch 16
  'hub-vpc': { description: "Qendra e rrjetit që shërben si pikë qendrore lidhjeje. Këtu ndodhen shërbimet e përbashkëta si NAT Gateways dhe VPN Tunnels.", properties: [{name: "Type", value: "Transit / Hub VPC"}, {name: "Peering Status", value: "Connected to all spokes"}] },
  'spoke-prod': { description: "Rrjeti i dedikuar për mjedisin e prodhimit. Ka qasje të izoluar dhe komunikon me Hub-in vetëm për shërbime kryesore.", properties: [{name: "VPC Name", value: "prod-vpc-spoke"}, {name: "IP Range", value: "10.10.0.0/16"}] },
  'spoke-nonprod': { description: "Mjedisi i integrimit dhe zhvillimit. Izoluar tërësisht nga Prod VPC për të shmangur ndikimet e gabimeve gjatë testimit.", properties: [{name: "VPC Name", value: "nonprod-vpc-spoke"}, {name: "IP Range", value: "10.20.0.0/16"}] },
  'spoke-sec': { description: "VPC e sigurisë ku ekipi i SecOps mund të inspektojë trafikun ose të vendosë mjete kontrolli.", properties: [{name: "VPC Name", value: "security-vpc-spoke"}, {name: "IP Range", value: "10.30.0.0/16"}] }
};

function showNodeDetails(nodeId) {
  const metadata = nodeMetadata[nodeId];
  if (metadata) {
    openDrawer(nodeId.replace('-', ' ').toUpperCase(), metadata);
  }
}

// Check Quiz Answer
function checkAnswer(quizId, optionIndex, isCorrect) {
  const quiz = document.getElementById(quizId);
  const options = quiz.querySelectorAll('.quiz-option');
  const feedback = quiz.querySelector('.quiz-feedback');

  options.forEach((opt, idx) => {
    opt.classList.remove('correct', 'incorrect');
    if (idx === optionIndex) {
      if (isCorrect) {
        opt.classList.add('correct');
        feedback.innerHTML = `<span style="color: var(--alert-success-text);">✓ E saktë! Përgjigje e shkëlqyer.</span>`;
        // Save quiz score
        if (!userProgress['quiz']) {
          userProgress['quiz'] = {};
        }
        userProgress['quiz'][quizId] = true;
        localStorage.setItem('guide_progress', JSON.stringify(userProgress));
        updateProgressUI();
      } else {
        opt.classList.add('incorrect');
        feedback.innerHTML = `<span style="color: var(--alert-danger-text);">✗ E gabuar. Provo përsëri!</span>`;
      }
    }
  });
  feedback.classList.add('show');
}

// Toggle Lab checkbox
function toggleLabCheckbox(labNum) {
  if (!userProgress['lab']) {
    userProgress['lab'] = {};
  }
  const isChecked = !userProgress['lab'][labNum];
  userProgress['lab'][labNum] = isChecked;
  localStorage.setItem('guide_progress', JSON.stringify(userProgress));
  updateProgressUI();
}

// Search Engine
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  renderSidebar(query);
});

// Sidebar Rendering
function renderSidebar(filterQuery = '') {
  const sidebarMenu = document.getElementById('sidebar-menu');
  sidebarMenu.innerHTML = '';

  // Add Welcome item
  const welcomeTitle = document.createElement('div');
  welcomeTitle.className = `menu-chapter-title ${activeChapter === 'welcome' ? 'active' : ''}`;
  welcomeTitle.innerHTML = `
    <span class="menu-chapter-num">★</span>
    <span class="menu-chapter-text">Mirëseerdhët</span>
  `;
  welcomeTitle.addEventListener('click', () => {
    navigateTo('welcome');
  });
  sidebarMenu.appendChild(welcomeTitle);

  // Add other chapters
  chapters.forEach(ch => {
    if (ch.id === 'welcome') return;
    
    const isMatched = ch.title.toLowerCase().includes(filterQuery) || 
                      ch.html.toLowerCase().includes(filterQuery);

    if (filterQuery && !isMatched) return;

    const chapTitle = document.createElement('div');
    chapTitle.className = `menu-chapter-title ${activeChapter === ch.id ? 'active' : ''}`;
    // keep menu open if we search
    if (filterQuery) {
      chapTitle.classList.add('open');
    }
    
    const matchNum = ch.title.match(/^(\\d+)\\.\\s*(.*)/);
    const num = matchNum ? matchNum[1] : '';
    const text = matchNum ? matchNum[2] : ch.title;

    chapTitle.innerHTML = `
      <span class="menu-chapter-num">${num}</span>
      <span class="menu-chapter-text">${text}</span>
      <span class="menu-chapter-arrow">▸</span>
    `;

    // Toggle expand collapse
    chapTitle.addEventListener('click', (e) => {
      // If clicking exactly the arrow or toggling collapse
      chapTitle.classList.toggle('open');
      navigateTo(ch.id);
    });

    sidebarMenu.appendChild(chapTitle);

    // Build sub-list (for sections)
    const subList = document.createElement('div');
    subList.className = 'menu-sub-list';
    
    // Parse h2 items inside the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = ch.html;
    const headings = tempDiv.querySelectorAll('h2');
    
    if (headings.length > 0) {
      headings.forEach((heading, idx) => {
        const subItem = document.createElement('div');
        subItem.className = 'menu-sub-item';
        
        const subId = heading.id || `sec_${idx}`;
        const subText = heading.textContent;

        subItem.innerHTML = `
          <input type="checkbox" class="menu-sub-checkbox" data-chapter="${ch.id}" data-sub="${subId}" onclick="event.stopPropagation();">
          <span>${subText}</span>
        `;

        subItem.querySelector('input').addEventListener('change', (e) => {
          toggleSubChapterProgress(ch.id, subId, e.target.checked);
        });

        subItem.addEventListener('click', () => {
          navigateTo(ch.id);
          setTimeout(() => {
            const el = document.getElementById(subId);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        });

        subList.appendChild(subItem);
      });
      sidebarMenu.appendChild(subList);
    }
  });

  // Restore checkbox state
  updateProgressUI();
}

// Router & State Management
let activeChapter = "welcome";

function navigateTo(chapterId) {
  activeChapter = chapterId;
  localStorage.setItem('active_chapter', chapterId);
  
  // Close sidebar on mobile after navigating
  if (window.innerWidth <= 1024) {
    sidebar.classList.remove('mobile-open');
  }

  renderActivePage();
  renderSidebar();
}

function renderActivePage() {
  const activeCh = chapters.find(c => c.id === activeChapter);
  const container = document.getElementById('content-inner');
  const headerTitle = document.getElementById('header-chapter-title');

  if (activeCh) {
    container.innerHTML = activeCh.html;
    headerTitle.textContent = activeCh.title;
  } else {
    container.innerHTML = '<h1>Kapitulli nuk u gjet.</h1>';
  }

  // Bind code highlights or layout details if any
  // Scroll to top
  document.getElementById('content-area').scrollTop = 0;
  
  // Initialize progress state inside checkboxes
  updateProgressUI();
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  
  // Load saved chapter or default to welcome
  const savedChapter = localStorage.getItem('active_chapter');
  if (savedChapter && chapters.some(c => c.id === savedChapter)) {
    activeChapter = savedChapter;
  }

  renderActivePage();
  renderSidebar();
  initProgress();
});
