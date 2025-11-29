export default class TutorialPage {
  async render() {
    return `
      <section class="container tutorial-page">
        <h1>How to Use Chemical Discovery Agent</h1>
        
        <p class="tutorial-intro">
          Follow this step-by-step guide to discover new chemical compounds tailored to your specifications.
        </p>

        <div class="tutorial-content">
          <!-- Getting Started Section -->
          <section class="tutorial-section">
            <div class="section-number">1</div>
            <h2>Getting Started: Create Your Account</h2>
            <div class="tutorial-text">
              <p>First, you'll need to create an account to access the discovery portal.</p>
              <ol class="tutorial-steps">
                <li>Click the <strong>Register</strong> button in the top-right corner</li>
                <li>Fill in your email address and password</li>
                <li>Click <strong>Register</strong> to create your account</li>
                <li>You'll be automatically redirected to the login page</li>
                <li>Enter your credentials and click <strong>Login</strong></li>
              </ol>
            </div>
            <div class="tutorial-visual">
              <div class="visual-placeholder">
                <div class="placeholder-icon">👤</div>
                <p>Account Registration & Login</p>
              </div>
            </div>
          </section>

          <!-- Specify Criteria Section -->
          <section class="tutorial-section">
            <div class="section-number">2</div>
            <h2>Specify Your Chemical Criteria</h2>
            <div class="tutorial-text">
              <p>Once logged in, navigate to the Discovery portal and define the quantum chemical properties for your target compound.</p>
              
              <div class="criteria-explanation">
                <h3>Understanding the Quantum Properties:</h3>
                
                <div class="property-card">
                  <h4>🧲 Dipole Moment (μ)</h4>
                  <p><strong>Range:</strong> 0 - 5 Debye (D)</p>
                  <p>Measures the charge separation in a molecule. Higher values indicate molecules with greater polarity. Use this to find polar or non-polar compounds depending on your application.</p>
                </div>

                <div class="property-card">
                  <h4>🔮 Polarizability (α)</h4>
                  <p><strong>Range:</strong> 50 - 90 Ų (cubic angstroms)</p>
                  <p>Indicates how easily an electron cloud can be distorted by an external electric field. Important for UV-Vis absorption, refractive index, and reactivity predictions.</p>
                </div>

                <div class="property-card">
                  <h4>⚡ HOMO-LUMO Gap</h4>
                  <p><strong>Range:</strong> 0 - 10 eV (electron volts)</p>
                  <p>The energy difference between the highest occupied molecular orbital and lowest unoccupied molecular orbital. Smaller gaps indicate more reactive, conductive molecules; larger gaps suggest more stable, insulating materials.</p>
                </div>

                <div class="property-card">
                  <h4>🔥 Heat Capacity at Constant Volume (Cv)</h4>
                  <p><strong>Range:</strong> 20 - 40 J/(mol·K)</p>
                  <p>The amount of energy required to raise the temperature of one mole of the substance by one degree Kelvin at constant volume. Essential for thermal stability and processing requirements.</p>
                </div>

                <div class="property-card">
                  <h4>🧬 Number of Atoms (Optional)</h4>
                  <p><strong>Leave blank</strong> for any molecule size, or specify for targeted molecular weight ranges.</p>
                  <p>Helps narrow down search to simple or complex molecules based on your synthesis capabilities.</p>
                </div>
              </div>

              <ol class="tutorial-steps">
                <li>Navigate to the <strong>Discovery</strong> page after logging in</li>
                <li>Read the criteria instructions to understand what you're looking for</li>
                <li>Enter your desired values for each quantum property:</li>
                <ul style="margin-left: 2rem; margin-top: 0.5rem;">
                  <li>Click on each field to enter a value</li>
                  <li>The field hints show valid ranges</li>
                  <li>You must enter values for μ, α, Gap, and Cv</li>
                  <li>Number of atoms is optional</li>
                </ul>
                <li>Click <strong>Generate Compounds</strong> to start the discovery process</li>
              </ol>
            </div>
          </section>

          <!-- AI Processing Section -->
          <section class="tutorial-section">
            <div class="section-number">3</div>
            <h2>AI Processing & Discovery</h2>
            <div class="tutorial-text">
              <p>Once you submit your criteria, our three AI agents work collaboratively to discover compounds matching your specifications.</p>
              
              <div class="processing-flow">
                <div class="agent-step">
                  <div class="step-icon">🧬</div>
                  <h4>Generation</h4>
                  <p>The Generative Agent creates molecular candidates based on your criteria</p>
                </div>
                <div class="arrow">→</div>
                <div class="agent-step">
                  <div class="step-icon">🔬</div>
                  <h4>Prediction</h4>
                  <p>The Predictive Agent forecasts properties of each candidate</p>
                </div>
                <div class="arrow">→</div>
                <div class="agent-step">
                  <div class="step-icon">⚖️</div>
                  <h4>Evaluation</h4>
                  <p>The Evaluation Agent scores and ranks results</p>
                </div>
              </div>

              <p style="margin-top: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <strong>⏱️ Processing Time:</strong> The AI agents typically complete their analysis in 3-5 seconds. 
                You'll see a spinner and "AI Agents are working..." message during processing.
              </p>

              <p style="margin-top: 1rem;">
                <strong>🔔 Get Notified:</strong> When the discovery completes, you'll receive:
              </p>
              <ul style="margin-top: 0.5rem; margin-left: 1.5rem;">
                <li>A <strong>browser notification</strong> in your system tray</li>
                <li>A <strong>popup message</strong> on your screen</li>
              </ul>
            </div>
          </section>

          <!-- View Results Section -->
          <section class="tutorial-section">
            <div class="section-number">4</div>
            <h2>Review Discovery Results</h2>
            <div class="tutorial-text">
              <p>Once the AI agents complete their analysis, you'll see a list of discovered compounds ranked by their match to your criteria.</p>
              
              <ol class="tutorial-steps">
                <li>Each compound card displays:</li>
                <ul style="margin-left: 2rem; margin-top: 0.5rem;">
                  <li><strong>Compound Name & ID</strong> - Unique identifier for the discovered molecule</li>
                  <li><strong>Quantum Properties</strong> - μ, α, Gap, and Cv values for this specific compound</li>
                  <li><strong>Match Score</strong> - How well this compound matches your criteria (0-100%)</li>
                </ul>
                <li>Compounds are ordered by match score (highest first)</li>
                <li>Review the properties to understand how each compound compares to your specifications</li>
                <li>Use this data to inform your next discovery iteration or for synthesis planning</li>
              </ol>

              <div class="result-example">
                <h3>Example Result Card:</h3>
                <div class="example-card">
                  <div class="example-header">
                    <h4>Compound ID: CDA-2024-001</h4>
                    <span class="example-score">98% Match</span>
                  </div>
                  <div class="example-properties">
                    <p><strong>μ (Dipole Moment):</strong> 2.45 D</p>
                    <p><strong>α (Polarizability):</strong> 75.32 Ų</p>
                    <p><strong>HOMO-LUMO Gap:</strong> 4.85 eV</p>
                    <p><strong>Cv (Heat Capacity):</strong> 31.2 J/(mol·K)</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- History Section -->
          <section class="tutorial-section">
            <div class="section-number">5</div>
            <h2>Track Your Discovery History</h2>
            <div class="tutorial-text">
              <p>All your discovery sessions are automatically saved for future reference and comparison.</p>
              
              <ol class="tutorial-steps">
                <li>Click the <strong>History</strong> link in the navigation</li>
                <li>View all your previous discovery sessions</li>
                <li>Each entry shows:</li>
                <ul style="margin-left: 2rem; margin-top: 0.5rem;">
                  <li>Date and time of the discovery</li>
                  <li>The criteria you specified</li>
                  <li>Number of compounds found</li>
                  <li>Quick preview of the results</li>
                </ul>
                <li>Use history to:</li>
                <ul style="margin-left: 2rem; margin-top: 0.5rem;">
                  <li>Compare results across different criteria</li>
                  <li>Track your research progress</li>
                  <li>Identify patterns in successful discoveries</li>
                  <li>Build a database of your exploration</li>
                </ul>
              </ol>
            </div>
          </section>

          <!-- Tips Section -->
          <section class="tutorial-section tips-section">
            <div class="section-number">💡</div>
            <h2>Pro Tips for Better Results</h2>
            <div class="tips-grid">
              <div class="tip-card">
                <h3>Start Broad, Then Refine</h3>
                <p>Begin with wider property ranges, then narrow down based on promising results. Multiple iterations often lead to better discoveries.</p>
              </div>

              <div class="tip-card">
                <h3>Understand Your Domain</h3>
                <p>The more you understand quantum chemistry, the better you can set criteria that will yield practically useful compounds for your application.</p>
              </div>

              <div class="tip-card">
                <h3>Compare Results</h3>
                <p>Use the History page to compare different discovery runs. You may notice patterns that inform your next search strategy.</p>
              </div>

              <div class="tip-card">
                <h3>Match Scores Matter</h3>
                <p>Compounds with 90%+ match scores are most likely to meet your requirements. Don't overlook mid-range matches (70-85%) as they may offer unique properties.</p>
              </div>

              <div class="tip-card">
                <h3>Consider Synthesis Feasibility</h3>
                <p>While the AI considers feasibility, validate that discovered compounds can actually be synthesized in your laboratory setup.</p>
              </div>

              <div class="tip-card">
                <h3>Keep Detailed Notes</h3>
                <p>Document what worked and what didn't. The history feature automatically tracks your sessions, but personal notes help with decision-making.</p>
              </div>
            </div>
          </section>

          <!-- FAQ Section -->
          <section class="tutorial-section faq-section">
            <h2>Frequently Asked Questions</h2>
            
            <div class="faq-item">
              <h3>Q: How accurate are the predicted compounds?</h3>
              <p>A: The AI agents use advanced machine learning models to generate and predict compound properties. While highly accurate for screening purposes, all compounds should be experimentally validated before synthesis and testing.</p>
            </div>

            <div class="faq-item">
              <h3>Q: Can I modify compounds after discovery?</h3>
              <p>A: Currently, you can use the results as reference points and run new discoveries with adjusted criteria. The system is designed to explore combinatorially rather than edit individual compounds.</p>
            </div>

            <div class="faq-item">
              <h3>Q: What if no compounds match my criteria?</h3>
              <p>A: Try expanding your property ranges slightly. Some combinations of properties may be thermodynamically impossible or extremely rare. Adjust one property at a time to identify constraints.</p>
            </div>

            <div class="faq-item">
              <h3>Q: How are notifications enabled?</h3>
              <p>A: You'll be asked to enable notifications when you first visit the Discovery page. Grant permission to receive browser notifications when your discovery completes. You can change this in your browser settings anytime.</p>
            </div>

            <div class="faq-item">
              <h3>Q: Is my data saved offline?</h3>
              <p>A: Yes! Chemical Discovery Agent is a Progressive Web App (PWA). Your discovery history and account data are stored locally, and the app works offline (though discovery requires internet for the AI agents).</p>
            </div>

            <div class="faq-item">
              <h3>Q: Can I export my results?</h3>
              <p>A: Currently, results are stored in your browser's local database. You can take screenshots of the results or copy compound IDs and properties manually. Export functionality may be added in future updates.</p>
            </div>
          </section>

          <!-- Getting Help Section -->
          <section class="tutorial-section help-section">
            <h2>Need More Help?</h2>
            <p>Check out our other resources:</p>
            <ul class="help-links">
              <li><a href="#/about" class="tutorial-link">Learn more about the technology behind Chemical Discovery Agent</a></li>
              <li><a href="#/discovery" class="tutorial-link">Start discovering compounds now</a></li>
              <li><a href="#/history" class="tutorial-link">View your discovery history</a></li>
            </ul>
          </section>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Smooth scroll behavior for internal links
    document.querySelectorAll('.tutorial-link').forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.href.includes('#/')) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }
}
