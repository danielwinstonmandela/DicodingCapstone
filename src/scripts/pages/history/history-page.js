import { getAllDiscoveryRuns, deleteDiscoveryRun } from '../../data/idb-helper';

export default class HistoryPage {
  #authToken = null;
  #runs = [];

  constructor() {
    // Constructor should not perform auth checks
    // Auth is checked in render() method
  }

  async render() {
    // Check authentication when rendering
    this.#authToken = sessionStorage.getItem('authToken');
    if (!this.#authToken) {
      location.hash = '#/login';
      return '';
    }
    return `
      <section class="container history-page">
        <h1>Discovery History</h1>
        <p class="page-subtitle">Review your previous chemical discovery sessions</p>
        
        <div id="history-list" class="history-list"></div>
      </section>
    `;
  }

  async afterRender() {
    if (!this.#authToken) return;

    await this.#loadHistory();
    this.#renderHistory();
  }

  async #loadHistory() {
    try {
      this.#runs = await getAllDiscoveryRuns();
      // Sort by timestamp descending (newest first)
      this.#runs.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }

  #renderHistory() {
    const historyList = document.querySelector('#history-list');
    
    if (this.#runs.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <h3>No Discovery Sessions Yet</h3>
          <p>Your discovery history will appear here.</p>
          <a href="#/discovery" class="btn btn-primary">Start Discovery</a>
        </div>
      `;
      return;
    }

    historyList.innerHTML = this.#runs.map((run, index) => {
      const date = new Date(run.timestamp);
      const resultsCount = run.results ? run.results.length : 0;
      
      return `
        <div class="history-item" data-run-id="${run.id}">
          <div class="history-header">
            <div class="history-info">
              <h3>Discovery Session #${this.#runs.length - index}</h3>
              <p class="history-date">${date.toLocaleString()}</p>
            </div>
            <button class="btn-delete" data-run-id="${run.id}">
              <span>🗑️</span>
            </button>
          </div>
          
          <div class="history-criteria">
            <h4>Criteria:</h4>
            <div class="criteria-grid">
              <div class="criterion">
                <span class="criterion-label">Boiling Point:</span>
                <span class="criterion-value">${run.criteria.boilingPoint}°C</span>
              </div>
              <div class="criterion">
                <span class="criterion-label">Viscosity:</span>
                <span class="criterion-value">${run.criteria.viscosity} cP</span>
              </div>
              <div class="criterion">
                <span class="criterion-label">Stability:</span>
                <span class="criterion-value">${run.criteria.stability}</span>
              </div>
              <div class="criterion">
                <span class="criterion-label">Solubility:</span>
                <span class="criterion-value">${run.criteria.solubility}</span>
              </div>
            </div>
          </div>

          <div class="history-results">
            <h4>Results: ${resultsCount} compounds</h4>
            ${run.results && run.results.length > 0 ? `
              <div class="results-preview">
                ${run.results.slice(0, 3).map((compound, idx) => `
                  <div class="result-preview-item">
                    <span class="preview-rank">#${idx + 1}</span>
                    <span class="preview-name">${compound.name}</span>
                    <span class="preview-score">${compound.score}/100</span>
                  </div>
                `).join('')}
                ${resultsCount > 3 ? `<p class="more-results">+${resultsCount - 3} more...</p>` : ''}
              </div>
            ` : '<p>No results available</p>'}
          </div>
        </div>
      `;
    }).join('');

    // Attach delete listeners
    this.#attachDeleteListeners();
  }

  #attachDeleteListeners() {
    const deleteButtons = document.querySelectorAll('.btn-delete');
    
    deleteButtons.forEach(button => {
      button.addEventListener('click', async (event) => {
        event.stopPropagation();
        const runId = Number(button.dataset.runId);
        
        if (confirm('Are you sure you want to delete this discovery session?')) {
          try {
            await deleteDiscoveryRun(runId);
            await this.#loadHistory();
            this.#renderHistory();
          } catch (error) {
            console.error('Failed to delete run:', error);
            alert('Failed to delete session. Please try again.');
          }
        }
      });
    });
  }
}
