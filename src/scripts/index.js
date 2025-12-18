import '../styles/styles.css';

import App from './pages/app';
import { deleteAuthToken } from './data/idb-helper';
import { requestNotificationPermission } from './data/api';

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

// Request notification permission on app load (non-blocking)
window.addEventListener('load', () => {
  // Attempt to request notification permission
  requestNotificationPermission().catch((error) => {
    console.log('Notification permission request failed:', error);
  });
});

// Initial render
window.addEventListener('DOMContentLoaded', async () => {
  await app.renderPage();
});

// Handle hash changes
window.addEventListener('hashchange', async () => {
  await app.renderPage();
});

// Service worker registration is handled automatically by vite-plugin-pwa
