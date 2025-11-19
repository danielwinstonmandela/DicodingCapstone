import { generateCompounds } from '../../data/api';
import { saveDiscoveryRun } from '../../data/idb-helper';

export default class DiscoveryPage {
  #authToken = null;
  #userName = null;

  constructor() {
    this.#authToken = sessionStorage.getItem('authToken');
    this.#userName = sessionStorage.getItem('userName');
    if (!this.#authToken) {
      location.hash = '#/login';
    }
  }

  async render() {
    return `
      <section class="container portal-layout">
        <h1>Chemical Discovery Portal</h1>
        <p class="portal-subtitle">Welcome, ${this.#userName || 'Researcher'}! Define your criteria and let our AI agents discover optimal compounds.</p>

        <div class="portal-grid">
          <aside class="criteria-panel">
            <div class="panel">
              <h3>Define Criteria</h3>
              <form id="criteria-form">
                <div class="field">
                  <label for="bp-range">Boiling Point (°C)</label>
                  <div class="slider-row">
                    <input id="bp-range" class="range" type="range" min="50" max="200" value="100" />
                    <input id="bp-num" class="num" type="text" value="100" placeholder="50-200" />
                  </div>
                </div>

                <div class="field">
                  <label for="vis-range">Viscosity (cP)</label>
                  <div class="slider-row">
                    <input id="vis-range" class="range" type="range" min="10" max="100" value="45" />
                    <input id="vis-num" class="num" type="text" value="45" placeholder="10-100" />
                  </div>
                </div>

                <div class="field">
                  <label for="stability">Target Stability</label>
                  <select id="stability">
                    <option>Low</option>
                    <option>Medium</option>
                    <option selected>High</option>
                  </select>
                </div>

                <div class="field">
                  <label for="solubility">Solubility Requirement</label>
                  <select id="solubility">
                    <option>Water-soluble</option>
                    <option selected>Organic-soluble</option>
                    <option>Both</option>
                  </select>
                </div>

                <div class="field">
                  <button id="generate-btn" class="btn btn-primary large" type="submit">Generate Compounds</button>
                </div>
              </form>
            </div>
          </aside>

          <main class="results-panel">
            <div id="loading-state" class="loading-state" style="display: none;">
              <div class="spinner"></div>
              <p>AI Agents are working...</p>
              <div class="agent-status">
                <div class="agent-step">
                  <span class="step-icon">🧬</span>
                  <span>Generative Agent: Creating candidates...</span>
                </div>
                <div class="agent-step">
                  <span class="step-icon">🔬</span>
                  <span>Predictive Agent: Analyzing properties...</span>
                </div>
                <div class="agent-step">
                  <span class="step-icon">⚖️</span>
                  <span>Evaluation Agent: Ranking results...</span>
                </div>
              </div>
            </div>

            <div id="results-container" class="results-container">
              <div class="empty-state">
                <h3>No Results Yet</h3>
                <p>Define your criteria and click "Generate Compounds" to start discovery.</p>
              </div>
            </div>
          </main>
        </div>
      </section>
    `;
  }

  async afterRender() {
    if (!this.#authToken) return;

    this.#setupFormControls();
    this.#setupFormSubmit();
  }

  #setupFormControls() {
    const bpRange = document.querySelector('#bp-range');
    const bpNum = document.querySelector('#bp-num');
    const visRange = document.querySelector('#vis-range');
    const visNum = document.querySelector('#vis-num');

    // Boiling Point: Sync range to text input
    bpRange.addEventListener('input', () => {
      bpNum.value = bpRange.value;
    });
    
    // Boiling Point: Validate and sync on blur (when user finishes typing)
    bpNum.addEventListener('blur', () => {
      const val = bpNum.value;
      
      if (val === '') {
        bpNum.value = '100'; // Reset to default if empty
        bpRange.value = '100';
        return;
      }
      
      let num = Number(val);
      
      if (isNaN(num)) {
        bpNum.value = '100'; // Reset to default if not a number
        bpRange.value = '100';
        return;
      }
      
      // Clamp the value
      num = Math.max(50, Math.min(200, num));
      
      // Update both inputs to clamped value
      bpNum.value = num;
      bpRange.value = num;
    });

    // Viscosity: Sync range to text input
    visRange.addEventListener('input', () => {
      visNum.value = visRange.value;
    });
    
    // Viscosity: Validate and sync on blur (when user finishes typing)
    visNum.addEventListener('blur', () => {
      const val = visNum.value;
      
      if (val === '') {
        visNum.value = '45'; // Reset to default if empty
        visRange.value = '45';
        return;
      }
      
      let num = Number(val);
      
      if (isNaN(num)) {
        visNum.value = '45'; // Reset to default if not a number
        visRange.value = '45';
        return;
      }
      
      // Clamp the value
      num = Math.max(10, Math.min(100, num));
      
      // Update both inputs to clamped value
      visNum.value = num;
      visRange.value = num;
    });
  }

  #setupFormSubmit() {
    const form = document.querySelector('#criteria-form');
    
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const criteria = {
        boilingPoint: Number(document.querySelector('#bp-num').value),
        viscosity: Number(document.querySelector('#vis-num').value),
        stability: document.querySelector('#stability').value,
        solubility: document.querySelector('#solubility').value,
      };

      await this.#runDiscovery(criteria);
    });
  }

  async #runDiscovery(criteria) {
    const loadingState = document.querySelector('#loading-state');
    const resultsContainer = document.querySelector('#results-container');
    
    // Show loading
    loadingState.style.display = 'block';
    resultsContainer.innerHTML = '';

    try {
      // Call API (simulated)
      const results = await generateCompounds(this.#authToken, criteria);
      
      // Save to IndexedDB
      const runData = {
        timestamp: Date.now(),
        criteria,
        results: results.compounds,
      };
      await saveDiscoveryRun(runData);

      // Hide loading
      loadingState.style.display = 'none';

      // Display results
      this.#displayResults(results.compounds);
    } catch (error) {
      loadingState.style.display = 'none';
      resultsContainer.innerHTML = `
        <div class="error-state">
          <h3>Error</h3>
          <p>Failed to generate compounds. Please try again.</p>
        </div>
      `;
      console.error('Discovery error:', error);
    }
  }

  #displayResults(compounds) {
    const resultsContainer = document.querySelector('#results-container');
    
    resultsContainer.innerHTML = `
      <div class="results-header">
        <h2>Discovery Results</h2>
        <p>Found ${compounds.length} candidate compounds</p>
      </div>
      <div class="compounds-grid">
        ${compounds.map((compound, index) => `
          <div class="compound-card">
            <div class="compound-rank">#${index + 1}</div>
            <div class="compound-structure">
              <div class="molecule-placeholder">${compound.formula}</div>
            </div>
            <h3>${compound.name}</h3>
            <div class="compound-properties">
              <div class="property">
                <span class="property-label">Score:</span>
                <span class="property-value">${compound.score}/100</span>
              </div>
              <div class="property">
                <span class="property-label">Stability:</span>
                <span class="property-value">${compound.stability}</span>
              </div>
              <div class="property">
                <span class="property-label">Solubility:</span>
                <span class="property-value">${compound.solubility}</span>
              </div>
              <div class="property">
                <span class="property-label">Synthesis:</span>
                <span class="property-value">${compound.synthesisComplexity}</span>
              </div>
            </div>
            <div class="compound-justification">
              <strong>AI Justification:</strong>
              <p>${compound.justification}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}
