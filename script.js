// SPA behavior, form handling, fake API, and history persistence

// Utility: query
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Pages
function showPage(pageId) {
  // hide all pages
  const pages = $$('.page');
  pages.forEach(p => {
    if (p.id === pageId) {
      p.classList.add('active');
      p.style.display = 'block';
      // small reflow to allow transition
      requestAnimationFrame(() => {
        p.style.opacity = '1';
        p.style.transform = 'translateY(0)';
      });
    } else {
      // fade out then hide
      if (p.classList.contains('active')) {
        p.style.opacity = '0';
        p.style.transform = 'translateY(8px)';
        setTimeout(() => {
          p.classList.remove('active');
          p.style.display = 'none';
        }, 300);
      } else {
        p.classList.remove('active');
        p.style.display = 'none';
      }
    }
  });
  // update URL hash (optional)
  history.replaceState(null, '', `#${pageId}`);
}

// --- Form controls sync (range + number) ---
const bpRange = $('#bp-range');
const bpNum = $('#bp-num');
const visRange = $('#vis-range');
const visNum = $('#vis-num');

if (bpRange && bpNum) {
  bpRange.addEventListener('input', () => bpNum.value = bpRange.value);
  bpNum.addEventListener('input', () => {
    let v = Number(bpNum.value) || 50;
    v = Math.max(50, Math.min(200, v));
    bpNum.value = v;
    bpRange.value = v;
  });
}
if (visRange && visNum) {
  visRange.addEventListener('input', () => visNum.value = visRange.value);
  visNum.addEventListener('input', () => {
    let v = Number(visNum.value) || 10;
    v = Math.max(10, Math.min(100, v));
    visNum.value = v;
    visRange.value = v;
  });
}

// History management
const HISTORY_KEY = 'cda_runs_v1';
function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function writeHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}
function addHistoryEntry(entry) {
  const history = readHistory();
  history.unshift(entry); // newest first
  if (history.length > 50) history.splice(50); // keep small
  writeHistory(history);
  renderHistory();
}
function renderHistory() {
  const list = $('#history-list');
  list.innerHTML = '';
  const history = readHistory();
  if (history.length === 0) {
    const li = document.createElement('li');
    li.className = 'muted';
    li.textContent = 'No runs yet.';
    list.appendChild(li);
    return;
  }
  history.forEach((h, idx) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.tabIndex = 0;
    li.dataset.runIndex = idx;
    li.innerHTML = `<strong>Run #${history.length - idx}</strong>
      <small>${h.when} — BP ${h.bp}°C, Visc ${h.vis} cP, Stability: ${h.stability}</small>`;
    li.addEventListener('click', () => {
      // when clicking, reload the results for this run (fake)
      // set form values
      bpRange.value = h.bp; bpNum.value = h.bp;
      visRange.value = h.vis; visNum.value = h.vis;
      $('#stability').value = h.stability;
      // simulate rerun by calling the handler which will also show loader
      fakeApiCallAndRender(h, true);
    });
    list.appendChild(li);
  });
}

// Fake API call (2-3s), generates 2-3 compound objects
function fakeApiCall(criteria) {
  const delay = 1800 + Math.floor(Math.random() * 1200); // ~1.8s - 3s
  return new Promise(resolve => {
    setTimeout(() => {
      // create 2-3 fake compounds
      const count = 2 + Math.floor(Math.random() * 2); // 2 or 3
      const compounds = [];
      for (let i = 0; i < count; i++) {
        const id = Math.floor(Math.random() * 9000) + 100;
        const name = [`Acentra-Compound-${id}`, `Petro-Sol-${id}`, `Novum-${id}`][i % 3];
        const bpVariant = (Number(criteria.bp) + (Math.random() * 8 - 4)).toFixed(1);
        const visVariant = (Number(criteria.vis) + (Math.random() * 6 - 3)).toFixed(1);
        const smiles = `C${i}C(=O)C1=CC=CC=C1`; // fake-ish
        const justification = `Recommended due to alignment with target BP ${criteria.bp}°C and viscosity ${criteria.vis} cP; predicted stability: ${criteria.stability.toLowerCase()}. Structure prioritizes synth accessibility and thermal resilience.`;
        compounds.push({
          name,
          smiles,
          thumbnail: `https://via.placeholder.com/200x200.png?text=Molecule+${encodeURIComponent(name)}`,
          predicted_boiling_point: `${bpVariant} °C`,
          predicted_viscosity: `${visVariant} cP`,
          justification
        });
      }
      resolve(compounds);
    }, delay);
  });
}

// Render results
function renderResults(compounds, criteria) {
  const container = $('#results-container');
  container.innerHTML = '';
  if (!compounds || compounds.length === 0) {
    container.innerHTML = '<p class="muted">No matches found.</p>';
    return;
  }
  compounds.forEach(c => {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    // Create ChatGPT prompt with criteria and alternative generation request
    const chatgptPrompt = `Please analyze this chemical compound and validate the predictions:

Compound: ${c.name}
SMILES: ${c.smiles}

Target Criteria:
- Boiling Point: ${criteria.bp}°C
- Viscosity: ${criteria.vis} cP
- Thermal Stability: ${criteria.stability}

Predicted Properties:
- ${c.predicted_boiling_point}
- ${c.predicted_viscosity}

AI Justification: ${c.justification}

Please:
1. Verify if these predictions are reasonable based on the SMILES structure
2. Provide insights about this compound's properties, potential applications, and safety considerations

**IMPORTANT**: If you determine that this compound does NOT meet the target criteria or the predictions are unrealistic, please generate an ALTERNATIVE compound that would actually meet these specifications. Provide:
- The alternative compound name
- SMILES structure
- Predicted properties (boiling point, viscosity)
- Brief explanation of why this compound is a better match
- Potential applications

Format your response clearly with sections for validation and alternative (if needed).`;
    
    // ChatGPT URL with pre-filled prompt
    const chatgptUrl = `https://chatgpt.com/?q=${encodeURIComponent(chatgptPrompt)}`;
    
    card.innerHTML = `
      <div class="result-thumb">
        <img src="${c.thumbnail}" alt="Molecule ${c.name}" width="120" height="120" loading="lazy" />
      </div>
      <div class="result-body">
        <div class="result-name">${c.name}</div>
        <div class="result-prop">Predicted Boiling Point: ${c.predicted_boiling_point}</div>
        <div class="result-prop">Predicted Viscosity: ${c.predicted_viscosity}</div>
        <div class="result-just">
          ${c.justification}
        </div>
        <div class="result-actions">
          <button class="btn-chatgpt" data-url="${chatgptUrl}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Validate or Get Alternative
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  
  // Add event listeners to ChatGPT buttons
  $$('.btn-chatgpt').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.url;
      window.open(url, '_blank');
    });
  });
}

// Loading UI helper
function showLoader(show = true) {
  const loader = $('#loader');
  const container = $('#results-container');
  if (!loader || !container) return;
  if (show) {
    loader.style.display = 'flex';
    container.style.opacity = '0.4';
    // clear old results
    container.innerHTML = '';
  } else {
    loader.style.display = 'none';
    container.style.opacity = '1';
  }
}

// handle form submit: prevents default, save history, call fakeApiCall
function handleFormSubmit(e) {
  if (e) e.preventDefault();
  const criteria = {
    bp: Number(bpNum.value),
    vis: Number(visNum.value),
    stability: $('#stability').value,
    when: new Date().toLocaleString()
  };
  // Save history
  addHistoryEntry(criteria);

  // Start fake API and show loader
  fakeApiCallAndRender(criteria, false);
}

// Combined helper to show loader, call fake API, render results
async function fakeApiCallAndRender(criteria, fromHistory = false) {
  showLoader(true);
  const resultsContainer = $('#results-container');
  // small placeholder while loading
  resultsContainer.innerHTML = `<p class="muted">Generating recommendations for BP ${criteria.bp}°C, Visc ${criteria.vis} cP — this may take a moment.</p>`;
  const data = await fakeApiCall(criteria);
  showLoader(false);

  // Render with criteria
  renderResults(data, criteria);

  // Optionally scroll the right column into view (UX)
  const right = document.querySelector('.right-column');
  if (right) right.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Initialization: wire events
function init() {
  // Nav links
  $$('.nav-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = btn.dataset.target;
      if (target) showPage(target);
    });
  });

  // Hero CTA
  const heroLaunch = $('#hero-launch');
  if (heroLaunch) heroLaunch.addEventListener('click', () => showPage('portal-page'));
  // top hero nav button
  const topLaunch = document.querySelector('.nav-link.primary');
  if (topLaunch) topLaunch.addEventListener('click', () => showPage('portal-page'));

  // Form submit
  const form = $('#criteria-form');
  if (form) form.addEventListener('submit', handleFormSubmit);

  // Accordion toggles
  $$('.accordion-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const panel = btn.nextElementSibling;
      if (panel) {
        if (btn.classList.contains('active')) {
          panel.style.maxHeight = panel.scrollHeight + 'px';
          panel.style.padding = '12px 16px';
        } else {
          panel.style.maxHeight = '0';
          panel.style.padding = '0 16px';
        }
      }
    });
  });

  // history render
  renderHistory();

  // Pick initial page from hash (if present)
  const initial = location.hash ? location.hash.replace('#','') : 'home-page';
  showPage(initial);
}

// Run init when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}