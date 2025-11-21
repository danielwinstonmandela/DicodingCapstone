import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  // Define protected routes
  #protectedRoutes = ['/discovery', '/history'];
  #authRoutes = ['/login', '/register'];

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  #isUserLoggedIn() {
    return !!sessionStorage.getItem('authToken');
  }

  #applyRouteGuards(requestedRoute) {
    const isLoggedIn = this.#isUserLoggedIn();

    // Check if user is trying to access protected routes without token
    if (this.#protectedRoutes.includes(requestedRoute) && !isLoggedIn) {
      window.location.hash = '#/login';
      return false;
    }

    // Check if logged-in user is trying to access auth routes
    if (this.#authRoutes.includes(requestedRoute) && isLoggedIn) {
      window.location.hash = '#/discovery';
      return false;
    }

    return true;
  }

  async renderPage() {
    const url = getActiveRoute();
    
    // Apply route guards - if guard redirects, exit early
    if (!this.#applyRouteGuards(url)) {
      return;
    }

    const page = routes[url];

    if (!document.startViewTransition) {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      return;
    }

    document.startViewTransition(async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    });
  }
}

export default App;
