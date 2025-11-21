# Chemical Discovery Agent - Project Summary

## 🧬 Overview
A progressive web app powered by Agentic AI for accelerating chemical compound discovery. Researchers define criteria and receive AI-generated compound recommendations with predicted properties and justifications.

## ✨ Key Features
- **Discovery Portal**: Input chemical criteria (boiling point, viscosity, stability, solubility) to generate compound candidates
- **Three AI Agents**: Generative (creates candidates) → Predictive (analyzes properties) → Evaluation (ranks results)
- **Discovery History**: Automatic tracking and persistence of all discovery sessions
- **Authentication**: Secure user registration and login via Dicoding Story API
- **PWA Support**: Installable offline-capable web app with service worker caching
- **Modern UI**: Dark mode interface with glass-morphism effects and smooth animations

## 🏗️ Architecture
- **Frontend**: Vanilla JavaScript (ES6+), Vite build tool, CSS custom properties
- **Routing**: Hash-based SPA with modular page components
- **Storage**: IndexedDB for discovery history, Session storage for auth tokens
- **Pages**: Home, About, Login, Register, Discovery Portal, History

## 📁 Tech Stack
```json
{
  "devDependencies": ["vite@6.2.0", "vite-plugin-pwa@1.1.0"],
  "dependencies": ["idb@8.0.3"]
}
```

## 🚀 Quick Start
```bash
npm install
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Production build
npm run preview    # Preview prod build
```

## 💾 Data Flow
1. User registers/logs in → Session token stored
2. Define chemical criteria via interactive form
3. AI agents generate 5-8 compound candidates (simulated 3s delay)
4. Results display with:
   - Compound name & formula
   - Predicted properties (boiling point, viscosity)
   - Synthesis complexity & stability
   - AI-generated justification
5. Session auto-saved to IndexedDB for history tracking

## 🎯 Use Cases
- **R&D Acceleration**: Reduce discovery cycles from months to days
- **Cost Reduction**: Automate screening of thousands of candidates
- **Property Prediction**: Get instant molecular property estimates
- **Session Tracking**: Review and compare past discoveries

## 🔮 Future Enhancements
- Real ML model integration for compound generation
- 3D molecular visualization (Three.js/RDKit)
- Export results (PDF/CSV)
- Backend API with persistent database
- Collaborative team workspaces
- Integration with chemical databases (PubChem, ChemSpider)

---
**Status**: ✅ Fully functional prototype | **Ready for**: Development & Testing
