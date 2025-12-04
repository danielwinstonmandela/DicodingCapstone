import { generateCompounds, requestNotificationPermission } from '../../data/api';
import { saveDiscoveryRun } from '../../data/idb-helper';

export default class DiscoveryPage {
  #authToken = null;
  #userName = null;
  #timerInterval = null;
  #startTime = null;

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
              <h3>Define Quantum Criteria</h3>
              <p class="criteria-instructions">Enter the quantum chemical properties you're looking for. All fields support decimal values.</p>
              
              <form id="criteria-form">
                <div class="field">
                  <label for="mu">Dipole Moment (μ)</label>
                  <span class="field-hint">Range: 0.5 - 5.0 Debye</span>
                  <input 
                    id="mu" 
                    type="number" 
                    value="2.5" 
                    placeholder="Enter dipole moment"
                    step="0.01"
                  />
                </div>

                <div class="field">
                  <label for="alpha">Polarizability (α)</label>
                  <span class="field-hint">Range: 50.0 - 90.0 Ų</span>
                  <input 
                    id="alpha" 
                    type="number" 
                    value="70.0" 
                    placeholder="Enter polarizability"
                    step="0.01"
                  />
                </div>

                <div class="field">
                  <label for="gap">HOMO–LUMO Gap</label>
                  <span class="field-hint">Range: 0.1 - 10.0 eV</span>
                  <input 
                    id="gap" 
                    type="number" 
                    value="5.0" 
                    placeholder="Enter HOMO-LUMO gap"
                    step="0.01"
                  />
                </div>

                <div class="field">
                  <label for="cv">Heat Capacity (Cv)</label>
                  <span class="field-hint">Range: 20.0 - 40.0 cal/mol·K</span>
                  <input 
                    id="cv" 
                    type="number" 
                    value="30.0" 
                    placeholder="Enter heat capacity"
                    step="0.01"
                  />
                </div>

                <div class="field">
                  <label for="num_atoms">Number of Atoms (Optional)</label>
                  <span class="field-hint">Integer only, no limit</span>
                  <input 
                    id="num_atoms" 
                    type="number" 
                    placeholder="Enter number of atoms"
                    step="1"
                  />
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
              <div class="elapsed-row" style="margin-top:8px;">
                <span class="elapsed-label" style="font-weight:600;margin-right:6px;">Elapsed:</span>
                <span id="elapsed-time" class="elapsed-time">00:00</span>
              </div>
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

    // Request notification permission when user accesses discovery page
    try {
      await requestNotificationPermission();
      console.log('Notification permission status:', Notification.permission);
    } catch (error) {
      console.log('Could not request notification permission:', error);
    }

    this.#setupFormControls();
    this.#setupFormSubmit();
  }

  #setupFormControls() {
    // No special controls needed for simple number inputs
    // HTML5 number inputs handle validation natively
  }

  #setupFormSubmit() {
    const form = document.querySelector('#criteria-form');
    
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const numAtomsValue = document.querySelector('#num_atoms').value;
      
      const criteria = {
        mu: parseFloat(document.querySelector('#mu').value),
        alpha: parseFloat(document.querySelector('#alpha').value),
        gap: parseFloat(document.querySelector('#gap').value),
        cv: parseFloat(document.querySelector('#cv').value),
        num_atoms: numAtomsValue ? parseInt(numAtomsValue, 10) : null,
      };

      await this.#runDiscovery(criteria);
    });
  }

  async #runDiscovery(criteria) {
    const loadingState = document.querySelector('#loading-state');
    const resultsContainer = document.querySelector('#results-container');
    
    // Show loading
    loadingState.style.display = 'block';
    this.#startTimer();
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
      // stop timer and record duration
      const duration = this.#stopTimer();
      runData.duration = duration;
      await saveDiscoveryRun(runData);

      // Hide loading
      loadingState.style.display = 'none';

      // Display results (include duration)
      this.#displayResults(results.compounds, duration);
    } catch (error) {
      loadingState.style.display = 'none';
      this.#stopTimer();
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
    
    // second arg may be duration string
    const duration = arguments.length > 1 ? arguments[1] : null;

    resultsContainer.innerHTML = `
      <div class="results-header">
        <h2>Discovery Results</h2>
        <p>Found ${compounds.length} candidate compounds${duration ? ` (took ${duration})` : ''}</p>
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
                <span class="property-label">Dipole Moment (μ):</span>
                <span class="property-value">${compound.mu.toFixed(2)}</span>
              </div>
              <div class="property">
                <span class="property-label">Polarizability (α):</span>
                <span class="property-value">${compound.alpha.toFixed(2)}</span>
              </div>
              <div class="property">
                <span class="property-label">HOMO–LUMO Gap:</span>
                <span class="property-value">${compound.gap.toFixed(2)}</span>
              </div>
              <div class="property">
                <span class="property-label">Heat Capacity (Cv):</span>
                <span class="property-value">${compound.cv.toFixed(2)}</span>
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

  #formatElapsed(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  #startTimer() {
    this.#startTime = Date.now();
    const el = document.querySelector('#elapsed-time');
    if (el) el.textContent = '00:00';
    this.#timerInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - this.#startTime;
      const el2 = document.querySelector('#elapsed-time');
      if (el2) el2.textContent = this.#formatElapsed(elapsed);
    }, 250);
  }

  #stopTimer() {
    if (this.#timerInterval) {
      clearInterval(this.#timerInterval);
      this.#timerInterval = null;
    }
    const elapsedMs = this.#startTime ? Date.now() - this.#startTime : 0;
    this.#startTime = null;
    const el = document.querySelector('#elapsed-time');
    if (el) el.textContent = this.#formatElapsed(elapsedMs);
    return this.#formatElapsed(elapsedMs);
  }
}
