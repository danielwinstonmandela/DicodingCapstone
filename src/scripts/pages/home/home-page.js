export default class HomePage {
  async render() {
    return `
      <section class="hero container">
        <h1 class="hero-title">Accelerating Chemical Discovery.</h1>
        <p class="hero-sub">Using Agentic AI to automate R&D, reduce costs, and unlock novel materials faster than ever before.</p>
        <div class="hero-cta">
          <a href="#/discovery" class="btn btn-primary">Launch Discovery Portal</a>
        </div>
      </section>

      <section class="impact container">
        <div class="metrics">
          <div class="metric">
            <div class="metric-value">90% Faster</div>
            <div class="metric-sub">Reduce R&D cycles from months to days.</div>
          </div>
          <div class="metric">
            <div class="metric-value">10k+ Candidates</div>
            <div class="metric-sub">Generate and validate thousands of novel compounds automatically.</div>
          </div>
          <div class="metric">
            <div class="metric-value">75% Cost Reduction</div>
            <div class="metric-sub">Lower laboratory and computational screening costs.</div>
          </div>
        </div>
      </section>

      <section class="faq container">
        <h2>Frequently asked questions</h2>
        <div class="accordion">
          <button class="accordion-toggle">How does the AI work?</button>
          <div class="accordion-panel">Our system uses a proprietary Agentic AI core that composes multiple models and heuristics to propose, prioritize, and justify candidate molecules.</div>

          <button class="accordion-toggle">Is this data secure?</button>
          <div class="accordion-panel">All inputs are processed securely and can be configured to stay on-premises for strict security requirements. This prototype simulates secure handling.</div>

          <button class="accordion-toggle">What is the output?</button>
          <div class="accordion-panel">The agent provides a ranked list of compounds with predicted properties, structure thumbnails, and a short justification for every recommendation.</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Accordion functionality
    const accordionToggles = document.querySelectorAll('.accordion-toggle');
    accordionToggles.forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const panel = toggle.nextElementSibling;
        const isOpen = panel.style.maxHeight;
        
        // Close all panels
        document.querySelectorAll('.accordion-panel').forEach((p) => {
          p.style.maxHeight = null;
        });
        
        // Open clicked panel if it was closed
        if (!isOpen) {
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  }
}
