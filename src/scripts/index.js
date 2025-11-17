import '../styles/styles.css';

import App from './pages/app';
import { deleteAuthToken } from './data/idb-helper';

/**
 * Setup navigation based on login status
 */
function setupNavigation() {
  const authToken = sessionStorage.getItem('authToken');

  // Get all navigation elements
  const navAuthLinks = document.querySelectorAll('.nav-auth');
  const navUserLinks = document.querySelectorAll('.nav-user');
  const logoutButton = document.querySelector('#logout-button');

  if (authToken) {
    // User is logged in
    navAuthLinks.forEach((link) => (link.style.display = 'none'));
    navUserLinks.forEach((link) => (link.style.display = 'list-item'));

    // Logout handler
    logoutButton?.addEventListener('click', async (event) => {
      event.preventDefault();

      // Clear session storage
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userName');

      // Delete from IndexedDB
      await deleteAuthToken();

      // Redirect to home
      window.location.hash = '#/';
      window.location.reload();
    });
  } else {
    // User is not logged in
    navAuthLinks.forEach((link) => (link.style.display = 'list-item'));
    navUserLinks.forEach((link) => (link.style.display = 'none'));
  }
}

/**
 * Initialize the application
 */
const app = new App({
  drawerButton: document.querySelector('#drawer-button'),
  navigationDrawer: document.querySelector('#navigation-drawer'),
  content: document.querySelector('#main-content'),
});

// Setup navigation
setupNavigation();

// Initial render
window.addEventListener('DOMContentLoaded', async () => {
  await app.renderPage();
});

// Handle hash changes
window.addEventListener('hashchange', async () => {
  await app.renderPage();
});

// Register service worker (if supported)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
