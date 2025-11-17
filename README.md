# Chemical Discovery Agent

A web application portal powered by Agentic AI for chemical compound discovery. Through an intuitive web interface, researchers can input desired product criteria and receive AI-generated compound recommendations.

## 🧬 Overview

The Chemical Discovery Agent is designed to significantly accelerate R&D workflows, shorten discovery cycles, and enhance the efficiency of finding new chemical formulations. The system leverages three autonomous AI agents working collaboratively:

### Agentic AI Core

1. **Generative Agent** 🧬
   - Generates new molecular candidates or chemical formulas based on user-specified criteria
   - Uses advanced AI models to create novel compound structures

2. **Predictive Agent** 🔬
   - Predicts properties and characteristics of each generated compound
   - Analyzes stability, solubility, material performance, and reactivity

3. **Evaluation Agent** ⚖️
   - Scores and ranks candidate compounds
   - Evaluates alignment with criteria, feasibility of synthesis, and performance metrics

## ✨ Features

- **Intelligent Discovery Portal**: Define chemical criteria and generate compound candidates
- **Comprehensive Results**: View recommended compounds with:
  - Chemical structure visualizations
  - Predicted properties (stability, solubility, etc.)
  - AI-generated justifications
  - Synthesis complexity assessments
- **Discovery History**: Track and review all your discovery sessions
- **Offline Support**: Progressive Web App with offline capabilities
- **Modern UI**: Sleek dark mode interface with smooth animations
- **Secure Authentication**: User registration and login system

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/danielwinstonmandela/DicodingCapstone.git
cd DicodingCapstone
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
DicodingCapstone/
├── src/
│   ├── index.html              # Main HTML file
│   ├── scripts/
│   │   ├── index.js            # Application entry point
│   │   ├── config.js           # Configuration
│   │   ├── sw.js               # Service Worker
│   │   ├── pages/
│   │   │   ├── app.js          # Main App class
│   │   │   ├── home/           # Home page
│   │   │   ├── about/          # About page
│   │   │   ├── login/          # Login page
│   │   │   ├── register/       # Register page
│   │   │   ├── discovery/      # Discovery portal
│   │   │   └── history/        # History page
│   │   ├── routes/
│   │   │   ├── routes.js       # Route definitions
│   │   │   └── url-parser.js   # URL parser utility
│   │   ├── data/
│   │   │   ├── api.js          # API functions
│   │   │   └── idb-helper.js   # IndexedDB helper
│   │   └── utils/              # Utility functions
│   ├── styles/
│   │   └── styles.css          # Global styles
│   └── public/
│       ├── manifest.webmanifest # PWA manifest
│       ├── icons/              # App icons
│       └── images/             # Images
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Architecture

### Frontend
- **Vite**: Fast build tool and dev server
- **Vanilla JavaScript**: Modern ES6+ JavaScript
- **CSS Custom Properties**: For theming and styling
- **Service Workers**: For offline functionality

### Data Storage
- **IndexedDB**: Local storage for discovery history
- **Session Storage**: Authentication tokens

### API Integration
- Uses Dicoding Story API for authentication
- Mock API for compound generation (ready for real AI integration)

## 🔐 Authentication

The app uses the Dicoding Story API for user authentication:
- Register new accounts
- Login with email and password
- Secure session management

## 💾 Data Persistence

- **Discovery History**: Stored in IndexedDB
- **User Sessions**: Session storage for auth tokens
- **Offline Mode**: Service Worker caches for offline access

## 🎯 Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Define Criteria**: 
   - Set boiling point range
   - Specify viscosity requirements
   - Choose stability level
   - Select solubility requirements
3. **Generate Compounds**: Click "Generate Compounds" to start AI discovery
4. **Review Results**: 
   - View ranked compound candidates
   - Check predicted properties
   - Read AI justifications
5. **Track History**: Access your discovery sessions in the History page

## 🛠️ Development

### Tech Stack
- Vite 6.2.0
- IndexedDB (via idb 8.0.3)
- Vite PWA Plugin 1.1.0

### Code Style
- ES6+ JavaScript
- Modular architecture
- Component-based pages
- Separation of concerns

## 📱 Progressive Web App

The app is installable as a PWA with:
- App manifest for installation
- Service Worker for offline support
- Caching strategies for fast loading
- Mobile-responsive design

## 🌟 Future Enhancements

- Integration with real AI models for compound generation
- 3D molecular structure visualization
- Export results to PDF/CSV
- Collaborative features for research teams
- Advanced filtering and search
- Integration with chemical databases

## 📄 License

This project is part of the Dicoding Capstone project.

## 👥 Contributors

- Daniel Winston Mandela

## 🙏 Acknowledgments

- Dicoding for the learning platform
- The open-source community for amazing tools and libraries

---

**Note**: This is a prototype for demonstration purposes. The AI agents are simulated. For production use, integrate with real machine learning models and chemical informatics systems.
DicodingCapstone
