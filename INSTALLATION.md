# Installation Instructions

## Quick Start

Follow these steps to set up and run the Chemical Discovery Agent:

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Vite (build tool)
- vite-plugin-pwa (Progressive Web App support)
- idb (IndexedDB wrapper)

### 2. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

Output will be in the `dist` folder.

### 4. Preview Production Build

```bash
npm run preview
```

## Project Features

✅ **Implemented Features:**
- Modern Vite-based build system
- SPA routing with hash-based navigation
- Component-based page architecture
- Authentication system (using Dicoding Story API)
- Mock AI compound generation
- IndexedDB for local data persistence
- PWA support with service worker
- Responsive dark mode UI
- Discovery history tracking

## File Structure Comparison

The project now matches the storyapp2 architecture:

```
DicodingCapstone/          storyapp2/
├── src/                   ├── src/
│   ├── index.html        │   ├── index.html ✓
│   ├── scripts/          │   ├── scripts/ ✓
│   │   ├── index.js     │   │   ├── index.js ✓
│   │   ├── config.js    │   │   ├── config.js ✓
│   │   ├── sw.js        │   │   ├── sw.js ✓
│   │   ├── pages/       │   │   ├── pages/ ✓
│   │   ├── routes/      │   │   ├── routes/ ✓
│   │   ├── data/        │   │   ├── data/ ✓
│   │   └── utils/       │   │   └── utils/ ✓
│   ├── styles/          │   ├── styles/ ✓
│   └── public/          │   └── public/ ✓
├── package.json ✓       ├── package.json ✓
└── vite.config.js ✓     └── vite.config.js ✓
```

## Testing the Application

### 1. Register a User
- Navigate to the Register page
- Create a new account with name, email, and password
- You'll be redirected to login

### 2. Login
- Use your registered credentials
- Navigate to Discovery Portal or History

### 3. Generate Compounds
- Go to Discovery Portal
- Adjust the criteria sliders:
  - Boiling Point
  - Viscosity
  - Stability
  - Solubility
- Click "Generate Compounds"
- Wait for the AI agents to process (simulated 3-second delay)
- Review the ranked compound results

### 4. View History
- All discovery sessions are automatically saved
- Go to History page to review past sessions
- Delete sessions if needed

## Next Steps for Production

To deploy this as a full production system:

1. **Replace Mock API**: Integrate real AI models for compound generation
2. **Add 3D Visualization**: Use libraries like Three.js or RDKit for molecular structures
3. **Backend API**: Create a proper backend server for:
   - Storing compound data
   - Running AI models
   - User management
4. **Enhanced Features**:
   - Export results (PDF, CSV)
   - Collaborative workspaces
   - Advanced search and filtering
   - Integration with chemical databases (PubChem, ChemSpider)
5. **Performance Optimization**:
   - Code splitting
   - Lazy loading
   - Image optimization
6. **Testing**:
   - Unit tests
   - Integration tests
   - E2E tests

## Troubleshooting

### Port Already in Use
If port 5173 is busy:
```bash
npm run dev -- --port 3000
```

### Build Errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### PWA Not Working
- Ensure you're using HTTPS in production
- Check browser console for service worker errors
- Clear browser cache and reload

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (with webkit prefixes)
- Mobile browsers: Full responsive support

---

Enjoy discovering new chemical compounds with AI! 🧬
