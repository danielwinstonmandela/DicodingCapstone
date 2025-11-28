export default class AboutPage {
  async render() {
    return `
      <section class="container about-page">
        <h1>About Chemical Discovery Agent</h1>
        
        <div class="about-content">
          <section class="about-section">
            <h2>Our Mission</h2>
            <p>
              Chemical Discovery Agent is a cutting-edge web application powered by Agentic AI 
              designed to revolutionize chemical compound discovery. We aim to significantly 
              accelerate R&D workflows, shorten discovery cycles, and enhance the efficiency 
              of finding new chemical formulations.
            </p>
          </section>

          <section class="about-section">
            <h2>The Agentic AI Core</h2>
            <p>
              Our system is driven by three autonomous agents working collaboratively:
            </p>
            
            <div class="agents-grid">
              <div class="agent-card">
                <h3>🧬 Generative Agent</h3>
                <p>
                  Generates new molecular candidates or chemical formulas based on 
                  user-specified criteria using advanced AI models.
                </p>
              </div>

              <div class="agent-card">
                <h3>🔬 Predictive Agent</h3>
                <p>
                  Predicts properties and characteristics of each generated compound—
                  including stability, solubility, material performance, and reactivity.
                </p>
              </div>

              <div class="agent-card">
                <h3>⚖️ Evaluation Agent</h3>
                <p>
                  Scores and ranks candidate compounds based on alignment with criteria, 
                  feasibility of synthesis, and performance metrics.
                </p>
              </div>
            </div>
          </section>

          <section class="about-section">
            <h2>What You Get</h2>
            <ul class="feature-list">
              <li>Recommended compounds or molecules tailored to your specifications</li>
              <li>Chemical structure visualizations for easy understanding</li>
              <li>AI-generated explanations and justification of results</li>
              <li>Comprehensive property predictions for each candidate</li>
              <li>Historical tracking of all your discovery sessions</li>
            </ul>
          </section>

          <section class="about-us container">
            <h2>About Us</h2>
            <p class="about-desc">Meet the people behind Chemical Discovery Agent:</p>
            <div class="about-grid">
              <div class="about-card">
                <h3>Joseph Greffen Komala</h3>
                <p>Lead Developer & AI Engineer</p>
              </div>
              <div class="about-card">
                <h3>Joseph Greffen Komala</h3>
                <p>UI/UX Designer</p>
              </div>
              <div class="about-card">
                <h3>Joseph Greffen Komala</h3>
                <p>Backend & API Specialist</p>
              </div>
              <div class="about-card">
                <h3>Joseph Greffen Komala</h3>
                <p>Frontend Developer</p>
              </div>
              <div class="about-card">
                <h3>Joseph Greffen Komala</h3>
                <p>Data Scientist</p>
              </div>
              <div class="about-card">
                <h3>Joseph Greffen Komala</h3>
                <p>Product Manager</p>
              </div>
            </div>
          </section>

          <section class="about-section">
            <h2>Technology Stack</h2>
            <p>
              This prototype is built using modern web technologies including Vite, 
              Progressive Web App capabilities, and IndexedDB for offline storage. 
              The AI agents are designed to be integrated with machine learning models 
              in production environments.
            </p>
          </section>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // No specific interactions needed for this page
  }
}
